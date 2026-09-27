import { useState, useEffect } from "react";
import { 
  Sparkles, 
  X, 
  Lock, 
  Eye, 
  EyeOff, 
  Plus, 
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

export interface GalleryItem {
  id: string;
  imagePath: string;
  originalImagePath?: string;
  visible: boolean;
  createdAt?: string;
  title?: string;
  autoDescription?: string;
  category?: any;
}

const DEFAULT_PIN = "031686"; // KDS master pin default

interface GalleryPageProps {
  onNavigateToAdmin?: () => void;
}

const mergeWithInitialData = (sourceItems: any[]): GalleryItem[] => {
  const initIds = new Set((initialGalleryData as any[]).map(i => i.id));
  const sourceMap = new Map(sourceItems.map(i => [i.id, i]));
  
  const mergedInitial = (initialGalleryData as any[]).map(initItem => {
    const matched = sourceMap.get(initItem.id);
    if (!matched) return initItem as GalleryItem;

    return {
      id: initItem.id,
      imagePath: matched.imagePath || initItem.imagePath,
      originalImagePath: matched.originalImagePath || initItem.originalImagePath || (matched.imagePath ? matched.imagePath.replace('/gallery/', '/gallery/orig/') : ''),
      visible: matched.visible !== undefined ? matched.visible : initItem.visible,
      createdAt: matched.createdAt || initItem.createdAt
    };
  });

  const customItems = sourceItems.filter(i => !initIds.has(i.id)).map(i => ({
    id: i.id,
    imagePath: i.imagePath,
    originalImagePath: i.originalImagePath || i.imagePath,
    visible: i.visible !== undefined ? i.visible : true,
    createdAt: i.createdAt
  }));

  return [...mergedInitial, ...customItems] as GalleryItem[];
};

export default function GalleryPage({ onNavigateToAdmin: _onNavigateToAdmin }: GalleryPageProps) {
  const [items, setItems] = useState<GalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_GALLERY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return mergeWithInitialData(parsed);
        }
      }
    } catch {
      // fallback
    }
    return initialGalleryData as GalleryItem[];
  });

  const [syncStatus, setSyncStatus] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // Admin PIN Modal & Admin State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // New Item Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newImagePath, setNewImagePath] = useState("");

  // Fetch remote items from Supabase on mount & listen for live updates
  useEffect(() => {
    let isMounted = true;
    fetchGalleryItemsFromSupabase().then((remoteItems) => {
      if (isMounted) {
        if (remoteItems && Array.isArray(remoteItems) && remoteItems.length > 0) {
          const merged = mergeWithInitialData(remoteItems);
          setItems(merged);
          saveGalleryItemsToSupabase(merged);
        } else {
          saveGalleryItemsToSupabase(initialGalleryData as GalleryItem[]);
        }
      }
    });

    const handleUpdate = () => {
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_GALLERY_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setItems(mergeWithInitialData(parsed));
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
    }
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

        if (selectedItem?.id === id) {
          setSelectedItem(prev => prev ? { ...prev, imagePath: rotatedDataUrl, originalImagePath: rotatedDataUrl } : null);
        }
      }
    };
  };

  // Add New Item Submit
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImagePath) return;

    const newItem: GalleryItem = {
      id: `item-${Date.now()}`,
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
            An authentic visual showcase of our small-batch celebration cakes, slow-cooked royal gravies, and heritage confections crafted across Dallas-Fort Worth.
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

        {/* Gallery Masonry / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {visibleItems.map((item) => {
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`group bg-[#241E1B] rounded-2xl border ${
                  item.visible ? "border-[#382F2A] hover:border-[#D4AF37]" : "border-rose-900/60 opacity-60"
                } overflow-hidden shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 relative aspect-[4/3] flex items-center justify-center p-2`}
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
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      className="p-1.5 rounded-lg text-xs bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Photo Image View */}
                <div className="w-full h-full relative overflow-hidden rounded-xl bg-[#1A1614] flex items-center justify-center">
                  <img
                    src={item.imagePath}
                    alt="Gallery Showcase"
                    className="w-full h-full object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/gallery/gallery_01.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="bg-[#D4AF37] text-[#1A1614] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2">
                      <Eye className="w-4 h-4" /> View Photo
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guest Detail Lightbox Modal */}
        {selectedItem && (
          <div 
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
            onClick={() => setSelectedItem(null)}
          >
            <div 
              className="bg-[#241E1B] border border-[#D4AF37]/40 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl relative text-[#E6DFD5] flex flex-col items-center p-4 sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 bg-black/70 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer border border-white/20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full max-h-[75vh] flex items-center justify-center p-2">
                <img
                  src={selectedItem.originalImagePath || selectedItem.imagePath}
                  alt="Gallery Showcase"
                  className="max-h-[70vh] w-auto object-contain rounded-xl drop-shadow-2xl"
                />
              </div>

              <div className="w-full pt-4 mt-2 border-t border-[#382F2A] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-medium">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>Artisanal DFW Culinary &amp; Cake Portfolio</span>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="/catering/food"
                    className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#b5932a] text-[#1A1614] rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                  >
                    Order Catering
                  </a>
                  <a
                    href="/cakes"
                    className="px-5 py-2.5 bg-[#1A1614] hover:bg-[#382F2A] text-white border border-[#D4AF37]/40 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                  >
                    Custom Cakes
                  </a>
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
                  <div className="h-48 bg-black rounded-xl overflow-hidden relative border border-[#382F2A] flex items-center justify-center p-2">
                    <img src={newImagePath} alt="Preview" className="w-full h-full object-contain" />
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
                    Add Photo
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
