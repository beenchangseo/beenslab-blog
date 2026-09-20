import {ReactNode} from 'react';

// Layout은 더 이상 폭을 정하지 않는다. 목록은 카드 그리드가 들어가야 해서
// 넓고, 본문은 한 줄이 길어지면 읽기 힘들어서 좁다. 페이지가 직접 고른다.
type Props = {
    width?: 'page' | 'reading';
    className?: string;
    children: ReactNode;
};

export default function Container({width = 'page', className = '', children}: Props) {
    const max = width === 'reading' ? 'max-w-reading' : 'max-w-page';
    return <div className={`${max} mx-auto w-full px-5 sm:px-8 ${className}`}>{children}</div>;
}
