
interface LiveCountersPageProps {
  onOpenWizard: (flavor?: string, category?: string) => void;
}

export default function LiveCountersPage({ onOpenWizard }: LiveCountersPageProps) {
  return (
    <div className="bg-[#f9f9ff] min-h-screen animate-fade-in font-sans">
      
      {/* Elegant Hero Section with background layout */}
      <header className="relative py-24 md:py-36 overflow-hidden bg-gray-300">
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/images/BlueBonnet India.jpg" 
            alt="Authentic Indian street food live setup background" 
            className="w-full h-full object-cover filter brightness-75 contrast-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white text-left space-y-6">
          <span className="bg-brand-gold-tint text-brand-gold-shadow px-3 py-1 rounded-sm text-[10px] font-sans tracking-widest uppercase font-bold">
            INTERACTIVE EXPERIENCE
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight max-w-3xl leading-tight text-brand-cream">
            The Modern Heritage Street Food Live Experience
          </h1>
          <p className="font-sans text-sm sm:text-base text-gray-200 max-w-2xl leading-relaxed">
            Transform your event with the vibrant energy of India&apos;s streets, reimagined for the most prestigious gatherings. Real-time artistry meets ancestral flavors.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              onClick={() => onOpenWizard("", "Live Counters")}
              className="w-full sm:w-auto bg-primary-brand hover:bg-[#114589] text-white font-sans text-xs uppercase tracking-widest font-bold px-8 py-4 rounded shadow-lg transition-all"
            >
              BOOK THE EXPERIENCE
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("counters-list");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto border border-white hover:bg-white/10 text-white font-sans text-xs uppercase tracking-widest font-bold px-8 py-4 rounded transition-all"
            >
              VIEW MENU
            </button>
          </div>
        </div>
      </header>

      {/* Signature Counters Section */}
      <section id="counters-list" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-brand tracking-tight mb-3">Our Signature Counters</h2>
          <p className="text-gray-600 font-sans text-xs md:text-sm max-w-xl mx-auto">
            From the theatrical snap of a Pani Puri to the sizzle of a Tawa, our five stations are designed to be the heartbeat of your celebration.
          </p>
          <div className="h-0.5 w-16 bg-secondary-brand mt-4 mx-auto" />
        </div>

        {/* Bento grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Pani Puri Counter */}
          <div className="md:col-span-8 border border-gray-150 rounded-lg bg-gradient-to-br from-[#ededf4] to-[#e2e2e8] p-8 flex flex-col justify-between min-h-[280px] relative overflow-hidden group shadow-sm">
            <div className="absolute inset-0 bg-primary-brand/5 group-hover:bg-primary-brand/10 transition-colors pointer-events-none" />
            <div className="relative z-10">
              <span className="text-[10px] font-bold text-[#00346f] tracking-widest uppercase block mb-1">Interactive Station</span>
              <h3 className="font-serif text-2xl font-bold text-primary-brand mb-3">Pani Puri / Golgappa Live Counter</h3>
              <p className="text-gray-700 text-xs sm:text-sm font-sans max-w-xl leading-relaxed mb-6">
                Experience the &quot;crunch &amp; burst&quot; with 5 signature artisanal waters including Pomegranate-Mint, spiced Pineapple, tang tamarind, raw mango, and classic spicy cumin. Served in elegant glassware.
              </p>
            </div>
            <div className="flex gap-2 relative z-10">
              {["Custom Waters", "Artisanal Thrills"].map((tag) => (
                <span key={tag} className="text-[10px] font-sans tracking-wider bg-white border border-gray-300 text-gray-600 px-3 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Single Serving Chaat Station */}
          <div className="md:col-span-4 border border-gray-150 rounded-lg bg-gradient-to-br from-[#6c0b2b] to-[#8b2641] text-white p-8 flex flex-col justify-between min-h-[280px] shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-brand-rose tracking-widest uppercase block mb-1">Gourmet Platters</span>
              <h3 className="font-serif text-2xl font-bold mb-3 text-brand-cream">Single-Serving Chaat Station</h3>
              <p className="text-brand-rose/90 text-xs sm:text-sm font-sans leading-relaxed">
                Sophisticated individual servings of Samosa Chaat, Aloo Tikki Chaat, and Papdi Chaat, elegantly presented in premium glassware and assembled live by our expert servers.
              </p>
            </div>
            <div className="border-t border-brand-rose/20 pt-4 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase text-brand-gold-tint">
              <span>Plated Luxury</span>
              <span>LIVE SERVER ASSEMBLY</span>
            </div>
          </div>

          {/* Indo-Chinese Live Counter */}
          <div className="md:col-span-4 border border-gray-150 rounded-lg bg-gradient-to-br from-[#0a1128] to-[#1a4b8f] text-white p-8 flex flex-col justify-between min-h-[280px] shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-brand-gold-tint tracking-widest uppercase block mb-1">Wok Culinary</span>
              <h3 className="font-serif text-2xl font-bold mb-3 text-brand-cream">Indo-Chinese Live Counter</h3>
              <p className="text-gray-200 text-xs sm:text-sm font-sans leading-relaxed">
                Wok-tossed perfection. Sizzling noodles, vegetable spring rolls, spring-onion rice, and paneer chili prepared with fresh Szechuan chili pastes, garlic crunch, and heritage spices.
              </p>
            </div>
            <div className="border-t border-white/10 pt-4 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase text-brand-gold-tint">
              <span>Sizzling Woks</span>
              <span>CHILI PANEER &amp; NOODLES</span>
            </div>
          </div>

          {/* Artisanal Drink Station */}
          <div className="md:col-span-8 border border-gray-150 rounded-lg bg-white overflow-hidden flex flex-col md:flex-row shadow-sm">
            <div className="p-8 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-secondary-brand tracking-widest uppercase block mb-1">BEVERAGES</span>
                <h3 className="font-serif text-2xl font-bold text-primary-brand mb-3">Artisanal Drink Station</h3>
                <p className="text-gray-600 text-xs sm:text-sm font-sans leading-relaxed mb-6">
                  A vibrant collection of traditional and modern mocktails and refreshers: Mango Lassi, Masala Cola, Masala Buttermilk, Aam Panna, and Spiced Lemonades. Garnished with fresh mint and premium hand-dried fruits.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 border-t border-gray-100 pt-4 text-[10px] font-semibold text-gray-500 font-sans">
                {["Mango Lassi", "Masala Cola", "Masala Buttermilk", "Aam Panna"].map((drink) => (
                  <span key={drink} className="bg-gray-50 border border-gray-200 px-2.5 py-1 rounded">
                    {drink}
                  </span>
                ))}
              </div>
            </div>
            <div className="w-full md:w-[240px] h-[200px] md:h-auto shrink-0 relative bg-gray-100">
              <img 
                src="/src/assets/images/WhatsApp Image 2024-03-27 at 9.49.26 AM (2).jpeg" 
                alt="Colorful Mocktail cups lined on bar" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Setup provisions section */}
      <section className="bg-white border-t border-b border-gray-150 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left lists */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <h2 className="font-serif text-3xl font-bold text-primary-brand mb-4">Custom Event Food Stall Setup</h2>
                <p className="text-gray-600 text-xs sm:text-sm font-sans leading-relaxed">
                  We don&apos;t just serve food; we design atmospheres. Our &quot;Modern Heritage&quot; stalls are crafted with antique brass, reclaimed wood, and minimalist floral arrangements to make your event look stunning.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    title: "Tailored Aesthetics",
                    desc: "We match the stall decor to your wedding or corporate theme perfectly."
                  },
                  {
                    title: "Pristine Hygiene",
                    desc: "Global food safety standards integrated into the street experience."
                  },
                  {
                    title: "Theatrical Service",
                    desc: "Our chefs are performers who engage with your guests."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 border border-gray-100 rounded bg-[#fbfbfa] p-4 shadow-2xs">
                    <div className="h-9 w-9 rounded-full bg-[#775a19]/10 text-secondary-brand flex items-center justify-center shrink-0">
                      ★
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-primary-brand mb-1">{item.title}</h4>
                      <p className="text-gray-600 text-xs font-sans leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right double square images */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="aspect-square rounded overflow-hidden shadow-md">
                <img 
                  src="/src/assets/images/WhatsApp Image 2026-02-13 at 12.00.03 AM.jpeg" 
                  alt="Live plating setup close up" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="aspect-square rounded overflow-hidden shadow-md">
                <img 
                  src="/src/assets/images/BlueBonnet Whisk Booth BackdropCustom Cakes and Bakes BannerFusion Desserts & Custom Creations BackdropHomemade Goodness, Baked with Love Display.jpg" 
                  alt="Beautiful live stall decorated setup" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Booking CTA section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-[#0a1128] to-[#00346f] text-white rounded-lg p-10 text-center shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-brand-cream">
              Ready to elevate your event?
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm font-sans leading-relaxed">
              Let&apos;s curate a bespoke live counter experience that your guests will talk about for years.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
              <a 
                href="https://wa.me/19455274566"
                target="_blank" 
                rel="noreferrer"
                className="w-full sm:w-auto bg-white text-primary-brand hover:bg-gray-100 font-sans text-xs uppercase tracking-widest font-bold px-8 py-3.5 rounded flex items-center justify-center gap-2"
              >
                WHATSAPP US
              </a>
              <button 
                onClick={() => onOpenWizard()}
                className="w-full sm:w-auto border border-brand-gold-tint hover:bg-white/10 text-brand-gold-tint font-sans text-xs uppercase tracking-widest font-bold px-8 py-3.5 rounded"
              >
                REQUEST A QUOTE
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
