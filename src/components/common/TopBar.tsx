/**
 * Sunvault Expenses Manager - TopBar Component
 * Strictly enforces 3-Zone Top Bar Contract, Bilingual Toggle, and Role Visibility
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SunvaultLogo } from './SunvaultLogo';
import {
  Plus,
  Receipt,
  LogOut,
  Globe,
  ChevronDown,
  Shield,
  User,
  Users,
} from 'lucide-react';

interface TopBarProps {
  onOpenAddExpense: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenAddExpense }) => {
  const { currentUser, logout, quickSwitchUser, activeTab, setActiveTab, language, setLanguage, t, users } = useApp();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  if (!currentUser) return null;

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
      {/* Main Top Navigation Bar - 3-Zone Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Official Sunvault Logo) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center text-left hover:opacity-95 transition-opacity cursor-pointer"
          >
            <SunvaultLogo variant="full" size="md" theme="dark" />
          </button>
        </div>

        {/* Zone 2: Navigation Links (single line, subtle hover underlines) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'dashboard' ? 'text-amber-400 bg-slate-800/80 font-semibold' : 'hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {t('navDashboard')}
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'expenses' ? 'text-amber-400 bg-slate-800/80 font-semibold' : 'hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {t('navExpenses')}
          </button>

          <button
            onClick={() => setActiveTab('advances')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'advances' ? 'text-amber-400 bg-slate-800/80 font-semibold' : 'hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {t('navAdvances')}
          </button>

          {/* Admin Only: Approvals & Payments */}
          {currentUser.role === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('approvals')}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'approvals' ? 'text-amber-400 bg-slate-800/80 font-semibold' : 'hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {t('navApprovals')}
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'payments' ? 'text-amber-400 bg-slate-800/80 font-semibold' : 'hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {t('navPayments')}
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'reports' ? 'text-amber-400 bg-slate-800/80 font-semibold' : 'hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {t('navReports')}
          </button>

          {/* Admin Only: User Accounts */}
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'text-amber-400 bg-slate-800 font-bold ring-1 ring-amber-400/40'
                  : 'hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span>{t('navEmployees')}</span>
              <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-bold">
                10
              </span>
            </button>
          )}
        </nav>

        {/* Zone 3: Actions (Language toggle, User Session Switcher, Add Expense) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Bilingual Toggle (English / हिंदी) */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors flex items-center gap-1"
            title="Toggle Language / भाषा बदलें"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'हिंदी' : 'EN'}</span>
          </button>

          {/* User Session Badge & Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              title="Current Session Profile"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  currentUser.role === 'admin' ? 'bg-purple-400' : 'bg-amber-400'
                }`}
              />
              <div className="text-left leading-tight hidden sm:block">
                <span className="font-semibold text-slate-200 block truncate max-w-[120px]">
                  {currentUser.username} {currentUser.role === 'employee' ? `(ID: ${currentUser.employeeId})` : ''}
                </span>
                <span className="text-[10px] text-amber-400 uppercase tracking-wider block">
                  {currentUser.role === 'admin' ? 'ADMIN' : `EMP ID: ${currentUser.employeeId}`}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setRoleMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-72 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 z-50 py-2 divide-y divide-slate-100 animate-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 bg-slate-50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {language === 'hi' ? 'सक्रिय सत्र' : 'Current Active Session'}
                    </span>
                    <div className="font-bold text-slate-900 text-xs mt-0.5">
                      {currentUser.username} · {currentUser.role.toUpperCase()}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {currentUser.role === 'admin'
                        ? 'Master Administrator Access'
                        : `Employee ID: ${currentUser.employeeId} (Strict Privacy Active)`}
                    </div>
                  </div>

                  {/* Switch to Admin or Employees 1-10 */}
                  <div className="py-1 max-h-56 overflow-y-auto">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">
                      {language === 'hi' ? 'खाता बदलें (परीक्षण हेतु)' : 'Switch Account (For Testing)'}
                    </div>

                    {/* 2 Admin Accounts */}
                    <button
                      onClick={() => {
                        quickSwitchUser('subodh');
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-1.5 text-xs flex items-center justify-between hover:bg-purple-50 ${
                        currentUser.username === 'subodh' || currentUser.username === 'admin'
                          ? 'bg-purple-50 font-bold text-purple-900'
                          : 'text-slate-700'
                      }`}
                    >
                      <span>Admin 1: Subodh Kumar</span>
                      {(currentUser.username === 'subodh' || currentUser.username === 'admin') && (
                        <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 rounded">Active</span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        quickSwitchUser('pratik');
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-1.5 text-xs flex items-center justify-between hover:bg-purple-50 ${
                        currentUser.username === 'pratik'
                          ? 'bg-purple-50 font-bold text-purple-900'
                          : 'text-slate-700'
                      }`}
                    >
                      <span>Admin 2: Pratik Sir</span>
                      {currentUser.username === 'pratik' && (
                        <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 rounded">Active</span>
                      )}
                    </button>

                    {/* Employees 1 to 10 */}
                    {users
                      .filter((u) => u.role === 'employee')
                      .slice(0, 10)
                      .map((emp) => (
                        <button
                          key={emp.id}
                          onClick={() => {
                            quickSwitchUser(emp.username);
                            setRoleMenuOpen(false);
                          }}
                          className={`w-full text-left px-4 py-1.5 text-xs flex items-center justify-between hover:bg-amber-50 ${
                            currentUser.id === emp.id ? 'bg-amber-50 font-bold text-amber-900' : 'text-slate-700'
                          }`}
                        >
                          <span>
                            Employee {emp.employeeId} ({emp.username})
                          </span>
                          {currentUser.id === emp.id && (
                            <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 rounded">Active</span>
                          )}
                        </button>
                      ))}
                  </div>

                  <div className="p-2 bg-slate-50">
                    <button
                      onClick={() => {
                        setRoleMenuOpen(false);
                        logout();
                      }}
                      className="w-full py-1.5 px-3 text-xs text-rose-600 hover:bg-rose-50 font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Primary Action Button */}
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">{t('navAddExpense')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
