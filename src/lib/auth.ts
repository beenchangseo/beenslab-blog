import {SignJWT, jwtVerify} from 'jose';
import {cookies} from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
);

const COOKIE_NAME = 'auth-token';
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
};

export interface SessionPayload {
    userId: string;
    email: string;
    name: string | null;
    expiresAt: Date;
}

export async function createSession(userId: string, email: string, name: string | null) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const token = await new SignJWT({userId, email, name})
        .setProtectedHeader({alg: 'HS256'})
        .setIssuedAt()
        .setExpirationTime(expiresAt)
        .sign(SECRET_KEY);

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS);

    return {userId, email, name, expiresAt};
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
        return null;
    }

    try {
        const {payload} = await jwtVerify(token, SECRET_KEY);

        return {
            userId: payload.userId as string,
            email: payload.email as string,
            name: payload.name as string | null,
            expiresAt: new Date((payload.exp as number) * 1000),
        };
    } catch (error) {
        return null;
    }
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
    try {
        const {payload} = await jwtVerify(token, SECRET_KEY);

        return {
            userId: payload.userId as string,
            email: payload.email as string,
            name: payload.name as string | null,
            expiresAt: new Date((payload.exp as number) * 1000),
        };
    } catch (error) {
        return null;
    }
}
