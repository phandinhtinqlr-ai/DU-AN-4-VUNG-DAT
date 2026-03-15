import React, { useEffect, useState } from 'react';
import { firebaseService } from '../services/firebaseService';
import { UserProfile } from '../types';
import { User, Shield, Mail, Phone, Edit2, Check, X, Plus, Save } from 'lucide-react';

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<'admin' | 'editor'>('editor');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<UserProfile>>({
    displayName: '',
    email: '',
    role: 'editor',
    uid: ''
  });

  useEffect(() => {
    const loadUsers = async () => {
      const data = await firebaseService.getAllUsers();
      setUsers(data);
      setLoading(false);
    };
    loadUsers();
  }, []);

  const handleUpdateRole = async (uid: string) => {
    await firebaseService.updateUserProfile(uid, { role: editRole });
    setUsers(users.map(u => u.uid === uid ? { ...u, role: editRole } : u));
    setEditingId(null);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.displayName) {
      alert('Vui lòng nhập đầy đủ thông tin (Email, Tên)');
      return;
    }
    // Auto-generate UID if not provided (using timestamp for simplicity in this demo)
    const uid = newUser.uid || `user_${Date.now()}`;
    const profile: UserProfile = {
      ...newUser as UserProfile,
      uid,
      status: 'Active',
      createdAt: new Date().toISOString()
    };
    await firebaseService.createUserProfile(profile);
    setUsers([...users, profile]);
    setIsAddModalOpen(false);
    setNewUser({ displayName: '', email: '', role: 'editor', uid: '' });
  };

  const handleDeleteUser = async (uid: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      await firebaseService.deleteUserProfile(uid);
      setUsers(users.filter(u => u.uid !== uid));
    }
  };

  if (loading) return <div>Đang tải danh sách tài khoản...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Quản lý tài khoản</h3>
          <p className="text-sm text-slate-500">Quản lý quyền hạn và thông tin người dùng</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-bana-blue px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-bana-dark"
        >
          <Plus className="h-4 w-4" />
          Thêm tài khoản
        </button>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bana-dark/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Thêm tài khoản mới</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="rounded-full p-2 hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Họ và tên</label>
                <input 
                  type="text" 
                  required
                  value={newUser.displayName}
                  onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-bana-blue focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Email</label>
                <input 
                  type="email" 
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-bana-blue focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Quyền hạn</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'editor' })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-bana-blue focus:outline-none"
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl px-6 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-bana-blue px-8 py-2 text-sm font-bold text-white shadow-lg hover:bg-bana-dark"
                >
                  <Save className="h-4 w-4" />
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <div key={user.uid} className="glass-card group rounded-3xl p-6 transition-all hover:shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bana-blue/10 text-bana-blue">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="h-full w-full rounded-2xl object-cover" />
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{user.displayName}</h4>
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <Shield className="h-3 w-3" />
                    {user.role}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteUser(user.uid)}
                className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-red-400 hover:bg-red-50 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Mail className="h-4 w-4" />
                {user.email}
              </div>
              {user.phoneNumber && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Phone className="h-4 w-4" />
                  {user.phoneNumber}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between">
              {editingId === user.uid ? (
                <div className="flex w-full items-center gap-2">
                  <select 
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as 'admin' | 'editor')}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button 
                    onClick={() => handleUpdateRole(user.uid)}
                    className="rounded-lg bg-emerald-500 p-1.5 text-white hover:bg-emerald-600"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setEditingId(null)}
                    className="rounded-lg bg-slate-200 p-1.5 text-slate-600 hover:bg-slate-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setEditingId(user.uid);
                    setEditRole(user.role);
                  }}
                  className="flex items-center gap-2 text-xs font-bold text-bana-blue hover:underline"
                >
                  <Edit2 className="h-3 w-3" />
                  Thay đổi quyền hạn
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;
