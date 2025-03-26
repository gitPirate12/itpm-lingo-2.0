import { auth } from "@/auth"
import connectDB from "@/lib/db"
import Reply from "@/app/models/Reply"
import { NextResponse } from "next/server"

export const GET = auth(async (req, { params }) => {
  await connectDB()

  try {
    const replies = await Reply.find({ parentId: params.id, parentModel: "Post" })
      .populate("author", "name email image")
      .populate({
        path: "replies",
        populate: {
          path: "author",
          select: "name email image",
        },
      })
      .sort({ createdAt: -1 })

    return NextResponse.json(replies)
  } catch (error) {
    console.error("Error fetching replies:", error)
    return NextResponse.json({ error: "Failed to fetch replies" }, { status: 500 })
  }
})

