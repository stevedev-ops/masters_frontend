import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates an executive, audit-ready PDF document for the Daily Breakdown
 * @param {Object} data - Daily breakdown data from getDailyBreakdownData
 * @returns {jsPDF} The populated jsPDF document instance
 */
export function generateDailyBreakdownPDF(data) {
  const { date, currency = 'KES', financials, staffBreakdown = [], closing, transactions = [] } = data;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2);

  // Corporate Color Palette (The Masters Barber & Executive Spa)
  const COLOR_PRIMARY = [15, 23, 42];      // Slate 900
  const COLOR_SECONDARY = [30, 41, 59];    // Slate 800
  const COLOR_GOLD = [180, 83, 9];         // Amber 700 / Warm Gold
  const COLOR_GOLD_LIGHT = [251, 191, 36]; // Amber 400
  const COLOR_TEXT_DARK = [15, 23, 42];    // Slate 900
  const COLOR_MUTED = [100, 116, 139];     // Slate 500
  const COLOR_ALT_ROW = [248, 250, 252];   // Slate 50
  const COLOR_BORDER = [226, 232, 240];    // Slate 200
  const COLOR_ROSE = [225, 29, 72];        // Rose 600 (Shortage / Tips)
  const COLOR_EMERALD = [16, 185, 129];    // Emerald 600 (Balanced / Profits)

  const formatMoney = (val) => {
    const num = Number(val || 0);
    return `${currency} ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // --- 1. LUXURY HEADER BAR ---
  doc.setFillColor(...COLOR_PRIMARY);
  doc.rect(margin, 12, contentWidth, 23, 'F');

  // Gold accent border along bottom of header
  doc.setFillColor(...COLOR_GOLD);
  doc.rect(margin, 35, contentWidth, 1.2, 'F');

  // Shop Brand Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('THE MASTERS BARBER & EXECUTIVE SPA', margin + 6, 21);

  // Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_GOLD_LIGHT);
  doc.text('DAILY FINANCIAL AUDIT & STAFF PERFORMANCE REPORT', margin + 6, 28);

  // Right Metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`DATE: ${date}`, pageWidth - margin - 6, 20.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  const closingStatus = closing?.isClosed
    ? (closing.totalDiff < 0 ? `SHORTAGE (-${formatMoney(Math.abs(closing.totalDiff))})` : closing.totalDiff > 0 ? `OVERAGE (+${formatMoney(closing.totalDiff)})` : 'BALANCED')
    : 'SHIFT CLOSING PENDING';
  doc.text(`Closing Audit: ${closingStatus}`, pageWidth - margin - 6, 26.5, { align: 'right' });
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, pageWidth - margin - 6, 31.5, { align: 'right' });

  let currentY = 40;

  // --- 2. EXECUTIVE FINANCIAL SUMMARY TABLE ---
  autoTable(doc, {
    startY: currentY,
    head: [['1. EXECUTIVE FINANCIAL SUMMARY', 'AMOUNT', 'METRIC DETAILS / NOTES']],
    body: [
      ['Total Gross Revenue', formatMoney(financials?.totalRevenue), 'Pure Services Sales + All Client Tips Collected'],
      ['Pure Services Revenue', formatMoney(financials?.serviceRevenue), 'Gross Service Sales (Subject to 40% Staff Commission & 60% Shop Margin)'],
      ['Staff Commissions (40%)', formatMoney(financials?.totalCommissions), 'Total 40% Commission Share Earned by Service Providers'],
      ['Shop Operating Margin (60%)', formatMoney(financials?.shopGrossRetained), 'Shop Retained Operating Margin from Service Sales'],
      ['Total Staff Tips Collected', formatMoney(financials?.totalTips), `100% Payout to Staff (Barbers: ${formatMoney(financials?.totalBarberTips)} | Spa/Therapy: ${formatMoney(financials?.totalMassageTips)})`],
      ['Total Completed Sessions', `${transactions.length} Clients`, 'Itemized Customer Transactions Logged']
    ],
    theme: 'grid',
    headStyles: {
      fillColor: COLOR_PRIMARY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.2
    },
    bodyStyles: {
      textColor: COLOR_TEXT_DARK,
      fontSize: 7.5,
      cellPadding: 2
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { fontStyle: 'bold', textColor: COLOR_GOLD, halign: 'right', cellWidth: 42 },
      2: { textColor: COLOR_MUTED, cellWidth: contentWidth - 55 - 42 }
    },
    margin: { left: margin, right: margin }
  });

  currentY = doc.lastAutoTable.finalY + 5;

  // --- 3. PAYMENT CHANNELS BREAKDOWN TABLE ---
  const totRev = financials?.totalRevenue || 0;
  const cashPct = totRev > 0 ? ((financials.totalCash / totRev) * 100).toFixed(1) : '0.0';
  const mpesaPct = totRev > 0 ? ((financials.totalMpesa / totRev) * 100).toFixed(1) : '0.0';
  const cardPct = totRev > 0 ? ((financials.totalCard / totRev) * 100).toFixed(1) : '0.0';

  autoTable(doc, {
    startY: currentY,
    head: [['2. PAYMENT CHANNELS (CASH & M-PESA)', 'AMOUNT COLLECTED', 'REVENUE SHARE (%)']],
    body: [
      ['Cash in Drawer', formatMoney(financials?.totalCash), `${cashPct}% of Gross Collections`],
      ['M-Pesa Till / Paybill', formatMoney(financials?.totalMpesa), `${mpesaPct}% of Gross Collections`],
      ['Credit / Debit Card', formatMoney(financials?.totalCard), `${cardPct}% of Gross Collections`],
      ['Total Payments Received', formatMoney(financials?.totalRevenue), '100.0% Total Funds Accounted']
    ],
    theme: 'grid',
    headStyles: {
      fillColor: COLOR_SECONDARY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.2
    },
    bodyStyles: {
      textColor: COLOR_TEXT_DARK,
      fontSize: 7.5,
      cellPadding: 2
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { fontStyle: 'bold', textColor: COLOR_TEXT_DARK, halign: 'right', cellWidth: 42 },
      2: { textColor: COLOR_MUTED, cellWidth: contentWidth - 55 - 42 }
    },
    margin: { left: margin, right: margin }
  });

  currentY = doc.lastAutoTable.finalY + 6;

  // --- 4. WHO EARNED WHAT: STAFF EARNINGS, COMMISSIONS & TIPS BREAKDOWN ---
  const staffRows = staffBreakdown.map((s) => {
    const isPaid = s.commissionPending === 0 && s.tipsPending === 0;
    const statusText = s.totalTakeHome === 0 
      ? 'No Activity' 
      : isPaid 
      ? 'Fully Cleared' 
      : `Pending: ${formatMoney(s.commissionPending + s.tipsPending)}`;

    return [
      s.name,
      s.role || 'Staff',
      String(s.servicesCount || 0),
      String(s.clientsCount || 0),
      formatMoney(s.serviceTotal),
      formatMoney(s.commission),
      formatMoney(s.tips),
      formatMoney(s.totalTakeHome),
      statusText
    ];
  });

  // Calculate totals across all staff
  const totalStaffSales = staffBreakdown.reduce((sum, s) => sum + (s.serviceTotal || 0), 0);
  const totalStaffComm = staffBreakdown.reduce((sum, s) => sum + (s.commission || 0), 0);
  const totalStaffTips = staffBreakdown.reduce((sum, s) => sum + (s.tips || 0), 0);
  const totalStaffTakeHome = staffBreakdown.reduce((sum, s) => sum + (s.totalTakeHome || 0), 0);
  const totalServicesDone = staffBreakdown.reduce((sum, s) => sum + (s.servicesCount || 0), 0);
  const totalClientsServed = staffBreakdown.reduce((sum, s) => sum + (s.clientsCount || 0), 0);

  const staffFooterRow = [
    'TOTALS & PAYOUTS',
    `${staffBreakdown.length} Staff`,
    String(totalServicesDone),
    String(totalClientsServed),
    formatMoney(totalStaffSales),
    formatMoney(totalStaffComm),
    formatMoney(totalStaffTips),
    formatMoney(totalStaffTakeHome),
    'Combined Net'
  ];

  autoTable(doc, {
    startY: currentY,
    head: [[
      '3. WHO EARNED WHAT: STAFF EARNINGS BREAKDOWN',
      'ROLE',
      'SRV',
      'CLI',
      'SERVICE SALES',
      'COMM (40%)',
      'TIPS',
      'TAKE-HOME',
      'STATUS'
    ]],
    body: staffRows.length > 0 ? [...staffRows, staffFooterRow] : [['No staff records available', '', '', '', '', '', '', '', '']],
    theme: 'striped',
    headStyles: {
      fillColor: COLOR_PRIMARY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: 2.2
    },
    bodyStyles: {
      textColor: COLOR_TEXT_DARK,
      fontSize: 7,
      cellPadding: 2
    },
    alternateRowStyles: {
      fillColor: COLOR_ALT_ROW
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 32 },
      1: { cellWidth: 22 },
      2: { halign: 'center', cellWidth: 10 },
      3: { halign: 'center', cellWidth: 10 },
      4: { halign: 'right', cellWidth: 24 },
      5: { halign: 'right', fontStyle: 'bold', textColor: COLOR_GOLD, cellWidth: 23 },
      6: { halign: 'right', fontStyle: 'bold', textColor: COLOR_ROSE, cellWidth: 20 },
      7: { halign: 'right', fontStyle: 'bold', textColor: COLOR_TEXT_DARK, cellWidth: 24 },
      8: { halign: 'center', fontStyle: 'bold', cellWidth: contentWidth - 32 - 22 - 10 - 10 - 24 - 23 - 20 - 24 }
    },
    didParseCell: (hookData) => {
      // Highlight the footer total row
      if (staffRows.length > 0 && hookData.row.index === staffRows.length) {
        hookData.cell.styles.fillColor = [241, 245, 249];
        hookData.cell.styles.fontStyle = 'bold';
        hookData.cell.styles.textColor = COLOR_TEXT_DARK;
      }
    },
    margin: { left: margin, right: margin }
  });

  currentY = doc.lastAutoTable.finalY + 6;

  // --- 5. SHIFT CLOSING RECONCILIATION & CASH DRAWER AUDIT ---
  const closingStatusLabel = !closing?.isClosed
    ? 'Shift Closing Pending (Staff has not submitted final count)'
    : closing.totalDiff < 0
    ? `SHORTAGE DETECTED: -${formatMoney(Math.abs(closing.totalDiff))}`
    : closing.totalDiff > 0
    ? `OVERAGE RECORDED: +${formatMoney(closing.totalDiff)}`
    : 'BALANCED (Zero Discrepancy)';

  const closingBody = [
    [
      'Cash Drawer Count',
      formatMoney(closing?.expectedCash),
      formatMoney(closing?.actualCash),
      formatMoney(closing?.cashDiff),
      closing?.cashDiff < 0 ? 'SHORTAGE' : closing?.cashDiff > 0 ? 'OVERAGE' : 'BALANCED'
    ],
    [
      'M-Pesa Statement / Till',
      formatMoney(closing?.expectedMpesa),
      formatMoney(closing?.actualMpesa),
      formatMoney(closing?.mpesaDiff),
      closing?.mpesaDiff < 0 ? 'SHORTAGE' : closing?.mpesaDiff > 0 ? 'OVERAGE' : 'BALANCED'
    ],
    [
      'Total Drawer & Paybill Funds',
      formatMoney(closing?.expectedTotal),
      formatMoney(closing?.actualTotal),
      formatMoney(closing?.totalDiff),
      closing?.totalDiff < 0 ? 'NET SHORTAGE' : closing?.totalDiff > 0 ? 'NET OVERAGE' : 'BALANCED'
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    head: [[
      `4. SHIFT RECONCILIATION AUDIT: ${closingStatusLabel}`,
      'EXPECTED',
      'ACTUAL',
      'VARIANCE',
      'RESULT'
    ]],
    body: closingBody,
    theme: 'grid',
    headStyles: {
      fillColor: closing?.isClosed && closing?.totalDiff < 0 ? [159, 18, 57] : COLOR_PRIMARY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: 2.2
    },
    bodyStyles: {
      textColor: COLOR_TEXT_DARK,
      fontSize: 7,
      cellPadding: 2
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { halign: 'right', cellWidth: 32 },
      2: { halign: 'right', fontStyle: 'bold', cellWidth: 32 },
      3: { halign: 'right', fontStyle: 'bold', cellWidth: 32 },
      4: { halign: 'center', fontStyle: 'bold', cellWidth: contentWidth - 55 - 32 - 32 - 32 }
    },
    didParseCell: (hookData) => {
      if (hookData.column.index === 3 || hookData.column.index === 4) {
        const rowVal = closingBody[hookData.row.index];
        if (rowVal && rowVal[4].includes('SHORTAGE')) {
          hookData.cell.styles.textColor = COLOR_ROSE;
        } else if (rowVal && rowVal[4].includes('BALANCED')) {
          hookData.cell.styles.textColor = COLOR_EMERALD;
        }
      }
    },
    margin: { left: margin, right: margin }
  });

  currentY = doc.lastAutoTable.finalY + 3;

  // Add notes block below table if closing notes exist
  if (closing?.notes) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(...COLOR_MUTED);
    doc.text(`Closing Staff Notes: "${closing.notes}" (Submitted By: ${closing.submittedBy || 'Staff'})`, margin + 2, currentY);
    currentY += 5;
  }

  currentY += 2;

  // --- 6. ITEMIZED TRANSACTION LEDGER FOR THE DAY ---
  const txRows = transactions.map((t) => {
    const timeStr = t.timestamp ? new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const staffName = [t.barberName, t.massageTherapistName].filter(Boolean).join(' & ') || 'Staff';
    const srvStr = (t.services || []).map(s => s.name).join(', ');
    const cAmt = t.cashAmount !== undefined ? Number(t.cashAmount) : (t.paymentMethod === 'Cash' ? Number(t.grandTotal) : 0);
    const mAmt = t.mpesaAmount !== undefined ? Number(t.mpesaAmount) : (t.paymentMethod === 'M-Pesa' ? Number(t.grandTotal) : 0);
    const tipSum = (Number(t.barberTip) || 0) + (Number(t.massageTip) || 0);

    return [
      t.id,
      timeStr,
      t.clientName || 'Walk-in',
      staffName,
      srvStr,
      t.paymentMethod,
      `C:${cAmt.toLocaleString()} / M:${mAmt.toLocaleString()}`,
      tipSum > 0 ? formatMoney(tipSum) : '-',
      formatMoney(t.grandTotal)
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [[
      `5. DAY'S ITEMIZED TRANSACTIONS (${transactions.length})`,
      'TIME',
      'CLIENT',
      'STAFF',
      'SERVICES RENDERED',
      'METHOD',
      'SPLIT (CASH/MPESA)',
      'TIPS',
      'TOTAL'
    ]],
    body: txRows.length > 0 ? txRows : [['No transactions recorded for this day', '', '', '', '', '', '', '', '']],
    theme: 'striped',
    headStyles: {
      fillColor: COLOR_SECONDARY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7,
      cellPadding: 2
    },
    bodyStyles: {
      textColor: COLOR_TEXT_DARK,
      fontSize: 6.5,
      cellPadding: 1.8
    },
    alternateRowStyles: {
      fillColor: COLOR_ALT_ROW
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 18 },
      1: { cellWidth: 14, halign: 'center' },
      2: { cellWidth: 22 },
      3: { cellWidth: 22 },
      4: { cellWidth: 42 },
      5: { cellWidth: 16, halign: 'center' },
      6: { cellWidth: 22, halign: 'center' },
      7: { cellWidth: 14, halign: 'right', textColor: COLOR_ROSE },
      8: { cellWidth: contentWidth - (18 + 14 + 22 + 22 + 42 + 16 + 22 + 14), halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  });

  // --- 7. DYNAMIC FOOTER WITH PAGE NUMBERS ---
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Light line above footer
    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    // Footer text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...COLOR_MUTED);
    doc.text(
      'The Masters Barber & Executive Spa • Confidential Management & Audit Financial Report',
      margin,
      pageHeight - 6.5
    );

    doc.setFont('helvetica', 'bold');
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 6.5,
      { align: 'right' }
    );
  }

  return doc;
}

/**
 * Triggers direct browser download of the daily breakdown PDF
 * @param {Object} breakdownData - Data from getDailyBreakdownData
 */
export function downloadDailyBreakdownPDF(breakdownData) {
  const doc = generateDailyBreakdownPDF(breakdownData);
  const fileName = `The_Masters_Daily_Breakdown_${breakdownData.date || new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
