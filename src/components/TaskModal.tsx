import React, { useEffect, useState } from 'react';
import { X, Save, CheckCircle, Calendar, MapPin, Users, Clock, AlertTriangle, Info, Tag, Building2, Layers } from 'lucide-react';
import { Task, TaskStatus, Priority, RiskLevel, SystemConfig, TaskResult } from '../types';
import { firebaseService } from '../services/firebaseService';
import { auth } from '../firebase';

interface TaskModalProps {
  task?: Task;
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose }) => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [formData, setFormData] = useState<Partial<Task>>(task || {
    code: '',
    title: '',
    description: '',
    project: '',
    land: '',
    category: '',
    department: '',
    assigneeId: 'system',
    collaborators: [],
    week: 11,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    status: 'Chưa thực hiện',
    progress: 0,
    priority: 'Trung bình',
    riskLevel: 'Thấp',
    result: '',
    notes: ''
  });

  useEffect(() => {
    const loadConfig = async () => {
      const data = await firebaseService.getConfig();
      setConfig(data);
      if (!task && data) {
        setFormData(prev => ({
          ...prev,
          land: data.lands[0] || '',
          category: data.categories[0] || '',
          department: data.departments[0] || '',
          status: data.taskStatuses[0] as TaskStatus || 'Chưa thực hiện',
          priority: data.priorities[0] as Priority || 'Trung bình',
          riskLevel: data.riskLevels[0] as RiskLevel || 'Thấp'
        }));
      }
    };
    loadConfig();
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date().toISOString();
    const updatedData = { ...formData, updatedAt: now };

    // Handle result history
    if (formData.result && formData.result !== task?.result) {
      const newResultEntry: TaskResult = {
        text: formData.result,
        timestamp: now,
        updatedBy: auth.currentUser?.displayName || 'System'
      };
      updatedData.resultHistory = [...(task?.resultHistory || []), newResultEntry];
    }

    if (task?.id) {
      await firebaseService.updateTask(task.id, updatedData);
      await firebaseService.logActivity({
        action: 'Cập nhật công việc',
        module: 'Tasks',
        taskId: task.id,
        afterData: updatedData
      });
    } else {
      const id = await firebaseService.createTask(updatedData as Omit<Task, 'id'>);
      await firebaseService.logActivity({
        action: 'Tạo công việc mới',
        module: 'Tasks',
        taskId: id,
        afterData: updatedData
      });
    }
    onClose();
  };

  if (!config) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bana-dark/60 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-2xl rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">{task ? 'Chỉnh sửa công việc' : 'Tạo công việc mới'}</h3>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Mã công việc</label>
              <input 
                type="text" 
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-bana-blue focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Tên công việc</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-bana-blue focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Vùng đất</label>
              <select 
                value={formData.land}
                onChange={(e) => setFormData({ ...formData, land: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-bana-blue focus:outline-none"
              >
                {config.lands.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Trạng thái</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-bana-blue focus:outline-none"
              >
                {config.taskStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Phòng ban</label>
              <select 
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-bana-blue focus:outline-none"
              >
                {config.departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Mảng công việc</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-bana-blue focus:outline-none"
              >
                {config.categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Ngày bắt đầu</label>
              <input 
                type="date" 
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-bana-blue focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Hạn hoàn thành</label>
              <input 
                type="date" 
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-bana-blue focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">Tiến độ ({formData.progress}%)</label>
            <input 
              type="range" 
              min="0" 
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
              className="w-full accent-bana-blue"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-2">
              <CheckCircle className="h-3 w-3" /> Kết quả công việc mới
            </label>
            <textarea 
              value={formData.result}
              onChange={(e) => setFormData({ ...formData, result: e.target.value })}
              placeholder="Nhập kết quả thực hiện công việc..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-bana-blue focus:outline-none min-h-[80px]"
            />
          </div>

          {task?.resultHistory && task.resultHistory.length > 0 && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-400">Lịch sử cập nhật kết quả</label>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {task.resultHistory.map((entry, idx) => (
                  <div key={idx} className="rounded-lg bg-slate-50 p-3 text-xs border border-slate-100">
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span className="font-bold">{entry.updatedBy}</span>
                      <span>{new Date(entry.timestamp).toLocaleString('vi-VN')}</span>
                    </div>
                    <p className="text-slate-600 italic">"{entry.text}"</p>
                  </div>
                )).reverse()}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="rounded-xl px-6 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100"
            >
              Hủy
            </button>
            <button 
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-bana-blue px-8 py-2 text-sm font-bold text-white shadow-lg hover:bg-bana-dark"
            >
              <Save className="h-4 w-4" />
              Lưu công việc
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
