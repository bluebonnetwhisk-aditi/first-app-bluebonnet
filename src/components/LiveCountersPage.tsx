import { useState } from "react";
import { Cake, Users, Heart, Gift, ArrowRight, MessageSquare, Check, Sparkles, Send } from "lucide-react";
import ImageWithShimmer from "./ImageWithShimmer";

interface LiveCountersPageProps {}

export default function LiveCountersPage({}: LiveCountersPageProps = {}) {
  const [guestCount, setGuestCount] = useState<number>(50);
  const [selectedStations, setSelectedStations] = useState<string[]>([
    "Live Jalebi & Rabri",
    "Pani Puri & Chaat Bar"
  ]);

  const liveStationsList = [
    { id: "jalebi", name: "Live Jalebi & Rabri", desc: "Crispy hot jalebis served with rich saffron rabri", icon: "✨" },
    { id: "chaat", name: "Pani Puri & Chaat Bar", desc: "Interactive customized golgappas & dahi bhalla", icon: "🌶️" },
    { id: "pizza", name: "Wood-Fired Pizza Station", desc: "Fresh artisanal pizzas baked live at your venue", icon: "🍕" },
    { id: "waffles", name: "Belgian Waffle & Crepe Bar", desc: "Warm waffles topped with Nutella, berries & ice cream", icon: "🧇" },
    { id: "jars", name: "Fusion Dessert Jar Bar", desc: "Rasmalai, Biscoff, and Gulab Jamun jar displays", icon: "🧁" },
    { id: "kathi", name: "Live Kathi Roll Counter", desc: "Flaky paneer & chicken rolls made fresh to order", icon: "🌯" }
  ];

  const toggleStation = (name: string) => {
    if (selectedStations.includes(name)) {
      setSelectedStations(selectedStations.filter(s => s !== name));
    } else {
      setSelectedStations([...selectedStations, name]);
    }
  };

  const handleWhatsAppQuote = () => {
    const text = `Hi Chef! I'd like a custom proposal for ${guestCount} guests with these live stations: ${selectedStations.join(", ")}.`;
    window.open(`https://wa.me/19455274566?text=${encodeURIComponent(text)}`, "_blank");
  };

  const packages = [
    {
      title: "Kids Birthday Party Package",
      subtitle: "A fun, kid-friendly menu made for little celebrations.",
      image: "src/assets/images/kids_birthday_package.png",
      icon: Cake,
      items: [
        "2 Appetizers",
        "1 Main Dish",
        "Kids’ Special Drinks",
        "Custom Celebration Cake"
      ],
      color: "border-[#775a19]/15"
    },
    {
      title: "Get-Together / Family Gathering",
      subtitle: "Comforting Indian flavors perfect for sharing.",
      image: "src/assets/images/family_gathering_package.png",
      icon: Users,
      items: [
        "Appetizers (from our catering menu)",
        "Main Courses (choose your favorites)",
        "Desserts",
        "Drinks"
      ],
      color: "border-[#775a19]/15"
    },
    {
      title: "Anniversaries & Special Occasions",
      subtitle: "Elegant menus for meaningful celebrations.",
      image: "src/assets/images/anniversary_package.png",
      icon: Heart,
      items: [
        "Appetizers",
        "Curated Main Course Selection",
        "Premium Desserts",
        "Refreshing Drinks",
        "* Optional Custom Cake"
      ],
      color: "border-[#775a19]/15"
    },
    {
      title: "Baby Shower & Special Events",
      subtitle: "Light, festive, and beautifully balanced menus.",
      image: "src/assets/images/baby_shower_package.png",
      icon: Gift,
      items: [
        "* Appetizers",
        "* Main Course Selection",
        "* Desserts & Sweet Treats",
        "* Drinks",
        "* Optional Themed Custom Cake"
      ],
      color: "border-[#775a19]/15"
    }
  ];

  return (
    <div className="bg-brand-cream-light min-h-screen animate-fade-in font-sans pb-16 lg:pb-0">
      
      {/* Elegant Hero Section with background layout */}
      <header className="relative py-24 lg:py-32 overflow-hidden bg-[#050a1a] text-white">
        {/* Dark Glassmorphic Gradients */}
        <div className="absolute inset-0 z-0 opacity-40">
          <ImageWithShimmer 
            src="src/assets/images/BlueBonnet India.jpg" 
            alt="Custom Party setup background" 
            className="w-full h-full object-cover filter brightness-50 contrast-105"
            containerClassName="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050a1a]/80 via-transparent to-[#050a1a]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 lg:px-8 text-center space-y-6">
          <span className="bg-[#ffdea5]/10 text-brand-gold-tint border border-[#ffdea5]/20 px-3.5 py-1.5 rounded-full text-[10px] font-sans tracking-widest uppercase font-extrabold">
            EXPERIENCE EXCELLENCE
          </span>
          <h1 className="font-serif text-4xl lg:text-6xl font-bold tracking-tight max-w-4xl leading-tight text-brand-cream mx-auto">
            Custom Party Packages &amp; <span className="italic text-brand-gold-tint">Live Stations</span>
          </h1>
          <p className="font-sans text-xs lg:text-base text-gray-300 max-w-3xl leading-relaxed mx-auto font-medium">
            Celebrate life’s special moments with thoughtfully curated menus and interactive live food stations designed just for your guests.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <button
              onClick={handleWhatsAppQuote}
              className="w-full sm:w-auto min-h-[44px] bg-[#775a19] hover:bg-[#5d4201] text-white font-sans text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>PLAN YOUR PARTY</span>
            </button>
            <a 
              href="sms:+19455274566?body=Hi%20Chef!%20I'd%20like%20to%20discuss%20a%20custom%20party%20package."
              className="w-full sm:w-auto min-h-[44px] border border-brand-gold-tint hover:bg-white/10 text-brand-gold-tint font-sans text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>CHAT WITH THE CHEF</span>
            </a>
          </div>
        </div>
      </header>

      {/* ── INTERACTIVE LIVE COUNTER BUILDER ── */}
      <section className="py-16 bg-silk-cream border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest text-[#775a19] uppercase block mb-2 font-sans">
              Custom Event Configurator
            </span>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-[#00346f]">
              Build Your Live Station Experience
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm max-w-xl mx-auto mt-2 font-sans">
              Select live food counters, set your guest size, and send an instant quote directly to our master chef.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 lg:p-10 rounded-3xl border border-[#c59b27]/25 shadow-xl">
            
            {/* Live Station Checkboxes */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif text-lg font-bold text-[#00346f]">Available Live Food Stations</h3>
                <span className="text-xs text-gray-500 font-sans">{selectedStations.length} Selected</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {liveStationsList.map((station) => {
                  const isSelected = selectedStations.includes(station.name);
                  return (
                    <div
                      key={station.id}
                      onClick={() => toggleStation(station.name)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 card-3d-wrapper ${
                        isSelected
                          ? "bg-amber-50/70 border-[#775a19] shadow-sm"
                          : "bg-gray-50/80 hover:bg-gray-100/80 border-gray-200"
                      }`}
                    >
                      <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 transition-colors ${
                        isSelected ? "bg-[#775a19] border-[#775a19] text-white" : "border-gray-300 bg-white"
                      }`}>
                        {isSelected && <Check className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold font-sans text-[#00346f] flex items-center gap-1.5">
                          <span>{station.icon}</span>
                          <span>{station.name}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-sans mt-0.5 leading-snug">{station.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Guest Slider & WhatsApp Quote Output */}
            <div className="lg:col-span-4 bg-gradient-to-br from-[#00346f] to-[#0a1128] text-white p-6 rounded-2xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-gold-tint font-serif text-sm font-bold">
                  <Sparkles className="h-4 w-4" />
                  <span>Instant Party Estimator</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-sans mb-2">
                    <span className="text-gray-300 font-bold uppercase tracking-wider">Estimated Guests</span>
                    <span className="text-brand-gold-tint font-bold text-sm">{guestCount} Guests</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="400"
                    step="10"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full accent-[#c59b27] cursor-pointer h-2 bg-white/20 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-sans mt-1">
                    <span>20</span>
                    <span>200</span>
                    <span>400+</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 space-y-2">
                  <div className="text-[10px] uppercase tracking-wider text-brand-gold-tint font-bold font-sans">Summary Preview</div>
                  <div className="text-xs font-sans text-gray-200">
                    <span className="font-semibold">{selectedStations.length} Stations</span> for <span className="font-semibold">{guestCount} Guests</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleWhatsAppQuote}
                className="w-full min-h-[44px] bg-[#775a19] hover:bg-[#8b691e] text-white font-sans text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Send WhatsApp Proposal</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Packages Grid Section */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold tracking-widest text-[#775a19] uppercase block mb-1">OUR OFFERINGS</span>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-[#00346f] tracking-tight">Curated Event Selections</h2>
          <div className="h-0.5 w-16 bg-[#775a19] mt-3 mx-auto" />
        </div>

        {/* 2x2 grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {packages.map((pkg, idx) => {
            const IconComponent = pkg.icon;
            return (
              <div 
                key={idx} 
                className={`border ${pkg.color} rounded-2xl bg-white flex flex-col justify-between hover:shadow-xl transition-all duration-300 shadow-xs relative overflow-hidden group card-3d-wrapper`}
              >
                <div className="card-3d-content h-full flex flex-col justify-between">
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#775a19] via-[#c59b27] to-[#775a19]" />
                  
                  <div>
                    {/* Package Cover Image with Shimmer */}
                    <div className="relative h-52 overflow-hidden">
                      <ImageWithShimmer 
                        src={pkg.image} 
                        alt={pkg.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        containerClassName="w-full h-full"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                    </div>

                    {/* Content Area */}
                    <div className="p-6 lg:p-8 space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-[#775a19]/10 text-[#775a19] flex items-center justify-center shrink-0">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-serif text-xl lg:text-2xl font-bold text-[#00346f] leading-snug">
                            {pkg.title}
                          </h3>
                          <p className="text-gray-500 text-xs lg:text-sm font-sans mt-1">
                            {pkg.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="h-[1px] w-full bg-gray-150" />

                      <ul className="space-y-3.5 font-sans text-xs lg:text-sm">
                        {pkg.items.map((item, itemIdx) => {
                          const isOptional = item.startsWith("*");
                          const cleanItem = isOptional ? item.slice(1).trim() : item;
                          return (
                            <li key={itemIdx} className="flex items-center gap-3">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#775a19]/15 text-[#775a19] text-[10px] font-bold">
                                ✓
                              </span>
                              <span className={`${isOptional ? "text-gray-500 italic" : "text-gray-700 font-medium"}`}>
                                {cleanItem}
                                {isOptional && <span className="text-[10px] bg-brand-rose text-brand-rose-dark px-1.5 py-0.5 rounded ml-2 uppercase font-bold tracking-wider font-mono">Optional</span>}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Booking CTA Section */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 lg:px-8 py-10 pb-24">
        <div className="bg-gradient-to-br from-[#0a1128] to-[#00346f] text-white rounded-3xl p-10 lg:p-14 text-center shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold tracking-tight text-brand-cream">
              Let&apos;s Design Your Custom Menu
            </h2>
            <p className="text-gray-300 text-xs lg:text-sm font-sans leading-relaxed max-w-xl mx-auto">
              Our chefs will work with you to customize any of these packages to suit your exact tastes and dietary preferences.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <button 
                onClick={handleWhatsAppQuote}
                className="w-full sm:w-auto min-h-[44px] bg-[#775a19] hover:bg-[#5d4201] text-white font-sans text-xs uppercase tracking-widest font-bold px-8 py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>REQUEST CUSTOM PROPOSAL</span> <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── MOBILE SAFE-AREA BOTTOM ACTION DOCK ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#00346f]/95 backdrop-blur-md border-t border-[#c59b27]/30 p-3 pb-safe shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={handleWhatsAppQuote}
            className="flex-1 min-h-[44px] bg-[#775a19] hover:bg-[#5d4201] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="h-4 w-4 text-brand-gold-tint" />
            <span>WhatsApp Proposal</span>
          </button>
        </div>
      </div>

    </div>
  );
}

