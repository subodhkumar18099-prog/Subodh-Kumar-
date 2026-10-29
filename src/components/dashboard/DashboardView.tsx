/**
 * Sunvault Expenses Manager - Dashboard View
 * Dual Mode:
 * - Admin Dashboard (Section 7): Full company oversight (Today, Month, Emp-wise, Site-wise, Cat-wise, Advances, Approvals, Payments)
 * - Employee Dashboard (Section 8): Strict privacy - My Expenses, My Pending, My Approved, My Rejected, My Advance Balance, My Reimbursements
 * Full Bilingual English & Hindi translations
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DateFilterRange } from '../../types';
import {
  Calendar,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  CreditCard,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  Plus,
  Shield,
  User,
  AlertTriangle,
  Receipt,
  Download,
  UserCheck,
  Edit2,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenAddExpense: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenAddExpense }) => {
  const { currentUser, expenses, allCompanyExpenses, allCompanyAdvances, advances, getDashboardStats, setActiveTab, t, language } = useApp();

  const [dateRange, setDateRange] = useState<DateFilterRange>('thismonth');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';
  const stats = useMemo(() => getDashboardStats(dateRange, customStart, customEnd), [getDashboardStats, dateRange, customStart, customEnd]);

  // Admin Charts Data (uses allCompanyExpenses)
  const siteChartData = useMemo(() => {
    if (!isAdmin) return [];
    const siteMap: Record<string, number> = {};
    allCompanyExpenses.forEach((e) => {
      const site = e.siteName && e.siteName.trim() ? e.siteName.trim() : (language === 'hi' ? 'सामान्य / गैर-प्रोजेक्ट' : 'General / Non-Project');
      siteMap[site] = (siteMap[site] || 0) + e.totalAmount;
    });

    const entries = Object.entries(siteMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);

    const max = Math.max(...entries.map((s) => s.amount), 1000);
    return entries.map((s) => ({ ...s, pct: Math.round((s.amount / max) * 100) }));
  }, [allCompanyExpenses, isAdmin, language]);

  const categoryChartData = useMemo(() => {
    if (!isAdmin) return [];
    const catMap: Record<string, number> = {};
    allCompanyExpenses.forEach((e) => {
      catMap[e.category] = (catMap[e.category] || 0) + e.totalAmount;
    });

    return Object.entries(catMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [allCompanyExpenses, isAdmin]);

  const employeeChartData = useMemo(() => {
    if (!isAdmin) return [];
    const empMap: Record<string, { total: number; count: number; approved: number }> = {};
    allCompanyExpenses.forEach((e) => {
      const label = e.employeeName ? `${e.employeeName} (ID: ${e.employeeId})` : `Employee ${e.employeeId}`;
      if (!empMap[label]) empMap[label] = { total: 0, count: 0, approved: 0 };
      empMap[label].total += e.totalAmount;
      empMap[label].count += 1;
      if (e.approvalStatus === 'Approved' || e.approvalStatus === 'Paid') {
        empMap[label].approved += e.totalAmount;
      }
    });

    return Object.entries(empMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [allCompanyExpenses, isAdmin]);

  // Employee Personal Recent Claims (strictly filtered to this employee)
  const myRecentExpenses = useMemo(() => {
    return expenses.slice(0, 5);
  }, [expenses]);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Privacy Notice Banner */}
      <div
        className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
          isAdmin
            ? 'bg-purple-50/70 border-purple-200 text-purple-900'
            : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
        }`}
      >
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Shield className="w-4 h-4 text-purple-700 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          )}
          <span className="font-medium">
            {isAdmin ? t('adminNotice') : t('privacyNoticeEmployee')}
          </span>
        </div>
        <span className="font-mono text-[11px] font-bold shrink-0">
          {isAdmin ? 'ADMIN CONSOLE' : `AUTH EMP ID: ${currentUser.employeeId}`}
        </span>
      </div>

      {/* Header Bar with Date Range Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {isAdmin ? t('adminDashboardTitle') : t('employeeDashboardTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isAdmin ? t('adminDashboardSubtitle') : t('employeeDashboardSubtitle')}
          </p>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setDateRange('today')}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                dateRange === 'today' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'hi' ? 'आज' : 'Today'}
            </button>
            <button
              onClick={() => setDateRange('yesterday')}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                dateRange === 'yesterday' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'hi' ? 'कल' : 'Yesterday'}
            </button>
            <button
              onClick={() => setDateRange('last7days')}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                dateRange === 'last7days' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'hi' ? 'पिछले 7 दिन' : 'Last 7 Days'}
            </button>
            <button
              onClick={() => setDateRange('thismonth')}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                dateRange === 'thismonth' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'hi' ? 'इस माह' : 'This Month'}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          ADMIN VIEW: 11 REQUIRED KPI SUMMARY CARDS (Section 7)
          ======================================================== */}
      {isAdmin ? (
        <>
          {/* Admin Quick Action Bar: Employee Accounts & Credentials */}
          <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-purple-500/10 border border-amber-300 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl shadow-xs shrink-0">
                <UserCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>
                    {language === 'hi'
                      ? 'कर्मचारी आईडी, नाम, पासवर्ड व एक्टिव/डीएक्टिव प्रबंधन'
                      : 'Employee Credentials: ID, Name, Password & Active / Deactive'}
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {language === 'hi'
                    ? 'एडमिन स्वयं कर्मचारी आईडी व नाम बदल सकते हैं एवं खातों को Active या Deactive कर सकते हैं'
                    : 'Admins can directly edit Employee IDs, Names, Passwords, and toggle Active / Deactive accounts'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('users')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'hi' ? 'कर्मचारी खाते खोलें' : 'Manage Employee Accounts'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
            {/* 1. Today's Total Expenses */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('kpiTodayTotal')}
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
                ₹{stats.todayTotal.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Company-wide today</span>
            </div>

            {/* 2. Monthly Total Expenses */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('kpiMonthTotal')}
              </span>
              <div className="text-xl font-bold text-amber-600 mt-1 font-mono tabular-nums">
                ₹{stats.monthTotal.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Gross calendar month</span>
            </div>

            {/* 3. Site-wise Total */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('kpiSiteExpenses')}
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
                ₹{stats.totalSiteExpenses.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Project sites expenditure</span>
            </div>

            {/* 4. Total Advances */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('kpiTotalAdvances')}
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
                ₹{stats.totalAdvances.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Adjusted: ₹{stats.totalAdvanceAdjustments.toLocaleString('en-IN')}
              </span>
            </div>

            {/* 5. Pending Approvals */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('kpiPendingApprovals')}
              </span>
              <div className="text-xl font-bold text-amber-600 mt-1 font-mono tabular-nums">
                {stats.pendingApprovalsCount}
              </div>
              <span className="text-[11px] text-amber-700 font-medium mt-0.5 block">Action required</span>
            </div>

            {/* 6. Approved Expenses */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('kpiApprovedExpenses')}
              </span>
              <div className="text-xl font-bold text-emerald-600 mt-1 font-mono tabular-nums">
                {stats.approvedCount}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Certified by Admin</span>
            </div>

            {/* 7. Rejected Expenses */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('kpiRejectedExpenses')}
              </span>
              <div className="text-xl font-bold text-rose-600 mt-1 font-mono tabular-nums">
                {stats.rejectedCount}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Declined with reason</span>
            </div>

            {/* 8. Paid Expenses */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('kpiPaidExpenses')}
              </span>
              <div className="text-xl font-bold text-teal-700 mt-1 font-mono tabular-nums">
                {stats.paidCount}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Disbursed claims</span>
            </div>

            {/* 9. Outstanding Payments */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs sm:col-span-2 xl:col-span-4">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('kpiOutstandingPayments')}
              </span>
              <div className="text-xl font-bold text-rose-600 mt-1 font-mono tabular-nums">
                ₹{stats.outstandingPaymentsAmount.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Approved claims awaiting disbursement</span>
            </div>
          </div>

          {/* Admin Charts Grid: Site-wise, Category-wise, Employee-wise */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Site-wise Expenses */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900">{t('kpiSiteExpenses')}</h3>
                <span className="text-xs text-slate-400 font-mono">Top Projects</span>
              </div>
              <div className="space-y-2.5">
                {siteChartData.length > 0 ? (
                  siteChartData.map((s) => (
                    <div key={s.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-800 truncate max-w-[160px]">{s.name}</span>
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          ₹{s.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-slate-800 h-1.5 rounded-full" style={{ width: `${s.pct}%` }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 text-center py-4">No site expenses recorded.</div>
                )}
              </div>
            </div>

            {/* Category-wise Expenses */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900">{t('kpiCategoryExpenses')}</h3>
                <span className="text-xs text-slate-400 font-mono">15 Heads</span>
              </div>
              <div className="divide-y divide-slate-100">
                {categoryChartData.map((c) => (
                  <div key={c.category} className="py-2 flex items-center justify-between text-xs">
                    <span className="text-slate-700 truncate max-w-[170px]">{c.category}</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      ₹{c.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Employee-wise Expenses */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900">{t('kpiEmployeeExpenses')}</h3>
                <span className="text-xs text-slate-400 font-mono">10 Accounts</span>
              </div>
              <div className="divide-y divide-slate-100">
                {employeeChartData.map((emp) => (
                  <div key={emp.name} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-900 block truncate max-w-[150px]">{emp.name}</span>
                      <span className="text-[10px] text-slate-400">{emp.count} claims</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      ₹{emp.total.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ========================================================
           EMPLOYEE VIEW: 6 STRICT PERSONAL KPI CARDS (Section 8)
           Strictly NO OTHER employee information shown!
           ======================================================== */
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* 1. My Expenses */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('kpiMyExpenses')}
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
                ₹{stats.myTotalExpenses.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">{expenses.length} claims</span>
            </div>

            {/* 2. My Pending Expenses */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('kpiMyPending')}
              </span>
              <div className="text-xl font-bold text-amber-600 mt-1 font-mono tabular-nums">
                {stats.myPendingExpenses}
              </div>
              <span className="text-[11px] text-amber-700 font-medium mt-0.5 block">Under Admin review</span>
            </div>

            {/* 3. My Approved Expenses */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('kpiMyApproved')}
              </span>
              <div className="text-xl font-bold text-emerald-600 mt-1 font-mono tabular-nums">
                {stats.myApprovedExpenses}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Certified</span>
            </div>

            {/* 4. My Rejected Expenses */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('kpiMyRejected')}
              </span>
              <div className="text-xl font-bold text-rose-600 mt-1 font-mono tabular-nums">
                {stats.myRejectedExpenses}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Check rejection note</span>
            </div>

            {/* 5. My Advance Balance */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('kpiMyAdvanceBalance')}
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
                ₹{stats.myAdvanceBalance.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Unadjusted balance</span>
            </div>

            {/* 6. My Reimbursements */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {t('kpiMyReimbursements')}
              </span>
              <div className="text-xl font-bold text-teal-700 mt-1 font-mono tabular-nums">
                ₹{stats.myReimbursementsPending.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Pending payment</span>
            </div>
          </div>

          {/* Employee's Recent Submissions Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'hi' ? 'मेरे हाल ही में प्रस्तुत किए गए खर्चे' : 'My Recent Expense Submissions'}
              </h3>
              <button
                onClick={() => setActiveTab('expenses')}
                className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
              >
                {language === 'hi' ? 'सभी देखें →' : 'View All →'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/70 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">ID</th>
                    <th className="px-3 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Site Name</th>
                    <th className="px-3 py-2.5">Category</th>
                    <th className="px-4 py-2.5">Description</th>
                    <th className="px-3 py-2.5 text-right">Amount (₹)</th>
                    <th className="px-3 py-2.5">Approval Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myRecentExpenses.length > 0 ? (
                    myRecentExpenses.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-mono font-bold text-amber-600">{e.id}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-600 tabular-nums">{e.expenseDate}</td>
                        <td className="px-4 py-2.5">
                          {e.siteName ? (
                            <span className="font-medium text-slate-800">{e.siteName}</span>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">{e.category}</td>
                        <td className="px-4 py-2.5 max-w-[200px] truncate text-slate-600">{e.description}</td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                          ₹{e.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-3 py-2.5 font-semibold">
                          <span
                            className={
                              e.approvalStatus === 'Approved'
                                ? 'text-emerald-700'
                                : e.approvalStatus === 'Rejected'
                                ? 'text-rose-600'
                                : 'text-amber-600'
                            }
                          >
                            {e.approvalStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-400 text-xs">
                        {language === 'hi' ? 'आपने अभी तक कोई खर्च दर्ज नहीं किया है।' : 'No expenses logged yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Field Action CTA */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold">
            {language === 'hi' ? 'नया सोलर प्रोजेक्ट खर्च दर्ज करें' : 'Log New Solar Project Expense'}
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            {language === 'hi'
              ? 'साइट नाम और कर्मचारी नाम डिफ़ॉल्ट रूप से रिक्त रहेंगे। आपकी कर्मचारी आईडी स्वतः संबद्ध होगी।'
              : 'Site Name and Employee Name are blank by default. Your authenticated Employee ID is automatically locked.'}
          </p>
        </div>

        <button
          onClick={onOpenAddExpense}
          className="w-full sm:w-auto px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t('navAddExpense')}</span>
        </button>
      </div>
    </div>
  );
};
