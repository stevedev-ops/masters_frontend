import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_SERVICES, INITIAL_STAFF, INITIAL_TRANSACTIONS } from '../data/initialData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Current active portal view: 'customer' | 'staff' | 'boss'
  const [currentView, setCurrentView] = useState('boss');
  
  // Currency symbol (e.g. KSh / R / $)
  const [currency, setCurrency] = useState('KSh');

  // Persistent States with LocalStorage fallback
  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('masters_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [staff, setStaff] = useState(() => {
    const saved = localStorage.getItem('masters_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('masters_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [closingRecords, setClosingRecords] = useState(() => {
    const saved = localStorage.getItem('masters_closing_records');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('masters_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('masters_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('masters_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('masters_closing_records', JSON.stringify(closingRecords));
  }, [closingRecords]);

  // --- ACTIONS ---

  // Log a new completed service transaction from Staff Portal
  const addTransaction = (newTxData) => {
    const newTx = {
      id: `tx-${Date.now()}`,
      timestamp: new Date().toISOString(),
      barberTipPaid: false, // Default tip starts as unpaid until Boss pays off
      massageTipPaid: false,
      ...newTxData,
    };
    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  // Save closing reconciliation record
  const saveClosingRecord = (record) => {
    const newRecord = {
      id: `close-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...record
    };
    setClosingRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  // Boss Toggles tip paid off status
  const toggleTipPayoff = (txId, tipType) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === txId) {
          if (tipType === 'barber') {
            return { ...tx, barberTipPaid: !tx.barberTipPaid };
          }
          if (tipType === 'massage') {
            return { ...tx, massageTipPaid: !tx.massageTipPaid };
          }
        }
        return tx;
      })
    );
  };

  // Boss Marks all unpaid tips for a specific staff member as paid
  const payOffAllStaffTips = (staffId) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        let updated = { ...tx };
        if (tx.barberId === staffId && !tx.barberTipPaid) {
          updated.barberTipPaid = true;
        }
        if (tx.massageTherapistId === staffId && !tx.massageTipPaid) {
          updated.massageTipPaid = true;
        }
        return updated;
      })
    );
  };

  // Boss Adds new staff member & gives them role
  const addStaff = (staffData) => {
    const newMember = {
      id: `stf-${Date.now()}`,
      active: true,
      ...staffData,
    };
    setStaff((prev) => [...prev, newMember]);
    return newMember;
  };

  // Boss updates staff member
  const updateStaff = (staffId, updatedFields) => {
    setStaff((prev) =>
      prev.map((member) => (member.id === staffId ? { ...member, ...updatedFields } : member))
    );
  };

  // Toggle staff active status
  const toggleStaffStatus = (staffId) => {
    setStaff((prev) =>
      prev.map((member) => (member.id === staffId ? { ...member, active: !member.active } : member))
    );
  };

  // Boss Adds new service to catalog
  const addService = (serviceData) => {
    const newSrv = {
      id: `srv-${Date.now()}`,
      ...serviceData,
    };
    setServices((prev) => [...prev, newSrv]);
  };

  // Boss Updates service pricing or description
  const updateService = (serviceId, updatedFields) => {
    setServices((prev) =>
      prev.map((srv) => (srv.id === serviceId ? { ...srv, ...updatedFields } : srv))
    );
  };

  // Delete transaction
  const deleteTransaction = (txId) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== txId));
  };

  // Reset to initial demo data
  const resetDemoData = () => {
    setServices(INITIAL_SERVICES);
    setStaff(INITIAL_STAFF);
    setTransactions(INITIAL_TRANSACTIONS);
    setClosingRecords([]);
    localStorage.removeItem('masters_services');
    localStorage.removeItem('masters_staff');
    localStorage.removeItem('masters_transactions');
    localStorage.removeItem('masters_closing_records');
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        currency,
        setCurrency,
        services,
        staff,
        transactions,
        closingRecords,
        addTransaction,
        saveClosingRecord,
        toggleTipPayoff,
        payOffAllStaffTips,
        addStaff,
        updateStaff,
        toggleStaffStatus,
        addService,
        updateService,
        deleteTransaction,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
