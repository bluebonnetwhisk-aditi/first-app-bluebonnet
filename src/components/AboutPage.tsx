import { useState } from "react";
import { Sparkles, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email && contactForm.message) {
      const subject = encodeURIComponent(`Contact Form Message - ${contactForm.name}`);
      const body = encodeURIComponent(
        `Name: ${contactForm.name}\n` +
        `Email: ${contactForm.email}\n` +
        `Message:\n${contactForm.message}`
      );
      const mailtoUrl = `mailto:bluebonnetwhisk@gmail.com?subject=${subject}&body=${body}`;
      window.location.href = mailtoUrl;

      setContactSuccess(true);
      setContactForm({ name: "", email: "", message: "" });
      setTimeout(() => setContactSuccess(false), 4000);
    }
  };

  const cateringCards = [
    {
      title: "PRIVATE CELEBRATIONS",
      desc: "Birthdays · Anniversaries · Baby Showers · House Parties",
      image: "src/assets/images/private_celebrations.png"
    },
    {
      title: "CORPORATE EVENTS",
      desc: "Team Lunches · Office Gatherings · Appreciation Dinners · Product Launches",
      image: "src/assets/images/corporate_events.png"
    },
    {
      title: "FESTIVALS & COMMUNITY",
      desc: "Diwali · Eid · Holi · Navratri · Cultural Events · Satvik Puja Food",
      image: "src/assets/images/festivals_community.png"
    },
    {
      title: "SIGNATURE LIVE EXPERIENCES",
      desc: "Pani Puri Station · Chaat Experience · Dessert Tables",
      image: "src/assets/images/live_experiences.png"
    }
  ];

  return (
    <div className="bg-brand-cream-light min-h-screen animate-fade-in font-sans selection:bg-secondary-brand/20">
      
      {/* ── OUR STORY SECTION (2-COLUMN) ── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Image */}
          <div className="lg:col-span-5 h-[300px] lg:h-[480px] rounded-lg overflow-hidden shadow-lg border border-brand-gold-tint/25 relative group">
            <img 
              src="src/assets/images/celebration_food_serving.png" 
              alt="Elegant Indian catering spread food being served at garden party" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {/* Right Column: Story Content */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[10px] font-bold text-secondary-brand tracking-widest uppercase block font-sans">ESTABLISHED WITH PASSION</span>
            <h2 className="font-serif text-3xl lg:text-5xl font-bold text-primary-brand tracking-tight">Our Story</h2>
            <div className="h-0.5 w-12 bg-secondary-brand mt-2" />
            
            <div className="space-y-4 text-gray-600 text-xs lg:text-sm leading-relaxed font-sans">
              <p>
                Bluebonnet Whisk started with a simple passion—creating delicious food that brings people together. What began with handcrafted cakes and desserts has grown into a catering experience inspired by the vibrant flavors of India and the joy of celebrating life's special moments.
              </p>
              <p>
                From custom cakes and desserts to party trays, live chaat stations, and full-service catering, everything we serve is prepared fresh with quality ingredients and genuine care. Our menus blend beloved Indian classics with modern favorites, creating memorable experiences for gatherings of every size.
              </p>
              <p>
                Today, we're proud to help families, friends, and communities celebrate with food that's flavorful, heartfelt, and made to be shared.
              </p>
            </div>

            <div className="pt-6 border-t border-brand-gold-tint/40 mt-6 text-right font-serif italic text-[#775a19] text-sm font-semibold">
              “Made with Heart. Served with Pride.”
            </div>
          </div>

        </div>
      </section>

      {/* ── THE BLUEBONNET PROMISE SECTION (3-CARDS) ── */}
      <section className="bg-white border-t border-b border-gray-150 py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold tracking-widest text-[#775a19] uppercase block mb-1">OUR CORE VALUES</span>
            <h2 className="font-serif text-3xl font-bold text-primary-brand">The Bluebonnet Promise</h2>
            <p className="text-gray-600 text-xs lg:text-sm font-sans max-w-xl mx-auto mt-2">
              Whether it&apos;s a custom cake or full-service catering, we promise fresh flavors, thoughtful details, and a celebration worth remembering.
            </p>
            <div className="h-0.5 w-16 bg-secondary-brand mt-4 mx-auto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Promise 1: Home-style Warmth */}
            <div className="border border-gray-150 rounded-lg p-6 flex flex-col lg:flex-row gap-4 items-center bg-[#fcfbf9] shadow-xs">
              <div className="w-full lg:w-1/3 h-28 rounded overflow-hidden shrink-0">
                <img 
                  src="src/assets/images/cake_jars_detail_2_1781195040371.jpg" 
                  alt="Home-style baking details" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-base lg:text-lg font-bold text-primary-brand mb-1">Home-style Warmth</h3>
                <p className="text-gray-600 text-xs font-sans leading-relaxed">
                  Made with love for family. We preserve the soul of traditional recipes, making every bite feel like a warm embrace from a cherished family kitchen.
                </p>
              </div>
            </div>

            {/* Promise 2: Quality Ingredients */}
            <div className="border border-gray-150 rounded-lg p-6 bg-[#fcfbf9] shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="font-serif text-base lg:text-lg font-bold text-primary-brand mb-1">Quality Ingredients</h3>
                <p className="text-gray-600 text-xs font-sans leading-relaxed">
                  Good quality, raw materials. As moms, we care what goes inside the food - sourcing only the finest ingredients for family you can trust.
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <span className="text-[9px] font-bold tracking-wider uppercase bg-brand-rose text-brand-rose-dark px-2 py-0.5 rounded-sm font-sans">NON-GMO</span>
                <span className="text-[9px] font-bold tracking-wider uppercase bg-brand-pistachio text-brand-pistachio-dark px-2 py-0.5 rounded-sm font-sans">ORGANIC</span>
              </div>
            </div>

            {/* Promise 3: Live Counters */}
            <div className="border border-gray-150 rounded-lg p-6 bg-primary-brand text-white shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="font-serif text-base lg:text-lg font-bold text-brand-cream mb-1">Live Counters</h3>
                <p className="text-gray-200 text-xs font-sans leading-relaxed">
                  Made for you as per your event need. Leave the food prep to our team as you relax, enjoy the party, and attend to your guests.
                </p>
              </div>
              <div className="flex gap-2 mt-4 text-[9px] font-bold tracking-widest text-brand-gold-tint font-sans uppercase">
                ★ POPULAR ADDON
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 1: WHAT SETS US APART ── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Checklist */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-[10px] font-bold text-[#775a19] tracking-widest uppercase block font-sans">OUR UNIQUE ADVANTAGES</span>
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-[#00346f]">What Sets Us Apart</h2>
              <div className="h-0.5 w-16 bg-[#775a19] mt-2" />
            </div>

            <div className="space-y-4 pt-4">
              {[
                "Every dish is freshly prepared for your event — nothing pre-made, nothing frozen",
                "Authentic regional recipes inspired by Dilli 6 chaat, North Indian mains, Punjabi staples, Lucknowi Mughlai cuisine, Mumbai street food, and more",
                "Premium, carefully sourced ingredients without premium markups",
                "Fully custom menus built around your occasion, guest preferences, and vision",
                "Signature live counters including Pani Puri stations, Chaat experiences, grazing tables, and dessert displays",
                "Personal attention from first enquiry to the last bite — we handle every detail so you can enjoy your celebration"
              ].map((point, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="h-6 w-6 rounded-full bg-[#775a19]/10 text-[#775a19] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-gray-700 text-xs lg:text-sm font-sans leading-relaxed font-medium">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Image */}
          <div className="lg:col-span-5 h-[300px] lg:h-[480px] rounded-lg overflow-hidden shadow-lg border border-brand-gold-tint/25 relative group">
            <img 
              src="src/assets/images/what_sets_us_apart_img.png" 
              alt="Premium Indian catering setup details" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

        </div>
      </section>

      {/* ── SECTION 2: WE CATER FOR ── */}
      <section className="bg-white border-t border-b border-gray-150 py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-[10px] font-bold tracking-widest text-[#775a19] uppercase block mb-1">CATERING SERVICES</span>
            <h2 className="font-serif text-3xl font-bold text-[#00346f] tracking-tight">We Cater For</h2>
            <p className="text-gray-600 text-xs lg:text-sm font-sans leading-relaxed mt-3">
              From intimate gatherings to large celebrations, we bring people together through unforgettable food experiences.
            </p>
            <div className="h-0.5 w-16 bg-[#775a19] mt-4 mx-auto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {cateringCards.map((card, idx) => (
              <div 
                key={idx}
                className="bg-[#fcfbf9] border border-gray-150 rounded-lg overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={card.image} 
                    alt={card.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-serif text-sm font-bold text-[#00346f] uppercase tracking-wider">{card.title}</h3>
                    <p className="text-gray-600 text-xs font-sans leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── SECTION 3: UNCOMPROMISING HYGIENE (STANDALONE) ── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Image with Overlay */}
          <div className="lg:col-span-5 h-[300px] lg:h-[450px] rounded-lg overflow-hidden shadow-lg border border-gray-150 relative group">
            <img 
              src="src/assets/images/hygienic_catering_prep.png" 
              alt="Fresh hygienic catering preparation at Bluebonnet Whisk kitchen" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              referrerPolicy="no-referrer"
            />
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-sans font-bold italic tracking-wide text-brand-cream drop-shadow-xs">
              “Clean. Fresh. Carefully prepared for every celebration.”
            </div>
          </div>

          {/* Right Column: Hygiene Story Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[#10b981]/10 text-[#10b981] flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-[#10b981] tracking-widest uppercase block font-sans">SAFETY &amp; TRUST STANDARD</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-primary-brand tracking-tight">Uncompromising Hygiene</h2>
            <div className="h-0.5 w-12 bg-secondary-brand mt-2" />
            
            <p className="text-gray-600 text-xs lg:text-sm font-sans leading-relaxed">
              At Bluebonnet Whisk, cleanliness and food safety are the cornerstones of our kitchen. We adhere to rigorous sanitization protocols at every stage of food prep, handling, and delivery. From fresh gloves to climate-controlled setups, we ensure every dish is safe, hygienic, and prepared with maximum care.
            </p>

            <div className="space-y-3 pt-2">
              {[
                "Climate-controlled food transport and storage guidelines",
                "100% sanitized prep surfaces, utensils, and cookware before every batch",
                "Certified handlers practicing absolute food safety protocols at all times"
              ].map((bullet, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs text-gray-700 font-sans font-medium">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[#10b981] font-bold text-[10px]">✓</span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── CONTACT FORM SECTION ── */}
      <section className="bg-gray-50 border-t border-gray-150 py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="border border-gray-200 rounded-lg p-6 lg:p-8 bg-white shadow-xs">
            <div className="text-center mb-8">
              <h3 className="font-serif text-2xl font-bold text-primary-brand mb-2">Write directly to our kitchen</h3>
              <p className="text-xs text-gray-500 font-sans">Have general questions about allergens, dates slots, custom decorations?</p>
            </div>

            {contactSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 p-6 text-center text-emerald-800 text-xs lg:text-sm font-sans rounded font-semibold">
                ✓ Thank you! Your message has reached our kitchen. We will review your questions and respond shortly.
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 font-sans text-xs">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Your Name"
                      className="w-full border border-gray-300 bg-white p-2 text-xs rounded focus:border-secondary-brand focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full border border-gray-300 bg-white p-2 text-xs rounded focus:border-secondary-brand focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-600 mb-1">Your Message</label>
                  <textarea
                    rows={3}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Ask any questions..."
                    className="w-full border border-gray-300 bg-white p-2 text-xs rounded focus:border-secondary-brand focus:outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary-brand hover:bg-primary-brand/95 text-white px-6 py-2.5 text-xs font-semibold tracking-widest uppercase rounded shadow-xs cursor-pointer transition-all"
                >
                  Send message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
