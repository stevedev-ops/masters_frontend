import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Scissors, Sparkles, Heart, Activity, Hand, Sun, Palette, Smile, Flame, 
  Clock, CheckCircle, Calendar, Star, PhoneCall, ShieldCheck, MapPin, ChevronRight
} from 'lucide-react';

const ICON_MAP = {
  Scissors: Scissors,
  Sparkles: Sparkles,
  Palette: Palette,
  Sun: Sun,
  Smile: Smile,
  Hand: Hand,
  Activity: Activity,
  Heart: Heart,
  Flame: Flame,
};

export default function CustomerView() {
  const { services, staff, currency, setCurrentView, createAppointment } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookingService, setBookingService] = useState(null);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Booking Form State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredStaffId, setPreferredStaffId] = useState('');

  const categories = ['All', 'Barber', 'Massage & Bodywork', 'Spa & Skincare', 'Nail Care'];

  const filteredServices = selectedCategory === 'All'
    ? services
    : services.filter(s => s.category === selectedCategory);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Please provide your full name and phone number.');
      return;
    }

    setIsSubmitting(true);
    const selectedStaffObj = staff.find(s => s.id === preferredStaffId);

    const bookingPayload = {
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      serviceId: bookingService ? bookingService.id : null,
      serviceName: bookingService ? bookingService.name : 'Executive Treatment',
      serviceCategory: bookingService ? (bookingService.category || 'Barber') : '',
      servicePrice: bookingService ? bookingService.price : 0,
      preferredDate: preferredDate || new Date().toISOString().slice(0, 10),
      preferredStaffId: selectedStaffObj ? selectedStaffObj.id : null,
      preferredStaffName: selectedStaffObj ? selectedStaffObj.name : null,
      // If customer requested a specific person, pre-assign them; otherwise keep unassigned in the pool
      assignedStaffId: selectedStaffObj ? selectedStaffObj.id : null,
      assignedStaffName: selectedStaffObj ? selectedStaffObj.name : null,
      status: 'pending',
    };

    try {
      await createAppointment(bookingPayload);
    } catch (err) {
      console.warn('Booking creation warning:', err.message);
    }

    setIsSubmitting(false);
    setBookingSubmitted(true);
    setTimeout(() => {
      setBookingSubmitted(false);
      setBookingService(null);
      setClientName('');
      setClientPhone('');
      setPreferredDate('');
      setPreferredStaffId('');
    }, 3500);
  };

  return (
    <div className="space-y-6 sm:space-y-12 pb-4 sm:pb-8">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-6 sm:pt-10 pb-8 sm:pb-14 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-slate-950/80 to-slate-950 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-5 sm:space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span>VIP Grooming & Bodywork Lounge</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-tight">
            Elevate Your Style & Wellness at <br />
            <span className="gold-gradient-text">THE MASTERS</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto font-light leading-relaxed px-2 sm:px-0">
            Experience premium barber craftsmanship, soothing facial care, and world-class hot stone & full body massage therapies in an atmosphere of refined luxury.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-3 sm:pt-4 w-full max-w-md mx-auto sm:max-w-none px-4 sm:px-0">
            <a 
              href="#services"
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold text-sm sm:text-base shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <span>Explore Services & Pricing</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>

            <a 
              href="#services"
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl glass-card text-amber-300 font-semibold text-sm sm:text-base hover:bg-slate-800/80 border border-amber-500/30 hover:border-amber-500 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <span>Book an Appointment</span>
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </a>
          </div>

          {/* Quick Badges */}
          <div className="pt-4 sm:pt-8 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 max-w-4xl mx-auto text-left">
            <div className="p-3 sm:p-4 rounded-2xl glass-card border border-slate-800 flex items-center space-x-2.5 sm:space-x-3">
              <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Master Artisans</h4>
                <p className="text-[10px] sm:text-xs text-slate-400">Certified Specialists</p>
              </div>
            </div>
            <div className="p-3 sm:p-4 rounded-2xl glass-card border border-slate-800 flex items-center space-x-2.5 sm:space-x-3">
              <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Hot Stone Therapy</h4>
                <p className="text-[10px] sm:text-xs text-slate-400">Premium Relaxation</p>
              </div>
            </div>
            <div className="p-3 sm:p-4 rounded-2xl glass-card border border-slate-800 flex items-center space-x-2.5 sm:space-x-3">
              <Star className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Transparent Pricing</h4>
                <p className="text-[10px] sm:text-xs text-slate-400">No Hidden Costs</p>
              </div>
            </div>
            <div className="p-3 sm:p-4 rounded-2xl glass-card border border-slate-800 flex items-center space-x-2.5 sm:space-x-3">
              <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Executive Lounge</h4>
                <p className="text-[10px] sm:text-xs text-slate-400">Prime Location</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SERVICE MENU & CATALOG */}
      <section id="services" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        
        <div className="text-center space-y-2 sm:space-y-3">
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
            Our Signature <span className="gold-gradient-text">Services & Menu</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-base max-w-xl mx-auto">
            Browse our catalog of expert barbering, skincare, and relaxation massage therapies.
          </p>
        </div>

        {/* Category Filter Pills: Horizontally scrollable on mobile */}
        <div className="flex items-center overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap sm:justify-center gap-2 sm:gap-3 scrollbar-none px-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredServices.map((srv) => {
            const IconComponent = ICON_MAP[srv.icon] || Scissors;
            return (
              <div 
                key={srv.id}
                className="glass-card glass-card-hover rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-5 sm:space-y-6 relative overflow-hidden group"
              >
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {srv.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                      {srv.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1.5 sm:mt-2 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 sm:pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] sm:text-xs text-slate-500 block uppercase font-medium">Standard Price</span>
                    <span className="text-xl sm:text-2xl font-bold font-serif gold-gradient-text">
                      {currency} {srv.price.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => setBookingService(srv)}
                    className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400 text-xs font-bold border border-amber-500/30 active:scale-95 transition-all flex items-center space-x-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Book</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* STAFF SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        <div className="text-center space-y-2 sm:space-y-3">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Meet Our <span className="gold-gradient-text">Master Artisans</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Dedicated barbers and spa massage therapists committed to your satisfaction.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {staff.map((st) => (
            <div key={st.id} className="glass-card rounded-2xl p-4 sm:p-5 text-center space-y-3 sm:space-y-4 border border-slate-800">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-bold text-lg sm:text-xl flex items-center justify-center mx-auto shadow-md">
                {st.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm sm:text-lg font-bold text-white">{st.name}</h4>
                <p className="text-[11px] sm:text-xs text-amber-400 font-medium">{st.title || st.role}</p>
              </div>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] sm:text-xs text-slate-400 flex items-center justify-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Active Today</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* VIP LUXURY AMBIENCE PROMISE */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-xl sm:rounded-3xl p-4 sm:p-8 border border-amber-500/30 text-center space-y-2.5 sm:space-y-4 relative overflow-hidden">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mx-auto shadow-lg">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>

          <h3 className="text-2xl sm:text-4xl font-serif font-bold text-white max-w-xl mx-auto leading-tight">
            The Executive Standard in Personal Care
          </h3>

          <p className="text-slate-300 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed font-light">
            Every appointment includes complimentary premium hot towel service, scalp massage finish, and selection of executive hot beverages in our private client lounge.
          </p>
        </div>
      </section>

      {/* BOOKING MODAL */}
      {bookingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel max-w-lg w-full rounded-3xl p-5 sm:p-8 space-y-5 sm:space-y-6 border border-amber-500/30 relative max-h-[90vh] overflow-y-auto my-auto shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">Request Appointment</h3>
                <p className="text-xs text-amber-400 font-medium">{bookingService.name} - {currency} {bookingService.price}</p>
              </div>
              <button 
                onClick={() => setBookingService(null)}
                className="text-slate-400 hover:text-white p-2 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {bookingSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle className="w-14 h-14 sm:w-16 sm:h-16 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-xl sm:text-2xl font-bold text-white">Appointment Request Sent!</h4>
                <p className="text-xs text-slate-300">
                  Thank you <strong>{clientName}</strong>. Your request for <strong>{bookingService.name}</strong> has been saved. Our team will contact you shortly to confirm your schedule.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="e.g. 0712 345 678"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Preferred Date</label>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Preferred Specialist</label>
                    <select
                      value={preferredStaffId}
                      onChange={(e) => setPreferredStaffId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Any Available Specialist</option>
                      {staff.filter(s => s.active).map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving Booking...' : 'Confirm Appointment Request'}</span>
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
