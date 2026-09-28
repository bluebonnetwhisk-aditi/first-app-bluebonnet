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
  Percent
} from 'lucide-react';
import type { CateringOrder, CartItem } from '../../types/catering';
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
      const dishName = item.name || item.title || item.dishName || item.itemName || item.item_name || item.label || item.description || `Dish Item #${idx + 1}`;
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const unitPrice = Math.max(0, Number(item.unitPrice ?? item.price ?? item.unit_price) || 0);
      const totalPrice = Math.max(0, Number(item.totalPrice ?? item.total_price) || Math.round(unitPrice * quantity * 100) / 100);
      return {
        ...item,
        id: item.id || `item-${idx}-${Date.now()}`,
        name: dishName,
        category: item.category || 'mains',
        categoryLabel: item.categoryLabel || 'Mains',
        selectionLabel: item.selectionLabel || item.selectionType || item.portion || item.size || 'Standard Portion',
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
        selectionLabel: 'Order Item',
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
  // Do NOT prepopulate any numbers in the discount inputs
  const [percentDiscountInput, setPercentDiscountInput] = useState<string>('');
  const [percentDiscountReason, setPercentDiscountReason] = useState<string>('');
  const [fixedDiscountInput, setFixedDiscountInput] = useState<string>(() => {
    return order.discount_amount && order.discount_amount > 0 ? String(order.discount_amount) : '';
  });
  const [fixedDiscountReason, setFixedDiscountReason] = useState<string>(order.discount_reason || '');

  // Add new item state
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(15.00);
  const [newItemNotes, setNewItemNotes] = useState('');

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

  // Add new custom item
  const handleAddNewItem = () => {
    if (!newItemName.trim()) return;

    const newItem: CartItem = {
      id: `kds-custom-${Date.now().toString(36)}`,
      menuItemId: `custom-${Date.now()}`,
      name: newItemName.trim(),
      category: 'mains',
      categoryLabel: 'Custom Addition',
      selectionType: 'pieces',
      selectionLabel: 'Custom KDS Item',
      quantity: newItemQty,
      unitPrice: newItemPrice,
      totalPrice: Math.round(newItemPrice * newItemQty * 100) / 100,
      allergens: [],
      leadTimeHours: 0,
      notes: newItemNotes.trim() || undefined
    };

    setItems(prev => [...prev, newItem]);
    setNewItemName('');
    setNewItemQty(1);
    setNewItemPrice(15.00);
    setNewItemNotes('');
    setShowAddItem(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fade-in font-sans">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#00346f] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-[#ffdea5]" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffdea5] block">
                BLUEBONNET ORDER SYSTEM • ORDER MODIFIER
              </span>
              <h3 className="font-serif text-lg font-bold">
                Edit Order #{order.id.slice(0, 8).toUpperCase()} — {order.customer_name}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>✓ Order items, discounts &amp; totals successfully updated and synced with Supabase!</span>
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

            {/* Quick Add Form */}
            {showAddItem && (
              <div className="p-4 bg-gray-50 border border-gray-250 rounded-xl space-y-3 animate-fade-in">
                <span className="text-xs font-bold text-gray-800 block">Add New Dish / Special Item</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Dish Name (e.g. Extra Dal Makhani)"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="sm:col-span-2 px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#00346f]"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Unit Price"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#00346f]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    placeholder="Optional notes or portions"
                    value={newItemNotes}
                    onChange={(e) => setNewItemNotes(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewItem}
                    className="px-4 py-2 bg-[#00346f] text-white text-xs font-bold rounded-lg hover:bg-[#00224d] cursor-pointer shrink-0"
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
                  <div key={item.id || idx} className="p-3.5 bg-white border border-gray-250 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dish Name:</span>
                      </div>
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => handleItemNameChange(idx, e.target.value)}
                        placeholder="Dish / Item Name"
                        className="w-full font-bold text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded px-2.5 py-1 focus:border-[#00346f] focus:outline-none focus:ring-1 focus:ring-[#00346f]"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-500 block">
                          {item.selectionLabel}
                        </span>
                        {item.notes && (
                          <span className="text-[10px] text-gray-600 italic block">
                            • {item.notes}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Unit Price Input */}
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-gray-400">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleItemUnitPriceChange(idx, parseFloat(e.target.value) || 0)}
                          className="w-16 px-1.5 py-1 text-xs text-right border border-gray-300 rounded focus:border-[#00346f]"
                        />
                      </div>

                      {/* Streamlined Quantity Controls (Box removed) */}
                      <div className="flex items-center gap-1 text-xs">
                        <button
                          type="button"
                          onClick={() => handleItemQtyChange(idx, -1)}
                          className="w-6 h-6 rounded-md hover:bg-gray-150 text-gray-700 flex items-center justify-center cursor-pointer transition-colors"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-5 text-center font-bold text-xs text-gray-900">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleItemQtyChange(idx, 1)}
                          className="w-6 h-6 rounded-md hover:bg-gray-150 text-gray-700 flex items-center justify-center cursor-pointer transition-colors"
                          title="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Item Subtotal */}
                      <span className="w-16 text-right font-mono font-bold text-xs text-gray-900">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(idx)}
                        className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
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
