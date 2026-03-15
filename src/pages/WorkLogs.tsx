import React, { useEffect, useState } from 'react';
import { firebaseService } from '../services/firebaseService';
import { WorkLog } from '../types';
import { BookOpen, Plus, Search, Calendar, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { exportWorkLogsToExcel } from '../utils/excelExport';

const WorkLogs: React.FC = () => {
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeWorkLogs(null, (data) => {
      setLogs(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-800">Nhật ký công việc</h3>
        <button 
          onClick={() => exportWorkLogsToExcel(logs)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
        >
          Xuất Excel
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="glass-card rounded-2xl p-6 transition-all hover:shadow-lg">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bana-blue/10 text-bana-blue">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{log.userId}</p>
                    <p className="text-[10px] text-slate-400">{format(new Date(log.date), 'dd/MM/yyyy')}</p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
                  Task: {log.taskId}
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h5 className="mb-1 flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <FileText className="h-3 w-3" /> Nội dung thực hiện
                  </h5>
                  <p className="text-sm text-slate-700 leading-relaxed">{log.content}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="mb-1 text-[10px] font-bold text-slate-400 uppercase">Khối lượng</h5>
                    <p className="text-sm text-slate-600">{log.volume}</p>
                  </div>
                  <div>
                    <h5 className="mb-1 text-[10px] font-bold text-slate-400 uppercase">Kết quả</h5>
                    <p className="text-sm text-slate-600">{log.result}</p>
                  </div>
                </div>

                {(log.difficulties || log.suggestions) && (
                  <div className="rounded-xl bg-amber-50 p-4">
                    {log.difficulties && (
                      <div className="mb-2">
                        <p className="text-[10px] font-bold text-amber-600 uppercase">Khó khăn / Vướng mắc</p>
                        <p className="text-sm text-amber-800">{log.difficulties}</p>
                      </div>
                    )}
                    {log.suggestions && (
                      <div>
                        <p className="text-[10px] font-bold text-amber-600 uppercase">Đề xuất hỗ trợ</p>
                        <p className="text-sm text-amber-800">{log.suggestions}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {logs.length === 0 && !loading && (
            <div className="py-20 text-center text-slate-400 glass-card rounded-2xl">
              <BookOpen className="mx-auto mb-4 h-12 w-12 opacity-20" />
              <p>Chưa có nhật ký công việc nào</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h4 className="mb-4 font-bold text-slate-800">Thống kê nhật ký</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Tổng số nhật ký</span>
                <span className="font-bold text-bana-blue">{logs.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Người nhập nhiều nhất</span>
                <span className="font-bold text-slate-700">System</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkLogs;
