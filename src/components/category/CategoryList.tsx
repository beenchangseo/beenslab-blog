'use client';

import {Dispatch, SetStateAction} from 'react';
import {GetCategoryResponseDto} from '../../types/blog';

interface CategoryListProps {
    setSelect: Dispatch<SetStateAction<string>>;
    select: string;
    categories: GetCategoryResponseDto[];
}

// border-0.5는 Tailwind에 없는 값이라 CSS가 만들어지지 않았다(= 테두리 없음).
const baseStyle =
    'px-3 py-1 sm:text-lg rounded-2xl border border-gray-700 dark:border-gray-300 transition-transform duration-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#111111]';
const selectedStyle = `${baseStyle} border-2 bg-green-100 dark:bg-green-900`;
const defaultStyle = `${baseStyle} hover:scale-110`;

export default function CategoryList({setSelect, select, categories}: CategoryListProps) {
    return (
        <div className="flex flex-wrap gap-4">
            <button
                type="button"
                onClick={() => setSelect('')}
                aria-pressed={select === ''}
                className={select === '' ? selectedStyle : defaultStyle}
            >
                All
            </button>
            {categories.map((category) => {
                const isSelected = select === category.keyword;
                return (
                    <button
                        type="button"
                        key={category.keyword}
                        onClick={() =>
                            setSelect(category.keyword === 'All' ? '' : category.keyword)
                        }
                        aria-pressed={isSelected}
                        className={isSelected ? selectedStyle : defaultStyle}
                    >
                        {category.title}
                    </button>
                );
            })}
        </div>
    );
}
