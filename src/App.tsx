import React, { useState, useEffect, useRef } from "react";
import { 
  Instagram, 
  X
} from "lucide-react";
import { submitToGoogleSheets } from "./services/googleSheets";

// Components
import Home from "./components/Home";
import CakesPage from "./components/CakesPage";
import CateringContainer from "./components/catering/CateringContainer";
import KitchenKDS from "./components/catering/KitchenKDS";
import LiveCountersPage from "./components/LiveCountersPage";
import GiftingPage from "./components/GiftingPage";
import AboutPage from "./components/AboutPage";
import GalleryPage from "./components/GalleryPage";
import ReviewsPage from "./components/ReviewsPage";

// Modals (InquiryWizard retired)

const isKitchenPath = (path: string): boolean => {
  const clean = path.toLowerCase().replace(/\/+$/, "");
  return clean === "/catering/kitchen" || clean === "/kitchen";
};

export default function App() {
  const [isKitchenMode, setIsKitchenMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, "");
      if (path === "/kitchen") {
        window.history.replaceState(null, "", "/catering/kitchen");
        return true;
      }
      return isKitchenPath(path);
    }
    return false;
  });

  // Dynamically manage Web App Manifest so PWA install prompt ONLY appears for Kitchen KDS (/catering/kitchen)
  useEffect(() => {
    if (typeof document === "undefined") return;
    let manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');

    if (isKitchenMode) {
      if (!manifestLink) {
        manifestLink = document.createElement("link");
        manifestLink.rel = "manifest";
        manifestLink.href = "/manifest.json";
        document.head.appendChild(manifestLink);
      }
    } else {
      if (manifestLink) {
        manifestLink.remove();
      }
    }
  }, [isKitchenMode]);

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname.toLowerCase();
      if (path === "/catering/order") {
        window.history.replaceState(null, "", "/catering/food");
      }
      if (path.startsWith("/catering") || path.startsWith("/menu")) return "Catering";
      if (path.startsWith("/cakes")) return "Cakes";
      if (path.startsWith("/gallery")) return "Gallery";
      if (path.startsWith("/reviews")) return "Reviews";
      if (path.startsWith("/about")) return "About";
    }
    return "Home";
  });
  const navRef = useRef<HTMLElement>(null);
  
  // Interactive UI states
  const [showPriceList, setShowPriceList] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterAlert, setNewsletterAlert] = useState(false);

  // Dynamically measure navbar height and expose to CSS as --header-nav-bottom
  useEffect(() => {
    if (isKitchenMode) return;
    const updateNavHeight = () => {
      if (navRef.current) {
        const height = navRef.current.offsetHeight;
        document.documentElement.style.setProperty('--header-nav-bottom', `${height}px`);
      }
    };

    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && navRef.current) {
      observer = new ResizeObserver(() => {
        updateNavHeight();
      });
      observer.observe(navRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateNavHeight);
      if (observer) observer.disconnect();
    };
  }, [isKitchenMode, activeTab]);

  const handleOpenBaker = () => {
    window.location.href = "sms:+19455274566?body=Hi%20Baker!%20I'd%20like%20to%20discuss%20a%20custom%20order.";
  };

  const handleNavigateToCakeCatering = () => {
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/catering/cake");
    }
    setActiveTab("Catering");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      // Submit to Google Sheets
      await submitToGoogleSheets("Newsletter Signups", {
        Email: newsletterEmail.trim()
      });

      setNewsletterAlert(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterAlert(false), 4000);
    }
  };

  // Scroll to top and sync URL when active tab changes
  useEffect(() => {
    if (isKitchenMode) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname.toLowerCase();
      if (activeTab === "Catering" && !currentPath.startsWith("/catering")) {
        window.history.pushState(null, "", "/catering/food");
      } else if (activeTab === "Gallery" && !currentPath.startsWith("/gallery")) {
        window.history.pushState(null, "", "/gallery");
      } else if (activeTab === "Reviews" && !currentPath.startsWith("/reviews")) {
        window.history.pushState(null, "", "/reviews");
      } else if (activeTab === "Home" && currentPath !== "/" && currentPath !== "") {
        window.history.pushState(null, "", "/");
      }
    }
  }, [activeTab, isKitchenMode]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, "");
      if (isKitchenPath(path)) {
        setIsKitchenMode(true);
        return;
      }
      setIsKitchenMode(false);
      if (path.startsWith("/catering") || path.startsWith("/menu")) setActiveTab("Catering");
      else if (path.startsWith("/cakes")) setActiveTab("Cakes");
      else if (path.startsWith("/gallery")) setActiveTab("Gallery");
      else if (path.startsWith("/reviews")) setActiveTab("Reviews");
      else if (path.startsWith("/about")) setActiveTab("About");
      else setActiveTab("Home");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Direct standalone Kitchen Display System (for phone web apps, PWA & kitchen tablets)
  if (isKitchenMode) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] font-sans antialiased text-gray-900">
        <KitchenKDS
          onBackToOrder={() => {
            setIsKitchenMode(false);
            setActiveTab("Catering");
            window.history.pushState(null, "", "/catering/food");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>
    );
  }

  const navLinks = [
    { name: "Home", id: "Home" },
    { name: "Cakes", id: "Cakes" },
    { name: "Catering", id: "Catering" },
    { name: "Party Packages", id: "Live Counters" },
    { name: "Lux Gifting", id: "Gifting" },
    { name: "Gallery", id: "Gallery" },
    { name: "Reviews", id: "Reviews" },
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
      <nav ref={navRef} className="sticky top-0 z-45 bg-[#fbfbfa]/95 backdrop-blur-md border-b border-gray-150 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-4">
            
            {/* Logo Brand - Shrink 0 ensures it is never squished or overshadowed */}
            <div 
              onClick={() => setActiveTab("Home")} 
              className="shrink-0 flex items-center cursor-pointer group pr-2"
            >
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#00346f] tracking-tight transition-colors group-hover:text-[#775a19] whitespace-nowrap">
                Bluebonnet Whisk
              </span>
            </div>

            {/* Desktop Navigation Links (xl screens & up: 1280px+) */}
            <div className="hidden xl:flex items-center space-x-4 2xl:space-x-6">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`font-sans text-[11px] 2xl:text-xs uppercase tracking-wider font-semibold pb-1 transition-all border-b-2 hover:text-[#00346f] hover:border-[#00346f] cursor-pointer whitespace-nowrap ${
                    activeTab === link.id
                      ? "text-[#00346f] border-[#00346f] font-bold"
                      : "text-gray-500 border-transparent"
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </div>

            {/* Right Controls: Request Quote */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveTab("Catering")}
                className="bg-[#00346f] hover:bg-[#00224d] text-white min-h-[40px] px-4 sm:px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer font-sans inline-flex items-center justify-center transition-all shadow-xs whitespace-nowrap"
              >
                REQUEST QUOTE
              </button>
            </div>

          </div>
        </div>

        {/* Secondary Navigation Row for Tablets & Laptops (under 1280px) */}
        <div className="xl:hidden bg-[#fbfbfa] border-t border-gray-150 py-1.5 mt-1 overflow-x-auto scrollbar-none">
          <div className="flex px-4 space-x-4 whitespace-nowrap min-w-max">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`font-sans text-xs uppercase tracking-widest font-semibold min-h-[36px] px-2 py-1 flex items-center transition-all border-b-2 cursor-pointer ${
                  activeTab === link.id
                    ? "text-[#00346f] border-[#00346f] font-bold"
                    : "text-gray-500 border-transparent hover:text-gray-900"
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* RENDER ACTIVE TAB */}
      <main className="flex-1">
        {activeTab === "Home" && (
          <Home 
            onOpenBaker={handleOpenBaker}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === "Cakes" && (
          <CakesPage 
            onOpenBaker={handleOpenBaker}
            onOpenPriceList={() => setShowPriceList(true)}
            onCreateQuote={handleNavigateToCakeCatering}
          />
        )}
        {activeTab === "Catering" && (
          <CateringContainer />
        )}
        {activeTab === "Live Counters" && (
          <LiveCountersPage />
        )}
        {activeTab === "Gifting" && (
          <GiftingPage />
        )}
        {activeTab === "Gallery" && (
          <GalleryPage />
        )}
        {activeTab === "Reviews" && (
          <ReviewsPage />
        )}
        {activeTab === "About" && (
          <AboutPage />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-100 border-t border-gray-250 py-12 text-[#1a1c20] font-sans mt-auto">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Logo and brief summary */}
          <div className="space-y-4">
            <span className="font-serif text-lg font-bold text-[#00346f] tracking-tight">
              Bluebonnet Whisk
            </span>
            <p className="text-gray-500 text-xs leading-relaxed max-w-xs font-sans">
              Crafting modern heritage through the lens of luxury patisserie and Indian fusion artistry. Handcrafted daily with 100% natural, premium spices.
            </p>
            <div className="flex gap-4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary-brand transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://threads.net" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary-brand transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Threads">
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
                    className="hover:text-[#00346f] transition-colors block text-left w-full cursor-pointer py-1"
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
                <button onClick={() => setActiveTab("About")} className="hover:text-primary-brand transition-colors block text-left w-full cursor-pointer py-1">Contact Us</button>
              </li>
              <li>
                <span className="text-gray-400 block cursor-default py-1">Shipping Info (Local DFW only)</span>
              </li>
              <li>
                <span className="text-gray-400 block cursor-default py-1">Accessibility</span>
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
              <div className="bg-emerald-50 border border-emerald-100 p-2.5 text-emerald-800 text-xs font-semibold rounded-xl font-sans">
                ✓ Joined successfully! Watch out for seasonal catalogs.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 rounded">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Email Address"
                  className="flex-1 border border-gray-200 bg-white placeholder-gray-400 text-base sm:text-xs min-h-[44px] px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#00346f]"
                />
                <button
                  type="submit"
                  className="bg-[#00346f] hover:bg-[#00346f]/95 text-white min-h-[44px] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer shrink-0 inline-flex items-center justify-center"
                >
                  JOIN
                </button>
              </form>
            )}
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-6 lg:px-8 border-t border-gray-200/50 mt-10 pt-6 text-center text-[11px] text-gray-400 font-sans space-y-2">
          <p className="italic max-w-3xl mx-auto leading-relaxed">
            “Prepared in a home kitchen that is not inspected by the Texas Department of State Health Services or local health departments. This product is made in a cottage food operation that is not subject to Texas food establishment regulations.”
          </p>
          <p className="pt-2 border-t border-gray-200/30">
            © 2026 Bluebonnet Whisk. All rights reserved. Modern Heritage Patisserie.
          </p>
        </div>
      </footer>

      {/* ── MODALS & OVERLAYS ── */}

      {/* Price list guidelines modal */}
      {showPriceList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-5 sm:p-6 lg:p-8 text-gray-900 shadow-2xl border border-gray-150">
            
            <button 
              onClick={() => setShowPriceList(false)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-900 font-bold min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6 pt-2">
              <span className="font-serif text-lg font-bold tracking-widest text-[#00346f] block uppercase">Bluebonnet Whisk</span>
              <span className="text-xs text-gray-500 uppercase tracking-widest block mt-0.5 font-sans font-bold">Standard Price Guidelines</span>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <p className="text-gray-600 leading-normal text-center mb-4">
                Our base pricing is determined by portions, tier designs, and flavor layers. Real-time customized proposal quotations are processed in the enquiry tab.
              </p>

              <div className="border border-gray-200/50 rounded-xl overflow-hidden divide-y divide-gray-100 font-sans bg-white shadow-2xs">
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

              <div className="border border-gray-150 rounded-xl bg-amber-50/40 p-3.5 text-[11px] leading-relaxed text-[#775a19] font-medium">
                <strong>Surcharges:</strong>
                <ul className="mt-1 space-y-0.5 list-disc pl-3">
                  <li>Indian Fusion Flavors: +$15.00</li>
                  <li>Specialist dietary changes (Gluten-Free/Vegan): +$10.00</li>
                  <li>Eggless selection: +$5.00</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-1.5 border border-[#00346f] min-h-[44px] px-4 py-2 text-xs font-semibold tracking-wider text-[#00346f] uppercase rounded-xl hover:bg-[#00346f]/5 transition-all cursor-pointer"
              >
                Print pricing
              </button>
              <button
                onClick={() => setShowPriceList(false)}
                className="bg-[#00346f] hover:bg-[#00346f]/95 text-white min-h-[44px] px-5 py-2 text-xs font-semibold tracking-wider uppercase rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center justify-center"
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
