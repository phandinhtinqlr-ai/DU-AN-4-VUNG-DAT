import React, { useEffect, useState } from 'react';
import { firebaseService } from '../services/firebaseService';
import { ActivityLog } from '../types';
import { History, User, Clock, Box } from 'lucide-react';
import { format } from 'date-fns';

const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeActivityLogs((data) => {
      setLogs(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-800">Lịch sử hoạt động hệ thống</h3>
      
      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Người thực hiện</th>
                <th className="px-6 py-4">Thao tác</th>
                <th className="px-6 py-4">Module</th>
                <th className="px-6 py-4">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-slate-500">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {format(new Date(log.timestamp), 'HH:mm dd/MM/yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-medium text-slate-700">
                      <User className="h-3 w-3" />
                      {log.userId}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      log.action.includes('Tạo') ? 'bg-emerald-100 text-emerald-700' :
                      log.action.includes('Xóa') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <div className="flex items-center gap-2">
                      <Box className="h-3 w-3" />
                      {log.module}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 italic">
                    {log.taskId ? `Task ID: ${log.taskId}` : '-'}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400">
                    Chưa có hoạt động nào được ghi lại
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
