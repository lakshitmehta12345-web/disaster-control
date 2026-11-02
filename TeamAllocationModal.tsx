import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  X,
  AlertTriangle,
  Clock,
  Compass,
  Users,
  HeartPulse,
  Truck,
  RotateCcw,
  Boxes,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import { useRescueGrid } from '../context/RescueGridContext';
import { IncidentReport, RescueTeam } from '../types';

interface TeamAllocationModalProps {
  incident: IncidentReport | null;
  onClose: () => void;
  onOpenMap: (incident: IncidentReport) => void;
}

export const TeamAllocationModal: React.FC<TeamAllocationModalProps> = ({
  incident,
  onClose,
  onOpenMap,
}) => {
  const {
    rescueTeams,
    activeRecommendation,
    activeRoute,
    approveTeamDispatch,
    reassignTeam,
    updateIncidentStatus,
    calculateRouteForIncident,
  } = useRescueGrid();

  const [selectedAltTeamId, setSelectedAltTeamId] = useState<string>('');
  const [officerNotes, setOfficerNotes] = useState<string>('');
  const [showOverrideSelect, setShowOverrideSelect] = useState<boolean>(false);
  const [routeStrategy, setRouteStrategy] = useState<'safest' | 'fastest' | 'shortest'>('safest');

  if (!incident || !activeRecommendation) return null;

  const isCritical = incident.priorityLevel === 'CRITICAL';
  const recTeam = rescueTeams.find((t) => t.id === activeRecommendation.recommendedTeamId);

  const handleApprove = () => {
    approveTeamDispatch(incident.id, activeRecommendation.recommendedTeamId, officerNotes);
    onClose();
  };

  const handleManualReassign = () => {
    if (!selectedAltTeamId) return;
    reassignTeam(incident.id, selectedAltTeamId, officerNotes || 'Officer manual override');
    onClose();
  };

  const handleStrategyChange = (st: 'safest' | 'fastest' | 'shortest') => {
    setRouteStrategy(st);
    calculateRouteForIncident(incident.id, st);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#111C2E] border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl text-slate-100 my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-[#172337] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
              <ShieldAlert className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">#{incident.id}</span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    isCritical
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {incident.priorityLevel} ({incident.priorityScore} pts)
                </span>
              </div>
              <h2 className="text-lg font-bold text-white leading-tight mt-0.5">{incident.title}</h2>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Incident Summary Card */}
          <div className="p-4 rounded-xl bg-[#172337]/70 border border-slate-800 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-200">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {incident.address} ({incident.zoneName})
              </span>
              <span>Reporter: <strong className="text-slate-200">{incident.reporterName}</strong> ({incident.reporterPhone})</span>
            </div>

            <p className="text-slate-300 leading-relaxed text-xs">{incident.description}</p>

            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800/80 text-slate-400">
              <span>Affected: <strong className="text-slate-200">{incident.peopleAffected}</strong></span>
              <span>Injured: <strong className="text-red-400">{incident.injuredCount}</strong></span>
              <span>Vulnerable: <strong className="text-amber-400">{incident.vulnerableCount}</strong></span>
              {incident.aiExtractedEntities?.waterDepthMeters && (
                <span>Flood Depth: <strong className="text-cyan-400">{incident.aiExtractedEntities.waterDepthMeters}m</strong></span>
              )}
            </div>
          </div>

          {/* Explainable AI Primary Recommendation */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-[#172337] to-[#1e293b] border-2 border-blue-600/60 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold uppercase tracking-wider text-[10px]">
                  Optimal Unit Recommendation
                </span>
                <span className="text-slate-400 font-mono text-[11px]">• OR-Tools Multi-Criteria Solver</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Match Compatibility: </span>
                <span className="text-sm font-black text-emerald-400 font-mono">{activeRecommendation.capabilityMatchPercent}%</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <div className="text-lg font-bold text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-400" />
                  <span>{activeRecommendation.recommendedTeamName}</span>
                </div>
                <div className="text-slate-400 text-xs mt-0.5">
                  Vehicle: <strong className="text-slate-200">{recTeam?.vehicleType}</strong> • Agency: <strong className="text-slate-200">{recTeam?.agency}</strong>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Travel Distance</div>
                  <div className="text-base font-bold text-slate-200 font-mono">{activeRecommendation.distanceKm} km</div>
                </div>
                <div className="border-l border-slate-800 pl-4">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Est. Arrival</div>
                  <div className="text-base font-bold text-emerald-400 font-mono">{activeRecommendation.estimatedArrivalMinutes} mins</div>
                </div>
              </div>
            </div>

            {/* XAI Reasons Checklist */}
            <div className="space-y-1.5 mb-4">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Explainable AI Match Rationale:</div>
              {activeRecommendation.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>

            {/* Route Strategy Selection */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Route Strategy:</span>
                {(['safest', 'fastest', 'shortest'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStrategyChange(st)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold uppercase transition ${
                      routeStrategy === st
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <button
                onClick={() => onOpenMap(incident)}
                className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1"
              >
                <span>View Route on Map</span>
                <Compass className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Alternative Units */}
          {activeRecommendation.alternativeTeams.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Evaluated Alternative Units ({activeRecommendation.alternativeTeams.length})
                </span>
                <button
                  onClick={() => setShowOverrideSelect(!showOverrideSelect)}
                  className="text-indigo-400 hover:text-indigo-300 text-xs font-medium"
                >
                  {showOverrideSelect ? 'Hide Override Menu' : 'Manually Override Unit'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {activeRecommendation.alternativeTeams.map((alt) => (
                  <div key={alt.teamId} className="p-3 rounded-xl bg-[#172337] border border-slate-800 text-xs">
                    <div className="font-semibold text-slate-200">{alt.teamName}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{alt.distanceKm} km • ~{alt.arrivalMinutes}m ETA</div>
                    <div className="text-[10px] text-amber-300/80 mt-1">{alt.tradeoffNote}</div>
                  </div>
                ))}
              </div>

              {showOverrideSelect && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3 mt-2">
                  <select
                    value={selectedAltTeamId}
                    onChange={(e) => setSelectedAltTeamId(e.target.value)}
                    className="flex-1 bg-[#172337] text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700"
                  >
                    <option value="">Select alternative unit...</option>
                    {rescueTeams.map((tm) => (
                      <option key={tm.id} value={tm.id}>
                        {tm.name} ({tm.status}) - {tm.agency}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleManualReassign}
                    disabled={!selectedAltTeamId}
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-xs"
                  >
                    Confirm Override
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Recommended Resource Bundle */}
          <div className="p-4 rounded-xl bg-[#172337]/50 border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-2">
              <Boxes className="w-4 h-4 text-emerald-400" />
              <span>Recommended Equipment Payload</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {activeRecommendation.recommendedResources.map((res, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-[#111C2E] border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300">{res.resourceName}</span>
                  <span className="font-mono font-bold text-emerald-400">{res.quantity} {res.unit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Officer Approval Notes */}
          <div>
            <label className="block text-slate-400 text-xs mb-1 font-medium">Officer Deployment Order / Dispatch Notes (Audit Log)</label>
            <input
              type="text"
              placeholder="e.g. Standard flood dispatch authorized. Priority given to rooftop infants."
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              className="w-full bg-[#172337] text-slate-200 placeholder-slate-500 px-3 py-2 rounded-lg border border-slate-700 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-[#172337] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            * Human In The Loop approval required. AI recommendations are assistive.
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>

            <button
              onClick={handleApprove}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Authorize Dispatch Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
