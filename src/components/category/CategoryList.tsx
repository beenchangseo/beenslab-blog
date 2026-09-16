'use client';

import {Dispatch, SetStateAction} from 'react';
import {GetCategoryResponseDto} from '../../types/blog';

interface CategoryListProps {
    setSelect: Dispatch<SetStateAction<string>>;
    select: string;
    categories: GetCategoryResponseDto[];
}

const selectedStyle =
    'px-3 py-1 bg-green-100 dark:bg-green-900 border-2 border-gray-700 dark:border-gray-300 rounded-2xl sm:text-lg';
const defaultStyle =
    'px-3 py-1 sm:text-lg border-0.5 border-gray-700 dark:border-gray-300 rounded-2xl transition-transform duration-300 hover:scale-110';

export default function CategoryList({setSelect, select, categories}: CategoryListProps) {
    return (
        <div className="flex flex-wrap gap-4">
            <button
                type="button"
                onClick={() => setSelect('')}
                className={select === '' ? selectedStyle : defaultStyle}
            >
                All
            </button>
            {categories.map((category) => {
                if (select === category.keyword)
                    return (
                        <button
                            type="button"
                            onClick={() =>
                                setSelect(category.keyword === 'All' ? '' : category.keyword)
                            }
                            key={category.keyword}
                            className={selectedStyle}
                        >
                            {category.title}
                        </button>
                    );
                return (
                    <button
                        type="button"
                        onClick={() =>
                            setSelect(category.keyword === 'All' ? '' : category.keyword)
                        }
                        key={category.keyword}
                        className={defaultStyle}
                    >
                        {category.title}
                    </button>
                );
            })}
        </div>
    );
}
