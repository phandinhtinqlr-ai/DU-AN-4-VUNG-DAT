import { firebaseService } from '../services/firebaseService';
import { SystemConfig, Task } from '../types';

export const seedInitialData = async () => {
  const config: SystemConfig = {
    departments: ['Kỹ thuật', 'Vận hành', 'Cảnh quan', 'Ẩm thực', 'Kinh doanh'],
    categories: ['Xây dựng', 'Bảo trì', 'Sự kiện', 'Nhân sự', 'Marketing'],
    lands: ['Vùng 1', 'Vùng 2', 'Vùng 3', 'Vùng 4'],
    taskStatuses: ['Chưa thực hiện', 'Đang thực hiện', 'Hoàn thành', 'Tạm dừng', 'Hủy bỏ'],
    priorities: ['Thấp', 'Trung bình', 'Cao', 'Khẩn cấp'],
    riskLevels: ['Thấp', 'Trung bình', 'Cao', 'Rất cao']
  };

  await firebaseService.updateConfig(config);

  const sampleTasks: Omit<Task, 'id'>[] = [
    {
      code: 'CV-001',
      title: 'Bảo trì cáp treo số 1',
      description: 'Kiểm tra định kỳ hệ thống cáp treo số 1',
      project: 'Duy tu bảo dưỡng',
      land: 'Vùng 1',
      category: 'Bảo trì',
      department: 'Kỹ thuật',
      assigneeId: 'system',
      collaborators: [],
      week: 11,
      startDate: '2026-03-10',
      dueDate: '2026-03-20',
      status: 'Đang thực hiện',
      progress: 45,
      priority: 'Cao',
      riskLevel: 'Trung bình',
      result: '',
      notes: 'Cần chú ý bộ phận truyền động',
      updatedAt: new Date().toISOString(),
      updatedBy: 'System'
    },
    {
      code: 'CV-002',
      title: 'Trang trí vườn hoa Le Jardin',
      description: 'Thay mới các loại hoa theo mùa',
      project: 'Cảnh quan mùa xuân',
      land: 'Vùng 2',
      category: 'Cảnh quan',
      department: 'Cảnh quan',
      assigneeId: 'system',
      collaborators: [],
      week: 11,
      startDate: '2026-03-12',
      dueDate: '2026-03-15',
      status: 'Chưa thực hiện',
      progress: 0,
      priority: 'Trung bình',
      riskLevel: 'Thấp',
      result: '',
      notes: '',
      updatedAt: new Date().toISOString(),
      updatedBy: 'System'
    },
    {
      code: 'CV-003',
      title: 'Nâng cấp hệ thống chiếu sáng Lâu đài Mặt Trăng',
      description: 'Lắp đặt đèn LED trang trí mới',
      project: 'Nâng cấp hạ tầng',
      land: 'Vùng 4',
      category: 'Xây dựng',
      department: 'Kỹ thuật',
      assigneeId: 'system',
      collaborators: [],
      week: 11,
      startDate: '2026-03-01',
      dueDate: '2026-03-14',
      status: 'Đang thực hiện',
      progress: 30,
      priority: 'Khẩn cấp',
      riskLevel: 'Cao',
      result: '',
      notes: 'Thiếu vật tư đèn LED',
      updatedAt: new Date().toISOString(),
      updatedBy: 'System'
    }
  ];

  for (const task of sampleTasks) {
    await firebaseService.createTask(task);
  }

  console.log('Seeding completed!');
};
