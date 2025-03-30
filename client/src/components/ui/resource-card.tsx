import { Card, CardContent } from "@/components/ui/card";
import { Book, Video, FileText, Briefcase } from "lucide-react";
import { Resource } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  // Get icon based on resource type
  const getIcon = () => {
    switch (resource.resourceType) {
      case "guide":
        return <Book className="h-6 w-6 text-primary" />;
      case "video":
        return <Video className="h-6 w-6 text-accent" />;
      case "practice":
        return <FileText className="h-6 w-6 text-secondary" />;
      case "career":
        return <Briefcase className="h-6 w-6 text-amber-600" />;
      default:
        return <Book className="h-6 w-6 text-primary" />;
    }
  };

  // Get badge text and style based on resource type
  const getBadge = () => {
    switch (resource.resourceType) {
      case "guide":
        return (
          <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100">
            Guide
          </Badge>
        );
      case "video":
        return (
          <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-100">
            Videos
          </Badge>
        );
      case "practice":
        return (
          <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100">
            Practice
          </Badge>
        );
      case "career":
        return (
          <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100">
            Career
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 hover:bg-slate-100">
            Resource
          </Badge>
        );
    }
  };

  return (
    <Card className="bg-slate-50 dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-5">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
          {getIcon()}
        </div>
        <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
        <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm">
          {resource.description}
        </p>
        <div className="flex justify-between items-center">
          {getBadge()}
          <a href={resource.link || "#"} className="text-primary hover:underline text-sm font-medium">
            {resource.resourceType === "guide" && "Read more"}
            {resource.resourceType === "video" && "Watch now"}
            {resource.resourceType === "practice" && "Solve problems"}
            {resource.resourceType === "career" && "Get prepared"}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
