
import React from 'react';
import {
    X,
    CheckCircle,
    XCircle,
    MapPin,
    Calendar,
    Briefcase,
    Tag,
    FileText,
    IndianRupee,
    User as UserIcon,
    Clock,
    ExternalLink,
    ChevronRight
} from 'lucide-react';
import { Expense, Category, Role, User } from '../types';

interface ExpenseDetailModalProps {
    expense: Expense;
    onClose: () => void;
    onUpdateStatus?: (id: string, status: 'Approved' | 'Rejected') => void;
    currentUser: User;
}

const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({ expense, onClose, onUpdateStatus, currentUser }) => {
    const isAdmin = currentUser.role === Role.Admin;

    const renderDetailItem = (label: string, value: string | number | boolean | undefined, icon: React.ReactNode) => {
        if (value === undefined || value === null || value === '' || value === false) return null;
        return (
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="bg-white p-2 rounded-lg text-slate-400 shadow-sm shrink-0">
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-semibold text-slate-700">{value.toString()}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${expense.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                                expense.status === 'Rejected' ? 'bg-red-50 text-red-600' :
                                    'bg-amber-50 text-amber-600'
                            }`}>
                            {expense.status === 'Approved' ? <CheckCircle size={24} /> :
                                expense.status === 'Rejected' ? <XCircle size={24} /> :
                                    <Clock size={24} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Expense Details</h3>
                            <p className="text-xs text-slate-500 font-medium tracking-tight">Status: <span className="font-bold uppercase">{expense.status}</span></p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Main Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderDetailItem("User Name", expense.userName, <UserIcon size={16} />)}
                        {renderDetailItem("Project", expense.project, <Briefcase size={16} />)}
                        {renderDetailItem("Category", expense.category, <Tag size={16} />)}
                        {renderDetailItem("Date", new Date(expense.date).toLocaleDateString(), <Calendar size={16} />)}
                        {renderDetailItem("Doc Number", expense.docNumber, <FileText size={16} />)}
                        <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                            <div className="bg-white p-2 rounded-lg text-blue-500 shadow-sm shrink-0">
                                <IndianRupee size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Amount</p>
                                <p className="text-xl font-black text-blue-600 leading-none mt-1">₹{expense.amount.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Description & Notes */}
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Description</p>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm italic text-slate-600 leading-relaxed">
                                "{expense.description}"
                            </div>
                        </div>
                        {expense.note && (
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Additional Note</p>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-600">
                                    {expense.note}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Category Specific Details */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Category Metadata</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {renderDetailItem("Travel Mode", expense.travelMode, <ChevronRight size={14} />)}
                            {renderDetailItem("From", expense.fromLocation, <MapPin size={14} />)}
                            {renderDetailItem("To", expense.toLocation, <MapPin size={14} />)}
                            {renderDetailItem("Approx KM", expense.approxKm, <ChevronRight size={14} />)}
                            {renderDetailItem("Car Type", expense.carType, <ChevronRight size={14} />)}
                            {renderDetailItem("Stay Location", expense.stayLocation, <MapPin size={14} />)}
                            {renderDetailItem("Stay Period", expense.stayFrom && expense.stayTo ? `${new Date(expense.stayFrom).toLocaleDateString()} to ${new Date(expense.stayTo).toLocaleDateString()}` : undefined, <Calendar size={14} />)}
                            {renderDetailItem("Purpose", expense.purpose, <ChevronRight size={14} />)}
                            {renderDetailItem("Client Name", expense.clientName, <UserIcon size={14} />)}
                            {renderDetailItem("Persons", expense.personCount, <UserIcon size={14} />)}
                            {renderDetailItem("Person List", expense.personList, <ChevronRight size={14} />)}
                            {renderDetailItem("Hotel Name", expense.hotelName, <ChevronRight size={14} />)}
                            {renderDetailItem("Advance To", expense.advanceRecipient, <UserIcon size={14} />)}
                            {expense.category === Category.FoodAllowance && (
                                <div className="col-span-full flex gap-2 pt-2">
                                    {expense.isBreakfast && <span className="text-[10px] font-bold bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg border border-yellow-100">BREAKFAST</span>}
                                    {expense.isLunch && <span className="text-[10px] font-bold bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg border border-yellow-100">LUNCH</span>}
                                    {expense.isDinner && <span className="text-[10px] font-bold bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg border border-yellow-100">DINNER</span>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Receipt Image */}
                    {expense.receiptImage && (
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Bill / Receipt Attachment</p>
                            <div className="relative group rounded-2xl overflow-hidden border border-slate-200">
                                <img
                                    src={expense.receiptImage}
                                    alt="Receipt"
                                    className="w-full h-auto max-h-[400px] object-contain bg-slate-50"
                                />
                                <a
                                    href={expense.receiptImage}
                                    download={`Receipt_${expense.docNumber}.png`}
                                    className="absolute bottom-4 right-4 bg-slate-900/80 text-white p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-xs px-4"
                                >
                                    <ExternalLink size={14} />  Open Full
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {isAdmin && expense.status === 'Pending' && onUpdateStatus && (
                    <div className="p-6 border-t border-slate-100 flex gap-4 bg-slate-50/50">
                        <button
                            onClick={() => { onUpdateStatus(expense.id, 'Rejected'); onClose(); }}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-red-100 text-red-600 font-bold rounded-2xl hover:bg-red-50 transition-all active:scale-95"
                        >
                            <XCircle size={20} /> Reject Claim
                        </button>
                        <button
                            onClick={() => { onUpdateStatus(expense.id, 'Approved'); onClose(); }}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
                        >
                            <CheckCircle size={20} /> Approve Claim
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseDetailModal;
