'use client';
import {useState} from 'react';
import Header from '../../../components/career/Header';
import ResumeView from '../../../components/career/ResumeView';
import PortfolioView from '../../../components/career/PortfolioView';

function Divider() {
    return (
        <div className="h-px w-full bg-linear-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700 my-6" />
    );
}

export default function CareerPage() {
    const [mode, setMode] = useState<'resume' | 'portfolio'>('resume');

    return (
        <div className="min-h-screen bg-linear-to-b">
            <div className="mx-auto max-w-5xl px-4 py-10">
                <Header mode={mode} onModeChange={setMode} />

                <Divider />

                {mode === 'resume' ? <ResumeView /> : <PortfolioView />}

                <Divider />
            </div>
        </div>
    );
}
