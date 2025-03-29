import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/db";
import bcrypt from "bcryptjs";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: "Lingo-DB", // Explicitly specify your DB name
  }),
  secret: process.env.NEXTAUTH_SECRET, // Use the secret from .env
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true
    }),
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true
    }),
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const client = await clientPromise;
          const db = client.db("Lingo-DB"); // Explicitly use Lingo-DB
          const user = await db.collection("users").findOne({ email: credentials.email });

          if (!user) return null;

          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("SignIn:", { user, account, profile }); // Debug
      try {
        const client = await clientPromise;
        const db = client.db("Lingo-DB"); // Explicitly use Lingo-DB
        const existingUser = await db.collection("users").findOne({ email: user.email });
        console.log("Existing User:", existingUser); // Debug

        if (!existingUser) {
          const newUser = await db.collection("users").insertOne({
            email: user.email,
            name: user.name,
            image: user.image,
            provider: account.provider,
            createdAt: new Date(),
          });
          user.id = newUser.insertedId.toString();
          return true;
        } else {
          await db.collection("users").updateOne(
            { _id: existingUser._id },
            {
              $set: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                provider: account.provider,
                lastLogin: new Date(),
              },
            }
          );
          user.id = existingUser._id.toString();
          return true;
        }
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
    },
    async jwt({ token, user, trigger }) {
      if (trigger === "signIn" && user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.picture;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  debug: true, // Enable debug logs to troubleshoot
});

export const { GET, POST } = handlers;