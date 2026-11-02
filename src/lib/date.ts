const KST_DATE = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

// Vercel renders in UTC, so a post published at 01:00 KST would otherwise show the previous day.
export function formatPostDate(iso: string): string {
    return KST_DATE.format(new Date(iso)).replaceAll('-', '.');
}
