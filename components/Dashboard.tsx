
import React, { useState, useMemo, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { ChevronLeft, ChevronRight, Sparkles, AlertCircle, Users, Filter, User as UserIcon } from 'lucide-react';
import { Expense, Category, User, Role } from '../types';
import { getFinancialInsights } from '../services/geminiService';

interface DashboardProps {
  expenses: Expense[];
  users: User[];
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
  currentUser: User;
}

const COLORS = ['#2563eb', '#4f46e5', '#7c3aed', '#c026d3', '#db2777', '#dc2626', '#d97706'];

const Dashboard: React.FC<DashboardProps> = ({ expenses, users, currentMonth, setCurrentMonth, currentUser }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');

  const isAdmin = currentUser.role === Role.Admin;

  // Use users prop instead of localStorage
  const allUsers = users;

  // Get all unique projects from expenses
  const allProjects = useMemo(() => {
    const projects = new Set(expenses.map(e => e.project).filter(Boolean));
    return Array.from(projects).sort();
  }, [expenses]);

  const monthLabel = useMemo(() => {
    const [year, month] = currentMonth.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [currentMonth]);

  // Combined filtering: Month + Access Level + Specific User Selection + Project filter
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const monthMatch = e.date.startsWith(currentMonth);
      let userMatch = isAdmin ? true : e.userId === currentUser.id;

      // If admin has selected a specific user
      if (isAdmin && selectedUserId !== 'all') {
        userMatch = e.userId === selectedUserId;
      }

      // Project filter match
      const projectMatch = selectedProject === 'all' || e.project === selectedProject;

      return monthMatch && userMatch && projectMatch;
    });
  }, [expenses, currentMonth, isAdmin, currentUser.id, selectedUserId, selectedProject]);

  const totalSpent = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const uniqueUsersInView = useMemo(() => {
    return new Set(filteredExpenses.map(e => e.userId)).size;
  }, [filteredExpenses]);

  const dataByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    Object.values(Category).forEach(cat => map[cat] = 0);
    filteredExpenses.forEach(e => map[e.category] += e.amount);

    return Object.entries(map)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [filteredExpenses]);

  const userSpendingBreakdown = useMemo(() => {
    if (!isAdmin) return [];
    // Only show the list if we are looking at 'all' users
    const map: Record<string, { id: string, name: string, total: number, count: number }> = {};

    // We use all expenses for the month to build the summary table
    const monthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));

    monthExpenses.forEach(e => {
      if (!map[e.userId]) {
        map[e.userId] = { id: e.userId, name: e.userName, total: 0, count: 0 };
      }
      map[e.userId].total += e.amount;
      map[e.userId].count += 1;
    });

    // Create a copy before sorting to avoid read-only errors
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [expenses, currentMonth, isAdmin]);

  const changeMonth = (offset: number) => {
    const [year, month] = currentMonth.split('-').map(Number);
    const d = new Date(year, month - 1 + offset);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    setInsights(null);
  };

  const generateInsights = async () => {
    setLoadingInsights(true);
    const result = await getFinancialInsights(filteredExpenses);
    setInsights(result);
    setLoadingInsights(false);
  };

  const selectedUserName = useMemo(() => {
    if (selectedUserId === 'all') return 'All Users';
    return allUsers.find(u => u.id === selectedUserId)?.name || 'Unknown User';
  }, [selectedUserId, allUsers]);

  // Reset insights when filter changes
  useEffect(() => {
    setInsights(null);
  }, [selectedUserId, selectedProject]);

  return (
    <div className="space-y-6 md:ml-64">
      {/* Filters Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {/* Month Selector */}
        <div className="flex-1 flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-slate-200">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center px-4">
            <h2 className="text-sm font-bold text-slate-800 leading-none">{monthLabel}</h2>
          </div>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Project Filter */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Filter size={16} />
          </div>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold text-slate-700 appearance-none"
          >
            <option value="all">All Projects</option>
            {allProjects.map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
        </div>

        {/* User Filter (Admin Only) */}
        {isAdmin && (
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <UserIcon size={16} />
            </div>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold text-slate-700 appearance-none"
            >
              <option value="all">View All Members</option>
              {allUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Active Filter Indicator */}
      {isAdmin && selectedUserId !== 'all' && (
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <UserIcon size={16} />
            <span>Viewing details for: <span className="font-bold">{selectedUserName}</span></span>
          </div>
          <button
            onClick={() => setSelectedUserId('all')}
            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Spent</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">${totalSpent.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{isAdmin && selectedUserId === 'all' ? 'Team Members' : 'Categories'}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-bold text-blue-600">{isAdmin && selectedUserId === 'all' ? uniqueUsersInView : dataByCategory.length}</p>
            {isAdmin && selectedUserId === 'all' && <Users size={16} className="text-blue-300" />}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Records</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{filteredExpenses.length}</p>
        </div>
      </div>

      {/* User Wise Summary (Admin Only - showing all context even if filtered) */}
      {isAdmin && selectedUserId === 'all' && userSpendingBreakdown.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-800">Team Spending Breakdown</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSpendingBreakdown.map((user, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedUserId(user.id)}
                className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div>
                  <p className="text-sm font-bold text-slate-700 group-hover:text-blue-700">{user.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-tight">{user.count} transactions</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">${user.total.toLocaleString()}</p>
                  <div className="flex items-center justify-end text-[10px] text-slate-400">
                    {totalSpent > 0 ? ((user.total / totalSpent) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chart Section */}
      <div className="space-y-6">
        {/* Spending by Category - Half Width on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
            <h3 className="text-base font-semibold text-slate-800 mb-4">
              {selectedUserId === 'all' ? 'Spending by Category' : `${selectedUserName}'s Categories`}
            </h3>
            {dataByCategory.length > 0 ? (
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dataByCategory.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <AlertCircle size={40} className="mb-2" />
                <p>No transactions recorded</p>
              </div>
            )}
          </div>

          {/* Placeholder or info card to balance the top row if needed, 
              or we can let Category take full width too. 
              The user specifically asked for Budget Usage to be 100% below. */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center items-center text-center space-y-2">
            <div className="bg-blue-50 p-4 rounded-full text-blue-600 mb-2">
              <Sparkles size={32} />
            </div>
            <h4 className="text-lg font-bold text-slate-800">Monthly Performance</h4>
            <p className="text-sm text-slate-500 max-w-xs">
              Track your budget allocation across different categories to optimize your standard of spending.
            </p>
          </div>
        </div>

        {/* Top Budget Usage - 100% Width Below */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[400px] w-full">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Top Budget Usage</h3>
          {dataByCategory.length > 0 ? (
            <div className="h-80 sm:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...dataByCategory].sort((a, b) => b.value - a.value).slice(0, 8)}>
                  <XAxis dataKey="name" fontSize={12} interval={0} stroke="#94a3b8" />
                  <YAxis fontSize={12} stroke="#94a3b8" />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <AlertCircle size={40} className="mb-2" />
              <p>No transactions recorded</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-600" size={24} />
            <h3 className="text-lg font-bold text-slate-800">
              {selectedUserId === 'all' ? 'Organizational Analysis' : `${selectedUserName}'s Profile Analysis`}
            </h3>
          </div>
          <button
            onClick={generateInsights}
            disabled={loadingInsights || filteredExpenses.length === 0}
            className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {loadingInsights ? 'AI Thinking...' : insights ? 'Refresh Analysis' : 'Get AI Insights'}
          </button>
        </div>

        {loadingInsights ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-indigo-200/50 rounded w-3/4"></div>
            <div className="h-4 bg-indigo-200/50 rounded w-5/6"></div>
            <div className="h-4 bg-indigo-200/50 rounded w-2/3"></div>
          </div>
        ) : insights ? (
          <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
            {insights}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">
            {filteredExpenses.length > 0
              ? `Let Gemini analyze spending patterns for ${selectedUserId === 'all' ? 'the entire team' : selectedUserName}.`
              : "No data available to analyze for this selection."}
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
