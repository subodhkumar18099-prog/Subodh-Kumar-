/**
 * Sunvault Expenses Manager - Expense List View
 * Strictly enforces Privacy:
 * - Employee can only see and search their own records
 * - Admin can see and search all records across all employees
 * Bilingual English / Hindi support
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense, ApprovalStatus, DateFilterRange } from '../../types';
import { exportToExcelCsv, REPORT_DEFINITIONS } from '../../utils/exportUtils';
import {
  Search,
  Filter,
  Download,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Paperclip,
  Plus,
  Shield,
  User,
} from 'lucide-react';

interface ExpenseListViewProps {
  onSelectExpense: (expense: Expense) => void;
  onOpenAddExpense: () => void;
}

export const ExpenseListView: React.FC<ExpenseListViewProps> = ({
  onSelectExpense,
  onOpenAddExpense,
}) => {
  const { expenses, currentUser, categories, t, language } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');

  if (!currentUser) return null;
  const isAdmin = currentUser.role === 'admin';

  // Filter expenses (Note: expenses is already privacy-scoped in AppContext!)
  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
      if (selectedStatus !== 'all' && e.approvalStatus !== selectedStatus) return false;
      if (selectedPaymentStatus !== 'all' && e.paymentStatus !== selectedPaymentStatus) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchId = e.id.toLowerCase().includes(q);
        const matchDesc = e.description.toLowerCase().includes(q);
        const matchSite = (e.siteName || '').toLowerCase().includes(q);
        const matchEmpName = (e.employeeName || '').toLowerCase().includes(q);
        const matchEmpId = e.employeeId.toLowerCase().includes(q);
        const matchCat = e.category.toLowerCase().includes(q);
        return matchId || matchDesc || matchSite || matchEmpName || matchEmpId || matchCat;
      }
      return true;
    });
  }, [expenses, selectedCategory, selectedStatus, selectedPaymentStatus, searchTerm]);

  const totalFilteredAmount = useMemo(() => {
    return filtered.reduce((sum, e) => sum + e.totalAmount, 0);
  }, [filtered]);

  const handleExport = () => {
    const headers = [
      'Sr. No.',
      'Expense ID',
      'Date',
      'Employee ID',
      'Employee Name',
      'Site Name',
      'Category',
      'Description',
      'Amount (₹)',
      'Payment Mode',
      'Approval Status',
      'Payment Status',
    ];

    const rows = filtered.map((e, idx) => [
      idx + 1,
      e.id,
      e.expenseDate,
      e.employeeId,
      e.employeeName || (language === 'hi' ? 'अनिर्दिष्ट' : 'Not Specified'),
      e.siteName || (language === 'hi' ? 'गैर-प्रोजेक्ट' : 'Non-Project'),
      e.category,
      e.description,
      e.totalAmount,
      e.paymentMode,
      e.approvalStatus,
      e.paymentStatus,
    ]);

    const title = isAdmin
      ? 'Sunvault Company-Wide Expense Ledger'
      : `Personal Expense Records (Employee ID: ${currentUser.employeeId})`;

    exportToExcelCsv(
      isAdmin ? 'Sunvault_All_Expenses' : `Sunvault_My_Expenses_Emp${currentUser.employeeId}`,
      title,
      headers,
      rows,
      ['TOTAL', '', '', '', '', '', '', '', totalFilteredAmount, '', '', '']
    );
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case 'Approved':
        return <span className="font-semibold text-emerald-700">{t('statusApproved')}</span>;
      case 'Pending Approval':
        return <span className="font-semibold text-amber-600">{t('statusPendingApproval')}</span>;
      case 'Rejected':
        return <span className="font-semibold text-rose-600">{t('statusRejected')}</span>;
      case 'Paid':
        return <span className="font-semibold text-teal-700">{t('statusPaid')}</span>;
      default:
        return <span className="text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-8">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isAdmin
                ? (language === 'hi' ? 'कंपनी-व्यापी व्यय रजिस्टर (एडमिन)' : 'Company-Wide Expense Registry (Admin)')
                : (language === 'hi' ? `मेरे खर्चे (कर्मचारी आईडी: ${currentUser.employeeId})` : `My Expense Claims (Employee ID: ${currentUser.employeeId})`)}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isAdmin
              ? (language === 'hi' ? 'सभी 10 कर्मचारियों के खर्चे, साइट लागत और अनुमोदन' : 'Master registry of all employee expenses and site expenditures')
              : t('privacyNoticeEmployee')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>{t('btnExportExcel')}</span>
          </button>
          <button
            onClick={onOpenAddExpense}
            className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t('navAddExpense')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              isAdmin
                ? (language === 'hi' ? 'खर्च आईडी, कर्मचारी आईडी, साइट नाम, श्रेणी द्वारा खोजें...' : 'Search by Expense ID, Employee ID, Site Name, Category, Description...')
                : (language === 'hi' ? 'अपने खर्चे, साइट नाम, श्रेणी द्वारा खोजें...' : 'Search your expense claims by ID, Site, Category, Description...')
            }
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('fieldCategory')}</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-800"
            >
              <option value="all">{language === 'hi' ? 'सभी श्रेणियां' : 'All Categories'}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {language === 'hi' && c.hindiName ? c.hindiName : c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('fieldSubmissionStatus')}</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-800"
            >
              <option value="all">{language === 'hi' ? 'सभी स्थितियां' : 'All Statuses'}</option>
              <option value="Pending Approval">{t('statusPendingApproval')}</option>
              <option value="Approved">{t('statusApproved')}</option>
              <option value="Rejected">{t('statusRejected')}</option>
              <option value="Paid">{t('statusPaid')}</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              {language === 'hi' ? 'भुगतान स्थिति' : 'Payment Status'}
            </label>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-800"
            >
              <option value="all">{language === 'hi' ? 'सभी' : 'All'}</option>
              <option value="Unpaid">Unpaid (बकाया)</option>
              <option value="Partially Paid">Partially Paid (आंशिक)</option>
              <option value="Fully Paid">Fully Paid (पूर्ण)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Kicker */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1 font-medium">
        <span>
          {language === 'hi' ? 'कुल रिकॉर्ड्स:' : 'Displaying'}{' '}
          <strong className="text-slate-900">{filtered.length}</strong>{' '}
          {language === 'hi' ? 'दावे' : 'claims'}
        </span>
        <span className="font-mono tabular-nums">
          Total: <strong className="text-slate-900 text-sm">₹{totalFilteredAmount.toLocaleString('en-IN')}</strong>
        </span>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Expense ID</th>
                <th className="px-3 py-3">Date</th>
                {isAdmin && <th className="px-3 py-3">Emp ID</th>}
                <th className="px-4 py-3">Site Name</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-3 py-3 text-right">Amount (₹)</th>
                <th className="px-3 py-3">Payment Mode</th>
                <th className="px-3 py-3">Bills</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((e) => (
                  <tr
                    key={e.id}
                    onClick={() => onSelectExpense(e)}
                    className="hover:bg-amber-50/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-amber-600 whitespace-nowrap">{e.id}</td>
                    <td className="px-3 py-3 font-mono text-slate-600 tabular-nums whitespace-nowrap">{e.expenseDate}</td>
                    {isAdmin && (
                      <td className="px-3 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        ID: {e.employeeId}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      {e.siteName ? (
                        <span className="font-medium text-slate-800">{e.siteName}</span>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-slate-700 whitespace-nowrap">{e.category}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate text-slate-600">{e.description}</td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      ₹{e.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{e.paymentMode}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {e.attachments.length > 0 ? (
                        <span className="flex items-center gap-1 text-[11px] text-slate-600">
                          <Paperclip className="w-3.5 h-3.5 text-amber-600" />
                          <span>{e.attachments.length}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-[11px]">{getStatusBadge(e.approvalStatus)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          onSelectExpense(e);
                        }}
                        className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-amber-100 text-slate-700 rounded font-medium transition-colors"
                      >
                        {language === 'hi' ? 'विवरण' : 'Details'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 11 : 10} className="py-10 text-center text-slate-400 text-xs">
                    {language === 'hi' ? 'कोई खर्च रिकॉर्ड नहीं मिला।' : 'No expense records found matching filters.'}
                  </td>
                </tr>
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-4 py-3 text-slate-800">
                    Grand Total ({filtered.length} Claims)
                  </td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums text-slate-900 text-sm">
                    ₹{totalFilteredAmount.toLocaleString('en-IN')}
                  </td>
                  <td colSpan={4}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Mobile Card List View (< 768px) */}
      <div className="md:hidden space-y-3">
        {filtered.length > 0 ? (
          filtered.map((e) => (
            <div
              key={e.id}
              onClick={() => onSelectExpense(e)}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5 active:bg-amber-50"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-amber-600 text-xs">{e.id}</span>
                <div className="text-xs">{getStatusBadge(e.approvalStatus)}</div>
              </div>

              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{e.category}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{e.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-slate-900 text-base tabular-nums">
                    ₹{e.totalAmount.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-slate-400">{e.paymentMode}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-medium text-slate-800">
                  {e.siteName ? e.siteName : 'Non-Project'}
                  {isAdmin && ` · Emp ID: ${e.employeeId}`}
                </span>
                <span className="font-mono text-slate-400">{e.expenseDate}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            {language === 'hi' ? 'कोई खर्च नहीं मिला।' : 'No expenses found.'}
          </div>
        )}
      </div>
    </div>
  );
};
