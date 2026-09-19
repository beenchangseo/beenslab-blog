import React from 'react';
import Image from 'next/image';
import ReactMarkdown, {type Components} from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {getLocalImageSize} from '@/lib/imageSize';

type MarkdownRendererProps = {
    markdown: string;
};

const components: Components = {
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
                sizes="(max-width: 768px) 100vw, 768px"
                className="h-auto max-w-full"
            />
        );
    },
};

export function Mdx({markdown}: MarkdownRendererProps) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={components}
        >
            {markdown}
        </ReactMarkdown>
    );
}
