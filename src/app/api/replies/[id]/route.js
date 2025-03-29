import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

// GET: Fetch a single reply by ID with its author and like/dislike counts
export async function GET(req, { params }) {
  const session = await auth();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { id } = params;

  if (!ObjectId.isValid(id)) {
    return new Response(JSON.stringify({ error: "Invalid reply ID" }), { status: 404 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const reply = await db.collection("replies").aggregate([
      { $match: { _id: new ObjectId(id) } },
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
          likeCount: { $size: { $ifNull: ["$likes", []] } },
          dislikeCount: { $size: { $ifNull: ["$dislikes", []] } },
          userLiked: { $in: [new ObjectId(session.user.id), { $ifNull: ["$likes", []] }] },
          userDisliked: { $in: [new ObjectId(session.user.id), { $ifNull: ["$dislikes", []] }] },
        },
      },
    ]).toArray();

    if (reply.length === 0) {
      return new Response(JSON.stringify({ error: "Reply not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(reply[0]), { status: 200 });
  } catch (error) {
    console.error("Error fetching reply:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

// PUT: Update a reply by ID if the authenticated user is the author
export async function PUT(req, { params }) {
  const session = await auth();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { id } = params;
  const body = await req.json();

  if (!ObjectId.isValid(id)) {
    return new Response(JSON.stringify({ error: "Invalid reply ID" }), { status: 404 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const reply = await db.collection("replies").findOne({ _id: new ObjectId(id) });
    if (!reply) {
      return new Response(JSON.stringify({ error: "Reply not found" }), { status: 404 });
    }

    if (reply.author.toString() !== session.user.id) {
      return new Response(JSON.stringify({ error: "Not authorized" }), { status: 403 });
    }

    const updateData = {
      content: body.content || reply.content,
      updatedAt: new Date(),
    };

    await db.collection("replies").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updatedReply = await db.collection("replies").findOne({ _id: new ObjectId(id) });
    return new Response(JSON.stringify(updatedReply), { status: 200 });
  } catch (error) {
    console.error("Error updating reply:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

// DELETE: Delete a reply by ID if the authenticated user is the author
export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { id } = params;

  if (!ObjectId.isValid(id)) {
    return new Response(JSON.stringify({ error: "Invalid reply ID" }), { status: 404 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const reply = await db.collection("replies").findOne({ _id: new ObjectId(id) });
    if (!reply) {
      return new Response(JSON.stringify({ error: "Reply not found" }), { status: 404 });
    }

    if (reply.author.toString() !== session.user.id) {
      return new Response(JSON.stringify({ error: "Not authorized" }), { status: 403 });
    }

    // Recursively delete nested replies
    await deleteNestedReplies(db, new ObjectId(id));
    await db.collection("replies").deleteOne({ _id: new ObjectId(id) });

    return new Response(JSON.stringify({ message: "Reply deleted" }), { status: 200 });
  } catch (error) {
    console.error("Error deleting reply:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

// Helper function to delete nested replies recursively
async function deleteNestedReplies(db, replyId) {
  const childReplies = await db.collection("replies").find({ parentId: replyId }).toArray();
  for (const child of childReplies) {
    await deleteNestedReplies(db, child._id);
    await db.collection("replies").deleteOne({ _id: child._id });
  }
}