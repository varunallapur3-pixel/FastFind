import React, { useState } from 'react';
import { Locate, ShieldCheck, Navigation, ArrowRight } from 'lucide-react';
import { CITY_COORDS } from '../utils/geo';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onGrantGPS: () => Promise<void>;
  onSelectCity: (cityKey: string) => void;
  currentLocationLabel: string;
  isLocating: boolean;
  errorMsg?: string | null;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onGrantGPS,
  onSelectCity,
  currentLocationLabel,
  isLocating,
  errorMsg,
}) => {
  const [selectedCityKey, setSelectedCityKey] = useState<string>('vijayapura');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-fadeIn">
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#131313] border-2 border-[#00dbe9] rounded-2xl p-6 sm:p-8 shadow-[0_0_80px_rgba(0,219,233,0.4)] text-[#e5e2e1] overflow-hidden">
        {/* Scanline Effect */}
        <div className="scanline" />

        {/* Header Icon */}
        <div className="flex justify-between items-start mb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#00dbe9]/10 border border-[#00dbe9]/50 flex items-center justify-center shadow-[0_0_25px_rgba(0,219,233,0.4)]">
            <Locate className="w-8 h-8 text-[#00dbe9] animate-pulse" />
          </div>
          <span className="px-3 py-1 rounded-full bg-[#a9f900]/10 text-[#a9f900] border border-[#a9f900]/30 font-mono text-[10px] font-bold uppercase tracking-widest">
            STEP 1: LOCATION ACCESS
          </span>
        </div>

        {/* Title & Description */}
        <h2 className="font-headline font-bold text-2xl sm:text-3xl text-white mb-2">
          Enable Live Location
        </h2>
        <p className="text-xs font-mono text-[#b9cacb] leading-relaxed mb-6">
          To find the highest-rated places within strictly <span className="text-[#00dbe9] font-bold">4000 meters (4 km)</span> of where you are standing, please grant location access.
        </p>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 font-mono text-xs text-red-300">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Primary Action Button: Request Hardware GPS */}
        <button
          onClick={onGrantGPS}
          disabled={isLocating}
          className="w-full py-4 rounded-xl bg-[#a9f900] hover:bg-white text-[#223600] font-headline font-bold text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(169,249,0,0.5)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 mb-6"
        >
          <Navigation className="w-5 h-5 fill-current" />
          <span>{isLocating ? 'ACCESSING DEVICE GPS...' : 'GRANT LIVE GPS LOCATION ACCESS'}</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>

        {/* Divider */}
        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-white/10" />
          <span className="flex-shrink mx-4 text-[10px] font-mono text-[#849495] uppercase">
            OR SELECT YOUR CITY MANUALLY
          </span>
          <div className="flex-grow border-t border-white/10" />
        </div>

        {/* Manual City Selector */}
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#1c1b1b] border border-white/10 font-mono text-xs">
          <label className="text-[#849495] uppercase text-[10px]">CHOOSE FROM KNOWN CITIES:</label>
          <div className="flex gap-2">
            <select
              value={selectedCityKey}
              onChange={(e) => setSelectedCityKey(e.target.value)}
              className="flex-1 bg-[#131313] border border-white/20 text-[#a9f900] rounded-lg px-3 py-2 text-xs outline-none cursor-pointer font-bold"
            >
              <option value="vijayapura">Vijayapura, Karnataka</option>
              <option value="bengaluru">Bengaluru, Karnataka</option>
              <option value="hyderabad">Hyderabad, Telangana</option>
              <option value="mumbai">Mumbai, Maharashtra</option>
              <option value="delhi">New Delhi, Delhi</option>
              <option value="pune">Pune, Maharashtra</option>
            </select>

            <button
              onClick={() => onSelectCity(selectedCityKey)}
              className="px-4 py-2 rounded-lg bg-[#00dbe9] hover:bg-white text-[#00363a] font-bold text-xs transition-colors cursor-pointer"
            >
              CONFIRM CITY
            </button>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="mt-6 flex items-center gap-2 text-[10px] font-mono text-[#849495] justify-center">
          <ShieldCheck className="w-4 h-4 text-[#a9f900]" />
          <span>YOUR PRIVACY IS PROTECTED • NO LOCATION DATA IS STORED OR SHARED</span>
        </div>
      </div>
    </div>
  );
};
