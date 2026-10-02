import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ShieldCheck, Mail, Lock, Sparkles, ArrowRight, Vote } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      success(`Welcome back, ${user.first_name}.`, 'Authenticated');
      if (user.role === 'VOTER') {
        navigate(from === '/' ? '/voter/dashboard' : from);
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      error(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative text-slate-900">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 border-2 border-emerald-400 p-1 mx-auto mb-4 shadow-md flex items-center justify-center">
            <Vote className="w-7 h-7 text-emerald-700" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-800 font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 inline-block mb-1">
            Secure Simulation Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-slate-900">
            Sign In to TN VoteSecure
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Access demonstration voting rights and election audit ledger
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-8 border-2 border-emerald-300 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. voter@voting.system"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-emerald-600" />}
              className="bg-emerald-50/50 border-emerald-200 text-slate-900"
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-emerald-600" />}
              className="bg-emerald-50/50 border-emerald-200 text-slate-900"
              required
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Vote
            </Button>
          </form>

          {/* Demo Quick Fill Shortcuts */}
          <div className="mt-8 pt-6 border-t border-emerald-100">
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-emerald-800 font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>1-Click Demo Credentials</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('voter@voting.system', 'Voter@123456')}
                className="px-2.5 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-[11px] font-bold text-emerald-900 hover:bg-emerald-100 transition-colors truncate"
              >
                Demo Voter
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('manager@voting.system', 'Manager@123456')}
                className="px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-800 hover:bg-slate-100 transition-colors truncate"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@voting.system', 'Admin@123456')}
                className="px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-800 hover:bg-slate-100 transition-colors truncate"
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Register prompt */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Need a demonstration account?{' '}
          <Link to="/register" className="text-emerald-700 hover:text-emerald-800 font-bold underline">
            Register for voting simulation
          </Link>
        </p>
      </div>
    </div>
  );
};
