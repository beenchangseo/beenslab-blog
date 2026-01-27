import {EXPERIENCES, SKILLS, KEY_ACHIEVEMENTS, CERTS, EDUCATION} from '../../data/career';
import Chip from './Chip';
import Section from './Section';

export default function ResumeView() {
    return (
        <div className="space-y-16">
            <Section title="주요 성과" subtitle="Technical Impact & Business Value">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {KEY_ACHIEVEMENTS.map((achievement, idx) => (
                        <div
                            key={idx}
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
                        >
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1 whitespace-nowrap">
                                {achievement.metric}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {achievement.description}
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="경력" subtitle="Professional Experience">
                <div className="space-y-6">
                    {EXPERIENCES.map((exp, idx) => (
                        <div
                            key={idx}
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {exp.company}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 font-medium text-sm">
                                        {exp.role}
                                    </p>
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {exp.period}
                                </span>
                            </div>

                            {exp.keyMetrics && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {exp.keyMetrics.map((metric) => (
                                        <span
                                            key={metric}
                                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium"
                                        >
                                            {metric}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                                {exp.summary}
                            </p>

                            <ul className="space-y-2">
                                {exp.achievements.map((achievement, aIdx) => (
                                    <li
                                        key={aIdx}
                                        className="text-gray-700 dark:text-gray-300 text-sm pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-gray-400"
                                    >
                                        {achievement}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="핵심 스킬" subtitle="Technical Skills">
                <div className="grid md:grid-cols-2 gap-6">
                    {SKILLS.map((group) => (
                        <div key={group.cat} className="space-y-3">
                            <h4 className="font-semibold text-base text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                {group.cat}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {group.items.map((item) => (
                                    <Chip key={item}>{item}</Chip>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="자격증" subtitle="Certifications">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    {CERTS.map((cert, idx) => (
                        <div key={idx} className="flex items-start justify-between flex-wrap gap-4">
                            <div>
                                <h4 className="text-base font-bold text-gray-900 dark:text-white">
                                    {cert.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {cert.org}
                                </p>
                            </div>
                            <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                                <p>{cert.issued}</p>
                                {cert.expires && <p>{cert.expires}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="학력" subtitle="Education">
                <div className="grid md:grid-cols-2 gap-4">
                    {EDUCATION.map((edu, idx) => (
                        <div
                            key={idx}
                            className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700"
                        >
                            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                                {edu.school}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{edu.degree}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                {edu.period}
                            </p>
                        </div>
                    ))}
                </div>
            </Section>
        </div>
    );
}
