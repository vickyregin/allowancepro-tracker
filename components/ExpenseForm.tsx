
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, Calendar, Tag, FileText, ArrowLeft, Save, Briefcase, MapPin, Users, Building, Info, User as UserIcon, Coffee, UtensilsCrossed, Moon, Hash, Camera, Upload, X, ShieldCheck } from 'lucide-react';
import { Category, Expense } from '../types';

interface ExpenseFormProps {
  onAdd: (expense: Omit<Expense, 'id' | 'userId' | 'userName'>) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAdd }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<Expense>>({
    amount: 0,
    category: Category.Travel,
    date: new Date().toISOString().split('T')[0],
    description: '',
    project: '',
    docNumber: '',
    receiptImage: '',
    note: '',
    stayLocation: '',
    stayFrom: new Date().toISOString().split('T')[0],
    stayTo: new Date().toISOString().split('T')[0],
    travelMode: 'Bus',
    carType: 'Own Car',
    isBreakfast: false,
    isLunch: false,
    isDinner: false,
  });

  const [rawAmount, setRawAmount] = useState('');

  const validateSubFields = () => {
    switch (formData.category) {
      case Category.Travel:
        return formData.fromLocation && formData.toLocation && formData.approxKm;
      case Category.CarMaintenance:
        return formData.carType;
      case Category.Accommodation:
        return formData.stayLocation && formData.stayFrom && formData.stayTo;
      case Category.FoodAllowance:
        return formData.isBreakfast || formData.isLunch || formData.isDinner;
      case Category.DailyAllowance:
      case Category.WarehouseOperation:
        return formData.purpose;
      case Category.ClientEngagement:
        return formData.clientName && formData.personCount && formData.stayLocation && formData.hotelName;
      case Category.TicketBooking:
        return formData.fromLocation && formData.toLocation;
      case Category.AdvancePayment:
        return formData.advanceRecipient && formData.purpose;
      default:
        return true;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!rawAmount || !formData.description || !formData.project || !formData.docNumber || !formData.date || !formData.category) {
      alert("Please fill in all mandatory general fields (Amount, Description, Project, Doc Number, Date, Category).");
      return;
    }

    if (!validateSubFields()) {
      alert(`Please fill in all required sub-fields for the ${formData.category} category.`);
      return;
    }

    onAdd({
      amount: parseFloat(rawAmount),
      category: formData.category as Category,
      date: formData.date as string,
      description: formData.description as string,
      project: formData.project as string,
      docNumber: formData.docNumber as string,
      receiptImage: formData.receiptImage,
      note: formData.note,
      travelMode: formData.travelMode,
      fromLocation: formData.fromLocation,
      toLocation: formData.toLocation,
      approxKm: formData.approxKm,
      carType: formData.carType,
      purpose: formData.purpose,
      stayLocation: formData.stayLocation,
      clientName: formData.clientName,
      personCount: formData.personCount,
      personList: formData.personList,
      hotelName: formData.hotelName,
      stayFrom: formData.stayFrom,
      stayTo: formData.stayTo,
      advanceRecipient: formData.advanceRecipient,
      isBreakfast: formData.isBreakfast,
      isLunch: formData.isLunch,
      isDinner: formData.isDinner
    });

    navigate('/');
  };

  const renderDynamicFields = () => {
    switch (formData.category) {
      case Category.Travel:
        return (
          <div className="space-y-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Travel Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Travel Mode <span className="text-red-500">*</span></label>
                <select
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                  value={formData.travelMode}
                  onChange={e => setFormData({ ...formData, travelMode: e.target.value as any })}
                >
                  <option value="Bus">Bus</option>
                  <option value="Car">Car</option>
                  <option value="Bike">Bike</option>
                  <option value="Flight">Flight</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Approx KM <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  required
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                  placeholder="e.g. 15"
                  value={formData.approxKm || ''}
                  onChange={e => setFormData({ ...formData, approxKm: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">From Location <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                  placeholder="Point A"
                  value={formData.fromLocation || ''}
                  onChange={e => setFormData({ ...formData, fromLocation: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">To Location <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                  placeholder="Point B"
                  value={formData.toLocation || ''}
                  onChange={e => setFormData({ ...formData, toLocation: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case Category.CarMaintenance:
        return (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-semibold text-slate-600 mb-2">Car Type <span className="text-red-500">*</span></label>
            <div className="flex gap-4">
              {['Own Car', 'Company Car'].map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="carType"
                    value={type}
                    checked={formData.carType === type}
                    onChange={() => setFormData({ ...formData, carType: type as any })}
                  />
                  <span className="text-sm text-slate-700">{type}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case Category.Accommodation:
        return (
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-4">
            <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">Accommodation Details</h3>

            <div>
              <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-tight mb-1">Location of Stay <span className="text-red-500">*</span></label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-2.5 text-indigo-400" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 p-2 bg-white border border-indigo-100 rounded-lg text-sm"
                  placeholder="City / Area"
                  value={formData.stayLocation || ''}
                  onChange={e => setFormData({ ...formData, stayLocation: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-tight mb-1">Stay From <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  required
                  className="w-full p-2 bg-white border border-indigo-100 rounded-lg text-sm"
                  value={formData.stayFrom}
                  onChange={e => setFormData({ ...formData, stayFrom: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-tight mb-1">Stay To <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  required
                  className="w-full p-2 bg-white border border-indigo-100 rounded-lg text-sm"
                  value={formData.stayTo}
                  onChange={e => setFormData({ ...formData, stayTo: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case Category.FoodAllowance:
        return (
          <div className="p-4 bg-yellow-50/50 rounded-xl border border-yellow-100 space-y-4">
            <h3 className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-2">Select One Meal <span className="text-red-500">*</span></h3>
            <div className="flex flex-wrap gap-4">
              {[
                { label: 'Breakfast', icon: <Coffee size={14} />, field: 'isBreakfast' },
                { label: 'Lunch', icon: <UtensilsCrossed size={14} />, field: 'isLunch' },
                { label: 'Dinner', icon: <Moon size={14} />, field: 'isDinner' }
              ].map(meal => (
                <label
                  key={meal.field}
                  className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all shadow-sm flex-1 min-w-[120px] ${formData[meal.field as keyof Expense]
                    ? 'bg-yellow-600 border-yellow-600 text-white'
                    : 'bg-white border-yellow-100 text-slate-700 hover:border-yellow-300'
                    }`}
                >
                  <input
                    type="radio"
                    name="mealType"
                    className="hidden"
                    checked={formData[meal.field as keyof Expense] as boolean}
                    onChange={() => setFormData({
                      ...formData,
                      isBreakfast: meal.field === 'isBreakfast',
                      isLunch: meal.field === 'isLunch',
                      isDinner: meal.field === 'isDinner'
                    })}
                  />
                  <div className="flex items-center gap-2 text-sm font-bold mx-auto">
                    {meal.icon} {meal.label}
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case Category.DailyAllowance:
      case Category.WarehouseOperation:
        return (
          <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100">
            <label className="block text-xs font-semibold text-orange-600 mb-1">Purpose / Details <span className="text-red-500">*</span></label>
            <div className="relative">
              <Info size={16} className="absolute left-3 top-2.5 text-orange-400" />
              <input
                type="text"
                required
                className="w-full pl-10 p-2 bg-white border border-orange-100 rounded-lg text-sm"
                placeholder="Reason for expenditure"
                value={formData.purpose || ''}
                onChange={e => setFormData({ ...formData, purpose: e.target.value })}
              />
            </div>
          </div>
        );

      case Category.ClientEngagement:
        return (
          <div className="space-y-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Engagement Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Client Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                  placeholder="Company/Individual"
                  value={formData.clientName || ''}
                  onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">No. of Persons <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  required
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                  value={formData.personCount || ''}
                  onChange={e => setFormData({ ...formData, personCount: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">List of Persons</label>
              <textarea
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                placeholder="Names of attendees..."
                value={formData.personList || ''}
                onChange={e => setFormData({ ...formData, personList: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Hotel/Venue Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                  placeholder="Venue name"
                  value={formData.hotelName || ''}
                  onChange={e => setFormData({ ...formData, hotelName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Location <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                  placeholder="Address/Area"
                  value={formData.stayLocation || ''}
                  onChange={e => setFormData({ ...formData, stayLocation: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case Category.TicketBooking:
        return (
          <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100">
            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Booking Locations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">From Location <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                  value={formData.fromLocation || ''}
                  onChange={e => setFormData({ ...formData, fromLocation: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">To Location <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                  value={formData.toLocation || ''}
                  onChange={e => setFormData({ ...formData, toLocation: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case Category.AdvancePayment:
        return (
          <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100 space-y-4">
            <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">Advance Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">For Whom <span className="text-red-500">*</span></label>
                <div className="relative">
                  <UserIcon size={14} className="absolute left-3 top-2.5 text-rose-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 p-2 bg-white border border-rose-100 rounded-lg text-sm"
                    placeholder="Name of recipient"
                    value={formData.advanceRecipient || ''}
                    onChange={e => setFormData({ ...formData, advanceRecipient: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Purpose <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                  placeholder="e.g. Site Expense"
                  value={formData.purpose || ''}
                  onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size too large. Please select an image under 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, receiptImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFilePicker = () => {
    document.getElementById('receipt-upload')?.click();
  };

  return (
    <div className="max-w-2xl mx-auto md:ml-64 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      {/* Hidden File Input */}
      <input
        type="file"
        id="receipt-upload"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-slate-800">New Entry</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Amount */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Amount <span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <IndianRupee size={18} />
            </div>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={rawAmount}
              onChange={e => setRawAmount(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-slate-50 font-medium text-lg"
            />
          </div>
        </div>

        {/* Project Details */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Project <span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Briefcase size={18} />
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Phoenix Project"
              value={formData.project}
              onChange={e => setFormData({ ...formData, project: e.target.value })}
              className="block w-full pl-10 pr-4 py-3 border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-slate-50 font-medium"
            />
          </div>
        </div>

        {/* Document Number */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Document Number <span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Hash size={18} />
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Bill #12345"
              value={formData.docNumber}
              onChange={e => setFormData({ ...formData, docNumber: e.target.value })}
              className="block w-full pl-10 pr-4 py-3 border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-slate-50 font-medium"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Category <span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Tag size={18} />
            </div>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
              className="block w-full pl-10 pr-4 py-3 border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-slate-50 font-medium"
            >
              {Object.values(Category).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Fields Section */}
        {renderDynamicFields()}

        {/* Date */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Date <span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Calendar size={18} />
            </div>
            <input
              type="date"
              required
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="block w-full pl-10 pr-4 py-3 border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-slate-50 font-medium"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Description <span className="text-red-500">*</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 top-3 left-3 flex items-start pointer-events-none text-slate-400">
              <FileText size={18} />
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Taxi to Airport"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="block w-full pl-10 pr-4 py-3 border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-slate-50 font-medium"
            />
          </div>
        </div>

        {/* Optional Note */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Note (Optional)</label>
          <textarea
            rows={3}
            placeholder="Add any extra details..."
            value={formData.note}
            onChange={e => setFormData({ ...formData, note: e.target.value })}
            className="block w-full px-4 py-3 border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-slate-50 font-medium"
          />
        </div>

        {/* Bill Attachment Placeholder */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Bill Attachment</label>
          <div
            className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-blue-300 transition-all cursor-pointer group mb-10"
            onClick={triggerFilePicker}
          >
            {formData.receiptImage ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200">
                <img src={formData.receiptImage} alt="Receipt Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, receiptImage: '' }); }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors mb-3">
                  <Camera size={28} />
                </div>
                <p className="text-sm font-bold text-slate-600">Capture or Upload Bill</p>
                <p className="text-xs text-slate-400 mt-1">Tap to open camera or browse files</p>

                <div className="flex gap-4 mt-6">
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-lg border border-slate-200 text-[10px] font-bold text-slate-500 shadow-sm">
                    <Camera size={12} /> CAMERA
                  </div>
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-lg border border-slate-200 text-[10px] font-bold text-slate-500 shadow-sm">
                    <Upload size={12} /> GALLERY
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md active:scale-95"
        >
          <Save size={20} />
          Save Expense
        </button>
      </form >
    </div >
  );
};

export default ExpenseForm;
