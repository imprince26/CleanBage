import { useEffect, useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent } from '../../components/ui/card';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
import { Bell, Check, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const Notifications = () => {
  const {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.isRead;
    if (activeTab === 'read') return notification.isRead;
    return true;
  });

  const getIconForType = (type) => {
    switch (type) {
      case 'collection_scheduled':
      case 'collection_completed':
        return <Trash2 className="h-4 w-4" />;
      case 'bin_reported':
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleClearRead = () => {
    deleteAllRead();
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="View and manage your notifications"
      />

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={!notifications.some(n => !n.isRead)}
            >
              <Check className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearRead}
              disabled={!notifications.some(n => n.isRead)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear read
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          <NotificationsList
            notifications={filteredNotifications}
            loading={loading}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
          />
        </TabsContent>
        <TabsContent value="unread" className="mt-0">
          <NotificationsList
            notifications={filteredNotifications}
            loading={loading}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
          />
        </TabsContent>
        <TabsContent value="read" className="mt-0">
          <NotificationsList
            notifications={filteredNotifications}
            loading={loading}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const NotificationsList = ({ notifications, loading, onMarkAsRead, onDelete }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<Bell className="h-12 w-12" />}
        title="No notifications"
        description="You don't have any notifications at the moment."
      />
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card key={notification._id} className={cn(!notification.isRead && 'border-primary/50')}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={cn(
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                !notification.isRead ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              )}>
                {getIconForType(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn(
                    'text-sm',
                    !notification.isRead && 'font-medium'
                  )}>
                    {notification.title}
                  </p>
                  <div className="flex items-center gap-1">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onMarkAsRead(notification._id)}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onDelete(notification._id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                  {notification.message}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">
                    {formatDate(notification.createdAt)}
                  </p>
                  {notification.action && notification.action.url && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      asChild
                    >
                      <a href={notification.action.url}>
                        {notification.action.text}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Notifications;