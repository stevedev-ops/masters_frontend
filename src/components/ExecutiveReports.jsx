import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Trophy, Award, Flame, Clock, BarChart3, PieChart, Users, Scissors, 
  Heart, Sparkles, TrendingUp, ChevronRight 
} from 'lucide-react';

export default function ExecutiveReports() {
  const { transactions, staff, services, currency } = useApp();

  // 1. BEST-PERFORMING BARBER
  const bestBarber = useMemo(() => {
    const barberStats = {};
    staff.filter(s => s.role === 'Barber' || s.role === 'Dual').forEach(b => {
      barberStats[b.id] = { id: b.id, name: b.name, revenue: 0, tips: 0, count: 0 };
    });

    transactions.forEach(t => {
      if (t.barberId && barberStats[t.barberId]) {
        // Estimate revenue from barber services in transaction
        const barberServicesTotal = t.services
          .filter(s => s.category === 'Barber')
          .reduce((sum, s) => sum + s.price, 0) || (t.serviceTotal / 2);
        
        barberStats[t.barberId].revenue += barberServicesTotal;
        barberStats[t.barberId].tips += (t.barberTip || 0);
        barberStats[t.barberId].count += 1;
      }
    });

    const sorted = Object.values(barberStats).sort((a, b) => b.revenue - a.revenue);
    return { top: sorted[0] || null, list: sorted };
  }, [staff, transactions]);

  // 2. BEST-PERFORMING THERAPIST
  const bestTherapist = useMemo(() => {
    const therapistStats = {};
    staff.filter(s => s.role === 'Massage Therapist' || s.role === 'Dual').forEach(m => {
      therapistStats[m.id] = { id: m.id, name: m.name, revenue: 0, tips: 0, count: 0 };
    });

    transactions.forEach(t => {
      if (t.massageTherapistId && therapistStats[t.massageTherapistId]) {
        const spaServicesTotal = t.services
          .filter(s => s.category !== 'Barber')
          .reduce((sum, s) => sum + s.price, 0) || (t.serviceTotal / 2);

        therapistStats[t.massageTherapistId].revenue += spaServicesTotal;
        therapistStats[t.massageTherapistId].tips += (t.massageTip || 0);
        therapistStats[t.massageTherapistId].count += 1;
      }
    });

    const sorted = Object.values(therapistStats).sort((a, b) => b.revenue - a.revenue);
    return { top: sorted[0] || null, list: sorted };
  }, [staff, transactions]);

  // 3. MOST POPULAR SERVICES & REVENUE BY SERVICE
  const serviceStats = useMemo(() => {
    const stats = {};
    services.forEach(srv => {
      stats[srv.id] = { id: srv.id, name: srv.name, count: 0, revenue: 0, category: srv.category, price: srv.price };
    });

    transactions.forEach(t => {
      t.services.forEach(srv => {
        if (stats[srv.id]) {
          stats[srv.id].count += 1;
          stats[srv.id].revenue += srv.price;
        }
      });
    });

    const sortedByCount = Object.values(stats).sort((a, b) => b.count - a.count);
    const sortedByRevenue = Object.values(stats).sort((a, b) => b.revenue - a.revenue);

    return {
      mostPopular: sortedByCount[0] || null,
      byCount: sortedByCount,
      byRevenue: sortedByRevenue
    };
  }, [services, transactions]);

  // 4. PEAK BUSINESS HOURS
  const hourlyStats = useMemo(() => {
    const hoursMap = {};
    for (let h = 8; h <= 21; h++) {
      hoursMap[h] = { hour: h, count: 0, revenue: 0 };
    }

    transactions.forEach(t => {
      const h = new Date(t.timestamp).getHours();
      if (hoursMap[h]) {
        hoursMap[h].count += 1;
        hoursMap[h].revenue += t.grandTotal;
      }
    });

    const list = Object.values(hoursMap);
    const peakHour = [...list].sort((a, b) => b.count - a.count)[0];
    const maxCount = Math.max(...list.map(l => l.count), 1);

    return { list, peakHour, maxCount };
  }, [transactions]);

  // 5. REVENUE BY STAFF MEMBER (COMBINED)
  const staffRevenueList = useMemo(() => {
    const map = {};
    staff.forEach(s => {
      map[s.id] = { id: s.id, name: s.name, role: s.role, totalRevenue: 0, totalTips: 0, count: 0 };
    });

    transactions.forEach(t => {
      if (t.barberId && map[t.barberId]) {
        map[t.barberId].totalRevenue += (t.serviceTotal / 2);
        map[t.barberId].totalTips += (t.barberTip || 0);
        map[t.barberId].count += 1;
      }
      if (t.massageTherapistId && map[t.massageTherapistId]) {
        map[t.massageTherapistId].totalRevenue += (t.serviceTotal / 2);
        map[t.massageTherapistId].totalTips += (t.massageTip || 0);
        map[t.massageTherapistId].count += 1;
      }
    });

    return Object.values(map).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [staff, transactions]);

  const formatHourLabel = (h) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH} ${period}`;
  };

  return (
    <div className="space-y-8">
      
      {/* SECTION TITLE */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <span>Executive Business Analytics & Performance Reports</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify top performers, peak customer hours, and highest revenue services.
          </p>
        </div>
      </div>

      {/* TOP PERFORMERS BADGES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 🏆 Best Barber */}
        <div className="glass-card rounded-3xl p-6 border border-amber-500/30 relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 uppercase">
              Best Barber
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white">
              {bestBarber.top ? bestBarber.top.name : 'N/A'}
            </h3>
            <p className="text-xs text-amber-400 font-medium mt-0.5">
              {bestBarber.top ? `${bestBarber.top.count} sessions completed` : ''}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-between text-xs">
            <span className="text-slate-400">Services Revenue:</span>
            <span className="font-bold font-serif gold-gradient-text">
              {currency} {bestBarber.top ? bestBarber.top.revenue.toLocaleString() : 0}
            </span>
          </div>
        </div>

        {/* 💆‍♀️ Best Massage Therapist */}
        <div className="glass-card rounded-3xl p-6 border border-amber-500/30 relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/40">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 uppercase">
              Best Therapist
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white">
              {bestTherapist.top ? bestTherapist.top.name : 'N/A'}
            </h3>
            <p className="text-xs text-pink-300 font-medium mt-0.5">
              {bestTherapist.top ? `${bestTherapist.top.count} sessions completed` : ''}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-between text-xs">
            <span className="text-slate-400">Services Revenue:</span>
            <span className="font-bold font-serif gold-gradient-text">
              {currency} {bestTherapist.top ? bestTherapist.top.revenue.toLocaleString() : 0}
            </span>
          </div>
        </div>

        {/* 🔥 Most Popular Service */}
        <div className="glass-card rounded-3xl p-6 border border-amber-500/30 relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/40">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 uppercase">
              Most Popular
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white truncate">
              {serviceStats.mostPopular ? serviceStats.mostPopular.name : 'N/A'}
            </h3>
            <p className="text-xs text-yellow-300 font-medium mt-0.5">
              Booked {serviceStats.mostPopular ? serviceStats.mostPopular.count : 0} times
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-between text-xs">
            <span className="text-slate-400">Total Generated:</span>
            <span className="font-bold font-serif gold-gradient-text">
              {currency} {serviceStats.mostPopular ? serviceStats.mostPopular.revenue.toLocaleString() : 0}
            </span>
          </div>
        </div>

      </div>

      {/* ⏰ PEAK BUSINESS HOURS HEATMAP / HOURLY BAR CHART */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Peak Business Hours Chart
            </h3>
          </div>
          {hourlyStats.peakHour && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Peak Hours: {formatHourLabel(hourlyStats.peakHour.hour)} ({hourlyStats.peakHour.count} visits)
            </span>
          )}
        </div>

        <div className="pt-4 grid grid-cols-7 sm:grid-cols-14 gap-2 items-end h-44">
          {hourlyStats.list.map(item => {
            const heightPct = Math.max(10, Math.round((item.count / hourlyStats.maxCount) * 100));
            const isPeak = hourlyStats.peakHour && item.hour === hourlyStats.peakHour.hour;
            return (
              <div key={item.hour} className="flex flex-col items-center h-full justify-end group">
                <span className="text-[10px] text-amber-300 opacity-0 group-hover:opacity-100 font-bold transition-opacity mb-1">
                  {item.count}
                </span>
                <div 
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-t-lg transition-all ${
                    isPeak
                      ? 'bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-300 shadow-md shadow-amber-500/30'
                      : 'bg-slate-800 hover:bg-amber-500/50'
                  }`}
                />
                <span className="text-[10px] text-slate-400 mt-2 font-medium">
                  {formatHourLabel(item.hour).replace(' ', '')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* REVENUE BY SERVICE & REVENUE BY STAFF */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Revenue by Service */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-amber-400" />
            <span>Revenue Breakdown by Service</span>
          </h3>

          <div className="space-y-3">
            {serviceStats.byRevenue.map((srv) => {
              const maxRev = serviceStats.byRevenue[0]?.revenue || 1;
              const pct = Math.round((srv.revenue / maxRev) * 100);
              return (
                <div key={srv.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">{srv.name} ({srv.count}x)</span>
                    <span className="font-bold font-serif gold-gradient-text">
                      {currency} {srv.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      style={{ width: `${pct}%` }} 
                      className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 rounded-full" 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue by Staff Member */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Revenue Breakdown by Staff Member</span>
          </h3>

          <div className="space-y-3">
            {staffRevenueList.map((st) => {
              const maxRev = staffRevenueList[0]?.totalRevenue || 1;
              const pct = Math.round((st.totalRevenue / maxRev) * 100);
              return (
                <div key={st.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">
                      {st.name} ({st.role})
                    </span>
                    <span className="font-bold text-amber-300">
                      {currency} {st.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      style={{ width: `${pct}%` }} 
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full" 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
