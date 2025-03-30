import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/events", label: "Events" },
    { path: "/leaderboard", label: "Leaderboard" },
    { path: "/forum", label: "Forum" },
    { path: "/resources", label: "Resources" },
  ];

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-md dark:shadow-slate-700/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-white font-bold">
                    DS
                  </div>
                  <span className="hidden md:block font-bold text-xl">DSAC</span>
                </div>
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                {navItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <a
                      className={`px-3 py-2 rounded-md ${
                        location === item.path
                          ? "text-primary font-medium"
                          : "text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary"
                      }`}
                    >
                      {item.label}
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {user ? (
              <div className="relative ml-3 flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0 h-8 w-8 rounded-full">
                      <UserAvatar
                        user={user}
                        className="h-8 w-8"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.displayName}</p>
                        <p className="text-sm text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button asChild size="sm">
                <Link href="/auth">Sign In</Link>
              </Button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location === item.path
                      ? "text-white bg-primary"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              </Link>
            ))}
            {user && (
              <Link href="/dashboard">
                <a
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </a>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
