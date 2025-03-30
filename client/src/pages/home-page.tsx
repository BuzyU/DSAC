import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { LeaderboardPreview } from "@/components/home/LeaderboardPreview";
import { UpcomingEvents } from "@/components/home/UpcomingEvents";
import { RecentDiscussions } from "@/components/home/RecentDiscussions";
import { Resources } from "@/components/home/Resources";
import { CallToAction } from "@/components/home/CallToAction";
import { Helmet } from "react-helmet";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>DSAC - Data Structure & Algorithm Club</title>
        <meta name="description" content="The Data Structure & Algorithm Club is a community dedicated to helping members master DSA concepts through collaborative learning and practice." />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Hero />
          <Features />
          <LeaderboardPreview />
          <UpcomingEvents />
          <RecentDiscussions />
          <Resources />
          <CallToAction />
        </main>
        <Footer />
      </div>
    </>
  );
}
