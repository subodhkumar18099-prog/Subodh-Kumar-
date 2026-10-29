/**
 * Sunvault Expenses Manager - Official Print & PDF Report Modal
 * Formats official document with Sunvault Powertech Pvt. Ltd. letterhead,
 * GSTIN, auditor signature blocks, and clean A4 page layout ready for window.print()
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { SunvaultLogo } from '../common/SunvaultLogo';
import { Printer, X, Download } from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
  headers: string[];
  rows: (string | number)[][];
  summaryMetrics?: Record<string, string | number>;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  reportTitle,
  headers,
  rows,
  summaryMetrics,
}) => {
  const { currentUser } = useApp();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs no-print" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[95vh] flex flex-col z-10 overflow-hidden my-auto">
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 no-print">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Official Document Print & PDF Preview</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click "Print Document" to save as PDF or output to your office printer
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Letterhead Paper Document */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800 bg-white font-sans printable-sheet">
          {/* Header Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <SunvaultLogo variant="full" size="lg" theme="light" />
              <div className="border-l border-slate-200 pl-4">
                <p className="text-xs text-slate-600 font-semibold tracking-wide uppercase">
                  Solar EPC Solutions · Rooftop & Utility-Scale Ground Mount Systems
                </p>
                <div className="text-[11px] text-slate-500 mt-1 font-mono">
                  GSTIN: 27AAMCS8921R1ZK · CIN: U40106PN2021PTC199820
                </div>
                <div className="text-[11px] text-slate-500">
                  Regd. Office: Plot No. 42, MIDC Industrial Area, Pune, Maharashtra 411018 · Tel: +91 20 6790 1200
                </div>
              </div>
            </div>

            <div className="text-right text-xs shrink-0 font-mono">
              <div className="font-bold text-slate-900 text-sm">EXPENSE AUDIT DOSSIER</div>
              <div className="text-slate-500 mt-1">Date: {new Date().toLocaleDateString('en-IN')}</div>
              <div className="text-slate-500">Time: {new Date().toLocaleTimeString('en-IN')}</div>
              <div className="text-slate-500">User: {currentUser?.name || currentUser?.username || 'Authorized Officer'}</div>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="bg-slate-100 p-3.5 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Official Financial Statement
              </span>
              <h2 className="text-base font-bold text-slate-950">{reportTitle}</h2>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-600">
              Total Rows: {rows.length}
            </span>
          </div>

          {/* Summary KPI Strip if present */}
          {summaryMetrics && Object.keys(summaryMetrics).length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 p-3 bg-amber-50/40 rounded-lg border border-amber-200/80">
              {Object.entries(summaryMetrics).map(([key, val]) => (
                <div key={key} className="text-center">
                  <span className="text-[10px] text-slate-500 block truncate">{key}</span>
                  <span className="font-mono text-xs font-bold text-slate-900 tabular-nums block mt-0.5">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Data Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-[11px] text-slate-800">
              <thead className="bg-slate-100 font-bold uppercase tracking-wider text-slate-700 border-b border-slate-300">
                <tr>
                  {headers.map((h, idx) => (
                    <th key={idx} className="px-3 py-2 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.length > 0 ? (
                  rows.map((row, rIdx) => (
                    <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className={`px-3 py-2 ${
                            typeof cell === 'number' || (typeof cell === 'string' && cell.startsWith('₹'))
                              ? 'font-mono tabular-nums text-slate-900 font-medium'
                              : ''
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={headers.length} className="text-center py-6 text-slate-400">
                      No records found for this reporting schedule.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Certification & Sign-off Block */}
          <div className="pt-10 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs text-slate-700">
            <div>
              <div className="h-12 border-b border-dashed border-slate-400 mb-1" />
              <div className="font-bold text-slate-900">Site Supervisor / Submitter</div>
              <div className="text-[10px] text-slate-400">Field Operational Verification</div>
            </div>

            <div>
              <div className="h-12 border-b border-dashed border-slate-400 mb-1" />
              <div className="font-bold text-slate-900">Project Manager</div>
              <div className="text-[10px] text-slate-400">Engineering & Cost Authorization</div>
            </div>

            <div>
              <div className="h-12 border-b border-dashed border-slate-400 mb-1" />
              <div className="font-bold text-slate-900">Accountant / Finance Head</div>
              <div className="text-[10px] text-slate-400">GST Audit & Settlement Certification</div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-[10px] text-slate-400 text-center pt-4">
            Confidential · Internal Corporate Records of Sunvault Powertech Pvt. Ltd. · Generated by Sunvault Expenses Manager
          </div>
        </div>
      </div>
    </div>
  );
};
