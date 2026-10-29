/**
 * Sunvault Expenses Manager
 * Company: Sunvault Powertech Pvt. Ltd.
 * Professional Solar Project Expense Management Application
 * Enforces:
 * - Admin account vs 10 Employee accounts (IDs 1 to 10 with blank names)
 * - Strict Privacy (Employees cannot see other employees' expenses or advances)
 * - Site Name and Employee Name BLANK by default
 * - Bilingual Hindi + English support
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Expense } from './types';
import { TopBar } from './components/common/TopBar';
import { MobileNav } from './components/common/MobileNav';
import { NotificationToast } from './components/common/NotificationToast';
import { LoginView } from './components/auth/LoginView';
import { DashboardView } from './components/dashboard/DashboardView';
import { ExpenseListView } from './components/expenses/ExpenseListView';
import { AddExpenseModal } from './components/expenses/AddExpenseModal';
import { TravellingExpenseModal } from './components/expenses/TravellingExpenseModal';
import { ExpenseDetailModal } from './components/expenses/ExpenseDetailModal';
import { AdvanceManagementView } from './components/advances/AdvanceManagementView';
import { ApprovalsView } from './components/approvals/ApprovalsView';
import { PaymentsView } from './components/payments/PaymentsView';
import { ReportsHubView } from './components/reports/ReportsHubView';
import { PrintReportModal } from './components/reports/PrintReportModal';
import { UserManagementView } from './components/users/UserManagementView';

const AppContent: React.FC = () => {
  const { currentUser, activeTab } = useApp();

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isTravelModalOpen, setIsTravelModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Print Modal state
  const [printModalData, setPrintModalData] = useState<{
    isOpen: boolean;
    title: string;
    headers: string[];
    rows: (string | number)[][];
    summary?: Record<string, string | number>;
  }>({
    isOpen: false,
    title: '',
    headers: [],
    rows: [],
  });

  const handleOpenPrintModal = (
    title: string,
    headers: string[],
    rows: (string | number)[][],
    summary?: Record<string, string | number>
  ) => {
    setPrintModalData({
      isOpen: true,
      title,
      headers,
      rows,
      summary,
    });
  };

  // If user is not logged in, render the secure Login View
  if (!currentUser) {
    return <LoginView />;
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Navigation Header (3-Zone Contract) */}
      <TopBar onOpenAddExpense={() => setIsAddExpenseOpen(true)} />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
        {activeTab === 'dashboard' && (
          <DashboardView onOpenAddExpense={() => setIsAddExpenseOpen(true)} />
        )}

        {activeTab === 'expenses' && (
          <ExpenseListView
            onSelectExpense={(exp) => setSelectedExpense(exp)}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
          />
        )}

        {activeTab === 'advances' && <AdvanceManagementView />}

        {/* Admin Only Views */}
        {activeTab === 'approvals' && isAdmin && (
          <ApprovalsView onSelectExpense={(exp) => setSelectedExpense(exp)} />
        )}

        {activeTab === 'payments' && isAdmin && (
          <PaymentsView onSelectExpense={(exp) => setSelectedExpense(exp)} />
        )}

        {activeTab === 'reports' && (
          <ReportsHubView onOpenPrintModal={handleOpenPrintModal} />
        )}

        {activeTab === 'users' && isAdmin && (
          <UserManagementView />
        )}
      </main>

      {/* Mobile Bottom Navigation for touch devices */}
      <MobileNav
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        onOpenTravelForm={() => setIsTravelModalOpen(true)}
      />

      {/* Standard Add Expense Form (Sections 4 & 5 compliant: Site Name & Employee Name BLANK by default) */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
      />

      {/* Dedicated Travelling Form */}
      <TravellingExpenseModal
        isOpen={isTravelModalOpen}
        onClose={() => setIsTravelModalOpen(false)}
      />

      {/* Expense Detail Modal */}
      <ExpenseDetailModal
        expense={selectedExpense}
        onClose={() => setSelectedExpense(null)}
      />

      {/* Official Sunvault Letterhead Print/PDF Modal */}
      <PrintReportModal
        isOpen={printModalData.isOpen}
        onClose={() => setPrintModalData((prev) => ({ ...prev, isOpen: false }))}
        reportTitle={printModalData.title}
        headers={printModalData.headers}
        rows={printModalData.rows}
        summaryMetrics={printModalData.summary}
      />

      {/* Floating Alerts & Toast */}
      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
