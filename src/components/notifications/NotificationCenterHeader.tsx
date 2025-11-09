import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationCenterHeaderProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

export function NotificationCenterHeader({ unreadCount, onMarkAllAsRead }: NotificationCenterHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h3 className="font-semibold">Notifications</h3>
      {unreadCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onMarkAllAsRead}
          className="text-xs"
        >
          <CheckCheck className="h-4 w-4 mr-1" />
          Mark all read
        </Button>
      )}
    </div>
  );
}
