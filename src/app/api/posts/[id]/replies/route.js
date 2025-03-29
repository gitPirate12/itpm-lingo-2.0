import { auth } from "@/auth"; // Adjusted import path to match your structure
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

// GET: Fetch all replies for a post as a nested tree with like/dislike counts
export async function GET(req, { params }) {
  const session = await auth();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { id } = params; // Destructure id from params directly

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

    const replies = await db.collection("replies").aggregate([
      { $match: { postId: new ObjectId(id) } },
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

    const replyTree = buildReplyTree(replies);
    return new Response(JSON.stringify(replyTree), { status: 200 });
  } catch (error) {
    console.error("Error fetching replies:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), { status: 500 });
  }
}

// Helper function to build a nested reply tree
function buildReplyTree(replies) {
  const replyMap = new Map();
  const tree = [];

  replies.forEach((reply) => {
    reply.children = [];
    replyMap.set(reply._id.toString(), reply);
  });

  replies.forEach((reply) => {
    if (reply.parentId) {
      const parent = replyMap.get(reply.parentId.toString());
      if (parent) parent.children.push(reply);
    } else {
      tree.push(reply);
    }
  });

  return tree;
}