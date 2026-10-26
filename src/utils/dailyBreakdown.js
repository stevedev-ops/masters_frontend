import { calculateTransactionBreakdown, getStaffTransactionShare } from './commissions';

/**
 * Checks if a given timestamp or date string falls on targetDateStr (YYYY-MM-DD)
 */
export function isSameDay(itemDate, targetDateStr) {
  if (!itemDate || !targetDateStr) return false;
  if (typeof itemDate === 'string' && itemDate.slice(0, 10) === targetDateStr) {
    return true;
  }
  const d = new Date(itemDate);
  if (isNaN(d.getTime())) return false;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}` === targetDateStr;
}

/**
 * Computes complete audit breakdown for a specific calendar day
 */
export function getDailyBreakdownData({
  targetDateStr = new Date().toISOString().slice(0, 10),
  transactions = [],
  staff = [],
  closingRecords = [],
  currency = 'KSh'
}) {
  // 1. Transactions for the target day
  const dayTransactions = transactions.filter(t => isSameDay(t.timestamp, targetDateStr));

  // 2. Financial Metrics Accumulation
  let totalRevenue = 0;
  let serviceRevenue = 0;
  let totalTips = 0;
  let totalBarberTips = 0;
  let totalMassageTips = 0;
  let totalCommissions = 0;
  let shopGrossRetained = 0;
  let totalCash = 0;
  let totalMpesa = 0;
  let totalCard = 0;

  dayTransactions.forEach(t => {
    const bd = calculateTransactionBreakdown(t);
    totalRevenue += bd.grandTotal;
    serviceRevenue += bd.serviceTotal;
    totalTips += bd.totalTips;
    totalBarberTips += bd.barberTip;
    totalMassageTips += bd.massageTip;
    totalCommissions += bd.totalCommissions;
    shopGrossRetained += bd.shopGrossRetained;

    const cAmt = t.cashAmount !== undefined ? Number(t.cashAmount) : (t.paymentMethod === 'Cash' ? Number(t.grandTotal) : 0);
    const mAmt = t.mpesaAmount !== undefined ? Number(t.mpesaAmount) : (t.paymentMethod === 'M-Pesa' ? Number(t.grandTotal) : 0);
    const cardAmt = t.cardAmount !== undefined ? Number(t.cardAmount) : (t.paymentMethod === 'Card' ? Number(t.grandTotal) : 0);

    totalCash += cAmt;
    totalMpesa += mAmt;
    totalCard += cardAmt;
  });

  // 3. Staff Breakdown (Who earned what)
  const staffMap = new Map();

  // Populate known active team members first
  (staff || []).forEach(s => {
    staffMap.set(s.id, {
      id: s.id,
      name: s.name,
      role: s.role,
      title: s.title || '',
      active: s.active,
      clientsCount: 0,
      servicesCount: 0,
      serviceTotal: 0,
      commission: 0,
      commissionPaid: 0,
      commissionPending: 0,
      tips: 0,
      tipsPaid: 0,
      tipsPending: 0,
      totalTakeHome: 0,
      servicesList: []
    });
  });

  // Process day's transactions for worker allocations
  dayTransactions.forEach(t => {
    // Process Barber portion
    if (t.barberId) {
      if (!staffMap.has(t.barberId)) {
        staffMap.set(t.barberId, {
          id: t.barberId,
          name: t.barberName || 'Barber',
          role: 'Barber',
          title: '',
          active: true,
          clientsCount: 0,
          servicesCount: 0,
          serviceTotal: 0,
          commission: 0,
          commissionPaid: 0,
          commissionPending: 0,
          tips: 0,
          tipsPaid: 0,
          tipsPending: 0,
          totalTakeHome: 0,
          servicesList: []
        });
      }
      const bStaff = staffMap.get(t.barberId);
      const share = getStaffTransactionShare(t, t.barberId);
      if (share.isAssigned) {
        bStaff.clientsCount += 1;
        bStaff.servicesCount += (share.servicesDone || []).length;
        bStaff.serviceTotal += share.serviceTotal;
        bStaff.commission += share.commission;
        if (share.isCommissionPaid) {
          bStaff.commissionPaid += share.commission;
        } else {
          bStaff.commissionPending += share.commission;
        }
        bStaff.tips += share.tip;
        if (share.isTipPaid) {
          bStaff.tipsPaid += share.tip;
        } else {
          bStaff.tipsPending += share.tip;
        }
        bStaff.totalTakeHome += share.totalTakeHome;
        (share.servicesDone || []).forEach(s => {
          if (s?.name && !bStaff.servicesList.includes(s.name)) bStaff.servicesList.push(s.name);
        });
      }
    }

    // Process Massage Therapist portion (if distinct provider)
    if (t.massageTherapistId && t.massageTherapistId !== t.barberId) {
      if (!staffMap.has(t.massageTherapistId)) {
        staffMap.set(t.massageTherapistId, {
          id: t.massageTherapistId,
          name: t.massageTherapistName || 'Massage Therapist',
          role: 'Massage Therapist',
          title: '',
          active: true,
          clientsCount: 0,
          servicesCount: 0,
          serviceTotal: 0,
          commission: 0,
          commissionPaid: 0,
          commissionPending: 0,
          tips: 0,
          tipsPaid: 0,
          tipsPending: 0,
          totalTakeHome: 0,
          servicesList: []
        });
      }
      const mStaff = staffMap.get(t.massageTherapistId);
      const share = getStaffTransactionShare(t, t.massageTherapistId);
      if (share.isAssigned) {
        mStaff.clientsCount += 1;
        mStaff.servicesCount += (share.servicesDone || []).length;
        mStaff.serviceTotal += share.serviceTotal;
        mStaff.commission += share.commission;
        if (share.isCommissionPaid) {
          mStaff.commissionPaid += share.commission;
        } else {
          mStaff.commissionPending += share.commission;
        }
        mStaff.tips += share.tip;
        if (share.isTipPaid) {
          mStaff.tipsPaid += share.tip;
        } else {
          mStaff.tipsPending += share.tip;
        }
        mStaff.totalTakeHome += share.totalTakeHome;
        (share.servicesDone || []).forEach(s => {
          if (s?.name && !mStaff.servicesList.includes(s.name)) mStaff.servicesList.push(s.name);
        });
      }
    }
  });

  const staffBreakdown = Array.from(staffMap.values());

  // 4. Shift Closing Reconciliation
  const closingRecord = (closingRecords || []).find(rec => {
    if (rec.date === targetDateStr) return true;
    if (rec.timestamp && isSameDay(rec.timestamp, targetDateStr)) return true;
    return false;
  });

  let closing = null;
  if (closingRecord) {
    const expCash = Number(closingRecord.expectedCash || 0);
    const actCash = Number(closingRecord.actualCash || 0);
    const cDiff = Number(closingRecord.cashDiff !== undefined ? closingRecord.cashDiff : (actCash - expCash));
    const expMpesa = Number(closingRecord.expectedMpesa || 0);
    const actMpesa = Number(closingRecord.actualMpesa || 0);
    const mDiff = Number(closingRecord.mpesaDiff !== undefined ? closingRecord.mpesaDiff : (actMpesa - expMpesa));
    const totDiff = Number(closingRecord.totalDiff !== undefined ? closingRecord.totalDiff : (cDiff + mDiff));

    closing = {
      isClosed: true,
      id: closingRecord.id,
      date: targetDateStr,
      timestamp: closingRecord.timestamp || closingRecord.date,
      submittedBy: closingRecord.submittedBy || closingRecord.closedByStaffName || 'Shift Staff',
      expectedCash: expCash,
      actualCash: actCash,
      cashDiff: cDiff,
      expectedMpesa: expMpesa,
      actualMpesa: actMpesa,
      mpesaDiff: mDiff,
      expectedTotal: expCash + expMpesa,
      actualTotal: actCash + actMpesa,
      totalDiff: totDiff,
      notes: closingRecord.notes || '',
      status: totDiff === 0 ? 'Balanced' : (totDiff < 0 ? 'Shortage' : 'Overage')
    };
  } else {
    closing = {
      isClosed: false,
      id: null,
      date: targetDateStr,
      timestamp: null,
      submittedBy: 'Pending Shift Staff Submission',
      expectedCash: totalCash,
      actualCash: 0,
      cashDiff: 0,
      expectedMpesa: totalMpesa,
      actualMpesa: 0,
      mpesaDiff: 0,
      expectedTotal: totalCash + totalMpesa,
      actualTotal: 0,
      totalDiff: 0,
      notes: 'Shift closing reconciliation has not yet been submitted by staff.',
      status: 'Pending Closing'
    };
  }

  return {
    date: targetDateStr,
    currency,
    transactionsCount: dayTransactions.length,
    transactions: dayTransactions,
    financials: {
      totalRevenue,
      serviceRevenue,
      totalTips,
      totalBarberTips,
      totalMassageTips,
      totalCommissions,
      shopGrossRetained,
      totalCash,
      totalMpesa,
      totalCard
    },
    staffBreakdown,
    closing
  };
}

/**
 * Generates an executive, audit-ready CSV string for the daily breakdown
 */
export function generateDailyBreakdownCSV(data) {
  const { date, currency, financials, staffBreakdown, closing, transactions } = data;

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const lines = [
    `"THE MASTERS BARBER & EXECUTIVE SPA - DAILY PERFORMANCE & AUDIT REPORT"`,
    `"Report Date: ${date} | Generated: ${new Date().toLocaleString()} | Currency: ${currency}"`,
    `""`,
    `"====================================================================================================="`,
    `"1. EXECUTIVE FINANCIAL REVENUE & TOTALS"`,
    `"====================================================================================================="`,
    `"Metric","Amount (${currency})","Description"`,
    `"Total Gross Revenue","${financials.totalRevenue.toFixed(2)}","Services + All Tips Collected"`,
    `"Pure Service Revenue","${financials.serviceRevenue.toFixed(2)}","Gross Service Sales Before Payouts"`,
    `"Total Tips Earned","${financials.totalTips.toFixed(2)}","100% Payout Directly to Workers"`,
    `"  - Barber Tips","${financials.totalBarberTips.toFixed(2)}","Tips Attributed to Barbering"`,
    `"  - Massage / Spa Tips","${financials.totalMassageTips.toFixed(2)}","Tips Attributed to Spa & Massage"`,
    `"Total Staff Commissions (40%)","${financials.totalCommissions.toFixed(2)}","Staff Share of Service Sales"`,
    `"Shop Gross Retained (60%)","${financials.shopGrossRetained.toFixed(2)}","Shop Operating Margin from Services"`,
    `"Total Sessions Completed","${transactions.length}","Client Service Entries"`,
    `""`,
    `"====================================================================================================="`,
    `"2. PAYMENT CHANNELS BREAKDOWN (CASH & M-PESA)"`,
    `"====================================================================================================="`,
    `"Payment Channel","Amount Collected (${currency})","Revenue Share (%)"`,
    `"Cash in Drawer","${financials.totalCash.toFixed(2)}","${financials.totalRevenue > 0 ? ((financials.totalCash / financials.totalRevenue) * 100).toFixed(1) : '0.0'}%"`,
    `"M-Pesa Till / Paybill","${financials.totalMpesa.toFixed(2)}","${financials.totalRevenue > 0 ? ((financials.totalMpesa / financials.totalRevenue) * 100).toFixed(1) : '0.0'}%"`,
    `"Credit / Debit Card","${financials.totalCard.toFixed(2)}","${financials.totalRevenue > 0 ? ((financials.totalCard / financials.totalRevenue) * 100).toFixed(1) : '0.0'}%"`,
    `"Total Payments Collected","${financials.totalRevenue.toFixed(2)}","100.0%"`,
    `""`,
    `"====================================================================================================="`,
    `"3. WHO EARNED WHAT: STAFF EARNINGS, COMMISSIONS & TIPS BREAKDOWN"`,
    `"====================================================================================================="`,
    `"Worker Name","Role","Services Rendered","Clients Served","Service Sales (${currency})","Commission (40%) (${currency})","Commission Status","Tips Earned (${currency})","Tips Status","Total Take-Home (${currency})"`,
    ...staffBreakdown.map(s => {
      const commStatus = `Paid: ${s.commissionPaid.toFixed(2)} / Pending: ${s.commissionPending.toFixed(2)}`;
      const tipStatus = `Paid: ${s.tipsPaid.toFixed(2)} / Pending: ${s.tipsPending.toFixed(2)}`;
      return [
        escapeCSV(s.name),
        escapeCSV(s.role),
        escapeCSV(s.servicesCount),
        escapeCSV(s.clientsCount),
        `"${s.serviceTotal.toFixed(2)}"`,
        `"${s.commission.toFixed(2)}"`,
        escapeCSV(commStatus),
        `"${s.tips.toFixed(2)}"`,
        escapeCSV(tipStatus),
        `"${s.totalTakeHome.toFixed(2)}"`
      ].join(',');
    }),
    `""`,
    `"====================================================================================================="`,
    `"4. SHIFT CLOSING RECONCILIATION & CASH DRAWER AUDIT"`,
    `"====================================================================================================="`,
    `"Closing Status",${escapeCSV(closing.status)}`,
    `"Submitted By",${escapeCSV(closing.submittedBy)}`,
    `"Closing Recorded Time",${escapeCSV(closing.timestamp || 'Not Submitted Yet')}`,
    `"Channel","System Expected (${currency})","Actual Counted (${currency})","Variance / Discrepancy (${currency})","Audit Result"`,
    `"Cash Drawer","${closing.expectedCash.toFixed(2)}","${closing.actualCash.toFixed(2)}","${closing.cashDiff.toFixed(2)}","${closing.cashDiff < 0 ? 'SHORTAGE' : (closing.cashDiff > 0 ? 'OVERAGE' : 'BALANCED')}"`,
    `"M-Pesa Statement / Till","${closing.expectedMpesa.toFixed(2)}","${closing.actualMpesa.toFixed(2)}","${closing.mpesaDiff.toFixed(2)}","${closing.mpesaDiff < 0 ? 'SHORTAGE' : (closing.mpesaDiff > 0 ? 'OVERAGE' : 'BALANCED')}"`,
    `"Total Drawer & Paybill Funds","${closing.expectedTotal.toFixed(2)}","${closing.actualTotal.toFixed(2)}","${closing.totalDiff.toFixed(2)}","${closing.totalDiff < 0 ? 'NET SHORTAGE' : (closing.totalDiff > 0 ? 'NET OVERAGE' : 'BALANCED')}"`,
    `"Closing Notes",${escapeCSV(closing.notes || 'None')}`,
    `""`,
    `"====================================================================================================="`,
    `"5. ITEMIZED TRANSACTION LEDGER FOR THE DAY"`,
    `"====================================================================================================="`,
    `"Receipt ID","Time","Client Name","Staff Member(s)","Services List","Payment Method","Cash Portion (${currency})","M-Pesa Portion (${currency})","Barber Tip (${currency})","Massage Tip (${currency})","Grand Total (${currency})","Recorded By"`,
    ...transactions.map(t => {
      const timeStr = t.timestamp ? new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      const staffList = [t.barberName, t.massageTherapistName].filter(Boolean).join(' & ') || 'Staff';
      const servicesStr = (t.services || []).map(s => s.name).join(' + ');
      const cAmt = t.cashAmount !== undefined ? Number(t.cashAmount) : (t.paymentMethod === 'Cash' ? Number(t.grandTotal) : 0);
      const mAmt = t.mpesaAmount !== undefined ? Number(t.mpesaAmount) : (t.paymentMethod === 'M-Pesa' ? Number(t.grandTotal) : 0);

      return [
        escapeCSV(t.id),
        escapeCSV(timeStr),
        escapeCSV(t.clientName || 'Walk-in Client'),
        escapeCSV(staffList),
        escapeCSV(servicesStr),
        escapeCSV(t.paymentMethod),
        `"${cAmt.toFixed(2)}"`,
        `"${mAmt.toFixed(2)}"`,
        `"${Number(t.barberTip || 0).toFixed(2)}"`,
        `"${Number(t.massageTip || 0).toFixed(2)}"`,
        `"${Number(t.grandTotal || 0).toFixed(2)}"`,
        escapeCSV(t.loggedByStaffName || '')
      ].join(',');
    })
  ];

  return lines.join('\n');
}

/**
 * Triggers direct browser download of the daily breakdown CSV
 */
export function downloadDailyBreakdownCSV(breakdownData) {
  const csvContent = generateDailyBreakdownCSV(breakdownData);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `The_Masters_Daily_Breakdown_${breakdownData.date}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}