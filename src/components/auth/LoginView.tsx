/**
 * Sunvault Expenses Manager - Secure Login View
 * Displays Sunvault Powertech Pvt. Ltd. Official Brand Logo
 * 2 Admin Accounts: Subodh Kumar & Pratik Sir
 * 10 Employee Accounts: IDs 1 to 10
 * Bilingual English / Hindi support
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SunvaultLogo } from '../common/SunvaultLogo';
import { Lock, User, AlertCircle, ArrowRight, Globe, Shield, Users, ChevronDown, ChevronUp } from 'lucide-react';

interface LoginViewProps {
  onSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { login, language, setLanguage, t, users } = useApp();

  const [username, setUsername] = useState('subodh');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAllEmployees, setShowAllEmployees] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(username, password);
      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(res.message || t('invalidCredentials'));
      }
    } catch {
      setError(t('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 selection:bg-amber-400 selection:text-slate-950">
      {/* Top Language Toggle */}
      <div className="w-full max-w-md flex justify-end mb-3">
        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 shadow-sm transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Official Brand Logo Header */}
        <div className="p-6 bg-white text-center border-b border-slate-200 flex flex-col items-center justify-center">
          <SunvaultLogo variant="full" size="lg" theme="light" className="mb-2" />
          <div className="inline-block px-3 py-1 rounded-full bg-amber-50 text-[11px] font-bold text-amber-800 border border-amber-200 mt-1">
            {language === 'hi' ? 'सौर परियोजना व्यय प्रबंधन पोर्टल' : 'Solar Project Expense Management Portal'}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-800 mb-1">{t('username')} *</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('enterUsername')}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:border-amber-500 focus:outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">{t('password')} *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('enterPassword')}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : t('signIn')}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Quick Credential Helpers */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div>
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider mb-2">
                <Shield className="w-3.5 h-3.5 text-purple-600" />
                <span>{language === 'hi' ? 'व्यवस्थापक खाते (2 एडमिन)' : 'Admin Accounts (2 Admins)'}:</span>
              </span>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {/* Admin 1: Subodh Kumar */}
                <button
                  type="button"
                  onClick={() => handleQuickFill('subodh', 'Admin@123')}
                  className={`p-2 rounded-lg text-left border transition-all ${
                    username === 'subodh'
                      ? 'bg-purple-100 border-purple-400 text-purple-950 font-bold ring-1 ring-purple-300'
                      : 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-950'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>Subodh Kumar</span>
                    <span className="text-[9px] bg-purple-200 text-purple-800 px-1 rounded">Admin 1</span>
                  </div>
                  <div className="text-[10px] text-purple-700 mt-0.5 font-mono">subodh / Admin@123</div>
                </button>

                {/* Admin 2: Pratik Sir */}
                <button
                  type="button"
                  onClick={() => handleQuickFill('pratik', 'Admin@123')}
                  className={`p-2 rounded-lg text-left border transition-all ${
                    username === 'pratik'
                      ? 'bg-purple-100 border-purple-400 text-purple-950 font-bold ring-1 ring-purple-300'
                      : 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-950'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>Pratik Sir</span>
                    <span className="text-[9px] bg-purple-200 text-purple-800 px-1 rounded">Admin 2</span>
                  </div>
                  <div className="text-[10px] text-purple-700 mt-0.5 font-mono">pratik / Admin@123</div>
                </button>
              </div>
            </div>

            {/* Employee Accounts */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>{language === 'hi' ? 'कर्मचारी लॉगिन आईडी (10 कर्मचारी)' : 'Employee Login IDs (10 Employees)'}:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAllEmployees(!showAllEmployees)}
                  className="text-[10px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-0.5"
                >
                  <span>{showAllEmployees ? 'Hide' : 'View All 10'}</span>
                  {showAllEmployees ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Quick 2 Employees */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {(() => {
                  const emp1 = users.find((u) => u.username === 'emp1') || {
                    username: 'emp1',
                    employeeId: '1',
                    name: '',
                    password: 'Pass@emp1',
                  };
                  const emp2 = users.find((u) => u.username === 'emp2') || {
                    username: 'emp2',
                    employeeId: '2',
                    name: '',
                    password: 'Pass@emp2',
                  };
                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => handleQuickFill(emp1.username, emp1.password || `Pass@${emp1.username}`)}
                        className={`p-2 rounded-lg text-left border transition-all ${
                          username === emp1.username
                            ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold ring-1 ring-amber-300'
                            : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-950'
                        }`}
                      >
                        <div className="font-bold truncate">
                          {emp1.name ? emp1.name : `Emp ${emp1.employeeId}`} (ID: {emp1.employeeId})
                        </div>
                        <div className="text-[10px] text-amber-700 font-mono truncate">
                          {emp1.username} / {emp1.password || `Pass@${emp1.username}`}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickFill(emp2.username, emp2.password || `Pass@${emp2.username}`)}
                        className={`p-2 rounded-lg text-left border transition-all ${
                          username === emp2.username
                            ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold ring-1 ring-amber-300'
                            : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-950'
                        }`}
                      >
                        <div className="font-bold truncate">
                          {emp2.name ? emp2.name : `Emp ${emp2.employeeId}`} (ID: {emp2.employeeId})
                        </div>
                        <div className="text-[10px] text-amber-700 font-mono truncate">
                          {emp2.username} / {emp2.password || `Pass@${emp2.username}`}
                        </div>
                      </button>
                    </>
                  );
                })()}
              </div>

              {/* Expanded view for all 10 employees */}
              {showAllEmployees && (
                <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1 max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-1.5">
                    {users
                      .filter((u) => u.role === 'employee')
                      .map((emp) => (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => handleQuickFill(emp.username, emp.password || `Pass@${emp.username}`)}
                          className={`p-1.5 rounded text-left border text-[10px] transition-colors ${
                            username === emp.username
                              ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold'
                              : 'bg-white hover:bg-amber-50/50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="font-semibold truncate">
                            {emp.name ? emp.name : `Emp ${emp.employeeId}`} (ID: {emp.employeeId})
                          </div>
                          <div className="text-[9px] text-slate-500 font-mono truncate">
                            {emp.username} / {emp.password || `Pass@${emp.username}`}
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-500 text-center leading-normal pt-1">
              {language === 'hi'
                ? 'कर्मचारी आईडी 1 से 10 तक के नाम डिफ़ॉल्ट रूप से रिक्त हैं। वर्तमान में सभी व्यय शून्य (0) सेट हैं।'
                : 'Employee names are blank by default. All initial project expenses are set to zero (0).'}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
