import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@shared/schema";

interface UserAvatarProps {
  user: Pick<User, "avatar" | "displayName" | "username">;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarImage src={user.avatar} alt={user.displayName} />
      <AvatarFallback>
        {user.displayName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)}
      </AvatarFallback>
    </Avatar>
  );
}
