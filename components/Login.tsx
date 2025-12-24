
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-blue-600 p-8 text-center text-white">
          <div className="inline-flex p-3 bg-white/20 rounded-2xl mb-4">
            <TrendingUp size={32} />
          </div>
          <h1 className="text-2xl font-bold">AllowancePro</h1>
          <p className="text-blue-100 mt-1">Personal & Corporate Expense Tracker</p>
        </div>

        <form onSubmit={handleAuth} className="p-8 space-y-4">
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
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 mt-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Processing...</span>
              </>
            ) : (
              isRegistering ? 'Sign Up' : 'Sign In'
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
