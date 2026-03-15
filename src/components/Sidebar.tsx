import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  BookOpen, 
  AlertTriangle, 
  Bell, 
  History, 
  Download, 
  Settings, 
  Users,
  LogOut,
  Mountain
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar: React.FC = () => {
  const { profile, isAdmin } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Briefcase, label: 'Quản lý công việc', path: '/tasks' },
    { icon: BookOpen, label: 'Nhật ký công việc', path: '/logs' },
    { icon: AlertTriangle, label: 'Cảnh báo nguy cơ', path: '/risks' },
    { icon: Bell, label: 'Thông báo', path: '/notifications' },
    { icon: Download, label: 'Xuất dữ liệu', path: '/export' },
  ];

  const adminItems = [
    { icon: History, label: 'Activity Log', path: '/activity' },
    { icon: Users, label: 'Quản lý tài khoản', path: '/users' },
    { icon: Settings, label: 'Cấu hình hệ thống', path: '/settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-bana-dark text-white shadow-2xl">
      <div className="flex items-center gap-3 p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bana-gold">
          <Mountain className="h-6 w-6 text-bana-dark" />
        </div>
        <div>
          <h1 className="text-sm font-bold leading-tight">SUN WORLD</h1>
          <p className="text-[10px] font-medium tracking-widest text-bana-gold">BA NA HILLS</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:bg-white/10",
              isActive ? "bg-bana-gold text-bana-dark shadow-lg" : "text-slate-400"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="my-4 border-t border-white/10 pt-4">
              <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Quản trị</p>
            </div>
            {adminItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:bg-white/10",
                  isActive ? "bg-bana-gold text-bana-dark shadow-lg" : "text-slate-400"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-white/5 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bana-blue text-xs font-bold">
            {profile?.displayName?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="truncate text-xs font-bold">{profile?.displayName}</p>
            <p className="text-[10px] text-slate-400">{profile?.role}</p>
          </div>
        </div>
        <button 
          onClick={() => authService.logout()}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-400/10"
        >
          <LogOut className="h-5 w-5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
