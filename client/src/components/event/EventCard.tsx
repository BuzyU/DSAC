import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Event } from "@shared/schema";
import { format } from "date-fns";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRegistered, setIsRegistered] = useState(false);

  // Format duration for display
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} minutes`;
    if (mins === 0) return `${hours} hours`;
    return `${hours}.${mins} hours`;
  };

  // Get gradient class based on event type
  const getGradientClass = () => {
    switch (event.eventType) {
      case "contest":
        return "bg-gradient-to-r from-blue-500 to-indigo-600";
      case "workshop":
        if (event.title.toLowerCase().includes("beginner")) {
          return "bg-gradient-to-r from-emerald-500 to-teal-600";
        }
        return "bg-gradient-to-r from-purple-500 to-pink-600";
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-600";
    }
  };

  // Get badge based on event type
  const getEventTypeBadge = () => {
    switch (event.eventType) {
      case "contest":
        return (
          <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100">
            Contest
          </Badge>
        );
      case "workshop":
        return (
          <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-100">
            Workshop
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 hover:bg-slate-100">
            Event
          </Badge>
        );
    }
  };

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/events/${event.id}/register`);
      return await res.json();
    },
    onSuccess: () => {
      setIsRegistered(true);
      toast({
        title: "Registration successful",
        description: `You are now registered for ${event.title}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRegister = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to register for events",
        variant: "destructive",
      });
      return;
    }
    
    registerMutation.mutate();
  };

  return (
    <Card className="bg-slate-50 dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
      <div className={`h-40 ${getGradientClass()} relative`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-2xl font-bold">{event.title}</div>
            <div className="mt-2 flex items-center justify-center">
              <Calendar className="h-5 w-5 mr-1" />
              <span>{format(new Date(event.date), "EEE, MMM d, yyyy")}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          {getEventTypeBadge()}
          <Badge
            variant="secondary"
            className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100"
          >
            <Clock className="h-3 w-3 mr-1" />
            {formatDuration(event.duration)}
          </Badge>
        </div>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          {event.description}
        </p>
        <div className="flex justify-between items-center">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{event.location}</span>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleRegister}
            disabled={isRegistered || registerMutation.isPending}
          >
            {registerMutation.isPending
              ? "Registering..."
              : isRegistered
              ? "Registered"
              : "Register"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
