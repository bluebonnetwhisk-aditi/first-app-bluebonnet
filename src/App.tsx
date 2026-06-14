import React, { useState, useEffect } from "react";
import { 
  Instagram, 
  MessageSquare,
  X
} from "lucide-react";

// Components
import Home from "./components/Home";
import CakesPage from "./components/CakesPage";
import CateringPage from "./components/CateringPage";
import LiveCountersPage from "./components/LiveCountersPage";
import MenuPage from "./components/MenuPage";
import AboutPage from "./components/AboutPage";

// Modals
import InquiryWizard from "./components/InquiryWizard";
import BakerModal from "./components/BakerModal";

export default function App() {
  const [activeTab, setActiveTab] = useState("Home");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isBakerOpen, setIsBakerOpen] = useState(false);
  
  // Custom wizard preselects
  const [wizardFlavor, setWizardFlavor] = useState("");
  const [wizardCategory, setWizardCategory] = useState("");
  
  // Interactive UI states
  const [showPriceList, setShowPriceList] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterAlert, setNewsletterAlert] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOpenWizard = (flavor = "", category = "") => {
    setWizardFlavor(flavor);
    setWizardCategory(category);
    setIsWizardOpen(true);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterAlert(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterAlert(false), 4000);
    }
  };

  // Scroll to top when active tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  const navLinks = [
    { name: "Home", id: "Home" },
    { name: "Cakes", id: "Cakes" },
    { name: "Catering", id: "Catering" },
    { name: "Live Counters", id: "Live Counters" },
    { name: "Price Guide", id: "Menu" },
    { name: "About Us", id: "About" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa]">
      
      {/* Promotion Bar */}
      <div className="bg-[#00346f] text-white text-center py-2.5 text-[11px] font-sans tracking-widest uppercase font-semibold border-b border-[#775a19]/25 z-40 relative">
        ✨ Free consult & custom flavor matching in our physical workshop • 
        <span className="text-[#ffdea5] font-bold"> Eggless options standard</span>
      </div>

      {/* Header / Navbar */}
      <nav className="sticky top-0 z-45 bg-[#fbfbfa]/95 backdrop-blur-md border-b border-gray-150 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            
            {/* Logo Brand */}
            <div 
              onClick={() => setActiveTab("Home")} 
              className="flex-shrink-0 flex items-center cursor-pointer group"
            >
              <span className="font-serif text-xl md:text-2xl font-bold text-[#00346f] tracking-tight transition-colors group-hover:text-[#775a19]">
                Bluebonnet Whisk
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex space-x-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`font-sans text-xs uppercase tracking-widest font-semibold pb-1.5 transition-all border-b-2 hover:text-[#00346f] hover:border-[#00346f] cursor-pointer ${
                    activeTab === link.id
                      ? "text-[#00346f] border-[#00346f] font-bold"
                      : "text-gray-500 border-transparent"
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </div>

            {/* Right Controls */}
            <div className="hidden lg:flex items-center space-x-6">
              <button 
                onClick={() => alert("Our client portal is under construction! Please submit inquiries directly through our public quoting tools.")}
                className="font-sans text-xs uppercase tracking-widest font-semibold text-gray-700 hover:text-[#00346f] transition-all cursor-pointer"
              >
                LOGIN
              </button>
              <button
                onClick={() => handleOpenWizard()}
                className="bg-[#00346f] hover:bg-[#00346f]/95 text-white px-5 py-2.5 rounded text-xs uppercase tracking-widest font-semibold transition-all duration-200 shadow-sm cursor-pointer"
              >
                ORDER NOW
              </button>
            </div>

            {/* Mobile hamburger button */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => handleOpenWizard()}
                className="bg-[#00346f] hover:bg-[#00346f]/95 text-white p-2 rounded text-xs font-semibold uppercase aspect-square cursor-pointer"
                title="Order Now"
              >
                📥
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded text-gray-500 hover:text-gray-900 focus:outline-none cursor-pointer"
                aria-expanded="false"
              >
                {mobileMenuOpen ? "✕" : "☰"}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#fbfbfa] border-b border-gray-200 transition-all">
            <div className="px-2 pt-2 pb-4 space-y-1.5 sm:px-3">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2.5 text-sm uppercase tracking-widest font-semibold font-sans rounded-xs cursor-pointer ${
                    activeTab === link.id
                      ? "bg-[#00346f]/5 text-[#00346f] border-l-4 border-[#00346f]"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {link.name}
                </button>
              ))}
              <div className="pt-4 pb-2 border-t border-gray-150 flex flex-col gap-2 px-3">
                <button
                  onClick={() => {
                    alert("Our client portal is under construction!");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 text-xs font-semibold tracking-widest uppercase text-gray-500 border border-gray-200 rounded hover:bg-gray-50 font-sans cursor-pointer"
                >
                  LOGIN
                </button>
                <button
                  onClick={() => {
                    handleOpenWizard();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 text-xs font-semibold tracking-widest uppercase bg-[#00346f] text-white rounded hover:bg-[#00346f]/95 font-sans cursor-pointer"
                >
                  ORDER NOW
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* RENDER ACTIVE TAB */}
      <main className="flex-1">
        {activeTab === "Home" && (
          <Home 
            onOpenWizard={handleOpenWizard} 
            onOpenBaker={() => setIsBakerOpen(true)}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === "Cakes" && (
          <CakesPage 
            onOpenWizard={handleOpenWizard} 
            onOpenBaker={() => setIsBakerOpen(true)}
            onOpenPriceList={() => setShowPriceList(true)}
          />
        )}
        {activeTab === "Catering" && (
          <CateringPage onOpenWizard={handleOpenWizard} />
        )}
        {activeTab === "Live Counters" && (
          <LiveCountersPage onOpenWizard={handleOpenWizard} />
        )}
        {activeTab === "Menu" && (
          <MenuPage />
        )}
        {activeTab === "About" && (
          <AboutPage />
        )}
      </main>

      {/* Floating consult CTA button representing luxury interaction */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsBakerOpen(true)}
          className="bg-[#775a19] hover:bg-[#5d4201] text-white p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center gap-2 group hover:scale-105 select-none cursor-pointer"
          title="Talk with Baker"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="font-sans text-xs font-bold tracking-widest uppercase max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-500 whitespace-nowrap">
            Ask Baker AI
          </span>
        </button>
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-100 border-t border-gray-250 py-12 text-[#1a1c20] font-sans mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo and brief summary */}
          <div className="space-y-4">
            <span className="font-serif text-lg font-bold text-[#00346f] tracking-tight">
              Bluebonnet Whisk
            </span>
            <p className="text-gray-500 text-xs leading-relaxed max-w-xs font-sans">
              Crafting modern heritage through the lens of luxury patisserie and Indian fusion artistry. Handcrafted daily with 100% natural, premium spices.
            </p>
            <div className="flex gap-4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary-brand transition-colors p-1" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://threads.net" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary-brand transition-colors p-1" aria-label="Threads">
                <span className="font-bold font-serif text-lg leading-none">@</span>
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4 font-sans">QUICK LINKS</h4>
            <ul className="space-y-2.5 text-xs text-gray-600 font-sans">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <button 
                    onClick={() => setActiveTab(link.id)}
                    className="hover:text-[#00346f] transition-colors block text-left w-full cursor-pointer"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4 font-sans font-semibold">SUPPORT</h4>
            <ul className="space-y-2.5 text-xs text-gray-600 font-sans font-medium">
              <li>
                <button onClick={() => setActiveTab("About")} className="hover:text-primary-brand transition-colors block text-left w-full cursor-pointer">Contact Us</button>
              </li>
              <li>
                <span className="text-gray-400 block cursor-default">Shipping Info (Local DFW only)</span>
              </li>
              <li>
                <span className="text-gray-400 block cursor-default">Accessibility</span>
              </li>
            </ul>
          </div>

          {/* Newsletter signup */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4 font-sans">NEWSLETTER</h4>
            <p className="text-[#1a1c20] text-xs font-sans leading-normal">
              Join our list for seasonal collections, festival box releases, and custom sweet updates.
            </p>
            
            {newsletterAlert ? (
              <div className="bg-emerald-50 border border-emerald-100 p-2.5 text-emerald-800 text-xs font-semibold rounded font-sans">
                ✓ Joined successfully! Watch out for seasonal catalogs.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-1.5 rounded">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Email Address"
                  className="flex-1 border border-gray-200 bg-white placeholder-gray-400 text-xs p-2.5 rounded focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#00346f] hover:bg-[#00346f]/95 text-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded transition-all cursor-pointer"
                >
                  JOIN
                </button>
              </form>
            )}
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-200/50 mt-10 pt-6 text-center text-[11px] text-gray-400 font-sans">
          © 2026 Bluebonnet Whisk. All rights reserved. Modern Heritage Patisserie.
        </div>
      </footer>

      {/* ── MODALS & OVERLAYS ── */}

      {/* Complete Inquiry wizard modal */}
      <InquiryWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        preselectedFlavor={wizardFlavor} 
        preselectedCategory={wizardCategory} 
      />

      {/* Head Baker consult modal */}
      <BakerModal 
        isOpen={isBakerOpen} 
        onClose={() => setIsBakerOpen(false)} 
      />

      {/* Price list guidelines modal */}
      {showPriceList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-lg bg-white p-6 md:p-8 text-gray-900 shadow-2xl border border-gray-150">
            
            <button 
              onClick={() => setShowPriceList(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-900 font-bold p-1 rounded hover:bg-gray-50"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              <span className="font-serif text-lg font-bold tracking-widest text-[#00346f] block uppercase">Bluebonnet Whisk</span>
              <span className="text-xs text-gray-500 uppercase tracking-widest block mt-0.5 font-sans font-bold">Standard Price Guidelines</span>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <p className="text-gray-600 leading-normal text-center mb-4">
                Our base pricing is determined by portions, tier designs, and flavor layers. Real-time customized proposal quotations are processed in the enquiry tab.
              </p>

              <div className="border border-gray-200/50 rounded divide-y divide-gray-100 font-sans bg-white shadow-2xs">
                <div className="p-2.5 flex justify-between bg-gray-50 font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                  <span>Sizing Tier</span>
                  <span>Regular base rate</span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span>Standard 6&quot; (10-15 Guests)</span>
                  <span className="font-semibold text-[#00346f]">$60.00</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span>Signature 8&quot; (15-25 Guests)</span>
                  <span className="font-semibold text-[#00346f]">$84.00</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span>Grand 10&quot; (25-50 guests)</span>
                  <span className="font-semibold text-[#00346f]">$132.00</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span>Double Tier (50-100 guests)</span>
                  <span className="font-semibold text-[#00346f]">$240.00</span>
                </div>
              </div>

              <div className="border border-gray-150 rounded bg-amber-50/20 p-3 text-[11px] leading-relaxed text-[#775a19] font-medium">
                <strong>Surcharges:</strong>
                <ul className="mt-1 space-y-0.5 list-disc pl-3">
                  <li>Indian Fusion Flavors: +$15.00</li>
                  <li>Specialist dietary changes (Gluten-Free/Vegan): +$10.00</li>
                  <li>Eggless selection: +$5.00</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 border border-[#00346f] px-4 py-2 text-xs font-semibold tracking-wider text-[#00346f] uppercase rounded hover:bg-[#00346f]/5 transition-all cursor-pointer"
              >
                Print pricing
              </button>
              <button
                onClick={() => setShowPriceList(false)}
                className="bg-[#00346f] hover:bg-[#00346f]/95 text-white px-5 py-2 text-xs font-semibold tracking-wider uppercase rounded transition-all shadow-md cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
