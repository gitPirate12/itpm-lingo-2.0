import { auth } from "@/auth"
import connectDB from "@/lib/db"
import Post from "@/app/models/Post"
import { NextResponse } from "next/server"

export const GET = auth(async (req, { params }) => {
  await connectDB()

  try {
    const post = await Post.findById(params.id)
      .populate("author", "name email image")
      .populate({
        path: "replies",
        populate: {
          path: "author",
          select: "name email image",
        },
      })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 })
  }
})

export const PATCH = auth(async (req, { params }) => {
  if (!req.auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
  }

  await connectDB()

  try {
    const { content, tags } = await req.json()
    const post = await Post.findById(params.id)

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    if (post.author.toString() !== req.auth.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (content) post.content = content
    if (tags) post.tags = tags

    await post.save()

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
  }
})

export const DELETE = auth(async (req, { params }) => {
  if (!req.auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
  }

  await connectDB()

  try {
    const post = await Post.findById(params.id)

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    if (post.author.toString() !== req.auth.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await Post.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Post deleted" })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
})