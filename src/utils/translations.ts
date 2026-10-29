/**
 * Sunvault Expenses Manager - Bilingual Dictionary (English & Hindi)
 * Complete Hindi (हिंदी) and English support for all interface elements
 */

import { Language } from '../types';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Brand & App
    appName: 'Sunvault Expenses Manager',
    companyName: 'Sunvault Powertech Pvt. Ltd.',
    solarEpc: 'Solar EPC Expense Management',
    login: 'Login',
    logout: 'Logout',
    switchLanguage: 'हिंदी',
    currentLanguageLabel: 'English',

    // Roles & Sessions
    adminRole: 'Administrator',
    employeeRole: 'Employee',
    managerRole: 'Project Manager',
    supervisorRole: 'Site Supervisor',
    loggedInAs: 'Logged in as',
    empId: 'Employee ID',
    username: 'Username',
    password: 'Password',
    enterUsername: 'Enter username',
    enterPassword: 'Enter password',
    signIn: 'Sign In Securely',
    invalidCredentials: 'Invalid username or password. Please verify your credentials.',
    accountDeactivated: 'This account has been deactivated. Please contact the administrator.',

    // Navigation
    navDashboard: 'Dashboard',
    navExpenses: 'Expenses',
    navAddExpense: 'Add Expense',
    navAdvances: 'Advances',
    navApprovals: 'Approvals',
    navPayments: 'Payments',
    navReports: 'Reports Hub',
    navEmployees: 'Employee Accounts',

    // Dashboard Titles
    adminDashboardTitle: 'Sunvault Central Financial Dashboard (Admin)',
    employeeDashboardTitle: 'My Solar Expense Dashboard',
    adminDashboardSubtitle: 'Enterprise expenditure oversight, employee advance controls & project cost ledger',
    employeeDashboardSubtitle: 'Your personal claims history, advance balance & reimbursement status',

    // Admin Dashboard KPI Cards
    kpiTodayTotal: "Today's Total Expenses",
    kpiMonthTotal: 'Monthly Total Expenses',
    kpiTotalAdvances: 'Total Employee Advances',
    kpiAdvanceAdjustments: 'Advance Adjustments',
    kpiPendingApprovals: 'Pending Approvals',
    kpiApprovedExpenses: 'Approved Expenses',
    kpiRejectedExpenses: 'Rejected Expenses',
    kpiPaidExpenses: 'Paid Expenses',
    kpiOutstandingPayments: 'Outstanding Payments',
    kpiSiteExpenses: 'Site-wise Expenses',
    kpiEmployeeExpenses: 'Employee-wise Expenses',
    kpiCategoryExpenses: 'Category-wise Expenses',

    // Employee Dashboard KPI Cards
    kpiMyExpenses: 'My Total Expenses',
    kpiMyPending: 'My Pending Expenses',
    kpiMyApproved: 'My Approved Expenses',
    kpiMyRejected: 'My Rejected Expenses',
    kpiMyAdvanceBalance: 'My Advance Balance',
    kpiMyReimbursements: 'My Pending Reimbursements',

    // Form Labels
    fieldExpenseId: 'Expense ID',
    fieldExpenseDate: 'Expense Date',
    fieldEmployeeId: 'Employee ID (Locked to Login)',
    fieldEmployeeName: 'Employee Name (Blank by default)',
    fieldSiteName: 'Project / Site Name (Blank by default)',
    fieldSiteNamePlaceholder: 'Type site name manually (blank by default)...',
    fieldEmployeeNamePlaceholder: 'Enter your name (blank by default)...',
    fieldCategory: 'Expense Category',
    fieldDescription: 'Expense Description',
    fieldDescriptionPlaceholder: 'State reason (e.g. earthing wire, mounting helpers, ticket)...',
    fieldAmount: 'Expense Amount (₹)',
    fieldPaymentMode: 'Payment Mode',
    fieldBillPhoto: 'Bill / Receipt Photo',
    fieldGpsLocation: 'GPS Location (Optional)',
    fieldCaptureGps: 'Capture Current GPS',
    fieldRemarks: 'Remarks & Field Notes',
    fieldRemarksPlaceholder: 'Optional remarks, invoice number or notes...',
    fieldSubmissionStatus: 'Submission Status',

    // Actions
    btnSubmit: 'Submit Expense Claim',
    btnCancel: 'Cancel',
    btnApprove: 'Approve Expense',
    btnReject: 'Reject Expense',
    btnRecordPayment: 'Record Payment',
    btnExportExcel: 'Export Excel (CSV)',
    btnDownloadPdf: 'Print / Save PDF',
    btnResetPassword: 'Reset Password',
    btnDeactivate: 'Deactivate Account',
    btnActivate: 'Activate Account',
    btnNewAdvance: 'Disburse Advance',
    btnSettleAdvance: 'Reconcile & Settle',

    // Categories (15 categories)
    catTravelling: 'Travelling',
    catBusTrainAutoTaxi: 'Bus / Train / Auto / Taxi',
    catFood: 'Food',
    catTeaWater: 'Tea / Water',
    catHotelRoomRent: 'Hotel / Room Rent',
    catMaterialPurchase: 'Material Purchase',
    catToolsEquipment: 'Tools and Equipment',
    catLabourPayment: 'Labour Payment',
    catFuelPetrolDiesel: 'Fuel / Petrol / Diesel',
    catParking: 'Parking',
    catTollTax: 'Toll Tax',
    catSiteMiscellaneous: 'Site Miscellaneous',
    catOfficeExpenses: 'Office Expenses',
    catEmployeeAdvance: 'Employee Advance',
    catOtherExpenses: 'Other Expenses',

    // Statuses
    statusDraft: 'Draft',
    statusSubmitted: 'Submitted',
    statusPendingApproval: 'Pending Approval',
    statusApproved: 'Approved',
    statusRejected: 'Rejected',
    statusPaid: 'Paid',

    // Privacy & Security Notice
    privacyNoticeEmployee: 'Strict Privacy Active: You can only view your own expenses and advances. Other employees’ records and company reports are restricted.',
    adminNotice: 'Admin Master Access: Viewing all employee accounts, site expenses, advance settlements & approval queues.',
  },

  hi: {
    // Brand & App
    appName: 'सनवॉल्ट व्यय प्रबंधक',
    companyName: 'सनवॉल्ट पावरटेक प्रा. लि.',
    solarEpc: 'सोलर ईपीसी व्यय प्रबंधन प्रणाली',
    login: 'लॉग इन करें',
    logout: 'लॉग आउट',
    switchLanguage: 'English',
    currentLanguageLabel: 'हिंदी',

    // Roles & Sessions
    adminRole: 'प्रशासक (एडमिन)',
    employeeRole: 'कर्मचारी',
    managerRole: 'प्रोजेक्ट मैनेजर',
    supervisorRole: 'साइट सुपरवाइजर',
    loggedInAs: 'लॉग इन हैं',
    empId: 'कर्मचारी आईडी',
    username: 'यूज़रनेम',
    password: 'पासवर्ड',
    enterUsername: 'यूज़रनेम दर्ज करें',
    enterPassword: 'पासवर्ड दर्ज करें',
    signIn: 'सुरक्षित लॉग इन करें',
    invalidCredentials: 'अमान्य यूज़रनेम या पासवर्ड। कृपया विवरण जांचें।',
    accountDeactivated: 'यह खाता निष्क्रिय कर दिया गया है। कृपया एडमिन से संपर्क करें।',

    // Navigation
    navDashboard: 'डैशबोर्ड',
    navExpenses: 'खर्चे',
    navAddExpense: 'नया खर्च जोड़ें',
    navAdvances: 'अग्रिम राशि',
    navApprovals: 'स्वीकृतियां',
    navPayments: 'भुगतान',
    navReports: 'रिपोर्ट्स हब',
    navEmployees: 'कर्मचारी खाते',

    // Dashboard Titles
    adminDashboardTitle: 'सनवॉल्ट केंद्रीय वित्तीय डैशबोर्ड (एडमिन)',
    employeeDashboardTitle: 'मेरा सोलर व्यय डैशबोर्ड',
    adminDashboardSubtitle: 'कंपनी-व्यापी खर्च नियंत्रण, अग्रिम भुगतान एवं सोलर प्रोजेक्ट लागत ऑडिट',
    employeeDashboardSubtitle: 'आपके व्यक्तिगत खर्चे, अग्रिम शेष राशि एवं प्रतिपूर्ति की स्थिति',

    // Admin Dashboard KPI Cards
    kpiTodayTotal: 'आज का कुल खर्च',
    kpiMonthTotal: 'मासिक कुल खर्च',
    kpiTotalAdvances: 'कुल कर्मचारी अग्रिम राशि',
    kpiAdvanceAdjustments: 'बिल में समायोजित अग्रिम',
    kpiPendingApprovals: 'लंबित स्वीकृतियां',
    kpiApprovedExpenses: 'स्वीकृत खर्चे',
    kpiRejectedExpenses: 'अस्वीकृत खर्चे',
    kpiPaidExpenses: 'भुगतान पूर्ण खर्चे',
    kpiOutstandingPayments: 'बकाया भुगतान',
    kpiSiteExpenses: 'साइट-वार खर्चे',
    kpiEmployeeExpenses: 'कर्मचारी-वार खर्चे',
    kpiCategoryExpenses: 'श्रेणी-वार खर्चे',

    // Employee Dashboard KPI Cards
    kpiMyExpenses: 'मेरे कुल खर्चे',
    kpiMyPending: 'मेरे लंबित खर्चे',
    kpiMyApproved: 'मेरे स्वीकृत खर्चे',
    kpiMyRejected: 'मेरे अस्वीकृत खर्चे',
    kpiMyAdvanceBalance: 'मेरा शेष अग्रिम (बकाया)',
    kpiMyReimbursements: 'मेरी बकाया प्रतिपूर्ति',

    // Form Labels
    fieldExpenseId: 'खर्च आईडी',
    fieldExpenseDate: 'खर्च की तिथि',
    fieldEmployeeId: 'कर्मचारी आईडी (लॉगिन से स्वतः संबद्ध)',
    fieldEmployeeName: 'कर्मचारी का नाम (डिफ़ॉल्ट रूप से रिक्त)',
    fieldSiteName: 'प्रोजेक्ट / साइट का नाम (डिफ़ॉल्ट रूप से रिक्त)',
    fieldSiteNamePlaceholder: 'साइट का नाम मैन्युअल रूप से लिखें (डिफ़ॉल्ट रिक्त)...',
    fieldEmployeeNamePlaceholder: 'अपना नाम लिखें (डिफ़ॉल्ट रूप से रिक्त)...',
    fieldCategory: 'खर्च की श्रेणी',
    fieldDescription: 'खर्च का विवरण',
    fieldDescriptionPlaceholder: 'कारण लिखें (जैसे अर्थिंग वायर, पैनल अनलोडिंग, टिकट)...',
    fieldAmount: 'कुल राशि (₹)',
    fieldPaymentMode: 'भुगतान का तरीका',
    fieldBillPhoto: 'बिल / रसीद फोटो',
    fieldGpsLocation: 'जीपीएस स्थान (वैकल्पिक)',
    fieldCaptureGps: 'वर्तमान जीपीएस स्थान लें',
    fieldRemarks: 'टिप्पणी व फील्ड नोट्स',
    fieldRemarksPlaceholder: 'वैकल्पिक टिप्पणी, चालान संख्या आदि...',
    fieldSubmissionStatus: 'सबमिशन स्थिति',

    // Actions
    btnSubmit: 'खर्च दावा प्रस्तुत करें',
    btnCancel: 'रद्द करें',
    btnApprove: 'खर्च स्वीकृत करें',
    btnReject: 'खर्च अस्वीकृत करें',
    btnRecordPayment: 'भुगतान दर्ज करें',
    btnExportExcel: 'एक्सेल में डाउनलोड करें',
    btnDownloadPdf: 'प्रिंट / पीडीएफ सेव करें',
    btnResetPassword: 'पासवर्ड रीसेट करें',
    btnDeactivate: 'खाता निष्क्रिय करें',
    btnActivate: 'खाता सक्रिय करें',
    btnNewAdvance: 'अग्रिम राशि दें',
    btnSettleAdvance: 'अग्रिम हिसाब चुकता करें',

    // Categories (15 categories)
    catTravelling: 'यात्रा',
    catBusTrainAutoTaxi: 'बस / ट्रेन / ऑटो / टैक्सी',
    catFood: 'भोजन',
    catTeaWater: 'चाय / पानी',
    catHotelRoomRent: 'होटल / कमरा किराया',
    catMaterialPurchase: 'सामग्री खरीद',
    catToolsEquipment: 'उपकरण व औजार',
    catLabourPayment: 'मजदूरी भुगतान',
    catFuelPetrolDiesel: 'ईंधन / पेट्रोल / डीजल',
    catParking: 'पार्किंग',
    catTollTax: 'टोल टैक्स',
    catSiteMiscellaneous: 'साइट विविध खर्चे',
    catOfficeExpenses: 'कार्यालय व्यय',
    catEmployeeAdvance: 'कर्मचारी अग्रिम',
    catOtherExpenses: 'अन्य खर्चे',

    // Statuses
    statusDraft: 'ड्राफ्ट',
    statusSubmitted: 'प्रस्तुत',
    statusPendingApproval: 'स्वीकृति लंबित',
    statusApproved: 'स्वीकृत',
    statusRejected: 'अस्वीकृत',
    statusPaid: 'भुगतान पूर्ण',

    // Privacy & Security Notice
    privacyNoticeEmployee: 'कड़ी गोपनीयता लागू: आप केवल अपने खर्चे और अग्रिम देख सकते हैं। अन्य कर्मचारियों के वित्तीय रिकॉर्ड और कंपनी रिपोर्ट्स प्रतिबंधित हैं।',
    adminNotice: 'एडमिन अधिकार: सभी कर्मचारियों के खर्चे, साइट लागत, अग्रिम और स्वीकृतियों का पूर्ण नियंत्रण।',
  },
};

export const getTranslation = (lang: Language, key: string): string => {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
};
