import { auth } from "@/auth"
import  connectDB  from "@/lib/db"
import Post from "@/app/models/Post"
import { NextResponse } from "next/server"

export const POST = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
  }

  await connectDB()

  try {
    const { postId, type } = await req.json()

    if (!postId || !["upvote", "downvote"].includes(type)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const post = await Post.findById(postId)
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const userId = req.auth.user.id

    // Remove the user from both upvotes and downvotes
    post.upvotes.pull(userId)
    post.downvotes.pull(userId)

    if (type === "upvote") {
      if (!post.upvotes.includes(userId)) {
        post.upvotes.push(userId)
      }
    } else if (type === "downvote") {
      if (!post.downvotes.includes(userId)) {
        post.downvotes.push(userId)
      }
    }

    await post.save()

    return NextResponse.json({
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length,
    })
  } catch (error) {
    console.error("Error voting on post:", error)
    return NextResponse.json(
      { error: "Failed to vote on post" }, 
      { status: 500 }
    )
  }
})