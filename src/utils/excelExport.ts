import * as XLSX from 'xlsx';
import { Task, WorkLog, ActivityLog } from '../types';

export const exportTasksToExcel = (tasks: Task[], fileName: string = 'Danh_sach_cong_viec.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(tasks.map(t => ({
    'Mã CV': t.code,
    'Tên công việc': t.title,
    'Dự án': t.project,
    'Vùng đất': t.land,
    'Mảng công việc': t.category,
    'Phòng ban': t.department,
    'Người phụ trách': t.assigneeId,
    'Tuần': t.week,
    'Bắt đầu': t.startDate,
    'Hạn hoàn thành': t.dueDate,
    'Trạng thái': t.status,
    'Tiến độ (%)': t.progress,
    'Ưu tiên': t.priority,
    'Rủi ro': t.riskLevel,
    'Kết quả': t.result,
    'Ghi chú': t.notes,
    'Cập nhật cuối': t.updatedAt
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');
  XLSX.writeFile(workbook, fileName);
};

export const exportWorkLogsToExcel = (logs: WorkLog[], fileName: string = 'Nhat_ky_cong_viec.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(logs.map(l => ({
    'Ngày': l.date,
    'Mã Task': l.taskId,
    'Người nhập': l.userId,
    'Nội dung': l.content,
    'Khối lượng': l.volume,
    'Kết quả': l.result,
    'Khó khăn': l.difficulties,
    'Đề xuất': l.suggestions
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'WorkLogs');
  XLSX.writeFile(workbook, fileName);
};
