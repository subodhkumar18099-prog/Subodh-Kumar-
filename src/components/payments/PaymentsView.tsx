/**
 * Sunvault Expenses Manager - Payment Management Module
 * Accountant portal to record full/partial disbursements, track UTR numbers,
 * enforce outstanding amount calculation, and prevent duplicate payments.
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense, PaymentMode, PaymentTransaction } from '../../types';
import { exportToExcelCsv, REPORT_DEFINITIONS } from '../../utils/exportUtils';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  IndianRupee,
  Building,
  User,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface PaymentsViewProps {
  onSelectExpense: (expense: Expense) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ onSelectExpense }) => {
  const { expenses, payments, recordPayment, currentUser } = useApp();

  // Modal State
  const [paymentModalExpense, setPaymentModalExpense] = useState<Expense | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Bank Transfer');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Approved expenses awaiting payment or partial balance
  const pendingPaymentExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const isApprovedOrPaid = e.approvalStatus === 'Approved' || e.approvalStatus === 'Paid';
      const outstanding = e.totalAmount - e.paidAmount - e.advanceAdjustedAmount;
      return isApprovedOrPaid && outstanding > 0;
    });
  }, [expenses]);

  const totalPaymentsAmount = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);
  const totalPendingPaymentAmount = useMemo(
    () =>
      pendingPaymentExpenses.reduce(
        (sum, e) => sum + (e.totalAmount - e.paidAmount - e.advanceAdjustedAmount),
        0
      ),
    [pendingPaymentExpenses]
  );

  if (!currentUser) return null;

  const openPaymentModal = (exp: Expense) => {
    setPaymentModalExpense(exp);
    const outstanding = exp.totalAmount - exp.paidAmount - exp.advanceAdjustedAmount;
    setPaymentAmount(outstanding);
    setPaymentMode('Bank Transfer');
    setTransactionRef('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setRemarks('');
    setPaymentError(null);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalExpense) return;
    setPaymentError(null);

    const res = recordPayment({
      paymentDate,
      employeeName: paymentModalExpense.employeeName,
      employeeId: paymentModalExpense.employeeId,
      expenseId: paymentModalExpense.id,
      siteName: paymentModalExpense.siteName || '',
      amount: Number(paymentAmount),
      paymentMode,
      transactionReference: transactionRef.trim() || `TXN-${Date.now()}`,
      paidBy: `${currentUser.name} (${currentUser.role})`,
      receivedBy: paymentModalExpense.employeeName,
      remarks: remarks.trim(),
    });

    if (res.success) {
      setPaymentModalExpense(null);
    } else if (res.message) {
      setPaymentError(res.message);
    }
  };

  const handleExportPayments = () => {
    const reportDef = REPORT_DEFINITIONS.upiAndBankPayments;
    const { rows } = reportDef.getData([], [], payments);
    exportToExcelCsv('Sunvault_Payment_Disbursements', 'All Disbursed Payments & Vouchers', reportDef.headers, rows);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Accountant Payment & Reimbursement Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Record bank transfers, UPI settlements, and vendor reimbursements for approved solar expenses
          </p>
        </div>

        <button
          onClick={handleExportPayments}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Payments Ledger</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Disbursements Completed
          </span>
          <div className="text-xl font-bold text-emerald-600 mt-1 font-mono tabular-nums">
            ₹{totalPaymentsAmount.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{payments.length} transactions executed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Approved Claims Awaiting Payment
          </span>
          <div className="text-xl font-bold text-amber-600 mt-1 font-mono tabular-nums">
            ₹{totalPendingPaymentAmount.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {pendingPaymentExpenses.length} approved expenses pending
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Current Accountant Session
          </span>
          <div className="text-base font-bold text-slate-900 mt-1">{currentUser.name}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Role: <strong className="text-amber-600 uppercase">{currentUser.role}</strong>
          </span>
        </div>
      </div>

      {/* Section 1: Approved Expenses Pending Payment */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-amber-50/50 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Approved Claims Queue (Awaiting Disbursement)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Expenses certified by PM/Admin ready for payment</p>
          </div>
          <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
            {pendingPaymentExpenses.length} Pending
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Expense ID</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-4 py-3">Payee / Employee</th>
                <th className="px-4 py-3">Project / Site</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3 text-right">Total Claim</th>
                <th className="px-3 py-3 text-right">Adjusted</th>
                <th className="px-3 py-3 text-right">Outstanding</th>
                <th className="px-4 py-3 text-right">Disburse Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingPaymentExpenses.length > 0 ? (
                pendingPaymentExpenses.map((expense) => {
                  const outstanding = expense.totalAmount - expense.paidAmount - expense.advanceAdjustedAmount;

                  return (
                    <tr key={expense.id} className="hover:bg-amber-50/30 transition-colors">
                      <td
                        onClick={() => onSelectExpense(expense)}
                        className="px-4 py-3 font-mono font-bold text-amber-600 cursor-pointer hover:underline"
                      >
                        {expense.id}
                      </td>
                      <td className="px-3 py-3 font-mono text-slate-600 tabular-nums">{expense.expenseDate}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{expense.employeeName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{expense.employeeId}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-800">{expense.siteName || 'General / Non-Project'}</span>
                      </td>
                      <td className="px-3 py-3 text-slate-700">{expense.category}</td>
                      <td className="px-3 py-3 text-right font-mono text-slate-700 tabular-nums">
                        ₹{expense.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-slate-500 tabular-nums">
                        ₹{expense.advanceAdjustedAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-rose-600 tabular-nums">
                        ₹{outstanding.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openPaymentModal(expense)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5 ml-auto"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Record Payment</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    All approved expenses have been paid in full or adjusted against advances.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Complete Payment Transaction Ledger */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Historical Payment Disbursements Ledger</h3>
          <span className="text-xs text-slate-500 font-mono">{payments.length} Payments Recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Payment ID</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-4 py-3">Payee / Beneficiary</th>
                <th className="px-4 py-3">Expense ID</th>
                <th className="px-3 py-3">Site</th>
                <th className="px-3 py-3 text-right">Amount (₹)</th>
                <th className="px-3 py-3">Mode</th>
                <th className="px-4 py-3">Bank UTR / Transaction Ref</th>
                <th className="px-4 py-3">Authorized By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{payment.id}</td>
                  <td className="px-3 py-3 font-mono text-slate-600 tabular-nums">{payment.paymentDate}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{payment.employeeName}</td>
                  <td className="px-4 py-3 font-mono text-amber-700">{payment.expenseId}</td>
                  <td className="px-3 py-3 text-slate-600">{payment.siteName || 'General'}</td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-emerald-700 tabular-nums">
                    ₹{payment.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-3 py-3 text-slate-700">{payment.paymentMode}</td>
                  <td className="px-4 py-3 font-mono text-slate-600 truncate max-w-[160px]">
                    {payment.transactionReference}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{payment.paidBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {paymentModalExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setPaymentModalExpense(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg z-10 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-400 font-mono">{paymentModalExpense.id}</span>
                <h3 className="text-base font-bold text-white">Record Expense Disbursement</h3>
              </div>
              <button onClick={() => setPaymentModalExpense(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-6 space-y-4 text-xs text-slate-700">
              {paymentError && <div className="p-2.5 bg-rose-50 text-rose-700 rounded-lg text-xs">{paymentError}</div>}

              {/* Expense Context */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Employee / Beneficiary:</span>
                  <span className="font-semibold text-slate-900">{paymentModalExpense.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Claim:</span>
                  <span className="font-mono">₹{paymentModalExpense.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Outstanding Balance:</span>
                  <span className="font-mono text-rose-600">
                    ₹
                    {(
                      paymentModalExpense.totalAmount -
                      paymentModalExpense.paidAmount -
                      paymentModalExpense.advanceAdjustedAmount
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Disbursement Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    max={
                      paymentModalExpense.totalAmount -
                      paymentModalExpense.paidAmount -
                      paymentModalExpense.advanceAdjustedAmount
                    }
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Full or partial payment allowed
                  </span>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Payment Mode *</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI (GPay/PhonePe)</option>
                    <option value="Cash">Cash (Petty Cash)</option>
                    <option value="Other">Other Mode</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Bank UTR / Transaction Ref</label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="e.g. NEFT-HDFC-9921820"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Accountant Notes / Remarks</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Cleared via corporate net-banking, verified invoice attached"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalExpense(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Record Disbursement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
