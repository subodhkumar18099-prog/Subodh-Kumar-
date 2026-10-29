/**
 * Sunvault Expenses Manager - Employee Advance Management Module
 * Strictly enforces:
 * - Admin manages all employee advances
 * - Employees can view ONLY their own advances
 * - Employee Name and Site Name are BLANK by default
 * - Remaining Advance = Total Advance - Amount Adjusted
 * - Only approved expenses can be adjusted; prevents duplicate adjustments
 * - Bilingual English / Hindi
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { EmployeeAdvance, PaymentMode } from '../../types';
import { exportToExcelCsv } from '../../utils/exportUtils';
import {
  Wallet,
  Plus,
  Building,
  User,
  Download,
  IndianRupee,
  X,
  Check,
  AlertCircle,
  Shield,
} from 'lucide-react';

export const AdvanceManagementView: React.FC = () => {
  const {
    advances,
    allCompanyAdvances,
    addAdvance,
    adjustAdvanceAgainstExpense,
    expenses,
    users,
    currentUser,
    t,
    language,
  } = useApp();

  const [newAdvanceModalOpen, setNewAdvanceModalOpen] = useState(false);
  const [settlementModalAdvance, setSettlementModalAdvance] = useState<EmployeeAdvance | null>(null);

  // New Advance Form State
  const [targetEmployeeId, setTargetEmployeeId] = useState('1');
  const [employeeName, setEmployeeName] = useState(''); // BLANK by default
  const [siteName, setSiteName] = useState(''); // BLANK by default
  const [advanceDate, setAdvanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [advancePurpose, setAdvancePurpose] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState<number>(10000);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Bank Transfer');
  const [paymentReference, setPaymentReference] = useState('');
  const [remarks, setRemarks] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Settlement Form State
  const [selectedExpenseIdToAdjust, setSelectedExpenseIdToAdjust] = useState<string>('');
  const [amountToAdjust, setAmountToAdjust] = useState<number>(0);
  const [settlementError, setSettlementError] = useState<string | null>(null);

  if (!currentUser) return null;
  const isAdmin = currentUser.role === 'admin';

  // Advances displayed (already scoped in AppContext to user role!)
  const displayAdvances = advances;

  const totalDisbursed = displayAdvances.reduce((sum, a) => sum + a.advanceAmount, 0);
  const totalAdjusted = displayAdvances.reduce((sum, a) => sum + a.amountAdjusted, 0);
  const totalRemaining = displayAdvances.reduce((sum, a) => {
    const rem = a.advanceAmount - a.amountAdjusted - (a.refundAmount || 0);
    return sum + Math.max(0, rem);
  }, 0);

  // Eligible expenses for settlement (Strict: only matching Employee ID and Approved)
  const eligibleExpensesForSettlement = useMemo(() => {
    if (!settlementModalAdvance) return [];
    return expenses.filter((e) => {
      const matchEmp = e.employeeId === settlementModalAdvance.employeeId;
      const isApproved = e.approvalStatus === 'Approved' || e.approvalStatus === 'Paid';
      const notAdjusted = !settlementModalAdvance.adjustedExpenseIds.includes(e.id);
      const unadjusted = e.totalAmount - e.advanceAdjustedAmount - e.paidAmount > 0;
      return matchEmp && isApproved && notAdjusted && unadjusted;
    });
  }, [settlementModalAdvance, expenses]);

  const handleCreateAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (advanceAmount <= 0) {
      setFormError(language === 'hi' ? 'अग्रिम राशि शून्य से अधिक होनी चाहिए।' : 'Advance amount must be greater than zero.');
      return;
    }

    if (!advancePurpose.trim()) {
      setFormError(language === 'hi' ? 'कृपया अग्रिम का उद्देश्य दर्ज करें।' : 'Please specify purpose.');
      return;
    }

    await addAdvance({
      employeeId: targetEmployeeId,
      employeeName: employeeName.trim(), // Blank by default
      siteName: siteName.trim(),         // Blank by default
      advanceDate,
      advancePurpose: advancePurpose.trim(),
      advanceAmount: Number(advanceAmount),
      paymentMode,
      paymentReference: paymentReference.trim() || `REF-${Date.now()}`,
      remarks: remarks.trim(),
    });

    setNewAdvanceModalOpen(false);
  };

  const handleAdjustExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlementModalAdvance || !selectedExpenseIdToAdjust) return;
    setSettlementError(null);

    const res = adjustAdvanceAgainstExpense(
      settlementModalAdvance.id,
      selectedExpenseIdToAdjust,
      Number(amountToAdjust)
    );

    if (res.success) {
      const updated = (isAdmin ? allCompanyAdvances : advances).find((a) => a.id === settlementModalAdvance.id);
      setSettlementModalAdvance(updated || null);
      setSelectedExpenseIdToAdjust('');
      setAmountToAdjust(0);
    } else if (res.message) {
      setSettlementError(res.message);
    }
  };

  const handleExportAdvances = () => {
    const headers = [
      'Sr. No.',
      'Advance ID',
      'Employee ID',
      'Employee Name',
      'Site Name',
      'Advance Date',
      'Advance Amount (₹)',
      'Adjusted Amount (₹)',
      'Remaining Advance (₹)',
      'Purpose',
      'Settlement Status',
    ];

    const rows = displayAdvances.map((a, idx) => {
      const remaining = a.advanceAmount - a.amountAdjusted - (a.refundAmount || 0);
      return [
        idx + 1,
        a.id,
        a.employeeId,
        a.employeeName || (language === 'hi' ? 'अनिर्दिष्ट' : 'Not Specified'),
        a.siteName || (language === 'hi' ? 'सामान्य' : 'General'),
        a.advanceDate,
        a.advanceAmount,
        a.amountAdjusted,
        Math.max(0, remaining),
        a.advancePurpose,
        a.status,
      ];
    });

    const title = isAdmin
      ? 'Sunvault Company-Wide Advance Register'
      : `My Advance Statement (Employee ID: ${currentUser.employeeId})`;

    exportToExcelCsv(
      isAdmin ? 'Sunvault_Advances_All' : `Sunvault_My_Advances_Emp${currentUser.employeeId}`,
      title,
      headers,
      rows,
      ['TOTAL', '', '', '', '', '', totalDisbursed, totalAdjusted, totalRemaining, '', '']
    );
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {isAdmin
              ? (language === 'hi' ? 'कर्मचारी अग्रिम प्रबंधन व हिसाब चुकता (एडमिन)' : 'Employee Advance Management & Settlement (Admin)')
              : (language === 'hi' ? `मेरा अग्रिम खाता (कर्मचारी आईडी: ${currentUser.employeeId})` : `My Advance Balance & Statement (Employee ID: ${currentUser.employeeId})`)}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isAdmin
              ? (language === 'hi' ? 'अग्रिम राशि वितरण, बिल मिलान एवं बकाया वसूली' : 'Disburse advances, reconcile against approved bills, and settle balances')
              : t('privacyNoticeEmployee')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAdvances}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>{t('btnExportExcel')}</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setNewAdvanceModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t('btnNewAdvance')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Advance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {language === 'hi' ? 'कुल प्राप्त / वितरित अग्रिम' : 'Total Advances Disbursed'}
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            ₹{totalDisbursed.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{displayAdvances.length} records</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {language === 'hi' ? 'बिल में समायोजित राशि' : 'Amount Adjusted Against Bills'}
          </span>
          <div className="text-xl font-bold text-emerald-600 mt-1 font-mono tabular-nums">
            ₹{totalAdjusted.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Reconciled with approved bills</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {language === 'hi' ? 'शेष बकाया अग्रिम राशि' : 'Remaining Advance Balance'}
          </span>
          <div className="text-xl font-bold text-rose-600 mt-1 font-mono tabular-nums">
            ₹{totalRemaining.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Pending bill submission</span>
        </div>
      </div>

      {/* Advance Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            {isAdmin ? 'All Employee Advances' : `My Advances (Employee ${currentUser.employeeId})`}
          </h3>
          <span className="text-xs text-slate-500 font-mono">{displayAdvances.length} Files</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Advance ID</th>
                <th className="px-3 py-3">Date</th>
                {isAdmin && <th className="px-3 py-3">Emp ID</th>}
                <th className="px-4 py-3">Site / Purpose</th>
                <th className="px-3 py-3 text-right">Advance Amount (₹)</th>
                <th className="px-3 py-3 text-right">Adjusted (₹)</th>
                <th className="px-3 py-3 text-right">Remaining (₹)</th>
                <th className="px-3 py-3">Status</th>
                {isAdmin && <th className="px-4 py-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayAdvances.length > 0 ? (
                displayAdvances.map((adv) => {
                  const rem = adv.advanceAmount - adv.amountAdjusted - (adv.refundAmount || 0);

                  return (
                    <tr key={adv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-amber-600 whitespace-nowrap">{adv.id}</td>
                      <td className="px-3 py-3 font-mono text-slate-600 tabular-nums whitespace-nowrap">{adv.advanceDate}</td>
                      {isAdmin && (
                        <td className="px-3 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          ID: {adv.employeeId}
                        </td>
                      )}
                      <td className="px-4 py-3 max-w-[200px]">
                        <span className="font-semibold text-slate-900 block truncate">
                          {adv.siteName || <em className="text-slate-400 font-normal">General / Non-Project</em>}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">{adv.advancePurpose}</span>
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        ₹{adv.advanceAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-emerald-600 tabular-nums whitespace-nowrap">
                        ₹{adv.amountAdjusted.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-rose-600 tabular-nums whitespace-nowrap">
                        ₹{Math.max(0, rem).toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span
                          className={`font-semibold text-[11px] ${
                            adv.status === 'Fully Settled'
                              ? 'text-emerald-700'
                              : adv.status === 'Partially Adjusted'
                              ? 'text-amber-600'
                              : 'text-sky-700'
                          }`}
                        >
                          {adv.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSettlementModalAdvance(adv)}
                            className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded text-xs shadow-xs"
                          >
                            {t('btnSettleAdvance')}
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="py-8 text-center text-slate-400 text-xs">
                    {language === 'hi' ? 'कोई अग्रिम रिकॉर्ड नहीं मिला।' : 'No advance records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disburse Advance Modal (Admin Only) */}
      {newAdvanceModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setNewAdvanceModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg z-10 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Disburse Employee Advance</h3>
              <button onClick={() => setNewAdvanceModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdvance} className="p-6 space-y-3.5 text-xs text-slate-700">
              {formError && <div className="p-2.5 bg-rose-50 text-rose-700 rounded-lg text-xs">{formError}</div>}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Select Employee ID *</label>
                  <select
                    value={targetEmployeeId}
                    onChange={(e) => setTargetEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => (
                      <option key={id} value={String(id)}>
                        Employee ID: {id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Advance Date *</label>
                  <input
                    type="date"
                    required
                    value={advanceDate}
                    onChange={(e) => setAdvanceDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Sections 4 & 5: Employee Name and Site Name BLANK BY DEFAULT! */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Employee Name (Blank by default)</label>
                  <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Enter name manually (blank by default)..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Site Name (Blank by default)</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="Type site name (blank by default)..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Advance Purpose *</label>
                <input
                  type="text"
                  required
                  value={advancePurpose}
                  onChange={(e) => setAdvancePurpose(e.target.value)}
                  placeholder="e.g. Site mobilization, helper wages, food and local hardware"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Advance Amount (₹) *</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI (Google Pay / PhonePe)</option>
                    <option value="Cash">Cash (कैश)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Bank Reference / UTR Number</label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="NEFT transaction UTR or UPI ref"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewAdvanceModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg shadow-sm"
                >
                  Confirm Disbursement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settle Advance Modal (Admin Only) */}
      {settlementModalAdvance && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSettlementModalAdvance(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl z-10 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-amber-400 text-xs font-bold">{settlementModalAdvance.id}</span>
                <h3 className="text-base font-bold text-white">Reconcile Advance (Emp ID: {settlementModalAdvance.employeeId})</h3>
              </div>
              <button onClick={() => setSettlementModalAdvance(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              {settlementError && <div className="p-2.5 bg-rose-50 text-rose-700 rounded text-xs">{settlementError}</div>}

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Total Advance</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    ₹{settlementModalAdvance.advanceAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Adjusted</span>
                  <span className="font-mono font-bold text-emerald-600 text-sm">
                    ₹{settlementModalAdvance.amountAdjusted.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Remaining</span>
                  <span className="font-mono font-bold text-rose-600 text-sm">
                    ₹{Math.max(0, settlementModalAdvance.advanceAmount - settlementModalAdvance.amountAdjusted).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {eligibleExpensesForSettlement.length > 0 ? (
                <form onSubmit={handleAdjustExpense} className="space-y-3 p-3 bg-amber-50/50 border border-amber-200 rounded-xl">
                  <span className="font-bold text-slate-900 block">Select Approved Claim to Adjust:</span>
                  <select
                    value={selectedExpenseIdToAdjust}
                    onChange={(e) => {
                      const expId = e.target.value;
                      setSelectedExpenseIdToAdjust(expId);
                      const exp = eligibleExpensesForSettlement.find((x) => x.id === expId);
                      if (exp) {
                        const bal = exp.totalAmount - exp.advanceAdjustedAmount - exp.paidAmount;
                        const available = settlementModalAdvance.advanceAmount - settlementModalAdvance.amountAdjusted;
                        setAmountToAdjust(Math.min(bal, available));
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded bg-white text-xs"
                  >
                    <option value="">-- Choose Approved Expense --</option>
                    {eligibleExpensesForSettlement.map((exp) => (
                      <option key={exp.id} value={exp.id}>
                        {exp.id} · {exp.category} · ₹{exp.totalAmount.toLocaleString('en-IN')} ({exp.expenseDate})
                      </option>
                    ))}
                  </select>

                  {selectedExpenseIdToAdjust && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block font-semibold mb-1">Adjustment Amount (₹)</label>
                        <input
                          type="number"
                          min="1"
                          value={amountToAdjust}
                          onChange={(e) => setAmountToAdjust(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white font-mono font-bold"
                        />
                      </div>
                      <div className="flex items-end">
                        <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded">
                          Apply Adjustment
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-500 text-[11px]">
                  No unadjusted approved expenses currently available for Employee ID {settlementModalAdvance.employeeId}.
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSettlementModalAdvance(null)}
                  className="px-4 py-1.5 border border-slate-300 text-slate-700 rounded text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
