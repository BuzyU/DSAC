import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function CallToAction() {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-primary/90 to-accent/90 dark:from-slate-800 dark:to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Level Up Your Coding Skills?
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join our community of passionate coders, participate in regular
          contests, and climb the leaderboard as you master data structures and
          algorithms.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-slate-100"
            asChild
          >
            <Link href="/auth">Join Now</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-transparent border-2 border-white text-white hover:bg-white/10"
            asChild
          >
            <Link href="/events">Learn More</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
