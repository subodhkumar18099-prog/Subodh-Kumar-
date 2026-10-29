/**
 * Sunvault Expenses Manager - Approval Workflow Management View
 * Dedicated reviewer console for Project Managers and Administrators
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense } from '../../types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  Paperclip,
  MapPin,
  AlertTriangle,
  User,
  Filter,
  CheckCheck,
} from 'lucide-react';

interface ApprovalsViewProps {
  onSelectExpense: (expense: Expense) => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({ onSelectExpense }) => {
  const { expenses, currentUser, approveExpense, rejectExpense } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rejectingExpense, setRejectingExpense] = useState<Expense | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  const pendingList = useMemo(() => expenses.filter((e) => e.approvalStatus === 'Pending Approval'), [expenses]);
  const approvedList = useMemo(() => expenses.filter((e) => e.approvalStatus === 'Approved' || e.approvalStatus === 'Paid'), [expenses]);
  const rejectedList = useMemo(() => expenses.filter((e) => e.approvalStatus === 'Rejected'), [expenses]);

  const activeList = activeSubTab === 'pending' ? pendingList : activeSubTab === 'approved' ? approvedList : rejectedList;

  if (!currentUser) return null;

  const handleQuickApprove = async (e: React.MouseEvent, exp: Expense) => {
    e.stopPropagation();
    const res = await approveExpense(exp.id, `Direct approval by ${currentUser.name || currentUser.username}`);
    if (!res.success && res.message) {
      setRejectError(res.message);
    }
  };

  const handleRejectClick = (e: React.MouseEvent, exp: Expense) => {
    e.stopPropagation();
    setRejectingExpense(exp);
    setRejectionReason('');
    setRejectError(null);
  };

  const handleConfirmReject = async () => {
    if (!rejectingExpense) return;
    if (!rejectionReason.trim()) {
      setRejectError('Rejection reason is mandatory.');
      return;
    }
    const res = await rejectExpense(rejectingExpense.id, rejectionReason.trim());
    if (res.success) {
      setRejectingExpense(null);
    } else if (res.message) {
      setRejectError(res.message);
    }
  };

  const handleBatchApprovePending = async () => {
    const eligible = pendingList.filter((e) => e.submittedById !== currentUser.id || currentUser.role === 'admin');
    if (eligible.length === 0) {
      return;
    }
    for (const e of eligible) {
      await approveExpense(e.id, `Batch approval by ${currentUser.name || currentUser.username}`);
    }
  };

  return (
    <div className="space-y-5 pb-20 lg:pb-8">
      {/* Title & Tabs Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Expense Approval Workflow & Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review site expenditure claims, verify receipts, enforce GST compliance & certify disbursements
          </p>
        </div>

        {activeSubTab === 'pending' && pendingList.length > 0 && (currentUser.role === 'admin' || currentUser.role === 'project_manager') && (
          <button
            onClick={handleBatchApprovePending}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors self-start md:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Approve All Eligible ({pendingList.length})</span>
          </button>
        )}
      </div>

      {/* Sub-tab segmented selector */}
      <div className="flex items-center gap-2 p-1 bg-slate-200/80 rounded-xl text-xs font-semibold w-fit">
        <button
          onClick={() => setActiveSubTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeSubTab === 'pending'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Pending Review</span>
          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded-full font-mono text-[10px]">
            {pendingList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('approved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeSubTab === 'approved'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Approved ({approvedList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rejected')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeSubTab === 'rejected'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>Rejected ({rejectedList.length})</span>
        </button>
      </div>

      {/* Approval List Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeList.length > 0 ? (
          activeList.map((expense) => {
            const hasBill = expense.attachments.length > 0;
            const isMissingBill = expense.isBillRequired && !hasBill && !expense.adminBillOverride;
            const isOwn = expense.submittedById === currentUser.id;

            return (
              <div
                key={expense.id}
                onClick={() => onSelectExpense(expense)}
                className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 cursor-pointer transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  {/* Card Top */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-600 text-xs">{expense.id}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono text-slate-500 text-xs">{expense.expenseDate}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-base text-slate-900 tabular-nums">
                        ₹{expense.totalAmount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Main Details */}
                  <div className="mt-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-sm">{expense.category}</h3>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {expense.paymentMode} ({expense.paidBy})
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {expense.description}
                    </p>

                    <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
                      <span className="font-medium text-slate-800">{expense.employeeName}</span>
                      <span>·</span>
                      <span>{expense.siteName || 'Non-Project / General'}</span>
                    </div>
                  </div>

                  {/* Indicators (Bill, GPS, Warning) */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {hasBill && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        <Paperclip className="w-3 h-3 text-amber-600" />
                        <span>{expense.attachments.length} Bill(s) Attached</span>
                      </span>
                    )}

                    {isMissingBill && (
                      <span className="flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Missing Bill</span>
                      </span>
                    )}

                    {expense.gpsLocation && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        <MapPin className="w-3 h-3 text-sky-600" />
                        <span>GPS Tagged</span>
                      </span>
                    )}

                    {expense.approvalStatus === 'Rejected' && expense.rejectionReason && (
                      <div className="w-full text-[11px] text-rose-800 bg-rose-50 p-2 rounded border border-rose-200 mt-1">
                        Reason: {expense.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    {isOwn ? <span className="text-amber-700 font-medium">Own Submission</span> : <span>Submitted by {expense.submittedBy}</span>}
                  </div>

                  {activeSubTab === 'pending' && (currentUser.role === 'admin' || currentUser.role === 'project_manager') ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleRejectClick(e, expense)}
                        disabled={isOwn && currentUser.role !== 'admin'}
                        className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-xs font-semibold disabled:opacity-40"
                      >
                        Reject
                      </button>
                      <button
                        onClick={(e) => handleQuickApprove(e, expense)}
                        disabled={isOwn && currentUser.role !== 'admin'}
                        className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs disabled:opacity-40"
                      >
                        Approve
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-600 font-semibold hover:underline">
                      View Audit Dossier →
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            No claims found in {activeSubTab} queue.
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {rejectingExpense && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setRejectingExpense(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-5 w-full max-w-md z-10 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Reject Claim {rejectingExpense.id}</span>
            </h3>
            <p className="text-xs text-slate-500">
              Provide a clear audit explanation so the submitter can revise and resubmit.
            </p>
            {rejectError && <div className="text-xs text-rose-600 font-medium">{rejectError}</div>}
            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Rate higher than contract schedule, missing GST number on receipt..."
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:border-rose-500 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingExpense(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
