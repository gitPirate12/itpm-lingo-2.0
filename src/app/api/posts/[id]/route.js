import { auth } from "@/auth"; 
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

// GET: Fetch a single post by ID with its author and like/dislike counts
export async function GET(req, { params }) {
  const session = await auth();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { id } = params;

  if (!ObjectId.isValid(id)) {
    return new Response(JSON.stringify({ error: "Invalid post ID" }), { status: 404 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const post = await db.collection("posts").aggregate([
      { $match: { _id: new ObjectId(id) } },
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
          authorId: "$author._id", // Add this for edit button check
          authorImage: "$author.image", // For avatar
          createdAt: 1,
          tags: 1,
          likeCount: { $size: { $ifNull: ["$likes", []] } },
          dislikeCount: { $size: { $ifNull: ["$dislikes", []] } },
          userLiked: { $in: [new ObjectId(session.user.id), { $ifNull: ["$likes", []] }] },
          userDisliked: { $in: [new ObjectId(session.user.id), { $ifNull: ["$dislikes", []] }] },
        },
      },
    ]).toArray();

    if (post.length === 0) {
      return new Response(JSON.stringify({ error: "Post not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(post[0]), { status: 200 });
  } catch (error) {
    console.error("Error fetching post:", error.stack);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), { status: 500 });
  }
}

// PUT: Update a post by ID if the authenticated user is the author
export async function PUT(req, { params }) {
  const session = await auth();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { id } = params;
  const body = await req.json();

  if (!ObjectId.isValid(id)) {
    return new Response(JSON.stringify({ error: "Invalid post ID" }), { status: 404 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const post = await db.collection("posts").findOne({ _id: new ObjectId(id) });
    if (!post) {
      return new Response(JSON.stringify({ error: "Post not found" }), { status: 404 });
    }

    if (post.author.toString() !== session.user.id) {
      return new Response(JSON.stringify({ error: "Not authorized" }), { status: 403 });
    }

    const updateData = {
      question: body.question || post.question,
      description: body.description || post.description,
      tags: body.tags || post.tags,
      updatedAt: new Date(),
    };

    await db.collection("posts").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Fetch updated post with the same format as GET
    const updatedPost = await db.collection("posts").aggregate([
      { $match: { _id: new ObjectId(id) } },
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
          likeCount: { $size: { $ifNull: ["$likes", []] } },
          dislikeCount: { $size: { $ifNull: ["$dislikes", []] } },
          userLiked: { $in: [new ObjectId(session.user.id), { $ifNull: ["$likes", []] }] },
          userDisliked: { $in: [new ObjectId(session.user.id), { $ifNull: ["$dislikes", []] }] },
        },
      },
    ]).toArray();

    return new Response(JSON.stringify(updatedPost[0]), { status: 200 });
  } catch (error) {
    console.error("Error updating post:", error.stack);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), { status: 500 });
  }
}

// DELETE: Delete a post by ID if the authenticated user is the author
export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { id } = params;

  if (!ObjectId.isValid(id)) {
    return new Response(JSON.stringify({ error: "Invalid post ID" }), { status: 404 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const post = await db.collection("posts").findOne({ _id: new ObjectId(id) });
    if (!post) {
      return new Response(JSON.stringify({ error: "Post not found" }), { status: 404 });
    }

    if (post.author.toString() !== session.user.id) {
      return new Response(JSON.stringify({ error: "Not authorized" }), { status: 403 });
    }

    await db.collection("posts").deleteOne({ _id: new ObjectId(id) });
    await db.collection("replies").deleteMany({ postId: new ObjectId(id) });
    return new Response(JSON.stringify({ message: "Post and replies deleted" }), { status: 200 });
  } catch (error) {
    console.error("Error deleting post:", error.stack);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), { status: 500 });
  }
}