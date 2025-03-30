import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { EventCard } from "@/components/event/EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Event } from "@shared/schema";

export function UpcomingEvents() {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Get upcoming events (filter out past events)
  const upcomingEvents = events?.filter(
    (event) => new Date(event.date) > new Date()
  );

  return (
    <section className="py-12 md:py-16 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Upcoming Events</h2>
          <Link href="/events">
            <a className="text-primary hover:underline font-medium">
              View all events →
            </a>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array(3)
                .fill(0)
                .map((_, index) => (
                  <Card key={index} className="bg-slate-50 dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
                    <Skeleton className="h-40 w-full" />
                    <div className="p-5">
                      <div className="flex justify-between items-center mb-4">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </div>
                  </Card>
                ))
            : upcomingEvents?.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
        </div>
      </div>
    </section>
  );
}
