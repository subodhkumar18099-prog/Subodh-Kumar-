/**
 * Sunvault Expenses Manager - Export & Reporting Utilities
 * Generates Excel (CSV with BOM) and Print/PDF documents for all 18 reports
 */

import { Expense, EmployeeAdvance, PaymentTransaction } from '../types';

export interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  categoryGroup: 'General' | 'Site' | 'Category' | 'Advances' | 'Approvals' | 'Finance';
  headers: string[];
  getData: (
    expenses: Expense[],
    advances: EmployeeAdvance[],
    payments: PaymentTransaction[],
    params?: Record<string, string>
  ) => { rows: (string | number)[][]; totals?: Record<string, number | string> };
}

// RFC 4180 CSV cell escaper
export const escapeCsvCell = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
};

// Export to Excel-compatible CSV with UTF-8 BOM
export const exportToExcelCsv = (
  filename: string,
  title: string,
  headers: string[],
  rows: (string | number)[][],
  footerRow?: (string | number)[]
) => {
  const metaLines = [
    `"Sunvault Powertech Pvt. Ltd. - Solar EPC Expenses Manager"`,
    `"Report: ${title}"`,
    `"Generated On: ${new Date().toLocaleString()} | Currency: INR (Rs.)"`,
    `""`,
  ];

  const headerLine = headers.map(escapeCsvCell).join(',');
  const rowLines = rows.map((r) => r.map(escapeCsvCell).join(','));
  const allLines = [...metaLines, headerLine, ...rowLines];

  if (footerRow && footerRow.length > 0) {
    allLines.push(footerRow.map(escapeCsvCell).join(','));
  }

  // Prepend \uFEFF BOM so Microsoft Excel opens UTF-8 text flawlessly
  const csvContent = '\uFEFF' + allLines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// All 18 Reports catalog and execution engine
export const REPORT_DEFINITIONS: Record<string, ReportDefinition> = {
  daily: {
    id: 'daily',
    title: 'Daily Expense Report',
    description: 'Detailed itemized expense entries with category-wise breakdown columns',
    categoryGroup: 'General',
    headers: [
      'Sr. No.',
      'Expense ID',
      'Date',
      'Employee Name',
      'Site Name',
      'Category',
      'Description',
      'Travelling (Rs.)',
      'Food (Rs.)',
      'Material (Rs.)',
      'Other Expenses (Rs.)',
      'Total Amount (Rs.)',
      'Payment Mode',
      'Bill Available',
      'Approval Status',
      'Remarks',
    ],
    getData: (expenses) => {
      const rows = expenses.map((e, idx) => {
        const cat = e.category;
        const isTravel = ['Travelling', 'Bus', 'Train', 'Auto Rickshaw', 'Taxi', 'Fuel / Petrol / Diesel', 'Parking', 'Toll Tax'].includes(cat);
        const isFood = ['Food / Lunch / Dinner', 'Tea / Water / Refreshments'].includes(cat);
        const isMaterial = ['Material Purchase', 'Tools and Equipment', 'Safety Equipment'].includes(cat);
        const isOther = !isTravel && !isFood && !isMaterial;

        return [
          idx + 1,
          e.id,
          e.expenseDate,
          e.employeeName,
          e.siteName || 'General (No Site)',
          e.category,
          e.description,
          isTravel ? e.totalAmount : 0,
          isFood ? e.totalAmount : 0,
          isMaterial ? e.totalAmount : 0,
          isOther ? e.totalAmount : 0,
          e.totalAmount,
          e.paymentMode,
          e.attachments.length > 0 ? 'Yes' : 'No',
          e.approvalStatus,
          e.remarks || '-',
        ];
      });
      return { rows };
    },
  },

  weekly: {
    id: 'weekly',
    title: 'Weekly Expense Report',
    description: 'Expenses incurred over the past 7 days across all projects',
    categoryGroup: 'General',
    headers: ['Sr. No.', 'Expense ID', 'Date', 'Employee', 'Site Name', 'Category', 'Description', 'Amount (Rs.)', 'Status'],
    getData: (expenses) => {
      const now = new Date();
      const past7 = new Date();
      past7.setDate(now.getDate() - 7);
      const past7Str = past7.toISOString().split('T')[0];
      const filtered = expenses.filter((e) => e.expenseDate >= past7Str);
      return {
        rows: filtered.map((e, idx) => [
          idx + 1,
          e.id,
          e.expenseDate,
          e.employeeName,
          e.siteName || 'General',
          e.category,
          e.description,
          e.totalAmount,
          e.approvalStatus,
        ]),
      };
    },
  },

  monthly: {
    id: 'monthly',
    title: 'Monthly Expense Report',
    description: 'Current calendar month consolidated expense statement',
    categoryGroup: 'General',
    headers: ['Sr. No.', 'Expense ID', 'Date', 'Employee', 'Site Name', 'Category', 'Amount (Rs.)', 'Paid Status', 'Approval'],
    getData: (expenses) => {
      const now = new Date();
      const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const filtered = expenses.filter((e) => e.expenseDate.startsWith(monthPrefix));
      return {
        rows: filtered.map((e, idx) => [
          idx + 1,
          e.id,
          e.expenseDate,
          e.employeeName,
          e.siteName || 'General',
          e.category,
          e.totalAmount,
          e.paymentStatus,
          e.approvalStatus,
        ]),
      };
    },
  },

  sitewise: {
    id: 'sitewise',
    title: 'Site-wise Expense Report',
    description: 'Complete project cost audit broken down by solar installation site',
    categoryGroup: 'Site',
    headers: ['Sr. No.', 'Expense ID', 'Date', 'Site Name', 'Employee', 'Category', 'Description', 'Amount (Rs.)', 'Approval', 'Payment Status'],
    getData: (expenses, _a, _p, params) => {
      const targetSite = params?.siteName;
      const filtered = targetSite
        ? expenses.filter((e) => (e.siteName || '').toLowerCase() === targetSite.toLowerCase())
        : expenses.filter((e) => e.siteName && e.siteName.trim().length > 0);
      return {
        rows: filtered.map((e, idx) => [
          idx + 1,
          e.id,
          e.expenseDate,
          e.siteName,
          e.employeeName,
          e.category,
          e.description,
          e.totalAmount,
          e.approvalStatus,
          e.paymentStatus,
        ]),
      };
    },
  },

  employeewise: {
    id: 'employeewise',
    title: 'Employee-wise Expense Report',
    description: 'Individual employee expenditure claims and submission records',
    categoryGroup: 'General',
    headers: ['Sr. No.', 'Expense ID', 'Date', 'Employee Name', 'Emp ID', 'Site Name', 'Category', 'Amount (Rs.)', 'Status'],
    getData: (expenses, _a, _p, params) => {
      const empName = params?.employeeName;
      const filtered = empName
        ? expenses.filter((e) => e.employeeName.toLowerCase().includes(empName.toLowerCase()))
        : expenses;
      return {
        rows: filtered.map((e, idx) => [
          idx + 1,
          e.id,
          e.expenseDate,
          e.employeeName,
          e.employeeId,
          e.siteName || 'General',
          e.category,
          e.totalAmount,
          e.approvalStatus,
        ]),
      };
    },
  },

  categorywise: {
    id: 'categorywise',
    title: 'Category-wise Expense Report',
    description: 'Consolidated spending by nature of expense (Labour, Material, Travel, Food, etc.)',
    categoryGroup: 'Category',
    headers: ['Sr. No.', 'Expense ID', 'Date', 'Category', 'Site Name', 'Employee', 'Description', 'Amount (Rs.)', 'Status'],
    getData: (expenses, _a, _p, params) => {
      const cat = params?.category;
      const filtered = cat ? expenses.filter((e) => e.category === cat) : expenses;
      return {
        rows: filtered.map((e, idx) => [
          idx + 1,
          e.id,
          e.expenseDate,
          e.category,
          e.siteName || 'General',
          e.employeeName,
          e.description,
          e.totalAmount,
          e.approvalStatus,
        ]),
      };
    },
  },

  travelling: {
    id: 'travelling',
    title: 'Travelling Expense Report',
    description: 'Transit, vehicle fuel, toll tax, fares, and conveyance logs',
    categoryGroup: 'Category',
    headers: [
      'Sr. No.',
      'Expense ID',
      'Date',
      'Employee',
      'Site Name',
      'From',
      'To',
      'Mode',
      'Outward',
      'Return',
      'Local',
      'Toll/Parking',
      'Total (Rs.)',
      'Status',
    ],
    getData: (expenses) => {
      const travelCats = ['Travelling', 'Bus', 'Train', 'Auto Rickshaw', 'Taxi', 'Fuel / Petrol / Diesel', 'Parking', 'Toll Tax'];
      const filtered = expenses.filter((e) => travelCats.includes(e.category) || e.travelDetails);
      return {
        rows: filtered.map((e, idx) => [
          idx + 1,
          e.id,
          e.expenseDate,
          e.employeeName,
          e.siteName || 'Transit',
          e.travelDetails?.startingLocation || '-',
          e.travelDetails?.destination || '-',
          e.travelDetails?.travelMode || e.category,
          e.travelDetails?.outwardFare || 0,
          e.travelDetails?.returnFare || 0,
          e.travelDetails?.localConveyance || 0,
          (e.travelDetails?.parking || 0) + (e.travelDetails?.tollTax || 0),
          e.totalAmount,
          e.approvalStatus,
        ]),
      };
    },
  },

  material: {
    id: 'material',
    title: 'Material Purchase Report',
    description: 'On-site solar hardware, consumables, tools, cable ties, earthing & PPE purchases',
    categoryGroup: 'Category',
    headers: ['Sr. No.', 'Expense ID', 'Date', 'Employee', 'Site Name', 'Category', 'Description', 'Qty', 'Rate', 'Total (Rs.)', 'Status'],
    getData: (expenses) => {
      const matCats = ['Material Purchase', 'Tools and Equipment', 'Safety Equipment'];
      const filtered = expenses.filter((e) => matCats.includes(e.category));
      return {
        rows: filtered.map((e, idx) => [
          idx + 1,
          e.id,
          e.expenseDate,
          e.employeeName,
          e.siteName || 'General',
          e.category,
          e.description,
          e.quantity,
          e.rate,
          e.totalAmount,
          e.approvalStatus,
        ]),
      };
    },
  },

  advancePayment: {
    id: 'advancePayment',
    title: 'Advance Payment Report',
    description: 'Disbursements of cash/bank advances to field personnel',
    categoryGroup: 'Advances',
    headers: ['Sr. No.', 'Advance ID', 'Date', 'Employee Name', 'Emp ID', 'Site Name', 'Purpose', 'Amount (Rs.)', 'Payment Mode', 'Reference', 'Status'],
    getData: (_e, advances) => {
      return {
        rows: advances.map((a, idx) => [
          idx + 1,
          a.id,
          a.advanceDate,
          a.employeeName,
          a.employeeId,
          a.siteName || 'Field Operations',
          a.advancePurpose,
          a.advanceAmount,
          a.paymentMode,
          a.paymentReference,
          a.status,
        ]),
      };
    },
  },

  advanceSettlement: {
    id: 'advanceSettlement',
    title: 'Advance Settlement Report',
    description: 'Adjusted bills, remaining advance balances and refundable calculations',
    categoryGroup: 'Advances',
    headers: [
      'Sr. No.',
      'Advance ID',
      'Employee Name',
      'Advance (Rs.)',
      'Adjusted (Rs.)',
      'Remaining Balance (Rs.)',
      'Refund (Rs.)',
      'Status',
      'Settled Date',
    ],
    getData: (_e, advances) => {
      return {
        rows: advances.map((a, idx) => {
          const remaining = a.advanceAmount - a.amountAdjusted - (a.refundAmount || 0);
          return [
            idx + 1,
            a.id,
            a.employeeName,
            a.advanceAmount,
            a.amountAdjusted,
            Math.max(0, remaining),
            a.refundAmount || 0,
            a.status,
            a.settlementDate || 'Pending',
          ];
        }),
      };
    },
  },

  pendingApproval: {
    id: 'pendingApproval',
    title: 'Pending Approval Report',
    description: 'Expenses awaiting review and sign-off by Project Manager / Admin',
    categoryGroup: 'Approvals',
    headers: ['Sr. No.', 'Expense ID', 'Date', 'Employee Name', 'Site Name', 'Category', 'Description', 'Amount (Rs.)', 'Bill Attached', 'Status'],
    getData: (expenses) => {
      const filtered = expenses.filter((e) => e.approvalStatus === 'Pending Approval');
      return {
        rows: filtered.map((e, idx) => [
          idx + 1,
          e.id,
          e.expenseDate,
          e.employeeName,
          e.siteName || 'General',
          e.category,
          e.description,
          e.totalAmount,
          e.attachments.length > 0 ? 'Yes' : 'No',
          e.approvalStatus,
        ]),
      };
    },
  },

  approvedExpenses: {
    id: 'approvedExpenses',
    title: 'Approved Expense Report',
    description: 'All authorized expenses certified by Project Managers and Admins',
    categoryGroup: 'Approvals',
    headers: ['Sr. No.', 'Expense ID', 'Date', 'Employee', 'Site Name', 'Category', 'Amount (Rs.)', 'Approved By', 'Payment Status'],
    getData: (expenses) => {
      const filtered = expenses.filter((e) => e.approvalStatus === 'Approved' || e.approvalStatus === 'Paid');
      return {
        rows: filtered.map((e, idx) => [
          idx + 1,
          e.id,
          e.expenseDate,
          e.employeeName,
          e.siteName || 'General',
          e.category,
          e.totalAmount,
          e.approvedBy || 'Admin',
          e.paymentStatus,
        ]),
      };
    },
  },

  rejectedExpenses: {
    id: 'rejectedExpenses',
    title: 'Rejected Expense Report',
    description: 'Declined claims with recorded auditor rejection reasons',
    categoryGroup: 'Approvals',
    headers: ['Sr. No.', 'Expense ID', 'Date', 'Employee', 'Site Name', 'Category', 'Amount (Rs.)', 'Rejection Reason', 'Status'],
    getData: (expenses) => {
      const filtered = expenses.filter((e) => e.approvalStatus === 'Rejected');
      return {
        rows: filtered.map((e, idx) => [
          idx + 1,
          e.id,
          e.expenseDate,
          e.employeeName,
          e.siteName || 'General',
          e.category,
          e.totalAmount,
          e.rejectionReason || 'No reason recorded',
          e.approvalStatus,
        ]),
      };
    },
  },

  paidExpenses: {
    id: 'paidExpenses',
    title: 'Paid Expense Report',
    description: 'Expenses where reimbursements or vendor payments have been completed',
    categoryGroup: 'Finance',
    headers: ['Sr. No.', 'Expense ID', 'Date', 'Employee', 'Site Name', 'Category', 'Total (Rs.)', 'Paid Amount (Rs.)', 'Payment Status'],
    getData: (expenses) => {
      const filtered = expenses.filter((e) => e.paymentStatus === 'Fully Paid' || e.paidAmount > 0);
      return {
        rows: filtered.map((e, idx) => [
          idx + 1,
          e.id,
          e.expenseDate,
          e.employeeName,
          e.siteName || 'General',
          e.category,
          e.totalAmount,
          e.paidAmount,
          e.paymentStatus,
        ]),
      };
    },
  },

  pendingReimbursement: {
    id: 'pendingReimbursement',
    title: 'Pending Reimbursement Report',
    description: 'Approved claims paid out of employee pocket awaiting company disbursement',
    categoryGroup: 'Finance',
    headers: ['Sr. No.', 'Expense ID', 'Date', 'Employee', 'Site Name', 'Category', 'Total (Rs.)', 'Paid (Rs.)', 'Adjusted (Rs.)', 'Pending (Rs.)'],
    getData: (expenses) => {
      const filtered = expenses.filter((e) => {
        if (e.paidBy !== 'Employee') return false;
        if (e.approvalStatus !== 'Approved' && e.approvalStatus !== 'Paid') return false;
        const remaining = e.totalAmount - e.paidAmount - e.advanceAdjustedAmount;
        return remaining > 0;
      });
      return {
        rows: filtered.map((e, idx) => {
          const pending = e.totalAmount - e.paidAmount - e.advanceAdjustedAmount;
          return [
            idx + 1,
            e.id,
            e.expenseDate,
            e.employeeName,
            e.siteName || 'General',
            e.category,
            e.totalAmount,
            e.paidAmount,
            e.advanceAdjustedAmount,
            pending,
          ];
        }),
      };
    },
  },

  cashExpenses: {
    id: 'cashExpenses',
    title: 'Cash Expense Report',
    description: 'All field petty cash payments, muster wages, and local receipts',
    categoryGroup: 'Finance',
    headers: ['Sr. No.', 'Expense ID', 'Date', 'Employee', 'Site Name', 'Category', 'Description', 'Amount (Rs.)', 'Bill Attached', 'Status'],
    getData: (expenses) => {
      const filtered = expenses.filter((e) => e.paymentMode === 'Cash');
      return {
        rows: filtered.map((e, idx) => [
          idx + 1,
          e.id,
          e.expenseDate,
          e.employeeName,
          e.siteName || 'General',
          e.category,
          e.description,
          e.totalAmount,
          e.attachments.length > 0 ? 'Yes' : 'No',
          e.approvalStatus,
        ]),
      };
    },
  },

  upiAndBankPayments: {
    id: 'upiAndBankPayments',
    title: 'UPI & Bank Payment Report',
    description: 'Digital transactions, NEFT, RTGS and UPI payment trails',
    categoryGroup: 'Finance',
    headers: ['Sr. No.', 'Payment ID', 'Date', 'Employee / Payee', 'Expense ID', 'Site Name', 'Amount (Rs.)', 'Mode', 'Transaction Ref', 'Paid By'],
    getData: (_e, _a, payments) => {
      return {
        rows: payments.map((p, idx) => [
          idx + 1,
          p.id,
          p.paymentDate,
          p.employeeName,
          p.expenseId,
          p.siteName || 'General',
          p.amount,
          p.paymentMode,
          p.transactionReference,
          p.paidBy,
        ]),
      };
    },
  },

  completeLedger: {
    id: 'completeLedger',
    title: 'Complete Expense Ledger',
    description: 'Master general journal of every solar project transaction and movement',
    categoryGroup: 'General',
    headers: [
      'Sr. No.',
      'Expense ID',
      'Date',
      'Employee',
      'Site Name',
      'Category',
      'Description',
      'Qty',
      'Rate',
      'Total Amount',
      'Paid By',
      'Approval',
      'Paid (Rs.)',
      'Adjusted (Rs.)',
      'Balance (Rs.)',
    ],
    getData: (expenses) => {
      return {
        rows: expenses.map((e, idx) => {
          const balance = e.totalAmount - e.paidAmount - e.advanceAdjustedAmount;
          return [
            idx + 1,
            e.id,
            e.expenseDate,
            e.employeeName,
            e.siteName || 'General',
            e.category,
            e.description,
            e.quantity,
            e.rate,
            e.totalAmount,
            e.paidBy,
            e.approvalStatus,
            e.paidAmount,
            e.advanceAdjustedAmount,
            Math.max(0, balance),
          ];
        }),
      };
    },
  },
};
