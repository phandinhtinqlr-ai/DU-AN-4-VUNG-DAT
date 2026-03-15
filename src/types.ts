export type UserRole = 'admin' | 'editor';
export type UserStatus = 'Active' | 'Locked';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  photoURL?: string;
  phoneNumber?: string;
  createdAt: string;
}

export interface TaskResult {
  text: string;
  timestamp: string;
  updatedBy: string;
}

export type TaskStatus = 'Chưa thực hiện' | 'Đang thực hiện' | 'Hoàn thành' | 'Tạm dừng' | 'Hủy bỏ';
export type Priority = 'Thấp' | 'Trung bình' | 'Cao' | 'Khẩn cấp';
export type RiskLevel = 'Thấp' | 'Trung bình' | 'Cao' | 'Rất cao';

export interface Task {
  id: string;
  code: string;
  title: string;
  description: string;
  project: string;
  land: string;
  category: string;
  department: string;
  assigneeId: string;
  collaborators: string[];
  week: number;
  startDate: string;
  dueDate: string;
  status: TaskStatus;
  progress: number;
  priority: Priority;
  riskLevel: RiskLevel;
  result: string;
  resultHistory?: TaskResult[];
  notes: string;
  updatedAt: string;
  updatedBy: string;
}

export interface WorkLog {
  id: string;
  taskId: string;
  date: string;
  userId: string;
  content: string;
  volume: string;
  result: string;
  difficulties: string;
  suggestions: string;
  images: string[];
}

export interface ActivityLog {
  id: string;
  userId?: string;
  timestamp: string;
  action: string;
  module: string;
  taskId?: string;
  beforeData?: any;
  afterData?: any;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  taskId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SystemConfig {
  departments: string[];
  categories: string[];
  lands: string[];
  taskStatuses: string[];
  priorities: string[];
  riskLevels: string[];
}
