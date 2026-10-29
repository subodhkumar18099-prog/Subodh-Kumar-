/**
 * Sunvault Expenses Manager - Expense Detail & Approval Action Modal
 * Enforces:
 * - Only Admin can approve or reject expenses
 * - Rejection reason is mandatory
 * - Strict bill attachment access
 * - Bilingual Hindi / English support
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense } from '../../types';
import { getGoogleMapsUrl } from '../../utils/geoUtils';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  ExternalLink,
  Receipt,
  AlertTriangle,
  Eye,
  CreditCard,
  FileText,
  Building,
  User,
} from 'lucide-react';

interface ExpenseDetailModalProps {
  expense: Expense | null;
  onClose: () => void;
  onOpenPaymentModal?: (expense: Expense) => void;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  expense,
  onClose,
  onOpenPaymentModal,
}) => {
  const { currentUser, approveExpense, rejectExpense, t, language } = useApp();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [previewAttachmentUrl, setPreviewAttachmentUrl] = useState<string | null>(null);

  if (!expense || !currentUser) return null;

  const isAdmin = currentUser.role === 'admin';
  const outstandingBalance = expense.totalAmount - expense.paidAmount - expense.advanceAdjustedAmount;

  // Bill Access Check: Admin can view all; Employee can only view their own attachments
  const canViewAttachments = isAdmin || expense.employeeId === currentUser.employeeId;

  const handleApprove = async () => {
    if (!isAdmin) return;
    const res = await approveExpense(expense.id, 'Approved by Administrator');
    if (res.success) onClose();
  };

  const handleConfirmReject = async () => {
    if (!isAdmin) return;
    if (!rejectionReason.trim()) {
      setRejectError(language === 'hi' ? 'अस्वीकृति का कारण लिखना अनिवार्य है।' : 'Rejection reason is mandatory.');
      return;
    }
    const res = await rejectExpense(expense.id, rejectionReason.trim());
    if (res.success) {
      setRejectModalOpen(false);
      onClose();
    } else if (res.message) {
      setRejectError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col z-10 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-400">{expense.id}</span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-300 font-mono">{expense.expenseDate}</span>
              <span className="text-slate-500">·</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                {expense.approvalStatus}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
              {expense.category}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          {/* Rejection Alert Banner */}
          {expense.approvalStatus === 'Rejected' && expense.rejectionReason && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-rose-800">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>{language === 'hi' ? 'खर्च दावा अस्वीकृत' : 'Expense Claim Rejected by Admin'}</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded border border-rose-200 text-xs font-medium">
                <strong>{language === 'hi' ? 'कारण:' : 'Reason:'}</strong> "{expense.rejectionReason}"
              </div>
            </div>
          )}

          {/* Metadata Card */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[11px]">{t('fieldEmployeeId')}</span>
              <span className="font-mono font-bold text-slate-900 text-xs">
                Employee ID: {expense.employeeId}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">{t('fieldEmployeeName')}</span>
              <span className="font-medium text-slate-800">
                {expense.employeeName || <em className="text-slate-400">Blank</em>}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">{t('fieldSiteName')}</span>
              <span className="font-medium text-slate-800">
                {expense.siteName || <em className="text-slate-400">Blank (Non-Project)</em>}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">{t('fieldPaymentMode')}</span>
              <span className="font-medium text-slate-800">{expense.paymentMode} ({expense.paidBy})</span>
            </div>
          </div>

          {/* Description & Amount */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
            <span className="font-bold text-slate-900 block">{t('fieldDescription')}</span>
            <p className="text-slate-800 leading-relaxed text-xs">{expense.description}</p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-500 font-medium">{t('fieldAmount')}:</span>
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                ₹{expense.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            {expense.remarks && (
              <div className="pt-2 text-[11px] text-slate-500">
                <strong>{t('fieldRemarks')}:</strong> {expense.remarks}
              </div>
            )}
          </div>

          {/* GPS Location Stamp (Optional) */}
          {expense.gpsLocation && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span className="font-mono text-[11px] text-slate-700">
                  Lat: {expense.gpsLocation.latitude} · Long: {expense.gpsLocation.longitude}
                </span>
              </div>
              <a
                href={getGoogleMapsUrl(expense.gpsLocation.latitude, expense.gpsLocation.longitude)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
              >
                <span>View Map</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Bills & Receipts Attachments */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 block">{t('fieldBillPhoto')}</span>
            {canViewAttachments && expense.attachments.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {expense.attachments.map((att) => (
                  <div
                    key={att.id}
                    onClick={() => setPreviewAttachmentUrl(att.url)}
                    className="p-2 border border-slate-200 rounded-lg bg-white hover:border-amber-400 cursor-pointer shadow-xs"
                  >
                    <div className="h-24 bg-slate-100 rounded overflow-hidden flex items-center justify-center">
                      <img src={att.url} alt={att.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <span className="block mt-1 text-[10px] font-medium text-slate-700 truncate">{att.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center text-slate-400 text-xs">
                {language === 'hi' ? 'कोई बिल संलग्न नहीं है।' : 'No bill attachments available.'}
              </div>
            )}
          </div>

          {/* Audit History */}
          <div className="pt-2 border-t border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block text-xs">
              {language === 'hi' ? 'ऑडिट इतिहास' : 'Approval & Audit Trail'}
            </span>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {expense.approvalHistory.map((h, idx) => (
                <div key={idx} className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>
                    <strong>{h.status}</strong> by {h.changedBy} {h.comments && `("${h.comments}")`}
                  </span>
                  <span className="font-mono text-[10px]">{h.changedAt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div>
            {!isAdmin && (
              <span className="text-[11px] text-slate-500">
                {language === 'hi' ? 'केवल एडमिन स्वीकृत/अस्वीकृत कर सकते हैं।' : 'Only Admin can approve or reject expenses.'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Admin Only Approval Buttons */}
            {isAdmin && expense.approvalStatus === 'Pending Approval' && (
              <>
                <button
                  onClick={() => setRejectModalOpen(true)}
                  className="px-3.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 font-bold rounded-lg text-xs"
                >
                  {t('btnReject')}
                </button>
                <button
                  onClick={handleApprove}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs"
                >
                  {t('btnApprove')}
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100"
            >
              {language === 'hi' ? 'बंद करें' : 'Close'}
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Rejection Submodal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setRejectModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-5 w-full max-w-md z-10 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>{language === 'hi' ? 'अनिवार्य अस्वीकृति कारण' : 'Mandatory Rejection Reason'}</span>
            </h3>
            {rejectError && <div className="text-xs text-rose-600 font-medium">{rejectError}</div>}
            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Missing original GST invoice, tax amount mismatch, excessive fuel charge..."
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:border-rose-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setRejectModalOpen(false)} className="px-3 py-1.5 text-xs text-slate-600">
                {t('btnCancel')}
              </button>
              <button onClick={handleConfirmReject} className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-xs">
                {t('btnReject')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bill Zoom Modal */}
      {previewAttachmentUrl && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative max-w-3xl max-h-[90vh] bg-slate-900 rounded-xl p-2 flex flex-col">
            <button onClick={() => setPreviewAttachmentUrl(null)} className="self-end p-1 text-slate-300 hover:text-white mb-1">
              <X className="w-6 h-6" />
            </button>
            <img src={previewAttachmentUrl} alt="Bill Preview" className="max-h-[80vh] object-contain rounded mx-auto" referrerPolicy="no-referrer" />
          </div>
        </div>
      )}
    </div>
  );
};
