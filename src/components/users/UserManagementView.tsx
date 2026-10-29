/**
 * Sunvault Expenses Manager - User Management View (Admin Console)
 * Sunvault Powertech Pvt. Ltd.
 * Full Administrative Control:
 * - Admin can edit Employee ID (आईडी), Employee Name (नाम), and Password (पासवर्ड).
 * - Clear, high-visibility "Active (सक्रिय)" and "Deactive (निष्क्रिय)" toggle buttons & switches.
 * - Supports both direct inline editing on the card and comprehensive modal editing.
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import {
  Users,
  Shield,
  Key,
  Power,
  Edit2,
  Check,
  X,
  Lock,
  Eye,
  EyeOff,
  Search,
  Save,
  CheckCircle2,
  XCircle,
  Building,
  UserCheck,
  UserX,
  Sparkles,
} from 'lucide-react';

export const UserManagementView: React.FC = () => {
  const { users, currentUser, resetEmployeePassword, toggleUserStatus, updateUser, language } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deactive' | 'employee' | 'admin'>('all');

  // Inline Quick Editing state (card level)
  const [inlineEditingUserId, setInlineEditingUserId] = useState<string | null>(null);
  const [inlineEmployeeId, setInlineEmployeeId] = useState('');
  const [inlineName, setInlineName] = useState('');
  const [inlinePassword, setInlinePassword] = useState('');
  const [inlineShowPassword, setInlineShowPassword] = useState(false);
  const [inlineLoading, setInlineLoading] = useState(false);

  // Full Edit Modal State
  const [editModalUser, setEditModalUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmployeeId, setEditEmployeeId] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('employee');
  const [editIsActive, setEditIsActive] = useState(true);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccessMessage, setEditSuccessMessage] = useState<string | null>(null);

  // Quick Password Reset Modal State
  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h3 className="text-base font-bold text-rose-600">Access Denied</h3>
        <p className="text-xs text-slate-500 mt-1">Only System Administrator can manage employee accounts.</p>
      </div>
    );
  }

  // Counts for KPI pills
  const totalCount = users.length;
  const activeCount = users.filter((u) => u.isActive).length;
  const deactiveCount = users.filter((u) => !u.isActive).length;

  // Start Inline Editing for a specific card
  const startInlineEdit = (u: User) => {
    setInlineEditingUserId(u.id);
    setInlineEmployeeId(u.employeeId || '');
    setInlineName(u.name || '');
    setInlinePassword(u.password || `Pass@${u.username}`);
    setInlineShowPassword(false);
  };

  // Save Inline Edit
  const saveInlineEdit = async (userId: string) => {
    if (!inlineEmployeeId.trim()) {
      alert(language === 'hi' ? 'कृपया मान्य कर्मचारी आईडी दर्ज करें' : 'Please provide a valid Employee ID');
      return;
    }
    setInlineLoading(true);
    await updateUser(userId, {
      employeeId: inlineEmployeeId.trim(),
      name: inlineName.trim(),
      password: inlinePassword.trim() || undefined,
    });
    setInlineLoading(false);
    setInlineEditingUserId(null);
  };

  // Open Full Edit Modal
  const openEditModal = (u: User) => {
    setEditModalUser(u);
    setEditName(u.name || '');
    setEditEmployeeId(u.employeeId || '');
    setEditUsername(u.username || '');
    setEditPassword(u.password || `Pass@${u.username}`);
    setEditDepartment(u.department || 'Solar Operations');
    setEditRole(u.role);
    setEditIsActive(u.isActive);
    setShowEditPassword(false);
    setEditSuccessMessage(null);
  };

  // Submit Full Edit Modal Changes
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalUser) return;

    if (!editEmployeeId.trim()) {
      alert(language === 'hi' ? 'कृपया मान्य कर्मचारी आईडी दर्ज करें' : 'Please provide a valid Employee ID');
      return;
    }

    setEditLoading(true);
    await updateUser(editModalUser.id, {
      name: editName.trim(),
      employeeId: editEmployeeId.trim(),
      username: editUsername.trim(),
      password: editPassword.trim() || undefined,
      department: editDepartment.trim(),
      role: editRole,
      isActive: editIsActive,
    });

    setEditSuccessMessage(
      language === 'hi'
        ? `कर्मचारी विवरण (ID: ${editEmployeeId}, नाम: ${editName || 'Blank'}) सुरक्षित हो गया`
        : `Employee details updated successfully`
    );
    setEditLoading(false);

    setTimeout(() => {
      setEditModalUser(null);
      setEditSuccessMessage(null);
    }, 1200);
  };

  // Submit Quick Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser || !newPassword.trim()) return;

    await resetEmployeePassword(passwordModalUser.id, newPassword.trim());
    setModalSuccess(
      language === 'hi'
        ? `${passwordModalUser.username} का पासवर्ड रीसेट किया गया`
        : `Password updated for ${passwordModalUser.username}`
    );
    setTimeout(() => {
      setPasswordModalUser(null);
      setNewPassword('');
      setModalSuccess(null);
    }, 1200);
  };

  // Filter users based on query and statusFilter
  const filteredUsers = users.filter((u) => {
    if (statusFilter === 'active' && !u.isActive) return false;
    if (statusFilter === 'deactive' && u.isActive) return false;
    if (statusFilter === 'employee' && u.role !== 'employee') return false;
    if (statusFilter === 'admin' && u.role !== 'admin') return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.employeeId.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Top Banner Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 rounded-xl shadow-xs">
              <Users className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {language === 'hi'
                  ? 'कर्मचारी आईडी, नाम, पासवर्ड व एक्टिव/डीएक्टिव प्रबंधन'
                  : 'Employee Credentials & Active / Deactive Controls'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {language === 'hi'
                  ? 'एडमिन स्वयं किसी भी कर्मचारी की आईडी (ID), नाम (Name) व पासवर्ड बदल सकते हैं एवं खाते को Active या Deactive कर सकते हैं'
                  : 'Admins can directly edit Employee ID, Employee Name, Password, and Toggle Active / Deactive status'}
              </p>
            </div>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Active: {activeCount}</span>
          </div>

          {deactiveCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Deactive: {deactiveCount}</span>
            </div>
          )}

          <div className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            Total: {totalCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              language === 'hi'
                ? 'कर्मचारी आईडी, नाम या यूज़रनेम खोजें...'
                : 'Search by Employee ID, Name or Username...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {language === 'hi' ? 'सभी' : 'All'} ({totalCount})
          </button>

          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'सक्रिय (Active)' : 'Active'} ({activeCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('deactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
              statusFilter === 'deactive'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'निष्क्रिय (Deactive)' : 'Deactive'} ({deactiveCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('employee')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === 'employee'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {language === 'hi' ? 'कर्मचारी (1-10)' : 'Employees (1-10)'}
          </button>

          <button
            onClick={() => setStatusFilter('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === 'admin'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {language === 'hi' ? 'एडमिन (2)' : 'Admins (2)'}
          </button>
        </div>
      </div>

      {/* Grid of Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((u) => {
          const isMainAdmin = u.role === 'admin';
          const isInlineEditing = inlineEditingUserId === u.id;

          return (
            <div
              key={u.id}
              className={`bg-white rounded-xl border p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                !u.isActive
                  ? 'border-rose-300 bg-rose-50/30'
                  : isMainAdmin
                  ? 'border-purple-300 ring-1 ring-purple-300 bg-purple-50/20'
                  : 'border-slate-200 hover:border-amber-300 hover:shadow-md'
              }`}
            >
              <div>
                {/* Header Row: Employee ID Badge + ACTIVE/DEACTIVE Toggle Switch */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                        EMPLOYEE ID: {u.employeeId}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mt-1.5 flex items-center gap-1.5">
                      <span>{u.username}</span>
                      {isMainAdmin && (
                        <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded font-bold">
                          Admin Master
                        </span>
                      )}
                    </h3>
                  </div>

                  {/* HIGH VISIBILITY ACTIVE / DEACTIVE TOGGLE SWITCH */}
                  {!isMainAdmin ? (
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[11px] font-bold ${
                            u.isActive ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {u.isActive
                            ? language === 'hi'
                              ? 'सक्रिय (Active)'
                              : 'Active'
                            : language === 'hi'
                            ? 'निष्क्रिय (Deactive)'
                            : 'Deactive'}
                        </span>

                        {/* Interactive iOS-style Toggle Button */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={u.isActive}
                          onClick={() => toggleUserStatus(u.id)}
                          title={
                            u.isActive
                              ? language === 'hi'
                                ? 'खाता निष्क्रिय (Deactivate) करने के लिए क्लिक करें'
                                : 'Click to Deactivate'
                              : language === 'hi'
                              ? 'खाता सक्रिय (Activate) करने के लिए क्लिक करें'
                              : 'Click to Activate'
                          }
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            u.isActive ? 'bg-emerald-500' : 'bg-rose-400'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              u.isActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <span className="text-[9px] text-slate-400">
                        {u.isActive
                          ? language === 'hi'
                            ? 'लॉगिन चालू है'
                            : 'Login Allowed'
                          : language === 'hi'
                          ? 'लॉगिन बंद है'
                          : 'Login Blocked'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Active Admin
                    </span>
                  )}
                </div>

                {/* Card Body: Direct View or Inline Edit Mode */}
                {isInlineEditing ? (
                  /* INLINE EDIT MODE (Quickly edit ID, Name, Password directly on the card!) */
                  <div className="mt-3.5 p-3 bg-amber-50/60 rounded-xl border border-amber-300 space-y-2.5 animate-in fade-in-50 duration-150">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900 border-b border-amber-200/80 pb-1">
                      <span>{language === 'hi' ? 'आईडी व नाम त्वरित संपादन' : 'Quick Edit ID & Name'}</span>
                      <button
                        type="button"
                        onClick={() => setInlineEditingUserId(null)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Inline Employee ID */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                        {language === 'hi' ? 'कर्मचारी आईडी (Employee ID) *' : 'Employee ID *'}
                      </label>
                      <input
                        type="text"
                        value={inlineEmployeeId}
                        onChange={(e) => setInlineEmployeeId(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-amber-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Inline Employee Name */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                        {language === 'hi' ? 'कर्मचारी का नाम (Name)' : 'Employee Full Name'}
                      </label>
                      <input
                        type="text"
                        value={inlineName}
                        onChange={(e) => setInlineName(e.target.value)}
                        placeholder={language === 'hi' ? 'उदा: Rajesh Sharma' : 'e.g. Rajesh Sharma'}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Inline Password */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                        {language === 'hi' ? 'नया पासवर्ड (Password)' : 'Password'}
                      </label>
                      <div className="relative">
                        <input
                          type={inlineShowPassword ? 'text' : 'password'}
                          value={inlinePassword}
                          onChange={(e) => setInlinePassword(e.target.value)}
                          className="w-full pl-2.5 pr-8 py-1.5 text-xs font-mono bg-white border border-amber-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => setInlineShowPassword(!inlineShowPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        >
                          {inlineShowPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Inline Actions */}
                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setInlineEditingUserId(null)}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50"
                      >
                        {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                      </button>
                      <button
                        type="button"
                        disabled={inlineLoading}
                        onClick={() => saveInlineEdit(u.id)}
                        className="px-3 py-1 rounded-md text-[11px] font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 flex items-center gap-1 shadow-xs"
                      >
                        <Save className="w-3 h-3" />
                        <span>{inlineLoading ? '...' : language === 'hi' ? 'सुरक्षित करें' : 'Save'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* NORMAL CARD DETAILS VIEW */
                  <div className="mt-3.5 space-y-2 text-xs text-slate-600">
                    {/* Employee Name Box */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">
                          {language === 'hi' ? 'कर्मचारी का नाम (Employee Name):' : 'Employee Name:'}
                        </span>
                        <span className="font-bold text-slate-900 text-xs mt-0.5 block truncate">
                          {u.name ? (
                            u.name
                          ) : (
                            <em className="text-slate-400 font-normal">
                              {language === 'hi' ? 'रिक्त (नाम दर्ज नहीं)' : 'Blank (Not entered yet)'}
                            </em>
                          )}
                        </span>
                      </div>

                      <button
                        onClick={() => startInlineEdit(u)}
                        title={language === 'hi' ? 'नाम व आईडी त्वरित संपादित करें' : 'Quick edit name & ID'}
                        className="px-2 py-1 text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-md border border-amber-300 shrink-0 transition-colors"
                      >
                        {language === 'hi' ? 'नाम बदलें' : 'Edit Name'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] px-1">
                      <span className="text-slate-400">{language === 'hi' ? 'विभाग:' : 'Department:'}</span>
                      <span className="font-medium text-slate-800">{u.department || 'Solar Operations'}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] px-1">
                      <span className="text-slate-400">{language === 'hi' ? 'पासवर्ड:' : 'Password:'}</span>
                      <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                        {u.password ? u.password : `Pass@${u.username}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* CARD ACTIONS FOOTER: High Visibility, Fully Labeled Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5 text-xs">
                {/* 1. Main Full Edit Modal Button */}
                <button
                  onClick={() => openEditModal(u)}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>
                    {language === 'hi' ? 'आईडी व नाम संपादित करें' : 'Edit ID & Name'}
                  </span>
                </button>

                {/* 2. Quick Password Reset Button */}
                <button
                  onClick={() => {
                    setPasswordModalUser(u);
                    setNewPassword(u.password || `Pass@${u.username}`);
                    setModalSuccess(null);
                  }}
                  title={language === 'hi' ? 'पासवर्ड बदलें' : 'Change Password'}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-amber-600" />
                  <span>{language === 'hi' ? 'पासवर्ड' : 'Password'}</span>
                </button>

                {/* 3. PROMINENT ACTIVE / DEACTIVE BUTTON WITH TEXT */}
                {!isMainAdmin && (
                  <button
                    onClick={() => toggleUserStatus(u.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                      u.isActive
                        ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    {u.isActive ? (
                      <>
                        <Power className="w-3.5 h-3.5 text-rose-600" />
                        <span>{language === 'hi' ? 'Deactive करें' : 'Deactivate'}</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{language === 'hi' ? 'Active करें' : 'Activate'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FULL EDIT MODAL (Admin edits Employee ID, Name, Password, and Active/Deactive) */}
      {editModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setEditModalUser(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg z-10 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-600/50">
                    ID: {editModalUser.employeeId}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">({editModalUser.username})</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  {language === 'hi'
                    ? 'कर्मचारी आईडी, नाम व स्टेटस संपादित करें'
                    : 'Edit Employee ID, Name & Status'}
                </h3>
              </div>
              <button
                onClick={() => setEditModalUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveUser} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
              {editSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{editSuccessMessage}</span>
                </div>
              )}

              {/* 1. Employee ID */}
              <div>
                <label className="block font-bold text-slate-900 mb-1 flex items-center justify-between">
                  <span>{language === 'hi' ? 'कर्मचारी आईडी (Employee ID) *' : 'Employee ID *'}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {language === 'hi' ? 'उदा: 1, 2, 3, EMP01' : 'e.g. 1, 2, 3, EMP01'}
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={editEmployeeId}
                  onChange={(e) => setEditEmployeeId(e.target.value)}
                  placeholder="1"
                  className="w-full px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-lg bg-amber-50/40 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  {language === 'hi'
                    ? 'आईडी बदलने पर संबंधित सभी खर्चे एवं अग्रिम रिकॉर्ड भी नई आईडी से जुड़ जाएंगे।'
                    : 'Updating the Employee ID automatically preserves and links all historical expenses and advances.'}
                </p>
              </div>

              {/* 2. Employee Name */}
              <div>
                <label className="block font-bold text-slate-900 mb-1 flex items-center justify-between">
                  <span>{language === 'hi' ? 'कर्मचारी का पूरा नाम (Employee Full Name)' : 'Employee Full Name'}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {language === 'hi' ? 'खाली छोड़ सकते हैं / Can leave blank' : 'Can leave blank'}
                  </span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={language === 'hi' ? 'उदा: Rajesh Sharma' : 'e.g. Rajesh Sharma'}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                />
              </div>

              {/* 3. ACTIVE / DEACTIVE STATUS (Big Clear Radio Selectors) */}
              <div>
                <label className="block font-bold text-slate-900 mb-1.5">
                  {language === 'hi' ? 'खाता स्थिति (Active / Deactive Status) *' : 'Account Status (Active / Deactive) *'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Option 1: Active */}
                  <button
                    type="button"
                    onClick={() => setEditIsActive(true)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      editIsActive
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/40 text-emerald-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{language === 'hi' ? '🟢 सक्रिय (Active)' : '🟢 Active'}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-normal leading-tight">
                      {language === 'hi' ? 'कर्मचारी लॉगिन कर सकता है' : 'Employee can log in'}
                    </p>
                  </button>

                  {/* Option 2: Deactive */}
                  <button
                    type="button"
                    onClick={() => setEditIsActive(false)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      !editIsActive
                        ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-400/40 text-rose-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{language === 'hi' ? '🔴 निष्क्रिय (Deactive)' : '🔴 Deactive'}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-normal leading-tight">
                      {language === 'hi' ? 'कर्मचारी का लॉगिन बंद रहेगा' : 'Employee login blocked'}
                    </p>
                  </button>
                </div>
              </div>

              {/* 4. Password */}
              <div>
                <label className="block font-bold text-slate-900 mb-1 flex items-center justify-between">
                  <span>{language === 'hi' ? 'लॉगिन पासवर्ड (Password) *' : 'Login Password *'}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {language === 'hi' ? 'सीधे नया पासवर्ड सेट करें' : 'Directly set new password'}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Pass@123"
                    className="w-full pl-3 pr-10 py-2 text-sm font-mono border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 5. Username & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'hi' ? 'लॉगिन यूज़रनेम' : 'Username'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'hi' ? 'विभाग (Department)' : 'Department'}
                  </label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    placeholder="Solar Operations"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditModalUser(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {editLoading
                      ? language === 'hi'
                        ? 'सुरक्षित हो रहा है...'
                        : 'Saving...'
                      : language === 'hi'
                      ? 'परिवर्तन सुरक्षित करें (Save Changes)'
                      : 'Save Changes'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK RESET PASSWORD MODAL */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setPasswordModalUser(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md z-10 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-400 font-mono">Employee ID: {passwordModalUser.employeeId}</span>
                <h3 className="text-base font-bold text-white">
                  {language === 'hi' ? 'पासवर्ड रीसेट करें' : 'Reset Account Password'}
                </h3>
              </div>
              <button onClick={() => setPasswordModalUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4 text-xs text-slate-700">
              {modalSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{modalSuccess}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1">
                  {language === 'hi' ? 'लक्षित खाता (Target Account):' : 'Target Account:'}
                </label>
                <div className="p-2.5 bg-slate-100 rounded text-slate-800 font-mono font-bold">
                  {passwordModalUser.username} (Employee ID: {passwordModalUser.employeeId})
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  {language === 'hi' ? 'नया सुरक्षित पासवर्ड *' : 'New Secure Password *'}
                </label>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg bg-white font-mono text-sm text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  {language === 'hi' ? 'पासवर्ड अपडेट करें' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
