import { useState, useEffect } from 'react';
import { 
  Utensils, 
  Plus, 
  Minus, 
  Trash2, 
  Sparkles, 
  ChevronRight, 
  FileDown,
  Layers,
  ShoppingBag
} from 'lucide-react';
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
  LIVE_COUNTERS,
  PORTION_GUIDES, 
  SERVICE_ADDONS, 
  BRAND_DETAILS 
} from '../menuData';
import type { SelectedItem, MenuItem } from '../types';
import PlannerTool from './PlannerTool';
import EnquiryModal from './EnquiryModal';

import breadsImage from '../assets/images/indian_breads_basket_1781152845941.png';
import dessertsImage from '../assets/images/indian_desserts_luxury_1781152864858.png';

const formatSize = (size?: '1/3' | '1/2' | 'Full' | 'Single' | 'Gallon') => {
  if (!size) return '';
  if (size === '1/3') return 'Third Tray';
  if (size === '1/2') return 'Half Tray';
  if (size === 'Full') return 'Full Tray';
  if (size === 'Gallon') return 'Gallon';
  return size;
};

export default function MenuPage() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState<boolean>(false);
  const [appliedAddons, setAppliedAddons] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<string>('chaat');

  const sections = [
    { id: 'chaat', label: 'Chatpati Chaat' },
    { id: 'appetizers', label: 'Appetizers' },
    { id: 'daal-subzi', label: 'Daal & Subzi' },
    { id: 'paneer-specialties', label: 'Paneer Specialties' },
    { id: 'breads', label: 'Fresh Breads' },
    { id: 'rice', label: 'Rice' },
    { id: 'sides', label: 'Sides & Accompaniments' },
    { id: 'beverages', label: 'Beverages' },
    { id: 'cakes-desserts', label: 'Cakes & Desserts' },
    { id: 'dessert-trays', label: 'Dessert Trays' },
    { id: 'specials', label: 'Specials' },
    { id: 'live-counters', label: 'Live Counters' },
    { id: 'portions', label: 'Portion & Service Guide' }
  ];

  // Monitor scroll height to highlight Active Section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 220;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  const handleApplyRecommended = (selections: Array<{ name: string; size: 'Third Tray' | 'Half Tray' | 'Full Tray'; qty: number }>) => {
    let placeholderDishName = 'Matar Paneer';
    let placeholderId = 'pn_matar_paneer';
    let priceMultiplier = 1;
    let baseRefCategory = 'Paneer Specialties';

    const newSelections = [...selectedItems];

    selections.forEach(sel => {
      if (sel.name === 'Desserts') {
        placeholderDishName = 'Rasmalai (Tray)';
        placeholderId = 'dt_rasmalai';
        baseRefCategory = 'Dessert Trays';
        const found = DESSERT_TRAYS.find(d => d.id === placeholderId);
        priceMultiplier = found 
          ? (sel.size === 'Third Tray' ? found.prices.third! : sel.size === 'Half Tray' ? found.prices.half! : found.prices.full!) 
          : 60;
      } else {
        placeholderDishName = 'Matar Paneer';
        placeholderId = 'pn_matar_paneer';
        baseRefCategory = 'Paneer Specialties';
        const found = PANEER_SPECIALTIES.find(m => m.id === placeholderId);
        priceMultiplier = found 
          ? (sel.size === 'Third Tray' ? found.prices.third! : sel.size === 'Half Tray' ? found.prices.half! : found.prices.full!) 
          : 55;
      }

      const existingIndex = newSelections.findIndex(
        item => item.id === placeholderId && item.size === (sel.size === 'Third Tray' ? '1/3' : sel.size === 'Half Tray' ? '1/2' : 'Full')
      );

      const sizeName: '1/3' | '1/2' | 'Full' = sel.size === 'Third Tray' ? '1/3' : sel.size === 'Half Tray' ? '1/2' : 'Full';

      if (existingIndex > -1) {
        newSelections[existingIndex].quantity = sel.qty;
      } else {
        newSelections.push({
          id: placeholderId,
          name: `${placeholderDishName} (${sel.size})`,
          category: baseRefCategory,
          size: sizeName,
          price: priceMultiplier,
          quantity: sel.qty
        });
      }
    });

    setSelectedItems(newSelections);
    const element = document.getElementById('consultation-summary');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleSelection = (
    id: string, 
    name: string, 
    category: string, 
    price: number | undefined, 
    size?: '1/3' | '1/2' | 'Full' | 'Single' | 'Gallon'
  ) => {
    if (price === undefined) return;

    const existingIndex = selectedItems.findIndex(
      item => item.id === id && item.size === size
    );

    if (existingIndex > -1) {
      const updated = [...selectedItems];
      updated[existingIndex].quantity += 1;
      setSelectedItems(updated);
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          id,
          name,
          category,
          price,
          quantity: 1,
          size
        }
      ]);
    }
  };

  const updateQuantity = (id: string, size: string | undefined, delta: number) => {
    const updated = selectedItems.map(item => {
      if (item.id === id && item.size === size) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as SelectedItem[];
    
    setSelectedItems(updated);
  };

  const removeItem = (id: string, size: string | undefined) => {
    setSelectedItems(selectedItems.filter(item => !(item.id === id && item.size === size)));
  };

  const getSubtotal = () => {
    return selectedItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  };

  const getAddonsTotal = () => {
    return SERVICE_ADDONS
      .filter(addon => appliedAddons.includes(addon.id))
      .reduce((acc, curr) => acc + curr.basePrice, 0);
  };

  const getGrandTotal = () => {
    return getSubtotal() + getAddonsTotal();
  };

  const handleDownloadMenuTxt = () => {
    if (selectedItems.length === 0) {
      alert("Please select some items from the price list to build your personalized menu before downloading!");
      return;
    }

    const titleStr = `=========================================\n`;
    const brandStr = `       BLUEBONNET WHISK CATERING         \n`;
    const subStr   = `     Your Custom Premium Menu Quote      \n`;
    const dateStr  = ` Created: ${new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}\n`;
    const lineStr  = `=========================================\n\n`;
    
    let menuItemsTxt = `YOUR CUSTOM DISH SUMMARY:\n`;
    selectedItems.forEach((item, index) => {
      const details = item.size && !item.name.includes(formatSize(item.size)) && item.size !== 'Single' ? `(${formatSize(item.size)})` : '';
      menuItemsTxt += `${index + 1}. ${item.name} ${details}\n`;
      menuItemsTxt += `   Qty: ${item.quantity}  |  Unit: $${item.price.toFixed(2)}  |  Total: $${(item.price * item.quantity).toFixed(2)}\n\n`;
    });

    let addonsTxt = `SELECTED SERVICE ADD-ONS:\n`;
    const activeAddonsList = SERVICE_ADDONS.filter(a => appliedAddons.includes(a.id));
    if (activeAddonsList.length > 0) {
      activeAddonsList.forEach((a) => {
        addonsTxt += `- ${a.name} (Est: ${a.priceText})\n`;
      });
    } else {
      addonsTxt += `None selected.\n`;
    }
    addonsTxt += `\n`;

    const summaryTxt = `ESTIMATED TOTAL SUMMARY:\n` +
      `- Subtotal: $${getSubtotal().toFixed(2)}\n` +
      `- Add-ons:  $${getAddonsTotal().toFixed(2)}\n` +
      `- Estimated Quote Balance: $${getGrandTotal().toFixed(2)}\n\n` +
      `-----------------------------------------\n` +
      `CONTACT & ENQUIRIES:\n` +
      `WhatsApp: ${BRAND_DETAILS.contact.phone}\n` +
      `Email: ${BRAND_DETAILS.contact.email}\n` +
      `Web: @bluebonnetwhisk\n\n` +
      `* Portions and pricing are subject to final booking details, date availability, and local service tax.\n`;

    const fullBlobText = titleStr + brandStr + subStr + dateStr + lineStr + menuItemsTxt + addonsTxt + summaryTxt;
    
    const blob = new Blob([fullBlobText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bluebonnet-whisk-custom-catering-menu.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTrayCategoryTable = (
    id: string,
    title: string,
    subtitle: string,
    items: MenuItem[],
    categoryName: string
  ) => {
    return (
      <section id={id} className="bg-white rounded-lg border border-[#c3c6d2] shadow-sm overflow-hidden scroll-mt-24">
        <div className="bg-[#fcf8f0] px-6 py-5 border-b border-[#ededf4] flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          <div>
            <h2 className="font-serif font-bold text-2xl text-[#00346f]">{title}</h2>
            <p className="text-xs text-gray-500 font-sans mt-0.5">{subtitle}</p>
          </div>
          <div className="text-[10px] font-semibold text-[#775a19] tracking-wider uppercase bg-[#775a19]/10 px-3 py-1 rounded-full font-sans max-w-fit">
            Tray Portion Options Available
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#ededf4] bg-[#f9f9ff]">
                <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans w-1/3">Dish Name</th>
                <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans w-2/5">Description</th>
                <th className="py-3 px-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans w-1/4">1/3 Tray / Half Tray / Full Tray</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-[#ededf4]/70 hover:bg-[#f9f9ff]/50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-serif font-semibold text-[15px] text-[#00346f]">{item.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {item.tag !== 'NONE' && (
                        <span className={`inline-block text-[9px] font-bold tracking-widest font-sans px-2 py-0.5 rounded-sm ${
                          item.tag === 'VEGETARIAN' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {item.tag}
                        </span>
                      )}
                      {item.allergens && item.allergens.length > 0 && item.allergens.map(allergen => (
                        <span key={allergen} className="inline-block text-[9px] font-bold tracking-widest font-sans bg-amber-50/70 text-amber-800 border border-amber-100 px-2 py-0.5 rounded-sm">
                          CONTAINS {allergen.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-600 font-sans leading-relaxed">
                    {item.description}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {item.prices.third !== undefined && (
                        <button
                          type="button"
                          onClick={() => toggleSelection(item.id, `${item.name} (Third Tray)`, categoryName, item.prices.third, '1/3')}
                          className="px-2.5 py-1.5 bg-white hover:bg-[#00346f] hover:text-white text-[#00346f] border border-[#c3c6d2] rounded text-xs font-semibold cursor-pointer transition-all"
                        >
                          ${item.prices.third}
                        </button>
                      )}
                      {item.prices.third !== undefined && item.prices.half !== undefined && <span className="text-[10px] text-gray-300">/</span>}
                      {item.prices.half !== undefined && (
                        <button
                          type="button"
                          onClick={() => toggleSelection(item.id, `${item.name} (Half Tray)`, categoryName, item.prices.half, '1/2')}
                          className="px-2.5 py-1.5 bg-white hover:bg-[#00346f] hover:text-white text-[#00346f] border border-[#c3c6d2] rounded text-xs font-semibold cursor-pointer transition-all"
                        >
                          ${item.prices.half}
                        </button>
                      )}
                      {item.prices.half !== undefined && item.prices.full !== undefined && <span className="text-[10px] text-gray-300">/</span>}
                      {item.prices.full !== undefined && (
                        <button
                          type="button"
                          onClick={() => toggleSelection(item.id, `${item.name} (Full Tray)`, categoryName, item.prices.full, 'Full')}
                          className="px-2.5 py-1.5 bg-[#fed488]/40 hover:bg-[#775a19] hover:text-white text-[#775a19] border border-[#fed488] rounded text-xs font-bold cursor-pointer transition-all"
                        >
                          ${item.prices.full}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  };

  return (
    <div className="bg-[#f9f9ff] min-h-screen animate-fade-in font-sans">
      
      {/* Hero Header */}
      <section className="text-center pt-16 pb-12 px-4 lg:px-8 bg-gradient-to-b from-[#f3f3f9] to-[#f9f9ff]">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="font-serif font-bold text-4xl lg:text-5xl text-[#00346f] tracking-tight leading-none">
            Digital Menu &amp; Price Guide
          </h1>
          <p className="text-xs lg:text-base text-[#434751] max-w-2xl mx-auto leading-relaxed">
            Authentic Indian Catering &amp; Custom Desserts across Dallas, Frisco, Little Elm, Prosper, and McKinney. Click on dishes and prices to estimate sizes and prepare a beautiful proposal quote.
          </p>
          <div className="h-[2px] w-24 bg-[#775a19] mx-auto mt-6"></div>
        </div>
      </section>

      {/* Main Grid Layout */}
      <main className="max-w-7xl mx-auto px-4 lg:px-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Navigation & Planner */}
          <div className="lg:col-span-3 lg:sticky lg:top-28 space-y-6">
            
            {/* Quick Navigation Card */}
            <div className="bg-white rounded-lg border border-[#c3c6d2] p-5 shadow-sm">
              <h3 className="text-xs uppercase font-bold text-[#434751] tracking-widest mb-4 font-sans border-b border-[#ededf4] pb-2">
                Quick Navigation
              </h3>
              <nav className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
                {sections.map((section) => {
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center justify-between py-2 px-3 rounded text-[12px] font-sans font-medium text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#fed488]/30 font-semibold text-[#775a19] border-l-4 border-[#775a19]'
                          : 'text-[#434751] hover:bg-[#f3f3f9] hover:text-[#00346f]'
                      }`}
                    >
                      <span>{section.label}</span>
                      <ChevronRight size={12} className={isActive ? 'text-[#775a19]' : 'text-gray-300'} />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Smart Guest Planner Integration */}
            <PlannerTool onApplyRecommended={handleApplyRecommended} />

            {/* Hint Notice */}
            <div className="p-4 bg-[#f3f3f9] border-l-4 border-[#00346f] rounded-r-md text-xs text-[#434751] space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-[#00346f]">
                <Sparkles size={12} className="text-[#775a19]" /> Interactive Price Guide
              </p>
              <p className="leading-relaxed">
                Build a bespoke menu quote. Click pricing buttons to add portions directly to your live estimate summary. Try selecting Third, Half, or Full portions.
              </p>
            </div>

          </div>

          {/* Right Column: Menu Lists */}
          <div className="lg:col-span-9 space-y-12">
            
            {/* 1. CHATPATI CHAAT */}
            {renderTrayCategoryTable(
              'chaat',
              'Chatpati Chaat',
              'The authentic street-style taste inspired by the lanes of Dilli 6.',
              CHATPATI_CHAAT,
              'Chatpati Chaat'
            )}

            {/* 2. APPETIZERS */}
            {renderTrayCategoryTable(
              'appetizers',
              'Appetizers',
              'Authentic finger food bites — bold, beautiful, and unforgettable.',
              APPETIZERS,
              'Appetizers'
            )}

            {/* 3. DAAL & SUBZI */}
            {renderTrayCategoryTable(
              'daal-subzi',
              'Daal & Subzi',
              'Comforting lentil dishes and dry-sautéed vegetable favorites.',
              DAAL_SUBZI,
              'Daal & Subzi'
            )}

            {/* 4. PANEER SPECIALTIES */}
            {renderTrayCategoryTable(
              'paneer-specialties',
              'Paneer Specialties',
              'Rich, creamy curries and wok-tossed paneer recipes.',
              PANEER_SPECIALTIES,
              'Paneer Specialties'
            )}

            {/* 5. FRESH BREADS */}
            <section id="breads" className="bg-white rounded-lg border border-[#c3c6d2] shadow-sm overflow-hidden scroll-mt-24">
              <div className="bg-[#fcf8f0] px-6 py-5 border-b border-[#ededf4]">
                <h2 className="font-serif text-2xl text-[#00346f] font-bold">Fresh Breads</h2>
                <p className="text-xs text-gray-500 font-sans mt-0.5">Golden tandoori flatbreads and griddle rotis cooked to order.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#ededf4] bg-[#f9f9ff]">
                      <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans w-1/3">Bread Type</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans w-2/5">Description</th>
                      <th className="py-3 px-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans w-1/4">Price (Per Piece)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FRESH_BREADS.map((bread) => (
                      <tr key={bread.id} className="border-b border-[#ededf4]/70 hover:bg-[#f9f9ff]/50 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-serif font-semibold text-[15px] text-[#00346f]">{bread.name}</p>
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-600 font-sans">
                          {bread.description}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            type="button"
                            onClick={() => toggleSelection(bread.id, bread.name, 'Fresh Breads', bread.prices.single, 'Single')}
                            className="px-3 py-1.5 bg-white hover:bg-[#00346f] hover:text-white text-[#00346f] border border-[#c3c6d2] rounded text-xs font-semibold cursor-pointer transition-all inline-flex items-center gap-1"
                          >
                            <Plus size={10} />
                            ${bread.prices.single?.toFixed(2)} each
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 bg-gray-50 border-t border-[#ededf4]">
                <div className="relative aspect-video rounded overflow-hidden shadow-sm border border-[#c3c6d2]">
                  <img 
                    src={breadsImage}
                    alt="Authentic luxurious Indian Breads in a linen lined basket"
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                    <p className="text-white text-xs tracking-wider uppercase font-semibold font-sans drop-shadow-sm flex items-center gap-2">
                      <Sparkles size={14} className="text-[#fed488]" /> Signature Tandoor and Griddle Flatbreads
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. RICE */}
            {renderTrayCategoryTable(
              'rice',
              'Rice Selection',
              'Fragrant steamed long grain Basmati rice and spiced vegetable biryanis.',
              RICE,
              'Rice'
            )}

            {/* 7. SIDES & ACCOMPANIMENTS */}
            {renderTrayCategoryTable(
              'sides',
              'Sides & Accompaniments',
              'Cool whipped raitas, crisp green salads, and pickled onions.',
              SIDES_ACCOMPANIMENTS,
              'Sides & Accompaniments'
            )}

            {/* 8. BEVERAGES */}
            <section id="beverages" className="bg-white rounded-lg border border-[#c3c6d2] shadow-sm overflow-hidden scroll-mt-24">
              <div className="bg-[#fcf8f0] px-6 py-5 border-b border-[#ededf4] flex justify-between items-center">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-[#00346f]">Beverages</h2>
                  <p className="text-xs text-gray-500 font-sans mt-0.5">Spiced lemonades, cooling buttermilk, and traditional mango lassis.</p>
                </div>
                <span className="text-[10px] uppercase tracking-wider bg-[#00346f]/5 px-2.5 py-1 rounded font-bold font-sans">
                  Gallons or per-guest options
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#ededf4] bg-[#f9f9ff]">
                      <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans w-1/3">Beverage Name</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans w-2/5">Description</th>
                      <th className="py-3 px-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans w-1/4">Per Guest / Per Gallon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BEVERAGES.map((drink) => (
                      <tr key={drink.id} className="border-b border-[#ededf4]/70 hover:bg-[#f9f9ff]/50 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-serif font-semibold text-[15px] text-[#00346f]">{drink.name}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {drink.allergens && drink.allergens.length > 0 && drink.allergens.map(allergen => (
                              <span key={allergen} className="inline-block text-[9px] font-bold tracking-widest font-sans bg-amber-50/70 text-amber-800 border border-amber-100 px-2 py-0.5 rounded-sm">
                                CONTAINS {allergen.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-600 font-sans leading-relaxed">
                          {drink.description}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex flex-col lg:flex-row items-center justify-center gap-1.5">
                            {drink.prices.single !== undefined && (
                              <button
                                type="button"
                                onClick={() => toggleSelection(drink.id, `${drink.name} (Per Guest)`, 'Beverages', drink.prices.single, 'Single')}
                                className="w-full lg:w-auto px-2.5 py-1.5 bg-white hover:bg-[#00346f] hover:text-white text-[#00346f] border border-[#c3c6d2] rounded text-xs font-semibold cursor-pointer transition-all"
                              >
                                ${drink.prices.single.toFixed(2)}/Guest
                              </button>
                            )}
                            {drink.prices.single !== undefined && drink.prices.gallon !== undefined && <span className="text-[10px] text-gray-300 hidden lg:inline">/</span>}
                            {drink.prices.gallon !== undefined && (
                              <button
                                type="button"
                                onClick={() => toggleSelection(drink.id, `${drink.name} (Per Gallon)`, 'Beverages', drink.prices.gallon, 'Gallon')}
                                className="w-full lg:w-auto px-2.5 py-1.5 bg-[#fed488]/40 hover:bg-[#775a19] hover:text-white text-[#775a19] border border-[#fed488] rounded text-xs font-bold cursor-pointer transition-all"
                              >
                                ${drink.prices.gallon.toFixed(2)}/Gal
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Setup Stations Pricing Info */}
              <div className="p-6 bg-[#fcf8f0]/40 border-t border-[#ededf4] space-y-3">
                <p className="text-xs uppercase font-bold tracking-widest text-[#775a19] font-sans">
                  Beverage Station Setup Options
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded border border-[#c3c6d2]/60 shadow-2xs">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">30–50 Guests</p>
                    <p className="text-lg font-serif font-extrabold text-[#00346f] mt-0.5">Starting at $125</p>
                  </div>
                  <div className="bg-white p-4 rounded border border-[#c3c6d2]/60 shadow-2xs">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">50–100 Guests</p>
                    <p className="text-lg font-serif font-extrabold text-[#00346f] mt-0.5">Starting at $225</p>
                  </div>
                  <div className="bg-white p-4 rounded border border-[#c3c6d2]/60 shadow-2xs">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">100+ Guests</p>
                    <p className="text-lg font-serif font-extrabold text-[#00346f] mt-0.5">Custom Quote</p>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 italic">
                  * 1 Gallon serves approximately 12–15 guests. Station setup includes elegant dispenser rentals, cups, ice, and themed menu cards.
                </p>
              </div>
            </section>

            {/* 9. CAKES & DESSERTS */}
            <section id="cakes-desserts" className="bg-white rounded-lg border border-[#c3c6d2] shadow-sm overflow-hidden scroll-mt-24">
              <div className="bg-[#fcf8f0] px-6 py-5 border-b border-[#ededf4] flex justify-between items-center">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-[#00346f]">Cakes &amp; Desserts</h2>
                  <p className="text-xs text-gray-500 font-sans mt-0.5">Milestone custom celebration cakes and individual desserts at special rates.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#ededf4] bg-[#f9f9ff]">
                      <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans w-1/3">Item</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans w-2/5">Description</th>
                      <th className="py-3 px-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans w-1/4">Pricing Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CAKES_DESSERTS.map((item) => {
                      const priceVal = item.prices.single ?? item.prices.minPrice ?? 0;
                      const hasRateValue = priceVal > 0;
                      const buttonLabel = item.prices.customText ?? `$${priceVal.toFixed(2)} ${item.prices.unitText ? `per ${item.prices.unitText}` : ''}`;
                      return (
                        <tr key={item.id} className="border-b border-[#ededf4]/70 hover:bg-[#f9f9ff]/50 transition-colors">
                          <td className="py-4 px-6">
                            <p className="font-serif font-semibold text-[15px] text-[#00346f]">{item.name}</p>
                          </td>
                          <td className="py-4 px-6 text-xs text-gray-600 font-sans">
                            {item.description}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (hasRateValue) {
                                  toggleSelection(item.id, item.name, 'Cakes & Desserts', priceVal, 'Single');
                                } else {
                                  setIsEnquiryOpen(true);
                                }
                              }}
                              className="px-3 py-1.5 bg-white hover:bg-[#00346f] hover:text-white text-[#00346f] border border-[#c3c6d2] rounded text-xs font-semibold cursor-pointer transition-all inline-flex items-center gap-1.5"
                            >
                              <Plus size={10} />
                              {buttonLabel}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 10. DESSERT TRAYS */}
            {renderTrayCategoryTable(
              'dessert-trays',
              'Dessert Trays',
              'Classical celebratory sweets prepared fresh with reduction milk and pure saffron strings.',
              DESSERT_TRAYS,
              'Dessert Trays'
            )}

            {/* Image strip between Desserts & Specials */}
            <div className="bg-white rounded-lg border border-[#c3c6d2] p-6 shadow-sm overflow-hidden">
              <div className="relative aspect-video rounded overflow-hidden shadow-sm border border-[#c3c6d2]">
                <img 
                  src={dessertsImage}
                  alt="Glossy Gulab Jamun and delicate saffron Rasmalai set on brass trays"
                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                  <p className="text-white text-xs tracking-wider uppercase font-semibold font-sans drop-shadow-sm flex items-center gap-2">
                    <Sparkles size={14} className="text-[#fed488]" /> Traditional Celebration Sweets &amp; Pastries
                  </p>
                </div>
              </div>
            </div>

            {/* 11. SPECIALS */}
            <section id="specials" className="bg-white rounded-lg border border-[#c3c6d2] shadow-sm overflow-hidden scroll-mt-24">
              <div className="bg-[#fcf8f0] px-6 py-5 border-b border-[#ededf4] flex justify-between items-center">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-[#00346f]">Specials</h2>
                  <p className="text-xs text-gray-500 font-sans mt-0.5">Festive comfort meals, Poojas, and traditional weekend bundles.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#ededf4] bg-[#f9f9ff]">
                      <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans w-1/3">Meal Combo</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans w-2/5">Description</th>
                      <th className="py-3 px-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans w-1/4">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SPECIALS.map((item) => {
                      const priceVal = item.prices.single ?? 0;
                      const hasRateValue = priceVal > 0;
                      const buttonLabel = item.prices.customText ?? `$${priceVal.toFixed(2)} per ${item.prices.unitText || 'person'}`;
                      return (
                        <tr key={item.id} className="border-b border-[#ededf4]/70 hover:bg-[#f9f9ff]/50 transition-colors">
                          <td className="py-4 px-6">
                            <p className="font-serif font-semibold text-[15px] text-[#00346f]">{item.name}</p>
                          </td>
                          <td className="py-4 px-6 text-xs text-gray-600 font-sans">
                            {item.description}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (hasRateValue) {
                                  toggleSelection(item.id, item.name, 'Specials', priceVal, 'Single');
                                } else {
                                  setIsEnquiryOpen(true);
                                }
                              }}
                              className="px-3 py-1.5 bg-white hover:bg-[#00346f] hover:text-white text-[#00346f] border border-[#c3c6d2] rounded text-xs font-semibold cursor-pointer transition-all inline-flex items-center gap-1.5"
                            >
                              <Plus size={10} />
                              {buttonLabel}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 12. LIVE COUNTERS */}
            <section id="live-counters" className="bg-white rounded-lg border border-[#c3c6d2] shadow-sm overflow-hidden scroll-mt-24">
              <div className="bg-[#fcf8f0] px-6 py-5 border-b border-[#ededf4] flex justify-between items-center">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-[#00346f]">Live Counters</h2>
                  <p className="text-xs text-gray-500 font-sans mt-0.5">Chef-attended live stations to bring an interactive culinary flourish to your venue.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#ededf4] bg-[#f9f9ff]">
                      <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans w-1/3">Station Type</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans w-1/4">Minimum Guests</th>
                      <th className="py-3 px-6 text-xs text-gray-600 font-sans w-1/4">Description</th>
                      <th className="py-3 px-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans w-1/6">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LIVE_COUNTERS.map((item) => {
                      const priceVal = item.prices.single ?? item.prices.minPrice ?? 0;
                      const buttonLabel = item.prices.customText ?? `$${priceVal.toFixed(2)} per person`;
                      return (
                        <tr key={item.id} className="border-b border-[#ededf4]/70 hover:bg-[#f9f9ff]/50 transition-colors">
                          <td className="py-4 px-6">
                            <p className="font-serif font-semibold text-[15px] text-[#00346f]">{item.name}</p>
                          </td>
                          <td className="py-4 px-6 text-xs font-mono font-bold text-gray-500">
                            {item.minGuests} Guests
                          </td>
                          <td className="py-4 px-6 text-xs text-gray-600 font-sans">
                            {item.description}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              type="button"
                              onClick={() => toggleSelection(item.id, item.name, 'Live Counters', priceVal, 'Single')}
                              className="px-3 py-1.5 bg-white hover:bg-[#00346f] hover:text-white text-[#00346f] border border-[#c3c6d2] rounded text-xs font-semibold cursor-pointer transition-all inline-flex items-center gap-1"
                            >
                              <Plus size={10} />
                              {buttonLabel}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Staffing Charges details */}
              <div className="p-6 bg-gray-50 border-t border-[#ededf4] space-y-3">
                <p className="text-xs uppercase font-bold tracking-widest text-[#775a19] font-sans">
                  Live Station Staffing Charges
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded border border-gray-200 shadow-2xs">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">30–50 Guests</p>
                    <p className="text-lg font-serif font-extrabold text-green-700 mt-0.5">Staffing Included</p>
                  </div>
                  <div className="bg-white p-4 rounded border border-gray-200 shadow-2xs">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">50–100 Guests</p>
                    <p className="text-lg font-serif font-extrabold text-[#00346f] mt-0.5">+$75 surcharge</p>
                  </div>
                  <div className="bg-white p-4 rounded border border-gray-200 shadow-2xs">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">100+ Guests</p>
                    <p className="text-lg font-serif font-extrabold text-[#00346f] mt-0.5">+$150–$250 range</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 13. PORTION & SERVICE ADD-ONS */}
            <section id="portions" className="scroll-mt-24">
              <div className="bg-[#00346f] text-white rounded-lg p-6 lg:p-10 shadow-lg relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 pointer-events-none">
                  <Utensils size={360} />
                </div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                  
                  {/* Left: Portion Guide */}
                  <div className="space-y-6">
                    <h3 className="font-serif font-bold text-2xl border-b border-white/20 pb-3 flex items-center gap-2">
                      <Layers size={20} className="text-[#fed488]" /> Portion Guide
                    </h3>
                    <div className="space-y-4">
                      {PORTION_GUIDES.map((guide) => (
                        <div key={guide.size} className="flex gap-4 items-start">
                          <div className="bg-white/10 px-3 py-1.5 rounded text-xs font-mono font-bold tracking-widest text-[#fed488] shrink-0 mt-0.5">
                            {guide.size}
                          </div>
                          <div>
                            <p className="font-sans font-semibold text-[15px]">{guide.serves}</p>
                            <p className="text-xs text-white/70 font-sans mt-1 leading-relaxed">{guide.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Service Add-ons */}
                  <div className="space-y-6">
                    <h3 className="font-serif font-bold text-2xl border-b border-white/20 pb-3 flex items-center gap-2">
                      <Sparkles size={20} className="text-[#fed488]" /> Service Add-ons
                    </h3>
                    <div className="space-y-4">
                      {SERVICE_ADDONS.map((addon) => {
                        const isApplied = appliedAddons.includes(addon.id);
                        return (
                          <div 
                            key={addon.id} 
                            onClick={() => {
                              if (isApplied) {
                                setAppliedAddons(appliedAddons.filter(id => id !== addon.id));
                              } else {
                                setAppliedAddons([...appliedAddons, addon.id]);
                              }
                            }}
                            className={`flex justify-between items-start gap-3 p-3 rounded border transition-all cursor-pointer ${
                              isApplied 
                                ? 'bg-white/15 border-[#fed488]' 
                                : 'bg-white/5 border-transparent hover:bg-white/10'
                            }`}
                          >
                            <div className="flex-1">
                              <p className="font-sans font-semibold text-[15px] flex items-center gap-2">
                                {addon.name}
                                {isApplied && <span className="text-[9px] uppercase tracking-wider bg-[#fed488] text-[#00346f] font-extrabold px-1.5 py-0.5 rounded">Active</span>}
                              </p>
                              <p className="text-xs text-white/70 mt-1 font-sans leading-relaxed">{addon.description}</p>
                            </div>
                            <span className="font-mono text-xs font-bold text-[#fed488] shrink-0">
                              {addon.priceText}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* --- Dynamic Consultation Summary section --- */}
            <section id="consultation-summary" className="bg-white rounded-lg border-t-4 border-b border-x border-[#775a19] shadow-md p-6 lg:p-8 space-y-6 transition-all scroll-mt-24">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-bold tracking-widest text-[#775a19] flex items-center gap-1.5 font-sans mb-1">
                    <ShoppingBag size={14} /> Design Your Catering Proposal
                  </span>
                  <h3 className="font-serif font-bold text-2xl text-[#00346f]">Catering Inquiry Summary</h3>
                  <p className="text-xs text-gray-500 font-sans mt-0.5">Adjust selections and quantities, calculate estimated totals, and submit instantly to our team.</p>
                </div>
                {selectedItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedItems([])}
                    className="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={13} /> Reset Menu
                  </button>
                )}
              </div>

              {selectedItems.length === 0 ? (
                <div className="text-center py-10 bg-[#f9f9ff] border-2 border-dashed border-[#c3c6d2] rounded-lg">
                  <p className="text-sm text-gray-500 max-w-sm mx-auto font-sans leading-relaxed">
                    Your proposal draft is empty. Select dish portions, flatbread counts, or desserts above, or use our <strong>Portion &amp; Tray Planner</strong> on the left grid!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="divide-y divide-[#ededf4]">
                    {selectedItems.map((item) => (
                      <div key={`${item.id}-${item.size}`} className="py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-sans font-semibold text-gray-800 text-sm flex items-center gap-2">
                            {item.name}
                            {item.size && item.size !== 'Single' && (
                              <span className="text-[10px] uppercase font-bold text-[#775a19] bg-[#fed488]/30 px-2 py-0.5 rounded-sm">
                                {formatSize(item.size)}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400 font-sans">{item.category}</p>
                        </div>
                        
                        <div className="flex items-center gap-6 justify-between lg:justify-end">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.size, -1)}
                              className="p-1 text-gray-500 hover:text-red-600 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center font-bold text-sm text-[#00346f]">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.size, 1)}
                              className="p-1 text-gray-500 hover:text-emerald-600 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          
                          <div className="text-right min-w-[80px]">
                            <span className="font-serif font-bold text-sm text-[#00346f]">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id, item.size)}
                              className="text-gray-300 hover:text-red-500 ml-4 transition-colors cursor-pointer"
                              title="Delete item"
                            >
                              &times;
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {appliedAddons.length > 0 && (
                    <div className="bg-[#f0f4ff] p-3 rounded-md border border-[#abc7ff]/30 space-y-1.5">
                      <p className="text-[10px] font-bold text-[#00346f] uppercase tracking-wider">Applied Services</p>
                      {SERVICE_ADDONS.filter(addon => appliedAddons.includes(addon.id)).map(addon => (
                        <div key={addon.id} className="flex justify-between text-xs text-gray-700 font-sans">
                          <span>{addon.name} {addon.id === 'sa_table_decor' ? '(Starts at)' : ''}</span>
                          <span className="font-semibold">${addon.basePrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 border-t border-[#ededf4] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1 text-left">
                      <p className="text-xs text-gray-500">Proposal Estimated Total:</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl lg:text-3xl font-serif font-bold text-[#00346f]">
                          ${getGrandTotal().toFixed(2)}
                        </span>
                        {appliedAddons.length > 0 && <span className="text-xs text-gray-400 font-sans font-medium">(including services)</span>}
                      </div>
                    </div>

                    <div className="flex gap-2 w-full lg:w-auto">
                      <button
                        type="button"
                        onClick={handleDownloadMenuTxt}
                        className="flex-1 lg:flex-none border border-[#775a19] text-[#775a19] hover:bg-[#775a19]/5 px-4 py-2.5 rounded text-xs uppercase font-bold tracking-wider transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileDown size={14} /> Export Menu (.txt)
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEnquiryOpen(true)}
                        className="flex-1 lg:flex-none bg-[#00346f] hover:bg-[#114589] text-white px-6 py-2.5 rounded text-xs uppercase font-extrabold tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Enquire Proposal <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </section>

          </div>

        </div>
      </main>

      {/* Footer / Print actions */}
      <section className="bg-white border-t border-[#ededf4] py-10 text-center space-y-4">
        <p className="text-xs text-gray-500 font-sans max-w-md mx-auto italic">
          Note: All prices are subject to seasonal changes and availability. Taxes not included. Portions can be refined to meet customized dietary parameters.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={handleDownloadMenuTxt}
            className="px-6 py-3 border border-[#775a19] hover:bg-[#775a19]/10 text-[#775a19] rounded font-mono text-xs uppercase tracking-widest font-semibold cursor-pointer transition-all duration-300"
          >
            Download Full TXT Menu
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-6 py-3 bg-[#f3f3f9] hover:bg-[#ededf4] text-[#00346f] rounded font-mono text-xs uppercase tracking-widest font-semibold cursor-pointer transition-all duration-300"
          >
            Print Guide
          </button>
        </div>
      </section>

      <EnquiryModal 
        isOpen={isEnquiryOpen} 
        onClose={() => setIsEnquiryOpen(false)} 
        selectedItems={selectedItems}
        onClearItems={() => setSelectedItems([])}
        serviceAddons={SERVICE_ADDONS.filter(a => appliedAddons.includes(a.id)).map(a => ({ name: a.name, price: a.basePrice }))}
      />

    </div>
  );
}
