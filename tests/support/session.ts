import {SignJWT} from 'jose';

// Mints the cookie that actions/auth.ts#login sets, so admin pages can be opened
// without the account password. userId is not a real user, so a write that slips
// through fails on the post.user_id foreign key instead of creating a row.
export async function adminSessionCookie(): Promise<{name: string; value: string}> {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not set. Run with `node --env-file=.env` or load .env.');
    }

    const value = await new SignJWT({userId: 'e2e', email: 'e2e@localhost', name: 'e2e'})
        .setProtectedHeader({alg: 'HS256'})
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(new TextEncoder().encode(secret));

    return {name: 'auth-token', value};
}
