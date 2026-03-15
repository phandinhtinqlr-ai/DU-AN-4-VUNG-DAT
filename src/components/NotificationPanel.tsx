import React, { useEffect, useState } from 'react';
import { firebaseService } from '../services/firebaseService';
import { Notification } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Bell, X, Check, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = firebaseService.subscribeNotifications(user.uid, (data) => {
      setNotifications(data);
    });
    return unsubscribe;
  }, [user]);

  const handleMarkRead = async (id: string) => {
    await firebaseService.markNotificationRead(id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'success': return <Check className="h-4 w-4 text-emerald-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <h3 className="font-bold text-slate-800">Thông báo</h3>
              <button onClick={onClose} className="rounded-full p-1 hover:bg-slate-100">
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`flex gap-3 p-4 transition-colors hover:bg-slate-50 ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                      onClick={() => !n.isRead && handleMarkRead(n.id)}
                    >
                      <div className="mt-1 shrink-0">{getIcon(n.type)}</div>
                      <div className="flex-1 space-y-1">
                        <p className={`text-sm ${!n.isRead ? 'font-bold text-slate-800' : 'text-slate-600'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-500">{n.message}</p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(n.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      {!n.isRead && (
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <Bell className="mx-auto mb-2 h-8 w-8 opacity-20" />
                  <p className="text-sm">Không có thông báo mới</p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="border-t border-slate-100 p-3 text-center">
                <button className="text-xs font-bold text-bana-blue hover:underline">
                  Xem tất cả thông báo
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
