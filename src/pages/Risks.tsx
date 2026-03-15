import React, { useEffect, useState } from 'react';
import { firebaseService } from '../services/firebaseService';
import { Task } from '../types';
import { getTopRiskyTasks } from '../utils/riskCalculator';
import { AlertTriangle, MapPin, Calendar, ChevronRight, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const Risks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeTasks((data) => {
      setTasks(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const riskyTasks = getTopRiskyTasks(tasks, 50); // Show more risky tasks

  if (loading) return <div>Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Cảnh báo nguy cơ</h3>
          <p className="text-sm text-slate-500">Danh sách các công việc có rủi ro cao dựa trên tiến độ và thời hạn</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 shadow-sm">
          <AlertTriangle className="h-6 w-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {riskyTasks.map((task, index) => (
          <motion.div 
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card flex flex-col md:flex-row items-center gap-6 rounded-3xl p-6 transition-all hover:shadow-xl"
          >
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold ${
              task.risk.level === 'Rất cao' ? 'bg-red-100 text-red-700' : 
              task.risk.level === 'Cao' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {task.risk.score}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-bana-gold">{task.code}</span>
                <h4 className="text-lg font-bold text-slate-800">{task.title}</h4>
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                  task.risk.level === 'Rất cao' ? 'bg-red-500 text-white' : 
                  task.risk.level === 'Cao' ? 'bg-orange-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {task.risk.level}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {task.land}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Hạn: {task.dueDate}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-24 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-bana-blue" style={{ width: `${task.progress}%` }} />
                  </div>
                  Tiến độ: {task.progress}%
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {task.risk.reasons.map((reason, idx) => (
                  <span key={idx} className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    <Info className="h-3 w-3" />
                    {reason}
                  </span>
                ))}
              </div>
            </div>

            <button 
              onClick={() => navigate('/tasks')}
              className="flex items-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-bana-blue hover:text-white"
            >
              Chi tiết
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        ))}

        {riskyTasks.length === 0 && (
          <div className="py-20 text-center text-slate-400 glass-card rounded-3xl">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 opacity-20" />
            <p className="text-lg">Hiện tại không có công việc nào ở mức rủi ro cao</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Risks;
