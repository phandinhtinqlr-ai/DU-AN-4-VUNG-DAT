import React, { useEffect, useState } from 'react';
import { 
  Plus, Filter, Search, MoreHorizontal, 
  ChevronRight, Download, Calendar, 
  User, Tag, MapPin, Flag, AlertTriangle
} from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import { Task, SystemConfig } from '../types';
import { useAuth } from '../hooks/useAuth';
import { exportTasksToExcel } from '../utils/excelExport';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

import TaskModal from '../components/TaskModal';

const Tasks: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialStatus = queryParams.get('status') || 'All';
  const initialOverdue = queryParams.get('overdue') === 'true';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLand, setFilterLand] = useState('All');
  const [filterStatus, setFilterStatus] = useState(initialStatus);
  const [filterOverdue, setFilterOverdue] = useState(initialOverdue);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const loadConfig = async () => {
      const data = await firebaseService.getConfig();
      setConfig(data);
    };
    loadConfig();

    const unsubscribe = firebaseService.subscribeTasks((data) => {
      setTasks(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Update filters if URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setFilterStatus(params.get('status') || 'All');
    setFilterOverdue(params.get('overdue') === 'true');
  }, [location.search]);

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLand = filterLand === 'All' || t.land === filterLand;
    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
    
    let matchesOverdue = true;
    if (filterOverdue) {
      const isOverdue = new Date(t.dueDate) < new Date() && t.status !== 'Hoàn thành';
      matchesOverdue = isOverdue;
    }

    return matchesSearch && matchesLand && matchesStatus && matchesOverdue;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hoàn thành': return 'bg-emerald-100 text-emerald-700';
      case 'Đang thực hiện': return 'bg-amber-100 text-amber-700';
      case 'Chưa thực hiện': return 'bg-slate-100 text-slate-700';
      case 'Tạm dừng': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-800">Danh sách công việc</h3>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => exportTasksToExcel(filteredTasks)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Xuất Excel
          </button>
          {isAdmin && (
            <button 
              onClick={() => {
                setSelectedTask(undefined);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-bana-blue px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-bana-dark"
            >
              <Plus className="h-4 w-4" />
              Tạo công việc
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <TaskModal 
            task={selectedTask} 
            onClose={() => setIsModalOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="glass-card flex flex-wrap items-center gap-4 rounded-2xl p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc mã..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-sm focus:border-bana-blue focus:outline-none focus:ring-1 focus:ring-bana-blue"
          />
        </div>
        
        <select 
          value={filterLand}
          onChange={(e) => setFilterLand(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm focus:border-bana-blue focus:outline-none"
        >
          <option value="All">Tất cả Vùng đất</option>
          {config?.lands.map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm focus:border-bana-blue focus:outline-none"
        >
          <option value="All">Tất cả Trạng thái</option>
          {config?.taskStatuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <button 
          onClick={() => setFilterOverdue(!filterOverdue)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
            filterOverdue 
              ? 'border-red-200 bg-red-50 text-red-600' 
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          Trễ hạn
        </button>

        <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <Filter className="h-4 w-4" />
          Bộ lọc nâng cao
        </button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Mã & Tên công việc</th>
                <th className="px-6 py-4">Vùng đất</th>
                <th className="px-6 py-4">Phòng ban</th>
                <th className="px-6 py-4">Hạn hoàn thành</th>
                <th className="px-6 py-4">Tiến độ</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="group transition-colors hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-bana-gold">{task.code}</span>
                      <span className="font-bold text-slate-700">{task.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin className="h-3 w-3" />
                      {task.land}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{task.department}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar className="h-3 w-3" />
                      {task.dueDate}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex w-32 items-center gap-3">
                      <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                        <div 
                          className="h-full rounded-full bg-bana-blue" 
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">{task.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        setSelectedTask(task);
                        setIsModalOpen(true);
                      }}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-slate-400">
                    Không tìm thấy công việc nào
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

export default Tasks;
