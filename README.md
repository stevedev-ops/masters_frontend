# The Masters - Barber & Executive Spa Web Application

A modern, responsive, high-end web application built for **The Masters Barber & Spa**. Features a luxury Customer Landing & Booking Portal, a dedicated Staff Activity Entry & Private Tip Dashboard, and a comprehensive Boss Executive Dashboard.

## 💈 Features

### 🌟 Public Customer View
- Luxury Onyx & Metallic Gold UI theme with responsive glassmorphism styling.
- Complete activity menu with transparent catalog prices (Shaving 250, Scrubbing 200, Dying 200, Bleaching 600, Facial Treatment 800, Manicure 100, Back Massage 700, Full Body Massage 1700, Hot Stone Massage 2700).
- Interactive appointment booking modal.

### 📱 Staff Activity & Private Tip Portal
- Touch-friendly activity logger supporting multi-service line items per visit.
- **Dual Tip Splits**: Independent tip allocation for Barber, Massage Therapist ("Massage Girl"), or Both.
- **Payment Method Channels**: Cash, M-Pesa, and Card transaction logging.
- **Private Staff Dashboard**: Staff members select their profile to view ONLY their personal tips earned, paid vs pending tip payout tabs, and session history.
- **Tip Privacy Enforcement**: In multi-staff transactions, each staff member sees ONLY their own tip portion.
- **Automated Shift Closing (Cash & M-Pesa)**: Staff perform end-of-shift reconciliation with real-time Cash drawer & M-Pesa paybill shortage discrepancy badges.
- **Logger Attribution**: Every logged session records `loggedByStaffName` and timestamp.

### 👑 Boss / Owner Dashboard
- **Current Month Overview**: Clean default view showing ongoing sales, pure service revenue, tip totals, and M-Pesa vs Cash breakdowns.
- **On-Demand Compare Mode**: Optional mode to compare performance across "This Month vs Last Month", "This Week vs Last Week", or "Today vs Yesterday" with % growth badges.
- **Executive Reports & Intelligence**: Leaderboards for Best-Performing Barber, Best-Performing Therapist, Most Popular Service, and Peak Business Hours hourly heatmap.
- **Tip Payoff Manager**: Tick off individual tips or pay off all pending tip balances owed to team members.
- **Staff & Price Management**: Boss can add staff, assign roles (Barber, Massage Therapist, Dual), and set service prices.
- **Audit Ledger & CSV Export**: Searchable audit ledger showing submission attribution, timestamps, and CSV export.

---

## 🛠️ Tech Stack
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Custom Glassmorphic Dark Luxury Theme
- **Icons**: Lucide React
- **Persistence**: LocalStorage with auto-seeding mock history

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone git@github.com:stevedev-ops/masters.git

# Install dependencies
npm install

# Start development server
npm run dev
```
