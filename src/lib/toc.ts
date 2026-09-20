export type Heading = {
    id: string;
    text: string;
    level: 2 | 3;
};

// 목차와 본문 제목이 같은 id를 써야 링크가 맞는다. 두 곳 모두 이 공장에서
// 만든 함수를 쓰고, 같은 순서로 호출하므로 결과가 일치한다.
// 같은 제목이 여러 번 나오면 -1, -2를 붙인다.
export function createHeadingIdFactory() {
    const seen = new Map<string, number>();

    return function toId(text: string): string {
        const base =
            text
                .trim()
                .toLowerCase()
                // 한글은 그대로 둔다. #느려진-쿼리 같은 앵커가 로마자보다 읽기 좋다.
                .replace(/[^\p{L}\p{N}\s-]/gu, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '') || 'section';

        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        return count === 0 ? base : `${base}-${count}`;
    };
}

// 마크다운 원문에서 제목을 뽑는다. 본문 h1은 렌더링에서 h2로 내려가므로
// 여기서도 level 2로 잡는다. 코드 블록 안의 # 주석을 제목으로 오인하지
// 않도록 펜스를 추적한다.
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

        // 제목 안의 마크다운 표기(**굵게**, `코드`, [링크](url))를 걷어낸다.
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
