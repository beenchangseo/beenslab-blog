import {readFileSync} from 'fs';
import path from 'path';

export type ImageSize = {width: number; height: number};

const PUBLIC_DIR = path.join(process.cwd(), 'public');

// 마크다운 본문에는 이미지 크기가 없다. next/image는 width/height가 있어야
// 자리를 미리 잡아 레이아웃 시프트를 막으므로, public/ 아래 로컬 파일의
// 헤더를 직접 읽어 크기를 구한다. 의존성을 추가하지 않으려고 PNG/JPEG만
// 직접 파싱하고, 그 외 형식은 null을 반환해 호출 측에서 처리하게 한다.
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
    // 로컬 절대 경로(/images/...)만 대상으로 한다. 외부 URL은 크기를 알 수 없다.
    if (!src.startsWith('/')) {
        return null;
    }

    // 쿼리스트링과 해시를 떼고, public/ 밖으로 나가는 경로는 거부한다.
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
    // 시그니처(8B) + IHDR 청크 길이(4B) + 타입(4B) 다음이 width, height.
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
        // SOF0~SOF15에 크기가 들어있다. DHT(C4)/JPG(C8)/DAC(CC)는 제외.
        const isStartOfFrame =
            marker >= 0xc0 &&
            marker <= 0xcf &&
            marker !== 0xc4 &&
            marker !== 0xc8 &&
            marker !== 0xcc;

        if (isStartOfFrame) {
            // 마커(2B) + 세그먼트 길이(2B) + 정밀도(1B) 다음이 height, width.
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
