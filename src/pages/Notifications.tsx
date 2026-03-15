import React, { useEffect, useState } from 'react';
import { firebaseService } from '../services/firebaseService';
import { Notification } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Bell, Check, Clock, Info, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = firebaseService.subscribeNotifications(user.uid, (data) => {
      setNotifications(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const handleMarkRead = async (id: string) => {
    await firebaseService.markNotificationRead(id);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-800">Thông báo của bạn</h3>
        <span className="rounded-full bg-bana-blue px-3 py-1 text-xs font-bold text-white">
          {notifications.filter(n => !n.isRead).length} mới
        </span>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <div 
            key={notif.id} 
            className={`glass-card flex items-start gap-4 rounded-2xl p-4 transition-all ${
              !notif.isRead ? 'border-l-4 border-l-bana-blue bg-white' : 'opacity-70'
            }`}
          >
            <div className={`mt-1 rounded-full p-2 ${
              notif.type === 'danger' ? 'bg-red-100 text-red-600' : 
              notif.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {notif.type === 'danger' ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className={`text-sm font-bold ${!notif.isRead ? 'text-slate-800' : 'text-slate-500'}`}>
                  {notif.title}
                </h4>
                <span className="text-[10px] text-slate-400">
                  {format(new Date(notif.createdAt), 'HH:mm dd/MM/yyyy')}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{notif.message}</p>
              
              {!notif.isRead && (
                <button 
                  onClick={() => handleMarkRead(notif.id)}
                  className="mt-3 flex items-center gap-1 text-[10px] font-bold text-bana-blue hover:underline"
                >
                  <Check className="h-3 w-3" /> Đánh dấu đã đọc
                </button>
              )}
            </div>
          </div>
        ))}
        
        {notifications.length === 0 && !loading && (
          <div className="py-20 text-center text-slate-400 glass-card rounded-2xl">
            <Bell className="mx-auto mb-4 h-12 w-12 opacity-20" />
            <p>Bạn không có thông báo nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
