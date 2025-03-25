import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import connectDB from "@/lib/db"
import User from "@/app/models/User"
import bcrypt from "bcryptjs"

// Initialize DB connection
connectDB().catch(err => console.error("DB connection error:", err))

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Google({ 
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET
    }),
    GitHub({ 
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        try {
          await connectDB()
          const user = await User.findOne({ email: credentials.email })
            .select("+password")
          
          if (!user) return null
          
          const isValid = await bcrypt.compare(
            credentials.password, 
            user.password
          )
          
          if (!isValid) return null
          
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image
          }
        } catch (error) {
          console.error("Authorization error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await connectDB()
        
        // Only handle OAuth providers
        if (account?.provider === "google" || account?.provider === "github") {
          const existingUser = await User.findOne({ email: user.email })
          
          if (!existingUser) {
            // Create new user if doesn't exist
            await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
              // For OAuth users, no password is required
            })
          } else {
            // Update existing user's info
            await User.findByIdAndUpdate(existingUser._id, {
              name: user.name,
              image: user.image
            })
          }
        }
        return true
      } catch (error) {
        console.error("SignIn callback error:", error)
        return false
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        session.user.image = token.picture
      }
      return session
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  },
  secret: process.env.NEXTAUTH_SECRET
})