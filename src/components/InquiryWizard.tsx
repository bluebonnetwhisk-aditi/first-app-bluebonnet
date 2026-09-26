import React, { useState, useEffect } from "react";
import { X, Calendar, User, Mail, Phone, Sparkles, CheckCircle2, Printer, Info, Plus, MessageCircle, MessageSquare } from "lucide-react";
import { flavorCategories } from "../types";
import type { SelectedItem } from "../types";
import { submitToGoogleSheets } from "../services/googleSheets";
import { buildInquiryWhatsAppUrl } from "../utils/whatsapp";
import { 
  CHATPATI_CHAAT,
  APPETIZERS,
  DAAL_SUBZI,
  PANEER_SPECIALTIES,
  FRESH_BREADS,
  RICE,
  SIDES_ACCOMPANIMENTS,
  BEVERAGES,
  CAKES_DESSERTS,
  DESSERT_TRAYS,
  SPECIALS,
  LIVE_COUNTERS
} from "../menuData";

const ALL_MENU_ITEMS = [
  ...CHATPATI_CHAAT.map(i => ({ ...i, category: 'Chatpati Chaat' })),
  ...APPETIZERS.map(i => ({ ...i, category: 'Appetizers' })),
  ...DAAL_SUBZI.map(i => ({ ...i, category: 'Daal & Subzi' })),
  ...PANEER_SPECIALTIES.map(i => ({ ...i, category: 'Paneer Specialties' })),
  ...FRESH_BREADS.map(i => ({ ...i, category: 'Fresh Breads' })),
  ...RICE.map(i => ({ ...i, category: 'Rice' })),
  ...SIDES_ACCOMPANIMENTS.map(i => ({ ...i, category: 'Sides & Accompaniments' })),
  ...BEVERAGES.map(i => ({ ...i, category: 'Beverages' })),
  ...CAKES_DESSERTS.map(i => ({ ...i, category: 'Cakes & Desserts' })),
  ...DESSERT_TRAYS.map(i => ({ ...i, category: 'Dessert Trays' })),
  ...SPECIALS.map(i => ({ ...i, category: 'Specials' })),
  ...LIVE_COUNTERS.map(i => ({ ...i, category: 'Live Counters' }))
];

interface InquiryWizardProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedFlavor?: string;
  preselectedCategory?: string;
  selectedCateringItems?: SelectedItem[];
  cateringAddons?: Array<{ name: string; price: number }>;
  onClearCateringItems?: () => void;
}

export default function InquiryWizard({ 
  isOpen, 
  onClose, 
  preselectedFlavor, 
  preselectedCategory,
  selectedCateringItems,
  cateringAddons,
  onClearCateringItems
}: InquiryWizardProps) {

  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState<string>("Catering Platters");
  const [wizardItems, setWizardItems] = useState<SelectedItem[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    occasion: "Birthday",
    category: "Indian Fusion",
    flavor: "Rasmalai Cake",
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

  // Sync incoming selected items and categories
  useEffect(() => {
    if (isOpen) {
      if (selectedCateringItems && selectedCateringItems.length > 0) {
        setWizardItems([...selectedCateringItems]);
        setServiceType("Catering Platters");
        setFormData(prev => ({
          ...prev,
          occasion: "Catering",
          category: "Catering Selection",
          flavor: "Catering Menu Items"
        }));
      } else {
        setWizardItems([]);
        if (preselectedFlavor) {
          setWizardItems([
            {
              id: "custom_cake_item",
              name: `${preselectedFlavor} Cake`,
              category: preselectedCategory || "Custom Cakes",
              price: preselectedCategory === "Indian Fusion" ? 80 : 60,
              quantity: 1,
              size: "1/2"
            }
          ]);
          setServiceType("Custom Cakes");
          setFormData(prev => ({
            ...prev,
            occasion: "Birthday",
            category: preselectedCategory || "Indian Fusion",
            flavor: preselectedFlavor || "Rasmalai Cake"
          }));
        } else if (preselectedCategory === "Live Counters") {
          setServiceType("Custom Party Packages");
          setFormData(prev => ({
            ...prev,
            occasion: "Corporate Catering",
            category: "Live Counters",
            flavor: "Live Counter Stations"
          }));
        } else if (preselectedCategory === "Gifting" || preselectedCategory === "Festive Gifting") {
          setServiceType("Festive Gifting");
          setFormData(prev => ({
            ...prev,
            occasion: "Diwali / Eid / Festive Party",
            category: "Gifting Selection",
            flavor: "Festive Box"
          }));
        } else {
          setServiceType("Catering Platters");
          setFormData(prev => ({
            ...prev,
            occasion: "Anniversary",
            category: "Catering Selection",
            flavor: "Custom Platters"
          }));
        }
      }
    }
  }, [isOpen, selectedCateringItems, preselectedFlavor, preselectedCategory]);

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

  // Recalculate price estimate for standard cake customizer
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

  // Totals calculations
  const tableItemsTotal = wizardItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const addonsTotal = cateringAddons?.reduce((acc, curr) => acc + curr.price, 0) || 0;
  const isCakeService = serviceType === "Custom Cakes";
  const baseCakeTotal = isCakeService && wizardItems.length === 0 ? estimate.total : 0;
  const grandTotal = tableItemsTotal + baseCakeTotal + addonsTotal;

  // Table manipulation handlers
  const handleRowNameChange = (index: number, name: string) => {
    const updated = [...wizardItems];
    updated[index].name = name;
    
    const matched = ALL_MENU_ITEMS.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (matched) {
      updated[index].id = matched.id;
      updated[index].category = matched.category;
      
      let defaultPrice = 0;
      let defaultSize: '1/3' | '1/2' | 'Full' | 'Single' | 'Gallon' = '1/2';
      
      if (matched.prices.half !== undefined) {
        defaultPrice = matched.prices.half;
        defaultSize = '1/2';
      } else if (matched.prices.single !== undefined) {
        defaultPrice = matched.prices.single;
        defaultSize = 'Single';
      } else if (matched.prices.gallon !== undefined) {
        defaultPrice = matched.prices.gallon;
        defaultSize = 'Gallon';
      } else if (matched.prices.third !== undefined) {
        defaultPrice = matched.prices.third;
        defaultSize = '1/3';
      } else if (matched.prices.full !== undefined) {
        defaultPrice = matched.prices.full;
        defaultSize = 'Full';
      } else if (matched.prices.minPrice !== undefined) {
        defaultPrice = matched.prices.minPrice;
        defaultSize = 'Single';
      }
      
      updated[index].price = defaultPrice;
      updated[index].size = defaultSize;
    }
    setWizardItems(updated);
  };

  const handleRowSizeChange = (index: number, size: '1/3' | '1/2' | 'Full' | 'Single' | 'Gallon') => {
    const updated = [...wizardItems];
    updated[index].size = size;
    
    const matched = ALL_MENU_ITEMS.find(item => item.id === updated[index].id);
    if (matched) {
      let newPrice = updated[index].price;
      if (size === '1/3' && matched.prices.third !== undefined) {
        newPrice = matched.prices.third;
      } else if (size === '1/2' && matched.prices.half !== undefined) {
        newPrice = matched.prices.half;
      } else if (size === 'Full' && matched.prices.full !== undefined) {
        newPrice = matched.prices.full;
      } else if (size === 'Single' && matched.prices.single !== undefined) {
        newPrice = matched.prices.single;
      } else if (size === 'Gallon' && matched.prices.gallon !== undefined) {
        newPrice = matched.prices.gallon;
      }
      updated[index].price = newPrice;
    }
    setWizardItems(updated);
  };

  const handleRowQuantityChange = (index: number, qty: number) => {
    const updated = [...wizardItems];
    updated[index].quantity = Math.max(1, qty);
    setWizardItems(updated);
  };

  const handleRowPriceChange = (index: number, price: number) => {
    const updated = [...wizardItems];
    updated[index].price = Math.max(0, price);
    setWizardItems(updated);
  };

  const handleDeleteRow = (index: number) => {
    setWizardItems(wizardItems.filter((_, i) => i !== index));
  };

  const handleAddCustomRow = () => {
    setWizardItems([
      ...wizardItems,
      {
        id: `custom_item_${Date.now()}`,
        name: "",
        category: "Custom Item",
        price: 0,
        quantity: 1,
        size: "1/2"
      }
    ]);
  };

  const addRecommendedItem = (itemToAdd: { id: string; name: string; category: string; price: number; size: '1/3' | '1/2' | 'Full' | 'Single' | 'Gallon'; quantity: number }) => {
    // Check if item already exists in wizardItems
    const exists = wizardItems.some(i => i.id === itemToAdd.id && i.size === itemToAdd.size);
    if (!exists) {
      setWizardItems([...wizardItems, {
        id: itemToAdd.id,
        name: itemToAdd.name,
        category: itemToAdd.category,
        price: itemToAdd.price,
        quantity: itemToAdd.quantity,
        size: itemToAdd.size
      }]);
    }
  };

  // Cross-selling / Recommendations helpers
  const hasAppetizer = wizardItems.some(item => item.category === "Chatpati Chaat" || item.category === "Appetizers");
  const hasDessert = wizardItems.some(item => item.category === "Cakes & Desserts" || item.category === "Dessert Trays");
  const hasBeverage = wizardItems.some(item => item.category === "Beverages");
  const hasBread = wizardItems.some(item => item.category === "Fresh Breads");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedItemsText = wizardItems.length > 0
      ? wizardItems.map(item => `- ${item.name} (${item.size ? `Size: ${item.size}` : `Qty: ${item.quantity}`}) - $${(item.price * item.quantity).toFixed(2)}`).join('\n')
      : isCakeService 
      ? `- Custom Cake: ${formData.flavor} (${formData.category}) - Portions: ${formData.size} - Surcharge Estimate: $${estimate.total}.00`
      : "N/A";
      
    const selectedAddonsText = cateringAddons && cateringAddons.length > 0
      ? cateringAddons.map(addon => `- ${addon.name} - $${addon.price.toFixed(2)}`).join('\n')
      : "N/A";

    const totalStr = `$${grandTotal.toFixed(2)}`;

    // 1. Submit to Web3Forms to send email to bluebonnetwhisk@gmail.com
    try {
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          access_key: "7ef4d494-f03c-4a26-9966-8d6077024735",
          subject: `New Inquiry (${serviceType}) - ${formData.name}`,
          from_name: "Bluebonnet Whisk Website",
          to: "bluebonnetwhisk@gmail.com",
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          date: formData.date,
          occasion: formData.occasion,
          serviceType: serviceType,
          category: isCakeService ? formData.category : "N/A",
          flavor: isCakeService ? formData.flavor : "N/A",
          size: isCakeService ? formData.size : "N/A",
          dietary: formData.dietary,
          customWishes: formData.customWishes,
          selectedItems: selectedItemsText,
          selectedAddons: selectedAddonsText,
          estimatedTotal: totalStr
        })
      });
    } catch (err) {
      console.error("Web3Forms submission error:", err);
    }
    
    // 2. Submit to Google Sheets (if configured)
    await submitToGoogleSheets(serviceType.includes("Cakes") ? "Cake Inquiries" : "Catering Inquiries", {
      Name: formData.name,
      Email: formData.email,
      Phone: formData.phone,
      Date: formData.date,
      Occasion: formData.occasion,
      Category: serviceType,
      Flavor: isCakeService ? formData.flavor : "Interactive Table Selection",
      Size: isCakeService ? formData.size : "N/A",
      Dietary: formData.dietary,
      "Custom Wishes": formData.customWishes,
      "Selected Items": selectedItemsText !== "N/A" ? selectedItemsText : "",
      "Selected Addons": selectedAddonsText !== "N/A" ? selectedAddonsText : "",
      "Estimated Total": totalStr
    });

    // Attempt WhatsApp notification
    try {
      const waUrl = buildInquiryWhatsAppUrl({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        date: formData.date,
        occasion: formData.occasion,
        category: serviceType,
        flavor: isCakeService ? formData.flavor : undefined,
        size: isCakeService ? formData.size : undefined,
        dietary: formData.dietary,
        customWishes: formData.customWishes,
        estimatedTotal: totalStr
      });
      window.open(waUrl, '_blank');
    } catch (e) {
      console.warn('Auto WhatsApp opening prevented', e);
    }

    setIsSubmitting(false);
    setIsSuccess(true);

    if (onClearCateringItems) {
      onClearCateringItems();
    }
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
          <div className="p-8 text-center max-h-[90vh] overflow-y-auto pr-1">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            
            <h3 className="font-serif text-3xl font-bold text-primary-brand mb-2">Inquiry Submitted!</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8 font-sans text-xs">
              Thank you, <span className="font-semibold">{formData.name}</span>! Our head chef will review your customized request and respond within 24 hours with a formal proposal.
            </p>

            {/* Print-style ticket */}
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
                  <span>Service Type:</span>
                  <span className="font-semibold text-gray-700">{serviceType}</span>
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

              <div className="space-y-2 pb-3 border-b border-gray-150 text-xs font-sans">
                {wizardItems.length > 0 ? (
                  <>
                    <div className="font-semibold text-gray-700 uppercase tracking-wider text-[10px] mb-1">Quote Items</div>
                    {wizardItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-0.5">
                        <span>{item.name} {item.size ? `(${item.size})` : `(Qty: ${item.quantity})`}</span>
                        <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {cateringAddons && cateringAddons.length > 0 && cateringAddons.map((addon, idx) => (
                      <div key={idx} className="flex justify-between py-0.5 text-secondary-brand">
                        <span>{addon.name} (Addon)</span>
                        <span className="font-semibold">${addon.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>{formData.flavor} ({formData.category})</span>
                      <span>${formData.category === "Indian Fusion" ? "80.00" : "60.00"}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 pl-2 mt-1">
                      <span>• Portion Adjustment ({formData.size})</span>
                      <span>x{estimate.sizeMultiplier.toFixed(1)}</span>
                    </div>
                    {estimate.dietAddon > 0 && (
                      <div className="flex justify-between text-xs text-gray-600 pl-2">
                        <span>• Dietary Modification ({formData.dietary})</span>
                        <span>+${(estimate.dietAddon * estimate.sizeMultiplier).toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex justify-between pt-3 font-bold text-gray-900 text-base">
                <span>ESTIMATED TOTAL:</span>
                <span className="text-secondary-brand">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
              
              <div className="text-center mt-6 text-[10px] text-gray-400">
                *Final cost subject to delivery & intricate custom decorations.
              </div>
            </div>

            {/* Multi-channel Inquiry Options: WhatsApp, SMS, Call */}
            <div className="mt-6 max-w-md mx-auto space-y-2.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 block text-center">
                Instant Direct Communication Options:
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* WhatsApp */}
                <a
                  href={buildInquiryWhatsAppUrl({
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    date: formData.date,
                    occasion: formData.occasion,
                    category: serviceType,
                    flavor: isCakeService ? formData.flavor : undefined,
                    size: isCakeService ? formData.size : undefined,
                    dietary: formData.dietary,
                    customWishes: formData.customWishes,
                    estimatedTotal: `$${grandTotal.toFixed(2)}`
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1ebd5a] text-white py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 fill-white shrink-0" />
                  <span>WhatsApp</span>
                </a>

                {/* SMS */}
                <a
                  href={`sms:+19455274566?body=Hi%20Chef!%20I%20just%20submitted%20an%20inquiry%20for%20${encodeURIComponent(formData.name)}%20(${encodeURIComponent(formData.occasion)}%20on%20${encodeURIComponent(formData.date)}).`}
                  className="flex items-center justify-center gap-1.5 bg-[#00346f] hover:bg-[#00224d] text-white py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4 text-sky-300 shrink-0" />
                  <span>SMS</span>
                </a>

                {/* Call */}
                <a
                  href="tel:+19455274566"
                  className="flex items-center justify-center gap-1.5 bg-[#775a19] hover:bg-[#5d4201] text-white py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  <Phone className="h-4 w-4 text-emerald-300 shrink-0" />
                  <span>Call</span>
                </a>
              </div>
              <p className="text-[10px] text-gray-500 text-center font-mono">
                Direct Kitchen Line: <strong>+1 (945) 527-4566</strong>
              </p>
            </div>

            <div className="mt-4 flex justify-center gap-4">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 border border-secondary-brand px-5 py-2.5 text-xs font-semibold tracking-widest text-secondary-brand uppercase rounded hover:bg-secondary-brand/5 transition-all cursor-pointer"
              >
                <Printer className="h-4 w-4" /> Print Estimate
              </button>
              <button 
                onClick={() => {
                  setIsSuccess(false);
                  setStep(1);
                  onClose();
                }}
                className="bg-primary-brand px-6 py-2.5 text-xs font-semibold tracking-widest text-white uppercase rounded hover:bg-primary-brand/90 transition-all shadow-md cursor-pointer"
              >
                Back to Storefront
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl font-bold text-primary-brand">Create Your Masterpiece</h3>
                <p className="text-xs text-gray-500 font-sans mt-0.5">Design inquiry and custom quotation engine</p>
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

            {/* STEP 1: SERVICE TYPE & OCCASION */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5 font-bold">What are we planning?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "Custom Cakes", label: "🎂 Custom Cakes" },
                      { id: "Catering Platters", label: "🍽️ Catering Platters" },
                      { id: "Custom Party Packages", label: "🎪 Custom Party Packages" },
                      { id: "Festive Gifting", label: "🎁 Festive Gifting" }
                    ].map((svc) => (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => setServiceType(svc.id)}
                        className={`border py-3 px-2 rounded text-center text-xs transition-all font-sans font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                          serviceType === svc.id 
                            ? "border-[#00346f] bg-[#00346f] text-white shadow-sm" 
                            : "border-gray-300 hover:border-gray-400 bg-white text-gray-700"
                        }`}
                      >
                        {svc.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5 font-bold">Occasion</label>
                    <select 
                      value={formData.occasion}
                      onChange={(e) => setFormData({...formData, occasion: e.target.value})}
                      className="w-full border border-gray-300 bg-white px-3 py-2 rounded focus:border-primary-brand focus:outline-none text-xs"
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
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5 font-bold">Desired Crowd Size</label>
                    <select
                      value={formData.size}
                      onChange={(e) => setFormData({...formData, size: e.target.value})}
                      className="w-full border border-gray-300 bg-white px-3 py-2 rounded focus:border-primary-brand focus:outline-none text-xs"
                    >
                      <option>10-15 guests</option>
                      <option>15-25 guests</option>
                      <option>25-50 guests</option>
                      <option>50-100 guests</option>
                      <option>100+ guests (Custom)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5 font-bold">Dietary Adjustments</label>
                  <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                    {["Regular", "Eggless", "Gluten-Free", "Vegan"].map((dt) => (
                      <button
                        key={dt}
                        type="button"
                        onClick={() => setFormData({...formData, dietary: dt})}
                        className={`border py-2.5 px-1 rounded text-center text-xs transition-all font-sans cursor-pointer ${
                          formData.dietary === dt 
                            ? "border-secondary-brand bg-[#ffdea5] text-[#775a19] font-bold" 
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

            {/* STEP 2: DETAILS & QUOTE BUILDER */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in max-h-[60vh] overflow-y-auto pr-1">
                
                {/* 1. Show custom cake flavor selectors if serviceType is Custom Cakes */}
                {isCakeService && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-[#00346f] uppercase tracking-wider block font-semibold border-b border-gray-100 pb-1">Cake Selection Details</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#fcf8f0]/60 p-4 rounded border border-[#fed488]/30">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5 font-bold">Collection Category</label>
                        <select 
                          value={formData.category}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="w-full border border-gray-300 bg-white px-3 py-2 rounded focus:border-[#00346f] focus:outline-none text-xs"
                        >
                          {flavorCategories.map(c => (
                            <option key={c.title} value={c.title}>{c.title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5 font-bold">Specific Taste Profile</label>
                        <select 
                          value={formData.flavor}
                          onChange={(e) => setFormData({...formData, flavor: e.target.value})}
                          className="w-full border border-gray-300 bg-white px-3 py-2 rounded focus:border-[#00346f] focus:outline-none text-xs"
                        >
                          {availableFlavors.map(fl => (
                            <option key={fl} value={fl}>{fl}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Interactive Quote Builder Table */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 font-bold">
                      {isCakeService ? "Additional Menu Items to Add (Optional)" : "Quote Selections Builder"}
                    </label>
                    <button
                      type="button"
                      onClick={handleAddCustomRow}
                      className="text-[11px] text-[#775a19] font-bold uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Custom Item
                    </button>
                  </div>

                  {wizardItems.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-250 rounded bg-white text-xs text-gray-500 font-sans leading-relaxed">
                      No custom menu items added. {isCakeService ? "Your quote estimate will include the custom cake specified above." : "Click '+ Add Custom Item' to search the menu and add custom rows."}
                    </div>
                  ) : (
                    <div className="w-full overflow-x-auto border border-gray-200 rounded bg-white max-h-56 overflow-y-auto">
                      <table className="w-full text-left border-collapse min-w-[550px] text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">
                            <th className="p-2 w-5/12 pl-3">Item Name</th>
                            <th className="p-2 w-3/12">Portion Size</th>
                            <th className="p-2 w-1.5/12 text-center">Qty</th>
                            <th className="p-2 w-2/12 text-right pr-4">Price</th>
                            <th className="p-2 w-0.5/12"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150">
                          {wizardItems.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-gray-50/50">
                              <td className="p-2 pl-3">
                                <input
                                  type="text"
                                  list="menu-items-autocomplete"
                                  value={item.name}
                                  onChange={(e) => handleRowNameChange(idx, e.target.value)}
                                  placeholder="Start typing item name (e.g. Samosa)..."
                                  className="w-full border border-gray-300 px-2 py-1 rounded text-xs focus:border-[#00346f] focus:outline-none"
                                />
                              </td>
                              <td className="p-2">
                                <select
                                  value={item.size || '1/2'}
                                  onChange={(e) => handleRowSizeChange(idx, e.target.value as any)}
                                  className="w-full border border-gray-300 px-1 py-1 rounded text-xs focus:border-[#00346f] focus:outline-none bg-white"
                                >
                                  <option value="1/3">Third Tray</option>
                                  <option value="1/2">Half Tray</option>
                                  <option value="Full">Full Tray</option>
                                  <option value="Single">Single Portion</option>
                                  <option value="Gallon">Gallon</option>
                                </select>
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleRowQuantityChange(idx, parseInt(e.target.value) || 1)}
                                  className="w-full border border-gray-300 px-1 py-1 rounded text-xs text-center focus:border-[#00346f] focus:outline-none"
                                />
                              </td>
                              <td className="p-2 text-right pr-4">
                                <div className="flex items-center justify-end gap-1">
                                  <span className="text-gray-400">$</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.price}
                                    onChange={(e) => handleRowPriceChange(idx, parseFloat(e.target.value) || 0)}
                                    className="w-16 border border-gray-300 px-1.5 py-1 rounded text-xs text-right focus:border-[#00346f] focus:outline-none"
                                  />
                                </div>
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRow(idx)}
                                  className="text-gray-400 hover:text-red-500 text-lg font-bold p-1 cursor-pointer transition-colors"
                                  aria-label="Remove item"
                                >
                                  &times;
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 3. Autocomplete Datalist */}
                <datalist id="menu-items-autocomplete">
                  {ALL_MENU_ITEMS.map((item) => (
                    <option key={item.id} value={item.name} />
                  ))}
                </datalist>

                {/* 4. Smart Recommendations prompts */}
                <div className="mt-4 p-4 bg-[#fcf8f0]/40 border border-[#fed488]/40 rounded-lg space-y-3">
                  <span className="text-xs font-bold text-[#775a19] uppercase tracking-wider block font-semibold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> Smart Suggestions to Consider
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {!hasAppetizer && (
                      <div className="bg-white p-3 rounded border border-gray-150 flex justify-between items-center text-xs shadow-2xs">
                        <div>
                          <p className="font-semibold text-gray-800">Samosa Chaat (Third Tray)</p>
                          <p className="text-gray-500 text-[10px]">Appetizers &amp; Chaat</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            addRecommendedItem({
                              id: 'ct_samosa_chaat',
                              name: 'Samosa Chaat',
                              category: 'Chatpati Chaat',
                              price: 50,
                              quantity: 1,
                              size: '1/3'
                            });
                          }}
                          className="bg-[#00346f] hover:bg-[#00346f]/90 text-white px-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          + Add $50
                        </button>
                      </div>
                    )}
                    {!hasDessert && (
                      <div className="bg-white p-3 rounded border border-gray-150 flex justify-between items-center text-xs shadow-2xs">
                        <div>
                          <p className="font-semibold text-gray-800">Rasmalai Tray (Third Tray)</p>
                          <p className="text-gray-500 text-[10px]">Traditional Sweets</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            addRecommendedItem({
                              id: 'dt_rasmalai',
                              name: 'Rasmalai (Tray)',
                              category: 'Dessert Trays',
                              price: 60,
                              quantity: 1,
                              size: '1/3'
                            });
                          }}
                          className="bg-[#00346f] hover:bg-[#00346f]/90 text-white px-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          + Add $60
                        </button>
                      </div>
                    )}
                    {!hasBeverage && (
                      <div className="bg-white p-3 rounded border border-gray-150 flex justify-between items-center text-xs shadow-2xs">
                        <div>
                          <p className="font-semibold text-gray-800">Mango Lassi (Per Guest)</p>
                          <p className="text-gray-500 text-[10px]">Refreshing Drinks</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            addRecommendedItem({
                              id: 'be_mango_lassi',
                              name: 'Mango Lassi (Per Guest)',
                              category: 'Beverages',
                              price: 4.5,
                              quantity: 10,
                              size: 'Single'
                            });
                          }}
                          className="bg-[#00346f] hover:bg-[#00346f]/90 text-white px-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          + Add $45
                        </button>
                      </div>
                    )}
                    {!hasBread && (
                      <div className="bg-white p-3 rounded border border-gray-150 flex justify-between items-center text-xs shadow-2xs">
                        <div>
                          <p className="font-semibold text-gray-800">Butter Naan (Per Piece)</p>
                          <p className="text-gray-500 text-[10px]">Fresh Tandoor Bread</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            addRecommendedItem({
                              id: 'br_butter_naan',
                              name: 'Butter Naan',
                              category: 'Fresh Breads',
                              price: 3.5,
                              quantity: 10,
                              size: 'Single'
                            });
                          }}
                          className="bg-[#00346f] hover:bg-[#00346f]/90 text-white px-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          + Add $35
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Custom Wishes / Notes */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5 font-bold">
                    Event Details &amp; Custom Wishes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.customWishes}
                    onChange={(e) => setFormData({...formData, customWishes: e.target.value})}
                    placeholder="Describe custom setups, dietary notes, delivery timing, or intricate design themes..."
                    className="w-full border border-gray-300 bg-white px-3 py-2 rounded focus:border-primary-brand focus:outline-none text-xs"
                  />
                </div>

                {/* 6. Real-time elegant Quote Box widget inside form */}
                <div className="rounded border border-secondary-brand/20 bg-amber-50/20 p-4">
                  <div className="flex items-start gap-2 text-xs">
                    <Info className="h-4 w-4 text-secondary-brand shrink-0 mt-0.5" />
                    <div className="w-full">
                      <span className="font-semibold text-[#775a19] leading-none">Instant Est. Proposal Summary</span>
                      <div className="mt-2 space-y-1 font-mono text-[11px] text-gray-600">
                        {isCakeService && wizardItems.length === 0 ? (
                          <>
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
                              <span className="text-[#00346f]">${estimate.total}.00</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span>Selected Table Items Subtotal:</span>
                              <span>${tableItemsTotal.toFixed(2)}</span>
                            </div>
                            {addonsTotal > 0 && (
                              <div className="flex justify-between">
                                <span>Applied Services &amp; Decor addons:</span>
                                <span>${addonsTotal.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-gray-700 font-semibold border-t border-gray-200/50 pt-1 mt-1 text-xs">
                              <span>Total Catering Price:</span>
                              <span className="text-[#00346f]">${grandTotal.toFixed(2)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* STEP 3: LOGISTICS & SUBMIT */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in font-sans">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5 font-bold">Your Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter your name"
                      className="w-full border border-gray-300 bg-white pl-10 pr-3 py-2 rounded focus:border-[#00346f] focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5 font-bold">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="email@example.com"
                        className="w-full border border-gray-300 bg-white pl-10 pr-3 py-2 rounded focus:border-[#00346f] focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5 font-bold">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="(123) 456-7890"
                        className="w-full border border-gray-300 bg-white pl-10 pr-3 py-2 rounded focus:border-[#00346f] focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5 font-bold">Celebration Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full border border-gray-300 bg-white pl-10 pr-3 py-2 rounded focus:border-[#00346f] focus:outline-none text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded border border-emerald-100 bg-emerald-50/30 p-3 text-xs text-emerald-800 leading-normal font-sans font-medium">
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
                  className="border border-gray-300 px-5 py-2.5 text-xs font-semibold tracking-widest text-gray-700 uppercase rounded hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="bg-[#00346f] hover:bg-[#00346f]/95 text-white px-6 py-2.5 text-xs font-semibold tracking-widest uppercase rounded transition-all shadow-md ml-auto cursor-pointer"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#775a19] hover:bg-[#5d4201] text-white px-8 py-2.5 text-xs font-semibold tracking-widest uppercase rounded transition-all shadow-md ml-auto disabled:opacity-50 cursor-pointer"
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
