import React, { useState, useEffect } from "react";
import { X, Calendar, User, Mail, Sparkles, CheckCircle2, Printer, Info } from "lucide-react";
import { flavorCategories } from "../types";

interface InquiryWizardProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedFlavor?: string;
  preselectedCategory?: string;
}

export default function InquiryWizard({ isOpen, onClose, preselectedFlavor, preselectedCategory }: InquiryWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    occasion: "Birthday",
    category: preselectedCategory || "Indian Fusion",
    flavor: preselectedFlavor || "Rasmalai Cake",
    size: "15-25 guests",
    dietary: "Eggless",
    customWishes: "",
  });

  const [estimate, setEstimate] = useState({
    base: 75,
    flavorAddon: 15,
    dietAddon: 10,
    sizeMultiplier: 1.2,
    total: 108
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync preselected values
  useEffect(() => {
    if (preselectedCategory) {
      setFormData(prev => ({ ...prev, category: preselectedCategory }));
    }
    if (preselectedFlavor) {
      setFormData(prev => ({ ...prev, flavor: preselectedFlavor }));
    }
  }, [preselectedFlavor, preselectedCategory]);

  // Dynamically update available flavors based on preselected category
  const activeCategoryData = flavorCategories.find(c => c.title === formData.category);
  const availableFlavors = activeCategoryData ? activeCategoryData.flavors : [];

  // Automatically update flavor when category changes to prevent stale selection
  const handleCategoryChange = (cat: string) => {
    const found = flavorCategories.find(c => c.title === cat);
    setFormData(prev => ({
      ...prev,
      category: cat,
      flavor: found ? found.flavors[0] : ""
    }));
  };

  // Recalculate price estimate
  useEffect(() => {
    let base = 60; // Standard starter price
    
    // Size multiplier
    let sizeMod = 1.0;
    if (formData.size === "10-15 guests") sizeMod = 1.0;
    else if (formData.size === "15-25 guests") sizeMod = 1.4;
    else if (formData.size === "25-50 guests") sizeMod = 2.2;
    else if (formData.size === "50-100 guests") sizeMod = 4.0;
    else sizeMod = 1.8; // custom/tier
    
    // Category add-on
    let fAddon = 0;
    if (formData.category === "Indian Fusion") fAddon = 20;
    else if (formData.category === "Premium & Gourmet") fAddon = 15;
    else if (formData.category === "Fruity & Light") fAddon = 10;
    
    // Dietary add-on
    let dAddon = 0;
    if (formData.dietary === "Eggless") dAddon = 5;
    else if (formData.dietary === "Gluten-Free") dAddon = 12;
    else if (formData.dietary === "Vegan") dAddon = 10;
    
    const total = Math.round((base + fAddon + dAddon) * sizeMod);
    
    setEstimate({
      base,
      flavorAddon: fAddon,
      dietAddon: dAddon,
      sizeMultiplier: sizeMod,
      total
    });
  }, [formData.category, formData.size, formData.dietary]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API registration or inquiry capture
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-lg bg-[#fbfbfa] text-[#1a1c20] shadow-2xl border border-secondary-brand/20">
        
        {/* Decorative Gold Header Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary-brand via-secondary-brand to-tertiary-brand" />
        
        {/* Absolute Close */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            
            <h3 className="font-serif text-3xl font-bold text-primary-brand mb-2">Inquiry Submitted!</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8 font-sans">
              Thank you, <span className="font-semibold">{formData.name}</span>! Our head baker will review your customized request and respond within 24 hours with a formal proposal.
            </p>

            {/* Print-style ticket of the gourmet custom cake */}
            <div className="mx-auto max-w-md rounded-md border border-dashed border-gray-300 bg-white p-6 text-left shadow-sm font-mono text-sm relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[radial-gradient(circle,transparent_20%,#fff_20%,#fff_80%,transparent_80%)] bg-[length:12px_12px] -translate-y-1.5" />
              
              <div className="text-center mb-4">
                <span className="font-serif text-lg font-bold tracking-wider text-primary-brand block">BLUEBONNET WHISK</span>
                <span className="text-xs text-gray-500 uppercase">Design & Taste Estimate Receipt</span>
              </div>
              
              <div className="border-b border-gray-200 pb-3 mb-3 space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Inquiry ID:</span>
                  <span>#BW-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Occasion:</span>
                  <span className="font-semibold text-gray-700">{formData.occasion}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Celebration Date:</span>
                  <span className="font-semibold text-gray-700"><Calendar className="inline h-3 w-3 mr-1" />{formData.date}</span>
                </div>
              </div>

              <div className="space-y-2 pb-3 border-b border-gray-100">
                <div className="flex justify-between">
                  <span>{formData.flavor} ({formData.category})</span>
                  <span>${formData.category === "Indian Fusion" ? "80.00" : "60.00"}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 pl-2">
                  <span>• Portion Adjustment ({formData.size})</span>
                  <span>x{estimate.sizeMultiplier.toFixed(1)}</span>
                </div>
                {estimate.dietAddon > 0 && (
                  <div className="flex justify-between text-xs text-gray-600 pl-2">
                    <span>• Dietary Modification ({formData.dietary})</span>
                    <span>+${(estimate.dietAddon * estimate.sizeMultiplier).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-3 font-bold text-gray-900 text-base">
                <span>ESTIMATED TOTAL:</span>
                <span className="text-secondary-brand">${estimate.total}.00</span>
              </div>
              
              <div className="text-center mt-6 text-[10px] text-gray-400">
                *Final cost subject to delivery & intricate custom decorations.
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 border border-secondary-brand px-5 py-2.5 text-xs font-semibold tracking-widest text-secondary-brand uppercase rounded hover:bg-secondary-brand/5 transition-all"
              >
                <Printer className="h-4 w-4" /> Print Estimate
              </button>
              <button 
                onClick={() => {
                  setIsSuccess(false);
                  setStep(1);
                  onClose();
                }}
                className="bg-primary-brand px-6 py-2.5 text-xs font-semibold tracking-widest text-white uppercase rounded hover:bg-primary-brand/90 transition-all shadow-md"
              >
                Back to Storefront
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl font-bold text-primary-brand">Create Your Masterpiece</h3>
                <p className="text-xs text-gray-500 font-sans mt-1">Design inquiry and custom quotation engine</p>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs text-secondary-brand bg-secondary-brand/10 px-2.5 py-1 rounded">
                <Sparkles className="h-3.5 w-3.5" /> Step {step} of 3
              </div>
            </div>

            {/* Custom Multi-step Indicator Line */}
            <div className="mb-8 flex gap-2">
              <div className={`h-1 w-full rounded transition-all duration-300 ${step >= 1 ? "bg-primary-brand" : "bg-gray-200"}`} />
              <div className={`h-1 w-full rounded transition-all duration-300 ${step >= 2 ? "bg-primary-brand" : "bg-gray-200"}`} />
              <div className={`h-1 w-full rounded transition-all duration-300 ${step >= 3 ? "bg-primary-brand" : "bg-gray-200"}`} />
            </div>

            {/* STEP 1: STYLE & THEME */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Occasion</label>
                  <select 
                    value={formData.occasion}
                    onChange={(e) => setFormData({...formData, occasion: e.target.value})}
                    className="w-full border border-gray-300 bg-white px-3 py-2 rounded focus:border-primary-brand focus:outline-none"
                  >
                    <option>Birthday</option>
                    <option>Anniversary</option>
                    <option>Wedding Celebration</option>
                    <option>Corporate Catering</option>
                    <option>Diwali / Eid / Festive Party</option>
                    <option>Baby Shower</option>
                    <option>Other Milestones</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Desired Crowd Size</label>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {["10-15 guests", "15-25 guests", "25-50 guests", "50-100 guests"].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setFormData({...formData, size: sz})}
                        className={`border py-2.5 px-1 rounded text-center text-xs transition-all font-sans ${
                          formData.size === sz 
                            ? "border-primary-brand bg-primary-brand text-white font-semibold" 
                            : "border-gray-300 hover:border-gray-400 bg-white text-gray-700"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Dietary Adjustments</label>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {["Regular", "Eggless", "Gluten-Free", "Vegan"].map((dt) => (
                      <button
                        key={dt}
                        type="button"
                        onClick={() => setFormData({...formData, dietary: dt})}
                        className={`border py-2.5 px-1 rounded text-center text-xs transition-all font-sans ${
                          formData.dietary === dt 
                            ? "border-secondary-brand bg-[#ffdea5] text-secondary-brand font-semibold" 
                            : "border-gray-200 hover:border-gray-300 bg-white text-gray-600"
                        }`}
                      >
                        {dt} {dt === "Eggless" && "✓"}
                      </button>
                    ))}
                  </div>
                  {formData.dietary === "Eggless" && (
                    <span className="text-[11px] text-emerald-600 mt-1 block font-sans">
                      Our signature eggless recipes guarantee amazing lightness and moisture!
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: FLAVORS & PRICING */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Collection Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full border border-gray-300 bg-white px-3 py-2 rounded focus:border-primary-brand focus:outline-none"
                    >
                      {flavorCategories.map(c => (
                        <option key={c.title} value={c.title}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Specific Taste Profile</label>
                    <select 
                      value={formData.flavor}
                      onChange={(e) => setFormData({...formData, flavor: e.target.value})}
                      className="w-full border border-gray-300 bg-white px-3 py-2 rounded focus:border-primary-brand focus:outline-none"
                    >
                      {availableFlavors.map(fl => (
                        <option key={fl} value={fl}>{fl}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Design Vision & Notes</label>
                  <textarea
                    rows={3}
                    value={formData.customWishes}
                    onChange={(e) => setFormData({...formData, customWishes: e.target.value})}
                    placeholder="Describe your design (florals, toppers, colors) or specific heritage wishes..."
                    className="w-full border border-gray-300 bg-white px-3 py-2 rounded focus:border-primary-brand focus:outline-none text-xs"
                  />
                </div>

                {/* Real-time elegant Quote Box widget inside form */}
                <div className="rounded border border-secondary-brand/20 bg-amber-50/20 p-4">
                  <div className="flex items-start gap-2 text-xs">
                    <Info className="h-4 w-4 text-secondary-brand shrink-0 mt-0.5" />
                    <div className="w-full">
                      <span className="font-semibold text-secondary-brand leading-none">Instant Est. Proposal Summary</span>
                      <div className="mt-2 space-y-1 font-mono text-[11px] text-gray-600">
                        <div className="flex justify-between">
                          <span>Standard Base Cake Setup:</span>
                          <span>${estimate.base}.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gourmet Taste Surcharge ({formData.category}):</span>
                          <span>+${estimate.flavorAddon}.00</span>
                        </div>
                        {estimate.dietAddon > 0 && (
                          <div className="flex justify-between">
                            <span>Special dietary surcharge ({formData.dietary}):</span>
                            <span>+${estimate.dietAddon}.00</span>
                          </div>
                        )}
                        <div className="flex justify-between text-gray-700 font-semibold border-t border-gray-200/50 pt-1 mt-1 text-xs">
                          <span>Combined Est. Price x {estimate.sizeMultiplier.toFixed(1)} guest count:</span>
                          <span className="text-primary-brand">${estimate.total}.00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: LOGISTICS & SUBMIT */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Your Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter your name"
                      className="w-full border border-gray-300 bg-white pl-10 pr-3 py-2 rounded focus:border-primary-brand focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="email@example.com"
                        className="w-full border border-gray-300 bg-white pl-10 pr-3 py-2 rounded focus:border-primary-brand focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Celebration Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full border border-gray-300 bg-white pl-10 pr-3 py-2 rounded focus:border-primary-brand focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded border border-emerald-100 bg-emerald-50/30 p-3 text-xs text-emerald-800 leading-normal font-sans">
                  <strong>Secure Consultation:</strong> We never charge you at inquiry! Final specs are personalized by our culinary team. Placing this inquiry guarantees your date slot booking.
                </div>
              </div>
            )}

            {/* BUTTON CONTROLS */}
            <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-5">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="border border-gray-300 px-5 py-2.5 text-xs font-semibold tracking-widest text-gray-700 uppercase rounded hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="bg-primary-brand hover:bg-primary-brand/95 text-white px-6 py-2.5 text-xs font-semibold tracking-widest uppercase rounded transition-all shadow-md ml-auto"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-secondary-brand hover:bg-secondary-brand/95 text-white px-8 py-2.5 text-xs font-semibold tracking-widest uppercase rounded transition-all shadow-md ml-auto disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting Inquiry..." : "Submit inquiry"}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
