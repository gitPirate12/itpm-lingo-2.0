import { auth } from "@/auth"
import  connectDB  from "@/lib/db"
import Post from "@/app/models/Post"
import { NextResponse } from "next/server"

export const GET = auth(async (req) => {
  await connectDB()

  try {
    const posts = await Post.find({})
      .populate("author", "name email image")
      .sort({ createdAt: -1 })
      .limit(10)

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error fetching recent posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch recent posts" }, 
      { status: 500 }
    )
  }
})