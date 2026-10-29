/**
 * Sunvault Expenses Manager - Site-Wise Expense Management Module
 * Allows unlimited manual site names, dynamic site aggregation,
 * full site metrics (Total, Approved, Pending, Paid, Advances, Adjustments),
 * and instant Excel & PDF export.
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense } from '../../types';
import { exportToExcelCsv, REPORT_DEFINITIONS } from '../../utils/exportUtils';
import {
  Building2,
  Search,
  Download,
  Printer,
  Calendar,
  Filter,
  ArrowUpRight,
  IndianRupee,
  CheckCircle2,
  Clock,
  Wallet,
  RefreshCw,
} from 'lucide-react';

interface SiteExpensesViewProps {
  onSelectExpense: (expense: Expense) => void;
  onOpenPrintModal: (title: string, headers: string[], rows: (string | number)[][], siteSummary?: Record<string, string | number>) => void;
}

export const SiteExpensesView: React.FC<SiteExpensesViewProps> = ({
  onSelectExpense,
  onOpenPrintModal,
}) => {
  const { expenses, advances, knownSites } = useApp();

  const [selectedSite, setSelectedSite] = useState<string>(knownSites[0] || '');
  const [siteSearch, setSiteSearch] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Active Site expenses filtered by dates
  const siteExpenses = useMemo(() => {
    let list = expenses.filter((e) => {
      if (!selectedSite) return true;
      if (selectedSite === '__all__') return true;
      return (e.siteName || '').toLowerCase() === selectedSite.toLowerCase();
    });

    if (fromDate) {
      list = list.filter((e) => e.expenseDate >= fromDate);
    }
    if (toDate) {
      list = list.filter((e) => e.expenseDate <= toDate);
    }

    return list;
  }, [expenses, selectedSite, fromDate, toDate]);

  // Active Site advances filtered
  const siteAdvances = useMemo(() => {
    return advances.filter((a) => {
      if (!selectedSite || selectedSite === '__all__') return true;
      return (a.siteName || '').toLowerCase() === selectedSite.toLowerCase();
    });
  }, [advances, selectedSite]);

  // Site-specific calculations
  const totalExpenses = useMemo(() => siteExpenses.reduce((sum, e) => sum + e.totalAmount, 0), [siteExpenses]);
  const totalApproved = useMemo(
    () =>
      siteExpenses
        .filter((e) => e.approvalStatus === 'Approved' || e.approvalStatus === 'Paid')
        .reduce((sum, e) => sum + e.totalAmount, 0),
    [siteExpenses]
  );
  const totalPending = useMemo(
    () =>
      siteExpenses
        .filter((e) => e.approvalStatus === 'Pending Approval')
        .reduce((sum, e) => sum + e.totalAmount, 0),
    [siteExpenses]
  );
  const totalPaid = useMemo(() => siteExpenses.reduce((sum, e) => sum + e.paidAmount, 0), [siteExpenses]);
  const totalSiteAdvances = useMemo(() => siteAdvances.reduce((sum, a) => sum + a.advanceAmount, 0), [siteAdvances]);
  const totalAdvanceAdjustments = useMemo(() => siteAdvances.reduce((sum, a) => sum + a.amountAdjusted, 0), [siteAdvances]);

  // Filtered site list for selector
  const matchingSites = useMemo(() => {
    if (!siteSearch.trim()) return knownSites;
    return knownSites.filter((s: string) => s.toLowerCase().includes(siteSearch.toLowerCase()));
  }, [knownSites, siteSearch]);

  const handleExportExcel = () => {
    const headers = [
      'Sr. No.',
      'Date',
      'Expense ID',
      'Employee Name',
      'Expense Category',
      'Description',
      'Amount (Rs.)',
      'Approval Status',
      'Payment Status',
    ];

    const rows = siteExpenses.map((e, idx) => [
      idx + 1,
      e.expenseDate,
      e.id,
      e.employeeName,
      e.category,
      e.description,
      e.totalAmount,
      e.approvalStatus,
      e.paymentStatus,
    ]);

    const filename = `Sunvault_Site_Report_${selectedSite.replace(/\s+/g, '_')}`;
    exportToExcelCsv(filename, `Site Expense Audit: ${selectedSite || 'All Projects'}`, headers, rows, [
      'TOTAL',
      '',
      '',
      '',
      '',
      '',
      totalExpenses,
      `Approved: ₹${totalApproved}`,
      `Paid: ₹${totalPaid}`,
    ]);
  };

  const handleOpenPrint = () => {
    const headers = [
      'Sr.',
      'Date',
      'Expense ID',
      'Employee Name',
      'Category',
      'Description',
      'Amount (Rs.)',
      'Approval',
      'Payment Status',
    ];

    const rows = siteExpenses.map((e, idx) => [
      idx + 1,
      e.expenseDate,
      e.id,
      e.employeeName,
      e.category,
      e.description,
      e.totalAmount,
      e.approvalStatus,
      e.paymentStatus,
    ]);

    onOpenPrintModal(
      `Site-Wise Solar Project Report: ${selectedSite || 'All Sites'}`,
      headers,
      rows,
      {
        'Total Site Expenses': `₹${totalExpenses.toLocaleString('en-IN')}`,
        'Total Approved': `₹${totalApproved.toLocaleString('en-IN')}`,
        'Total Pending Approval': `₹${totalPending.toLocaleString('en-IN')}`,
        'Total Paid Disbursements': `₹${totalPaid.toLocaleString('en-IN')}`,
        'Site Advances Disbursed': `₹${totalSiteAdvances.toLocaleString('en-IN')}`,
        'Advance Adjusted': `₹${totalAdvanceAdjustments.toLocaleString('en-IN')}`,
      }
    );
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Site-Wise Solar Project Expense Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Individual project cost tracking, billing audits, site advances & financial reconciliation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export to Excel</span>
          </button>
          <button
            onClick={handleOpenPrint}
            className="px-3.5 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF Report</span>
          </button>
        </div>
      </div>

      {/* Site Selector & Date Filter Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Site Search & Selector */}
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Select Solar Site</span>
            </label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white text-slate-900 focus:outline-none focus:border-amber-500"
            >
              <option value="__all__">All Solar Sites Combined</option>
              {knownSites.map((site: string) => (
                <option key={site} value={site}>
                  {site}
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">From Date (DD/MM/YYYY)</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">To Date (DD/MM/YYYY)</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
            />
          </div>
        </div>

        {/* Quick Site Tags Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Quick Sites:
          </span>
          <button
            onClick={() => setSelectedSite('__all__')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
              selectedSite === '__all__' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Projects
          </button>
          {knownSites.map((site: string) => (
            <button
              key={site}
              onClick={() => setSelectedSite(site)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                selectedSite === site ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {site}
            </button>
          ))}
        </div>
      </div>

      {/* 6 Required Site-Specific Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Total Expenses */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Expenses
          </span>
          <div className="text-base sm:text-lg font-bold text-slate-900 mt-1 font-mono tabular-nums">
            ₹{totalExpenses.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{siteExpenses.length} claims</span>
        </div>

        {/* 2. Total Approved Expenses */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Approved
          </span>
          <div className="text-base sm:text-lg font-bold text-emerald-600 mt-1 font-mono tabular-nums">
            ₹{totalApproved.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Authorized claims</span>
        </div>

        {/* 3. Total Pending Expenses */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Pending
          </span>
          <div className="text-base sm:text-lg font-bold text-amber-600 mt-1 font-mono tabular-nums">
            ₹{totalPending.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Awaiting sign-off</span>
        </div>

        {/* 4. Total Paid Expenses */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Paid
          </span>
          <div className="text-base sm:text-lg font-bold text-teal-700 mt-1 font-mono tabular-nums">
            ₹{totalPaid.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Disbursed cash/UPI</span>
        </div>

        {/* 5. Total Employee Advances */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Employee Advances
          </span>
          <div className="text-base sm:text-lg font-bold text-slate-900 mt-1 font-mono tabular-nums">
            ₹{totalSiteAdvances.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Site mobilization</span>
        </div>

        {/* 6. Total Advance Adjustments */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Advance Adjusted
          </span>
          <div className="text-base sm:text-lg font-bold text-emerald-700 mt-1 font-mono tabular-nums">
            ₹{totalAdvanceAdjustments.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Reconciled bills</span>
        </div>
      </div>

      {/* Detailed Site Report Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-900">
              Site Ledger: {selectedSite === '__all__' ? 'Consolidated All Sites' : selectedSite}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {siteExpenses.length} Itemized Record(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-3 py-3">Expense ID</th>
                <th className="px-4 py-3">Employee Name</th>
                <th className="px-3 py-3">Expense Category</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-3 py-3 text-right">Amount (₹)</th>
                <th className="px-3 py-3">Approval Status</th>
                <th className="px-3 py-3">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {siteExpenses.length > 0 ? (
                siteExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    onClick={() => onSelectExpense(expense)}
                    className="hover:bg-amber-50/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                      {expense.expenseDate}
                    </td>
                    <td className="px-3 py-3 font-mono font-bold text-amber-600 whitespace-nowrap">
                      {expense.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900">
                      {expense.employeeName}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-slate-700">
                      {expense.category}
                    </td>
                    <td className="px-4 py-3 max-w-[240px] truncate text-slate-600">
                      {expense.description}
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      ₹{expense.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap font-medium">
                      <span
                        className={
                          expense.approvalStatus === 'Approved' || expense.approvalStatus === 'Paid'
                            ? 'text-emerald-700'
                            : expense.approvalStatus === 'Rejected'
                            ? 'text-rose-600'
                            : 'text-amber-600'
                        }
                      >
                        {expense.approvalStatus}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-slate-600">
                      {expense.paymentStatus}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 text-xs">
                    No expense records found for site "{selectedSite}". You can add an expense with this site name
                    anytime.
                  </td>
                </tr>
              )}
            </tbody>
            {siteExpenses.length > 0 && (
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-slate-900">
                    Grand Total ({siteExpenses.length} Records)
                  </td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums text-slate-900 text-sm">
                    ₹{totalExpenses.toLocaleString('en-IN')}
                  </td>
                  <td colSpan={2} className="px-3 py-3 text-slate-500 text-[11px] font-normal">
                    Approved: ₹{totalApproved.toLocaleString('en-IN')} · Paid: ₹{totalPaid.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
