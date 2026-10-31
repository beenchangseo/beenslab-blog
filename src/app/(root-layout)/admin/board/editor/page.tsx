import PostEditor from '@/components/admin/PostEditor';
import {EMPTY_DRAFT} from '@/components/admin/postDraft';
import {getCategories, getSeriesList} from '@/lib/posts';

export const dynamic = 'force-dynamic';

export default async function NewPostPage() {
    const [categories, seriesList] = await Promise.all([getCategories(), getSeriesList()]);

    return (
        <PostEditor
            target={{mode: 'create'}}
            initial={EMPTY_DRAFT}
            categories={categories}
            seriesList={seriesList}
        />
    );
}
