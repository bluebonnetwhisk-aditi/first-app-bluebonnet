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
  Tag
} from 'lucide-react';
import type { CateringOrder, CartItem } from '../../types/catering';
import { updateOrderDetails } from '../../services/supabase';

interface KDSEditOrderModalProps {
  order: CateringOrder;
  onClose: () => void;
  onOrderUpdated: () => void;
}

export default function KDSEditOrderModal({
  order,
  onClose,
  onOrderUpdated
}: KDSEditOrderModalProps) {
  const [items, setItems] = useState<CartItem[]>(() => {
    return Array.isArray(order.items) ? JSON.parse(JSON.stringify(order.items)) : [];
  });

  // Discount & Rebate state
  const [discountAmount, setDiscountAmount] = useState<number>(order.discount_amount || 0);
  const [discountReason, setDiscountReason] = useState<string>(order.discount_reason || '');
  const [rebateAmount, setRebateAmount] = useState<number>(order.rebate_amount || 0);
  const [rebateReason, setRebateReason] = useState<string>(order.rebate_reason || '');

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

  // Recalculations
  const foodSubtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const deliveryFee = order.delivery_fee || 0;
  
  // Net after discount & rebate
  const netBeforeTax = Math.max(0, foodSubtotal - discountAmount - rebateAmount + deliveryFee);
  const taxAmount = Math.round(netBeforeTax * 0.0825 * 100) / 100;
  
  const isCreditCard = order.payment_method === 'credit_card';
  const processingFee = isCreditCard ? Math.round((netBeforeTax + taxAmount) * 0.035 * 100) / 100 : 0;
  
  const grandTotal = Math.round((netBeforeTax + taxAmount + processingFee) * 100) / 100;

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

    const updates: Partial<CateringOrder> = {
      items,
      food_subtotal: Math.round(foodSubtotal * 100) / 100,
      tax_amount: taxAmount,
      processing_fee: processingFee,
      discount_amount: discountAmount > 0 ? discountAmount : 0,
      discount_reason: discountAmount > 0 ? discountReason.trim() : null,
      rebate_amount: rebateAmount > 0 ? rebateAmount : 0,
      rebate_reason: rebateAmount > 0 ? rebateReason.trim() : null,
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
                KITCHEN DISPLAY SYSTEM • ORDER MODIFIER
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
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-xs sm:text-sm text-gray-900 block truncate">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-gray-500 block">
                        {item.selectionLabel}
                      </span>
                      {item.notes && (
                        <span className="text-[10px] text-gray-600 italic block mt-0.5">
                          {item.notes}
                        </span>
                      )}
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

                      {/* Quantity Stepper */}
                      <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-250">
                        <button
                          type="button"
                          onClick={() => handleItemQtyChange(idx, -1)}
                          className="w-6 h-6 rounded flex items-center justify-center hover:bg-white text-gray-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleItemQtyChange(idx, 1)}
                          className="w-6 h-6 rounded flex items-center justify-center hover:bg-white text-gray-700"
                        >
                          <Plus className="w-3 h-3" />
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

          {/* ── 2. DISCOUNTS & REBATES ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-purple-50/50 border border-purple-200">
            {/* Discount */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-purple-950 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-700" />
                <span>Apply Discount ($)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-purple-800 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-24 px-2.5 py-1.5 text-xs bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <input
                  type="text"
                  placeholder="Reason / Code (e.g. VIP Promo)"
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Rebate */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-purple-950 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-purple-700" />
                <span>Apply Rebate / Concession ($)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-purple-800 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={rebateAmount}
                  onChange={(e) => setRebateAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-24 px-2.5 py-1.5 text-xs bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <input
                  type="text"
                  placeholder="Reason (e.g. Goodwill credit)"
                  value={rebateReason}
                  onChange={(e) => setRebateReason(e.target.value)}
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

            {discountAmount > 0 && (
              <div className="flex justify-between text-purple-800 font-semibold">
                <span>Discount Applied {discountReason ? `(${discountReason})` : ''}:</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            {rebateAmount > 0 && (
              <div className="flex justify-between text-purple-800 font-semibold">
                <span>Rebate / Credit {rebateReason ? `(${rebateReason})` : ''}:</span>
                <span>-${rebateAmount.toFixed(2)}</span>
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
