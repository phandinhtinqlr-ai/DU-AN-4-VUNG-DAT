import React, { useEffect, useState } from 'react';
import { Save, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import { SystemConfig } from '../types';
import { seedInitialData } from '../utils/seedData';

interface ConfigSectionProps {
  title: string;
  configKey: keyof SystemConfig;
  config: SystemConfig | null;
  addItem: (key: keyof SystemConfig) => void;
  updateList: (key: keyof SystemConfig, index: number, value: string) => void;
  removeItem: (key: keyof SystemConfig, index: number) => void;
}

const ConfigSection: React.FC<ConfigSectionProps> = ({ 
  title, configKey, config, addItem, updateList, removeItem 
}) => (
  <div className="glass-card rounded-2xl p-6">
    <div className="mb-4 flex items-center justify-between">
      <h4 className="font-bold text-slate-800">{title}</h4>
      <button 
        onClick={() => addItem(configKey)}
        className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
    <div className="space-y-2">
      {(config?.[configKey] || []).map((item: string, idx: number) => (
        <div key={idx} className="flex gap-2">
          <input 
            type="text" 
            value={item}
            onChange={(e) => updateList(configKey, idx, e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:border-bana-blue focus:outline-none"
          />
          <button 
            onClick={() => removeItem(configKey, idx)}
            className="rounded-xl p-2 text-red-400 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  </div>
);

const Settings: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      const data = await firebaseService.getConfig();
      setConfig(data);
      setLoading(false);
    };
    loadConfig();
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    await firebaseService.updateConfig(config);
    setSaving(false);
    alert('Cấu hình đã được lưu thành công!');
  };

  const handleSeed = async () => {
    if (confirm('Bạn có chắc chắn muốn khởi tạo dữ liệu mẫu? Thao tác này sẽ thêm các công việc mới.')) {
      await seedInitialData();
      window.location.reload();
    }
  };

  const updateList = (key: keyof SystemConfig, index: number, value: string) => {
    if (!config) return;
    const newList = [...(config[key] as string[])];
    newList[index] = value;
    setConfig({ ...config, [key]: newList });
  };

  const addItem = (key: keyof SystemConfig) => {
    if (!config) return;
    const newList = [...(config[key] as string[]), ''];
    setConfig({ ...config, [key]: newList });
  };

  const removeItem = (key: keyof SystemConfig, index: number) => {
    if (!config) return;
    const newList = [...(config[key] as string[])];
    newList.splice(index, 1);
    setConfig({ ...config, [key]: newList });
  };

  if (loading) return <div>Đang tải cấu hình...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-800">Cấu hình hệ thống</h3>
        <div className="flex gap-3">
          <button 
            onClick={handleSeed}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Khởi tạo dữ liệu mẫu
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-bana-blue px-6 py-2 text-sm font-bold text-white shadow-lg hover:bg-bana-dark disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ConfigSection title="Phòng ban" configKey="departments" config={config} addItem={addItem} updateList={updateList} removeItem={removeItem} />
        <ConfigSection title="Mảng công việc" configKey="categories" config={config} addItem={addItem} updateList={updateList} removeItem={removeItem} />
        <ConfigSection title="Vùng đất" configKey="lands" config={config} addItem={addItem} updateList={updateList} removeItem={removeItem} />
        <ConfigSection title="Trạng thái công việc" configKey="taskStatuses" config={config} addItem={addItem} updateList={updateList} removeItem={removeItem} />
        <ConfigSection title="Mức độ ưu tiên" configKey="priorities" config={config} addItem={addItem} updateList={updateList} removeItem={removeItem} />
        <ConfigSection title="Mức độ rủi ro" configKey="riskLevels" config={config} addItem={addItem} updateList={updateList} removeItem={removeItem} />
      </div>
    </div>
  );
};

export default Settings;
