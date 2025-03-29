"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PostList from "../../components/PostList";
import PostDetail from "../../components/PostDetail";
import PostForm from "../../components/PostForm";

export default function ForumPage() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (res.ok) {
        setPosts(data);
      } else {
        console.error("Failed to fetch posts:", data.error);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchPosts();
    }
  }, [status]);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setSelectedPostId(null);
  };

  const handleVoteUpdate = (postId, updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p._id === postId ? { ...p, ...updatedPost } : p
      )
    );
  };

  const handleSelectPost = (postId) => setSelectedPostId(postId);
  const handleBack = () => setSelectedPostId(null);

  if (status === "loading" || loading) {
    return <div>Loading...</div>;
  }

  if (status !== "authenticated") {
    return <div>Please sign in to view and create posts.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Forum</h1>
      {selectedPostId ? (
        <PostDetail
          postId={selectedPostId}
          onBack={handleBack}
          onVoteUpdate={handleVoteUpdate} // Pass callback to PostDetail
        />
      ) : (
        <>
          <PostForm onPostCreated={handlePostCreated} />
          <PostList
            posts={posts}
            onSelectPost={handleSelectPost}
            onVoteUpdate={handleVoteUpdate} // Pass callback to PostList
          />
        </>
      )}
    </div>
  );
}