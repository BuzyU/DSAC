import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-primary to-accent dark:from-slate-800 dark:to-slate-900 text-white py-16 md:py-24">
      <div className="absolute inset-0 bg-grid-slate-900/[0.05] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Data Structure & Algorithm Club
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Enhance your problem-solving skills, prepare for technical
              interviews, and connect with fellow coders.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-slate-100 transition-colors"
                asChild
              >
                <Link href="/auth">Join the Club</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10"
                asChild
              >
                <Link href="/events">Browse Events</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            {/* Code illustration */}
            <div className="bg-slate-900 rounded-lg shadow-lg p-4 max-w-md w-full font-mono text-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-slate-400 text-xs">algorithm.py</div>
              </div>
              <div className="text-green-400">
                <span className="text-blue-400">def</span>{" "}
                <span className="text-yellow-400">quick_sort</span>(arr):
              </div>
              <div className="pl-4 text-slate-300">
                <span className="text-purple-400">if</span> len(arr) &lt;= 1:
              </div>
              <div className="pl-8 text-slate-300">
                <span className="text-purple-400">return</span> arr
              </div>
              <div className="pl-4 text-slate-300">
                pivot = arr[len(arr) // 2]
              </div>
              <div className="pl-4 text-slate-300">
                left = [x{" "}
                <span className="text-purple-400">for</span> x{" "}
                <span className="text-purple-400">in</span> arr{" "}
                <span className="text-purple-400">if</span> x &lt; pivot]
              </div>
              <div className="pl-4 text-slate-300">
                middle = [x{" "}
                <span className="text-purple-400">for</span> x{" "}
                <span className="text-purple-400">in</span> arr{" "}
                <span className="text-purple-400">if</span> x == pivot]
              </div>
              <div className="pl-4 text-slate-300">
                right = [x{" "}
                <span className="text-purple-400">for</span> x{" "}
                <span className="text-purple-400">in</span> arr{" "}
                <span className="text-purple-400">if</span> x &gt; pivot]
              </div>
              <div className="pl-4 text-slate-300">
                <span className="text-purple-400">return</span> quick_sort(left)
                + middle + quick_sort(right)
              </div>
              <div className="mt-4 text-green-400">
                <span className="text-blue-400">def</span>{" "}
                <span className="text-yellow-400">main</span>():
              </div>
              <div className="pl-4 text-slate-300">
                data = [8, 5, 2, 9, 1, 6, 3]
              </div>
              <div className="pl-4 text-slate-300">
                <span className="text-red-400">print</span>(
                <span className="text-yellow-400">quick_sort</span>(data))
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
