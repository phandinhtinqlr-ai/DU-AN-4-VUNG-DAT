import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import NotificationPanel from './NotificationPanel';
import { firebaseService } from '../services/firebaseService';
import { Notification } from '../types';

const Layout: React.FC = () => {
  const { profile, user } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  React.useEffect(() => {
    if (!user) return;
    const unsubscribe = firebaseService.subscribeNotifications(user.uid, (data) => {
      setNotifications(data);
    });
    return unsubscribe;
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Xin chào, {profile?.displayName}</h2>
            <p className="text-sm text-slate-500">Hệ thống quản lý tiến độ 4 vùng đất Bà Nà Hills</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm công việc..." 
                className="w-64 rounded-full border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-bana-blue focus:outline-none focus:ring-1 focus:ring-bana-blue"
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative rounded-full bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
            </div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
