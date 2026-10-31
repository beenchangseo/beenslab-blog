import {SignJWT} from 'jose';

// Not a row in the user table: if a write ever slips through, post.user_id's foreign key
// rejects it instead of creating a post.
const NONEXISTENT_USER_ID = 'e2e';

export async function adminSessionCookie(): Promise<{name: string; value: string}> {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not set. Run with `node --env-file=.env` or load .env.');
    }

    const value = await new SignJWT({
        userId: NONEXISTENT_USER_ID,
        email: 'e2e@localhost',
        name: 'e2e',
    })
        .setProtectedHeader({alg: 'HS256'})
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(new TextEncoder().encode(secret));

    return {name: 'auth-token', value};
}
