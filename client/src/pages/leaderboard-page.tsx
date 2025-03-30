import { Helmet } from "react-helmet";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";

export default function LeaderboardPage() {
  return (
    <>
      <Helmet>
        <title>Leaderboard | DSAC - Data Structure & Algorithm Club</title>
        <meta name="description" content="View rankings of DSAC members based on their performance in coding contests and contributions." />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-12 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <LeaderboardTable />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
