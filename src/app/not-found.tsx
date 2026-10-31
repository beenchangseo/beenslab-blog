import './globals.css';
import Layout from '@/components/layout/Layout';
import NotFoundSection from '@/components/layout/NotFoundSection';

// Only unmatched URLs land here, under the root layout that has no header.
// notFound() inside (root-layout) uses (root-layout)/not-found.tsx instead.
export default function NotFound() {
    return (
        <Layout>
            <NotFoundSection />
        </Layout>
    );
}
