import { useListNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Bell, BellOff, Check, CheckCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function NotificationsPage() {
  const { data, isLoading, isError } = useListNotifications({ limit: 100 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id: string) => {
    try {
      await markRead.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    } catch {
      toast({ variant: "destructive", title: "Failed to mark as read" });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({ title: "All notifications marked as read" });
    } catch {
      toast({ variant: "destructive", title: "Failed to mark all as read" });
    }
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Notifications"
        description="System alerts, task assignments and care updates."
        actions={
          <>
            {unreadCount > 0 && <Badge variant="secondary">{unreadCount} unread</Badge>}
            <Button variant="outline" onClick={handleMarkAllRead} disabled={markAllRead.isPending || unreadCount === 0}>
              <CheckCheck className="w-4 h-4 mr-2" /> Mark all as read
            </Button>
          </>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
        </div>
      ) : isError ? (
        <EmptyState icon={BellOff} title="Couldn't load notifications" description="Please refresh the page to try again." />
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up" description="New alerts and task updates will appear here." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} className={n.isRead ? "opacity-75" : "border-primary/30 bg-primary/[0.04]"}>
              <CardContent className="p-4 flex gap-4">
                <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.isRead ? "bg-transparent" : "bg-primary"}`} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{n.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                  <p className="text-xs text-muted-foreground/70 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && (
                  <Button variant="ghost" size="icon" onClick={() => handleMarkRead(n.id)} disabled={markRead.isPending} aria-label="Mark as read">
                    <Check className="w-4 h-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
