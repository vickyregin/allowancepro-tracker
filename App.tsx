
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  TrendingUp,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Users,
  Loader2
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import HistoryView from './components/HistoryView';
import UserManagement from './components/UserManagement';
import StatusView from './components/StatusView';
import Login from './components/Login';
import { Expense, Category, User, Role } from './types';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('allowance_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [authLoading, setAuthLoading] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Fetch expenses and users
  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      setAuthLoading(true);

      // 1. Fetch Expenses
      let query = supabase.from('expenses').select('*');
      if (currentUser.role !== Role.Admin) {
        query = query.eq('user_id', currentUser.id);
      }

      const { data: expData, error: expError } = await query.order('date', { ascending: false });
      if (!expError && expData) {
        setExpenses(expData.map(e => ({
          ...e,
          id: e.id,
          userId: e.user_id,
          userName: e.user_name,
          amount: e.amount,
          category: e.category,
          date: e.date,
          description: e.description,
          project: e.project,
          docNumber: e.doc_number,
          receiptImage: e.receipt_image,
          status: e.status || 'Pending',
          note: e.note,
          travelMode: e.travel_mode,
          fromLocation: e.from_location,
          toLocation: e.to_location,
          approxKm: e.approx_km,
          carType: e.car_type,
          stayLocation: e.stay_location,
          clientName: e.client_name,
          personCount: e.person_count,
          personList: e.person_list,
          hotelName: e.hotel_name,
          stayFrom: e.stay_from,
          stayTo: e.stay_to,
          advanceRecipient: e.advance_recipient,
          isBreakfast: e.is_breakfast,
          isLunch: e.is_lunch,
          isDinner: e.is_dinner
        })));
      }

      // 2. Fetch Users (Admins only)
      if (currentUser.role === Role.Admin) {
        const { data: userData } = await supabase.from('userlist').select('*').order('name');
        if (userData) {
          setUsers(userData.map(u => ({
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role,
            isActive: u.is_active
          })));
        }
      }

      setAuthLoading(false);
    };

    fetchData();
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('allowance_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('allowance_session');
  };

  const addExpense = async (newExpense: Omit<Expense, 'id' | 'userId' | 'userName'>) => {
    if (!currentUser) return;

    const dbExpense = {
      user_id: currentUser.id,
      user_name: currentUser.name,
      amount: newExpense.amount,
      category: newExpense.category,
      date: newExpense.date,
      description: newExpense.description,
      project: newExpense.project,
      doc_number: newExpense.docNumber,
      receipt_image: newExpense.receiptImage,
      note: newExpense.note,
      travel_mode: newExpense.travelMode,
      from_location: newExpense.fromLocation,
      to_location: newExpense.toLocation,
      approx_km: newExpense.approxKm,
      car_type: newExpense.carType,
      purpose: newExpense.purpose,
      stay_location: newExpense.stayLocation,
      client_name: newExpense.clientName,
      person_count: newExpense.personCount,
      person_list: newExpense.personList,
      hotel_name: newExpense.hotelName,
      stay_from: newExpense.stayFrom,
      stay_to: newExpense.stayTo,
      advance_recipient: newExpense.advanceRecipient,
      is_breakfast: newExpense.isBreakfast,
      is_lunch: newExpense.isLunch,
      is_dinner: newExpense.isDinner,
      status: 'Pending'
    };

    const { data, error } = await supabase
      .from('expenses')
      .insert([dbExpense])
      .select()
      .single();

    if (error) {
      alert('Failed to save expense: ' + error.message);
      return;
    }

    const mapped: Expense = {
      ...data,
      userId: data.user_id,
      userName: data.user_name,
      travelMode: data.travel_mode,
      fromLocation: data.from_location,
      toLocation: data.to_location,
      approxKm: data.approx_km,
      carType: data.car_type,
      stayLocation: data.stay_location,
      clientName: data.client_name,
      personCount: data.person_count,
      personList: data.person_list,
      hotelName: data.hotel_name,
      stayFrom: data.stay_from,
      stayTo: data.stay_to,
      docNumber: data.doc_number,
      receiptImage: data.receipt_image,
      advanceRecipient: data.advance_recipient,
      isBreakfast: data.is_breakfast,
      isLunch: data.is_lunch,
      isDinner: data.is_dinner,
      status: data.status || 'Pending'
    };

    setExpenses(prev => [mapped, ...prev]);
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (!error) {
      setExpenses(prev => prev.filter(e => e.id !== id));
    } else {
      alert('Error deleting expense: ' + error.message);
    }
  };

  const updateExpenseStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      const { data, error, status: responseStatus } = await supabase
        .from('expenses')
        .update({ status })
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        alert('Update failed: No record found or permission denied.');
        return;
      }

      // Success - update local state
      setExpenses(prev => prev.map(e => e.id === id ? { ...e, status } : e));
      console.log(`Status updated to ${status} for ${id}`);
    } catch (err: any) {
      console.error('Update Error:', err);
      alert('Failed to update status in Database: ' + (err.message || 'Unknown Error'));
    }
  };

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1 rounded-lg border border-slate-100 shadow-sm">
                <img
                  src="https://flashkartindia.com/img/logo.jpg"
                  alt="Flashkart Logo"
                  className="h-8 w-auto object-contain"
                />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AllowancePro {currentUser.role === Role.Admin && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-tighter ml-2">Admin</span>}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-slate-900 leading-none">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 leading-none mt-1 uppercase tracking-wider">{currentUser.role}</p>
              </div>
              <div className="bg-slate-100 p-2 rounded-full text-slate-600">
                <UserIcon size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 mb-20 md:mb-0">
          <Routes>
            <Route path="/" element={
              <Dashboard
                expenses={expenses}
                users={users}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
                currentUser={currentUser}
              />
            } />
            <Route path="/add" element={
              <ExpenseForm onAdd={addExpense} />
            } />
            <Route path="/history" element={
              <HistoryView
                expenses={expenses}
                onDelete={deleteExpense}
                onUpdateStatus={updateExpenseStatus}
                currentUser={currentUser}
              />
            } />
            {currentUser.role === Role.Admin && (
              <Route path="/users" element={
                <UserManagement
                  users={users}
                  onToggleStatus={toggleUserStatus}
                  onDeleteUser={deleteUser}
                />
              } />
            )}
            <Route path="/status" element={
              <StatusView
                expenses={expenses}
                currentUser={currentUser}
                onUpdateStatus={updateExpenseStatus}
              />
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Bottom Navigation for Mobile */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 pb-safe md:hidden z-50">
          <div className="flex justify-between items-end max-w-md mx-auto">
            <NavLink to="/" icon={<LayoutDashboard size={22} />} label="Status" />
            <NavLink to="/history" icon={<History size={22} />} label="List" />
            <NavLink to="/status" icon={<ShieldCheck size={22} />} label="Status" />

            <div className="flex-1 flex flex-col items-center mb-1">
              <Link to="/add" className="bg-blue-600 text-white p-1 rounded-full shadow-lg shadow-blue-200 -mt-6 active:scale-90 transition-transform">
                <PlusCircle size={24} />
              </Link>
              <span className="text-[10px] font-bold text-slate-400 mt-1">Expense</span>
            </div>

            {currentUser.role === Role.Admin && (
              <NavLink to="/users" icon={<Users size={22} />} label="Users" />
            )}

            <button
              onClick={handleLogout}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-1 text-slate-400 hover:text-red-500 transition-colors"
            >
              <LogOut size={22} />
              <span className="text-[10px] font-bold">Exit</span>
            </button>
          </div>
        </nav>

        {/* Sidebar for Desktop */}
        <aside className="hidden md:flex fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200 flex-col p-4">
          <div className="space-y-2">
            <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <SidebarLink to="/add" icon={<PlusCircle size={20} />} label="Add Expense" />
            <SidebarLink to="/history" icon={<History size={20} />} label="History" />
            <SidebarLink to="/status" icon={<ShieldCheck size={20} />} label="Claim Status" />
            {currentUser.role === Role.Admin && (
              <div className="pt-4 mt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-4">
                  <ShieldCheck size={12} /> Management
                </div>
                <SidebarLink to="/users" icon={<Users size={20} />} label="User List" />
              </div>
            )}
          </div>
          <div className="mt-auto pt-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </aside>
      </div>
    </HashRouter>
  );
};

const NavLink: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} className="flex-1 flex flex-col items-center justify-center py-2 gap-1 transition-colors">
      <div className={`transition-all ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
        {label}
      </span>
    </Link>
  );
};

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${isActive
        ? 'bg-blue-50 text-blue-600 font-semibold'
        : 'text-slate-600 hover:bg-slate-50'
        }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default App;
