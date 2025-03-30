import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ResourceCard } from "@/components/ui/resource-card";
import { Resource } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function Resources() {
  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  return (
    <section className="py-12 md:py-16 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Learning Resources</h2>
          <Link href="/resources">
            <a className="text-primary hover:underline font-medium">
              Browse all resources →
            </a>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array(4)
                .fill(0)
                .map((_, index) => (
                  <Card key={index} className="bg-slate-50 dark:bg-slate-800 p-5 rounded-lg shadow-sm">
                    <Skeleton className="w-10 h-10 rounded-lg mb-4" />
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </Card>
                ))
            : resources?.slice(0, 4).map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
        </div>
      </div>
    </section>
  );
}
