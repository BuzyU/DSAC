import { Link } from "wouter";
import { Github, Linkedin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About DSAC</h3>
            <p className="text-slate-300 text-sm mb-4">
              The Data Structure & Algorithm Club is a community dedicated to
              helping members master DSA concepts through collaborative learning
              and practice.
            </p>
            <div className="flex space-x-4">
              <Link href="https://github.com">
                <a className="text-slate-300 hover:text-white">
                  <span className="sr-only">GitHub</span>
                  <Github className="h-6 w-6" />
                </a>
              </Link>
              <Link href="https://discord.com">
                <a className="text-slate-300 hover:text-white">
                  <span className="sr-only">Discord</span>
                  <MessageCircle className="h-6 w-6" />
                </a>
              </Link>
              <Link href="https://linkedin.com">
                <a className="text-slate-300 hover:text-white">
                  <span className="sr-only">LinkedIn</span>
                  <Linkedin className="h-6 w-6" />
                </a>
              </Link>
            </div>
          </div>

          {/* Column 2: Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-slate-300">
              <li>
                <Link href="/">
                  <a className="hover:text-white">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/events">
                  <a className="hover:text-white">Events</a>
                </Link>
              </li>
              <li>
                <Link href="/leaderboard">
                  <a className="hover:text-white">Leaderboard</a>
                </Link>
              </li>
              <li>
                <Link href="/forum">
                  <a className="hover:text-white">Forum</a>
                </Link>
              </li>
              <li>
                <Link href="/resources">
                  <a className="hover:text-white">Resources</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-slate-300">
              <li>
                <Link href="/resources">
                  <a className="hover:text-white">Beginners Guide</a>
                </Link>
              </li>
              <li>
                <Link href="/resources">
                  <a className="hover:text-white">Interview Prep</a>
                </Link>
              </li>
              <li>
                <Link href="/resources">
                  <a className="hover:text-white">Problem Sets</a>
                </Link>
              </li>
              <li>
                <Link href="/resources">
                  <a className="hover:text-white">Video Tutorials</a>
                </Link>
              </li>
              <li>
                <Link href="/resources">
                  <a className="hover:text-white">Community Code</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-slate-300 text-sm mb-4">
              Subscribe to our newsletter for the latest events and resources.
            </p>
            <form className="flex flex-col space-y-2">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-slate-800 border border-slate-700 text-white focus:ring-primary"
              />
              <Button type="submit" className="w-full">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Data Structure & Algorithm Club. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
