import { auth } from "@/auth"
import connectDB from "@/lib/db"
import Post from "@/models/Post"
import { NextResponse } from "next/server"

export const GET = auth(async function GET(req) {
  await connectDB()
  try {
    const posts = await Post.find()
      .populate("author", "username email")
      .populate({
        path: "replies",
        populate: {
          path: "author",
          select: "username email",
        },
      })
      .sort({ createdAt: -1 })

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
})

export const POST = auth(async function POST(req) {
  await connectDB()
  try {
    if (!req.auth) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const { content, tags } = await req.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const newPost = await Post.create({
      content,
      author: req.auth.user.id,
      tags,
    })

    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
})