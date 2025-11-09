/* @refresh skip */
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Check, X, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useNotifications, type Notification } from "@/hooks/useNotifications";

// Internal Header Component
function Header({ unreadCount, onMarkAllAsRead }: { unreadCount: number; onMarkAllAsRead: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h3 className="font-semibold">Notifications</h3>
      {unreadCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onMarkAllAsRead} className="text-xs">
          <CheckCheck className="h-4 w-4 mr-1" />
          Mark all read
        </Button>
      )}
    </div>
  );
}

// Internal Item Component
function Item({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}: { 
  notification: Notification; 
  onMarkAsRead: (id: string) => void; 
  onDelete: (id: string) => void;
}) {
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
            {!notification.read && <div className="w-2 h-2 bg-primary rounded-full" />}
          </div>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
          </p>
        </div>
        <div className="flex gap-1">
          {!notification.read && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onMarkAsRead(notification.id)}>
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(notification.id)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Internal List Component
function List({ 
  notifications, 
  onMarkAsRead, 
  onDelete 
}: { 
  notifications: Notification[]; 
  onMarkAsRead: (id: string) => void; 
  onDelete: (id: string) => void;
}) {
  if (notifications.length === 0) {
    return (
      <ScrollArea className="h-[400px]">
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Bell className="h-12 w-12 mb-2 opacity-50" />
          <p className="text-sm">No notifications yet</p>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="divide-y">
        {notifications.map((notification) => (
          <Item
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

// Main Component
function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Header unreadCount={unreadCount} onMarkAllAsRead={markAllAsRead} />
        <List 
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onDelete={deleteNotification}
        />
      </PopoverContent>
    </Popover>
  );
}

export default NotificationCenter;
export { NotificationCenter };
