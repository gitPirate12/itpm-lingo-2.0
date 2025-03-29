"use client";

import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";

const VoteButtons = ({ id, type, likeCount, dislikeCount, userLiked, userDisliked, onVote }) => {
  const handleLike = async () => {
    const response = await fetch(`/api/${type}/${id}/like`, { method: "POST" });
    if (response.ok) onVote();
  };

  const handleDislike = async () => {
    const response = await fetch(`/api/${type}/${id}/dislike`, { method: "POST" });
    if (response.ok) onVote();
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant={userLiked ? "default" : "ghost"}
        size="sm"
        onClick={handleLike}
        className="p-1"
      >
        <ArrowUp className="h-4 w-4" /> <span className="ml-1">{likeCount}</span>
      </Button>
      <Button
        variant={userDisliked ? "default" : "ghost"}
        size="sm"
        onClick={handleDislike}
        className="p-1"
      >
        <ArrowDown className="h-4 w-4" /> <span className="ml-1">{dislikeCount}</span>
      </Button>
    </div>
  );
};

export default VoteButtons;