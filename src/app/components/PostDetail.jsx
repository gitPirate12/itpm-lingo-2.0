"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import VoteButtons from "./VoteButtons";
import ReplyTree from "./ReplyTree";
import ReplyForm from "./ReplyForm";

const PostDetail = ({ postId, onBack, onVoteUpdate }) => { // Add onVoteUpdate prop
  const { data: session } = useSession();
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editQuestion, setEditQuestion] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`);
      if (!response.ok) throw new Error("Failed to fetch post");
      const data = await response.json();
      setPost(data);
      setEditQuestion(data.question);
      setEditDescription(data.description);
      return data; // Return data for use in onVote
    } catch (err) {
      console.error("Error fetching post:", err);
      setError(err.message);
      return null;
    }
  };

  const fetchReplies = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/replies`);
      if (!response.ok) throw new Error("Failed to fetch replies");
      const data = await response.json();
      setReplies(data);
    } catch (err) {
      console.error("Error fetching replies:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([fetchPost(), fetchReplies()]).finally(() => setLoading(false));
  }, [postId]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: editQuestion,
          description: editDescription,
        }),
      });
      if (!response.ok) throw new Error("Failed to update post");
      await fetchPost();
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating post:", err);
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await fetch(`/api/posts/${postId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete post");
        onBack();
      } catch (err) {
        console.error("Error deleting post:", err);
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!post) return <div className="text-center mt-10">Post not found</div>;

  const isAuthor = session?.user?.id === post.authorId;

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="outline" className="mb-4">
        Back to Posts
      </Button>
      <Card>
        <div className="flex">
          <VoteButtons
            id={post._id}
            type="posts"
            likeCount={post.likeCount}
            dislikeCount={post.dislikeCount}
            userLiked={post.userLiked}
            userDisliked={post.userDisliked}
            onVote={async () => {
              const updatedPost = await fetchPost(); // Refresh local state and get updated data
              if (updatedPost && onVoteUpdate) {
                onVoteUpdate(post._id, {
                  likeCount: updatedPost.likeCount,
                  dislikeCount: updatedPost.dislikeCount,
                  userLiked: updatedPost.userLiked,
                  userDisliked: updatedPost.userDisliked,
                });
              }
            }}
          />
          <div className="flex-1">
            <CardHeader>
              {isEditing ? (
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <Input
                    value={editQuestion}
                    onChange={(e) => setEditQuestion(e.target.value)}
                    placeholder="Edit title"
                    required
                  />
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Edit description"
                    required
                  />
                  <div className="flex gap-2">
                    <Button type="submit">Save</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">{post.question}</h1>
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={post.authorImage || ""} alt={post.author} />
                      <AvatarFallback>{post.author[0]}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm text-gray-500">
                      Posted by {post.author} on {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                    {isAuthor && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="ml-2"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDelete}
                          className="ml-2"
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </>
              )}
            </CardHeader>
            {!isEditing && (
              <CardContent>
                <p className="text-gray-700">{post.description}</p>
              </CardContent>
            )}
          </div>
        </div>
      </Card>
      <div>
        <h2 className="text-xl font-semibold mb-4">Replies</h2>
        <ReplyForm postId={postId} parentId={null} onReplyAdded={fetchReplies} />
        {replies.map((reply) => (
          <ReplyTree key={reply._id} reply={reply} onVote={fetchReplies} onReplyAdded={fetchReplies} />
        ))}
      </div>
    </div>
  );
};

export default PostDetail;