"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VoteButtons from "./VoteButtons";

const ReplyTree = ({ reply, onVote, onReplyAdded }) => {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/replies/${reply._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
      if (!response.ok) throw new Error("Failed to update reply");
      onReplyAdded(); // Refresh replies
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating reply:", err);
    }
  };

  const isAuthor = session?.user?.id === reply.authorId;

  return (
    <div className="ml-6 mt-2">
      <Card className="border-l-2 border-gray-300 pl-4">
        <div className="flex">
          <VoteButtons
            id={reply._id}
            type="replies"
            likeCount={reply.likeCount}
            dislikeCount={reply.dislikeCount}
            userLiked={reply.userLiked}
            userDisliked={reply.userDisliked}
            onVote={onVote}
          />
          <CardContent className="flex-1 pt-4">
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Edit reply"
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
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={session?.user?.image || ""} alt={reply.author} />
                    <AvatarFallback>{reply.author[0]}</AvatarFallback>
                  </Avatar>
                  <p className="text-gray-700">{reply.content}</p>
                </div>
                <p className="text-sm text-gray-500">
                  {reply.author} • {new Date(reply.createdAt).toLocaleDateString()}
                  {isAuthor && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="ml-2"
                    >
                      Edit
                    </Button>
                  )}
                </p>
              </>
            )}
            {reply.children?.map((child) => (
              <ReplyTree key={child._id} reply={child} onVote={onVote} onReplyAdded={onReplyAdded} />
            ))}
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default ReplyTree;