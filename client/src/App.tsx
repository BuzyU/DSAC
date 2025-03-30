import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import LeaderboardPage from "@/pages/leaderboard-page";
import EventsPage from "@/pages/events-page";
import ForumPage from "@/pages/forum-page";
import ResourcesPage from "@/pages/resources-page";
import DashboardPage from "@/pages/dashboard-page";
import ProfilePage from "@/pages/profile-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/leaderboard" component={LeaderboardPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/forum" component={ForumPage} />
      <Route path="/resources" component={ResourcesPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
