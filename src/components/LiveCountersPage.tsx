import { Cake, Users, Heart, Gift, ArrowRight, MessageSquare } from "lucide-react";

interface LiveCountersPageProps {
  onOpenWizard: (flavor?: string, category?: string) => void;
}

export default function LiveCountersPage({ onOpenWizard }: LiveCountersPageProps) {
  const packages = [
    {
      title: "Kids Birthday Party Package",
      subtitle: "A fun, kid-friendly menu made for little celebrations.",
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
      title: "Get-Together / Family Gathering 🍽️",
      subtitle: "Comforting Indian flavors perfect for sharing.",
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
      title: "Anniversaries & Special Occasions 💛",
      subtitle: "Elegant menus for meaningful celebrations.",
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
      title: "Baby Shower & Special Events 🌸",
      subtitle: "Light, festive, and beautifully balanced menus.",
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
    <div className="bg-brand-cream-light min-h-screen animate-fade-in font-sans">
      
      {/* Elegant Hero Section with background layout */}
      <header className="relative py-24 md:py-32 overflow-hidden bg-[#050a1a] text-white">
        {/* Dark Glassmorphic Gradients */}
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="/src/assets/images/BlueBonnet India.jpg" 
            alt="Custom Party setup background" 
            className="w-full h-full object-cover filter brightness-50 contrast-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050a1a]/80 via-transparent to-[#050a1a]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="bg-[#ffdea5]/10 text-brand-gold-tint border border-[#ffdea5]/20 px-3 py-1 rounded-full text-[10px] font-sans tracking-widest uppercase font-extrabold">
            EXPERIENCE EXCELLENCE
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-4xl leading-tight text-brand-cream mx-auto">
            Custom Party Packages
          </h1>
          <p className="font-sans text-xs sm:text-sm md:text-base text-gray-300 max-w-3xl leading-relaxed mx-auto">
            Celebrate life’s special moments with thoughtfully curated menus designed just for you. From intimate get-togethers to grand celebrations, we bring together flavors, freshness, and ease—so you can simply enjoy your event.
          </p>
          <p className="font-sans text-xs text-brand-gold-tint/90 max-w-2xl mx-auto italic">
            Choose from appetizers, mains, desserts, and drinks. We take care of the rest.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <button
              onClick={() => onOpenWizard("", "Catering")}
              className="w-full sm:w-auto bg-[#775a19] hover:bg-[#5d4201] text-white font-sans text-xs font-bold uppercase tracking-widest px-8 py-4 rounded shadow-lg transition-all"
            >
              PLAN YOUR PARTY
            </button>
            <a 
              href="https://wa.me/9455274566"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto border border-brand-gold-tint hover:bg-white/10 text-brand-gold-tint font-sans text-xs font-bold uppercase tracking-widest px-8 py-4 rounded transition-all flex items-center justify-center gap-2"
            >
              CHAT WITH THE CHEF
            </a>
          </div>
        </div>
      </header>

      {/* Packages Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold tracking-widest text-[#775a19] uppercase block mb-1">OUR OFFERINGS</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#00346f] tracking-tight">Curated Event Selections</h2>
          <div className="h-0.5 w-16 bg-[#775a19] mt-3 mx-auto" />
        </div>

        {/* 2x2 grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {packages.map((pkg, idx) => {
            const IconComponent = pkg.icon;
            return (
              <div 
                key={idx} 
                className={`border ${pkg.color} rounded-lg bg-white p-8 md:p-10 flex flex-col justify-between hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 shadow-xs relative overflow-hidden group`}
              >
                {/* Subtle top brand line */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#775a19]/40 to-[#ffdea5]" />
                
                <div className="space-y-6">
                  {/* Package Header */}
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-[#775a19]/10 text-[#775a19] flex items-center justify-center shrink-0">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl md:text-2xl font-bold text-[#00346f] leading-snug">
                        {pkg.title}
                      </h3>
                      <p className="text-gray-500 text-xs sm:text-sm font-sans mt-1">
                        {pkg.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="h-[1px] w-full bg-gray-150" />

                  {/* Package Items */}
                  <ul className="space-y-3.5 font-sans text-xs sm:text-sm">
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

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => onOpenWizard("", pkg.title)}
                    className="w-full sm:w-auto bg-[#00346f] hover:bg-[#00346f]/95 text-white font-sans text-xs uppercase tracking-widest font-bold px-6 py-3 rounded shadow-sm transition-all cursor-pointer"
                  >
                    SELECT THIS PACKAGE
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Booking CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
        <div className="bg-gradient-to-br from-[#0a1128] to-[#00346f] text-white rounded-lg p-10 md:p-14 text-center shadow-md relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-brand-cream">
              Let&apos;s Design Your Custom Menu
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm font-sans leading-relaxed max-w-xl mx-auto">
              Our chefs will work with you to customize any of these packages to suit your exact tastes and dietary preferences.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <button 
                onClick={() => {
                  window.location.href = "mailto:bluebonnetwhisk@gmail.com?subject=Custom%20Celebration%20Inquiry";
                }}
                className="w-full sm:w-auto bg-[#775a19] hover:bg-[#5d4201] text-white font-sans text-xs uppercase tracking-widest font-bold px-8 py-4 rounded shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                REQUEST CUSTOM PROPOSAL <ArrowRight className="h-4 w-4" />
              </button>
              <a 
                href="https://wa.me/9455274566"
                target="_blank" 
                rel="noreferrer"
                className="w-full sm:w-auto border border-brand-gold-tint hover:bg-white/10 text-brand-gold-tint font-sans text-xs uppercase tracking-widest font-bold px-8 py-4 rounded flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" /> CHAT WITH THE CHEF
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
