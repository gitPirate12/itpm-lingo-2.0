"use client";

import { useSession } from "next-auth/react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VoteButtons from "./VoteButtons";

const PostCard = ({ post, onVote, onSelect }) => {
  const { data: session } = useSession(); 

  return (
    <Card
      className="mb-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect(post._id)}
    >
      <div className="flex">
        <VoteButtons
          id={post._id}
          type="posts"
          likeCount={post.likeCount}
          dislikeCount={post.dislikeCount}
          userLiked={post.userLiked}
          userDisliked={post.userDisliked}
          onVote={onVote}
        />
        <div className="flex-1">
          <CardHeader>
            <h2 className="text-lg font-semibold">{post.question}</h2>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={post.authorImage || ""} alt={post.author} />
                <AvatarFallback>{post.author[0]}</AvatarFallback>
              </Avatar>
              <p className="text-sm text-gray-500">
                Posted by {post.author} on {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{post.description}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {post.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-blue-100 text-blue-800">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

export default PostCard;