import { useSocket } from '../context/SocketContext';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

const NotificationsPage = () => {
  const { notifications, clearNotifications } = useSocket();

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white mb-2">Notifications</h1>
          <p className="text-slate-400 text-sm">Stay updated with your builder network</p>
        </div>
        <button
          onClick={async () => {
            await clearNotifications();
            toast.success('All notifications marked as read!');
          }}
          className="text-brand-cyan text-sm font-bold hover:underline"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif, idx) => {
            let path = '#';
            if (notif.type === 'message') path = `/chat/${notif.entityId}`;
            else if (notif.type === 'match') path = '/matches';
            else if (notif.type === 'project') path = `/projects/${notif.entityId || ''}`;
            else if (notif.type === 'hackathon') path = `/hackathons/${notif.entityId || ''}`;
            else if (notif.type === 'community' || notif.type === 'follow') path = '/community';
            
            // fallback for legacy schema during dev
            if (notif.path) path = notif.path;
            const title = notif.message || notif.title;

            return (
              <Link
                key={notif.id || idx}
                to={path}
                className={`flex gap-4 p-4 rounded-2xl border transition-all ${
                  !notif.read 
                    ? 'bg-white/5 border-brand-cyan/20' 
                    : 'bg-dark-card border-white/5 hover:bg-white/[0.02]'
                }`}
              >
                {notif.sender?.avatar ? (
                  <img
                    src={notif.sender.avatar}
                    className="w-12 h-12 rounded-full border border-white/10 flex-shrink-0"
                    alt=""
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-slate-400" />
                  </div>
                )}
                <div className="flex-1">
                  <p className={`text-sm ${!notif.read ? 'font-black' : 'font-bold'} text-white`}>
                    {title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {notif.createdAt ? getRelativeTime(notif.createdAt) : ''}
                  </p>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-20 bg-dark-card rounded-3xl border border-white/5">
            <Bell className="w-12 h-12 text-slate-800 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">All caught up!</h3>
            <p className="text-slate-500 text-sm">You have no new notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
