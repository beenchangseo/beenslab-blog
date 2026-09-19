import {NextRequest, NextResponse} from 'next/server';
import {verifyToken} from '@/lib/auth';

export async function proxy(request: NextRequest) {
    if (request.nextUrl.pathname === '/admin/signin') {
        return NextResponse.next();
    }

    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
        return NextResponse.redirect(new URL('/admin/signin', request.url));
    }

    const session = await verifyToken(token);

    if (!session) {
        return NextResponse.redirect(new URL('/admin/signin', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
