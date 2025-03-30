import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronUp, ChevronDown } from "lucide-react";

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

export function LeaderboardTable() {
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data: leaderboard, isLoading } = useQuery<LeaderboardUser[]>({
    queryKey: ["/api/leaderboard"],
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Filter the leaderboard based on the selected filter
  const filteredLeaderboard = leaderboard
    ? leaderboard.filter((user) => {
        if (filter === "all") return true;
        return user.level === filter.toLowerCase();
      })
    : [];

  // Sort the leaderboard based on the selected sort
  const sortedLeaderboard = [...filteredLeaderboard].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "score") {
      comparison = a.score - b.score;
    } else if (sortBy === "contests") {
      comparison = a.contestCount - b.contestCount;
    } else if (sortBy === "name") {
      comparison = a.displayName.localeCompare(b.displayName);
    }
    return sortOrder === "desc" ? -comparison : comparison;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h2 className="text-2xl font-bold mb-1">Club Leaderboard</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Rankings based on contest performance and contributions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="w-full sm:w-auto">
            <Select
              value={filter}
              onValueChange={(value) => setFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-auto">
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Total Score</SelectItem>
                <SelectItem value="contests">Contest Count</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Leaderboard header */}
      <div className="hidden md:flex p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-semibold">
        <div className="w-16 text-center">#</div>
        <div className="flex-1">Member</div>
        <div className="w-24 text-center cursor-pointer flex justify-center items-center" onClick={toggleSortOrder}>
          Score
          {sortBy === "score" && (
            sortOrder === "desc" ? <ChevronDown className="ml-1 h-4 w-4" /> : <ChevronUp className="ml-1 h-4 w-4" />
          )}
        </div>
        <div className="w-24 text-center cursor-pointer flex justify-center items-center" onClick={toggleSortOrder}>
          Contests
          {sortBy === "contests" && (
            sortOrder === "desc" ? <ChevronDown className="ml-1 h-4 w-4" /> : <ChevronUp className="ml-1 h-4 w-4" />
          )}
        </div>
        <div className="w-32 text-center">Top Problem</div>
      </div>

      {/* Leaderboard content */}
      <div>
        {isLoading ? (
          // Loading state
          Array(10)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row items-start md:items-center p-4 border-b border-slate-200 dark:border-slate-700"
              >
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
        ) : sortedLeaderboard.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            No results found for the selected filter.
          </div>
        ) : (
          sortedLeaderboard.map((user, index) => (
            <div
              key={user.id}
              className="flex flex-col md:flex-row items-start md:items-center p-4 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div
                className={`w-full md:w-16 text-center md:text-xl font-bold flex md:block items-center mb-2 md:mb-0 
                ${index === 0 ? "text-yellow-500" : ""}
                ${index === 1 ? "text-slate-400" : ""}
                ${index === 2 ? "text-amber-700" : ""}
                ${index > 2 ? "text-slate-700 dark:text-slate-300" : ""}`}
              >
                <div
                  className={`
                  ${index === 0 ? "bg-yellow-100 dark:bg-yellow-900/30" : ""}
                  ${index === 1 ? "bg-slate-100 dark:bg-slate-700" : ""}
                  ${index === 2 ? "bg-amber-100 dark:bg-amber-900/30" : ""}
                  ${
                    index > 2 ? "bg-slate-100 dark:bg-slate-700" : ""
                  }
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
                <Link href={`/profile/${user.id}`}>
                  <a className="flex items-center hover:text-primary">
                    <UserAvatar user={user} className="w-10 h-10 mr-3" />
                    <div>
                      <div className="font-medium">{user.displayName}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {user.level.charAt(0).toUpperCase() + user.level.slice(1)} • {Math.floor(Math.random() * 5) + 1} month streak
                      </div>
                    </div>
                  </a>
                </Link>
                <div className="ml-auto md:hidden">
                  <Badge
                    variant="outline"
                    className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-0"
                  >
                    {user.contestCount} contests
                  </Badge>
                </div>
              </div>
              <div className="w-24 text-center hidden md:block">
                <span className="font-semibold text-lg">{user.score}</span>
              </div>
              <div className="w-24 text-center hidden md:block">
                <Badge
                  variant="outline"
                  className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-0"
                >
                  {user.contestCount}
                </Badge>
              </div>
              <div className="w-32 text-center hidden md:block">
                <Badge
                  variant="outline"
                  className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-0"
                >
                  {user.topProblem}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
