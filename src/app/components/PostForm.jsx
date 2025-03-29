"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"; 

const PostForm = ({ onPostCreated }) => {
  const { data: session, status } = useSession(); // Check authentication status
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Add loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setLoading(true); // Indicate submission in progress

    // Check if user is signed in
    if (status !== "authenticated") {
      setError("You must be signed in to create a post.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          description,
          tags: tags ? tags.split(",").map((tag) => tag.trim()) : [], // Handle empty tags
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create post");
      }

      // Success: Reset form and notify user
      setQuestion("");
      setDescription("");
      setTags("");
      toast.success("Post created successfully!");
      onPostCreated(data); // Pass the new post to the parent component
    } catch (err) {
      console.error("Error creating post:", err);
      setError(err.message);
      toast.error("Error creating post", { description: err.message });
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <Input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Post Title"
        required
        disabled={loading || status !== "authenticated"} // Disable if loading or not signed in
      />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Post Description"
        required
        disabled={loading || status !== "authenticated"}
      />
      <Input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma-separated)"
        disabled={loading || status !== "authenticated"}
      />
      {error && <p className="text-red-500">{error}</p>}
      <Button type="submit" disabled={loading || status !== "authenticated"}>
        {loading ? "Creating..." : "Create Post"}
      </Button>
    </form>
  );
};

export default PostForm;