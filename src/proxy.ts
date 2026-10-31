import {NextRequest, NextResponse} from 'next/server';
import {SESSION_COOKIE, verifyToken} from '@/lib/auth';

export async function proxy(request: NextRequest) {
    if (request.nextUrl.pathname === '/admin/signin') {
        return NextResponse.next();
    }

    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const session = token ? await verifyToken(token) : null;

    if (!session) {
        return NextResponse.redirect(new URL('/admin/signin', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
