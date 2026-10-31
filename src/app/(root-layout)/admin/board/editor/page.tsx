import PostEditor from '@/components/admin/PostEditor';
import {EMPTY_DRAFT} from '@/components/admin/postDraft';
import {getCategories, getSeriesList} from '@/lib/posts';

// Categories and series are read per request so a series added in the DB shows up
// without waiting for a rebuild. proxy.ts guards this route.
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
