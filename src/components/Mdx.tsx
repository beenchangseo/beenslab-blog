import {ReactNode} from 'react';
import Image from 'next/image';
import ReactMarkdown, {type Components} from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {getLocalImageSize} from '@/lib/imageSize';
import {createHeadingIdFactory} from '@/lib/toc';

type MarkdownRendererProps = {
    markdown: string;
};

// 제목 안에는 <code>나 <strong> 같은 요소가 섞일 수 있어서, id를 만들려면
// 먼저 평문으로 펴야 한다.
function toPlainText(node: ReactNode): string {
    if (node == null || typeof node === 'boolean') return '';
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(toPlainText).join('');
    if (typeof node === 'object' && 'props' in node) {
        return toPlainText((node as {props: {children?: ReactNode}}).props.children);
    }
    return '';
}

function buildComponents(): Components {
    // 렌더 한 번당 하나씩 만든다. react-markdown이 문서 순서대로 제목을
    // 호출하므로, 같은 순서로 도는 extractHeadings와 id가 일치한다.
    const toId = createHeadingIdFactory();

    return {
        // 마크다운의 ![](...)은 크기 정보가 없어 그대로 두면 원본을 전부 받고
        // 레이아웃도 밀린다. public/ 아래 파일은 크기를 읽어 next/image로 넘긴다.
        img({src, alt}) {
            if (typeof src !== 'string' || src.length === 0) {
                return null;
            }

            const size = getLocalImageSize(src);

            if (!size) {
                // 외부 이미지 등 크기를 알 수 없는 경우는 lazy 로딩만 적용한다.
                // eslint-disable-next-line @next/next/no-img-element
                return <img src={src} alt={alt ?? ''} loading="lazy" decoding="async" />;
            }

            return (
                <Image
                    src={src}
                    alt={alt ?? ''}
                    width={size.width}
                    height={size.height}
                    sizes="(max-width: 768px) 100vw, 736px"
                    className="h-auto max-w-full"
                />
            );
        },

        // 본문에 h1을 쓴 글이 많은데 페이지 제목이 이미 h1이라 중복이다.
        // 내용을 건드리지 않고 단계만 h2로 내린다.
        h1({children}) {
            return (
                <h2 id={toId(toPlainText(children))} className="scroll-mt-24">
                    {children}
                </h2>
            );
        },

        // 목차에서 건너뛸 수 있도록 id를 붙인다. scroll-mt는 sticky 헤더에
        // 제목이 가리지 않게 하는 여백이다.
        h2({children}) {
            return (
                <h2 id={toId(toPlainText(children))} className="scroll-mt-24">
                    {children}
                </h2>
            );
        },
        h3({children}) {
            return (
                <h3 id={toId(toPlainText(children))} className="scroll-mt-24">
                    {children}
                </h3>
            );
        },
    };
}

export function Mdx({markdown}: MarkdownRendererProps) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={buildComponents()}
        >
            {markdown}
        </ReactMarkdown>
    );
}
