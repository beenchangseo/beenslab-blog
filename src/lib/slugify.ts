import {romanize} from '@romanize/korean';
import slugify from '@sindresorhus/slugify';

export function generateSlugFromTitle(title: string): string {
    const hasKorean = /[가-힣]/.test(title);

    if (hasKorean) {
        const romanized = romanize(title);
        return slugify(romanized);
    }

    return slugify(title);
}
