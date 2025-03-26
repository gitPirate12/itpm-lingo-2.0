import { auth } from "@/auth"
import { connectDB } from "@/lib/db"
import Post from "@/app/models/Post"
import { NextResponse } from "next/server"

export const GET = auth(async (req) => {
  await connectDB()

  try {
    const posts = await Post.aggregate([
      {
        $addFields: {
          score: {
            $add: [
              { $size: "$upvotes" },
              { $multiply: [{ $size: "$downvotes" }, -1] },
              {
                $divide: [
                  { $subtract: [new Date(), "$createdAt"] },
                  -1000 * 60 * 60 * 24
                ]
              }
            ]
          }
        }
      },
      { $sort: { score: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author"
        }
      },
      { $unwind: "$author" },
      {
        $project: {
          content: 1,
          tags: 1,
          createdAt: 1,
          upvotes: { $size: "$upvotes" },
          downvotes: { $size: "$downvotes" },
          author: {
            name: 1,
            email: 1,
            image: 1
          }
        }
      }
    ])

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error fetching trending posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch trending posts" },
      { status: 500 }
    )
  }
})