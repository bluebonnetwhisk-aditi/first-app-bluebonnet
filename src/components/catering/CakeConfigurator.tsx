import { useState } from 'react';
import { 
  Cake as CakeIcon, 
  Sparkles, 
  Plus, 
  Minus, 
  Check, 
  Info, 
  AlertCircle,
  Trash2,
  Leaf
} from 'lucide-react';
import type { CartItem } from '../../types/catering';

export type CakeSize = '6inch' | '8inch';

export interface CakeCategoryTier {
  id: string;
  name: string;
  tagline: string;
  price6: number;
  price8: number;
  flavors: string[];
}

export const CAKE_CATEGORIES: CakeCategoryTier[] = [
  {
    id: 'classic',
    name: 'Classic Favorites',
    tagline: 'Timeless homestyle sponge cakes & signature whipped frostings',
    price6: 40,
    price8: 80,
    flavors: [
      'Vanilla',
      'Chocolate',
      'Black Forest',
      'Pineapple',
      'Strawberry',
      'Red Velvet',
      'Butterscotch',
      'Coffee / Mocha',
      'Salted Caramel'
    ]
  },
  {
    id: 'fusion',
    name: 'Indian Fusion',
    tagline: 'Aromatic mithai infusions, saffron cream & pistachio sponges',
    price6: 50,
    price8: 100,
    flavors: [
      'Rasmalai',
      'Gulab Jamun',
      'Mango',
      'Kesar Pista',
      'Rose Pistachio'
    ]
  },
  {
    id: 'fruit',
    name: 'Fresh & Fruity',
    tagline: 'Zesty citrus curd & whole orchard berry fillings',
    price6: 60,
    price8: 120,
    flavors: [
      'Mixed Berry',
      'Blueberry',
      'Lemon',
      'Orange Chocolate',
      'Fresh Fruit & Cream'
    ]
  },
  {
    id: 'premium',
    name: 'Premium & Indulgent',
    tagline: 'European chocolate ganache, praline crunches & artisan spreads',
    price6: 70,
    price8: 140,
    flavors: [
      'Berry Chantilly',
      'Biscoff',
      'Ferrero Rocher',
      'Nutella Chocolate',
      'Oreo Cookies & Cream',
      'Pistachio Chocolate',
      'Chocolate Hazelnut',
      'Chocolate Caramel',
      'Dark Chocolate Ganache'
    ]
  }
];

const CAKE_SIZES: { id: CakeSize; name: string; serves: string; weight: string }[] = [
  { id: '6inch', name: '6″ Celebration', serves: 'Serves 8–10', weight: '~2 lb' },
  { id: '8inch', name: '8″ Party', serves: 'Serves 16–20', weight: '~4 lb' }
];

interface CakeConfiguratorProps {
  onAddCake: (cake: {
    menuItemId: string;
    name: string;
    size: CakeSize;
    sizeLabel: string;
    category: string;
    categoryLabel: string;
    flavor: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    inscription: string;
    designNotes: string;
    requestCustomTheme: boolean;
    customThemeDetails?: string;
    isEggless: boolean;
  }) => void;
  cartCakes?: CartItem[];
  onRemoveCake?: (cartItemId: string) => void;
}

export default function CakeConfigurator({
  onAddCake,
  cartCakes = [],
  onRemoveCake
}: CakeConfiguratorProps) {
  const [selectedSize, setSelectedSize] = useState<CakeSize>('6inch');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('classic');
  const [selectedFlavor, setSelectedFlavor] = useState<string>('Pineapple');
  const [inscription, setInscription] = useState<string>('');
  const [designNotes, setDesignNotes] = useState<string>('');
  const [requestCustomTheme, setRequestCustomTheme] = useState<boolean>(false);
  const [customThemeDetails, setCustomThemeDetails] = useState<string>('');
  const [isEggless, setIsEggless] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAlert, setAddedAlert] = useState<boolean>(false);

  // Active category definition
  const currentCategory = CAKE_CATEGORIES.find(c => c.id === selectedCategoryId) || CAKE_CATEGORIES[0];

  // Unit price based on size and category
  const unitPrice = selectedSize === '6inch' ? currentCategory.price6 : currentCategory.price8;
  const totalPrice = unitPrice * quantity;

  // Handle switching category
  const handleSelectCategory = (catId: string) => {
    setSelectedCategoryId(catId);
    const cat = CAKE_CATEGORIES.find(c => c.id === catId);
    if (cat && cat.flavors.length > 0) {
      setSelectedFlavor(cat.flavors[0]);
    }
  };

  const handleAddToCart = () => {
    const sizeConfig = CAKE_SIZES.find(s => s.id === selectedSize)!;
    const egglessSuffix = isEggless ? '-eggless' : '';
    const cakeId = `cake-${selectedSize}-${selectedCategoryId}-${selectedFlavor.toLowerCase().replace(/[^a-z0-9]/g, '-')}${egglessSuffix}`;
    
    onAddCake({
      menuItemId: cakeId,
      name: `${selectedFlavor} Cake (${sizeConfig.name})${isEggless ? ' [Eggless]' : ''}`,
      size: selectedSize,
      sizeLabel: `${sizeConfig.name} (${sizeConfig.serves})`,
      category: selectedCategoryId,
      categoryLabel: currentCategory.name,
      flavor: selectedFlavor,
      unitPrice,
      quantity,
      totalPrice,
      inscription: inscription.trim(),
      designNotes: designNotes.trim(),
      requestCustomTheme,
      customThemeDetails: customThemeDetails.trim(),
      isEggless
    });

    // Reset inputs & show alert
    setAddedAlert(true);
    setInscription('');
    setDesignNotes('');
    setRequestCustomTheme(false);
    setCustomThemeDetails('');
    setIsEggless(false);
    setQuantity(1);
    setTimeout(() => setAddedAlert(false), 3500);
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden font-sans">
      
      {/* Header Banner */}
      <div className="bg-linear-to-r from-[#00346f] via-[#002855] to-[#1e3a5f] text-white p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#ffdea5] shrink-0 border border-white/10">
              <CakeIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg sm:text-xl text-white">
                  Cakes &amp; Specialty Bakes Configurator
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/90 text-white px-2 py-0.5 rounded-full border border-rose-300/30">
                  48h Notice
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                Artisan celebration cakes crafted fresh for your birthdays, anniversaries &amp; milestone gatherings. Available eggless on request.
              </p>
            </div>
          </div>
          
          <div className="inline-flex items-center gap-1.5 self-start sm:self-auto bg-emerald-500/20 text-[#ffdea5] px-3 py-1.5 rounded-full border border-emerald-400/30 text-xs font-semibold">
            <Leaf className="w-3.5 h-3.5 text-emerald-300" />
            <span>Eggless Option on Request</span>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7 space-y-6">

        {/* ── STEP 1: SIZING SELECTORS (Pill Cards) ── */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5">
            1. Select Cake Size &amp; Gathering Portions
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CAKE_SIZES.map(s => {
              const isSelected = selectedSize === s.id;
              const price = s.id === '6inch' ? currentCategory.price6 : currentCategory.price8;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSize(s.id)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-[#00346f] bg-blue-50/50 shadow-sm ring-2 ring-[#00346f]/20'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-serif font-bold text-base text-[#00346f]">
                        {s.name}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5 font-medium">
                        {s.serves} • {s.weight}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-gray-900">
                        ${price}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        base tier
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#00346f] text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-[#ffdea5]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── STEP 2: FLAVOR CATEGORIES & TIERED PRICING ── */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5">
            2. Choose Flavor Collection &amp; Recipe Tier
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {CAKE_CATEGORIES.map(cat => {
              const isCatSelected = selectedCategoryId === cat.id;
              const catPrice = selectedSize === '6inch' ? cat.price6 : cat.price8;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isCatSelected
                      ? 'border-[#00346f] bg-[#00346f] text-white shadow-md ring-2 ring-[#ffdea5]/50 scale-[1.01]'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50/60 text-gray-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isCatSelected ? 'text-white' : 'text-[#00346f]'}`}>
                        {cat.name}
                      </span>
                      <span className={`text-xs font-black ${isCatSelected ? 'text-[#ffdea5]' : 'text-gray-900'}`}>
                        ${catPrice}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1 line-clamp-2 ${isCatSelected ? 'text-white/80' : 'text-gray-500'}`}>
                      {cat.tagline}
                    </p>
                  </div>
                  <div className={`text-[10px] mt-2 pt-2 border-t font-semibold ${
                    isCatSelected ? 'border-white/20 text-[#ffdea5]' : 'border-gray-200 text-gray-600'
                  }`}>
                    {cat.flavors.length} Flavors Available
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── STEP 3: FLAVOR SELECTION (Interactive Cards) ── */}
        <div className="bg-gray-50/70 p-4 sm:p-5 rounded-2xl border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-900">
                3. Select Flavor in {currentCategory.name}
              </span>
              <p className="text-[11px] text-gray-500">
                {selectedCategoryId === 'classic' && 'Pineapple & Strawberry are exclusive to Classic Favorites.'}
                {selectedCategoryId === 'fusion' && 'Authentic Indian mithai flavors including Rasmalai, Gulab Jamun & Mango.'}
                {selectedCategoryId === 'fruit' && 'Whole berry compotes, fresh curds & light fruit creams.'}
                {selectedCategoryId === 'premium' && 'Decadent European ganache, Biscoff, Ferrero Rocher & chocolate hazelnut.'}
              </p>
            </div>
            <span className="text-xs font-bold text-[#00346f] bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs">
              Selected: <strong className="text-gray-900">{selectedFlavor}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {currentCategory.flavors.map(flavor => {
              const isFlavorSelected = selectedFlavor === flavor;
              return (
                <button
                  key={flavor}
                  type="button"
                  onClick={() => setSelectedFlavor(flavor)}
                  className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                    isFlavorSelected
                      ? 'border-[#00346f] bg-[#00346f] text-white shadow-xs ring-1 ring-[#00346f]'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="truncate">{flavor}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── STEP 4: CUSTOMIZATION INPUTS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Inscription on Cake */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-700">
                Inscription / Message on Cake
              </label>
              <span className="text-[10px] text-gray-400 font-mono">
                {inscription.length}/50 chars
              </span>
            </div>
            <input
              type="text"
              maxLength={50}
              placeholder="e.g. Happy 10th Birthday Aarav!"
              value={inscription}
              onChange={(e) => setInscription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#00346f]"
            />
          </div>

          {/* Design & Decoration Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Design &amp; Decoration Notes
            </label>
            <textarea
              rows={2}
              placeholder="Color theme, piping style, sprinkles, candle age number..."
              value={designNotes}
              onChange={(e) => setDesignNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#00346f]"
            />
          </div>

        </div>

        {/* Eggless Option on Request Checkbox */}
        <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isEggless}
              onChange={(e) => setIsEggless(e.target.checked)}
              className="mt-0.5 rounded border-emerald-300 text-emerald-700 focus:ring-emerald-700 cursor-pointer"
            />
            <div className="text-xs text-emerald-950">
              <span className="font-bold flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                Bake as 100% Eggless / Pure Vegetarian (Available on Request)
              </span>
              <p className="text-[11px] text-emerald-800 mt-0.5 leading-snug">
                Available upon request at zero extra charge. Our signature egg-free sponge recipes deliver heavenly moisture, cloud-like crumb, and authentic richness.
              </p>
            </div>
          </label>
        </div>

        {/* Custom Theme / Additional Customization Checkbox & Dynamic Input Box */}
        <div className="space-y-3 p-4 rounded-xl bg-purple-50/70 border border-purple-200">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={requestCustomTheme}
              onChange={(e) => setRequestCustomTheme(e.target.checked)}
              className="mt-0.5 rounded border-purple-300 text-purple-700 focus:ring-purple-700"
            />
            <div className="text-xs text-purple-950">
              <span className="font-bold">Request Custom Theme / Additional Customization (Additional quote required)</span>
              <p className="text-[11px] text-purple-800 mt-0.5 leading-snug">
                Check this if you require custom fondant toppers, character themes, cartoon figurines, multi-tier tiers, edible prints, or floral cascades.
              </p>
            </div>
          </label>

          {/* Dynamic box to enter the required customization */}
          {requestCustomTheme && (
            <div className="pt-3 border-t border-purple-200/80 space-y-1.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-purple-950">
                  Required Customization / Theme Details <span className="text-rose-600">*</span>
                </label>
                <span className="text-[10px] text-purple-600 font-semibold">Specialty Baker Review</span>
              </div>
              <textarea
                rows={3}
                placeholder="Please describe your theme in detail (e.g. 2-tier Peppa Pig theme in pastel pink & gold, fondant clouds, custom edible topper with name, and star sprinkles...)"
                value={customThemeDetails}
                onChange={(e) => setCustomThemeDetails(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-purple-400 text-gray-800 shadow-2xs"
              />
              <p className="text-[10px] text-purple-700">
                Our head cake designer will review your theme specifications and confirm any additional decoration charges prior to fulfillment.
              </p>
            </div>
          )}
        </div>

        {/* ── PRICE SUMMARY, QUANTITY & ADD BUTTON ── */}
        <div className="bg-gray-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-200">
          
          <div className="text-center sm:text-left">
            <div className="text-xs text-gray-500 font-medium">
              {selectedFlavor} • {selectedSize === '6inch' ? '6″ Celebration (Serves 8-10)' : '8″ Party (Serves 16-20)'}
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-serif font-black text-2xl text-[#00346f]">
                ${totalPrice.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500">
                (${unitPrice.toFixed(2)} each)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quantity Stepper */}
            <div className="flex items-center bg-white border border-gray-300 rounded-xl p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-bold text-xs text-gray-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="bg-[#00346f] hover:bg-[#00224d] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#ffdea5]" />
              <span>Add Cake to Order</span>
            </button>
          </div>

        </div>

        {/* Success Alert */}
        {addedAlert && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fade-in font-medium">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>✓ Custom cake has been added to your catering order estimate!</span>
          </div>
        )}

        {/* Existing Configured Cakes List in Cart */}
        {cartCakes.length > 0 && (
          <div className="pt-2 border-t border-gray-150 space-y-2">
            <span className="text-xs font-bold text-gray-700 block">
              Configured Cakes in Current Order ({cartCakes.length})
            </span>
            <div className="space-y-2">
              {cartCakes.map(cake => (
                <div key={cake.id} className="p-3 bg-blue-50/40 rounded-xl border border-blue-200/60 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-[#00346f]">{cake.name}</span>
                    <span className="text-gray-500 block text-[11px] mt-0.5">
                      {cake.selectionLabel} &times; {cake.quantity}
                    </span>
                    {cake.notes && (
                      <span className="text-[11px] text-gray-600 italic block mt-0.5">
                        {cake.notes}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-black text-gray-900">${cake.totalPrice.toFixed(2)}</span>
                    {onRemoveCake && (
                      <button
                        type="button"
                        onClick={() => onRemoveCake(cake.id)}
                        className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                        title="Remove cake"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── REQUIRED DISCLAIMERS ── */}
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 text-[11px] text-amber-900 leading-relaxed">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              <strong>Note:</strong> Elaborate custom themes, fondant figurines, or multi-tier designs may incur additional charges. We will confirm your design after order submission.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              <strong>Dietary &amp; Ingredients:</strong> Available as 100% eggless upon request (simply check the eggless box above). For vegan, gluten-free, or specific dietary modifications, please include details in the notes.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
