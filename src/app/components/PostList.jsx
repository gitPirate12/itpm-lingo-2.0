"use client";

import PostCard from "./PostCard";

const PostList = ({ posts, onSelectPost, onVoteUpdate }) => {
  if (!posts || posts.length === 0) {
    return <div className="text-center mt-10">No posts yet. Create one above!</div>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onVote={(updatedPost) => onVoteUpdate(post._id, updatedPost)} // Pass updated data
          onSelect={onSelectPost}
        />
      ))}
    </div>
  );
};

export default PostList;