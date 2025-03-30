import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface LeaderboardUser {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
  level: string;
  score: number;
  contestCount: number;
  topProblem: string;
}

export function LeaderboardPreview() {
  const { data: leaderboard, isLoading } = useQuery<LeaderboardUser[]>({
    queryKey: ["/api/leaderboard"],
  });

  return (
    <section className="py-12 md:py-16 bg-slate-50 dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Leaderboard</h2>
          <Link href="/leaderboard">
            <a className="text-primary hover:underline font-medium">
              View full leaderboard →
            </a>
          </Link>
        </div>

        {/* Leaderboard header */}
        <div className="bg-white dark:bg-slate-900 rounded-t-lg shadow-sm p-4 border-b border-slate-200 dark:border-slate-700 hidden md:flex">
          <div className="w-16 text-center font-semibold text-slate-700 dark:text-slate-300">
            #
          </div>
          <div className="flex-1 font-semibold text-slate-700 dark:text-slate-300">
            Member
          </div>
          <div className="w-24 text-center font-semibold text-slate-700 dark:text-slate-300">
            Score
          </div>
          <div className="w-24 text-center font-semibold text-slate-700 dark:text-slate-300">
            Contests
          </div>
          <div className="w-32 text-center font-semibold text-slate-700 dark:text-slate-300">
            Top Problem
          </div>
        </div>

        {/* Leaderboard content */}
        <div className="bg-white dark:bg-slate-900 rounded-lg md:rounded-t-none shadow-sm">
          {isLoading ? (
            // Loading state
            Array(4)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="flex flex-col md:flex-row items-start md:items-center p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="w-full md:w-16 text-center mb-2 md:mb-0">
                    <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                  </div>
                  <div className="flex-1 flex items-center">
                    <Skeleton className="h-10 w-10 rounded-full mr-3" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <div className="w-24 text-center hidden md:block">
                    <Skeleton className="h-6 w-16 mx-auto" />
                  </div>
                  <div className="w-24 text-center hidden md:block">
                    <Skeleton className="h-6 w-12 mx-auto" />
                  </div>
                  <div className="w-32 text-center hidden md:block">
                    <Skeleton className="h-6 w-20 mx-auto" />
                  </div>
                </div>
              ))
          ) : (
            leaderboard?.slice(0, 4).map((user, index) => (
              <div
                key={user.id}
                className="flex flex-col md:flex-row items-start md:items-center p-4 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className={`w-full md:w-16 text-center md:text-xl font-bold flex md:block items-center mb-2 md:mb-0 
                  ${index === 0 ? "text-yellow-500" : ""}
                  ${index === 1 ? "text-slate-400" : ""}
                  ${index === 2 ? "text-amber-700" : ""}
                  ${index > 2 ? "text-slate-700 dark:text-slate-300" : ""}`}
                >
                  <div className={`
                    ${index === 0 ? "bg-yellow-100 dark:bg-yellow-900/30" : ""}
                    ${index === 1 ? "bg-slate-100 dark:bg-slate-700" : ""}
                    ${index === 2 ? "bg-amber-100 dark:bg-amber-900/30" : ""}
                    ${index > 2 ? "bg-slate-100 dark:bg-slate-700" : ""}
                    w-8 h-8 flex items-center justify-center rounded-full mr-2 md:hidden`}
                  >
                    {index + 1}
                  </div>
                  <div className="hidden md:block">{index + 1}</div>
                  <span className="md:hidden text-slate-600 dark:text-slate-300 font-normal ml-2">
                    Score: {user.score}
                  </span>
                </div>
                <div className="flex-1 flex items-center">
                  <UserAvatar user={user} className="w-10 h-10 mr-3" />
                  <div>
                    <div className="font-medium">{user.displayName}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {user.level.charAt(0).toUpperCase() + user.level.slice(1)} • {Math.floor(Math.random() * 5) + 1} month streak
                    </div>
                  </div>
                  <div className="ml-auto md:hidden">
                    <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-0">
                      {user.contestCount} contests
                    </Badge>
                  </div>
                </div>
                <div className="w-24 text-center hidden md:block">
                  <span className="font-semibold text-lg">{user.score}</span>
                </div>
                <div className="w-24 text-center hidden md:block">
                  <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-0">
                    {user.contestCount}
                  </Badge>
                </div>
                <div className="w-32 text-center hidden md:block">
                  <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-0">
                    {user.topProblem}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
