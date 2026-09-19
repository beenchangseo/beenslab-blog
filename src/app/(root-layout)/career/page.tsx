'use client';
import React, {useMemo, useState} from 'react';
import Header from '../../../components/career/Header';
import ResumeView from '../../../components/career/ResumeView';
import PortfolioView from '../../../components/career/PortfolioView';
import Footer from '../../../components/career/Footer';

const resumeUrl = '/resume.pdf';
const blogUrl = 'https://blog.beenslab.com/';

function Divider() {
    return (
        <div className="h-px w-full bg-linear-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700 my-6" />
    );
}

export default function CareerPage() {
    const [mode, setMode] = useState<'resume' | 'portfolio'>('resume');

    const headerTitle = useMemo(() => (mode === 'resume' ? 'Resume' : 'Portfolio'), [mode]);

    return (
        <main className="min-h-screen bg-linear-to-b">
            <div className="mx-auto max-w-5xl px-4 py-10">
                {/* 헤더 */}
                <Header mode={mode} onModeChange={setMode} />

                <Divider />

                {/* 본문 */}
                {mode === 'resume' ? <ResumeView /> : <PortfolioView />}

                <Divider />

                {/* 푸터 CTA */}
                <Footer resumeUrl={resumeUrl} blogUrl={blogUrl} />
            </div>
        </main>
    );
}
