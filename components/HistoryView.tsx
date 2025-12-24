
import React, { useState, useMemo } from 'react';
import {
  Search,
  Trash2,
  Calendar as CalendarIcon,
  MapPin,
  Car,
  Home,
  Utensils,
  Settings,
  Wrench,
  User as UserIcon,
  Briefcase,
  Download,
  Package,
  FileCheck,
  CreditCard,
  Users,
  Ticket,
  UtensilsCrossed
} from 'lucide-react';
import { Expense, Category, User, Role } from '../types';

interface HistoryViewProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  currentUser: User;
}

const CategoryIcon = ({ category, size = 18 }: { category: Category, size?: number }) => {
  switch (category) {
    case Category.Travel: return <MapPin size={size} className="text-blue-500" />;
    case Category.Accommodation: return <Home size={size} className="text-indigo-500" />;
    case Category.DailyAllowance: return <Utensils size={size} className="text-orange-500" />;
    case Category.FoodAllowance: return <UtensilsCrossed size={size} className="text-yellow-600" />;
    case Category.CarMaintenance: return <Car size={size} className="text-slate-700" />;
    case Category.BikeMaintenance: return <Settings size={size} className="text-slate-600" />;
    case Category.Repair: return <Wrench size={size} className="text-red-500" />;
    case Category.WarehouseOperation: return <Package size={size} className="text-amber-600" />;
    case Category.Consumables: return <FileCheck size={size} className="text-teal-600" />;
    case Category.AdvancePayment: return <CreditCard size={size} className="text-rose-600" />;
    case Category.ClientEngagement: return <Users size={size} className="text-emerald-600" />;
    case Category.TicketBooking: return <Ticket size={size} className="text-purple-600" />;
    default: return <Search size={size} className="text-slate-400" />;
  }
};

const HistoryView: React.FC<HistoryViewProps> = ({ expenses, onDelete, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');

  const isAdmin = currentUser.role === Role.Admin;

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.project.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
      const userMatch = isAdmin ? true : e.userId === currentUser.id;
      return matchesSearch && matchesCategory && userMatch;
    });
  }, [expenses, searchTerm, selectedCategory, isAdmin, currentUser.id]);

  const downloadCSV = () => {
    if (filteredExpenses.length === 0) return;

    // Comprehensive Headers for Admin
    const headers = [
      "Date", "User Name", "Project", "Doc Number", "Category", "Amount", "Description",
      "Travel Mode", "From", "To", "KM", "Car Type",
      "Stay Location", "Purpose/Detail", "Client Name", "No Persons",
      "Person List", "Hotel Name", "Recipient", "Breakfast", "Lunch", "Dinner", "Notes"
    ];

    const rows = filteredExpenses.map(e => [
      e.date,
      `"${e.userName.replace(/"/g, '""')}"`,
      `"${e.project.replace(/"/g, '""')}"`,
      `"${(e.docNumber || '').replace(/"/g, '""')}"`,
      e.category,
      e.amount.toFixed(2),
      `"${e.description.replace(/"/g, '""')}"`,
      e.travelMode || "",
      `"${(e.fromLocation || "").replace(/"/g, '""')}"`,
      `"${(e.toLocation || "").replace(/"/g, '""')}"`,
      e.approxKm || "",
      e.carType || "",
      `"${(e.stayLocation || "").replace(/"/g, '""')}"`,
      `"${(e.purpose || "").replace(/"/g, '""')}"`,
      `"${(e.clientName || "").replace(/"/g, '""')}"`,
      e.personCount || "",
      `"${(e.personList || "").replace(/"/g, '""')}"`,
      `"${(e.hotelName || "").replace(/"/g, '""')}"`,
      `"${(e.advanceRecipient || "").replace(/"/g, '""')}"`,
      e.isBreakfast ? "Yes" : "No",
      e.isLunch ? "Yes" : "No",
      e.isDinner ? "Yes" : "No",
      `"${(e.note || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Allowance_Full_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSubText = (e: Expense) => {
    const details = [];
    if (e.fromLocation || e.toLocation) details.push(`${e.fromLocation || '?'} -> ${e.toLocation || '?'}`);
    if (e.travelMode) details.push(`Mode: ${e.travelMode}`);
    if (e.approxKm) details.push(`${e.approxKm}KM`);
    if (e.carType) details.push(e.carType);
    if (e.stayLocation) details.push(`At: ${e.stayLocation}`);
    if (e.purpose) details.push(`Ref: ${e.purpose}`);
    if (e.clientName) details.push(`Client: ${e.clientName}`);
    if (e.advanceRecipient) details.push(`To: ${e.advanceRecipient}`);

    // Food details
    const meals = [];
    if (e.isBreakfast) meals.push('Breakfast');
    if (e.isLunch) meals.push('Lunch');
    if (e.isDinner) meals.push('Dinner');
    if (meals.length > 0) details.push(`Meals: ${meals.join(', ')}`);

    return details.length > 0 ? details.join(' | ') : null;
  };

  return (
    <div className="space-y-6 md:ml-64">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Transaction History</h2>
          <p className="text-sm text-slate-500">{isAdmin ? 'Viewing all registered users' : 'Your personal records'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <button
              onClick={downloadCSV}
              disabled={filteredExpenses.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              Export Full Excel
            </button>
          )}

          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder={isAdmin ? "Search user, project, desc..." : "Search expenses..."}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value as any)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
          >
            <option value="All">All Categories</option>
            {Object.values(Category).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredExpenses.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <CategoryIcon category={expense.category} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{expense.description}</h4>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 mt-1">
                      {isAdmin && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                          <UserIcon size={10} /> {expense.userName}
                        </span>
                      )}
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                        <Briefcase size={10} /> {expense.project}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <CalendarIcon size={12} />
                        {new Date(expense.date).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                        # {expense.docNumber}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                        • {expense.category}
                      </span>
                    </div>
                    {/* Specific details display */}
                    {getSubText(expense) && (
                      <p className="text-[10px] text-slate-500 italic mt-1 bg-slate-50 px-2 py-0.5 rounded-md inline-block">
                        {getSubText(expense)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">₹{expense.amount.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this entry?')) onDelete(expense.id);
                    }}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <p className="text-lg font-medium">No records found</p>
            <p className="text-sm">Try changing your search or category filter</p>
          </div>
        )}
      </div>
    </div >
  );
};

export default HistoryView;
