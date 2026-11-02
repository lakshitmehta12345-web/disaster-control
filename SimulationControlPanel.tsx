import React from 'react';
import {
  Sliders,
  X,
  Play,
  Pause,
  Waves,
  AlertTriangle,
  HeartPulse,
  Truck,
  Boxes,
  CheckCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useRescueGrid } from '../context/RescueGridContext';

interface SimulationControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulationControlPanel: React.FC<SimulationControlPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    isSimulationActive,
    waterLevelMeters,
    startSimulation,
    stopSimulation,
    increaseWaterLevel,
    triggerRoadBlockage,
    restoreRoad,
    toggleTeamAvailability,
    triggerCriticalMedicalEmergency,
    triggerResourceShortageAlert,
    completeRescue,
    roads,
    rescueTeams,
    incidents,
  } = useRescueGrid();

  if (!isOpen) return null;

  const blockedRoad = roads.find((r) => r.status === 'blocked');
  const activeInc = incidents.find((i) => i.status === 'rescue_in_progress' || i.status === 'team_assigned');

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 max-w-[90vw] bg-[#111C2E] border-l border-slate-700 shadow-2xl p-5 overflow-y-auto text-slate-100 flex flex-col justify-between">
      <div className="space-y-5 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h2 className="font-bold text-sm text-white uppercase tracking-wider">
              Disaster Simulation Hub
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-slate-400 leading-relaxed text-[11px]">
          Faculty evaluation &amp; demonstration panel. Trigger live environmental, infrastructure, and logistical disruptions to witness autonomous re-optimization.
        </p>

        {/* Live Gauges */}
        <div className="p-3.5 rounded-xl bg-[#172337] border border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Gaula Barrage Gauge:</span>
            <span className="font-mono text-base font-black text-cyan-400">{waterLevelMeters.toFixed(2)}m</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Simulation Status:</span>
            <span className={`font-bold ${isSimulationActive ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isSimulationActive ? '● RUNNING' : '❚❚ PAUSED'}
            </span>
          </div>
        </div>

        {/* 10 Action Triggers */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            10 Demonstration Triggers:
          </div>

          {/* 1. Toggle Simulation */}
          <button
            onClick={isSimulationActive ? stopSimulation : startSimulation}
            className={`w-full p-2.5 rounded-xl font-bold flex items-center justify-between transition ${
              isSimulationActive
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-400'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              {isSimulationActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isSimulationActive ? 'Pause Event Stream' : 'Start Simulation Engine'}</span>
            </div>
            <span className="text-[10px] opacity-75">Trigger 01</span>
          </button>

          {/* 2. Increase Water Level */}
          <button
            onClick={increaseWaterLevel}
            className="w-full p-2.5 rounded-xl bg-[#172337] hover:bg-slate-800 border border-slate-700 text-cyan-300 font-semibold flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2">
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
              <span>Surge Water Level (+0.4m)</span>
            </div>
            <span className="text-[10px] text-slate-400">Trigger 02</span>
          </button>

          {/* 3. Block Road (Dynamic Re-routing) */}
          <button
            onClick={() => triggerRoadBlockage()}
            className="w-full p-2.5 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-800/50 text-red-300 font-semibold flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>Block Kaladhungi Road (Re-Route)</span>
            </div>
            <span className="text-[10px] text-red-400">Trigger 03</span>
          </button>

          {/* 4. Restore Blocked Road */}
          {blockedRoad && (
            <button
              onClick={() => restoreRoad(blockedRoad.id)}
              className="w-full p-2.5 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-800/50 text-emerald-300 font-semibold flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Clear &amp; Re-Open {blockedRoad.name.split('(')[0]}</span>
              </div>
              <span className="text-[10px] text-emerald-400">Trigger 04</span>
            </button>
          )}

          {/* 5. Team Unavailable (Secondary reallocation) */}
          <button
            onClick={() => toggleTeamAvailability('TEAM-04')}
            className="w-full p-2.5 rounded-xl bg-[#172337] hover:bg-slate-800 border border-slate-700 text-amber-300 font-semibold flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>Toggle Team-04 Availability</span>
            </div>
            <span className="text-[10px] text-slate-400">Trigger 05</span>
          </button>

          {/* 6. Critical Medical Emergency */}
          <button
            onClick={triggerCriticalMedicalEmergency}
            className="w-full p-2.5 rounded-xl bg-pink-950/30 hover:bg-pink-900/40 border border-pink-800/50 text-pink-300 font-semibold flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2">
              <HeartPulse className="w-3.5 h-3.5 text-pink-400" />
              <span>Add Acute Medical Collapse</span>
            </div>
            <span className="text-[10px] text-pink-400">Trigger 06</span>
          </button>

          {/* 7. Resource Shortage Alert */}
          <button
            onClick={triggerResourceShortageAlert}
            className="w-full p-2.5 rounded-xl bg-[#172337] hover:bg-slate-800 border border-slate-700 text-purple-300 font-semibold flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2">
              <Boxes className="w-3.5 h-3.5 text-purple-400" />
              <span>Deplete Kathgodam Boats</span>
            </div>
            <span className="text-[10px] text-slate-400">Trigger 07</span>
          </button>

          {/* 8. Complete Active Rescue */}
          {activeInc && (
            <button
              onClick={() => completeRescue(activeInc.id)}
              className="w-full p-2.5 rounded-xl bg-emerald-900/30 hover:bg-emerald-800/40 border border-emerald-700/50 text-emerald-300 font-semibold flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Complete Rescue #{activeInc.id}</span>
              </div>
              <span className="text-[10px] text-emerald-400">Trigger 08</span>
            </button>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500">
        Uttarakhand State Disaster Management Authority (USDMA) Scenario Simulator
      </div>
    </div>
  );
};
