import { useState } from "react";

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

  return (
    <div className="bg-brand-cream-light min-h-screen animate-fade-in font-sans">
      
      {/* Our Story Header Section */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Story text */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-serif text-3xl lg:text-5xl font-bold text-primary-brand tracking-tight">Our Story</h2>
            <div className="h-0.5 w-12 bg-secondary-brand mt-2" />
            
            <p className="text-gray-600 text-xs lg:text-sm leading-relaxed">
              Bluebonnet Whisk began with a simple vision to create delicious, high quality food we would proudly serve our own families. As two moms passionate about authentic homemade flavors, we bring together cakes, desserts, and catering made with care, trusted ingredients, and a lot of love. Every order is crafted to bring people together and create sweet memories worth sharing.
            </p>

            <blockquote className="border-l-4 border-secondary-brand pl-4 py-1 italic font-serif text-lg text-primary-brand font-medium">
              &quot;Bringing People Together, One Bite at a Time&quot;
            </blockquote>

            {/* Our focus card */}
            <div className="border border-gray-150 rounded bg-[#fcfbf9] p-5 shadow-xs max-w-md">
              <span className="text-[9px] font-bold text-secondary-brand tracking-widest uppercase block mb-1">OUR FOCUS</span>
              <p className="text-[#00346f] text-xs lg:text-sm font-semibold">
                Blending Tradition, Flavor, and Craftsmanship
              </p>
            </div>
          </div>

          {/* Watercolor Moms Illustration on the right */}
          <div className="lg:col-span-5 h-[300px] lg:h-[450px] rounded-lg overflow-hidden shadow-md">
            <img 
              src="src/assets/images/Gemini_Generated_Image_y8j5kpy8j5kpy8j5.png" 
              alt="Moms cooking sketch illustration" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

        </div>
      </section>

      {/* The Bluebonnet Promise Section */}
      <section className="bg-white border-t border-b border-gray-150 py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-primary-brand">The Bluebonnet Promise</h2>
            <p className="text-gray-600 text-xs lg:text-sm font-sans max-w-xl mx-auto mt-2">
              Whether it&apos;s a custom cake or full-service catering, we promise fresh flavors, thoughtful details, and a celebration worth remembering.
            </p>
            <div className="h-0.5 w-16 bg-secondary-brand mt-4 mx-auto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
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
              <div>
                <h3 className="font-serif text-lg font-bold text-primary-brand mb-1">Home-style Warmth</h3>
                <p className="text-gray-600 text-xs font-sans leading-relaxed">
                  Made with love for family. We preserve the soul of traditional recipes, making every bite feel like a warm embrace from a cherished family kitchen.
                </p>
              </div>
            </div>

            {/* Promise 2: Quality Ingredients */}
            <div className="border border-gray-150 rounded-lg p-6 bg-[#fcfbf9] shadow-xs">
              <h3 className="font-serif text-lg font-bold text-primary-brand mb-1">Quality Ingredients</h3>
              <p className="text-gray-600 text-xs font-sans leading-relaxed mb-4">
                Good quality, raw materials. As moms, we care what goes inside the food - sourcing only the finest ingredients for family you can trust.
              </p>
              <div className="flex gap-2">
                <span className="text-[9px] font-bold tracking-wider uppercase bg-brand-rose text-brand-rose-dark px-2 py-0.5 rounded-sm">NON-GMO</span>
                <span className="text-[9px] font-bold tracking-wider uppercase bg-brand-pistachio text-brand-pistachio-dark px-2 py-0.5 rounded-sm">ORGANIC</span>
              </div>
            </div>

            {/* Promise 3: Live Counters */}
            <div className="border border-gray-150 rounded-lg p-6 bg-primary-brand text-white shadow-xs">
              <h3 className="font-serif text-lg font-bold text-brand-cream mb-1">Live Counters</h3>
              <p className="text-gray-200 text-xs font-sans leading-relaxed">
                Made for you as per your event need. Leave the food prep to our team as you relax, enjoy the party, and attend to your guests.
              </p>
            </div>

            {/* Promise 4: Uncompromising Hygiene */}
            <div className="border border-gray-150 rounded-lg p-6 flex flex-col lg:flex-row gap-4 items-center bg-[#fcfbf9] shadow-xs">
              <div>
                <h3 className="font-serif text-lg font-bold text-primary-brand mb-1">Uncompromising Hygiene</h3>
                <p className="text-gray-600 text-xs font-sans leading-relaxed">
                  Hygiene is our topmost priority. We maintain strict food-safety protocols with clean preparation environments and absolute transparency.
                </p>
              </div>
              <div className="w-full lg:w-1/3 h-28 rounded overflow-hidden shrink-0">
                <img 
                  src="src/assets/images/BlueBonnet Catering.jpeg" 
                  alt="Hygienic kitchen workspace" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* The Bluebonnet Experience Section */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Picture on the left */}
          <div className="lg:col-span-6 h-[250px] lg:h-[400px] rounded-lg overflow-hidden shadow-sm">
            <img 
              src="src/assets/images/custom_celebration_cakes_1781194977914.jpg" 
              alt="Custom cakes display setup" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Details on the right */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-serif text-3xl font-bold text-primary-brand">The Bluebonnet Experience</h2>
            <p className="text-gray-600 text-xs lg:text-sm font-sans leading-relaxed">
              At Bluebonnet Whisk, we don&apos;t just believe in bringing families together over food; we make it a full sensory experience. From the first design sketch of a celebration cake to the live execution of chaat, we focus on every detail.
            </p>

            <ul className="space-y-2 text-xs text-gray-700 pl-4 list-disc font-sans font-medium">
              <li>BESPOKE CAKE DESIGN</li>
              <li>CORPORATE GIFTING SUITES</li>
              <li>LIVE DESSERT BANQUETS</li>
            </ul>

            <div className="pt-4">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="border border-[#775a19] hover:bg-[#775a19]/5 px-8 py-3 text-[11px] font-bold tracking-widest text-[#775a19] uppercase rounded-sm transition-all cursor-pointer"
              >
                EXPLORE CATERING
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Contact Form direct to Kitchen */}
      <section className="bg-gray-50 border-t border-gray-150 py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="border border-gray-200 rounded-lg p-6 lg:p-8 bg-white shadow-xs">
            <div className="text-center mb-8">
              <h3 className="font-serif text-2xl font-bold text-primary-brand mb-2">Write directly to our kitchen</h3>
              <p className="text-xs text-gray-500 font-sans">Have general questions about allergens, dates slots, custom decorations?</p>
            </div>

            {contactSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 p-6 text-center text-emerald-800 text-xs lg:text-sm font-sans rounded">
                ✓ Thank you! Your message has reached our kitchen. We will review your questions and respond shortly.
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-600 mb-1 font-sans">Full Name</label>
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
                    <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-600 mb-1 font-sans">Email Address</label>
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
                  <label className="block text-[10px] font-bold tracking-wider uppercase text-gray-600 mb-1 font-sans">Your Message</label>
                  <textarea
                    rows={3}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Ask any questions..."
                    className="w-full border border-gray-300 bg-white p-2 text-xs rounded focus:border-secondary-brand focus:outline-none"
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
