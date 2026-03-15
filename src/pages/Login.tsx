import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { Mountain, LogIn, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bana-dark">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://picsum.photos/seed/banahills/1920/1080?blur=2" 
          alt="Ba Na Hills" 
          className="h-full w-full object-cover opacity-40"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bana-dark via-bana-dark/50 to-transparent"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md px-6"
      >
        <div className="glass-card rounded-3xl p-10 text-center">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-bana-gold shadow-2xl">
              <Mountain className="h-12 w-12 text-bana-dark" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-bana-blue">SUN WORLD</h1>
            <p className="font-bold tracking-[0.3em] text-bana-gold">BA NA HILLS</p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800">Quản lý Tiến độ Dự án</h2>
            <p className="text-sm text-slate-500">Hệ thống quản lý nội bộ 4 vùng đất</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-left text-sm text-red-600">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-bana-blue py-4 font-bold text-white shadow-xl transition-all hover:bg-bana-dark hover:shadow-2xl disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                Đăng nhập bằng Google
              </>
            )}
          </button>

          <p className="mt-8 text-xs text-slate-400">
            Bản quyền thuộc về Sun World Ba Na Hills &copy; 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
