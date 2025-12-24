
import React, { useState } from 'react';
import { TrendingUp, Mail, Lock, User as UserIcon, Shield, Loader2 } from 'lucide-react';
import { Role, User } from '../types';
import { supabase } from '../services/supabase';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>(Role.User);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanInput = email.trim();
    const cleanPassword = password.trim();

    try {
      if (isRegistering) {
        // Create user in the database table
        const { data, error } = await supabase
          .from('userlist')
          .insert([
            {
              name: name.trim(),
              email: cleanInput || null,
              password: cleanPassword,
              role,
              is_active: true
            }
          ])
          .select()
          .single();

        if (error) {
          if (error.code === '23505') throw new Error('Email or Username already exists');
          throw error;
        }
        onLogin(data as User);
      } else {
        // Query database for case-insensitive matching (matches email OR name)
        const { data, error } = await supabase
          .from('userlist')
          .select('*')
          .or(`email.ilike."${cleanInput}",name.ilike."${cleanInput}"`)
          .eq('password', cleanPassword)
          .single();

        if (error || !data) {
          throw new Error('Invalid credentials');
        }

        const user: User = {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          isActive: data.is_active // Map from database snake_case
        };

        if (!user.isActive) {
          setError('Your account has been disabled. Please contact the administrator.');
          return;
        }

        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans ring-1 ring-slate-200">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl shadow-blue-100/50 border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="p-8 pb-0 text-center mb-0 mt-4">
          <div className="inline-block p-4 bg-white rounded-3xl shadow-lg border border-slate-50 mb-6 group transition-transform hover:scale-105">
            <img
              src="https://flashkartindia.com/img/logo.jpg"
              alt="Flashkart Logo"
              className="h-16 w-auto object-contain"
            />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">AllowancePro</h2>
          <p className="text-slate-500 mt-1 text-sm font-medium">Claims & Reimbursement Portal</p>
        </div>

        <form onSubmit={handleAuth} className="p-8 pt-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h2>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg animate-shake">
              {error}
            </div>
          )}

          {isRegistering && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name / Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="text" required placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={name} onChange={e => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {isRegistering ? 'Email Address (Optional)' : 'Email / Username'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                required={!isRegistering}
                placeholder={isRegistering ? "your@email.com (optional)" : "Email or Username"}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="password" required placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              isRegistering ? 'Register Now' : 'Sign In'
            )}
          </button>

          <p className="text-center text-sm text-slate-500 mt-6">
            {isRegistering ? 'Already have an account?' : 'New here?'}
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
              className="ml-1 text-blue-600 font-bold hover:underline"
            >
              {isRegistering ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
