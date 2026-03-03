import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';

export const { handlers, auth } = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_URL,
});
