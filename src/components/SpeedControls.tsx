import React from 'react';
import { sounds } from '../utils/soundEffects';
import { Gauge } from 'lucide-react';

interface SpeedControlsProps {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
  compact?: boolean;
}

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0];

export const SpeedControls: React.FC<SpeedControlsProps> = ({
  currentSpeed,
  onSpeedChange,
  compact = false,
}) => {
  return (
    <div className={`flex items-center ${compact ? 'gap-1' : 'gap-1.5'}`}>
      {!compact && (
        <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-400 mr-1 select-none">
          <Gauge className="w-3.5 h-3.5 text-amber-400" />
          <span>Velocidad:</span>
        </div>
      )}
      <div className="flex items-center p-1 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
        {SPEED_OPTIONS.map((spd) => {
          const isActive = Math.abs(currentSpeed - spd) < 0.05;
          return (
            <button
              key={spd}
              id={`btn-speed-${spd.toString().replace('.', '_')}`}
              onClick={() => {
                sounds.playSpeedChange();
                onSpeedChange(spd);
              }}
              className={`px-2 py-1 rounded-lg text-xs font-mono font-medium transition-all active:scale-95 ${
                isActive
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
              title={`Velocidad de lectura ${spd}x`}
            >
              {spd}x
            </button>
          );
        })}
      </div>
    </div>
  );
};
