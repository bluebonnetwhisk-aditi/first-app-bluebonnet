import { Phone } from "lucide-react";

interface CateringPageProps {
  onOpenWizard: (flavor?: string, category?: string) => void;
}

export default function CateringPage({ onOpenWizard }: CateringPageProps) {
  // Navigation scrolling helper
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-brand-cream-light min-h-screen animate-fade-in font-sans">
      
      {/* Hero Section */}
      <section className="relative py-20 bg-cover bg-center border-b border-[#ededf4]" style={{ backgroundImage: "url('src/assets/images/bluebonnet_whisk_backdrop.png')" }}>
        <div className="absolute inset-0 bg-[#00346f]/70 mix-blend-multiply" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 text-center text-white">
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-4 text-brand-cream">
            The Catering Collection
          </h1>
          <p className="text-sm md:text-base text-gray-200 max-w-2xl mx-auto leading-relaxed font-medium">
            Modern heritage culinary experiences tailored for intimate celebrations, corporate events, and festive gatherings.
          </p>
        </div>
      </section>

      {/* Categories Sub-nav */}
      <div className="bg-white border-b border-gray-150 py-4 sticky top-16 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap justify-center gap-3 md:gap-6">
          {[
            { label: "APPETIZERS", id: "appetizers" },
            { label: "KIDS PARTY", id: "kids-party" },
            { label: "BEVERAGE STATIONS", id: "beverages" },
            { label: "CORPORATE", id: "corporate" }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => scrollToSection(btn.id)}
              className="border border-[#775a19]/50 hover:bg-[#775a19]/5 px-5 py-2 text-[10px] md:text-xs font-bold tracking-widest text-[#775a19] uppercase rounded-sm transition-all cursor-pointer"
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* Section 1: Appetizers & Party Platters */}
        <section id="appetizers" className="scroll-mt-36">
          <div className="text-center mb-10">
            <span className="text-[10px] font-bold tracking-widest text-secondary-brand uppercase block mb-1">ARTISANAL BITES</span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary-brand">Appetizers &amp; Party Platters</h2>
            <div className="h-0.5 w-12 bg-secondary-brand mt-2 mx-auto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-gray-150 rounded-lg p-6 md:p-8 shadow-xs">
            {/* Left large verrine image */}
            <div className="lg:col-span-7 h-[250px] md:h-[400px] rounded overflow-hidden shadow-sm relative group">
              <img 
                src="src/assets/images/WhatsApp Image 2026-02-13 at 12.00.03 AM.jpeg" 
                alt="Deconstructed Samosa Chaat" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-4 left-4 bg-[#0a1128]/80 text-white px-4 py-2 rounded-sm backdrop-blur-xs">
                <p className="font-serif text-sm font-semibold text-brand-gold-tint">Deconstructed Samosa Chaat</p>
                <p className="text-[10px] font-sans text-gray-300">Individual verrines with spiced chickpeas, sweet yogurt, and tangy tamarind.</p>
                <span className="inline-block mt-1 text-[8px] bg-emerald-700 text-white font-bold tracking-wider px-1.5 py-0.5 rounded-sm uppercase">VEGETARIAN</span>
              </div>
            </div>

            {/* Right details cards */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="border border-gray-150 rounded bg-[#fcfbf9] p-5 shadow-xs">
                <div className="flex justify-between items-start mb-1.5">
                  <h3 className="font-serif text-lg font-bold text-[#00346f]">Pepdi Bliss Platter</h3>
                  <span className="text-[9px] font-bold tracking-wider uppercase bg-[#775a19]/10 text-[#775a19] px-2 py-0.5 rounded">Min. 25 pieces</span>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm font-sans leading-relaxed">
                  Handmade flour crisps topped with tempered potatoes, sprouts, and tri-chutney drizzle.
                </p>
              </div>

              <div className="border border-gray-150 rounded bg-[#fcfbf9] p-5 shadow-xs">
                <div className="flex justify-between items-start mb-1.5">
                  <h3 className="font-serif text-lg font-bold text-[#00346f]">Paneer Tikka Crostini</h3>
                  <span className="text-[9px] font-bold tracking-wider uppercase bg-[#775a19]/10 text-[#775a19] px-2 py-0.5 rounded">Min. 25 pieces</span>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm font-sans leading-relaxed">
                  Tandoori spiced cottage cheese cubes on toasted sourdough with mint pesto.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Section 2: Kids Party Menu */}
        <section id="kids-party" className="scroll-mt-36">
          <div className="text-center mb-10">
            <span className="text-[10px] font-bold tracking-widest text-secondary-brand uppercase block mb-1">WHIMSICAL FEASTS</span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary-brand">Kids Party Menu</h2>
            <div className="h-0.5 w-12 bg-secondary-brand mt-2 mx-auto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-gray-150 rounded-lg p-6 md:p-8 shadow-xs">
            {/* Left cookies and milk image */}
            <div className="lg:col-span-6 h-[250px] md:h-[400px] rounded overflow-hidden shadow-sm">
              <img 
                src="src/assets/images/cake_jars_detail_2_1781195040371.jpg" 
                alt="Artisanal Cookie Flight" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Right bullet lists */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-4">
                {[
                  {
                    title: "Artisanal Cookie Flight",
                    desc: "Miniature chocolate chip, pistachio shortbread, and saffron cardamom nankhatais."
                  },
                  {
                    title: "Mini Paneer Sliders",
                    desc: "Soft brioche buns with mild tikka patties and creamy house slaw."
                  },
                  {
                    title: "Rainbow Fruit Kebabs",
                    desc: "Seasonal fruits with a honey-lime glaze and mint yogurt dip."
                  }
                ].map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="text-secondary-brand text-lg shrink-0 mt-0.5">★</span>
                    <div>
                      <h4 className="font-serif text-base font-bold text-primary-brand">{item.title}</h4>
                      <p className="text-gray-600 text-xs sm:text-sm font-sans leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={() => onOpenWizard("", "Kids & Fun")}
                  className="border border-secondary-brand hover:bg-secondary-brand/5 px-6 py-3 text-[11px] font-bold tracking-widest text-[#775a19] uppercase rounded-sm transition-all cursor-pointer"
                >
                  VIEW FULL KIDS MENU
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Beverage Stations */}
        <section id="beverages" className="scroll-mt-36">
          <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between border-b border-gray-150 pb-4">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-secondary-brand uppercase block mb-1">LIQUID LUXURY</span>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary-brand">Beverage Stations</h2>
            </div>
            <p className="text-xs text-gray-500 font-sans mt-2 md:mt-0">
              Self-service or staffed stations featuring our signature house-brewed blends.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Chai & Coffee Bar",
                desc: "Authentic Masala Chai, Filter Coffee, and assorted herbal teas served with handmade rusks.",
                tag: "LIVE BREWING AVAILABLE"
              },
              {
                title: "Signature Mocktails",
                desc: "Lychee-Rose Sparklers, Guava-Chili Margaritas, and Mango-Mint Coolers.",
                tag: "CUSTOM BRANDING INCLUDED"
              },
              {
                title: "Infused Hydration",
                desc: "Cucumber-Lemon-Mint and Basil-Strawberry infused waters served in crystal carafes.",
                tag: "CHILLING STATIONS"
              }
            ].map((station, i) => (
              <div key={i} className="bg-white border border-gray-150 rounded-lg p-6 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="mb-4 h-10 w-10 bg-[#00346f]/5 rounded flex items-center justify-center text-primary-brand text-lg">
                    ☕
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#00346f] mb-2">{station.title}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm font-sans leading-relaxed mb-6">{station.desc}</p>
                </div>
                <div className="border-t border-gray-100 pt-3 text-[9px] font-bold tracking-widest text-secondary-brand uppercase">
                  {station.tag}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Corporate Catering */}
        <section id="corporate" className="scroll-mt-36">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#00346f] text-white rounded-lg overflow-hidden shadow-md">
            
            {/* Left content panel */}
            <div className="lg:col-span-7 p-8 md:p-12 space-y-6">
              <span className="text-[10px] font-bold tracking-widest text-brand-gold-tint uppercase block">BUSINESS ELEVATED</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-cream tracking-tight">Corporate Catering</h2>
              <p className="text-gray-200 text-xs sm:text-sm font-sans leading-relaxed max-w-xl">
                Impeccable service and sophisticated menus designed for board meetings, office lunches, and corporate milestones. We handle the logistics so you can focus on the business.
              </p>

              <div className="space-y-3 font-sans text-xs">
                {[
                  "Individually Packaged Gourmet Bento Boxes",
                  "On-site staffing and table setup",
                  "Dietary-Consultant Menu Customization"
                ].map((bullet, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold-tint text-[#00346f] font-bold text-[10px]">✓</span>
                    <span className="font-medium">{bullet}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onOpenWizard("", "Corporate Catering")}
                  className="bg-[#fed488] hover:bg-[#fed488]/95 text-gray-900 px-6 py-3.5 text-xs font-bold tracking-widest uppercase rounded-sm shadow-md transition-all cursor-pointer"
                >
                  REQUEST CORPORATE BROCHURE
                </button>
              </div>
            </div>

            {/* Right double square images */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4 p-8 lg:p-12">
              <div className="aspect-square rounded overflow-hidden shadow-md">
                <img 
                  src="src/assets/images/WhatsApp Image 2023-06-25 at 2.12.52 PM.jpeg" 
                  alt="Corporate Bento Layout" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="aspect-square rounded overflow-hidden shadow-md">
                <img 
                  src="src/assets/images/BlueBonnet Catering.jpeg" 
                  alt="Chefs plating gourmet dishes" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

          </div>
        </section>

        {/* Section 5: Start Planning Your Event */}
        <section className="bg-gradient-to-br from-[#faf7f2] to-[#fbfbfa] border border-gray-150 rounded-lg p-10 text-center shadow-xs">
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-primary-brand mb-3">Start Planning Your Event</h3>
          <p className="text-gray-600 text-xs sm:text-sm font-sans max-w-xl mx-auto mb-8 leading-relaxed">
            From custom menus to full-service coordination, we bring the artistry of Bluebonnet Whisk to your venue.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => onOpenWizard()}
              className="w-full sm:w-auto bg-[#00346f] hover:bg-[#00346f]/90 text-white font-sans text-xs uppercase tracking-widest font-bold px-8 py-3.5 rounded shadow-md transition-all cursor-pointer"
            >
              INQUIRE ONLINE
            </button>
            <a
              href="tel:+19455274566"
              className="w-full sm:w-auto border border-gray-400 hover:bg-gray-50 text-gray-700 font-sans text-xs uppercase tracking-widest font-bold px-8 py-3.5 rounded transition-all flex items-center justify-center gap-2"
            >
              <Phone className="h-4 w-4 text-secondary-brand" /> CALL OUR CONCIERGE
            </a>
          </div>
        </section>

      </main>

    </div>
  );
}
