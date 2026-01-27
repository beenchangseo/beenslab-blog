import {Mode, SUMMARY} from '../../data/career';
import Chip from './Chip';
import ModeToggle from './ModeToggle';

export default function Header({
    mode,
    onModeChange,
}: {
    mode: Mode;
    onModeChange: (m: Mode) => void;
}) {
    return (
        <header className="mb-20">
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 text-gray-900 dark:text-white">
                    {SUMMARY.name}
                </h1>
                <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 mb-6">
                    {SUMMARY.title}
                </p>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed text-sm">
                    {SUMMARY.blurb}
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
                {SUMMARY.highlights.map((h) => (
                    <span
                        key={h}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium"
                    >
                        {h}
                    </span>
                ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 mb-10 border border-gray-100 dark:border-gray-700">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Email
                            </span>
                            <a
                                href={`mailto:${SUMMARY.contact.email}`}
                                className="text-sm text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 break-all"
                            >
                                {SUMMARY.contact.email}
                            </a>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Phone
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white">
                                {SUMMARY.contact.phone}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Location
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white">
                                {SUMMARY.contact.location}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                GitHub
                            </span>
                            <a
                                href={SUMMARY.contact.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate"
                            >
                                {SUMMARY.contact.github.replace('https://', '')}
                            </a>
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Blog
                            </span>
                            <a
                                href={SUMMARY.contact.blog}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate"
                            >
                                {SUMMARY.contact.blog.replace('https://', '')}
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <ModeToggle mode={mode} onModeChange={onModeChange} />
        </header>
    );
}
