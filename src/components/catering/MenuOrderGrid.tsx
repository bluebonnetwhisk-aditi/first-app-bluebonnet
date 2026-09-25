import { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Filter, 
  Sparkles,
  Utensils,
  Coffee,
  Cake,
  Flame
} from 'lucide-react';
import type { CartItem, Category, MenuItem, TraySize, Allergen } from '../../types/catering';
import { DESI_DABBA_ITEMS } from '../../data/desiDabbaMenu';

interface MenuOrderGridProps {
  cart: CartItem[];
  onUpdateCartItem: (
    menuItem: MenuItem,
    selectionType: TraySize | 'pack_30' | 'gallon' | 'cake_custom',
    quantity: number,
    selectionLabel: string,
    unitPrice: number
  ) => void;
}

const CATEGORY_TABS: { key: Category | 'all'; label: string; icon: any }[] = [
  { key: 'all', label: 'Full Menu', icon: Utensils },
  { key: 'mains', label: 'Paneer & Mains', icon: Flame },
  { key: 'sabzi', label: 'Dry Sabzi', icon: Utensils },
  { key: 'dal', label: 'Dal & Curries', icon: Flame },
  { key: 'starters', label: 'Starters & Indo-Chinese', icon: Utensils },
  { key: 'rice', label: 'Rice & Sides', icon: Utensils },
  { key: 'desserts', label: 'Desserts', icon: Sparkles },
  { key: 'breads', label: 'Breads (30 pcs)', icon: Utensils },
  { key: 'beverages', label: 'Beverages (Gallon)', icon: Coffee },
  { key: 'cakes', label: 'Custom Cakes', icon: Cake },
];

export default function MenuOrderGrid({ cart, onUpdateCartItem }: MenuOrderGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [allergenFilter, setAllergenFilter] = useState<Allergen[]>([]);
  const [satvikOnly, setSatvikOnly] = useState(false);

  // Helper to get current quantity of a specific selection in cart
  const getItemQuantity = (menuItemId: string, selectionType: string): number => {
    const item = cart.find(
      c => c.menuItemId === menuItemId && c.selectionType === selectionType
    );
    return item ? item.quantity : 0;
  };

  // Helper to toggle allergen filter
  const toggleAllergen = (a: Allergen) => {
    setAllergenFilter(prev => 
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    );
  };

  // Filtered dishes
  const filteredItems = useMemo(() => {
    return DESI_DABBA_ITEMS.filter(item => {
      // Category check
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'rice' && (item.category === 'rice' || item.category === 'sides')) {
          // keep
        } else if (item.category !== selectedCategory) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesTier = item.tier?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesTier) return false;
      }

      // Allergen filter (exclude items that have the selected allergens if user selected exclusion, or show only safe)
      // Here: if allergen selected, show items containing that allergen OR exclude?
      // Convention: User chooses allergens they want to filter or avoid
      if (allergenFilter.length > 0) {
        // Exclude items that contain any of the selected allergens (allergy avoidance)
        const hasForbidden = allergenFilter.some(a => item.allergens.includes(a));
        if (hasForbidden) return false;
      }

      // Satvik filter
      if (satvikOnly && !item.isSatvikAvailable) {
        return false;
      }

      return true;
    });
  }, [selectedCategory, searchQuery, allergenFilter, satvikOnly]);

  return (
    <div id="catering-menu-grid" className="w-full font-sans">
      
      {/* ── FILTER & SEARCH BAR ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-xs">
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

        {/* Category Navigation Pills */}
        <div className="mt-4 pt-3 border-t border-gray-150 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map(tab => {
            const Icon = tab.icon;
            const isSelected = selectedCategory === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedCategory(tab.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#00346f] text-white shadow-sm'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#ffdea5]' : 'text-gray-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── DISHES GRID ── */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center my-6">
          <p className="text-gray-500 text-sm font-medium">
            No dishes match your selected filters. Try clearing your search or allergen filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setAllergenFilter([]);
              setSatvikOnly(false);
              setSelectedCategory('all');
            }}
            className="mt-3 text-xs font-bold text-[#00346f] underline cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map(item => {
            // Check if any quantity of this dish is in cart
            const totalDishCount = cart
              .filter(c => c.menuItemId === item.id)
              .reduce((sum, c) => sum + c.quantity, 0);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                  totalDishCount > 0
                    ? 'border-[#00346f] shadow-md ring-1 ring-[#00346f]/20 bg-blue-50/10'
                    : 'border-gray-200 hover:border-[#775a19]/40 shadow-xs'
                }`}
              >
                <div>
                  {/* Top line: Name, Tier badge, Allergen pills */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif font-bold text-base text-gray-900 leading-snug">
                          {item.name}
                        </h3>
                        {item.tier && (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            item.tier === 'Maharaja'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : item.tier === 'Darbari'
                              ? 'bg-[#775a19]/10 text-[#775a19] border border-[#775a19]/25'
                              : item.tier === 'Shahi'
                              ? 'bg-[#00346f]/10 text-[#00346f] border border-[#00346f]/25'
                              : 'bg-gray-100 text-gray-800 border border-gray-300'
                          }`}>
                            {item.tier}
                          </span>
                        )}
                        {item.category === 'cakes' && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                            48h Lead Time
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

                  {/* Dietary tags */}
                  <div className="flex items-center gap-2 mt-2 text-[10px] font-medium text-gray-500">
                    {item.isSatvikAvailable && (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        ✓ Satvik / Jain Option Available
                      </span>
                    )}
                    {totalDishCount > 0 && (
                      <span className="text-[#00346f] bg-blue-100 font-bold px-2 py-0.5 rounded">
                        {totalDishCount} in Cart
                      </span>
                    )}
                  </div>
                </div>

                {/* ── STEPPER CONTROLS ── */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  {item.pricingType === 'tray' && item.trayPricing && (
                    <div className="grid grid-cols-3 gap-2">
                      
                      {/* 1/3 Tray Stepper */}
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 text-center flex flex-col justify-between">
                        <div>
                          <div className="text-[11px] font-bold text-gray-800">1/3 Tray</div>
                          <div className="text-xs font-bold text-[#00346f]">${item.trayPricing.third}</div>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 mt-2">
                          <button
                            onClick={() => {
                              const curr = getItemQuantity(item.id, 'third');
                              onUpdateCartItem(item, 'third', Math.max(0, curr - 1), '1/3 Tray', item.trayPricing!.third);
                            }}
                            className="w-6 h-6 rounded-md bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-gray-700 cursor-pointer"
                            aria-label={`Decrease 1/3 Tray of ${item.name}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center font-bold text-xs">
                            {getItemQuantity(item.id, 'third')}
                          </span>
                          <button
                            onClick={() => {
                              const curr = getItemQuantity(item.id, 'third');
                              onUpdateCartItem(item, 'third', curr + 1, '1/3 Tray', item.trayPricing!.third);
                            }}
                            className="w-6 h-6 rounded-md bg-[#00346f] hover:bg-[#00224d] text-white flex items-center justify-center cursor-pointer shadow-xs"
                            aria-label={`Increase 1/3 Tray of ${item.name}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Half Tray Stepper */}
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 text-center flex flex-col justify-between">
                        <div>
                          <div className="text-[11px] font-bold text-gray-800">Half Tray</div>
                          <div className="text-xs font-bold text-[#00346f]">${item.trayPricing.half}</div>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 mt-2">
                          <button
                            onClick={() => {
                              const curr = getItemQuantity(item.id, 'half');
                              onUpdateCartItem(item, 'half', Math.max(0, curr - 1), 'Half Tray', item.trayPricing!.half);
                            }}
                            className="w-6 h-6 rounded-md bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-gray-700 cursor-pointer"
                            aria-label={`Decrease Half Tray of ${item.name}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center font-bold text-xs">
                            {getItemQuantity(item.id, 'half')}
                          </span>
                          <button
                            onClick={() => {
                              const curr = getItemQuantity(item.id, 'half');
                              onUpdateCartItem(item, 'half', curr + 1, 'Half Tray', item.trayPricing!.half);
                            }}
                            className="w-6 h-6 rounded-md bg-[#00346f] hover:bg-[#00224d] text-white flex items-center justify-center cursor-pointer shadow-xs"
                            aria-label={`Increase Half Tray of ${item.name}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Full Tray Stepper */}
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 text-center flex flex-col justify-between">
                        <div>
                          <div className="text-[11px] font-bold text-gray-800">Full Tray</div>
                          <div className="text-xs font-bold text-[#00346f]">${item.trayPricing.full}</div>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 mt-2">
                          <button
                            onClick={() => {
                              const curr = getItemQuantity(item.id, 'full');
                              onUpdateCartItem(item, 'full', Math.max(0, curr - 1), 'Full Tray', item.trayPricing!.full);
                            }}
                            className="w-6 h-6 rounded-md bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-gray-700 cursor-pointer"
                            aria-label={`Decrease Full Tray of ${item.name}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center font-bold text-xs">
                            {getItemQuantity(item.id, 'full')}
                          </span>
                          <button
                            onClick={() => {
                              const curr = getItemQuantity(item.id, 'full');
                              onUpdateCartItem(item, 'full', curr + 1, 'Full Tray', item.trayPricing!.full);
                            }}
                            className="w-6 h-6 rounded-md bg-[#00346f] hover:bg-[#00224d] text-white flex items-center justify-center cursor-pointer shadow-xs"
                            aria-label={`Increase Full Tray of ${item.name}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Breads Stepper */}
                  {item.pricingType === 'bread' && item.pricePer30Pcs && (
                    <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                      <div>
                        <span className="text-xs font-bold text-gray-800 block">Pack of 30 Pieces</span>
                        <span className="text-xs font-bold text-[#00346f]">${item.pricePer30Pcs} / 30 pcs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const curr = getItemQuantity(item.id, 'pack_30');
                            onUpdateCartItem(item, 'pack_30', Math.max(0, curr - 1), 'Pack of 30 pcs', item.pricePer30Pcs!);
                          }}
                          className="w-7 h-7 rounded-md bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-gray-700 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-bold text-xs">
                          {getItemQuantity(item.id, 'pack_30')}
                        </span>
                        <button
                          onClick={() => {
                            const curr = getItemQuantity(item.id, 'pack_30');
                            onUpdateCartItem(item, 'pack_30', curr + 1, 'Pack of 30 pcs', item.pricePer30Pcs!);
                          }}
                          className="w-7 h-7 rounded-md bg-[#00346f] hover:bg-[#00224d] text-white flex items-center justify-center cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Beverages Stepper */}
                  {item.pricingType === 'beverage' && item.pricePerGallon && (
                    <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                      <div>
                        <span className="text-xs font-bold text-gray-800 block">Gallon Jug (~16-20 Servings)</span>
                        <span className="text-xs font-bold text-[#00346f]">${item.pricePerGallon} / gallon</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const curr = getItemQuantity(item.id, 'gallon');
                            onUpdateCartItem(item, 'gallon', Math.max(0, curr - 1), 'Gallon (16-20 serv)', item.pricePerGallon!);
                          }}
                          className="w-7 h-7 rounded-md bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-gray-700 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-bold text-xs">
                          {getItemQuantity(item.id, 'gallon')}
                        </span>
                        <button
                          onClick={() => {
                            const curr = getItemQuantity(item.id, 'gallon');
                            onUpdateCartItem(item, 'gallon', curr + 1, 'Gallon (16-20 serv)', item.pricePerGallon!);
                          }}
                          className="w-7 h-7 rounded-md bg-[#00346f] hover:bg-[#00224d] text-white flex items-center justify-center cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Celebration Cake Stepper */}
                  {item.pricingType === 'cake' && (
                    <div className="flex items-center justify-between bg-rose-50/60 p-2.5 rounded-xl border border-rose-200">
                      <div>
                        <span className="text-xs font-bold text-gray-800 block">8&quot; Eggless Celebration Cake</span>
                        <span className="text-xs font-bold text-[#00346f]">$85.00 (Serves 15-20)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const curr = getItemQuantity(item.id, 'cake_custom');
                            onUpdateCartItem(item, 'cake_custom', Math.max(0, curr - 1), '8" Eggless Cake', 85);
                          }}
                          className="w-7 h-7 rounded-md bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-gray-700 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-bold text-xs">
                          {getItemQuantity(item.id, 'cake_custom')}
                        </span>
                        <button
                          onClick={() => {
                            const curr = getItemQuantity(item.id, 'cake_custom');
                            onUpdateCartItem(item, 'cake_custom', curr + 1, '8" Eggless Cake', 85);
                          }}
                          className="w-7 h-7 rounded-md bg-[#00346f] hover:bg-[#00224d] text-white flex items-center justify-center cursor-pointer shadow-xs"
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
  );
}
