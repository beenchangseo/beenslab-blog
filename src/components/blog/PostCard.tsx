import Image from 'next/image';
import Link from 'next/link';
import {getPostThumbnail} from '@/lib/postImage';
import {GetAllBlogPostResponseDto, GetCategoryResponseDto} from '@/types/blog';

type Props = {
    post: GetAllBlogPostResponseDto;
    categories: GetCategoryResponseDto[];
    // 첫 화면에 보이는 카드만 우선 로딩한다. 나머지는 lazy.
    priority?: boolean;
};

export default function PostCard({post, categories, priority = false}: Props) {
    const categoryKeyword = post.categories[0];
    const categoryTitle = categories.find((c) => c.keyword === categoryKeyword)?.title;

    return (
        <article className="group flex flex-col">
            <Link
                href={`/blog/post/${post.slug}`}
                className="block overflow-hidden rounded-xl border border-line bg-surface-subtle focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500"
            >
                <Image
                    src={getPostThumbnail(post)}
                    alt=""
                    width={1200}
                    height={630}
                    priority={priority}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                    className="aspect-[1200/630] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
            </Link>

            <div className="mt-4 flex flex-col gap-2">
                {categoryTitle && categoryKeyword && (
                    <Link
                        href={`/category/${categoryKeyword}`}
                        className="w-fit text-xs font-semibold text-brand-600 hover:underline"
                    >
                        {categoryTitle}
                    </Link>
                )}

                <h3 className="text-lg font-bold leading-snug">
                    <Link
                        href={`/blog/post/${post.slug}`}
                        className="line-clamp-2 hover:text-brand-600 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                        {post.title}
                    </Link>
                </h3>

                <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">
                    {post.description}
                </p>

                {post.series && (
                    <p className="text-xs text-ink-muted">
                        {post.series.title}
                        {post.series.order != null && ` · ${post.series.order}편`}
                    </p>
                )}
            </div>
        </article>
    );
}
