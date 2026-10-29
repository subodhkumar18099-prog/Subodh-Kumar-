/**
 * Sunvault Expenses Manager - Type Definitions
 * Sunvault Powertech Pvt. Ltd.
 */

export type Language = 'en' | 'hi';

export type UserRole = 'admin' | 'employee' | 'project_manager' | 'site_supervisor';

export interface User {
  id: string;
  username: string;
  employeeId: string; // "ADMIN", "1", "2", ..., "10"
  name: string; // Blank by default for employees
  role: UserRole;
  email?: string;
  phone?: string;
  isActive: boolean;
  department?: string;
  password?: string;
  passwordHash?: string;
  salt?: string;
}

export type ExpenseCategory =
  | 'Travelling'
  | 'Bus / Train / Auto / Taxi'
  | 'Food'
  | 'Tea / Water'
  | 'Hotel / Room Rent'
  | 'Material Purchase'
  | 'Tools and Equipment'
  | 'Labour Payment'
  | 'Fuel / Petrol / Diesel'
  | 'Parking'
  | 'Toll Tax'
  | 'Site Miscellaneous'
  | 'Office Expenses'
  | 'Employee Advance'
  | 'Other Expenses'
  | string;

export interface CategoryItem {
  id: string;
  name: string;
  hindiName?: string;
  description: string;
  isActive: boolean;
  isSystem: boolean;
}

export type ApprovalStatus = 'Draft' | 'Submitted' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Paid';

export type PaymentMode = 'Cash' | 'UPI' | 'Bank Transfer' | 'Company Card' | 'Employee Pocket' | 'Other';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'document';
  sizeKb: number;
  uploadedAt: string;
  uploaderId?: string;
}

export interface GpsLocation {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  capturedAt: string;
  address?: string;
}

export interface ApprovalHistoryEntry {
  status: ApprovalStatus;
  changedBy: string;
  changedById: string;
  changedAt: string;
  comments?: string;
}

export interface Expense {
  id: string;
  expenseDate: string;
  employeeId: string; // Automatically associated with authenticated account
  employeeName: string; // BLANK by default! Never prefilled
  companyName: string;
  siteName: string; // BLANK by default! Never prefilled
  siteLocation: string;
  category: ExpenseCategory;
  description: string;
  quantity: number;
  rate: number;
  totalAmount: number;
  paymentMode: PaymentMode;
  paidBy: 'Employee' | 'Company';
  attachments: Attachment[];
  gpsLocation?: GpsLocation;
  remarks: string;
  submittedBy: string;
  submittedById: string;
  submissionDate: string;
  approvalStatus: ApprovalStatus;
  approvalHistory: ApprovalHistoryEntry[];
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  isBillRequired: boolean;
  billVerified: boolean;
  billVerifiedBy?: string;
  billVerifiedAt?: string;
  billVerificationNotes?: string;
  adminBillOverride?: {
    overriddenBy: string;
    reason: string;
    overriddenAt: string;
  };
  paidAmount: number;
  paymentStatus: 'Unpaid' | 'Partially Paid' | 'Fully Paid';
  advanceAdjustedAmount: number;
  adjustedAdvanceId?: string;
  travelDetails?: TravelDetails;
}

export interface TravelDetails {
  startingLocation: string;
  destination: string;
  travelPurpose: string;
  travelMode: 'Personal Car' | 'Bike' | 'Bus' | 'Train' | 'Flight' | 'Auto Rickshaw' | 'Taxi / Cab' | 'Other';
  outwardFare: number;
  returnFare: number;
  localConveyance: number;
  parking: number;
  tollTax: number;
  otherCharges: number;
}

export type AdvanceSettlementStatus =
  | 'Advance Pending'
  | 'Advance Paid'
  | 'Partially Adjusted'
  | 'Settlement Pending'
  | 'Fully Settled';

export interface EmployeeAdvance {
  id: string;
  employeeId: string; // Automatically locked to authenticated employee
  employeeName: string; // BLANK by default
  advanceDate: string;
  siteName: string; // BLANK by default
  advancePurpose: string;
  advanceAmount: number;
  paymentMode: PaymentMode;
  paymentReference: string;
  approvedBy: string;
  paymentDate: string;
  remarks: string;
  status: AdvanceSettlementStatus;
  amountAdjusted: number;
  refundAmount: number;
  settlementDate?: string;
  adjustedExpenseIds: string[];
}

export interface PaymentTransaction {
  id: string;
  paymentDate: string;
  employeeName: string;
  employeeId: string;
  expenseId: string;
  siteName: string;
  amount: number;
  paymentMode: PaymentMode;
  transactionReference: string;
  paidBy: string;
  receivedBy: string;
  paymentProofUrl?: string;
  remarks: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorUsername: string;
  action: string;
  entityType: 'expense' | 'advance' | 'payment' | 'user' | 'auth';
  entityId: string;
  details: string;
}

export type DateFilterRange = 'today' | 'yesterday' | 'last7days' | 'thismonth' | 'previousmonth' | 'custom' | 'all';
