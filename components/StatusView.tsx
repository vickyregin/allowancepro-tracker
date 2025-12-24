
import React, { useState, useMemo } from 'react';
import {
    CheckCircle,
    XCircle,
    Clock,
    Search,
    TrendingUp,
    Filter,
    ArrowRight,
    IndianRupee,
    Eye
} from 'lucide-react';
import { Expense, User, Role } from '../types';
import ExpenseDetailModal from './ExpenseDetailModal';

interface StatusViewProps {
    expenses: Expense[];
    currentUser: User;
    onUpdateStatus?: (id: string, status: 'Approved' | 'Rejected') => void;
}

const StatusView: React.FC<StatusViewProps> = ({ expenses, currentUser, onUpdateStatus }) => {
    const [activeTab, setActiveTab] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

    const isAdmin = currentUser.role === Role.Admin;

    const filteredExpenses = useMemo(() => {
        return expenses.filter(e => {
            const matchStatus = e.status === activeTab;
            const userMatch = isAdmin ? true : e.userId === currentUser.id;
            const matchSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.userName.toLowerCase().includes(searchTerm.toLowerCase());
            return matchStatus && userMatch && matchSearch;
        });
    }, [expenses, activeTab, currentUser.id, isAdmin, searchTerm]);

    const stats = useMemo(() => {
        const userExpenses = isAdmin ? expenses : expenses.filter(e => e.userId === currentUser.id);
        return {
            Pending: userExpenses.filter(e => e.status === 'Pending').length,
            Approved: userExpenses.filter(e => e.status === 'Approved').length,
            Rejected: userExpenses.filter(e => e.status === 'Rejected').length,
        };
    }, [expenses, currentUser.id, isAdmin]);

    return (
        <div className="space-y-6 md:ml-64">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Claim Status</h2>
                    <p className="text-sm text-slate-500">Track and manage reimbursement approvals</p>
                </div>

                <div className="relative flex-1 max-w-xs">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search claims..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-2xl w-full sm:w-fit">
                {(['Pending', 'Approved', 'Rejected'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setActiveTab(status)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === status
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {status === 'Pending' && <Clock size={16} />}
                        {status === 'Approved' && <CheckCircle size={16} />}
                        {status === 'Rejected' && <XCircle size={16} />}
                        {status}
                        <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === status ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-500'
                            }`}>
                            {stats[status]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((expense) => (
                        <div
                            key={expense.id}
                            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all group lg:flex items-center justify-between cursor-pointer"
                            onClick={() => setSelectedExpense(expense)}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${activeTab === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                                    activeTab === 'Rejected' ? 'bg-red-50 text-red-600' :
                                        'bg-amber-50 text-amber-600'
                                    }`}>
                                    {activeTab === 'Approved' ? <CheckCircle size={24} /> :
                                        activeTab === 'Rejected' ? <XCircle size={24} /> :
                                            <Clock size={24} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                                        {expense.description}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                        <span className="text-xs text-slate-500 font-medium">#{expense.docNumber}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{expense.project}</span>
                                        {isAdmin && (
                                            <span className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1">
                                                BY: {expense.userName}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 lg:mt-0 flex items-center justify-between lg:justify-end gap-6 border-t lg:border-none pt-3 lg:pt-0">
                                <div className="text-left lg:text-right">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Amount</p>
                                    <p className="text-lg font-black text-slate-900 leading-none mt-1">₹{expense.amount.toLocaleString()}</p>
                                </div>

                                <div className={`px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${activeTab === 'Approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                    activeTab === 'Rejected' ? 'bg-red-50 border-red-100 text-red-600' :
                                        'bg-amber-50 border-amber-100 text-amber-600'
                                    }`}>
                                    {isAdmin && <Eye size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    {activeTab}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                        <div className="bg-white w-16 h-16 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Filter size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">No {activeTab} claims</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">
                            There are currently no expenses in this status category matching your search.
                        </p>
                    </div>
                )}
            </div>

            {selectedExpense && (
                <ExpenseDetailModal
                    expense={selectedExpense}
                    onClose={() => setSelectedExpense(null)}
                    onUpdateStatus={onUpdateStatus}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
};

export default StatusView;
