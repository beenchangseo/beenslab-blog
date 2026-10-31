import {notFound} from 'next/navigation';
import PostEditor from '@/components/admin/PostEditor';
import {draftFromPost} from '@/components/admin/postDraft';
import {getCategories, getPostBySlugForAdmin, getSeriesList} from '@/lib/posts';

export default async function EditPostPage(props: {params: Promise<{slug: string}>}) {
    const {slug} = await props.params;
    const [post, categories, seriesList] = await Promise.all([
        getPostBySlugForAdmin(slug),
        getCategories(),
        getSeriesList(),
    ]);

    if (!post) {
        notFound();
    }

    return (
        <PostEditor
            target={{mode: 'edit', postId: post.id, status: post.status}}
            initial={draftFromPost(post, categories, seriesList)}
            categories={categories}
            seriesList={seriesList}
        />
    );
}
