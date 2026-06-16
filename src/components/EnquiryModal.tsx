import React, { useState } from 'react';
import { Mail, Phone, Calendar, Users, MapPin, X, CheckCircle2, FileText } from 'lucide-react';
import type { SelectedItem } from '../types';
import { BRAND_DETAILS } from '../menuData';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: SelectedItem[];
  onClearItems: () => void;
  serviceAddons: Array<{ name: string; price: number }>;
}

export default function EnquiryModal({
  isOpen,
  onClose,
  selectedItems,
  onClearItems,
  serviceAddons,
}: EnquiryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    guests: '',
    venue: '',
    notes: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone address is required';
    if (!formData.date) newErrors.date = 'Event date is required';
    if (!formData.guests) newErrors.guests = 'Guest count is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotal = () => {
    const itemsTotal = selectedItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
    const addonsTotal = serviceAddons.reduce((acc, curr) => acc + curr.price, 0);
    return itemsTotal + addonsTotal;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const subject = encodeURIComponent(`Catering Menu Request - ${formData.name}`);
      
      const itemsList = selectedItems
        .map((item) => `- ${item.name} (${item.size ? `Size: ${item.size}` : 'Qty'}: ${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`)
        .join('\n');
      
      const addonsList = serviceAddons
        .map((addon) => `- ${addon.name}: $${addon.price.toFixed(2)}`)
        .join('\n');

      const body = encodeURIComponent(
        `Catering Menu Inquiry Details:\n\n` +
        `Name: ${formData.name}\n` +
        `Email: ${formData.email}\n` +
        `Phone: ${formData.phone}\n` +
        `Event Date: ${formData.date}\n` +
        `Guests: ${formData.guests}\n` +
        `Venue: ${formData.venue}\n\n` +
        `Selected Menu Items:\n${itemsList || 'None'}\n\n` +
        `Selected Add-ons:\n${addonsList || 'None'}\n\n` +
        `Estimated Total: $${calculateTotal().toFixed(2)}\n\n` +
        `Special Requests / Notes:\n${formData.notes}\n`
      );

      const mailtoUrl = `mailto:bluebonnetwhisk@gmail.com?subject=${subject}&body=${body}`;
      window.location.href = mailtoUrl;

      setIsSubmitted(true);
    }
  };

  const handleSuccessClose = () => {
    setIsSubmitted(false);
    onClearItems();
    onClose();
  };

  const enquiryCode = `BW-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4 text-center lg:p-6 lg:p-8">
        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-lg bg-[#f9f9ff] text-left align-middle shadow-2xl transition-all border border-[#abc7ff]/30 animate-fade-in-up">
          
          {/* Close button */}
          <button
            type="button"
            className="absolute top-4 right-4 text-gray-400 hover:text-[#00346f] focus:outline-none transition-colors"
            onClick={onClose}
          >
            <X size={24} />
          </button>

          {!isSubmitted ? (
            <div className="grid grid-cols-1 lg:grid-cols-12">
              
              {/* Left Column: Form Details */}
              <div className="lg:col-span-7 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-[#ededf4] bg-white">
                <span className="text-xs font-semibold text-[#775a19] tracking-widest uppercase block mb-1 font-sans">
                  Precious Celebrations
                </span>
                <h3 className="font-serif font-bold text-2xl text-[#00346f] mb-6">
                  Catering Enquiry Request
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 font-sans">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Aditi Sharma"
                      className={`w-full px-3 py-2 border rounded-md text-sm font-sans focus:outline-none transition-all ${
                        errors.name ? 'border-red-500 focus:border-red-500 bg-red-50/10' : 'border-[#c3c6d2] focus:border-[#00346f]'
                      }`}
                    />
                    {errors.name && <p className="text-red-500 text-[114px] mt-1 text-xs">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 font-sans">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="aditi@example.com"
                          className={`w-full pl-9 pr-3 py-2 border rounded-md text-sm font-sans focus:outline-none transition-all ${
                            errors.email ? 'border-red-500 focus:border-red-500 bg-red-50/10' : 'border-[#c3c6d2] focus:border-[#00346f]'
                          }`}
                        />
                      </div>
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 font-sans">
                        WhatsApp / Phone *
                      </label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+1 (945) 527-4566"
                          className={`w-full pl-9 pr-3 py-2 border rounded-md text-sm font-sans focus:outline-none transition-all ${
                            errors.phone ? 'border-red-500 focus:border-red-500 bg-red-50/10' : 'border-[#c3c6d2] focus:border-[#00346f]'
                          }`}
                        />
                      </div>
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 font-sans">
                        Event Date *
                      </label>
                      <div className="relative">
                        <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          className={`w-full pl-9 pr-3 py-2 border rounded-md text-sm font-sans focus:outline-none transition-all ${
                            errors.date ? 'border-red-500 focus:border-red-500 bg-red-50/10' : 'border-[#c3c6d2] focus:border-[#00346f]'
                          }`}
                        />
                      </div>
                      {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 font-sans">
                        Guest Count *
                      </label>
                      <div className="relative">
                        <Users size={16} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                          type="number"
                          name="guests"
                          value={formData.guests}
                          onChange={handleInputChange}
                          placeholder="e.g. 50"
                          className={`w-full pl-9 pr-3 py-2 border rounded-md text-sm font-sans focus:outline-none transition-all ${
                            errors.guests ? 'border-red-500 focus:border-red-500 bg-red-50/10' : 'border-[#c3c6d2] focus:border-[#00346f]'
                          }`}
                        />
                      </div>
                      {errors.guests && <p className="text-red-500 text-xs mt-1">{errors.guests}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 font-sans">
                      Venue / Area
                    </label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        name="venue"
                        value={formData.venue}
                        onChange={handleInputChange}
                        placeholder="e.g. Sunset Grand Hall, Houston, TX"
                        className="w-full pl-9 pr-3 py-2 border border-[#c3c6d2] rounded-md text-sm font-sans focus:outline-none focus:border-[#00346f]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 font-sans">
                      Special requests & dietary notes
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="e.g. Vegan requirements, allergy restrictions, styling themes, specific arrival times."
                      className="w-full px-3 py-2 border border-[#c3c6d2] rounded-md text-sm font-sans focus:outline-none focus:border-[#00346f] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-3 bg-[#00346f] hover:bg-[#114589] text-white rounded-md text-[13px] tracking-widest font-semibold uppercase transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none"
                  >
                    Send Menu Request
                  </button>
                </form>
              </div>

              {/* Right Column: Mini Proposal Breakdown */}
              <div className="lg:col-span-5 p-6 lg:p-8 bg-[#f3f3f9] flex flex-col justify-between">
                <div>
                  <h4 className="font-serif font-semibold text-lg text-[#00346f] mb-4 flex items-center gap-2">
                    <FileText size={18} className="text-[#775a19]" /> Proposal Details
                  </h4>

                  {selectedItems.length === 0 ? (
                    <div className="text-center py-10 bg-white/40 border border-dashed border-[#c3c6d2] rounded-md px-4">
                      <p className="text-sm text-gray-500 font-sans">No items selected from the menu yet. We will design a custom culinary program manually.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                      {selectedItems.map((item) => (
                        <div key={`${item.id}-${item.size}`} className="flex justify-between text-xs bg-white p-2.5 rounded shadow-xs border-l-2 border-[#775a19]">
                          <div>
                            <p className="font-semibold text-gray-800 font-sans">{item.name}</p>
                            <p className="text-gray-500 text-[10px] font-sans">
                              {item.size ? `Size: ${item.size} Tray` : 'Qty'} &times; {item.quantity}
                            </p>
                          </div>
                          <span className="font-semibold text-[#00346f] text-right">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}

                      {serviceAddons.length > 0 && (
                        <div className="pt-2 border-t border-[#c3c6d2] mt-3 space-y-1">
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1">Add-ons</p>
                          {serviceAddons.map((addon) => (
                            <div key={addon.name} className="flex justify-between text-xs text-gray-600">
                              <span>{addon.name}</span>
                              <span className="font-medium">${addon.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t border-[#c3c6d2] pt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs uppercase font-semibold text-gray-500 font-sans">Catering Estimate</span>
                    <span className="text-xl font-serif font-bold text-[#00346f]">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 italic font-sans">
                    * Final quote is verified and customized upon consultation. Subject to sales tax and venue setup logistics.
                  </p>
                </div>

              </div>
            </div>
          ) : (
            /* Submission Success Screen */
            <div className="p-10 text-center flex flex-col items-center justify-center max-w-xl mx-auto">
              <CheckCircle2 size={64} className="text-green-600 mb-4 animate-bounce" />
              <h3 className="font-serif font-bold text-3xl text-[#00346f] mb-2">Request Received!</h3>
              <p className="text-sm text-gray-600 mb-4 font-sans">
                Thank you for selecting <strong>{BRAND_DETAILS.name}</strong>. Your customized digital menu, configuration details, and portion guidelines have been compiled successfully.
              </p>
              
              <div className="bg-[#ededf4] border border-[#c3c6d2] rounded-md px-6 py-3 mb-6 w-full text-center">
                <span className="text-[10px] text-gray-500 block uppercase tracking-wider mb-1 font-sans">Your Reference Code</span>
                <span className="text-xl font-mono font-bold tracking-widest text-[#00346f]">{enquiryCode}</span>
              </div>

              <div className="text-left py-4 px-6 border border-[#abc7ff]/30 bg-[#f0f4ff] rounded text-xs text-gray-700 space-y-2 mb-6 w-full font-sans">
                <p>📍 <strong>Representative:</strong> Our culinary director will call you within 24 hours.</p>
                <p>📞 <strong>WhatsApp Contact:</strong> {BRAND_DETAILS.contact.phone}</p>
                <p>✉️ <strong>Proposal Sent to:</strong> {formData.email}</p>
              </div>

              <button
                type="button"
                onClick={handleSuccessClose}
                className="px-8 py-3 bg-[#00346f] hover:bg-[#114589] text-white rounded font-semibold text-xs uppercase tracking-widest transition-all shadow"
              >
                Return To Price Guide
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
