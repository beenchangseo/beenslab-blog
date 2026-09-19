import {Mode} from '../../data/career';

export default function ModeToggle({
    mode,
    onModeChange,
}: {
    mode: Mode;
    onModeChange: (m: Mode) => void;
}) {
    return (
        <div className="mt-6 inline-flex rounded-2xl border bg-white dark:bg-gray-950 p-1 shadow-xs">
            <button
                aria-label="Resume"
                onClick={() => onModeChange('resume')}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition ${
                    mode === 'resume'
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-black'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
            >
                Resume
            </button>
            <button
                aria-label="Portfolio"
                onClick={() => onModeChange('portfolio')}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition ${
                    mode === 'portfolio'
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-black'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
            >
                Portfolio
            </button>
        </div>
    );
}
