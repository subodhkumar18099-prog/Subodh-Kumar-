/**
 * Sunvault Expenses Manager - Mobile Bottom Navigation
 * Provides thumb-friendly navigation for Android phones & touch devices
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SunvaultLogo } from './SunvaultLogo';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  Wallet,
  Menu,
  CheckCircle,
  Building2,
  FileSpreadsheet,
  X,
  CreditCard,
  FileText,
  Users,
} from 'lucide-react';

interface MobileNavProps {
  onOpenAddExpense: () => void;
  onOpenTravelForm: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenAddExpense, onOpenTravelForm }) => {
  const { activeTab, setActiveTab, currentUser } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  if (!currentUser) return null;

  return (
    <>
      {/* Mobile Bottom Bar (Sticky cap <= 15% viewport height) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-30 flex items-center justify-around px-2 py-2 text-[10px] text-slate-400 no-print safe-area-bottom">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-1 min-w-[54px] min-h-[44px] justify-center ${
            activeTab === 'dashboard' ? 'text-amber-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex flex-col items-center gap-1 p-1 min-w-[54px] min-h-[44px] justify-center ${
            activeTab === 'expenses' ? 'text-amber-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span>Expenses</span>
        </button>

        {/* Center Prominent Add Button */}
        <button
          onClick={() => setAddSheetOpen(true)}
          className="flex flex-col items-center justify-center p-1 -mt-5 min-w-[54px] min-h-[54px] rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 shadow-lg shadow-amber-500/30"
          aria-label="Add new expense or travel log"
        >
          <PlusCircle className="w-7 h-7 stroke-[2.5]" />
        </button>

        <button
          onClick={() => setActiveTab('advances')}
          className={`flex flex-col items-center gap-1 p-1 min-w-[54px] min-h-[44px] justify-center ${
            activeTab === 'advances' ? 'text-amber-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span>Advances</span>
        </button>

        <button
          onClick={() => setDrawerOpen(true)}
          className={`flex flex-col items-center gap-1 p-1 min-w-[54px] min-h-[44px] justify-center ${
            ['daily-report', 'sites', 'approvals', 'payments', 'reports', 'users'].includes(activeTab)
              ? 'text-amber-400 font-semibold'
              : 'hover:text-slate-200'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>

      {/* Add Choice Bottom Sheet */}
      {addSheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAddSheetOpen(false)} />
          <div className="relative bg-white rounded-t-2xl p-5 shadow-2xl z-10 animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-900 mb-1">Create New Solar Expense</h3>
            <p className="text-xs text-slate-500 mb-4">Choose an entry mode for site or transit costs</p>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => {
                  setAddSheetOpen(false);
                  onOpenAddExpense();
                }}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-left transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Standard Expense Entry</div>
                  <div className="text-xs text-slate-500">Material, Labour, Food, Site Misc, Tools, Hotel</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setAddSheetOpen(false);
                  onOpenTravelForm();
                }}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-left transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Travelling Expense Form</div>
                  <div className="text-xs text-slate-500">Outward/return fares, tolls, fuel, local conveyance</div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setAddSheetOpen(false)}
              className="mt-4 w-full py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Drawer for More Modules */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative ml-auto w-4/5 max-w-sm h-full bg-slate-900 text-white p-5 flex flex-col justify-between z-10 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <SunvaultLogo variant="full" size="sm" theme="dark" />
                  <span className="text-[10px] text-amber-400 font-semibold block mt-1 uppercase tracking-wider">
                    {currentUser.name || currentUser.username} ({currentUser.role.replace('_', ' ')})
                  </span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-1">
                <button
                  onClick={() => {
                    setActiveTab('daily-report');
                    setDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left ${
                    activeTab === 'daily-report' ? 'bg-amber-400/10 text-amber-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Daily Expense Report</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('sites');
                    setDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left ${
                    activeTab === 'sites' ? 'bg-amber-400/10 text-amber-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Site Ledger & Projects</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('approvals');
                    setDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left ${
                    activeTab === 'approvals' ? 'bg-amber-400/10 text-amber-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approval Workflow</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('payments');
                    setDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left ${
                    activeTab === 'payments' ? 'bg-amber-400/10 text-amber-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Payment Management</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('reports');
                    setDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left ${
                    activeTab === 'reports' ? 'bg-amber-400/10 text-amber-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Reports Hub (18 Reports)</span>
                </button>

                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      setActiveTab('users');
                      setDrawerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left ${
                      activeTab === 'users' ? 'bg-amber-400/20 text-amber-400 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>Employee Accounts (ID, Name, Active/Deactive)</span>
                    </div>
                    <span className="text-[9px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
              <div className="font-semibold text-slate-200">{currentUser.name || currentUser.username}</div>
              <div className="text-[11px] text-slate-400">{currentUser.employeeId} · {currentUser.department || 'Operations'}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
