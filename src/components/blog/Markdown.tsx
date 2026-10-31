import {ReactNode} from 'react';
import Image from 'next/image';
import ReactMarkdown, {type Components} from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {getLocalImageSize} from '@/lib/imageSize';
import {createHeadingIdFactory} from '@/lib/toc';

type MarkdownProps = {
    markdown: string;
};

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
    const toId = createHeadingIdFactory();

    return {
        img({src, alt}) {
            if (typeof src !== 'string' || src.length === 0) {
                return null;
            }

            const size = getLocalImageSize(src);

            if (!size) {
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

        h1({children}) {
            return (
                <h2 id={toId(toPlainText(children))} className="scroll-mt-24">
                    {children}
                </h2>
            );
        },

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

export function Markdown({markdown}: MarkdownProps) {
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
