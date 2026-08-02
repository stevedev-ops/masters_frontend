import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  const { services, staff, currency, setCurrentView } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookingService, setBookingService] = useState(null);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  // Booking Form State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredStaff, setPreferredStaff] = useState('');

  const categories = ['All', 'Barber', 'Massage & Bodywork', 'Spa & Skincare', 'Nail Care'];

  const filteredServices = selectedCategory === 'All'
    ? services
    : services.filter(s => s.category === selectedCategory);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setBookingSubmitted(true);
    setTimeout(() => {
      setBookingSubmitted(false);
      setBookingService(null);
      setClientName('');
      setClientPhone('');
    }, 3000);
  };

  return (
    <div className="space-y-16 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-slate-950/80 to-slate-950 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>VIP Grooming & Bodywork Lounge</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-white leading-tight">
            Elevate Your Style & Wellness at <br />
            <span className="gold-gradient-text">THE MASTERS</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Experience premium barber craftsmanship, soothing facial care, and world-class hot stone & full body massage therapies in an atmosphere of refined luxury.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a 
              href="#services"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/25 hover:scale-105 transition-all flex items-center space-x-2"
            >
              <span>Explore Services & Pricing</span>
              <ChevronRight className="w-5 h-5" />
            </a>

            <button 
              onClick={() => setCurrentView('staff')}
              className="px-8 py-4 rounded-2xl glass-card text-amber-300 font-semibold text-base hover:bg-slate-800/80 border border-amber-500/30 hover:border-amber-500 transition-all flex items-center space-x-2"
            >
              <span>Staff Entry Portal</span>
              <PhoneCall className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Badges */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl glass-card border border-slate-800 flex items-center space-x-3">
              <ShieldCheck className="w-8 h-8 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">Master Artisans</h4>
                <p className="text-xs text-slate-400">Certified Specialists</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-slate-800 flex items-center space-x-3">
              <Flame className="w-8 h-8 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">Hot Stone Therapy</h4>
                <p className="text-xs text-slate-400">Premium Relaxation</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-slate-800 flex items-center space-x-3">
              <Star className="w-8 h-8 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">Transparent Pricing</h4>
                <p className="text-xs text-slate-400">No Hidden Costs</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-slate-800 flex items-center space-x-3">
              <MapPin className="w-8 h-8 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">Executive Lounge</h4>
                <p className="text-xs text-slate-400">Prime Location</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SERVICE MENU & CATALOG */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
            Our Signature <span className="gold-gradient-text">Services & Menu</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Browse our catalog of expert barbering, skincare, and relaxation massage therapies.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((srv) => {
            const IconComponent = ICON_MAP[srv.icon] || Scissors;
            return (
              <div 
                key={srv.id}
                className="glass-card glass-card-hover rounded-3xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                      <IconComponent className="w-6 h-6 stroke-[2]" />
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {srv.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                      {srv.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block uppercase font-medium">Standard Price</span>
                    <span className="text-2xl font-bold font-serif gold-gradient-text">
                      {currency} {srv.price.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => setBookingService(srv)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400 text-xs font-bold border border-amber-500/30 transition-all flex items-center space-x-1.5"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Service</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* STAFF SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-serif font-bold text-white">
            Meet Our <span className="gold-gradient-text">Master Artisans</span>
          </h2>
          <p className="text-slate-400 text-sm">
            Dedicated barbers and spa massage therapists committed to your satisfaction.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {staff.map((st) => (
            <div key={st.id} className="glass-card rounded-2xl p-5 text-center space-y-4 border border-slate-800">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-bold text-xl flex items-center justify-center mx-auto shadow-md">
                {st.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">{st.name}</h4>
                <p className="text-xs text-amber-400 font-medium">{st.title || st.role}</p>
              </div>
              <span className="inline-block text-[11px] px-3 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                Role: {st.role}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* BOOKING MODAL */}
      {bookingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-6 border border-amber-500/30 relative">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Request Appointment</h3>
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
                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-2xl font-bold text-white">Appointment Request Sent!</h4>
                <p className="text-xs text-slate-300">
                  Thank you {clientName || 'Valued Client'}. Our team will contact you shortly to confirm your schedule.
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
                    placeholder="e.g. 0712345678"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Preferred Specialist</label>
                    <select
                      value={preferredStaff}
                      onChange={(e) => setPreferredStaff(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Any Available</option>
                      {staff.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setBookingService(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
