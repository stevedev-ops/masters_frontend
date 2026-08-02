export const INITIAL_SERVICES = [
  { id: 'srv-1', name: 'Shaving', price: 250, category: 'Barber', icon: 'Scissors', description: 'Precision razor or clipper beard trim & shave with hot towel finish.' },
  { id: 'srv-2', name: 'Scrubbing', price: 200, category: 'Barber', icon: 'Sparkles', description: 'Deep scalp & face exfoliating scrub treatment.' },
  { id: 'srv-3', name: 'Dying', price: 200, category: 'Barber', icon: 'Palette', description: 'Beard & hair color enhancement or gray coverage.' },
  { id: 'srv-4', name: 'Bleaching', price: 600, category: 'Barber', icon: 'Sun', description: 'Hair & beard lightening & custom tone bleach treatment.' },
  { id: 'srv-5', name: 'Facial Treatment', price: 800, category: 'Spa & Skincare', icon: 'Smile', description: 'Deep cleansing, steaming, pore detox & soothing moisturization.' },
  { id: 'srv-6', name: 'Manicure', price: 100, category: 'Nail Care', icon: 'Hand', description: 'Nail shaping, cuticle grooming & buffing.' },
  { id: 'srv-7', name: 'Back Massage', price: 700, category: 'Massage & Bodywork', icon: 'Activity', description: 'Targeted deep tissue tension release for shoulders & back (30 mins).' },
  { id: 'srv-8', name: 'Full Body Massage', price: 1700, category: 'Massage & Bodywork', icon: 'Heart', description: 'Relaxing Swedish or deep tissue full body massage treatment (60 mins).' },
  { id: 'srv-9', name: 'Hot Stone Massage', price: 2700, category: 'Massage & Bodywork', icon: 'Flame', description: 'Luxury heated basalt stone therapy for muscular restoration (90 mins).' },
];

export const INITIAL_STAFF = [
  { id: 'stf-1', name: 'James', role: 'Barber', phone: '+254 712 345 678', active: true, title: 'Master Barber & Stylist' },
  { id: 'stf-2', name: 'David', role: 'Barber', phone: '+254 722 987 654', active: true, title: 'Senior Barber' },
  { id: 'stf-3', name: 'Sarah', role: 'Massage Therapist', phone: '+254 733 112 233', active: true, title: 'Lead Spa Therapist' },
  { id: 'stf-4', name: 'Grace', role: 'Massage Therapist', phone: '+254 744 556 677', active: true, title: 'Hot Stone Specialist' },
  { id: 'stf-5', name: 'Alex', role: 'Dual', phone: '+254 755 889 900', active: true, title: 'Grooming & Bodywork Specialist' },
];

const createTimestamp = (daysAgo, hour24) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour24, Math.floor(Math.random() * 50), 0, 0);
  return d.toISOString();
};

export const INITIAL_TRANSACTIONS = [
  {
    id: 'tx-101',
    timestamp: createTimestamp(0, 14),
    clientName: 'Michael K.',
    services: [
      { id: 'srv-9', name: 'Hot Stone Massage', price: 2700, category: 'Massage & Bodywork' },
      { id: 'srv-1', name: 'Shaving', price: 250, category: 'Barber' }
    ],
    loggedByStaffId: 'stf-3',
    loggedByStaffName: 'Sarah',
    barberId: 'stf-1',
    barberName: 'James',
    massageTherapistId: 'stf-3',
    massageTherapistName: 'Sarah',
    serviceTotal: 2950,
    barberTip: 150,
    massageTip: 350,
    grandTotal: 3450,
    paymentMethod: 'M-Pesa',
    barberTipPaid: true,
    massageTipPaid: false,
    notes: 'Hot stone therapy + beard trim.'
  },
  {
    id: 'tx-102',
    timestamp: createTimestamp(0, 15),
    clientName: 'Captain Daniel',
    services: [
      { id: 'srv-8', name: 'Full Body Massage', price: 1700, category: 'Massage & Bodywork' },
      { id: 'srv-5', name: 'Facial Treatment', price: 800, category: 'Spa & Skincare' }
    ],
    loggedByStaffId: 'stf-4',
    loggedByStaffName: 'Grace',
    barberId: null,
    barberName: null,
    massageTherapistId: 'stf-4',
    massageTherapistName: 'Grace',
    serviceTotal: 2500,
    barberTip: 0,
    massageTip: 500,
    grandTotal: 3000,
    paymentMethod: 'Cash',
    barberTipPaid: true,
    massageTipPaid: true,
    notes: 'Full spa package.'
  },
  {
    id: 'tx-103',
    timestamp: createTimestamp(0, 16),
    clientName: 'Brian M.',
    services: [
      { id: 'srv-1', name: 'Shaving', price: 250, category: 'Barber' },
      { id: 'srv-4', name: 'Bleaching', price: 600, category: 'Barber' },
      { id: 'srv-2', name: 'Scrubbing', price: 200, category: 'Barber' }
    ],
    loggedByStaffId: 'stf-2',
    loggedByStaffName: 'David',
    barberId: 'stf-2',
    barberName: 'David',
    massageTherapistId: null,
    massageTherapistName: null,
    serviceTotal: 1050,
    barberTip: 200,
    massageTip: 0,
    grandTotal: 1250,
    paymentMethod: 'Cash',
    barberTipPaid: false,
    massageTipPaid: true,
    notes: 'Full beard restyle & bleaching.'
  },
  {
    id: 'tx-104',
    timestamp: createTimestamp(0, 17),
    clientName: 'Hon. Otieno',
    services: [
      { id: 'srv-9', name: 'Hot Stone Massage', price: 2700, category: 'Massage & Bodywork' },
      { id: 'srv-5', name: 'Facial Treatment', price: 800, category: 'Spa & Skincare' },
      { id: 'srv-1', name: 'Shaving', price: 250, category: 'Barber' }
    ],
    loggedByStaffId: 'stf-3',
    loggedByStaffName: 'Sarah',
    barberId: 'stf-1',
    barberName: 'James',
    massageTherapistId: 'stf-3',
    massageTherapistName: 'Sarah',
    serviceTotal: 3750,
    barberTip: 250,
    massageTip: 500,
    grandTotal: 4500,
    paymentMethod: 'Cash',
    barberTipPaid: false,
    massageTipPaid: false,
    notes: 'VIP afternoon package.'
  }
];
