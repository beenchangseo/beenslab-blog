import {ReactNode} from 'react';

type Props = {
    width?: 'page' | 'reading';
    className?: string;
    children: ReactNode;
};

export default function Container({width = 'page', className = '', children}: Props) {
    const max = width === 'reading' ? 'max-w-reading' : 'max-w-page';
    return <div className={`${max} mx-auto w-full px-5 sm:px-8 ${className}`}>{children}</div>;
}
