import BlogPost from './BlogPost';
import {GetAllBlogPostResponseDto} from '../types/blog';

type PostListProps = {
    posts: GetAllBlogPostResponseDto[];
    showAdminButtons?: boolean;
};

export default function PostList({posts, showAdminButtons = false}: PostListProps) {
    return (
        <div className="flex flex-col">
            {posts.map((post: GetAllBlogPostResponseDto) => (
                <BlogPost
                    date={post.published_at ?? post.create_time}
                    title={post.title}
                    des={post.description}
                    slug={post.slug}
                    categories={post.categories}
                    postId={post.id}
                    showAdminButtons={showAdminButtons}
                    status={post.status}
                    viewCount={post.view_count}
                    key={post.id}
                />
            ))}
        </div>
    );
}
