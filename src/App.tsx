import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { AuthGuard } from './components/AuthGuard';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import Tasks from './pages/Tasks';
import WorkLogs from './pages/WorkLogs';
import Notifications from './pages/Notifications';
import ActivityLogs from './pages/ActivityLogs';
import Settings from './pages/Settings';

import Risks from './pages/Risks';
import Users from './pages/Users';
import Export from './pages/Export';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AuthGuard><Layout /></AuthGuard>}>
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="logs" element={<WorkLogs />} />
            <Route path="risks" element={<Risks />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="export" element={<Export />} />
            <Route path="activity" element={<AuthGuard requireAdmin><ActivityLogs /></AuthGuard>} />
            <Route path="users" element={<AuthGuard requireAdmin><Users /></AuthGuard>} />
            <Route path="settings" element={<AuthGuard requireAdmin><Settings /></AuthGuard>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
