import {readFileSync} from 'fs';
import path from 'path';

export type ImageSize = {width: number; height: number};

const PUBLIC_DIR = path.join(process.cwd(), 'public');

const cache = new Map<string, ImageSize | null>();

export function getLocalImageSize(src: string): ImageSize | null {
    if (cache.has(src)) {
        return cache.get(src) ?? null;
    }

    const size = readSize(src);
    cache.set(src, size);
    return size;
}

function readSize(src: string): ImageSize | null {
    if (!src.startsWith('/')) {
        return null;
    }

    const clean = src.split(/[?#]/)[0];
    const filePath = path.join(PUBLIC_DIR, decodeURIComponent(clean));
    if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
        return null;
    }

    let buffer: Buffer;
    try {
        buffer = readFileSync(filePath);
    } catch {
        return null;
    }

    return parsePng(buffer) ?? parseJpeg(buffer);
}

function parsePng(buffer: Buffer): ImageSize | null {
    // PNG: 8-byte signature, IHDR length (4) and type (4), then width and height.
    if (buffer.length < 24) return null;
    if (buffer.toString('ascii', 1, 4) !== 'PNG') return null;
    if (buffer.toString('ascii', 12, 16) !== 'IHDR') return null;

    return {width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20)};
}

function parseJpeg(buffer: Buffer): ImageSize | null {
    if (buffer.length < 4 || buffer.readUInt16BE(0) !== 0xffd8) return null;

    let offset = 2;
    while (offset + 9 < buffer.length) {
        if (buffer[offset] !== 0xff) {
            offset += 1;
            continue;
        }

        const marker = buffer[offset + 1];
        // SOF0-SOF15 carry the frame size. C4 (DHT), C8 (JPG), CC (DAC) share the range.
        const isStartOfFrame =
            marker >= 0xc0 &&
            marker <= 0xcf &&
            marker !== 0xc4 &&
            marker !== 0xc8 &&
            marker !== 0xcc;

        if (isStartOfFrame) {
            // SOF segment: marker (2), length (2), precision (1), then height and width.
            return {
                height: buffer.readUInt16BE(offset + 5),
                width: buffer.readUInt16BE(offset + 7),
            };
        }

        const segmentLength = buffer.readUInt16BE(offset + 2);
        if (segmentLength < 2) return null;
        offset += 2 + segmentLength;
    }

    return null;
}
