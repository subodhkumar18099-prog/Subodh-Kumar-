/**
 * Sunvault Expenses Manager - Reports Hub View
 * Section 12 Compliance:
 * - Admin can download company-wide reports
 * - Employees can download ONLY their own reports
 * Bilingual English & Hindi translations
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { REPORT_DEFINITIONS, exportToExcelCsv, ReportDefinition } from '../../utils/exportUtils';
import {
  FileText,
  Download,
  Printer,
  Search,
  Eye,
  ChevronDown,
  ChevronUp,
  Shield,
  User,
} from 'lucide-react';

interface ReportsHubViewProps {
  onOpenPrintModal: (title: string, headers: string[], rows: (string | number)[][], siteSummary?: Record<string, string | number>) => void;
}

export const ReportsHubView: React.FC<ReportsHubViewProps> = ({ onOpenPrintModal }) => {
  const { expenses, advances, payments, currentUser, language, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  if (!currentUser) return null;
  const isAdmin = currentUser.role === 'admin';

  // All 18 reports list
  const reportList = useMemo(() => Object.values(REPORT_DEFINITIONS), []);

  const filteredReports = useMemo(() => {
    return reportList.filter((rep) => {
      if (
        searchQuery.trim() &&
        !rep.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !rep.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [reportList, searchQuery]);

  const handleDownloadExcel = (rep: ReportDefinition) => {
    // Note: expenses and advances in context are already role-scoped!
    const { rows } = rep.getData(expenses, advances, payments);
    const scopePrefix = isAdmin ? 'Company_Wide' : `My_Report_Emp${currentUser.employeeId}`;
    exportToExcelCsv(
      `Sunvault_${scopePrefix}_${rep.id}`,
      `${rep.title} (${isAdmin ? 'All Employees' : `Employee ID: ${currentUser.employeeId}`})`,
      rep.headers,
      rows
    );
  };

  const handlePrint = (rep: ReportDefinition) => {
    const { rows } = rep.getData(expenses, advances, payments);
    const titleWithScope = `${rep.title} (${isAdmin ? 'Company-Wide' : `Employee ID: ${currentUser.employeeId}`})`;
    onOpenPrintModal(titleWithScope, rep.headers, rows);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {isAdmin
              ? (language === 'hi' ? 'कंपनी-व्यापी वित्तीय रिपोर्ट केंद्र (एडमिन)' : 'Company-Wide Financial Reports Hub (Admin)')
              : (language === 'hi' ? `मेरे व्यक्तिगत वित्तीय रिपोर्ट्स (कर्मचारी आईडी: ${currentUser.employeeId})` : `My Financial Reports Hub (Employee ID: ${currentUser.employeeId})`)}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isAdmin
              ? (language === 'hi' ? 'सभी सोलर साइट्स, कर्मचारियों और अग्रिम भुगतानों की संपूर्ण रिपोर्ट्स' : 'Comprehensive company statements ready for instant Excel download and official PDF print')
              : (language === 'hi' ? 'कड़ी गोपनीयता: केवल आपके अपने खर्च और अग्रिम दावों की रिपोर्ट डाउनलोड होंगी।' : 'Strict Privacy: Download statements containing only your own verified expense records.')}
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 self-start md:self-auto">
          {filteredReports.length} Reports Ready
        </span>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'hi' ? 'रिपोर्ट के नाम से खोजें...' : 'Search report by title or description...'}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((rep, idx) => {
          const isExpanded = expandedReportId === rep.id;
          const { rows } = rep.getData(expenses, advances, payments);

          return (
            <div
              key={rep.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    REPORT {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{rep.categoryGroup}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">{rep.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">{rep.description}</p>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Columns: {rep.headers.length}</span>
                  <span className="font-bold text-slate-800">{rows.length} Scoped Rows</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setExpandedReportId(isExpanded ? null : rep.id)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isExpanded ? 'Hide' : 'Preview'}</span>
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDownloadExcel(rep)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Excel</span>
                  </button>
                  <button
                    onClick={() => handlePrint(rep)}
                    className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>

              {/* Collapsible Preview */}
              {isExpanded && (
                <div className="p-3 bg-slate-900 text-white border-t border-slate-800 max-h-52 overflow-y-auto text-[11px]">
                  <div className="font-mono text-[10px] text-amber-400 pb-2 uppercase tracking-wider">
                    Report Preview ({rows.length} rows)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono">
                      <thead className="text-[10px] text-slate-400 border-b border-slate-800">
                        <tr>
                          {rep.headers.slice(0, 4).map((h, hIdx) => (
                            <th key={hIdx} className="px-2 py-1">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {rows.slice(0, 4).map((r, rIdx) => (
                          <tr key={rIdx}>
                            {r.slice(0, 4).map((c, cIdx) => (
                              <td key={cIdx} className="px-2 py-1 truncate max-w-[120px]">
                                {c}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
