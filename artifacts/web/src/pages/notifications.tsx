import { useListNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function NotificationsPage() {
  const { data, isLoading } = useListNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleMarkRead = async (id: string) => {
    try {
      await markRead.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to mark as read" });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({ title: "All notifications marked as read" });
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to mark all as read" });
    }
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-2">System alerts and communications.</p>
        </div>
        <Button variant="outline" onClick={handleMarkAllRead} disabled={markAllRead.isPending || !data?.data?.some(n => !n.isRead)}>
          <CheckCheck className="w-4 h-4 mr-2" />
          Mark all as read
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading notifications...</div>
        ) : !data?.data || data.data.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground border border-dashed border-border rounded-lg">
            <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
            No notifications to display.
          </div>
        ) : (
          data.data.map((notification) => (
            <Card key={notification.id} className={notification.isRead ? 'opacity-70 bg-muted/50' : 'border-primary/20 bg-primary/5'}>
              <CardContent className="p-4 flex gap-4">
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notification.isRead ? 'bg-transparent' : 'bg-primary'}`} />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{notification.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground/70 mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.isRead && (
                  <Button variant="ghost" size="icon" onClick={() => handleMarkRead(notification.id)} disabled={markRead.isPending}>
                    <Check className="w-4 h-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
