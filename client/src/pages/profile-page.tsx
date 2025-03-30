import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/use-auth";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, MessageSquare, Activity, AtSign, Mail, User, MapPin, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ForumPost, Event, ContestResult } from "@shared/schema";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface UserStats {
  totalScore: number;
  contestCount: number;
  rank: number;
  bestRank: number;
  topProblem: string;
}

export default function ProfilePage() {
  const { user } = useAuth();

  const { data: userStats, isLoading: isLoadingStats } = useQuery<UserStats>({
    queryKey: ["/api/leaderboard"],
    select: (data) => {
      const userRank = data.findIndex((item) => item.id === user?.id);
      const userData = data.find((item) => item.id === user?.id);
      
      return {
        totalScore: userData?.score || 0,
        contestCount: userData?.contestCount || 0,
        rank: userRank !== -1 ? userRank + 1 : 0,
        bestRank: userRank !== -1 ? userRank + 1 : 0, // For now, same as current rank
        topProblem: userData?.topProblem || "N/A",
      };
    },
    enabled: !!user,
  });

  const { data: userPosts, isLoading: isLoadingPosts } = useQuery<ForumPost[]>({
    queryKey: ["/api/forum"],
    select: (data) => {
      return data.filter((post) => post.userId === user?.id);
    },
    enabled: !!user,
  });

  const { data: userEvents, isLoading: isLoadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-12 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center">
                <User className="h-24 w-24 text-slate-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Please sign in to view your profile
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{user.displayName} | DSAC Profile</title>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-12 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile card */}
              <div className="md:col-span-1">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center mb-6">
                      <UserAvatar user={user} className="h-24 w-24 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold">{user.displayName}</h2>
                      <p className="text-slate-600 dark:text-slate-400 capitalize">
                        {user.level} Member
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <AtSign className="h-5 w-5 text-slate-500 mr-3" />
                        <span>{user.username}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-slate-500 mr-3" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-slate-500 mr-3" />
                        <span>Joined {format(new Date(user.createdAt), 'MMMM yyyy')}</span>
                      </div>
                      {user.bio && (
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 mt-3">
                          <FileText className="h-5 w-5 text-slate-500 mb-2" />
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {user.bio}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Stats card */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                        <Activity className="h-5 w-5 text-primary mx-auto mb-1" />
                        <p className="text-xs text-slate-500 dark:text-slate-400">Rank</p>
                        {isLoadingStats ? (
                          <Skeleton className="h-6 w-12 mx-auto mt-1" />
                        ) : (
                          <p className="font-bold">#{userStats?.rank || "N/A"}</p>
                        )}
                      </div>
                      <div className="text-center bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                        <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                        <p className="text-xs text-slate-500 dark:text-slate-400">Score</p>
                        {isLoadingStats ? (
                          <Skeleton className="h-6 w-12 mx-auto mt-1" />
                        ) : (
                          <p className="font-bold">{userStats?.totalScore || 0}</p>
                        )}
                      </div>
                      <div className="text-center bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                        <Calendar className="h-5 w-5 text-green-500 mx-auto mb-1" />
                        <p className="text-xs text-slate-500 dark:text-slate-400">Contests</p>
                        {isLoadingStats ? (
                          <Skeleton className="h-6 w-12 mx-auto mt-1" />
                        ) : (
                          <p className="font-bold">{userStats?.contestCount || 0}</p>
                        )}
                      </div>
                      <div className="text-center bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                        <MessageSquare className="h-5 w-5 text-accent mx-auto mb-1" />
                        <p className="text-xs text-slate-500 dark:text-slate-400">Posts</p>
                        {isLoadingPosts ? (
                          <Skeleton className="h-6 w-12 mx-auto mt-1" />
                        ) : (
                          <p className="font-bold">{userPosts?.length || 0}</p>
                        )}
                      </div>
                    </div>

                    {!isLoadingStats && userStats?.topProblem && userStats.topProblem !== "N/A" && (
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                          Top Problem Area
                        </p>
                        <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-0">
                          {userStats.topProblem}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Activity tabs */}
              <div className="md:col-span-2">
                <Card>
                  <CardContent className="p-0">
                    <Tabs defaultValue="posts" className="w-full">
                      <TabsList className="w-full justify-start rounded-none border-b border-slate-200 dark:border-slate-700 px-4">
                        <TabsTrigger
                          value="posts"
                          className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                        >
                          Forum Posts
                        </TabsTrigger>
                        <TabsTrigger
                          value="events"
                          className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                        >
                          Events
                        </TabsTrigger>
                        <TabsTrigger
                          value="achievements"
                          className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                        >
                          Achievements
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="posts" className="p-4">
                        {isLoadingPosts ? (
                          Array(3)
                            .fill(0)
                            .map((_, i) => (
                              <div
                                key={i}
                                className="flex items-start space-x-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700 last:mb-0 last:pb-0 last:border-0"
                              >
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                  <Skeleton className="h-5 w-3/4" />
                                  <Skeleton className="h-4 w-1/2" />
                                  <Skeleton className="h-4 w-full" />
                                </div>
                              </div>
                            ))
                        ) : userPosts && userPosts.length > 0 ? (
                          userPosts.map((post) => (
                            <div
                              key={post.id}
                              className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700 last:mb-0 last:pb-0 last:border-0"
                            >
                              <h3 className="font-semibold text-lg mb-1">
                                {post.title}
                              </h3>
                              <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                {format(new Date(post.createdAt), "MMM d, yyyy")}
                                {post.tags && post.tags.length > 0 && (
                                  <span className="ml-2">
                                    •{" "}
                                    {post.tags.map((tag, index) => (
                                      <span
                                        key={index}
                                        className="inline-block text-primary"
                                      >
                                        #{tag}{index < post.tags!.length - 1 ? ", " : ""}
                                      </span>
                                    ))}
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 line-clamp-2 text-sm">
                                {post.content}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="font-medium mb-1">No forum posts yet</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                              This user hasn't created any forum posts
                            </p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="events" className="p-4">
                        {isLoadingEvents ? (
                          Array(3)
                            .fill(0)
                            .map((_, i) => (
                              <div
                                key={i}
                                className="flex items-start space-x-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700 last:mb-0 last:pb-0 last:border-0"
                              >
                                <Skeleton className="h-10 w-10 rounded" />
                                <div className="flex-1 space-y-2">
                                  <Skeleton className="h-5 w-3/4" />
                                  <Skeleton className="h-4 w-1/2" />
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="text-center py-8">
                            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="font-medium mb-1">Coming Soon</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                              Event history will be available soon
                            </p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="achievements" className="p-4">
                        {isLoadingStats ? (
                          Array(3)
                            .fill(0)
                            .map((_, i) => (
                              <div
                                key={i}
                                className="flex items-start space-x-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700 last:mb-0 last:pb-0 last:border-0"
                              >
                                <Skeleton className="h-10 w-10 rounded" />
                                <div className="flex-1 space-y-2">
                                  <Skeleton className="h-5 w-3/4" />
                                  <Skeleton className="h-4 w-1/2" />
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="text-center py-8">
                            <Trophy className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="font-medium mb-1">Coming Soon</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                              Achievements and badges will be available soon
                            </p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
