/**
 * Universal Commission & Shop Split Helpers
 * Rule: 40% of each service price goes to the direct provider, 60% is retained by the shop.
 * Tips: 100% goes directly to the respective provider.
 */

export const PROVIDER_COMMISSION_RATE = 0.40;
export const SHOP_RETENTION_RATE = 0.60;

export const isBarberCategory = (category) => {
  if (!category) return true;
  const c = category.toLowerCase();
  return c.includes('barber') || c.includes('shav') || c.includes('cut') || c.includes('hair');
};

/**
 * Calculates itemized breakdown for a single transaction.
 */
export const calculateTransactionBreakdown = (transaction) => {
  if (!transaction) {
    return {
      serviceTotal: 0,
      barberServiceTotal: 0,
      barberCommission: 0,
      barberCommissionPaid: false,
      barberTip: 0,
      barberTipPaid: false,
      barberTotal: 0,
      massageServiceTotal: 0,
      massageCommission: 0,
      massageCommissionPaid: false,
      massageTip: 0,
      massageTipPaid: false,
      massageTotal: 0,
      totalCommissions: 0,
      totalTips: 0,
      shopGrossRetained: 0,
      grandTotal: 0,
    };
  }

  const services = transaction.services || [];
  const serviceTotal = Number(transaction.serviceTotal || 0) || services.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  const barberTip = Number(transaction.barberTip || 0);
  const massageTip = Number(transaction.massageTip || 0);
  const barberTipPaid = Boolean(transaction.barberTipPaid);
  const massageTipPaid = Boolean(transaction.massageTipPaid);
  const barberCommissionPaid = Boolean(transaction.barberCommissionPaid);
  const massageCommissionPaid = Boolean(transaction.massageCommissionPaid);

  const hasBarber = Boolean(transaction.barberId);
  const hasMassage = Boolean(transaction.massageTherapistId);

  let barberServices = [];
  let massageServices = [];

  if (hasBarber && hasMassage) {
    // Both providers assigned: split by service category
    barberServices = services.filter(s => isBarberCategory(s.category));
    massageServices = services.filter(s => !isBarberCategory(s.category));

    // Fallback if categories didn't match cleanly
    if (barberServices.length === 0 && massageServices.length === 0 && services.length > 0) {
      const half = serviceTotal / 2;
      return {
        serviceTotal,
        barberServiceTotal: half,
        barberCommission: half * PROVIDER_COMMISSION_RATE,
        barberCommissionPaid,
        barberTip,
        barberTipPaid,
        barberTotal: (half * PROVIDER_COMMISSION_RATE) + barberTip,
        massageServiceTotal: half,
        massageCommission: half * PROVIDER_COMMISSION_RATE,
        massageCommissionPaid,
        massageTip,
        massageTipPaid,
        massageTotal: (half * PROVIDER_COMMISSION_RATE) + massageTip,
        totalCommissions: serviceTotal * PROVIDER_COMMISSION_RATE,
        totalTips: barberTip + massageTip,
        shopGrossRetained: serviceTotal * SHOP_RETENTION_RATE,
        grandTotal: Number(transaction.grandTotal || (serviceTotal + barberTip + massageTip)),
      };
    }
  } else if (hasBarber) {
    barberServices = services;
  } else if (hasMassage) {
    massageServices = services;
  }

  const barberServiceTotal = hasBarber 
    ? (barberServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0) || (hasMassage ? 0 : serviceTotal))
    : 0;

  const massageServiceTotal = hasMassage
    ? (massageServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0) || (hasBarber ? 0 : serviceTotal))
    : 0;

  const barberCommission = barberServiceTotal * PROVIDER_COMMISSION_RATE;
  const massageCommission = massageServiceTotal * PROVIDER_COMMISSION_RATE;
  const totalCommissions = barberCommission + massageCommission;
  const shopGrossRetained = serviceTotal * SHOP_RETENTION_RATE;

  return {
    serviceTotal,
    barberServiceTotal,
    barberCommission,
    barberCommissionPaid,
    barberTip,
    barberTipPaid,
    barberTotal: barberCommission + barberTip,
    massageServiceTotal,
    massageCommission,
    massageCommissionPaid,
    massageTip,
    massageTipPaid,
    massageTotal: massageCommission + massageTip,
    totalCommissions,
    totalTips: barberTip + massageTip,
    shopGrossRetained,
    grandTotal: Number(transaction.grandTotal || (serviceTotal + barberTip + massageTip)),
    barberServices,
    massageServices
  };
};

/**
 * Gets a specific staff member's portion and earnings for a single transaction.
 */
export const getStaffTransactionShare = (transaction, staffId) => {
  if (!transaction || !staffId) {
    return {
      isAssigned: false,
      roleInTx: null,
      serviceTotal: 0,
      commission: 0,
      isCommissionPaid: false,
      tip: 0,
      isTipPaid: false,
      totalTakeHome: 0,
      servicesDone: []
    };
  }

  const isBarber = transaction.barberId === staffId;
  const isMassage = transaction.massageTherapistId === staffId;

  if (!isBarber && !isMassage) {
    return {
      isAssigned: false,
      roleInTx: null,
      serviceTotal: 0,
      commission: 0,
      isCommissionPaid: false,
      tip: 0,
      isTipPaid: false,
      totalTakeHome: 0,
      servicesDone: []
    };
  }

  const breakdown = calculateTransactionBreakdown(transaction);
  let myServiceTotal = 0;
  let myCommission = 0;
  let isCommissionPaid = false;
  let myTip = 0;
  let isTipPaid = false;
  let servicesDone = [];
  let roleInTx = '';

  if (isBarber && isMassage) {
    myServiceTotal = breakdown.serviceTotal;
    myCommission = breakdown.totalCommissions;
    isCommissionPaid = breakdown.barberCommissionPaid && breakdown.massageCommissionPaid;
    myTip = breakdown.totalTips;
    isTipPaid = breakdown.barberTipPaid && breakdown.massageTipPaid;
    servicesDone = transaction.services || [];
    roleInTx = 'Barber & Therapist';
  } else if (isBarber) {
    myServiceTotal = breakdown.barberServiceTotal;
    myCommission = breakdown.barberCommission;
    isCommissionPaid = breakdown.barberCommissionPaid;
    myTip = breakdown.barberTip;
    isTipPaid = breakdown.barberTipPaid;
    servicesDone = breakdown.barberServices && breakdown.barberServices.length > 0 
      ? breakdown.barberServices 
      : (transaction.services || []);
    roleInTx = 'Barber';
  } else if (isMassage) {
    myServiceTotal = breakdown.massageServiceTotal;
    myCommission = breakdown.massageCommission;
    isCommissionPaid = breakdown.massageCommissionPaid;
    myTip = breakdown.massageTip;
    isTipPaid = breakdown.massageTipPaid;
    servicesDone = breakdown.massageServices && breakdown.massageServices.length > 0 
      ? breakdown.massageServices 
      : (transaction.services || []);
    roleInTx = 'Massage Therapist';
  }

  return {
    isAssigned: true,
    roleInTx,
    serviceTotal: myServiceTotal,
    commission: myCommission,
    isCommissionPaid,
    tip: myTip,
    isTipPaid,
    totalTakeHome: myCommission + myTip,
    servicesDone
  };
};
