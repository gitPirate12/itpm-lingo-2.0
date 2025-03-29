"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const ReplyForm = ({ postId, parentId, onReplyAdded }) => {
  const [content, setContent] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/replies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, postId, parentId }),
    });

    if (response.ok) {
      setContent("");
      onReplyAdded();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a reply..."
        className="mb-2"
      />
      <Button type="submit">Reply</Button>
    </form>
  );
};

export default ReplyForm;