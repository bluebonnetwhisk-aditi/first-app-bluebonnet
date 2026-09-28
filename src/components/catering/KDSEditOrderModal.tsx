import { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  DollarSign, 
  Check, 
  AlertCircle, 
  Save, 
  FileEdit,
  Percent,
  Search,
  UtensilsCrossed
} from 'lucide-react';
import type { CateringOrder, CartItem } from '../../types/catering';
import { DESI_DABBA_ITEMS } from '../../data/desiDabbaMenu';
import { updateOrderDetails } from '../../services/supabase';

interface KDSEditOrderModalProps {
  order: CateringOrder;
  onClose: () => void;
  onOrderUpdated: () => void;
}

function parseInitialOrderItems(order: CateringOrder): CartItem[] {
  let rawItems: any[] = [];
  if (Array.isArray(order.items)) {
    rawItems = JSON.parse(JSON.stringify(order.items));
  } else if (typeof order.items === 'string') {
    try {
      const p = JSON.parse(order.items);
      if (Array.isArray(p)) rawItems = p;
    } catch {}
  }

  if (rawItems.length > 0) {
    return rawItems.map((item, idx) => {
      let dishName = item.name || item.title || item.dishName || item.itemName || item.item_name || item.label || item.description || '';
      
      // If dishName is generic (e.g. Dabba plan name) and notes contains specific dishes (e.g. "Dal + Sabzi"), combine them
      if (item.notes && (!dishName || /dabba|tiffin|plan|daily tubs|tub/i.test(dishName))) {
        if (dishName && !dishName.includes(item.notes)) {
          dishName = `${dishName} - ${item.notes}`;
        } else if (!dishName) {
          dishName = item.notes;
        }
      }

      if (!dishName) {
        dishName = item.selectionLabel || `Dish Item #${idx + 1}`;
      }

      const quantity = Math.max(1, Number(item.quantity) || 1);
      const unitPrice = Math.max(0, Number(item.unitPrice ?? item.price ?? item.unit_price) || 0);
      const totalPrice = Math.max(0, Number(item.totalPrice ?? item.total_price) || Math.round(unitPrice * quantity * 100) / 100);
      return {
        ...item,
        id: item.id || `item-${idx}-${Date.now()}`,
        name: dishName,
        category: item.category || 'mains',
        categoryLabel: item.categoryLabel || 'Mains',
        selectionLabel: item.selectionLabel || item.selectionType || item.portion || item.size || 'Half Tray',
        quantity,
        unitPrice,
        totalPrice
      };
    });
  }

  if (order.order_description && typeof order.order_description === 'string') {
    const segments = order.order_description.split(/;|\n/).map(s => s.trim()).filter(Boolean);
    const extracted: CartItem[] = [];

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i].replace(/^•\s*/, '');
      const priceMatch = seg.match(/\[\$(\d+(?:\.\d{1,2})?)\]/) || seg.match(/\$?(\d+(?:\.\d{1,2})?)\s*$/);
      const totalPrice = priceMatch ? parseFloat(priceMatch[1]) : 0;

      const qtyMatch = seg.match(/(?:Qty:|×|x|\*)\s*(\d+)/i) || seg.match(/\((\d+)\s*(?:pcs|trays|tubs)?\)/i);
      const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
      const unitPrice = quantity > 0 ? Math.round((totalPrice / quantity) * 100) / 100 : totalPrice;

      let name = seg
        .replace(/\(Portion × \d+\)/i, '')
        .replace(/\(\d+\s*pcs\)/i, '')
        .replace(/-\s*Qty:.*$/i, '')
        .replace(/\[\$[\d.]+\].*$/, '')
        .trim();

      if (!name) name = `Dish #${i + 1}`;

      extracted.push({
        id: `extracted-${i}-${Date.now()}`,
        menuItemId: `extracted-${i}`,
        name,
        category: 'mains',
        categoryLabel: 'Mains',
        selectionType: 'pieces',
        selectionLabel: 'Half Tray',
        quantity,
        unitPrice,
        totalPrice: totalPrice || Math.round(unitPrice * quantity * 100) / 100,
        allergens: [],
        leadTimeHours: 0
      });
    }

    if (extracted.length > 0) return extracted;
  }

  return [];
}

export default function KDSEditOrderModal({
  order,
  onClose,
  onOrderUpdated
}: KDSEditOrderModalProps) {
  const [items, setItems] = useState<CartItem[]>(() => parseInitialOrderItems(order));

  // Two discount sections: Percent (%) discount and Fixed Amount ($) discount
  const [percentDiscountInput, setPercentDiscountInput] = useState<string>('');
  const [percentDiscountReason, setPercentDiscountReason] = useState<string>('');
  const [fixedDiscountInput, setFixedDiscountInput] = useState<string>(() => {
    return order.discount_amount && order.discount_amount > 0 ? String(order.discount_amount) : '';
  });
  const [fixedDiscountReason, setFixedDiscountReason] = useState<string>(order.discount_reason || '');

  // Add new item state with dynamic menu search
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPortion, setNewItemPortion] = useState('Half Tray');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(50.00);
  const [newItemNotes, setNewItemNotes] = useState('');
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Categorize items
  const tiffinTotal = items
    .filter(item => item.category === 'tiffin' || (item.menuItemId && item.menuItemId.includes('tiffin')))
    .reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  const cakeSubtotal = items
    .filter(item => item.category === 'cakes')
    .reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  const cateringSubtotal = items
    .filter(item => item.category !== 'cakes' && item.category !== 'tiffin' && (!item.menuItemId || !item.menuItemId.includes('tiffin')))
    .reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  const grossFood = tiffinTotal + cakeSubtotal + cateringSubtotal;
  const deliveryFee = order.delivery_fee || 0;
  
  // Percent discount calculation
  const percentVal = Math.max(0, parseFloat(percentDiscountInput) || 0);
  const percentDiscountDollars = Math.round((grossFood * percentVal / 100) * 100) / 100;

  // Fixed number discount calculation
  const fixedDiscountDollars = Math.max(0, parseFloat(fixedDiscountInput) || 0);

  const totalDiscountDollars = Math.min(grossFood, Math.round((percentDiscountDollars + fixedDiscountDollars) * 100) / 100);

  // Pro-rate discount across categories if any discount applied
  const discountRatio = grossFood > 0 ? (1 - (totalDiscountDollars / grossFood)) : 1;
  const netTiffinTotal = tiffinTotal * discountRatio;
  const netCateringSubtotal = cateringSubtotal * discountRatio;
  const netCakeSubtotal = cakeSubtotal * discountRatio;

  const tiffinBase = Math.round((netTiffinTotal / 1.0825) * 100) / 100;
  const tiffinTax = Math.round((netTiffinTotal - tiffinBase) * 100) / 100;

  const cateringTaxable = netCateringSubtotal + (netCateringSubtotal > 0 && deliveryFee > 0 ? deliveryFee : 0);
  const cateringTax = Math.round(cateringTaxable * 0.0825 * 100) / 100;

  const taxAmount = Math.round((tiffinTax + cateringTax) * 100) / 100;
  const foodSubtotal = Math.round((tiffinBase + netCateringSubtotal + netCakeSubtotal) * 100) / 100;

  const netBeforeCardFee = Math.round((foodSubtotal + deliveryFee + taxAmount) * 100) / 100;
  
  const isCreditCard = order.payment_method === 'credit_card';
  const processingFee = isCreditCard ? Math.round(netBeforeCardFee * 0.035 * 100) / 100 : 0;
  
  const grandTotal = Math.round((netBeforeCardFee + processingFee) * 100) / 100;

  // Change name of item
  const handleItemNameChange = (idx: number, newName: string) => {
    setItems(prev => {
      const copy = [...prev];
      copy[idx].name = newName;
      return copy;
    });
  };

  // Change quantity of item
  const handleItemQtyChange = (idx: number, delta: number) => {
    setItems(prev => {
      const copy = [...prev];
      const newQty = copy[idx].quantity + delta;
      if (newQty <= 0) {
        return copy.filter((_, i) => i !== idx);
      }
      copy[idx].quantity = newQty;
      copy[idx].totalPrice = Math.round(copy[idx].unitPrice * newQty * 100) / 100;
      return copy;
    });
  };

  // Change unit price of item
  const handleItemUnitPriceChange = (idx: number, newPrice: number) => {
    setItems(prev => {
      const copy = [...prev];
      copy[idx].unitPrice = Math.max(0, newPrice);
      copy[idx].totalPrice = Math.round(copy[idx].unitPrice * copy[idx].quantity * 100) / 100;
      return copy;
    });
  };

  // Delete item
  const handleDeleteItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  // Add new custom item with dynamic menu search & portion size
  const handleAddNewItem = () => {
    if (!newItemName.trim()) return;

    const newItem: CartItem = {
      id: `kds-custom-${Date.now().toString(36)}`,
      menuItemId: `custom-${Date.now()}`,
      name: newItemName.trim(),
      category: 'mains',
      categoryLabel: 'Mains',
      selectionType: 'pieces',
      selectionLabel: newItemPortion.trim() || 'Half Tray',
      quantity: newItemQty,
      unitPrice: newItemPrice,
      totalPrice: Math.round(newItemPrice * newItemQty * 100) / 100,
      allergens: [],
      leadTimeHours: 0,
      notes: newItemNotes.trim() || undefined
    };

    setItems(prev => [...prev, newItem]);
    setNewItemName('');
    setNewItemPortion('Half Tray');
    setNewItemQty(1);
    setNewItemPrice(50.00);
    setNewItemNotes('');
    setShowAddItem(false);
    setShowMenuDropdown(false);
  };

  // Save changes to Supabase
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    const orderDescription = items
      .map(i => `${i.name}${i.notes ? ` [${i.notes}]` : ''} (${i.selectionLabel} × ${i.quantity}) [$${(i.unitPrice * i.quantity).toFixed(2)}]`)
      .join('; ');

    const combinedReason = [
      percentVal > 0 ? `${percentVal}% off${percentDiscountReason ? ` (${percentDiscountReason})` : ''}` : '',
      fixedDiscountDollars > 0 ? `$${fixedDiscountDollars.toFixed(2)} off${fixedDiscountReason ? ` (${fixedDiscountReason})` : ''}` : ''
    ].filter(Boolean).join(' + ');

    const updates: Partial<CateringOrder> = {
      items,
      food_subtotal: Math.round(foodSubtotal * 100) / 100,
      tax_amount: taxAmount,
      processing_fee: processingFee,
      discount_amount: totalDiscountDollars,
      discount_reason: totalDiscountDollars > 0 ? combinedReason : null,
      rebate_amount: 0,
      rebate_reason: null,
      total_amount: grandTotal,
      order_description: orderDescription
    };

    try {
      const ok = await updateOrderDetails(order.id, updates);
      if (ok) {
        setSaveSuccess(true);
        setTimeout(() => {
          onOrderUpdated();
          onClose();
        }, 1200);
      } else {
        throw new Error('Could not persist changes to Supabase');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update order');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-fade-in font-sans">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-2 sm:my-6 max-h-[96vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#00346f] text-white p-3.5 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileEdit className="w-5 h-5 text-[#ffdea5] shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffdea5] block truncate">
                BLUEBONNET ORDER MODIFIER
              </span>
              <h3 className="font-serif text-sm sm:text-lg font-bold truncate">
                Edit Order #{order.id.slice(0, 8).toUpperCase()} — {order.customer_name}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
          
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>✓ Order items &amp; totals successfully updated and synced!</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ── 1. ITEMIZED ORDER DISHES & QUANTITIES ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-sm text-[#00346f] uppercase tracking-wider">
                Order Items ({items.length})
              </h4>
              <button
                type="button"
                onClick={() => setShowAddItem(!showAddItem)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00346f]/10 text-[#00346f] hover:bg-[#00346f]/20 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item to Order</span>
              </button>
            </div>

            {/* Quick Add Form with Dynamic Catering Menu Search */}
            {showAddItem && (
              <div className="p-3.5 sm:p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#00346f] flex items-center gap-1.5">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-[#00346f]" />
                    <span>Add Dish from Catering Menu or Custom Item</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddItem(false)}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  {/* Search / Dish Name Input */}
                  <div className="relative sm:col-span-6">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search catering menu or enter dish name..."
                        value={newItemName}
                        onChange={(e) => {
                          setNewItemName(e.target.value);
                          setShowMenuDropdown(true);
                        }}
                        onFocus={() => setShowMenuDropdown(true)}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#00346f] font-bold text-gray-900"
                      />
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Dynamic Menu Dropdown */}
                    {showMenuDropdown && newItemName.trim().length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-250 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                        {DESI_DABBA_ITEMS.filter(m => 
                          m.name.toLowerCase().includes(newItemName.toLowerCase()) || 
                          m.categoryLabel.toLowerCase().includes(newItemName.toLowerCase())
                        ).length > 0 ? (
                          DESI_DABBA_ITEMS.filter(m => 
                            m.name.toLowerCase().includes(newItemName.toLowerCase()) || 
                            m.categoryLabel.toLowerCase().includes(newItemName.toLowerCase())
                          ).slice(0, 10).map(m => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setNewItemName(m.name);
                                setNewItemPrice(m.trayPricing?.half || m.pricePer30Pcs || m.unitPricePiece || 50.00);
                                setNewItemPortion(m.pricingType === 'tray' ? 'Half Tray' : m.pricingType === 'bread' ? '30 Pcs' : '16 oz Container');
                                setShowMenuDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center justify-between border-b border-gray-100 last:border-0 cursor-pointer text-xs"
                            >
                              <div>
                                <span className="font-bold text-gray-900 block">{m.name}</span>
                                <span className="text-[10px] text-gray-500 block">{m.categoryLabel} {m.tier ? `• ${m.tier}` : ''}</span>
                              </div>
                              <span className="font-mono text-[11px] font-bold text-[#00346f]">
                                ${m.trayPricing?.half || m.pricePer30Pcs || m.unitPricePiece || 50.00}
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="p-2.5 text-[11px] text-gray-500 italic text-center">
                            Custom entry: "{newItemName}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Portion Size Input */}
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Portion (e.g. Half Tray / 16 oz)"
                      value={newItemPortion}
                      onChange={(e) => setNewItemPortion(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#00346f]"
                    />
                  </div>

                  {/* Price Input */}
                  <div className="sm:col-span-3 flex items-center gap-1">
                    <span className="text-xs text-gray-400 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Unit Price"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#00346f] text-right font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Notes & Confirm Add Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <input
                    type="text"
                    placeholder="Notes or description (e.g. Satvik / Extra Spicy)"
                    value={newItemNotes}
                    onChange={(e) => setNewItemNotes(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#00346f]"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewItem}
                    className="px-4 py-2 bg-[#00346f] text-white text-xs font-bold rounded-lg hover:bg-[#00224d] cursor-pointer shrink-0 text-center"
                  >
                    Confirm Add
                  </button>
                </div>
              </div>
            )}

            {/* Items List */}
            {items.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400 text-xs">
                No items in this order. Click "Add Item to Order" above.
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={item.id || idx} className="p-3 sm:p-3.5 bg-white border border-gray-250 rounded-xl space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3 shadow-2xs">
                    
                    {/* Dish Name & Portion inputs */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => handleItemNameChange(idx, e.target.value)}
                        placeholder="Dish Name"
                        className="w-full font-bold text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 focus:border-[#00346f] focus:outline-none focus:ring-1 focus:ring-[#00346f]"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={item.selectionLabel || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setItems(prev => {
                              const copy = [...prev];
                              copy[idx].selectionLabel = val;
                              return copy;
                            });
                          }}
                          placeholder="Portion Size (e.g. Half Tray / 16 oz)"
                          className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-250 rounded-lg px-2 py-1 focus:bg-white focus:border-[#00346f] focus:outline-none"
                        />
                        <input
                          type="text"
                          value={item.notes || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setItems(prev => {
                              const copy = [...prev];
                              copy[idx].notes = val;
                              return copy;
                            });
                          }}
                          placeholder="Notes / Description"
                          className="w-full text-xs text-gray-600 bg-gray-50 border border-gray-250 rounded-lg px-2 py-1 focus:bg-white focus:border-[#00346f] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Controls Row: Price, Qty, Subtotal, Delete */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-150 shrink-0">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-gray-400 font-bold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleItemUnitPriceChange(idx, parseFloat(e.target.value) || 0)}
                          className="w-16 px-1.5 py-1 text-xs text-right border border-gray-300 rounded-lg font-mono font-bold focus:border-[#00346f]"
                        />
                      </div>

                      <div className="flex items-center gap-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded-lg border border-gray-200">
                        <button
                          type="button"
                          onClick={() => handleItemQtyChange(idx, -1)}
                          className="w-6 h-6 rounded hover:bg-white text-gray-700 flex items-center justify-center cursor-pointer transition-colors"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-5 text-center font-bold text-xs text-gray-900">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleItemQtyChange(idx, 1)}
                          className="w-6 h-6 rounded hover:bg-white text-gray-700 flex items-center justify-center cursor-pointer transition-colors"
                          title="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="w-16 text-right font-mono font-bold text-xs text-gray-900">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(idx)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── 2. DISCOUNTS (PERCENT & FIXED NUMBER) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-purple-50/60 border border-purple-200">
            {/* Percent Discount */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-purple-950 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-purple-700" />
                  <span>Percent Discount (%)</span>
                </span>
                {percentVal > 0 && (
                  <span className="text-[11px] font-mono font-bold text-purple-700">
                    -${percentDiscountDollars.toFixed(2)}
                  </span>
                )}
              </label>
              <div className="flex items-center gap-2">
                <div className="relative w-24">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    placeholder="Enter %"
                    value={percentDiscountInput}
                    onChange={(e) => setPercentDiscountInput(e.target.value)}
                    className="w-full pl-2.5 pr-6 py-1.5 text-xs bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-purple-700 font-bold pointer-events-none">%</span>
                </div>
                <input
                  type="text"
                  placeholder="Reason (e.g. VIP 10% Family)"
                  value={percentDiscountReason}
                  onChange={(e) => setPercentDiscountReason(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Fixed Dollar Discount */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-purple-950 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-purple-700" />
                  <span>Fixed Discount ($)</span>
                </span>
                {fixedDiscountDollars > 0 && (
                  <span className="text-[11px] font-mono font-bold text-purple-700">
                    -${fixedDiscountDollars.toFixed(2)}
                  </span>
                )}
              </label>
              <div className="flex items-center gap-2">
                <div className="relative w-28">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-purple-700 font-bold pointer-events-none">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                    value={fixedDiscountInput}
                    onChange={(e) => setFixedDiscountInput(e.target.value)}
                    className="w-full pl-6 pr-2.5 py-1.5 text-xs bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Reason (e.g. Goodwill credit)"
                  value={fixedDiscountReason}
                  onChange={(e) => setFixedDiscountReason(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* ── 3. FINANCIAL SUMMARY BREAKDOWN ── */}
          <div className="bg-gray-100 rounded-xl p-4 space-y-2 text-xs border border-gray-250">
            <div className="flex justify-between text-gray-600">
              <span>Gross Food Subtotal:</span>
              <span className="font-bold text-gray-900">${foodSubtotal.toFixed(2)}</span>
            </div>

            {percentDiscountDollars > 0 && (
              <div className="flex justify-between text-purple-800 font-semibold">
                <span>Percent Discount ({percentVal}%{percentDiscountReason ? ` - ${percentDiscountReason}` : ''}):</span>
                <span>-${percentDiscountDollars.toFixed(2)}</span>
              </div>
            )}

            {fixedDiscountDollars > 0 && (
              <div className="flex justify-between text-purple-800 font-semibold">
                <span>Fixed Discount {fixedDiscountReason ? `(${fixedDiscountReason})` : ''}:</span>
                <span>-${fixedDiscountDollars.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee:</span>
              <span className="font-bold text-gray-900">${deliveryFee.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Texas Sales Tax (8.25%):</span>
              <span className="font-bold text-gray-900">${taxAmount.toFixed(2)}</span>
            </div>

            {isCreditCard && processingFee > 0 && (
              <div className="flex justify-between text-amber-800 font-bold">
                <span>Card Processing Surcharge (3.5%):</span>
                <span>+${processingFee.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-gray-300 flex justify-between items-baseline text-base font-bold text-[#00346f]">
              <span>Adjusted Grand Total:</span>
              <span className="font-serif text-xl">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-100 border-t border-gray-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 uppercase tracking-wider"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveChanges}
            className="inline-flex items-center gap-2 bg-[#00346f] hover:bg-[#00224d] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#ffdea5]" />
            <span>{isSaving ? 'Syncing with Supabase...' : 'Save & Sync to Supabase'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
