import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

// POST: Like a reply
export async function POST(req, { params }) {
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

    const userId = new ObjectId(session.user.id);
    const likes = reply.likes || [];
    const dislikes = reply.dislikes || [];

    if (likes.some((like) => like.toString() === userId.toString())) {
      await db.collection("replies").updateOne(
        { _id: new ObjectId(id) },
        { $pull: { likes: userId } }
      );
    } else {
      await db.collection("replies").updateOne(
        { _id: new ObjectId(id) },
        {
          $addToSet: { likes: userId },
          $pull: { dislikes: userId },
        }
      );
    }

    return new Response(JSON.stringify({ message: "Vote updated" }), { status: 200 });
  } catch (error) {
    console.error("Error liking reply:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}