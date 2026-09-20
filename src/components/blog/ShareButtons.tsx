'use client';

import {useState} from 'react';

type Props = {
    url: string;
    title: string;
};

const buttonClass =
    'rounded-lg border border-line px-4 py-2 text-sm transition-colors hover:border-brand-500 hover:text-brand-600 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500';

export default function ShareButtons({url, title}: Props) {
    const [copied, setCopied] = useState(false);

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            // 클립보드는 https나 localhost에서만 동작하고 권한도 거절될 수 있다.
            console.error('Failed to copy link:', error);
        }
    }

    const shareText = encodeURIComponent(title);
    const shareUrl = encodeURIComponent(url);

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm text-ink-muted">공유</span>
            <a
                className={buttonClass}
                href={`https://x.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                X
            </a>
            <a
                className={buttonClass}
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                LinkedIn
            </a>
            <button type="button" onClick={copyLink} className={buttonClass}>
                {copied ? '복사됨' : '링크 복사'}
            </button>
        </div>
    );
}
