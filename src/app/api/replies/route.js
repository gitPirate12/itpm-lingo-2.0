import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

// POST: Create a new reply (top-level or nested under another reply)
export async function POST(req) {
  const session = await auth();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const body = await req.json();
    const { content, postId, parentId } = body;

    if (!content || !postId) {
      return new Response(JSON.stringify({ error: "Content and postId required" }), { status: 400 });
    }

    if (!ObjectId.isValid(postId) || (parentId && !ObjectId.isValid(parentId))) {
      return new Response(JSON.stringify({ error: "Invalid ID" }), { status: 404 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Verify post exists
    const post = await db.collection("posts").findOne({ _id: new ObjectId(postId) });
    if (!post) {
      return new Response(JSON.stringify({ error: "Post not found" }), { status: 404 });
    }

    // Verify parent reply exists (if provided)
    if (parentId) {
      const parentReply = await db.collection("replies").findOne({ _id: new ObjectId(parentId) });
      if (!parentReply || parentReply.postId.toString() !== postId) {
        return new Response(JSON.stringify({ error: "Invalid parent reply" }), { status: 404 });
      }
    }

    const reply = {
      content,
      author: new ObjectId(session.user.id),
      postId: new ObjectId(postId),
      parentId: parentId ? new ObjectId(parentId) : null,
      createdAt: new Date(),
    };

    const result = await db.collection("replies").insertOne(reply);

    const newReply = await db.collection("replies").aggregate([
      { $match: { _id: result.insertedId } },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $project: {
          _id: 1,
          content: 1,
          author: "$author.name",
          postId: 1,
          parentId: 1,
          createdAt: 1,
        },
      },
    ]).toArray();

    return new Response(JSON.stringify(newReply[0]), { status: 201 });
  } catch (error) {
    console.error("Error creating reply:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}