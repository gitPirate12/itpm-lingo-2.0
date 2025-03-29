import { auth } from "@/auth"; 
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

// GET: Fetch all posts with their authors and like/dislike counts
export async function GET() {
  const session = await auth();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const posts = await db.collection("posts").aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          question: 1,
          description: 1,
          author: { $ifNull: ["$author.name", "Unknown"] },
          authorId: "$author._id",
          authorImage: "$author.image",
          createdAt: 1,
          tags: 1,
          likes: { $ifNull: ["$likes", []] }, // Include raw arrays
          dislikes: { $ifNull: ["$dislikes", []] }, // Include raw arrays
          likeCount: { $size: { $ifNull: ["$likes", []] } },
          dislikeCount: { $size: { $ifNull: ["$dislikes", []] } },
          userLiked: {
            $cond: {
              if: { $isArray: "$likes" },
              then: { $in: [new ObjectId(session.user.id), "$likes"] },
              else: false,
            },
          },
          userDisliked: {
            $cond: {
              if: { $isArray: "$dislikes" },
              then: { $in: [new ObjectId(session.user.id), "$dislikes"] },
              else: false,
            },
          },
        },
      },
    ]).toArray();

    return new Response(JSON.stringify(posts), { status: 200 });
  } catch (error) {
    console.error("Error fetching posts:", error.stack);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), { status: 500 });
  }
}

// POST: Create a new post
export async function POST(req) {
  const session = await auth();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const body = await req.json();
    const { question, description, tags } = body;

    if (!question || !description) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const post = {
      question,
      description,
      author: new ObjectId(session.user.id),
      tags: tags || [],
      createdAt: new Date(),
      likes: [],
      dislikes: [],
    };

    const result = await db.collection("posts").insertOne(post);

    const newPost = await db.collection("posts").aggregate([
      { $match: { _id: result.insertedId } },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          question: 1,
          description: 1,
          author: { $ifNull: ["$author.name", "Unknown"] },
          authorId: "$author._id",
          authorImage: "$author.image",
          createdAt: 1,
          tags: 1,
          likes: { $ifNull: ["$likes", []] }, // Include raw arrays
          dislikes: { $ifNull: ["$dislikes", []] }, // Include raw arrays
          likeCount: { $size: { $ifNull: ["$likes", []] } },
          dislikeCount: { $size: { $ifNull: ["$dislikes", []] } },
          userLiked: {
            $cond: {
              if: { $isArray: "$likes" },
              then: { $in: [new ObjectId(session.user.id), "$likes"] },
              else: false,
            },
          },
          userDisliked: {
            $cond: {
              if: { $isArray: "$dislikes" },
              then: { $in: [new ObjectId(session.user.id), "$dislikes"] },
              else: false,
            },
          },
        },
      },
    ]).toArray();

    return new Response(JSON.stringify(newPost[0]), { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error.stack);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), { status: 500 });
  }
}