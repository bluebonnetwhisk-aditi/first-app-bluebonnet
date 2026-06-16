import React, { useState } from "react";
import { X, MessageSquare, Mail, Send, Calendar, Users, CheckCircle2 } from "lucide-react";

interface TalkToKitchenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TalkToKitchenModal({ isOpen, onClose }: TalkToKitchenModalProps) {
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    eventDate: "",
    guests: "",
    eventType: "Birthday",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate inquiry submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({
        name: "",
        eventDate: "",
        guests: "",
        eventType: "Birthday",
        message: "",
      });
    }, 1000);
  };

  const handleClose = () => {
    setShowInquiryForm(false);
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-lg bg-[#fbfbfa] text-[#1a1c20] shadow-2xl border border-secondary-brand/20">
        
        {/* Decorative Gold Header Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary-brand via-secondary-brand to-tertiary-brand" />
        
        {/* Absolute Close */}
        <button 
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-900 transition-colors p-1.5 rounded-full hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 md:p-8">
          {!showInquiryForm ? (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-primary-brand">Talk to the Kitchen</h3>
                <p className="text-xs md:text-sm text-gray-500 font-sans mt-2">Let’s plan your perfect celebration together</p>
              </div>

              <div className="space-y-4 pt-2">
                {/* Option 1: WhatsApp */}
                <a
                  href="https://wa.me/19455274566"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-lg border border-emerald-100 bg-[#e8fcf0] hover:bg-[#dbfad8]/60 hover:border-emerald-300 transition-all group"
                >
                  <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <MessageSquare className="h-5 w-5 fill-current" />
                  </div>
                  <div>
                    <h4 className="font-sans text-sm font-bold text-emerald-950">Chat on WhatsApp</h4>
                    <p className="text-xs text-emerald-800">Quick chat directly with our chef</p>
                  </div>
                </a>

                {/* Option 2: Email */}
                <a
                  href="mailto:bluebonnetwhisk@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-lg border border-[#00346f]/10 bg-[#f0f6fc] hover:bg-[#e1ecfa]/60 hover:border-[#00346f]/30 transition-all group"
                >
                  <div className="h-10 w-10 rounded-full bg-[#00346f] text-white flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-sans text-sm font-bold text-[#00214a]">Email Us</h4>
                    <p className="text-xs text-[#00346f]/80">bluebonnetwhisk@gmail.com</p>
                  </div>
                </a>

                {/* Option 3: Send Quick Inquiry Form */}
                <button
                  onClick={() => setShowInquiryForm(true)}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border border-brand-gold-tint/50 bg-[#fffdf5] hover:bg-[#fff9e6] hover:border-secondary-brand transition-all text-left"
                >
                  <div className="h-10 w-10 rounded-full bg-secondary-brand text-white flex items-center justify-center shrink-0">
                    <Send className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-sans text-sm font-bold text-gray-900">Send Quick Inquiry</h4>
                    <p className="text-xs text-[#775a19]">Fill a simple menu planning form</p>
                  </div>
                </button>
              </div>

              <div className="text-center pt-2 text-xs text-gray-400 font-sans italic">
                “We typically respond within a few hours.”
              </div>
            </div>
          ) : isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-primary-brand">Inquiry Sent!</h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto font-sans leading-relaxed">
                Thank you for reaching out. Our culinary team has received your quick inquiry details and will get back to you shortly with custom menu ideas!
              </p>
              <div className="pt-4">
                <button
                  onClick={handleClose}
                  className="bg-primary-brand text-white text-xs font-bold tracking-widest uppercase px-6 py-2.5 rounded hover:bg-primary-brand/90 transition-all font-sans cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-2">
                <button
                  onClick={() => setShowInquiryForm(false)}
                  className="text-xs font-semibold text-secondary-brand hover:underline font-sans"
                >
                  ← Back to options
                </button>
                <h3 className="font-serif text-xl font-bold text-primary-brand mt-2">Quick Inquiry</h3>
                <p className="text-xs text-gray-500 font-sans">Share your event highlights with us</p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-3 font-sans">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full border border-gray-300 bg-white px-3 py-2 rounded text-xs focus:border-primary-brand focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">Event Date</label>
                    <div className="relative">
                      <Calendar className="absolute right-3 top-2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                      <input
                        type="date"
                        required
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        className="w-full border border-gray-300 bg-white px-3 py-2 rounded text-xs focus:border-primary-brand focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">Guests</label>
                    <div className="relative">
                      <Users className="absolute right-3 top-2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                        placeholder="Est. Count"
                        className="w-full border border-gray-300 bg-white px-3 py-2 rounded text-xs focus:border-primary-brand focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">Event Type</label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full border border-gray-300 bg-white px-3 py-2 rounded text-xs focus:border-primary-brand focus:outline-none"
                  >
                    <option>Birthday</option>
                    <option>Anniversary</option>
                    <option>Wedding Celebration</option>
                    <option>Festival / Pooja Event</option>
                    <option>Baby Shower</option>
                    <option>Corporate Lunch</option>
                    <option>Other Gathering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">Message / Requirements</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about desired menus, fusion tastes, or special themes..."
                    className="w-full border border-gray-300 bg-white px-3 py-2 rounded text-xs focus:border-primary-brand focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 italic font-sans">
                    “We typically respond within a few hours.”
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-secondary-brand hover:bg-secondary-brand/90 text-white font-sans text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? "Sending..." : "Submit Inquiry"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
