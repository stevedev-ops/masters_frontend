import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Plus, Edit, Check, X, Tag } from 'lucide-react';

export default function ServiceManagementModal({ isOpen, onClose }) {
  const { services, addService, updateService, currency } = useApp();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Barber');
  const [description, setDescription] = useState('');

  const [editingSrvId, setEditingSrvId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editName, setEditName] = useState('');

  if (!isOpen) return null;

  const handleAddService = (e) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    addService({
      name: name.trim(),
      price: parseFloat(price),
      category: category,
      icon: category === 'Barber' ? 'Scissors' : 'Heart',
      description: description.trim() || 'Custom salon service'
    });

    setName('');
    setPrice('');
    setDescription('');
  };

  const startEdit = (srv) => {
    setEditingSrvId(srv.id);
    setEditPrice(srv.price);
    setEditName(srv.name);
  };

  const saveEdit = (srvId) => {
    updateService(srvId, { price: parseFloat(editPrice), name: editName });
    setEditingSrvId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel max-w-2xl w-full rounded-3xl p-6 sm:p-8 space-y-6 border border-amber-500/30 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-white">Services & Pricing Catalog</h2>
              <p className="text-xs text-amber-400 font-medium">Update activity prices or create new services</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 text-lg font-bold">
            ✕
          </button>
        </div>

        {/* Add New Service Form */}
        <form onSubmit={handleAddService} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Add New Service / Price
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Service Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pedicure Spa"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Price ({currency})</label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 500"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Barber">Barber</option>
              <option value="Massage & Bodywork">Massage & Bodywork</option>
              <option value="Spa & Skincare">Spa & Skincare</option>
              <option value="Nail Care">Nail Care</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg"
          >
            + Save New Service
          </button>
        </form>

        {/* Existing Service Catalog */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Current Active Services Catalog ({services.length})
          </h3>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {services.map((srv) => (
              <div 
                key={srv.id}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
              >
                {editingSrvId === srv.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-slate-950 border border-amber-500 text-white text-xs rounded-lg px-2.5 py-1.5 flex-1"
                    />
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="bg-slate-950 border border-amber-500 text-white text-xs rounded-lg px-2.5 py-1.5 w-24"
                    />
                    <button onClick={() => saveEdit(srv.id)} className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingSrvId(null)} className="p-1.5 bg-slate-800 text-slate-400 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-xs">{srv.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          {srv.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold font-serif gold-gradient-text">
                        {currency} {srv.price.toLocaleString()}
                      </span>
                      <button
                        onClick={() => startEdit(srv)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                        title="Edit Price"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-semibold text-xs hover:bg-slate-700"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
