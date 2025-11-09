import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  related_id: string | null;
  related_type: string | null;
  created_at: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-success bg-success/5';
      case 'warning':
        return 'border-l-4 border-warning bg-warning/5';
      case 'error':
        return 'border-l-4 border-destructive bg-destructive/5';
      default:
        return 'border-l-4 border-primary bg-primary/5';
    }
  };

  return (
    <div
      className={`p-4 hover:bg-muted/50 transition-colors ${
        !notification.read ? 'bg-muted/30' : ''
      } ${getTypeStyles(notification.type)}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">{notification.title}</p>
            {!notification.read && (
              <div className="w-2 h-2 bg-primary rounded-full" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
          </p>
        </div>
        <div className="flex gap-1">
          {!notification.read && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onMarkAsRead(notification.id)}
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDelete(notification.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
