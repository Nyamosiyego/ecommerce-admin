import NextAuth, {getServerSession} from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import {MongoDBAdapter} from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import {Admin} from "@/models/Admin";
import {mongooseConnect} from '@/lib/mongoose';

const adminEmails = ["omwegaedmond@gmail.com"]

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  ccallbacks: {
    session: async ({ session, user, token }) => {
      if (adminEmails.includes(session?.user?.email)) {
        const userId = token.sub; // Access the sub property from the token object
        
        session.userId = userId;
        
        return session;
      } else {
        return null;
      }
  }},

  secret: process.env.SECRET,
  session: {
    strategy: "jwt",
  },
};

export default NextAuth(authOptions);

export async function isAdminRequest(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!adminEmails.includes(session?.user?.email)) {
    res.status(401);
    res.end();
    throw "not an admin";
  }
}