export type Heading = {
    id: string;
    text: string;
    level: 2 | 3;
};

export function createHeadingIdFactory() {
    const seen = new Map<string, number>();

    return function toId(text: string): string {
        const base =
            text
                .trim()
                .toLowerCase()
                .replace(/[^\p{L}\p{N}\s-]/gu, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '') || 'section';

        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        return count === 0 ? base : `${base}-${count}`;
    };
}

export function extractHeadings(markdown: string): Heading[] {
    const toId = createHeadingIdFactory();
    const headings: Heading[] = [];
    let inFence = false;

    for (const line of markdown.split('\n')) {
        if (/^\s*(```|~~~)/.test(line)) {
            inFence = !inFence;
            continue;
        }
        if (inFence) continue;

        const match = /^(#{1,3})\s+(.+?)\s*#*\s*$/.exec(line);
        if (!match) continue;

        const text = match[2]
            .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
            .replace(/[*_~`]/g, '')
            .trim();

        if (!text) continue;

        headings.push({
            id: toId(text),
            text,
            level: match[1].length === 3 ? 3 : 2,
        });
    }

    return headings;
}
