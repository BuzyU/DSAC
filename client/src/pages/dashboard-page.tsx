import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/use-auth";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Award, Calendar, MessageSquare, Book, BadgeCheck, TrendingUp, Clock } from "lucide-react";
import { Link } from "wouter";
import { Event, ContestResult, ForumPost } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { EventCard } from "@/components/event/EventCard";
import { format } from "date-fns";

interface ForumPostWithReplies extends ForumPost {
  repliesCount: number;
}

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: myEvents, isLoading: isLoadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useQuery<any[]>({
    queryKey: ["/api/leaderboard"],
  });

  const { data: forumPosts, isLoading: isLoadingPosts } = useQuery<ForumPostWithReplies[]>({
    queryKey: ["/api/forum"],
  });

  // Filter events to show only those the user has registered for
  const registeredEvents = myEvents?.filter(event => 
    new Date(event.date) > new Date()
  ).slice(0, 2) || [];
  
  // Get user ranking from leaderboard
  const userRanking = leaderboardData?.findIndex(item => item.id === user?.id) ?? -1;
  const userScore = leaderboardData?.find(item => item.id === user?.id)?.score ?? 0;
  
  // Get user posts
  const userPosts = forumPosts?.filter(post => post.userId === user?.id).slice(0, 3) || [];

  return (
    <>
      <Helmet>
        <title>Dashboard | DSAC - Data Structure & Algorithm Club</title>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-12 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {user && (
              <>
                {/* User welcome section */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center">
                    <UserAvatar user={user} className="h-16 w-16 mr-4" />
                    <div>
                      <h1 className="text-3xl font-bold">Welcome, {user.displayName}</h1>
                      <p className="text-slate-600 dark:text-slate-400">
                        {user.level.charAt(0).toUpperCase() + user.level.slice(1)} member • @{user.username}
                      </p>
                    </div>
                  </div>
                  <Button asChild>
                    <Link href="/profile">View Profile</Link>
                  </Button>
                </div>

                {/* Stats overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Current Rank
                          </p>
                          {isLoadingLeaderboard ? (
                            <Skeleton className="h-9 w-16 mt-1" />
                          ) : (
                            <h3 className="text-2xl font-bold">
                              {userRanking !== -1 ? `#${userRanking + 1}` : "N/A"}
                            </h3>
                          )}
                        </div>
                        <TrendingUp className="text-primary h-8 w-8" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Total Score
                          </p>
                          {isLoadingLeaderboard ? (
                            <Skeleton className="h-9 w-16 mt-1" />
                          ) : (
                            <h3 className="text-2xl font-bold">{userScore}</h3>
                          )}
                        </div>
                        <Award className="text-yellow-500 h-8 w-8" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Posts
                          </p>
                          {isLoadingPosts ? (
                            <Skeleton className="h-9 w-16 mt-1" />
                          ) : (
                            <h3 className="text-2xl font-bold">{userPosts.length}</h3>
                          )}
                        </div>
                        <MessageSquare className="text-accent h-8 w-8" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Level
                          </p>
                          <h3 className="text-2xl font-bold capitalize">
                            {user.level}
                          </h3>
                        </div>
                        <BadgeCheck className="text-secondary h-8 w-8" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Main content */}
                <Tabs defaultValue="activity">
                  <TabsList>
                    <TabsTrigger value="activity">
                      <Activity className="h-4 w-4 mr-2" />
                      Activity
                    </TabsTrigger>
                    <TabsTrigger value="events">
                      <Calendar className="h-4 w-4 mr-2" />
                      My Events
                    </TabsTrigger>
                    <TabsTrigger value="resources">
                      <Book className="h-4 w-4 mr-2" />
                      Recommended
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="activity" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Recent activity */}
                      <div className="md:col-span-2">
                        <Card>
                          <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                              Your recent participation and contributions
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {isLoadingLeaderboard || isLoadingPosts ? (
                              Array(3).fill(0).map((_, i) => (
                                <div key={i} className="flex items-start space-x-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700 last:mb-0 last:pb-0 last:border-0">
                                  <Skeleton className="h-10 w-10 rounded-full" />
                                  <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                  </div>
                                </div>
                              ))
                            ) : userPosts.length === 0 ? (
                              <div className="text-center py-6">
                                <MessageSquare className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                                <p className="text-slate-600 dark:text-slate-400">
                                  You haven't posted anything yet
                                </p>
                                <Button variant="outline" className="mt-4" asChild>
                                  <Link href="/forum">Go to Forum</Link>
                                </Button>
                              </div>
                            ) : (
                              userPosts.map(post => (
                                <div key={post.id} className="flex items-start space-x-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700 last:mb-0 last:pb-0 last:border-0">
                                  <div className="bg-primary/10 rounded-full p-2">
                                    <MessageSquare className="h-6 w-6 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <Link href={`/forum/${post.id}`}>
                                      <a className="font-medium hover:text-primary">
                                        {post.title}
                                      </a>
                                    </Link>
                                    <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center mt-1">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {format(new Date(post.createdAt), 'MMM d, yyyy')}
                                      <span className="mx-2">•</span>
                                      <MessageSquare className="h-3 w-3 mr-1" />
                                      {post.repliesCount} replies
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Upcoming contests */}
                      <div className="md:col-span-1">
                        <Card>
                          <CardHeader>
                            <CardTitle>Upcoming Events</CardTitle>
                            <CardDescription>
                              Events you're registered for
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {isLoadingEvents ? (
                              Array(2).fill(0).map((_, i) => (
                                <div key={i} className="mb-4 last:mb-0">
                                  <Skeleton className="h-24 w-full mb-2" />
                                  <Skeleton className="h-4 w-3/4 mb-1" />
                                  <Skeleton className="h-4 w-1/2" />
                                </div>
                              ))
                            ) : registeredEvents.length === 0 ? (
                              <div className="text-center py-6">
                                <Calendar className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                                <p className="text-slate-600 dark:text-slate-400">
                                  No upcoming events
                                </p>
                                <Button variant="outline" className="mt-4" asChild>
                                  <Link href="/events">Browse Events</Link>
                                </Button>
                              </div>
                            ) : (
                              registeredEvents.map(event => (
                                <div key={event.id} className="mb-4 last:mb-0">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                      event.eventType === 'contest' 
                                        ? 'bg-blue-500' 
                                        : 'bg-purple-500'
                                    }`} />
                                    <Link href={`/events/${event.id}`}>
                                      <a className="font-medium hover:text-primary">
                                        {event.title}
                                      </a>
                                    </Link>
                                  </div>
                                  <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center ml-5">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {format(new Date(event.date), 'MMM d, yyyy p')}
                                  </div>
                                </div>
                              ))
                            )}

                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                              <Button variant="outline" className="w-full" asChild>
                                <Link href="/events">View All Events</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="events" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>My Events</CardTitle>
                        <CardDescription>
                          Events you're registered for and your past participations
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingEvents ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Array(4)
                              .fill(0)
                              .map((_, index) => (
                                <Skeleton key={index} className="h-48 w-full" />
                              ))}
                          </div>
                        ) : registeredEvents.length === 0 ? (
                          <div className="text-center py-12">
                            <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No events found</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                              You haven't registered for any upcoming events yet.
                            </p>
                            <Button asChild>
                              <Link href="/events">Browse Events</Link>
                            </Button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {registeredEvents.map((event) => (
                              <EventCard key={event.id} event={event} />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="resources" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recommended Resources</CardTitle>
                        <CardDescription>
                          Curated learning materials based on your level
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-12">
                          <Book className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                          <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Personalized resource recommendations will be available soon.
                          </p>
                          <Button asChild>
                            <Link href="/resources">Browse All Resources</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
