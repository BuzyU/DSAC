import { ForumPost, ForumReply, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Eye } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Link } from "wouter";

interface DiscussionCardProps {
  post: ForumPost;
  author: Pick<User, "id" | "username" | "displayName" | "avatar" | "level">;
  replies?: ForumReply[];
  variant?: "preview" | "full";
}

export function DiscussionCard({
  post,
  author,
  replies = [],
  variant = "preview",
}: DiscussionCardProps) {
  return (
    <div className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-4">
          <UserAvatar user={author} className="w-10 h-10" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <Link href={`/forum/${post.id}`}>
              <a className="text-lg font-medium text-slate-900 dark:text-white hover:text-primary dark:hover:text-primary truncate">
                {post.title}
              </a>
            </Link>
            <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm ml-2 flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
          <div className="flex items-center text-sm mb-2">
            <Link href={`/profile/${author.id}`}>
              <a className="font-medium mr-2 hover:text-primary">
                {author.displayName}
              </a>
            </Link>
            <span className="text-slate-500 dark:text-slate-400 capitalize">
              {author.level}
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
            {post.content}
          </p>
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center mr-4">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{replies.length} replies</span>
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              <span>{post.views} views</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
