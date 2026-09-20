import PostCard from './PostCard';
import {GetAllBlogPostResponseDto, GetCategoryResponseDto} from '@/types/blog';

type Props = {
    posts: GetAllBlogPostResponseDto[];
    categories: GetCategoryResponseDto[];
    // 첫 줄에 오는 카드 수만큼 우선 로딩한다.
    priorityCount?: number;
};

export default function PostGrid({posts, categories, priorityCount = 3}: Props) {
    if (posts.length === 0) {
        return <p className="py-16 text-center text-ink-muted">아직 글이 없습니다.</p>;
    }

    return (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
                <PostCard
                    key={post.id}
                    post={post}
                    categories={categories}
                    priority={index < priorityCount}
                />
            ))}
        </div>
    );
}
