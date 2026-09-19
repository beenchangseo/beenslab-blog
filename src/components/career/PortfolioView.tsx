import {CERTS, POSTS, PROJECTS} from '../../data/career';
import Chip from './Chip';
import Section from './Section';

export default function PortfolioView() {
    return (
        <div className="space-y-16">
            <Section title="사이드 프로젝트" subtitle="개인 프로젝트 및 오픈소스 활동">
                <div className="grid md:grid-cols-2 gap-6">
                    {PROJECTS.map((p, idx) => (
                        <article
                            key={idx}
                            className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800"
                        >
                            <header className="flex items-start justify-between gap-3 mb-3">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {p.title}
                                </h3>
                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-sm whitespace-nowrap">
                                    {p.period}
                                </span>
                            </header>

                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                                {p.description}
                            </p>

                            {p.highlights && p.highlights.length > 0 && (
                                <ul className="mb-4 space-y-1">
                                    {p.highlights.map((highlight, hIdx) => (
                                        <li
                                            key={hIdx}
                                            className="text-sm text-gray-600 dark:text-gray-400 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-gray-400"
                                        >
                                            {highlight}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="flex flex-wrap gap-2 mb-3">
                                {p.stack.map((s) => (
                                    <Chip key={s}>{s}</Chip>
                                ))}
                            </div>

                            {p.links?.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    {p.links.map((l) => (
                                        <a
                                            key={l.href}
                                            href={l.href}
                                            className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                                        >
                                            {l.label}
                                            <span className="text-xs">↗</span>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            </Section>

            <Section title="기술 블로그" subtitle="주요 기술 포스트 및 문제 해결 사례">
                <div className="space-y-3">
                    {POSTS.map((p) => (
                        <a
                            key={p.href}
                            href={p.href}
                            className="block rounded-lg border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                        >
                            <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">
                                {p.title}
                            </h3>
                            {p.note && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">{p.note}</p>
                            )}
                        </a>
                    ))}
                </div>
            </Section>

            <Section title="보유 자격증" subtitle="전문 자격 및 인증">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    {CERTS.map((c, idx) => (
                        <div
                            key={`${c.name}-${c.issued}`}
                            className={
                                idx > 0
                                    ? 'pt-4 mt-4 border-t border-gray-200 dark:border-gray-700'
                                    : ''
                            }
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                                        {c.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {c.org}
                                    </p>
                                </div>
                                <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                                    <p>{c.issued}</p>
                                    {c.expires && <p>{c.expires}</p>}
                                </div>
                            </div>
                            {c.credUrl && (
                                <div className="mt-3">
                                    <a
                                        href={c.credUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        인증 보기
                                        <span className="text-xs">↗</span>
                                    </a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Section>
        </div>
    );
}
