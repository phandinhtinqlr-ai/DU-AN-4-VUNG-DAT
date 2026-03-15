import { differenceInDays, parseISO, isAfter } from 'date-fns';
import { Task } from '../types';

export interface RiskScore {
  taskId: string;
  score: number;
  reasons: string[];
  level: 'Thấp' | 'Trung bình' | 'Cao' | 'Rất cao';
}

export const calculateRisk = (task: Task): RiskScore => {
  let score = 0;
  const reasons: string[] = [];
  const now = new Date();
  const dueDate = parseISO(task.dueDate);
  const updatedAt = parseISO(task.updatedAt);
  
  // 1. Overdue
  if (isAfter(now, dueDate) && task.status !== 'Hoàn thành') {
    score += 100;
    reasons.push('Đã quá hạn hoàn thành');
  } else {
    const daysLeft = differenceInDays(dueDate, now);
    
    // 2. Near deadline but low progress
    if (daysLeft <= 3 && task.progress < 60) {
      score += 50;
      reasons.push('Sắp đến hạn (3 ngày) nhưng tiến độ < 60%');
    } else if (daysLeft <= 7 && task.progress < 40) {
      score += 30;
      reasons.push('Sắp đến hạn (7 ngày) nhưng tiến độ < 40%');
    }
    
    // 3. Not started but due soon
    if (task.status === 'Chưa thực hiện' && daysLeft <= 5) {
      score += 40;
      reasons.push('Chưa thực hiện nhưng hạn còn dưới 5 ngày');
    }
  }

  // 4. Stale updates
  const daysSinceUpdate = differenceInDays(now, updatedAt);
  if (daysSinceUpdate > 5 && task.status !== 'Hoàn thành') {
    score += 20;
    reasons.push(`Đã ${daysSinceUpdate} ngày chưa cập nhật tiến độ`);
  }

  // 5. High priority
  if (task.priority === 'Khẩn cấp' && task.progress < 100) {
    score += 20;
    reasons.push('Công việc khẩn cấp chưa hoàn thành');
  }

  let level: RiskScore['level'] = 'Thấp';
  if (score >= 80) level = 'Rất cao';
  else if (score >= 50) level = 'Cao';
  else if (score >= 20) level = 'Trung bình';

  return {
    taskId: task.id,
    score,
    reasons,
    level
  };
};

export const getTopRiskyTasks = (tasks: Task[], limit = 10): (Task & { risk: RiskScore })[] => {
  return tasks
    .map(task => ({ ...task, risk: calculateRisk(task) }))
    .filter(t => t.risk.score > 0)
    .sort((a, b) => b.risk.score - a.risk.score)
    .slice(0, limit);
};
