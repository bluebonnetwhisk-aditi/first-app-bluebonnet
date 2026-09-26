import { useState, useEffect, useRef } from 'react';
import { MapPin, CheckCircle2, AlertCircle, Sparkles, Building, Navigation, Search, Loader2, X } from 'lucide-react';

interface AddressValidationInputProps {
  street: string;
  setStreet: (v: string) => void;
  apt: string;
  setApt: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  zip: string;
  setZip: (v: string) => void;
  onAddressValidated?: (isValid: boolean, fullStandardizedAddress: string) => void;
}

// USPS Standard Suffix Abbreviations (USPS Pub 28)
const USPS_SUFFIX_MAP: Record<string, string> = {
  STREET: 'ST',
  DRIVE: 'DR',
  AVENUE: 'AVE',
  ROAD: 'RD',
  BOULEVARD: 'BLVD',
  LANE: 'LN',
  COURT: 'CT',
  CIRCLE: 'CIR',
  WAY: 'WAY',
  PARKWAY: 'PKWY',
  TRAIL: 'TRL',
  PLACE: 'PL',
  HIGHWAY: 'HWY',
  EXPRESSWAY: 'EXPY'
};

const USPS_UNIT_MAP: Record<string, string> = {
  APARTMENT: 'APT',
  SUITE: 'STE',
  UNIT: 'UNIT',
  BUILDING: 'BLDG',
  FLOOR: 'FL'
};

// DFW Primary Delivery Service Cities
const DFW_PRIMARY_CITIES = [
  'Frisco', 'Plano', 'McKinney', 'Allen', 'Prosper', 
  'Little Elm', 'The Colony', 'Carrollton', 'Richardson', 
  'Lewisville', 'Dallas', 'Addison', 'Coppell'
];

interface AddressSuggestion {
  displayName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

export default function AddressValidationInput({
  street,
  setStreet,
  apt,
  setApt,
  city,
  setCity,
  zip,
  setZip,
  onAddressValidated
}: AddressValidationInputProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const aptInputRef = useRef<HTMLInputElement>(null);

  const [isValidating, setIsValidating] = useState(false);
  const [uspsVerified, setUspsVerified] = useState(false);
  const [standardizedSuggestion, setStandardizedSuggestion] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch interactive address suggestions via OpenStreetMap Nominatim with DFW boundary focus
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const queryWithState = `${trimmed}, Texas, United States`;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=us&limit=5&q=${encodeURIComponent(queryWithState)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const parsed: AddressSuggestion[] = data.map((item: any) => {
              const addr = item.address || {};
              const houseNumber = addr.house_number || '';
              const road = addr.road || addr.pedestrian || addr.cycleway || '';
              const streetStr = houseNumber ? `${houseNumber} ${road}` : road || item.display_name.split(',')[0];
              const cityStr = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || 'Frisco';
              const zipStr = addr.postcode || '';

              return {
                displayName: item.display_name,
                street: streetStr,
                city: cityStr,
                state: 'TX',
                zip: zipStr
              };
            }).filter(s => s.street.length > 0);

            setSuggestions(parsed);
            setShowDropdown(parsed.length > 0);
          }
        }
      } catch (err) {
        console.warn('Address suggestion lookup failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle selecting an interactive address suggestion
  const handleSelectSuggestion = (sug: AddressSuggestion) => {
    setStreet(sug.street);
    setCity(sug.city);
    if (sug.zip) setZip(sug.zip);
    setSearchQuery(sug.street);
    setShowDropdown(false);
    setSuggestions([]);

    // Focus Apt input if customer needs to specify unit
    setTimeout(() => {
      aptInputRef.current?.focus();
    }, 100);
  };

  // Real-time USPS Address validation and standardization logic
  useEffect(() => {
    const trimmedStreet = street.trim();
    const trimmedCity = city.trim();
    const trimmedZip = zip.trim();

    if (!trimmedStreet && !trimmedZip) {
      setUspsVerified(false);
      setStandardizedSuggestion(null);
      setValidationErrors([]);
      onAddressValidated?.(false, '');
      return;
    }

    setIsValidating(true);
    const timer = setTimeout(() => {
      const errors: string[] = [];

      // 1. Street format validation
      const hasHouseNumber = /^\d+/.test(trimmedStreet);
      if (!hasHouseNumber) {
        errors.push('Street address should begin with a house or building number');
      }

      // 2. ZIP code validation (5-digit US ZIP)
      const validZip = /^\d{5}$/.test(trimmedZip);
      if (!validZip) {
        errors.push('Valid 5-digit US ZIP code is required');
      }

      // 3. City validation
      if (!trimmedCity) {
        errors.push('City name is required');
      }

      if (errors.length === 0) {
        // Standardize street using USPS abbreviations
        let words = trimmedStreet.toUpperCase().split(/\s+/);
        words = words.map(w => USPS_SUFFIX_MAP[w] || w);
        const stdStreet = words.join(' ');

        let stdApt = '';
        if (apt.trim()) {
          let aptWords = apt.trim().toUpperCase().split(/\s+/);
          aptWords = aptWords.map(w => USPS_UNIT_MAP[w] || w);
          stdApt = `, ${aptWords.join(' ')}`;
        }

        const stdCity = trimmedCity.toUpperCase();
        const stdZip = trimmedZip;
        const fullStd = `${stdStreet}${stdApt}, ${stdCity}, TX ${stdZip}`;

        setUspsVerified(true);
        setValidationErrors([]);

        // Show suggestion if different from raw input
        const rawFull = `${trimmedStreet}${apt.trim() ? `, ${apt.trim()}` : ''}, ${trimmedCity}, TX ${trimmedZip}`;
        if (fullStd !== rawFull) {
          setStandardizedSuggestion(fullStd);
        } else {
          setStandardizedSuggestion(null);
        }

        onAddressValidated?.(true, fullStd);
      } else {
        setUspsVerified(false);
        setStandardizedSuggestion(null);
        setValidationErrors(errors);
        onAddressValidated?.(false, '');
      }
      setIsValidating(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [street, apt, city, zip]);

  const handleApplyStandardized = () => {
    if (!standardizedSuggestion) return;
    const parts = standardizedSuggestion.split(', ');
    if (parts.length >= 3) {
      setStreet(parts[0]);
      if (parts.length === 4) {
        setApt(parts[1]);
        setCity(parts[2]);
        const zipPart = parts[3].replace('TX ', '');
        setZip(zipPart);
      } else {
        setCity(parts[1]);
        const zipPart = parts[2].replace('TX ', '');
        setZip(zipPart);
      }
    }
  };

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-gray-800 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-[#00346f]" />
          <span>Interactive Delivery Address Search</span>
        </label>
        
        {isValidating ? (
          <span className="text-[10px] text-gray-400 animate-pulse font-medium">
            Validating address...
          </span>
        ) : uspsVerified ? (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>USPS Format Verified</span>
          </span>
        ) : validationErrors.length > 0 && street.trim() ? (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            <span>Incomplete Address</span>
          </span>
        ) : null}
      </div>

      {/* ── Interactive Suggestion Search Box ── */}
      <div ref={dropdownRef} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#00346f]" />
            ) : (
              <Search className="w-4 h-4 text-[#00346f]" />
            )}
          </div>
          
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              // Also sync with street if typing directly
              if (!street || searchQuery === street) {
                setStreet(e.target.value);
              }
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            placeholder="Search address (e.g. 4821 Legacy Dr, Frisco)..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white placeholder-gray-400 focus:border-[#00346f] focus:ring-2 focus:ring-[#00346f]/15 shadow-2xs"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSuggestions([]);
                setShowDropdown(false);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Suggestion Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-gray-100 max-h-56 overflow-y-auto">
            <div className="px-3 py-1.5 bg-gray-50 text-[10px] uppercase font-bold tracking-wider text-gray-500">
              Matching Delivery Addresses (Click to Select)
            </div>
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(sug)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50 transition-colors flex items-start gap-2.5 cursor-pointer group"
              >
                <MapPin className="w-4 h-4 text-gray-400 group-hover:text-[#00346f] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-gray-900 group-hover:text-[#00346f]">
                    {sug.street}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">
                    {sug.city}, TX {sug.zip}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Granular Verified Address Fields ── */}
      <div className="pt-1 space-y-2">
        <div className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
          Delivery Address Breakdown
        </div>

        {/* Street Address Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <MapPin className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={street}
            onChange={e => {
              setStreet(e.target.value);
              setSearchQuery(e.target.value);
            }}
            placeholder="Street Address (e.g., 4821 Legacy Dr)"
            className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs text-gray-900 bg-white placeholder-gray-400 transition-colors ${
              uspsVerified 
                ? 'border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200' 
                : 'border-gray-300 focus:border-[#00346f] focus:ring-1 focus:ring-[#00346f]/20'
            }`}
          />
        </div>

        {/* Apt / Unit & City & Zip */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          
          {/* Apt / Suite */}
          <div className="sm:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
              <Building className="w-3.5 h-3.5" />
            </div>
            <input
              ref={aptInputRef}
              type="text"
              value={apt}
              onChange={e => setApt(e.target.value)}
              placeholder="Apt / Ste / Unit (opt)"
              className="w-full pl-8 pr-2.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white placeholder-gray-400 focus:border-[#00346f]"
            />
          </div>

          {/* City with DFW quick selector */}
          <div className="sm:col-span-4">
            <input
              type="text"
              list="dfw-cities-list"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="City (e.g., Frisco)"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white placeholder-gray-400 focus:border-[#00346f]"
            />
            <datalist id="dfw-cities-list">
              {DFW_PRIMARY_CITIES.map(c => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {/* State (Fixed TX) */}
          <div className="sm:col-span-1">
            <div className="w-full py-2 rounded-xl border border-gray-200 bg-gray-100 text-xs font-bold text-gray-600 text-center select-none">
              TX
            </div>
          </div>

          {/* ZIP Code */}
          <div className="sm:col-span-3">
            <input
              type="text"
              maxLength={5}
              value={zip}
              onChange={e => setZip(e.target.value.replace(/\D/g, ''))}
              placeholder="ZIP (75034)"
              className={`w-full px-3 py-2 rounded-xl border text-xs text-gray-900 bg-white placeholder-gray-400 ${
                /^\d{5}$/.test(zip.trim()) ? 'border-emerald-300' : 'border-gray-300 focus:border-[#00346f]'
              }`}
            />
          </div>

        </div>
      </div>

      {/* USPS Standardized Suggestion Banner */}
      {standardizedSuggestion && uspsVerified && (
        <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-emerald-900">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-[11px]">
              USPS Standardized: <strong>{standardizedSuggestion}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleApplyStandardized}
            className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded-md transition-colors cursor-pointer shrink-0"
          >
            Apply Standard
          </button>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && street.trim() && (
        <div className="text-[11px] text-amber-700 space-y-0.5 pl-1">
          {validationErrors.map((err, i) => (
            <div key={i} className="flex items-center gap-1">
              <span>• {err}</span>
            </div>
          ))}
        </div>
      )}

      {/* Local DFW Service Notice */}
      <div className="text-[10px] text-gray-400 pl-1">
        📍 Bluebonnet Whisk delivers across Frisco, Plano, McKinney, Allen, Prosper, Little Elm, Dallas, and surrounding DFW areas ($50 flat delivery).
      </div>
    </div>
  );
}
