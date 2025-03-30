import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DiscussionCard } from "@/components/forum/DiscussionCard";
import { ForumPost, User } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MessageSquarePlus, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

// Mock authors data - will be replaced with real data when API is updated
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

interface ForumPostWithAuthor extends ForumPost {
  author: User;
  repliesCount: number;
}

export default function ForumPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery<ForumPost[]>({
    queryKey: ["/api/forum"],
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/forum", {
        title: newPostTitle,
        content: newPostContent,
        userId: user?.id,
        tags: newPostTags.split(",").map(tag => tag.trim()).filter(tag => tag),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum"] });
      setNewPostTitle("");
      setNewPostContent("");
      setNewPostTags("");
      setDialogOpen(false);
      toast({
        title: "Post created successfully",
        description: "Your discussion has been added to the forum.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreatePost = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a post",
        variant: "destructive",
      });
      return;
    }
    
    if (!newPostTitle || !newPostContent) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content for your post",
        variant: "destructive",
      });
      return;
    }
    
    createPostMutation.mutate();
  };

  // Add author data to posts and mocked reply counts
  const postsWithAuthors = posts?.map(post => ({
    ...post,
    author: mockAuthors[post.userId] || {
      id: post.userId,
      username: "user",
      displayName: "User",
      avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
      level: "beginner"
    },
    repliesCount: Math.floor(Math.random() * 10) + 1 // Random number of replies between 1-10
  }));

  // Filter and search posts
  const filteredPosts = postsWithAuthors
    ? postsWithAuthors.filter((post) => {
        // Search filter
        const matchesSearch =
          searchQuery === "" ||
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags?.some(tag => 
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          );

        // Tab filter
        if (filter === "all") return matchesSearch;
        if (filter === "beginner") 
          return matchesSearch && post.author.level === "beginner";
        if (filter === "intermediate") 
          return matchesSearch && post.author.level === "intermediate";
        if (filter === "advanced") 
          return matchesSearch && post.author.level === "advanced";
        
        return matchesSearch;
      })
    : [];

  return (
    <>
      <Helmet>
        <title>Forum | DSAC - Data Structure & Algorithm Club</title>
        <meta name="description" content="Discuss data structures and algorithms, ask questions, and help fellow programmers." />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-12 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Discussion Forum</h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Ask questions, share knowledge, and help other members
                </p>
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full md:w-auto">
                    <MessageSquarePlus className="h-4 w-4 mr-2" />
                    New Discussion
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Create a new discussion</DialogTitle>
                    <DialogDescription>
                      Share your questions or insights with the community. Be specific
                      to get better responses.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="E.g., Optimizing Dynamic Programming Solutions"
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        placeholder="Describe your question or insight in detail..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="col-span-3 h-32"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        placeholder="E.g., dynamic-programming, optimization, leetcode"
                        value={newPostTags}
                        onChange={(e) => setNewPostTags(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      onClick={handleCreatePost}
                      disabled={createPostMutation.isPending}
                    >
                      {createPostMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        "Post Discussion"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search discussions..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="md:col-span-1">
                <Tabs 
                  defaultValue="all" 
                  value={filter}
                  onValueChange={setFilter}
                >
                  <TabsList className="w-full grid grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="beginner">Beginner</TabsTrigger>
                    <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  // Loading state
                  Array(5)
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
                ) : filteredPosts.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquarePlus className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No discussions found</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      {searchQuery
                        ? `No results found for "${searchQuery}"`
                        : "There are no discussions in this category yet."}
                    </p>
                    <Button 
                      className="mt-2"
                      onClick={() => {
                        setDialogOpen(true);
                        setSearchQuery("");
                      }}
                    >
                      Start a New Discussion
                    </Button>
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <DiscussionCard
                      key={post.id}
                      post={post}
                      author={post.author}
                      replies={Array(post.repliesCount)}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
