/**
 * Universal Date Range Calculator for The Masters Boss Intelligence
 */
export function getDateRange(preset = 'this_month', customStart = '', customEnd = '') {
  const now = new Date();
  
  const getStartOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const getEndOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  if (preset === 'today') {
    const start = getStartOfDay(now);
    const end = getEndOfDay(now);
    const priorStart = new Date(start);
    priorStart.setDate(start.getDate() - 1);
    const priorEnd = new Date(end);
    priorEnd.setDate(end.getDate() - 1);

    return {
      start,
      end,
      label: 'Today',
      priorStart,
      priorEnd,
      priorLabel: 'Yesterday'
    };
  }

  if (preset === 'this_week') {
    const curr = new Date(now);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const startOfWeek = new Date(curr.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const priorStart = new Date(startOfWeek);
    priorStart.setDate(startOfWeek.getDate() - 7);
    const priorEnd = new Date(endOfWeek);
    priorEnd.setDate(endOfWeek.getDate() - 7);

    return {
      start: startOfWeek,
      end: endOfWeek,
      label: 'This Week',
      priorStart,
      priorEnd,
      priorLabel: 'Last Week'
    };
  }

  if (preset === 'this_month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const priorStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const priorEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const monthName = now.toLocaleString('default', { month: 'short' });
    const priorMonthName = priorStart.toLocaleString('default', { month: 'short' });

    return {
      start,
      end,
      label: `This Month (${monthName})`,
      priorStart,
      priorEnd,
      priorLabel: `Last Month (${priorMonthName})`
    };
  }

  if (preset === 'last_month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const priorStart = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
    const priorEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
    const monthName = start.toLocaleString('default', { month: 'short', year: 'numeric' });
    const priorMonthName = priorStart.toLocaleString('default', { month: 'short', year: 'numeric' });

    return {
      start,
      end,
      label: `Last Month (${monthName})`,
      priorStart,
      priorEnd,
      priorLabel: `Prior (${priorMonthName})`
    };
  }

  if (preset === 'this_year') {
    const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    const priorStart = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
    const priorEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);

    return {
      start,
      end,
      label: `This Year (${now.getFullYear()})`,
      priorStart,
      priorEnd,
      priorLabel: `Last Year (${now.getFullYear() - 1})`
    };
  }

  if (preset === 'last_year') {
    const start = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
    const priorStart = new Date(now.getFullYear() - 2, 0, 1, 0, 0, 0, 0);
    const priorEnd = new Date(now.getFullYear() - 2, 11, 31, 23, 59, 59, 999);

    return {
      start,
      end,
      label: `Last Year (${now.getFullYear() - 1})`,
      priorStart,
      priorEnd,
      priorLabel: `Year (${now.getFullYear() - 2})`
    };
  }

  if (preset === 'custom' && customStart && customEnd) {
    const start = new Date(customStart + 'T00:00:00');
    const end = new Date(customEnd + 'T23:59:59');
    const duration = end.getTime() - start.getTime();
    const priorStart = new Date(start.getTime() - duration);
    const priorEnd = new Date(start.getTime() - 1);

    return {
      start,
      end,
      label: `${customStart} → ${customEnd}`,
      priorStart,
      priorEnd,
      priorLabel: 'Prior Period'
    };
  }

  // All time
  return {
    start: new Date(2020, 0, 1),
    end: new Date(2035, 11, 31),
    label: 'All Time Total',
    priorStart: null,
    priorEnd: null,
    priorLabel: 'Baseline'
  };
}

/**
 * Filter an array of objects by timestamp between start and end
 */
export function filterItemsByDate(items = [], start, end, field = 'timestamp') {
  if (!items || !items.length) return [];
  const sTime = start.getTime();
  const eTime = end.getTime();

  return items.filter(item => {
    const val = item[field] || item.createdAt || item.date;
    if (!val) return true;
    const tTime = new Date(val).getTime();
    return tTime >= sTime && tTime <= eTime;
  });
}
