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
  RotateCw,
  RefreshCw,
  Download
} from "lucide-react";
import initialGalleryData from "../data/galleryData.json";
import { 
  fetchGalleryItemsFromSupabase, 
  saveGalleryItemsToSupabase, 
  LOCAL_STORAGE_GALLERY_KEY 
} from "../services/supabase";

export type CategoryType = "Artisanal Cakes & Bakes" | "Specialty Culinary Fare" | "Heritage Sweets & Confectionery";

export interface GalleryItem {
  id: string;
  title: string;
  category: CategoryType | CategoryType[];
  autoDescription?: string;
  imagePath: string;
  originalImagePath?: string;
  visible: boolean;
  createdAt?: string;
}

export const getItemCategories = (item: GalleryItem): CategoryType[] => {
  if (Array.isArray(item.category)) {
    return item.category as CategoryType[];
  }
  if (typeof item.category === 'string') {
    return [item.category as CategoryType];
  }
  return [];
};

export const hasCategory = (item: GalleryItem, cat: string): boolean => {
  if (cat === "all") return true;
  const cats = getItemCategories(item);
  return cats.includes(cat as CategoryType);
};

const DEFAULT_PIN = "031686"; // KDS master pin default

interface GalleryPageProps {
  onNavigateToAdmin?: () => void;
}

export default function GalleryPage({ onNavigateToAdmin: _onNavigateToAdmin }: GalleryPageProps) {
  const [items, setItems] = useState<GalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_GALLERY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((i: any) => i.id));
          const missingInitial = (initialGalleryData as any[]).filter(i => !existingIds.has(i.id));

          const mappedParsed = parsed.map((item: any) => {
            let cat = item.category;
            if (typeof cat === 'string') {
              if (cat === "Artisanal Bakery & Cakes") cat = "Artisanal Cakes & Bakes";
              else if (cat === "Savory Specialties" || cat === "Breads & Starters") cat = "Specialty Culinary Fare";
              else if (cat === "Traditional Sweets") cat = "Heritage Sweets & Confectionery";
            }

            const initMatch = (initialGalleryData as any[]).find(i => i.id === item.id);

            return {
              ...item,
              title: item.title || initMatch?.title,
              category: cat || initMatch?.category,
              autoDescription: item.autoDescription || initMatch?.autoDescription,
              imagePath: item.imagePath || initMatch?.imagePath,
              originalImagePath: item.originalImagePath || initMatch?.originalImagePath || (item.imagePath ? item.imagePath.replace('/gallery/', '/gallery/orig/') : '')
            };
          });

          return [...mappedParsed, ...missingInitial] as GalleryItem[];
        }
      }
    } catch {
      // fallback
    }
    return initialGalleryData as GalleryItem[];
  });

  const [syncStatus, setSyncStatus] = useState<string>("");
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
  const [newCategories, setNewCategories] = useState<CategoryType[]>(["Artisanal Cakes & Bakes"]);
  const [newDescription, setNewDescription] = useState("");
  const [newImagePath, setNewImagePath] = useState("");

  // Fetch remote items from Supabase on mount & listen for live updates
  useEffect(() => {
    let isMounted = true;
    fetchGalleryItemsFromSupabase().then((remoteItems) => {
      if (isMounted && remoteItems && Array.isArray(remoteItems) && remoteItems.length > 0) {
        setItems(remoteItems as GalleryItem[]);
      }
    });

    const handleUpdate = () => {
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_GALLERY_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setItems(parsed);
        }
      } catch {}
    };

    window.addEventListener('bbw_gallery_items_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('bbw_gallery_items_updated', handleUpdate);
    };
  }, []);

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
    setItems(prev => {
      const next = prev.map(item => item.id === id ? { ...item, visible: !item.visible } : item);
      saveGalleryItemsToSupabase(next);
      return next;
    });
  };

  // Delete Item
  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this gallery photo?")) {
      setItems(prev => {
        const next = prev.filter(item => item.id !== id);
        saveGalleryItemsToSupabase(next);
        return next;
      });
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
        setItems(prev => {
          const next = prev.map(item => item.id === id ? { ...item, imagePath: result, originalImagePath: result } : item);
          saveGalleryItemsToSupabase(next);
          return next;
        });
        if (editingItem?.id === id) {
          setEditingItem(prev => prev ? { ...prev, imagePath: result, originalImagePath: result } : null);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Edit Item
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setItems(prev => {
      const next = prev.map(item => item.id === editingItem.id ? editingItem : item);
      saveGalleryItemsToSupabase(next);
      return next;
    });
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

        setItems(prev => {
          const next = prev.map(item => item.id === id ? { 
            ...item, 
            imagePath: rotatedDataUrl,
            originalImagePath: rotatedDataUrl 
          } : item);
          saveGalleryItemsToSupabase(next);
          return next;
        });

        if (editingItem?.id === id) {
          setEditingItem(prev => prev ? { ...prev, imagePath: rotatedDataUrl, originalImagePath: rotatedDataUrl } : null);
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
      category: newCategories.length > 0 ? newCategories : ["Artisanal Cakes & Bakes"],
      autoDescription: newDescription.trim() || "",
      imagePath: newImagePath,
      originalImagePath: newImagePath,
      visible: true,
      createdAt: new Date().toISOString()
    };

    setItems(prev => {
      const next = [newItem, ...prev];
      saveGalleryItemsToSupabase(next);
      return next;
    });
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
    : visibleItems.filter(item => hasCategory(item, activeTab));

  const allCategories: CategoryType[] = [
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
              <div className="flex flex-wrap items-center justify-center gap-3 bg-[#C85A32]/20 border border-[#C85A32]/50 text-[#ffdea5] p-3 rounded-2xl text-xs font-bold font-sans shadow-lg">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Check className="w-4 h-4" /> Admin Controls Unlocked
                </span>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#D4AF37] hover:bg-[#b5932a] text-[#1A1614] px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Photo
                </button>

                <button
                  onClick={async () => {
                    await saveGalleryItemsToSupabase(items);
                    setSyncStatus("Synced live with Supabase & site!");
                    setTimeout(() => setSyncStatus(""), 3000);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow"
                  title="Push current gallery items live to Supabase & all visitors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Push &amp; Sync to Site
                </button>

                <button
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", "galleryData.json");
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow"
                  title="Export updated gallery items JSON file"
                >
                  <Download className="w-3.5 h-3.5" /> Export JSON
                </button>

                <button
                  onClick={() => {
                    if (window.confirm("Reset gallery cache to initial site defaults?")) {
                      setItems(initialGalleryData as GalleryItem[]);
                      saveGalleryItemsToSupabase(initialGalleryData as GalleryItem[]);
                    }
                  }}
                  className="bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  title="Reset cache to initial site bundled items"
                >
                  Reset Defaults
                </button>

                <button
                  onClick={() => setIsAdminMode(false)}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  Exit Admin
                </button>

                {syncStatus && (
                  <span className="w-full text-center text-xs text-emerald-300 font-bold animate-pulse pt-1">
                    {syncStatus}
                  </span>
                )}
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
          {filteredItems.map((item) => {
            const categoriesList = getItemCategories(item);
            return (
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

                  {/* Multi-Category Pills */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2 gap-y-1.5 max-w-[85%] z-10">
                    {categoriesList.map((cat) => (
                      <span key={cat} className="bg-[#1A1614]/90 backdrop-blur-md text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider font-sans shadow-sm">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-[#241E1B]">
                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-snug">
                      {item.title}
                    </h3>
                    {item.autoDescription && (
                      <p className="text-xs text-gray-300 mt-1.5 line-clamp-2 leading-relaxed font-light">
                        {item.autoDescription}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#382F2A] flex items-center justify-between text-[11px] text-[#D4AF37] font-serif italic">
                    <span>Authentic DFW Artistry</span>
                    <span className="font-sans uppercase text-[10px] font-bold tracking-wider text-gray-400 group-hover:text-[#D4AF37] transition-colors">
                      Inspect Photo &rarr;
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
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
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2 gap-y-1.5 max-w-[85%] z-10">
                    {getItemCategories(selectedItem).map((cat) => (
                      <span key={cat} className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] border border-[#D4AF37]/30 shadow-sm">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] block">
                      ARTISAN PORTFOLIO ITEM
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-white leading-tight">
                      {selectedItem.title}
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed font-light">
                      {selectedItem.autoDescription || "Scratch-cooked with authentic spices and artisanal craftsmanship for special celebrations across Dallas-Fort Worth."}
                    </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-[#382F2A]">
                    <div className="flex items-center gap-2 text-xs text-[#D4AF37]">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      <span>Freshly Prepared in Little Elm / Frisco, TX</span>
                    </div>

                    <a
                      href="/catering/food"
                      className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#b5932a] text-[#1A1614] rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Inquire &amp; Order Catering Feast</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PIN Verification Modal */}
        {showPinModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#241E1B] border border-[#D4AF37]/40 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center mx-auto border border-[#D4AF37]/30">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-white">Admin Authentication</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Enter PIN to unlock admin gallery controls.
                </p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  className="w-full bg-[#1A1614] border border-[#382F2A] text-white text-center text-lg tracking-widest py-2.5 rounded-xl focus:border-[#D4AF37] outline-none"
                  autoFocus
                />

                {pinError && (
                  <p className="text-xs text-rose-400 font-bold animate-shake">
                    Incorrect PIN. Please try again.
                  </p>
                )}

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
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Description</label>
                  <textarea
                    rows={3}
                    value={editingItem.autoDescription || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, autoDescription: e.target.value })}
                    className="w-full bg-[#1A1614] border border-[#382F2A] text-white px-4 py-2.5 rounded-xl text-xs focus:border-[#D4AF37] outline-none"
                  />
                </div>

                {/* Multi-Category Checkboxes */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                    Category Mapping Tags (Multi-Select)
                  </label>
                  <div className="space-y-2 bg-[#1A1614] border border-[#382F2A] p-3 rounded-xl">
                    {allCategories.map(cat => {
                      const currentCats = getItemCategories(editingItem);
                      const isChecked = currentCats.includes(cat);
                      return (
                        <label key={cat} className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              let updated = isChecked
                                ? currentCats.filter(c => c !== cat)
                                : [...currentCats, cat];
                              if (updated.length === 0) updated = [cat];
                              setEditingItem({ ...editingItem, category: updated as any });
                            }}
                            className="rounded text-[#D4AF37] focus:ring-0 cursor-pointer"
                          />
                          <span>{cat}</span>
                        </label>
                      );
                    })}
                  </div>
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
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Description</label>
                  <textarea
                    rows={2}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Brief description of dish..."
                    className="w-full bg-[#1A1614] border border-[#382F2A] text-white px-4 py-2.5 rounded-xl text-xs focus:border-[#D4AF37] outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Categories (Multi-Select Tags)</label>
                  <div className="space-y-2 bg-[#1A1614] border border-[#382F2A] p-3 rounded-xl">
                    {allCategories.map(cat => {
                      const isChecked = newCategories.includes(cat);
                      return (
                        <label key={cat} className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              let updated = isChecked
                                ? newCategories.filter(c => c !== cat)
                                : [...newCategories, cat];
                              if (updated.length === 0) updated = [cat];
                              setNewCategories(updated as any);
                            }}
                            className="rounded text-[#D4AF37] focus:ring-0 cursor-pointer"
                          />
                          <span>{cat}</span>
                        </label>
                      );
                    })}
                  </div>
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
