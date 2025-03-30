import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Event } from "@shared/schema";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EventCard } from "@/components/event/EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function EventsPage() {
  const [filter, setFilter] = useState<string>("all");
  
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Helper function to check if an event is upcoming
  const isUpcoming = (event: Event) => {
    return new Date(event.date) > new Date();
  };

  // Helper function to check if an event is past
  const isPast = (event: Event) => {
    return new Date(event.date) < new Date();
  };

  // Filter and sort events based on the current tab and date
  const filteredEvents = events
    ? events
        .filter((event) => {
          if (filter === "all") return true;
          if (filter === "upcoming") return isUpcoming(event);
          if (filter === "past") return isPast(event);
          if (filter === "contest") return event.eventType === "contest";
          if (filter === "workshop") return event.eventType === "workshop";
          return true;
        })
        .sort((a, b) => {
          if (filter === "past") {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          }
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        })
    : [];

  // Group events by month for better organization
  const groupEventsByMonth = (events: Event[]) => {
    const grouped: Record<string, Event[]> = {};
    
    events.forEach(event => {
      const monthKey = format(new Date(event.date), 'MMMM yyyy');
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(event);
    });
    
    return grouped;
  };

  const groupedEvents = groupEventsByMonth(filteredEvents);

  return (
    <>
      <Helmet>
        <title>Events | DSAC - Data Structure & Algorithm Club</title>
        <meta name="description" content="Browse and register for upcoming coding contests, workshops, and meetups organized by the Data Structure & Algorithm Club." />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-12 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Events</h1>
              <p className="text-slate-600 dark:text-slate-400">
                Browse upcoming coding contests, workshops, and meetups organized by DSAC
              </p>
            </div>

            <Tabs 
              defaultValue="all" 
              value={filter}
              onValueChange={setFilter}
              className="mb-8"
            >
              <TabsList className="w-full md:w-auto grid grid-cols-2 md:flex md:flex-row md:space-x-1">
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past Events</TabsTrigger>
                <TabsTrigger value="contest">Contests</TabsTrigger>
                <TabsTrigger value="workshop">Workshops</TabsTrigger>
              </TabsList>
            </Tabs>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <Card
                      key={index}
                      className="bg-slate-50 dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden"
                    >
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
                  ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-8 text-center shadow-sm">
                <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No events found</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {filter === "all"
                    ? "There are no events scheduled at the moment."
                    : filter === "upcoming"
                    ? "There are no upcoming events scheduled at the moment."
                    : filter === "past"
                    ? "No past events to display."
                    : `No ${filter} events found.`}
                </p>
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(groupedEvents).map(([month, monthEvents]) => (
                  <div key={month}>
                    <h2 className="text-2xl font-semibold mb-6 border-b border-slate-200 dark:border-slate-700 pb-2">
                      {month}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {monthEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
