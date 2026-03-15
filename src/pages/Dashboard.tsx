import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { 
  CheckCircle2, Clock, AlertTriangle, PlayCircle, 
  TrendingUp, Users, Layers, Calendar
} from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import { Task, SystemConfig } from '../types';
import { getTopRiskyTasks } from '../utils/riskCalculator';
import { motion } from 'motion/react';

import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const configData = await firebaseService.getConfig();
      setConfig(configData);
    };
    loadData();

    const unsubscribe = firebaseService.subscribeTasks((data) => {
      setTasks(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading || !config) return <div>Đang tải dữ liệu...</div>;

  const stats = {
    total: tasks.length,
    notStarted: tasks.filter(t => t.status === 'Chưa thực hiện').length,
    inProgress: tasks.filter(t => t.status === 'Đang thực hiện').length,
    completed: tasks.filter(t => t.status === 'Hoàn thành').length,
    overdue: tasks.filter(t => {
      const isOverdue = new Date(t.dueDate) < new Date() && t.status !== 'Hoàn thành';
      return isOverdue;
    }).length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const landData = config.lands.map(landName => ({
    name: landName,
    value: tasks.filter(t => t.land === landName).length
  }));

  const COLORS = ['#1E3A8A', '#D4AF37', '#10B981', '#F59E0B'];

  const riskyTasks = getTopRiskyTasks(tasks);

  const StatCard = ({ title, value, icon: Icon, color, subValue, onClick }: any) => (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onClick}
      className={`glass-card rounded-2xl p-6 cursor-pointer transition-all hover:shadow-2xl`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-1 text-3xl font-bold text-slate-800">{value}</h3>
          {subValue && <p className="mt-1 text-xs text-slate-400">{subValue}</p>}
        </div>
        <div className={`rounded-xl p-3 ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard 
          title="Tổng công việc" 
          value={stats.total} 
          icon={Layers} 
          color="bg-blue-50 text-blue-600" 
          subValue="Toàn bộ dự án"
          onClick={() => navigate('/tasks')}
        />
        <StatCard 
          title="Chưa thực hiện" 
          value={stats.notStarted} 
          icon={Clock} 
          color="bg-slate-100 text-slate-600" 
          subValue={`${Math.round((stats.notStarted/stats.total)*100 || 0)}% tổng số`}
          onClick={() => navigate('/tasks?status=Chưa thực hiện')}
        />
        <StatCard 
          title="Đang thực hiện" 
          value={stats.inProgress} 
          icon={PlayCircle} 
          color="bg-amber-50 text-amber-600" 
          subValue={`${Math.round((stats.inProgress/stats.total)*100 || 0)}% tổng số`}
          onClick={() => navigate('/tasks?status=Đang thực hiện')}
        />
        <StatCard 
          title="Hoàn thành" 
          value={stats.completed} 
          icon={CheckCircle2} 
          color="bg-emerald-50 text-emerald-600" 
          subValue={`${completionRate}% tỷ lệ hoàn thành`}
          onClick={() => navigate('/tasks?status=Hoàn thành')}
        />
        <StatCard 
          title="Trễ hạn" 
          value={stats.overdue} 
          icon={AlertTriangle} 
          color="bg-red-50 text-red-600" 
          subValue="Cần xử lý ngay"
          onClick={() => navigate('/tasks?overdue=true')}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Progress Chart */}
        <div className="glass-card col-span-2 rounded-2xl p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Tiến độ theo Vùng đất</h3>
            <button 
              onClick={() => navigate('/tasks')}
              className="text-sm font-medium text-bana-blue hover:underline"
            >
              Xem chi tiết
            </button>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={landData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#1E3A8A" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk List */}
        <div className="glass-card rounded-2xl p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Cảnh báo nguy cơ (Top 10)</h3>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="space-y-4">
            {riskyTasks.map((task) => (
              <div 
                key={task.id} 
                onClick={() => navigate('/tasks')}
                className="group flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 p-3 transition-all hover:bg-slate-50 hover:shadow-md"
              >
                <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                  task.risk.level === 'Rất cao' ? 'bg-red-500' : 
                  task.risk.level === 'Cao' ? 'bg-orange-500' : 'bg-amber-500'
                }`} />
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-bold text-slate-700">{task.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="font-medium text-slate-500">{task.code}</span>
                    <span>•</span>
                    <span>{task.risk.reasons[0]}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    task.risk.level === 'Rất cao' ? 'bg-red-100 text-red-700' : 
                    task.risk.level === 'Cao' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {task.risk.score}đ
                  </span>
                </div>
              </div>
            ))}
            {riskyTasks.length === 0 && (
              <div className="py-10 text-center text-slate-400">
                <CheckCircle2 className="mx-auto mb-2 h-10 w-10 opacity-20" />
                <p>Không có cảnh báo nguy cơ</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
