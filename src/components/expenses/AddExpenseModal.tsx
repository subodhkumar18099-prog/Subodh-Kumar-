/**
 * Sunvault Expenses Manager - Add Expense Modal Form
 * Strictly fulfills Sections 4, 5, 6:
 * - Site Name: BLANK by default (no prefilled values, no auto-select, manual typing allowed, can be empty)
 * - Employee Name: BLANK by default (never auto-filled, manual entry allowed, ownership locked to login ID)
 * - Employee ID: Automatically taken from authenticated login
 * - 15 Official Expense Categories
 * - Bilingual English / Hindi support
 * - Browser GPS Capture (Optional) & Bill Receipt Attachments
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { captureCurrentLocation, getGoogleMapsUrl } from '../../utils/geoUtils';
import { Attachment, GpsLocation, PaymentMode } from '../../types';
import {
  X,
  MapPin,
  Upload,
  Receipt,
  AlertTriangle,
  Check,
  Building,
  Calendar,
  IndianRupee,
  FileText,
  Trash2,
  ExternalLink,
  User,
} from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, categories, addExpense, expenses, t, language } = useApp();

  const nextExpenseId = `EXP-2026-${String(expenses.length + 1).padStart(4, '0')}`;
  const todayStr = new Date().toISOString().split('T')[0];

  // Form Fields
  const [expenseDate, setExpenseDate] = useState(todayStr);

  // SECTION 5: Employee Name MUST BE BLANK by default!
  const [employeeName, setEmployeeName] = useState('');

  // SECTION 4: Site Name MUST BE BLANK by default!
  const [siteName, setSiteName] = useState('');
  const [siteLocation, setSiteLocation] = useState('');

  // SECTION 6: The 15 categories
  const [category, setCategory] = useState<string>('Travelling');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [rate, setRate] = useState<number>(0);
  const [isCalculatedMode, setIsCalculatedMode] = useState(false);

  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [paidBy, setPaidBy] = useState<'Employee' | 'Company'>('Employee');
  const [remarks, setRemarks] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState<'Pending Approval' | 'Draft'>('Pending Approval');

  // Attachments
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // GPS Location (Optional)
  const [gpsLocation, setGpsLocation] = useState<GpsLocation | undefined>(undefined);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);

  // Auto calculate total if rate/quantity entered
  useEffect(() => {
    if (isCalculatedMode && rate > 0) {
      setAmount(quantity * rate);
    }
  }, [quantity, rate, isCalculatedMode]);

  // RESET TO BLANK whenever modal opens (Sections 4 & 5 compliance!)
  useEffect(() => {
    if (isOpen) {
      setExpenseDate(todayStr);
      setEmployeeName(''); // MUST BE BLANK BY DEFAULT!
      setSiteName('');     // MUST BE BLANK BY DEFAULT!
      setSiteLocation('');
      setDescription('');
      setAmount(0);
      setQuantity(1);
      setRate(0);
      setIsCalculatedMode(false);
      setPaymentMode('Cash');
      setPaidBy('Employee');
      setRemarks('');
      setSubmissionStatus('Pending Approval');
      setAttachments([]);
      setGpsLocation(undefined);
      setGpsMessage(null);
      setFormError(null);
      setCategory(categories[0]?.name || 'Travelling');
    }
  }, [isOpen, categories, todayStr]);

  if (!isOpen || !currentUser) return null;

  // GPS Capture handler
  const handleCaptureGps = async () => {
    setIsLocating(true);
    setGpsMessage(null);
    try {
      const res = await captureCurrentLocation();
      if (res.error) {
        setGpsMessage(res.error);
      } else {
        setGpsLocation({
          latitude: res.latitude,
          longitude: res.longitude,
          accuracyMeters: res.accuracyMeters,
          capturedAt: new Date().toLocaleString(),
          address: siteLocation || 'Current location',
        });
      }
    } catch {
      setGpsMessage('Unable to access device GPS.');
    } finally {
      setIsLocating(false);
    }
  };

  // Upload bill file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const newAtt: Attachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          url: uploadEvent.target?.result as string,
          type: file.type.includes('pdf') ? 'pdf' : 'image',
          sizeKb: Math.round(file.size / 1024),
          uploadedAt: new Date().toLocaleString(),
          uploaderId: currentUser.employeeId,
        };
        setAttachments((prev) => [...prev, newAtt]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Sample bill helper for instant testing
  const handleAddSampleBill = () => {
    const newAtt: Attachment = {
      id: `att-${Date.now()}`,
      name: 'GST_Invoice_Receipt.jpg',
      url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      type: 'image',
      sizeKb: 340,
      uploadedAt: new Date().toLocaleString(),
      uploaderId: currentUser.employeeId,
    };
    setAttachments((prev) => [...prev, newAtt]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!description.trim()) {
      setFormError(language === 'hi' ? 'कृपया खर्च का विवरण दर्ज करें।' : 'Please enter an expense description.');
      return;
    }

    if (amount <= 0) {
      setFormError(language === 'hi' ? 'खर्च की राशि शून्य से अधिक होनी चाहिए।' : 'Expense amount must be greater than zero.');
      return;
    }

    await addExpense({
      expenseDate,
      // SECTION 5: Employee ID is locked to authenticated login. Employee Name is saved as typed (or blank)
      employeeName: employeeName.trim(),
      // SECTION 4: Site Name is saved as typed manually (or left blank for non-site)
      siteName: siteName.trim(),
      siteLocation: siteLocation.trim(),
      category,
      description: description.trim(),
      quantity: Number(quantity) || 1,
      rate: Number(rate) || Number(amount),
      totalAmount: Number(amount),
      paymentMode,
      paidBy,
      attachments,
      gpsLocation,
      remarks: remarks.trim(),
      approvalStatus: submissionStatus,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col z-10 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-mono text-xs font-semibold">{nextExpenseId}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-300">{t('companyName')}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
              {language === 'hi' ? 'नया सोलर प्रोजेक्ट खर्च जोड़ें' : 'Add New Solar Project Expense'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Row 1: Employee ID (Locked to Login) & Expense Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">{t('fieldExpenseDate')} *</label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Authenticated Employee ID - Locked */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                {t('fieldEmployeeId')} *
              </label>
              <input
                type="text"
                disabled
                value={`Employee ID: ${currentUser.employeeId}`}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-700 font-mono font-bold cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {language === 'hi' ? 'लॉगिन खाते से स्वतः संबद्ध' : 'Locked to authenticated session'}
              </span>
            </div>

            {/* SECTION 5: Employee Name - BLANK BY DEFAULT! */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                {t('fieldEmployeeName')}
              </label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder={t('fieldEmployeeNamePlaceholder')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {language === 'hi' ? 'डिफ़ॉल्ट रूप से रिक्त (वैकल्पिक)' : 'Blank by default (optional)'}
              </span>
            </div>
          </div>

          {/* Row 2: SECTION 4 - SITE NAME (BLANK BY DEFAULT, MANUAL TYPING ONLY) */}
          <div className="p-3.5 bg-amber-50/40 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('fieldSiteName')}</span>
              </label>
              <span className="text-[10px] text-slate-500">
                {language === 'hi' ? 'मैन्युअल प्रविष्टि · कोई पूर्व-निर्धारित साइट नहीं' : 'Manual entry · No default sites'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder={t('fieldSiteNamePlaceholder')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none font-medium text-xs"
              />
              <input
                type="text"
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                placeholder={language === 'hi' ? 'साइट का स्थान (वैकल्पिक)' : 'Site location / address (optional)'}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none text-xs"
              />
            </div>
          </div>

          {/* Row 3: 15 Categories & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">{t('fieldCategory')} *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {language === 'hi' && c.hindiName ? c.hindiName : c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-800 mb-1">{t('fieldDescription')} *</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('fieldDescriptionPlaceholder')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 4: Amount & Rate/Qty Calculation */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{t('fieldAmount')}</span>
              <button
                type="button"
                onClick={() => setIsCalculatedMode(!isCalculatedMode)}
                className="text-[11px] text-amber-700 hover:underline font-semibold"
              >
                {isCalculatedMode ? 'Switch to Direct Amount' : '+ Add Quantity & Rate calculation'}
              </button>
            </div>

            {isCalculatedMode ? (
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Rate (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Total (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-amber-400 bg-amber-50 rounded-lg font-mono font-bold text-slate-900 tabular-nums"
                  />
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono text-base font-bold text-slate-900 tabular-nums focus:border-amber-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Row 5: Payment Mode & Submission Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">{t('fieldPaymentMode')}</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Cash">Cash (कैश / नकद)</option>
                <option value="UPI">UPI (Google Pay / PhonePe)</option>
                <option value="Bank Transfer">Bank Transfer (बैंक ट्रांसफर / NEFT)</option>
                <option value="Company Card">Company Card</option>
                <option value="Employee Pocket">Employee Pocket (अपनी जेब से)</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Paid By</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value as 'Employee' | 'Company')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Employee">Employee (Reimbursement Claim)</option>
                <option value="Company">Company (Direct Company Fund)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">{t('fieldSubmissionStatus')}</label>
              <select
                value={submissionStatus}
                onChange={(e) => setSubmissionStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium"
              >
                <option value="Pending Approval">Submit for Approval (स्वीकृति हेतु भेजें)</option>
                <option value="Draft">Save as Draft (ड्राफ्ट सेव करें)</option>
              </select>
            </div>
          </div>

          {/* Row 6: GPS Location (Optional) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('fieldGpsLocation')}</span>
              </span>

              <button
                type="button"
                onClick={handleCaptureGps}
                disabled={isLocating}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded-md text-[11px] font-semibold text-slate-700 hover:border-amber-500 shadow-xs flex items-center gap-1"
              >
                <MapPin className="w-3 h-3 text-amber-600" />
                <span>{isLocating ? 'Locating...' : t('fieldCaptureGps')}</span>
              </button>
            </div>

            {gpsLocation ? (
              <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center justify-between">
                <span>
                  Lat: {gpsLocation.latitude} · Long: {gpsLocation.longitude} (±{gpsLocation.accuracyMeters}m)
                </span>
                <a
                  href={getGoogleMapsUrl(gpsLocation.latitude, gpsLocation.longitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Map</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : gpsMessage ? (
              <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded">{gpsMessage}</div>
            ) : (
              <span className="text-[10px] text-slate-400 block">
                {language === 'hi' ? 'वैकल्पिक: सोलर साइट पर वर्तमान स्थान दर्ज करने हेतु क्लिक करें।' : 'Optional: Click to stamp current solar site coordinates.'}
              </span>
            )}
          </div>

          {/* Row 7: Bill & Receipts Photo Upload */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('fieldBillPhoto')}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddSampleBill}
                  className="px-2 py-1 text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded transition-colors"
                >
                  + Sample Receipt
                </button>
                <label className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded text-[11px] cursor-pointer flex items-center gap-1 shadow-xs">
                  <Upload className="w-3 h-3" />
                  <span>Upload Bill Photo</span>
                  <input type="file" multiple accept="image/*,application/pdf" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            {attachments.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {attachments.map((att) => (
                  <div key={att.id} className="p-2 bg-white rounded border border-slate-200 text-[11px] flex items-center justify-between shadow-xs">
                    <span className="truncate max-w-[130px] font-medium text-slate-800">{att.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-[10px] text-slate-400 block">
                {language === 'hi' ? 'कोई बिल संलग्न नहीं। आप फोटो या पीडीएफ संलग्न कर सकते हैं।' : 'No bill attached yet. You can attach camera photos, tax invoices or receipts.'}
              </span>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">{t('fieldRemarks')}</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={t('fieldRemarksPlaceholder')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">
              Employee ID: {currentUser.employeeId} · Multiple daily entries allowed
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50"
              >
                {t('btnCancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{t('btnSubmit')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
