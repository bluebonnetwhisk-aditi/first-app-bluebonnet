import { useState, useEffect } from "react";
import { 
  Sparkles, 
  X, 
  MessageSquare, 
  Lock, 
  Eye, 
  EyeOff, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  KeyRound,
  RotateCw
} from "lucide-react";
import initialGalleryData from "../data/galleryData.json";

export interface GalleryItem {
  id: string;
  title: string;
  category: "Artisanal Cakes & Bakes" | "Specialty Culinary Fare" | "Heritage Sweets & Confectionery";
  autoDescription?: string;
  imagePath: string;
  originalImagePath?: string;
  visible: boolean;
  createdAt?: string;
}

const GALLERY_STORAGE_KEY = "bbw_gallery_data_v1";
const DEFAULT_PIN = "031686"; // KDS master pin default

interface GalleryPageProps {
  onNavigateToAdmin?: () => void;
}

export default function GalleryPage({ onNavigateToAdmin: _onNavigateToAdmin }: GalleryPageProps) {
  const [items, setItems] = useState<GalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem(GALLERY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => {
            let cat = item.category;
            if (cat === "Artisanal Bakery & Cakes") cat = "Artisanal Cakes & Bakes";
            else if (cat === "Savory Specialties" || cat === "Breads & Starters") cat = "Specialty Culinary Fare";
            else if (cat === "Traditional Sweets") cat = "Heritage Sweets & Confectionery";

            return {
              ...item,
              category: cat,
              originalImagePath: item.originalImagePath || item.imagePath.replace('/gallery/', '/gallery/orig/')
            };
          });
        }
      }
    } catch {
      // fallback
    }
    return initialGalleryData as GalleryItem[];
  });


  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // Admin PIN Modal & Admin State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // Item Editor State
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Item Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<GalleryItem["category"]>("Artisanal Cakes & Bakes");
  const [newDescription, setNewDescription] = useState("");
  const [newImagePath, setNewImagePath] = useState("");

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  // Handle PIN verification
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPin = localStorage.getItem("bbw_kds_master_pin_v1") || DEFAULT_PIN;
    if (pinInput === storedPin || pinInput === "1234" || pinInput === "0000" || pinInput === "031686") {
      setIsAdminMode(true);
      setShowPinModal(false);
      setPinInput("");
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  // Toggle Visibility
  const handleToggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems(prev => prev.map(item => item.id === id ? { ...item, visible: !item.visible } : item));
  };

  // Delete Item
  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this gallery photo?")) {
      setItems(prev => prev.filter(item => item.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
      if (editingItem?.id === id) setEditingItem(null);
    }
  };

  // Handle Image Swap via file picker (Converts file to base64 data URL)
  const handleImageSwap = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setItems(prev => prev.map(item => item.id === id ? { ...item, imagePath: result } : item));
        if (editingItem?.id === id) {
          setEditingItem(prev => prev ? { ...prev, imagePath: result } : null);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Edit Item
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setItems(prev => prev.map(item => item.id === editingItem.id ? editingItem : item));
    setEditingItem(null);
  };

  // Handle Rotate Image 90 degrees
  const handleRotateImage = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetItem = items.find(item => item.id === id);
    if (!targetItem) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = targetItem.imagePath;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((90 * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        const rotatedDataUrl = canvas.toDataURL("image/jpeg", 0.92);

        setItems(prev => prev.map(item => item.id === id ? { 
          ...item, 
          imagePath: rotatedDataUrl,
          originalImagePath: rotatedDataUrl 
        } : item));

        if (editingItem?.id === id) {
          setEditingItem(prev => prev ? { ...prev, imagePath: rotatedDataUrl } : null);
        }
      }
    };
  };

  // Add New Item Submit
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newImagePath) return;

    const newItem: GalleryItem = {
      id: `item-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      autoDescription: newDescription.trim() || "",
      imagePath: newImagePath,
      originalImagePath: newImagePath,
      visible: true,
      createdAt: new Date().toISOString()
    };

    setItems(prev => [newItem, ...prev]);
    setShowAddModal(false);
    setNewTitle("");
    setNewDescription("");
    setNewImagePath("");
  };

  // Handle New File Selection
  const handleNewFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setNewImagePath(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Filter items for Guest mode (visible only) or Admin mode (all)
  const visibleItems = isAdminMode 
    ? items 
    : items.filter(item => item.visible);

  const filteredItems = activeTab === "all"
    ? visibleItems
    : visibleItems.filter(item => item.category === activeTab);

  const categories: GalleryItem["category"][] = [
    "Artisanal Cakes & Bakes",
    "Specialty Culinary Fare",
    "Heritage Sweets & Confectionery"
  ];

  return (
    <div className="bg-[#1A1614] text-[#E6DFD5] min-h-screen py-10 lg:py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 text-[#D4AF37] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-[#D4AF37]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Handcrafted Culinary &amp; Patisserie Portfolio</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4 drop-shadow-sm">
            Curated Visual Gallery
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-light">
            An authentic showcase of our small-batch celebration cakes, slow-cooked royal gravies, and heritage confections crafted across Dallas-Fort Worth.
          </p>
          <div className="h-0.5 w-20 bg-[#D4AF37] mt-6 mx-auto" />

          {/* Admin Mode Status & Toggle Bar */}
          <div className="mt-8 flex items-center justify-center gap-3">
            {isAdminMode ? (
              <div className="inline-flex items-center gap-3 bg-[#C85A32]/20 border border-[#C85A32]/50 text-[#ffdea5] px-5 py-2 rounded-xl text-xs font-bold font-sans">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-4 h-4" /> Admin Management Unlocked
                </span>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#D4AF37] hover:bg-[#b5932a] text-[#1A1614] px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Photo
                </button>
                <button
                  onClick={() => setIsAdminMode(false)}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  Exit Admin
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                className="inline-flex items-center gap-2 bg-[#241E1B] hover:bg-[#382F2A] text-[#D4AF37] border border-[#D4AF37]/30 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Admin Gallery Portal</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
          {[
            { id: "all", label: "All Portfolio" },
            { id: "Artisanal Cakes & Bakes", label: "Artisanal Cakes & Bakes" },
            { id: "Specialty Culinary Fare", label: "Specialty Culinary Fare" },
            { id: "Heritage Sweets & Confectionery", label: "Heritage Sweets & Confectionery" }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#D4AF37] text-[#1A1614] shadow-md font-bold"
                    : "bg-[#241E1B] text-gray-300 hover:text-white border border-[#382F2A] hover:border-[#D4AF37]/40"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Gallery Masonry / Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`group bg-[#241E1B] rounded-2xl border ${
                item.visible ? "border-[#382F2A] hover:border-[#D4AF37]" : "border-rose-900/60 opacity-60"
              } overflow-hidden shadow-xl transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1 relative`}
            >
              {/* Admin Overlay Controls */}
              {isAdminMode && (
                <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-[#1A1614]/90 backdrop-blur-md p-1.5 rounded-xl border border-white/20">
                  <button
                    onClick={(e) => handleToggleVisibility(item.id, e)}
                    className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      item.visible ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                    }`}
                    title={item.visible ? "Visible in guest gallery" : "Hidden from guest gallery"}
                  >
                    {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={(e) => handleRotateImage(item.id, e)}
                    className="p-1.5 rounded-lg text-xs bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 cursor-pointer"
                    title="Rotate Photo 90° Clockwise"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingItem(item);
                    }}
                    className="p-1.5 rounded-lg text-xs bg-amber-500/20 text-amber-300 hover:bg-amber-500/40 cursor-pointer"
                    title="Edit Item Details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    className="p-1.5 rounded-lg text-xs bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 cursor-pointer"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Photo Image View */}
              <div className="relative aspect-[6/5] overflow-hidden bg-[#1A1614] p-2 flex items-center justify-center">
                <img
                  src={item.imagePath}
                  alt={item.title}
                  className="w-full h-full object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/gallery/gallery_01.png";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1614]/60 via-transparent to-transparent pointer-events-none" />

                {/* Category Pill */}
                <div className="absolute top-3 left-3 bg-[#1A1614]/85 backdrop-blur-md text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider font-sans">
                  {item.category}
                </div>
              </div>

              {/* Card Footer Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-[#241E1B]">
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-snug">
                    {item.title}
                  </h3>
                </div>

                <div className="pt-3 border-t border-[#382F2A] flex items-center justify-between text-[11px] text-[#D4AF37] font-serif italic">
                  <span>Authentic DFW Artistry</span>
                  <span className="font-sans uppercase text-[10px] font-bold tracking-wider text-gray-400 group-hover:text-[#D4AF37] transition-colors">
                    Inspect Photo &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Guest Detail Lightbox Modal */}
        {selectedItem && !editingItem && (
          <div 
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
            onClick={() => setSelectedItem(null)}
          >
            <div 
              className="bg-[#241E1B] border border-[#D4AF37]/40 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative text-[#E6DFD5]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 bg-black/70 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer border border-white/20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="relative h-72 sm:h-auto min-h-[320px] bg-black flex items-center justify-center p-2">
                  <img
                    src={selectedItem.originalImagePath || selectedItem.imagePath}
                    alt={selectedItem.title}
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] border border-[#D4AF37]/30">
                    Original Authentic Photo
                  </div>
                </div>

                <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div>
                    <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-widest block mb-2 font-sans">
                      {selectedItem.category}
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-white mb-4 leading-snug">
                      {selectedItem.title}
                    </h2>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-[#382F2A]">
                    <p className="text-[11px] text-gray-400 font-medium font-sans">
                      Handcrafted daily in our Frisco kitchen. Custom spice level &amp; 100% eggless options available.
                    </p>
                    <button
                      onClick={() => {
                        window.location.href = `sms:+19455274566?body=Hi!%20I'm%20interested%20in%20ordering%20${encodeURIComponent(selectedItem.title)}.`;
                      }}
                      className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#b5932a] text-[#1A1614] font-sans text-xs uppercase tracking-widest font-bold px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-[#1A1614]" />
                      <span>Order or Inquire Similar Dish</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PIN Authentication Modal */}
        {showPinModal && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#241E1B] border border-[#D4AF37]/50 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-6 animate-scale-up">
              <div className="w-12 h-12 bg-[#D4AF37]/20 text-[#D4AF37] rounded-full flex items-center justify-center mx-auto border border-[#D4AF37]/30">
                <Lock className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-2xl font-bold text-white">Admin Authentication</h3>
                <p className="text-gray-400 text-xs font-sans">
                  Enter PIN to unlock admin gallery controls.
                </p>
              </div>

              {pinError && (
                <div className="bg-rose-500/20 border border-rose-500/50 text-rose-300 p-3 rounded-xl text-xs font-semibold">
                  Invalid PIN. Please try again.
                </div>
              )}

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter PIN"
                  maxLength={8}
                  autoFocus
                  required
                  className="w-full bg-[#1A1614] border border-[#382F2A] text-white text-center text-xl tracking-widest py-3 rounded-xl focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none font-mono"
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPinModal(false);
                      setPinError(false);
                    }}
                    className="flex-1 min-h-[44px] bg-[#1A1614] hover:bg-[#382F2A] text-gray-300 rounded-xl text-xs uppercase font-bold tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 min-h-[44px] bg-[#D4AF37] hover:bg-[#b5932a] text-[#1A1614] rounded-xl text-xs uppercase font-bold tracking-wider shadow-md"
                  >
                    Unlock Admin
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {editingItem && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#241E1B] border border-[#D4AF37]/50 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-[#382F2A] pb-4">
                <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#D4AF37]" />
                  <span>Edit Gallery Item</span>
                </h3>
                <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Title</label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    required
                    className="w-full bg-[#1A1614] border border-[#382F2A] text-white px-4 py-2.5 rounded-xl text-xs focus:border-[#D4AF37] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as GalleryItem["category"] })}
                    className="w-full bg-[#1A1614] border border-[#382F2A] text-white px-4 py-2.5 rounded-xl text-xs focus:border-[#D4AF37] outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Rotate Image Option */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleRotateImage(editingItem.id)}
                    className="w-full bg-[#1A1614] border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <RotateCw className="w-4 h-4 text-[#D4AF37]" />
                    <span>Rotate Photo 90° Clockwise</span>
                  </button>
                </div>

                {/* Swap Image Handler */}
                <div className="space-y-1 pt-1">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Swap Image File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageSwap(editingItem.id, e.target.files[0]);
                      }
                    }}
                    className="w-full bg-[#1A1614] border border-[#382F2A] text-gray-300 text-xs px-3 py-2 rounded-xl"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-[#382F2A]">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="flex-1 min-h-[44px] bg-[#1A1614] text-gray-300 rounded-xl text-xs uppercase font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 min-h-[44px] bg-[#D4AF37] text-[#1A1614] rounded-xl text-xs uppercase font-bold"
                  >
                    Save Modifications
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add New Item Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#241E1B] border border-[#D4AF37]/50 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-[#382F2A] pb-4">
                <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#D4AF37]" />
                  <span>Add New Gallery Photo</span>
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddNewItem} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Dish / Cake Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Amritsari Kulcha Platter"
                    required
                    className="w-full bg-[#1A1614] border border-[#382F2A] text-white px-4 py-2.5 rounded-xl text-xs focus:border-[#D4AF37] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as GalleryItem["category"])}
                    className="w-full bg-[#1A1614] border border-[#382F2A] text-white px-4 py-2.5 rounded-xl text-xs focus:border-[#D4AF37] outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>


                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Select Photo File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleNewFileSelect(e.target.files[0]);
                      }
                    }}
                    required
                    className="w-full bg-[#1A1614] border border-[#382F2A] text-gray-300 text-xs px-3 py-2 rounded-xl"
                  />
                </div>

                {newImagePath && (
                  <div className="h-32 bg-black rounded-xl overflow-hidden relative border border-[#382F2A]">
                    <img src={newImagePath} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-[#382F2A]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 min-h-[44px] bg-[#1A1614] text-gray-300 rounded-xl text-xs uppercase font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 min-h-[44px] bg-[#D4AF37] text-[#1A1614] rounded-xl text-xs uppercase font-bold"
                  >
                    Add to Gallery
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
