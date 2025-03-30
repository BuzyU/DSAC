import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ForumPost, User } from "@shared/schema";
import { DiscussionCard } from "@/components/forum/DiscussionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

// Mocked user data for preview purposes
const mockAuthors: Record<number, Pick<User, "id" | "username" | "displayName" | "avatar" | "level">> = {
  1: {
    id: 1,
    username: "johndoe",
    displayName: "John Doe",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    level: "intermediate"
  },
  2: {
    id: 2,
    username: "janedoe",
    displayName: "Jane Doe",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    level: "advanced"
  },
  3: {
    id: 3,
    username: "alexwu",
    displayName: "Alex Wu",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    level: "beginner"
  },
  4: {
    id: 4,
    username: "sarahsmith",
    displayName: "Sarah Smith",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    level: "intermediate"
  },
  5: {
    id: 5,
    username: "mikelee",
    displayName: "Mike Lee",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg", 
    level: "advanced"
  },
  6: {
    id: 6,
    username: "emilyjohnson",
    displayName: "Emily Johnson",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    level: "beginner"
  }
};

export function RecentDiscussions() {
  const { data: discussions, isLoading } = useQuery<ForumPost[]>({
    queryKey: ["/api/forum"],
  });

  return (
    <section className="py-12 md:py-16 bg-slate-50 dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Recent Discussions</h2>
          <Link href="/forum">
            <a className="text-primary hover:underline font-medium">
              View forum →
            </a>
          </Link>
        </div>

        <Card className="bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden divide-y divide-slate-200 dark:divide-slate-700">
          {isLoading
            ? Array(2)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="p-5 border-b border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-start">
                      <Skeleton className="flex-shrink-0 w-10 h-10 rounded-full mr-4" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <Skeleton className="h-5 w-2/3" />
                          <Skeleton className="h-4 w-20 ml-2" />
                        </div>
                        <Skeleton className="h-4 w-40 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-2/3 mb-3" />
                        <div className="flex items-center">
                          <Skeleton className="h-4 w-20 mr-4" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            : discussions?.slice(0, 2).map((post) => (
                <DiscussionCard
                  key={post.id}
                  post={post}
                  author={mockAuthors[post.userId] || {
                    id: post.userId,
                    username: "user",
                    displayName: "User",
                    avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
                    level: "beginner"
                  }}
                  replies={Array(3)} // Mock 3 replies for preview
                />
              ))}
        </Card>
      </div>
    </section>
  );
}
