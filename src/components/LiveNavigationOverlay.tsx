import React, { useState, useEffect } from 'react';
import { Place, NavigationStep } from '../types';
import { Navigation, CornerUpRight, ArrowUp, Flag, X, Shield, Volume2, Gauge } from 'lucide-react';

interface LiveNavigationOverlayProps {
  place: Place;
  onEndNavigation: () => void;
  onArrived: () => void;
}

export const LiveNavigationOverlay: React.FC<LiveNavigationOverlayProps> = ({
  place,
  onEndNavigation,
  onArrived,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(15);
  const [speedMph, setSpeedMph] = useState(26);

  const steps: NavigationStep[] = [
    {
      id: 1,
      instruction: `Head North on Cybernetics Way towards ${place.address}`,
      distance: '0.1 mi',
      duration: '1 min',
      icon: 'arrow-up',
    },
    {
      id: 2,
      instruction: 'In 300 ft, Turn Right onto Sector 7 Main Boulevard',
      distance: '300 ft',
      duration: '30 sec',
      icon: 'corner-right',
    },
    {
      id: 3,
      instruction: `Arrive at destination: ${place.name} on your right`,
      distance: '100 ft',
      duration: '15 sec',
      icon: 'flag',
    },
  ];

  // Simulate active GPS movement
  useEffect(() => {
    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onArrived();
          return 100;
        }
        return prev + 10;
      });

      setSpeedMph(24 + Math.floor(Math.random() * 6));
    }, 2500);

    return () => clearInterval(interval);
  }, [onArrived]);

  useEffect(() => {
    if (progressPercent > 40 && progressPercent < 85) {
      setCurrentStepIndex(1);
    } else if (progressPercent >= 85) {
      setCurrentStepIndex(2);
    }
  }, [progressPercent]);

  const currentStep = steps[currentStepIndex];

  return (
    <div className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-xl flex flex-col justify-between p-4 md:p-8 animate-fadeIn">
      {/* Top Header HUD */}
      <div className="flex justify-between items-center bg-[#131313] border border-[#00dbe9]/50 rounded-2xl p-4 shadow-[0_0_30px_rgba(0,219,233,0.3)]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#a9f900] text-[#223600] flex items-center justify-center animate-pulse">
            {currentStepIndex === 0 && <ArrowUp className="w-7 h-7" />}
            {currentStepIndex === 1 && <CornerUpRight className="w-7 h-7" />}
            {currentStepIndex === 2 && <Flag className="w-7 h-7" />}
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#a9f900] uppercase tracking-widest block font-bold">
              NEXT MANEUVER ({currentStep.distance})
            </span>
            <h3 className="font-headline font-bold text-lg text-[#e5e2e1] line-clamp-1">
              {currentStep.instruction}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Audio guidance: "Turn right in 300 feet"')}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#00dbe9] border border-white/10"
            title="Audio Guidance"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <button
            onClick={onEndNavigation}
            className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40"
            title="Exit Route"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Middle Animated Map Simulation / Visualizer */}
      <div className="relative flex-1 my-6 rounded-2xl overflow-hidden glass-card border border-[#00dbe9]/30 flex flex-col items-center justify-center p-6">
        <div className="scanline" />

        {/* Speedometer HUD */}
        <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/70 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
          <Gauge className="w-5 h-5 text-[#a9f900]" />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-[#849495]">SPEED</span>
            <span className="font-headline font-bold text-xl text-[#a9f900]">
              {speedMph} <span className="text-xs font-mono text-[#849495]">MPH</span>
            </span>
          </div>
        </div>

        {/* Center Target Card */}
        <div className="text-center max-w-md z-10 p-6 rounded-2xl bg-[#0e0e0e]/90 border border-[#00dbe9]/40 shadow-[0_0_40px_rgba(0,219,233,0.3)]">
          <div className="w-16 h-16 rounded-full bg-[#00dbe9]/20 border-2 border-[#00dbe9] flex items-center justify-center mx-auto mb-3 animate-ping">
            <Navigation className="w-8 h-8 text-[#00dbe9]" />
          </div>
          <span className="text-xs font-mono text-[#a9f900] tracking-widest uppercase block mb-1 font-bold">
            ACTIVE NAVIGATING TO
          </span>
          <h2 className="font-headline font-bold text-2xl text-[#e5e2e1] mb-2">
            {place.name}
          </h2>
          <p className="text-xs font-mono text-[#b9cacb] mb-4">
            {place.address}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="bg-gradient-to-r from-[#00dbe9] to-[#a9f900] h-full rounded-full transition-all duration-700 shadow-[0_0_15px_#a9f900]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-[#849495] mt-1.5">
            <span>START</span>
            <span>{progressPercent}% ARRIVED</span>
            <span>{place.durationMins} MINS</span>
          </div>
        </div>

        {/* Shield Status */}
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-xs font-mono text-[#849495]">
          <span className="flex items-center gap-1 text-[#00dbe9]">
            <Shield className="w-4 h-4" /> GPS HIGH ACCURACY (0.2m)
          </span>
          <span className="hidden sm:inline">TRAFFIC PREDICTION: OPTIMAL</span>
        </div>
      </div>

      {/* Bottom Footer Controls */}
      <div className="bg-[#131313] border border-white/10 rounded-2xl p-4 flex justify-between items-center">
        <div>
          <span className="text-xs font-mono text-[#849495]">DESTINATION</span>
          <h4 className="font-headline font-bold text-base text-[#00dbe9]">{place.name}</h4>
        </div>

        <button
          onClick={onEndNavigation}
          className="px-6 py-3 rounded-xl bg-[#a9f900] text-[#223600] font-headline font-bold text-sm hover:bg-white active:scale-95 transition-all shadow-[0_0_20px_rgba(169,249,0,0.4)]"
        >
          COMPLETE ROUTE
        </button>
      </div>
    </div>
  );
};
