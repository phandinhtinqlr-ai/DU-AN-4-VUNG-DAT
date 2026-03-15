import React, { useEffect, useState } from 'react';
import { firebaseService } from '../services/firebaseService';
import { Task, SystemConfig } from '../types';
import { Download, FileText, Filter, Calendar, MapPin } from 'lucide-react';
import { exportTasksToExcel } from '../utils/excelExport';

const Export: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterLand, setFilterLand] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const configData = await firebaseService.getConfig();
      setConfig(configData);
      
      const unsubscribe = firebaseService.subscribeTasks((data) => {
        setTasks(data);
        setLoading(false);
      });
      return unsubscribe;
    };
    loadData();
  }, []);

  const filteredTasks = tasks.filter(t => {
    const matchesLand = filterLand === 'All' || t.land === filterLand;
    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
    
    let matchesDate = true;
    if (startDate && endDate) {
      const taskDate = new Date(t.startDate);
      matchesDate = taskDate >= new Date(startDate) && taskDate <= new Date(endDate);
    }

    return matchesLand && matchesStatus && matchesDate;
  });

  const handleExport = () => {
    if (filteredTasks.length === 0) {
      alert('Không có dữ liệu để xuất');
      return;
    }
    exportTasksToExcel(filteredTasks);
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Xuất dữ liệu báo cáo</h3>
          <p className="text-sm text-slate-500">Tùy chỉnh bộ lọc và xuất dữ liệu ra định dạng Excel</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
          <FileText className="h-6 w-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Filter Panel */}
        <div className="glass-card col-span-1 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Filter className="h-4 w-4" />
            Bộ lọc dữ liệu
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Vùng đất</label>
              <select 
                value={filterLand}
                onChange={(e) => setFilterLand(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-bana-blue focus:outline-none"
              >
                <option value="All">Tất cả Vùng đất</option>
                {config?.lands.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Trạng thái</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-bana-blue focus:outline-none"
              >
                <option value="All">Tất cả Trạng thái</option>
                {config?.taskStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Từ ngày</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-bana-blue focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Đến ngày</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-bana-blue focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleExport}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-bana-blue py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-bana-dark"
          >
            <Download className="h-5 w-5" />
            Xuất file Excel (.xlsx)
          </button>
        </div>

        {/* Preview Panel */}
        <div className="glass-card col-span-2 rounded-3xl p-8">
          <div className="mb-6 flex items-center justify-between">
            <h4 className="font-bold text-slate-800">Xem trước dữ liệu ({filteredTasks.length} dòng)</h4>
            <span className="text-xs text-slate-400 italic">Hiển thị tối đa 10 dòng gần nhất</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-slate-400">
                <tr>
                  <th className="pb-3 pr-4 font-bold uppercase">Mã</th>
                  <th className="pb-3 pr-4 font-bold uppercase">Tên công việc</th>
                  <th className="pb-3 pr-4 font-bold uppercase">Vùng đất</th>
                  <th className="pb-3 pr-4 font-bold uppercase">Trạng thái</th>
                  <th className="pb-3 font-bold uppercase">Tiến độ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTasks.slice(0, 10).map((task) => (
                  <tr key={task.id}>
                    <td className="py-4 pr-4 font-bold text-bana-gold">{task.code}</td>
                    <td className="py-4 pr-4 font-medium text-slate-700">{task.title}</td>
                    <td className="py-4 pr-4 text-slate-500">{task.land}</td>
                    <td className="py-4 pr-4">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-500">
                        {task.status}
                      </span>
                    </td>
                    <td className="py-4 font-bold text-bana-blue">{task.progress}%</td>
                  </tr>
                ))}
                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400 italic">
                      Không có dữ liệu phù hợp với bộ lọc
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Export;
