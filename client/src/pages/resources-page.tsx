import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ResourceCard } from "@/components/ui/resource-card";
import { Resource } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Book, Search } from "lucide-react";

export default function ResourcesPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  // Filter and search resources
  const filteredResources = resources
    ? resources.filter((resource) => {
        // Search filter
        const matchesSearch =
          searchQuery === "" ||
          resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.description.toLowerCase().includes(searchQuery.toLowerCase());

        // Tab filter
        if (filter === "all") return matchesSearch;
        return matchesSearch && resource.resourceType === filter;
      })
    : [];

  const resourceTypeCount = resources
    ? {
        guide: resources.filter((r) => r.resourceType === "guide").length,
        video: resources.filter((r) => r.resourceType === "video").length,
        practice: resources.filter((r) => r.resourceType === "practice").length,
        career: resources.filter((r) => r.resourceType === "career").length,
      }
    : { guide: 0, video: 0, practice: 0, career: 0 };

  return (
    <>
      <Helmet>
        <title>Resources | DSAC - Data Structure & Algorithm Club</title>
        <meta name="description" content="Educational resources for learning data structures and algorithms, including guides, video tutorials, practice problems, and interview preparation." />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-12 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Learning Resources</h1>
              <p className="text-slate-600 dark:text-slate-400">
                Explore guides, tutorials, and practice materials to improve your
                DSA skills
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search resources..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="md:col-span-1">
                <Tabs
                  defaultValue="all"
                  value={filter}
                  onValueChange={setFilter}
                >
                  <TabsList className="w-full grid grid-cols-5">
                    <TabsTrigger value="all">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="guide">
                      Guides ({resourceTypeCount.guide})
                    </TabsTrigger>
                    <TabsTrigger value="video">
                      Videos ({resourceTypeCount.video})
                    </TabsTrigger>
                    <TabsTrigger value="practice">
                      Practice ({resourceTypeCount.practice})
                    </TabsTrigger>
                    <TabsTrigger value="career">
                      Career ({resourceTypeCount.career})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array(8)
                  .fill(0)
                  .map((_, index) => (
                    <Card
                      key={index}
                      className="bg-slate-50 dark:bg-slate-800 p-5 rounded-lg shadow-sm"
                    >
                      <Skeleton className="w-10 h-10 rounded-lg mb-4" />
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </Card>
                  ))}
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-8 text-center shadow-sm">
                <Book className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No resources found</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {searchQuery
                    ? `No results found for "${searchQuery}"`
                    : "There are no resources in this category yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
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
