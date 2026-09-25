import { useState, useEffect } from 'react';
import { MapPin, CheckCircle2, AlertCircle, Sparkles, Building, Navigation } from 'lucide-react';

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
  const [isValidating, setIsValidating] = useState(false);
  const [uspsVerified, setUspsVerified] = useState(false);
  const [standardizedSuggestion, setStandardizedSuggestion] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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
        errors.push('Street address must begin with a house or building number');
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
          <span>Interactive Delivery Address &amp; USPS Validation</span>
        </label>
        
        {isValidating ? (
          <span className="text-[10px] text-gray-400 animate-pulse font-medium">
            Validating with USPS standards...
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

      {/* Street Address */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <MapPin className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={street}
          onChange={e => setStreet(e.target.value)}
          placeholder="Street address (e.g., 4821 Legacy Dr)"
          className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs text-gray-900 bg-white placeholder-gray-400 transition-colors ${
            uspsVerified 
              ? 'border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200' 
              : 'border-gray-300 focus:border-[#00346f] focus:ring-1 focus:ring-[#00346f]/20'
          }`}
        />
      </div>

      {/* Apt / Unit & City & Zip */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        
        {/* Apt / Suite */}
        <div className="sm:col-span-3 relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
            <Building className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={apt}
            onChange={e => setApt(e.target.value)}
            placeholder="Apt / Ste (opt)"
            className="w-full pl-8 pr-2.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white placeholder-gray-400 focus:border-[#00346f]"
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
            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white placeholder-gray-400 focus:border-[#00346f]"
          />
          <datalist id="dfw-cities-list">
            {DFW_PRIMARY_CITIES.map(c => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        {/* State (Fixed TX) */}
        <div className="sm:col-span-2">
          <div className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-xs font-bold text-gray-600 text-center select-none">
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
            className={`w-full px-3 py-2.5 rounded-xl border text-xs text-gray-900 bg-white placeholder-gray-400 ${
              /^\d{5}$/.test(zip.trim()) ? 'border-emerald-300' : 'border-gray-300 focus:border-[#00346f]'
            }`}
          />
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
        📍 Bluebonnet Whisk delivers across Frisco, Plano, McKinney, Allen, Prosper, Dallas, and surrounding DFW Metroplex areas ($50 flat delivery).
      </div>
    </div>
  );
}
