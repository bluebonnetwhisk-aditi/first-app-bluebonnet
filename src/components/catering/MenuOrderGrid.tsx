import { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Filter, 
  Check, 
  Sparkles, 
  Utensils, 
  Coffee, 
  Flame, 
  ChevronDown, 
  ChevronUp,
  Trash2,
  SlidersHorizontal,
  ChevronsUpDown
} from 'lucide-react';
import type { CartItem, Category, MenuItem, TraySize, Allergen } from '../../types/catering';
import { DESI_DABBA_ITEMS } from '../../data/desiDabbaMenu';

interface MenuOrderGridProps {
  cart: CartItem[];
  onUpdateCartItem: (
    menuItem: MenuItem,
    selectionType: TraySize | 'pack_30' | 'pieces' | 'gallon' | 'cake_custom',
    quantity: number,
    selectionLabel: string,
    unitPrice: number,
    customNotes?: string
  ) => void;
  onRemoveCartItem?: (cartItemId: string) => void;
}

interface SectionDef {
  key: string;
  category: Category;
  title: string;
  subtitle: string;
  icon: any;
}

const MENU_SECTIONS: SectionDef[] = [
  {
    key: 'mains',
    category: 'mains',
    title: 'Paneer & Premium Mains',
    subtitle: 'Royal gravies, cottage cheese specialties & vegetarian curries',
    icon: Flame
  },
  {
    key: 'dal',
    category: 'dal',
    title: 'Dal & Curries',
    subtitle: 'Slow-simmered lentils, Amritsari chole, rajma & halwai curries',
    icon: Flame
  },
  {
    key: 'sabzi',
    category: 'sabzi',
    title: 'Dry Sabzi',
    subtitle: 'Homestyle spiced garden vegetables, aloo gobhi & roasted bharwa baingan',
    icon: Utensils
  },
  {
    key: 'rice',
    category: 'rice',
    title: 'Rice',
    subtitle: 'Aromatic basmati specialties, jeera rice & vegetable pulao',
    icon: Utensils
  },
  {
    key: 'sides',
    category: 'sides',
    title: 'Sides',
    subtitle: 'Cooling whipped yogurts, boondi raita & fresh garden salads',
    icon: Utensils
  },
  {
    key: 'starters',
    category: 'starters',
    title: 'Starters & Indo-Chinese',
    subtitle: 'Wok-tossed noodles, manchurian, crispy pakodas & street chaat',
    icon: Utensils
  },
  {
    key: 'breads',
    category: 'breads',
    title: 'Breads (Min. 30 pieces)',
    subtitle: 'Poori, Methi Poori ($0.90/pc) • Naan, Garlic Naan, Dal Kachori, Bedmi Poori ($1.40/pc)',
    icon: Utensils
  },
  {
    key: 'desserts',
    category: 'desserts',
    title: 'Desserts',
    subtitle: 'Slow-cooked kheer, dry fruit halwa, shahi tukda & warm gulab jamun',
    icon: Sparkles
  },
  {
    key: 'beverages',
    category: 'beverages',
    title: 'Beverages (Per Gallon)',
    subtitle: 'Mango lassi, spiced masala chaas & fresh brewed masala chai (~16–20 servings)',
    icon: Coffee
  }
];

export default function MenuOrderGrid({ 
  cart, 
  onUpdateCartItem 
}: MenuOrderGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [allergenFilter, setAllergenFilter] = useState<Allergen[]>([]);
  const [satvikOnly, setSatvikOnly] = useState(false);

  // Accordion open/collapse state (all open by default)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    MENU_SECTIONS.forEach(s => { initial[s.key] = true; });
    return initial;
  });

  // Toggle single section
  const toggleSection = (key: string) => {
    setOpenSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Expand all / Collapse all toggle
  const allOpen = Object.values(openSections).every(Boolean);
  const toggleAllSections = () => {
    const nextState = !allOpen;
    const updated: Record<string, boolean> = {};
    MENU_SECTIONS.forEach(s => { updated[s.key] = nextState; });
    setOpenSections(updated);
  };

  // Helper to toggle allergen filter
  const toggleAllergen = (a: Allergen) => {
    setAllergenFilter(prev => 
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    );
  };

  // Helper to get current quantity of a specific selection in cart
  const getItemQuantity = (menuItemId: string, selectionType: string): number => {
    const item = cart.find(
      c => c.menuItemId === menuItemId && c.selectionType === selectionType
    );
    return item ? item.quantity : 0;
  };

  // Filter dishes by search and dietary filters
  const filteredDishesBySection = useMemo(() => {
    const map: Record<string, MenuItem[]> = {};

    MENU_SECTIONS.forEach(section => {
      const dishes = DESI_DABBA_ITEMS.filter(item => {
        // Category check
        if (item.category !== section.category) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = item.name.toLowerCase().includes(q);
          const matchesDesc = item.description.toLowerCase().includes(q);
          const matchesTier = item.tier?.toLowerCase().includes(q);
          if (!matchesName && !matchesDesc && !matchesTier) return false;
        }

        // Allergen filter (exclude forbidden allergens)
        if (allergenFilter.length > 0) {
          const hasForbidden = allergenFilter.some(a => item.allergens.includes(a));
          if (hasForbidden) return false;
        }

        // Satvik filter
        if (satvikOnly && !item.isSatvikAvailable) {
          return false;
        }

        return true;
      });

      map[section.key] = dishes;
    });

    return map;
  }, [searchQuery, allergenFilter, satvikOnly]);

  // Scroll to section helper
  const scrollToSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: true }));
    const el = document.getElementById(`section-${key}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div id="catering-menu-grid" className="w-full font-sans space-y-6">
      
      {/* ── FILTER & SEARCH BAR ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search dishes (e.g. Shahi Paneer, Dal Makhani, Poori, Lassi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#00346f] focus:bg-white transition-all"
            />
          </div>

          {/* Allergen Avoidance Filters & Satvik Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Exclude:</span>
            </div>

            {(['D', 'G', 'N', 'S'] as Allergen[]).map(a => {
              const active = allergenFilter.includes(a);
              const labelMap: Record<Allergen, string> = {
                D: 'Dairy (D)',
                G: 'Gluten (G)',
                N: 'Nuts (N)',
                S: 'Soy (S)'
              };
              return (
                <button
                  key={a}
                  onClick={() => toggleAllergen(a)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider transition-all cursor-pointer border ${
                    active
                      ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                  }`}
                  title={`Exclude dishes with ${labelMap[a]}`}
                >
                  {active ? `✕ No ${a}` : `No ${a}`}
                </button>
              );
            })}

            <button
              onClick={() => setSatvikOnly(!satvikOnly)}
              className={`px-3 py-1 rounded-md text-[11px] font-bold tracking-wider transition-all cursor-pointer border ${
                satvikOnly
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
              }`}
            >
              {satvikOnly ? '✓ Satvik / Jain Friendly' : 'Satvik / Jain Only'}
            </button>
          </div>

        </div>

        {/* Category Navigation Pills & Expand/Collapse All Button */}
        <div className="mt-4 pt-3 border-t border-gray-150 flex flex-wrap items-center justify-between gap-2">
          
          {/* Quick jump pills */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" /> Jump:
            </span>
            {MENU_SECTIONS.map(s => {
              const cartItemsForSection = cart.filter(c => s.key === 'cakes' ? c.category === 'cakes' : c.category === s.category);
              const count = cartItemsForSection.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => scrollToSection(s.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1.5 ${
                    count > 0
                      ? 'bg-[#00346f] text-white border-[#00346f] shadow-2xs'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  <span>{s.title.split(' ')[0]}</span>
                  {count > 0 && (
                    <span className="bg-[#ffdea5] text-[#00346f] text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Toggle All Accordions button */}
          <button
            type="button"
            onClick={toggleAllSections}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#00346f] hover:text-[#00224d] bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 px-3 py-1.5 rounded-xl cursor-pointer transition-all ml-auto"
          >
            <ChevronsUpDown className="w-3.5 h-3.5" />
            <span>{allOpen ? 'Collapse All' : 'Expand All Sections'}</span>
          </button>

        </div>
      </div>

      {/* ── COLLAPSIBLE MENU SECTIONS ACCORDIONS ── */}
      <div className="space-y-6">
        {MENU_SECTIONS.map(section => {
          const isOpen = openSections[section.key] ?? true;
          const dishes = filteredDishesBySection[section.key] || [];
          const Icon = section.icon;

          // Cart items for this section
          const sectionCartItems = cart.filter(c => {
            if (section.key === 'cakes') return c.category === 'cakes';
            return c.category === section.category;
          });
          const sectionCartCount = sectionCartItems.reduce((s, i) => s + i.quantity, 0);
          const sectionSubtotal = sectionCartItems.reduce((s, i) => s + i.totalPrice, 0);

          // If search/filter is active and no dishes match in this section, hide section
          const isFilterActive = searchQuery.trim() || allergenFilter.length > 0 || satvikOnly;
          if (isFilterActive && dishes.length === 0) {
            return null;
          }

          return (
            <div 
              key={section.key} 
              id={`section-${section.key}`}
              className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden transition-all scroll-mt-28"
            >
              
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleSection(section.key)}
                className={`w-full p-4 sm:p-5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                  isOpen ? 'bg-gray-50/80 border-b border-gray-200' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    sectionCartCount > 0
                      ? 'bg-[#00346f] text-[#ffdea5] border-[#00346f]'
                      : 'bg-blue-50 text-[#00346f] border-blue-100'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-base sm:text-lg text-[#00346f]">
                        {section.title}
                      </h3>
                      <span className="text-[11px] text-gray-500 font-sans">
                        ({dishes.length} dishes)
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 hidden sm:block mt-0.5">
                      {section.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Active selection badge */}
                  {sectionCartCount > 0 && (
                    <span className="bg-[#ffdea5] text-[#00346f] px-2.5 py-1 rounded-full text-xs font-black shadow-2xs flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{sectionCartCount} Selected (${sectionSubtotal.toFixed(2)})</span>
                    </span>
                  )}

                  <div className="p-1 rounded-lg text-gray-500 hover:text-gray-900 bg-white border border-gray-200">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Accordion Body */}
              {isOpen && (
                <div className="p-4 sm:p-6 bg-white animate-fade-in">
                  
                  {section.category === 'breads' ? (
                    
                    /* ── BREADS GRID (PER-PIECE SELECTION & DYNAMIC CALCULATION) ── */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dishes.map(item => {
                        const unitPrice = item.unitPricePiece || (item.pricePer30Pcs ? item.pricePer30Pcs / 30 : 0.90);
                        const minPieces = item.minPieces || 30;

                        // Find if this bread is in the cart
                        const cartBread = cart.find(
                          c => c.menuItemId === item.id && (c.selectionType === 'pieces' || c.selectionType === 'pack_30')
                        );
                        const pieceQty = cartBread ? cartBread.quantity : 0;
                        const hasSelection = pieceQty > 0;
                        const breadTotal = Math.round(pieceQty * unitPrice * 100) / 100;

                        return (
                          <div
                            key={item.id}
                            className={`rounded-2xl p-4 sm:p-5 border transition-all duration-200 flex flex-col justify-between ${
                              hasSelection
                                ? 'border-[#00346f] bg-blue-50/40 shadow-sm ring-1 ring-[#00346f]/20'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div>
                              {/* Header info */}
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-serif font-bold text-base text-gray-900">
                                      {item.name}
                                    </h4>
                                    <span className="text-[11px] font-bold text-[#775a19] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                      ${unitPrice.toFixed(2)} / pc
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {item.description}
                                  </p>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                                    Min. {minPieces} pcs
                                  </span>
                                  <span className="text-xs font-mono font-bold text-gray-800">
                                    (${ (minPieces * unitPrice).toFixed(2) } base)
                                  </span>
                                </div>
                              </div>

                              {/* Satvik tag & Selection badge */}
                              <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-gray-100 text-[10px]">
                                {item.isSatvikAvailable ? (
                                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                                    ✓ Satvik Available
                                  </span>
                                ) : <span />}

                                {hasSelection && (
                                  <span className="flex items-center gap-1 bg-[#00346f] text-white font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                                    <Check className="w-3 h-3 text-[#ffdea5]" />
                                    <span>{pieceQty} Pieces Selected</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Stepper & Piece Input Controls */}
                            <div className="mt-4 pt-3 border-t border-gray-150">
                              <div className={`p-3 rounded-xl border transition-all ${
                                hasSelection
                                  ? 'bg-[#00346f] text-white border-[#00346f] shadow-sm'
                                  : 'bg-gray-50 border-gray-200'
                              }`}>
                                <div className="flex items-center justify-between gap-2">
                                  <div>
                                    <span className={`text-[11px] font-bold block ${hasSelection ? 'text-white' : 'text-gray-800'}`}>
                                      Quantity in Pieces (Min. {minPieces})
                                    </span>
                                    {hasSelection ? (
                                      <span className="text-xs font-black text-[#ffdea5]">
                                        {pieceQty} pcs &times; ${unitPrice.toFixed(2)} = ${breadTotal.toFixed(2)}
                                      </span>
                                    ) : (
                                      <span className="text-[11px] text-gray-500">
                                        Enter any piece count &ge; {minPieces}
                                      </span>
                                    )}
                                  </div>

                                  {/* Interactive Controls */}
                                  <div className="flex items-center gap-1.5">
                                    {hasSelection && (
                                      <button
                                        type="button"
                                        onClick={() => onUpdateCartItem(item, 'pieces', 0, '', unitPrice)}
                                        className="p-1 rounded text-white/70 hover:text-white mr-1 cursor-pointer"
                                        title="Remove bread selection"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (pieceQty <= minPieces) {
                                          onUpdateCartItem(item, 'pieces', 0, '', unitPrice);
                                        } else {
                                          const next = pieceQty - 5;
                                          onUpdateCartItem(item, 'pieces', next, `${next} pieces ($${unitPrice.toFixed(2)}/pc)`, unitPrice);
                                        }
                                      }}
                                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                        hasSelection 
                                          ? 'bg-white/20 hover:bg-white/30 text-white' 
                                          : 'bg-white border border-gray-300 hover:bg-gray-100 text-gray-700'
                                      }`}
                                      aria-label={`Decrease pieces of ${item.name}`}
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Direct Piece Quantity Number Input */}
                                    <input
                                      type="number"
                                      min={minPieces}
                                      step={5}
                                      value={pieceQty === 0 ? '' : pieceQty}
                                      placeholder={minPieces.toString()}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value, 10);
                                        if (isNaN(val) || val <= 0) {
                                          onUpdateCartItem(item, 'pieces', 0, '', unitPrice);
                                        } else {
                                          onUpdateCartItem(item, 'pieces', val, `${val} pieces ($${unitPrice.toFixed(2)}/pc)`, unitPrice);
                                        }
                                      }}
                                      className={`w-14 text-center font-black text-xs py-1 rounded-lg border focus:outline-none transition-colors ${
                                        hasSelection
                                          ? 'bg-white text-[#00346f] border-white shadow-2xs'
                                          : 'bg-white text-gray-800 border-gray-300'
                                      }`}
                                    />

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const next = pieceQty === 0 ? minPieces : pieceQty + 5;
                                        onUpdateCartItem(item, 'pieces', next, `${next} pieces ($${unitPrice.toFixed(2)}/pc)`, unitPrice);
                                      }}
                                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                        hasSelection 
                                          ? 'bg-[#ffdea5] hover:bg-white text-[#00346f] font-black' 
                                          : 'bg-[#00346f] hover:bg-[#00224d] text-white font-bold'
                                      }`}
                                      aria-label={`Increase pieces of ${item.name}`}
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Quick Preset Buttons */}
                                <div className="mt-2 pt-2 border-t border-white/20 flex flex-wrap items-center gap-1.5">
                                  <span className={`text-[10px] ${hasSelection ? 'text-white/70' : 'text-gray-400'}`}>
                                    Presets:
                                  </span>
                                  {[minPieces, minPieces + 15, minPieces + 30, minPieces + 45, 100].map(qty => (
                                    <button
                                      key={qty}
                                      type="button"
                                      onClick={() => onUpdateCartItem(item, 'pieces', qty, `${qty} pieces ($${unitPrice.toFixed(2)}/pc)`, unitPrice)}
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                        pieceQty === qty
                                          ? 'bg-[#ffdea5] text-[#00346f]'
                                          : hasSelection
                                          ? 'bg-white/10 hover:bg-white/20 text-white'
                                          : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                                      }`}
                                    >
                                      {qty} pcs
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>

                  ) : (
                    
                    /* ── STANDARD TRAYS & DISHES GRID ── */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dishes.map(item => {
                        const thirdQty = getItemQuantity(item.id, 'third');
                        const halfQty = getItemQuantity(item.id, 'half');
                        const fullQty = getItemQuantity(item.id, 'full');
                        const gallonQty = getItemQuantity(item.id, 'gallon');
                        const totalDishCount = thirdQty + halfQty + fullQty + gallonQty;
                        const hasSelection = totalDishCount > 0;

                        return (
                          <div
                            key={item.id}
                            className={`rounded-2xl p-4 sm:p-5 border transition-all duration-200 flex flex-col justify-between ${
                              hasSelection
                                ? 'border-[#00346f] bg-blue-50/40 shadow-sm ring-1 ring-[#00346f]/20'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div>
                              {/* Header info */}
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-serif font-bold text-base text-gray-900">
                                      {item.name}
                                    </h4>
                                    {item.tier && (
                                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                        item.tier === 'Maharaja' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                                        item.tier === 'Darbari' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                                        item.tier === 'Shahi' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                                        'bg-gray-100 text-gray-800 border border-gray-200'
                                      }`}>
                                        {item.tier}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    {item.description}
                                  </p>
                                </div>

                                {/* Allergens pills */}
                                <div className="flex items-center gap-1 shrink-0">
                                  {item.allergens.map(a => (
                                    <span
                                      key={a}
                                      className="w-5 h-5 rounded-full bg-gray-100 text-gray-700 border border-gray-300 flex items-center justify-center font-mono font-bold text-[10px]"
                                      title={`Contains ${a}`}
                                    >
                                      {a}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Dietary tags & Selected Confirmation Badge */}
                              <div className="flex items-center justify-between gap-2 mt-2.5 text-[10px] font-medium">
                                {item.isSatvikAvailable ? (
                                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                                    ✓ Satvik Option Available
                                  </span>
                                ) : <span />}

                                {hasSelection && (
                                  <span className="flex items-center gap-1 bg-[#00346f] text-white font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                                    <Check className="w-3 h-3 text-[#ffdea5]" />
                                    <span>{totalDishCount} Selected</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* ── STEPPER CONTROLS ── */}
                            <div className="mt-4 pt-3 border-t border-gray-100">
                              {item.pricingType === 'tray' && item.trayPricing && (
                                <div className="grid grid-cols-3 gap-2">
                                  
                                  {/* 1/3 Tray Stepper */}
                                  <div className={`rounded-xl p-2.5 text-center flex flex-col justify-between transition-all duration-200 ${
                                    thirdQty > 0
                                      ? 'bg-[#00346f] text-white border-2 border-[#00346f] shadow-md ring-2 ring-[#ffdea5]/50 scale-[1.02]'
                                      : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
                                  }`}>
                                    <div>
                                      <div className={`text-[11px] font-bold ${thirdQty > 0 ? 'text-white' : 'text-gray-800'}`}>
                                        1/3 Tray
                                      </div>
                                      <div className={`text-xs font-black ${thirdQty > 0 ? 'text-[#ffdea5]' : 'text-[#00346f]'}`}>
                                        ${item.trayPricing.third}
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-1.5 mt-2">
                                      <button
                                        onClick={() => onUpdateCartItem(item, 'third', Math.max(0, thirdQty - 1), '1/3 Tray', item.trayPricing!.third)}
                                        className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer transition-colors ${
                                          thirdQty > 0 
                                            ? 'bg-white/20 hover:bg-white/30 text-white' 
                                            : 'bg-white border border-gray-300 hover:bg-gray-100 text-gray-700'
                                        }`}
                                        aria-label={`Decrease 1/3 Tray of ${item.name}`}
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className={`w-6 text-center font-black text-xs ${
                                        thirdQty > 0 
                                          ? 'bg-white text-[#00346f] rounded px-1 py-0.5 shadow-xs' 
                                          : 'text-gray-900'
                                      }`}>
                                        {thirdQty}
                                      </span>
                                      <button
                                        onClick={() => onUpdateCartItem(item, 'third', thirdQty + 1, '1/3 Tray', item.trayPricing!.third)}
                                        className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer shadow-xs transition-colors ${
                                          thirdQty > 0 
                                            ? 'bg-[#ffdea5] hover:bg-white text-[#00346f] font-black' 
                                            : 'bg-[#00346f] hover:bg-[#00224d] text-white'
                                        }`}
                                        aria-label={`Increase 1/3 Tray of ${item.name}`}
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Half Tray Stepper */}
                                  <div className={`rounded-xl p-2.5 text-center flex flex-col justify-between transition-all duration-200 ${
                                    halfQty > 0
                                      ? 'bg-[#00346f] text-white border-2 border-[#00346f] shadow-md ring-2 ring-[#ffdea5]/50 scale-[1.02]'
                                      : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
                                  }`}>
                                    <div>
                                      <div className={`text-[11px] font-bold ${halfQty > 0 ? 'text-white' : 'text-gray-800'}`}>
                                        Half Tray
                                      </div>
                                      <div className={`text-xs font-black ${halfQty > 0 ? 'text-[#ffdea5]' : 'text-[#00346f]'}`}>
                                        ${item.trayPricing.half}
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-1.5 mt-2">
                                      <button
                                        onClick={() => onUpdateCartItem(item, 'half', Math.max(0, halfQty - 1), 'Half Tray', item.trayPricing!.half)}
                                        className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer transition-colors ${
                                          halfQty > 0 
                                            ? 'bg-white/20 hover:bg-white/30 text-white' 
                                            : 'bg-white border border-gray-300 hover:bg-gray-100 text-gray-700'
                                        }`}
                                        aria-label={`Decrease Half Tray of ${item.name}`}
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className={`w-6 text-center font-black text-xs ${
                                        halfQty > 0 
                                          ? 'bg-white text-[#00346f] rounded px-1 py-0.5 shadow-xs' 
                                          : 'text-gray-900'
                                      }`}>
                                        {halfQty}
                                      </span>
                                      <button
                                        onClick={() => onUpdateCartItem(item, 'half', halfQty + 1, 'Half Tray', item.trayPricing!.half)}
                                        className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer shadow-xs transition-colors ${
                                          halfQty > 0 
                                            ? 'bg-[#ffdea5] hover:bg-white text-[#00346f] font-black' 
                                            : 'bg-[#00346f] hover:bg-[#00224d] text-white'
                                        }`}
                                        aria-label={`Increase Half Tray of ${item.name}`}
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Full Tray Stepper */}
                                  <div className={`rounded-xl p-2.5 text-center flex flex-col justify-between transition-all duration-200 ${
                                    fullQty > 0
                                      ? 'bg-[#00346f] text-white border-2 border-[#00346f] shadow-md ring-2 ring-[#ffdea5]/50 scale-[1.02]'
                                      : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
                                  }`}>
                                    <div>
                                      <div className={`text-[11px] font-bold ${fullQty > 0 ? 'text-white' : 'text-gray-800'}`}>
                                        Full Tray
                                      </div>
                                      <div className={`text-xs font-black ${fullQty > 0 ? 'text-[#ffdea5]' : 'text-[#00346f]'}`}>
                                        ${item.trayPricing.full}
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-1.5 mt-2">
                                      <button
                                        onClick={() => onUpdateCartItem(item, 'full', Math.max(0, fullQty - 1), 'Full Tray', item.trayPricing!.full)}
                                        className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer transition-colors ${
                                          fullQty > 0 
                                            ? 'bg-white/20 hover:bg-white/30 text-white' 
                                            : 'bg-white border border-gray-300 hover:bg-gray-100 text-gray-700'
                                        }`}
                                        aria-label={`Decrease Full Tray of ${item.name}`}
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className={`w-6 text-center font-black text-xs ${
                                        fullQty > 0 
                                          ? 'bg-white text-[#00346f] rounded px-1 py-0.5 shadow-xs' 
                                          : 'text-gray-900'
                                      }`}>
                                        {fullQty}
                                      </span>
                                      <button
                                        onClick={() => onUpdateCartItem(item, 'full', fullQty + 1, 'Full Tray', item.trayPricing!.full)}
                                        className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer shadow-xs transition-colors ${
                                          fullQty > 0 
                                            ? 'bg-[#ffdea5] hover:bg-white text-[#00346f] font-black' 
                                            : 'bg-[#00346f] hover:bg-[#00224d] text-white'
                                        }`}
                                        aria-label={`Increase Full Tray of ${item.name}`}
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>

                                </div>
                              )}

                              {/* Beverages Stepper */}
                              {item.pricingType === 'beverage' && item.pricePerGallon && (
                                <div className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                                  gallonQty > 0
                                    ? 'bg-[#00346f] text-white border-2 border-[#00346f] shadow-md ring-2 ring-[#ffdea5]/50'
                                    : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
                                }`}>
                                  <div>
                                    <span className={`text-xs font-bold block ${gallonQty > 0 ? 'text-white' : 'text-gray-800'}`}>
                                      Gallon Jug (~16–20 Servings)
                                    </span>
                                    <span className={`text-xs font-black ${gallonQty > 0 ? 'text-[#ffdea5]' : 'text-[#00346f]'}`}>
                                      ${item.pricePerGallon} / gallon
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => onUpdateCartItem(item, 'gallon', Math.max(0, gallonQty - 1), 'Gallon (16–20 serv)', item.pricePerGallon!)}
                                      className={`w-7 h-7 rounded-md flex items-center justify-center cursor-pointer transition-colors ${
                                        gallonQty > 0 
                                          ? 'bg-white/20 hover:bg-white/30 text-white' 
                                          : 'bg-white border border-gray-300 hover:bg-gray-100 text-gray-700'
                                      }`}
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className={`w-7 text-center font-black text-xs ${
                                      gallonQty > 0 
                                        ? 'bg-white text-[#00346f] rounded px-1.5 py-0.5 shadow-xs' 
                                        : 'text-gray-900'
                                    }`}>
                                      {gallonQty}
                                    </span>
                                    <button
                                      onClick={() => onUpdateCartItem(item, 'gallon', gallonQty + 1, 'Gallon (16–20 serv)', item.pricePerGallon!)}
                                      className={`w-7 h-7 rounded-md flex items-center justify-center cursor-pointer shadow-xs transition-colors ${
                                        gallonQty > 0 
                                          ? 'bg-[#ffdea5] hover:bg-white text-[#00346f] font-black' 
                                          : 'bg-[#00346f] hover:bg-[#00224d] text-white'
                                      }`}
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
