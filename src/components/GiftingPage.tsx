import { ArrowRight, MessageSquare, Package, Check } from "lucide-react";

interface GiftingPageProps {
  onOpenWizard: (flavor?: string, category?: string) => void;
}

export default function GiftingPage({ onOpenWizard }: GiftingPageProps) {
  const signatureCollections = [
    {
      title: "Ganpati Pooja Gifts",
      desc: "Traditional festive hampers inspired by devotion and celebration. Includes modak-inspired sweets, dry fruits, festive savories, and pooja-themed essentials — beautifully packaged for gifting.",
      image: "src/assets/images/ganpati_pooja_gift.png",
      tag: "Traditional"
    },
    {
      title: "Rakhi Gift Boxes",
      desc: "A heartfelt expression of love and tradition. Includes premium rakhi, handcrafted sweets, savoury treats, and a personalized message card designed to make your sibling feel special.",
      image: "src/assets/images/rakhi_gift_box.png",
      tag: "Best Seller"
    },
    {
      title: "Diwali Luxe Hampers",
      desc: "Celebrate the festival of lights with elegant, indulgent gifting. Includes gourmet cookies, Indian sweets & savouries, festive treats, and personalized message cards (e.g., “Best Wishes from [Your Name/Family Name]”).",
      image: "src/assets/images/diwali_luxe_hamper.png",
      tag: "Luxe Edition"
    }
  ];

  const customOptions = [
    "Birthday Gift Boxes",
    "Anniversary Celebration Hampers",
    "Baby Shower Return Gifts",
    "Wedding & Party Return Gifts",
    "Corporate & Bulk Gifting",
    "Fully Custom Hampers based on theme, taste, and budget"
  ];

  const personalizationDetails = [
    { label: "Custom name & message cards", desc: "Add a warm, personal note to match the theme of your event." },
    { label: "Theme-based curation", desc: "Select from festive, elegant, playful, or luxury box motifs." },
    { label: "Dietary preferences", desc: "100% eggless, nut-free, or gluten-free options are available upon request." },
    { label: "Balanced sweet & savoury", desc: "Curated medleys of spiced nuts, cookies, and rich fusion sweets." },
    { label: "Premium gifting impact", desc: "Handcrafted boxes finished with silk ribbons and marigold motifs." }
  ];

  return (
    <div className="bg-brand-cream-light min-h-screen animate-fade-in font-sans">
      
      {/* ── HERO SECTION ── */}
      <header className="relative py-24 md:py-32 overflow-hidden bg-[#050a1a] text-white">
        <div className="absolute inset-0 z-0 opacity-35 bg-cover bg-center" style={{ backgroundImage: "url('src/assets/images/gifting_hero_bg.png')" }} />
        <div className="absolute inset-0 bg-radial-gradient(circle, transparent 20%, #050a1a 90%)" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="bg-[#ffdea5]/10 text-brand-gold-tint border border-[#ffdea5]/20 px-3 py-1 rounded-full text-[10px] font-sans tracking-widest uppercase font-extrabold">
            THE LUXURY COLLECTION
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-4xl leading-tight text-brand-cream mx-auto">
            Lux Gifting
          </h1>
          <p className="font-serif text-lg md:text-xl text-brand-gold-tint italic max-w-2xl mx-auto">
            Thoughtfully Curated Hampers for Every Celebration
          </p>
          <p className="font-sans text-xs sm:text-sm md:text-base text-gray-300 max-w-3xl leading-relaxed mx-auto">
            Make every occasion unforgettable with beautifully designed gift boxes tailored to your needs. Each hamper is thoughtfully handcrafted with a perfect balance of sweets, savouries, and personalized touches that reflect the joy of your celebration.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <button
              onClick={() => onOpenWizard("", "Gifting")}
              className="w-full sm:w-auto bg-[#775a19] hover:bg-[#5d4201] text-white font-sans text-xs font-bold uppercase tracking-widest px-8 py-4 rounded shadow-lg transition-all cursor-pointer"
            >
              REQUEST A GIFTING QUOTE
            </button>
            <a 
              href="https://wa.me/19455274566"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto border border-brand-gold-tint hover:bg-white/10 text-brand-gold-tint font-sans text-xs font-bold uppercase tracking-widest px-8 py-4 rounded transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              CHAT WITH THE CHEF
            </a>
          </div>
        </div>
      </header>

      {/* ── SIGNATURE COLLECTIONS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold tracking-widest text-[#775a19] uppercase block mb-1">SIGNATURE RANGE</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#00346f] tracking-tight">Our Signature Gifting Collections</h2>
          <div className="h-0.5 w-16 bg-[#775a19] mt-3 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {signatureCollections.map((col, idx) => (
            <div 
              key={idx}
              className="bg-white border border-gray-150 rounded-lg overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 shadow-xs flex flex-col justify-between"
            >
              <div className="relative h-56 bg-gray-100 overflow-hidden group">
                <img 
                  src={col.image} 
                  alt={col.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 left-3 bg-[#775a19] text-white text-[8px] font-bold tracking-widest uppercase px-2 py-1 rounded-sm shadow">
                  {col.tag}
                </span>
              </div>
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <h3 className="font-serif text-xl font-bold text-[#00346f]">{col.title}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm font-sans leading-relaxed">{col.desc}</p>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => onOpenWizard(col.title, "Gifting")}
                    className="w-full border border-secondary-brand/60 hover:bg-secondary-brand/5 text-[#775a19] py-2 text-[10px] font-bold tracking-widest uppercase rounded-sm transition-all cursor-pointer font-sans"
                  >
                    Select Hamper
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CUSTOM OPTIONS & PERSONALIZATION ── */}
      <section className="bg-white border-t border-b border-gray-150 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Custom Options Column */}
          <div className="space-y-8">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#775a19] uppercase block mb-1">VERSATILE CHOICES</span>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#00346f]">More Custom Gifting Options</h2>
              <div className="h-0.5 w-12 bg-[#775a19] mt-2" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {customOptions.map((opt, i) => (
                <div key={i} className="flex gap-4 border border-gray-100 rounded bg-[#fcfbf9] p-4.5 shadow-2xs hover:border-[#775a19]/35 transition-all">
                  <div className="h-8 w-8 rounded-full bg-[#775a19]/10 text-[#775a19] flex items-center justify-center shrink-0">
                    <Package className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#00346f] mt-1.5">{opt}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personalization Column */}
          <div className="space-y-8">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#775a19] uppercase block mb-1">PERSONAL TOUCHES</span>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#00346f]">Personalization Options</h2>
              <div className="h-0.5 w-12 bg-[#775a19] mt-2" />
            </div>

            <div className="space-y-6">
              {personalizationDetails.map((item, i) => (
                <div key={i} className="flex gap-4.5 items-start">
                  <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-primary-brand">{item.label}</h4>
                    <p className="text-gray-600 text-xs sm:text-sm font-sans mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── CLOSING CALLOUT SECTION ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-[#0a1128] to-[#00346f] text-white rounded-lg p-10 md:p-14 text-center shadow-md relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-brand-cream">
              You name the occasion — we bring the sweetness. <br />
              <span className="text-brand-gold-tint italic font-bold">We’ve got your celebrations covered.</span>
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm font-sans leading-relaxed max-w-xl mx-auto">
              Ready to curate a set of custom hampers for your next milestone or festival? Get in touch with us today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <button 
                onClick={() => onOpenWizard("", "Gifting")}
                className="w-full sm:w-auto bg-[#775a19] hover:bg-[#5d4201] text-white font-sans text-xs uppercase tracking-widest font-bold px-8 py-4 rounded shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                DISCUSS A CUSTOM HAMPER <ArrowRight className="h-4 w-4" />
              </button>
              <a 
                href="https://wa.me/19455274566"
                target="_blank" 
                rel="noreferrer"
                className="w-full sm:w-auto border border-brand-gold-tint hover:bg-white/10 text-brand-gold-tint font-sans text-xs uppercase tracking-widest font-bold px-8 py-4 rounded flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" /> CHAT ON WHATSAPP
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
