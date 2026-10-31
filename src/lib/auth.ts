import {SignJWT, jwtVerify} from 'jose';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';

export const SESSION_COOKIE = 'auth-token';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export interface SessionPayload {
    userId: string;
    email: string;
    name: string | null;
    expiresAt: Date;
}

function secretKey(): Uint8Array {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not set');
    }
    return new TextEncoder().encode(secret);
}

export async function createSession(userId: string, email: string, name: string | null) {
    const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

    const token = await new SignJWT({userId, email, name})
        .setProtectedHeader({alg: 'HS256'})
        .setIssuedAt()
        .setExpirationTime(expiresAt)
        .sign(secretKey());

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_TTL_SECONDS,
        path: '/',
    });

    return {userId, email, name, expiresAt};
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
    try {
        const {payload} = await jwtVerify(token, secretKey());

        return {
            userId: payload.userId as string,
            email: payload.email as string,
            name: payload.name as string | null,
            expiresAt: new Date((payload.exp as number) * 1000),
        };
    } catch {
        return null;
    }
}

export async function getSession(): Promise<SessionPayload | null> {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    return token ? verifyToken(token) : null;
}

export async function requireSession(): Promise<SessionPayload> {
    const session = await getSession();
    if (!session) {
        redirect('/admin/signin');
    }
    return session;
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
}
