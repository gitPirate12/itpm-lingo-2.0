import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

// POST: Dislike a post
export async function POST(req, { params }) {
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

    const userId = new ObjectId(session.user.id);
    const likes = post.likes || [];
    const dislikes = post.dislikes || [];

    // If already disliked, remove dislike (toggle off)
    if (dislikes.some((dislike) => dislike.toString() === userId.toString())) {
      await db.collection("posts").updateOne(
        { _id: new ObjectId(id) },
        { $pull: { dislikes: userId } }
      );
    } else {
      // Add dislike and remove like if present
      await db.collection("posts").updateOne(
        { _id: new ObjectId(id) },
        {
          $addToSet: { dislikes: userId },
          $pull: { likes: userId },
        }
      );
    }

    return new Response(JSON.stringify({ message: "Vote updated" }), { status: 200 });
  } catch (error) {
    console.error("Error disliking post:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}