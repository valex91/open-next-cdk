import type {Session} from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export type CreatedSession = {
  data: {
    user: {
      name: string;
      email: string;
      image: string;
      id: string;
    };
  } & Session;
};

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  // adapter: dynamoDBAdapter, too soon executus
  callbacks: {
    session({session, token}: {session: any; token: any}) {
      if (session?.user) {
        session.user.id = token?.sub as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt' as const,
  },
};
