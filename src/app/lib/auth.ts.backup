import NextAuth, {NextAuthConfig, User} from 'next-auth';
import {JWT} from 'next-auth/jwt';
import {OAuth2Config} from 'next-auth/providers';

type PostTokenResponse = {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
};

const BeensOAuthProvider = (): OAuth2Config<User> => ({
    id: 'beens-oauth',
    name: 'BeensOAuth',
    type: 'oauth',
    authorization: {
        url: process.env.OAUTH_AUTHORIZE_URL!,
        params: {
            scope: 'read',
        },
    },
    token: {
        url: process.env.OAUTH_TOKEN_URL!,
        params: {
            grant_type: 'authorization_code',
        },
    },
    userinfo: process.env.OAUTH_USER_INFO_URL!,
    clientId: process.env.OAUTH_CLIENT_ID!,
    clientSecret: process.env.OAUTH_CLIENT_SECRET_ID!,
    checks: ['state'],
    profile(profile) {
        return {
            id: profile.id,
            name: profile.name,
            email: profile.email,
        };
    },
});

const refreshAccessToken = async (token: JWT): Promise<JWT> => {
    try {
        const url = process.env.OAUTH_TOKEN_URL!;
        const credentials = Buffer.from(
            `${process.env.OAUTH_CLIENT_ID!}:${process.env.OAUTH_CLIENT_SECRET_ID!}`,
        ).toString('base64');

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${credentials}`,
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: token.refreshToken as string,
            }),
            cache: 'force-cache',
        });

        const data: PostTokenResponse = await response.json();

        if (!response.ok) {
            throw new Error('Failed to refresh access token');
        }

        const accessTokenExpires = Date.now() + data.expires_in * 1000; // 밀리초 단위

        const newToken = {
            ...token,
            accessToken: data.access_token,
            accessTokenExpires,
            refreshToken: data.refresh_token ?? token.refreshToken,
        };

        return newToken;
    } catch (error) {
        console.error('Error refreshing access token:', error);
        return {
            ...token,
            error: 'RefreshAccessTokenError',
        };
    }
};

export const authOptions: NextAuthConfig = {
    providers: [BeensOAuthProvider()],
    pages: {
        signIn: '/admin/signin',
    },
    trustHost: true,
    session: {
        strategy: 'jwt',
        maxAge: 1900, // 7 * 24 * 60 * 60, // 7 days
    },
    secret: process.env.NEXTAUTH_SECRET,
    jwt: {
        maxAge: 1800, // 7 * 24 * 60 * 60, // 7 days
    },
    callbacks: {
        jwt: async ({token, account, user}) => {
            // 최초 로그인 시 토큰 설정
            if (account && user) {
                const accessTokenExpires = (account.expires_at as number) * 1000; // 기본 1시간
                // console.log('Initial login - accessTokenExpires:', accessTokenExpires);
                return {
                    accessToken: account.access_token,
                    accessTokenExpires,
                    refreshToken: account.refresh_token,
                    user: {
                        name: user.name!,
                        email: user.email!,
                    },
                };
            }

            // 토큰 만료 여부 확인
            if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
                // console.log('Access token is still valid');
                return token;
            }

            // 토큰 만료 시 갱신 시도
            // console.log('Access token has expired, refreshing...');
            token = await refreshAccessToken(token);
            return token;
        },
        session: async ({session, token}) => {
            session.user = token.user as any;
            session.accessToken = token.accessToken as string;
            session.error = token.error as any;

            return session;
        },
    },
};

export const {handlers, signIn, signOut, auth} = NextAuth(authOptions);
