/**
 * Sunvault Expenses Manager - Daily Expense Report
 * Section 6: Itemized columns with Travelling, Food, Material, Other breakdown,
 * bottom grand totals, date picker & filters, and Excel/Print export.
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense, ApprovalStatus } from '../../types';
import { exportToExcelCsv, REPORT_DEFINITIONS } from '../../utils/exportUtils';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  Search,
  Building,
  Check,
} from 'lucide-react';

interface DailyExpenseReportViewProps {
  onSelectExpense: (expense: Expense) => void;
  onOpenPrintModal: (title: string, headers: string[], rows: (string | number)[][], siteSummary?: Record<string, string | number>) => void;
}

export const DailyExpenseReportView: React.FC<DailyExpenseReportViewProps> = ({
  onSelectExpense,
  onOpenPrintModal,
}) => {
  const { expenses, categories, knownSites } = useApp();

  const [filterDate, setFilterDate] = useState<string>('');
  const [filterSite, setFilterSite] = useState<string>('all');
  const [filterEmployee, setFilterEmployee] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (filterDate && e.expenseDate !== filterDate) return false;
      if (filterSite !== 'all' && (e.siteName || '').toLowerCase() !== filterSite.toLowerCase()) return false;
      if (
        filterEmployee.trim() &&
        !e.employeeName.toLowerCase().includes(filterEmployee.toLowerCase().trim()) &&
        !e.employeeId.toLowerCase().includes(filterEmployee.toLowerCase().trim())
      ) {
        return false;
      }
      if (filterCategory !== 'all' && e.category !== filterCategory) return false;
      if (filterStatus !== 'all' && e.approvalStatus !== filterStatus) return false;
      return true;
    });
  }, [expenses, filterDate, filterSite, filterEmployee, filterCategory, filterStatus]);

  // Breakdown Calculations
  const breakdownRows = useMemo(() => {
    return filteredExpenses.map((e, idx) => {
      const cat = e.category;
      const isTravel = ['Travelling', 'Bus', 'Train', 'Auto Rickshaw', 'Taxi', 'Fuel / Petrol / Diesel', 'Parking', 'Toll Tax'].includes(cat);
      const isFood = ['Food / Lunch / Dinner', 'Tea / Water / Refreshments'].includes(cat);
      const isMaterial = ['Material Purchase', 'Tools and Equipment', 'Safety Equipment'].includes(cat);
      const isOther = !isTravel && !isFood && !isMaterial;

      const travelAmt = isTravel ? e.totalAmount : 0;
      const foodAmt = isFood ? e.totalAmount : 0;
      const matAmt = isMaterial ? e.totalAmount : 0;
      const otherAmt = isOther ? e.totalAmount : 0;

      return {
        srNo: idx + 1,
        expense: e,
        travelAmt,
        foodAmt,
        matAmt,
        otherAmt,
      };
    });
  }, [filteredExpenses]);

  // Totals
  const totalTravel = breakdownRows.reduce((sum, r) => sum + r.travelAmt, 0);
  const totalFood = breakdownRows.reduce((sum, r) => sum + r.foodAmt, 0);
  const totalMat = breakdownRows.reduce((sum, r) => sum + r.matAmt, 0);
  const totalOther = breakdownRows.reduce((sum, r) => sum + r.otherAmt, 0);
  const grandTotal = breakdownRows.reduce((sum, r) => sum + r.expense.totalAmount, 0);

  const handleExportExcel = () => {
    const reportDef = REPORT_DEFINITIONS.daily;
    const { rows } = reportDef.getData(filteredExpenses, [], []);
    exportToExcelCsv(
      `Sunvault_Daily_Expense_Report`,
      `Daily Expense Audit Report ${filterDate ? `(${filterDate})` : ''}`,
      reportDef.headers,
      rows,
      [
        'TOTAL',
        '',
        '',
        '',
        '',
        '',
        '',
        totalTravel,
        totalFood,
        totalMat,
        totalOther,
        grandTotal,
        '',
        '',
        '',
        '',
      ]
    );
  };

  const handleOpenPrint = () => {
    const headers = [
      'Sr.',
      'ID',
      'Date',
      'Employee',
      'Site Name',
      'Category',
      'Travelling',
      'Food',
      'Material',
      'Other',
      'Total (₹)',
      'Status',
    ];

    const rows = breakdownRows.map((r) => [
      r.srNo,
      r.expense.id,
      r.expense.expenseDate,
      r.expense.employeeName,
      r.expense.siteName || 'General',
      r.expense.category,
      r.travelAmt,
      r.foodAmt,
      r.matAmt,
      r.otherAmt,
      r.expense.totalAmount,
      r.expense.approvalStatus,
    ]);

    onOpenPrintModal(
      `Daily Solar Project Expense Ledger ${filterDate ? `(${filterDate})` : ''}`,
      headers,
      rows,
      {
        'Total Travelling': `₹${totalTravel.toLocaleString('en-IN')}`,
        'Total Food & Refreshments': `₹${totalFood.toLocaleString('en-IN')}`,
        'Total Materials & Tools': `₹${totalMat.toLocaleString('en-IN')}`,
        'Other Operations': `₹${totalOther.toLocaleString('en-IN')}`,
        'Grand Total Claimed': `₹${grandTotal.toLocaleString('en-IN')}`,
      }
    );
  };

  return (
    <div className="space-y-5 pb-20 lg:pb-8">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Daily Expense Breakdown Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Classified itemization across Travelling, Food, Material, and Site operations
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
            <span>Print / PDF Document</span>
          </button>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Date Picker */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select Specific Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            />
          </div>

          {/* Site Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Site Name</label>
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium"
            >
              <option value="all">All Sites & General</option>
              {knownSites.map((s: string) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Employee Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Employee Name / ID</label>
            <input
              type="text"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              placeholder="e.g. Suresh / Rahul"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Expense Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Approval Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Approval Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>

        {filterDate && (
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500">
              Filtering specifically for date: <strong className="text-slate-800">{filterDate}</strong>
            </span>
            <button
              onClick={() => setFilterDate('')}
              className="text-amber-700 hover:underline font-semibold"
            >
              Clear date filter (Show all dates)
            </button>
          </div>
        )}
      </div>

      {/* 4 Category Breakdown Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Travelling Total
          </span>
          <div className="text-base font-bold text-sky-700 mt-1 font-mono tabular-nums">
            ₹{totalTravel.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Food & Refreshments
          </span>
          <div className="text-base font-bold text-amber-700 mt-1 font-mono tabular-nums">
            ₹{totalFood.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Material & Tools
          </span>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono tabular-nums">
            ₹{totalMat.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Other Operations
          </span>
          <div className="text-base font-bold text-slate-900 mt-1 font-mono tabular-nums">
            ₹{totalOther.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Daily Expense Table with exact required columns */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-3 py-3">Sr. No.</th>
                <th className="px-3 py-3">Expense ID</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Employee Name</th>
                <th className="px-4 py-3">Site Name</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-3 py-3 text-right">Travelling (₹)</th>
                <th className="px-3 py-3 text-right">Food (₹)</th>
                <th className="px-3 py-3 text-right">Material (₹)</th>
                <th className="px-3 py-3 text-right">Other (₹)</th>
                <th className="px-3 py-3 text-right font-bold">Total (₹)</th>
                <th className="px-3 py-3">Mode</th>
                <th className="px-3 py-3 text-center">Bill</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-4 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {breakdownRows.length > 0 ? (
                breakdownRows.map((row) => {
                  const e = row.expense;
                  const billAvailable = e.attachments.length > 0;

                  return (
                    <tr
                      key={e.id}
                      onClick={() => onSelectExpense(e)}
                      className="hover:bg-amber-50/40 cursor-pointer transition-colors"
                    >
                      <td className="px-3 py-3 font-mono text-slate-400">{row.srNo}</td>
                      <td className="px-3 py-3 font-mono font-bold text-amber-600 whitespace-nowrap">
                        {e.id}
                      </td>
                      <td className="px-3 py-3 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {e.expenseDate}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap font-medium text-slate-900">
                        {e.employeeName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {e.siteName ? (
                          <span className="font-medium text-slate-800">{e.siteName}</span>
                        ) : (
                          <span className="text-slate-400 italic">General</span>
                        )}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-slate-700">{e.category}</td>
                      <td className="px-4 py-3 max-w-[180px] truncate text-slate-600">{e.description}</td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums text-slate-700">
                        {row.travelAmt ? `₹${row.travelAmt.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums text-slate-700">
                        {row.foodAmt ? `₹${row.foodAmt.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums text-slate-700">
                        {row.matAmt ? `₹${row.matAmt.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums text-slate-700">
                        {row.otherAmt ? `₹${row.otherAmt.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        ₹{e.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-slate-600">{e.paymentMode}</td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        {billAvailable ? (
                          <span className="text-emerald-700 font-bold">Yes</span>
                        ) : (
                          <span className="text-slate-400">No</span>
                        )}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap font-medium">
                        <span
                          className={
                            e.approvalStatus === 'Approved' || e.approvalStatus === 'Paid'
                              ? 'text-emerald-700'
                              : e.approvalStatus === 'Rejected'
                              ? 'text-rose-600'
                              : 'text-amber-600'
                          }
                        >
                          {e.approvalStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-[150px] truncate text-slate-400">{e.remarks || '-'}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={16} className="py-10 text-center text-slate-400 text-xs">
                    No records match the selected date or filter parameters.
                  </td>
                </tr>
              )}
            </tbody>
            {breakdownRows.length > 0 && (
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                <tr>
                  <td colSpan={7} className="px-4 py-3 text-slate-900 text-right">
                    Grand Total ({breakdownRows.length} Items)
                  </td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums text-sky-800">
                    ₹{totalTravel.toLocaleString('en-IN')}
                  </td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums text-amber-800">
                    ₹{totalFood.toLocaleString('en-IN')}
                  </td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums text-slate-800">
                    ₹{totalMat.toLocaleString('en-IN')}
                  </td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums text-slate-800">
                    ₹{totalOther.toLocaleString('en-IN')}
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-slate-900 text-sm tabular-nums">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </td>
                  <td colSpan={4}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
