import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  Filter,
  Flame,
  HeartPulse,
  HelpCircle,
  Layers,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  Sliders,
  Users,
  Waves,
} from 'lucide-react';
import { useRescueGrid } from '../context/RescueGridContext';
import { DisasterType, IncidentReport, PriorityLevel } from '../types';

interface CommandCenterProps {
  onOpenIncidentDetail: (incident: IncidentReport) => void;
  onNavigateToMap: (incident?: IncidentReport) => void;
  onOpenSimulationDrawer: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  onOpenIncidentDetail,
  onNavigateToMap,
  onOpenSimulationDrawer,
}) => {
  const {
    incidents,
    rescueTeams,
    shelters,
    hospitals,
    warehouses,
    zones,
    waterLevelMeters,
    simulationEvents,
    updateIncidentStatus,
  } = useRescueGrid();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedDisasterType, setSelectedDisasterType] = useState<string>('ALL');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');

  // Metrics
  const activeIncidents = incidents.filter((i) => i.status !== 'resolved' && i.status !== 'rejected');
  const criticalCount = activeIncidents.filter((i) => i.priorityLevel === 'CRITICAL').length;
  const highCount = activeIncidents.filter((i) => i.priorityLevel === 'HIGH').length;
  const peopleAwaitingRescue = activeIncidents.reduce((acc, curr) => acc + curr.peopleAffected, 0);

  const deployedTeams = rescueTeams.filter((t) => t.status === 'dispatched' || t.status === 'on_scene').length;
  const availableTeams = rescueTeams.filter((t) => t.status === 'available').length;

  const totalAmbulanceBeds = hospitals.reduce((acc, h) => acc + h.availableBeds, 0);
  const totalShelterSpots = shelters.reduce((acc, s) => acc + s.availableSpots, 0);

  // Filtered incidents
  const filteredIncidents = activeIncidents.filter((inc) => {
    const matchSearch =
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchPriority = selectedPriority === 'ALL' || inc.priorityLevel === selectedPriority;
    const matchType = selectedDisasterType === 'ALL' || inc.disasterType === selectedDisasterType;
    const matchZone = selectedZone === 'ALL' || inc.zoneId === selectedZone;

    return matchSearch && matchPriority && matchType && matchZone;
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Incident ID', 'Type', 'Title', 'Address', 'Priority', 'Score', 'People Affected', 'Injured', 'Status', 'Assigned Team'];
    const rows = incidents.map((inc) => [
      inc.id,
      inc.disasterType,
      `"${inc.title.replace(/"/g, '""')}"`,
      `"${inc.address.replace(/"/g, '""')}"`,
      inc.priorityLevel,
      inc.priorityScore,
      inc.peopleAffected,
      inc.injuredCount,
      inc.status,
      inc.assignedTeamName || 'Unassigned',
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rescuegrid_incidents_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">OPERATIONS COMMAND CENTER</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              DISASTER HQ
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time incident triage, capability matching, and multi-agency deployment telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenSimulationDrawer}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30 transition shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulate Disaster Event</span>
          </button>
        </div>
      </div>

      {/* Top 8 Key Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. Total Active */}
        <div className="p-3.5 rounded-xl bg-[#172337] border border-slate-800 shadow-md">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Active</div>
          <div className="text-2xl font-black text-white font-mono mt-1">{activeIncidents.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">In operational queue</div>
        </div>

        {/* 2. Critical */}
        <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/40 shadow-md">
          <div className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center justify-between">
            <span>Critical</span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </div>
          <div className="text-2xl font-black text-red-400 font-mono mt-1">{criticalCount}</div>
          <div className="text-[10px] text-red-300/80 mt-0.5">Immediate danger</div>
        </div>

        {/* 3. Awaiting Rescue */}
        <div className="p-3.5 rounded-xl bg-[#172337] border border-slate-800 shadow-md">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Awaiting Rescue</div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">{peopleAwaitingRescue}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Persons reported</div>
        </div>

        {/* 4. Active Teams */}
        <div className="p-3.5 rounded-xl bg-[#172337] border border-slate-800 shadow-md">
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Rescue Teams</div>
          <div className="text-2xl font-black text-blue-400 font-mono mt-1">
            {availableTeams}<span className="text-sm font-normal text-slate-400">/{rescueTeams.length}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{deployedTeams} currently en route</div>
        </div>

        {/* 5. Hospital Beds */}
        <div className="p-3.5 rounded-xl bg-[#172337] border border-slate-800 shadow-md">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Hospital Beds</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{totalAmbulanceBeds}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Across 5 Haldwani hubs</div>
        </div>

        {/* 6. Shelters Available */}
        <div className="p-3.5 rounded-xl bg-[#172337] border border-slate-800 shadow-md">
          <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Shelter Spots</div>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-1">{totalShelterSpots}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Ready for evacuees</div>
        </div>

        {/* 7. River Water Gauge */}
        <div className="p-3.5 rounded-xl bg-[#172337] border border-slate-800 shadow-md">
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Gaula Gauge</div>
          <div className="text-2xl font-black text-indigo-300 font-mono mt-1">{waterLevelMeters.toFixed(2)}m</div>
          <div className="text-[10px] text-red-400 mt-0.5">Danger level: 2.70m</div>
        </div>

        {/* 8. Avg Response Time */}
        <div className="p-3.5 rounded-xl bg-[#172337] border border-slate-800 shadow-md">
          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Avg Response</div>
          <div className="text-2xl font-black text-purple-300 font-mono mt-1">11.4m</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">-38% optimization</div>
        </div>
      </div>

      {/* Main Grid: Incident Feed & Side Intelligence Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Search, Filters, and Live Incident Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search & Filter Bar */}
          <div className="p-4 rounded-xl bg-[#111C2E] border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by ID, location, victim count or hazard keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#172337] text-slate-200 placeholder-slate-500 pl-9 pr-4 py-2 rounded-lg text-xs border border-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Priority filter */}
              <select
                aria-label="Filter by priority level"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-[#172337] text-slate-300 text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical (85-100)</option>
                <option value="HIGH">High (65-84)</option>
                <option value="MEDIUM">Medium (35-64)</option>
                <option value="LOW">Low (0-34)</option>
              </select>

              {/* Disaster type filter */}
              <select
                aria-label="Filter by disaster category"
                value={selectedDisasterType}
                onChange={(e) => setSelectedDisasterType(e.target.value)}
                className="bg-[#172337] text-slate-300 text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none"
              >
                <option value="ALL">All Disaster Types</option>
                <option value="flood">Flood</option>
                <option value="landslide">Landslide</option>
                <option value="medical">Medical Emergency</option>
                <option value="building_collapse">Building Collapse</option>
                <option value="fire">Fire</option>
              </select>
            </div>

            {/* Zone tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pt-1">
              <span className="text-slate-400 flex items-center gap-1 font-medium">
                <Filter className="w-3 h-3" /> Zone:
              </span>
              <button
                onClick={() => setSelectedZone('ALL')}
                className={`px-2 py-0.5 rounded-full whitespace-nowrap transition ${
                  selectedZone === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All Zones ({activeIncidents.length})
              </button>
              {zones.map((z) => (
                <button
                  key={z.id}
                  onClick={() => setSelectedZone(z.id)}
                  className={`px-2 py-0.5 rounded-full whitespace-nowrap transition ${
                    selectedZone === z.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {z.name.split('&')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Incident Feed List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Showing {filteredIncidents.length} of {activeIncidents.length} active emergency incidents</span>
              <span className="text-[11px] text-slate-500 font-mono">Sorted by Priority Score (Desc)</span>
            </div>

            {filteredIncidents.length === 0 ? (
              <div className="p-10 rounded-2xl bg-[#111C2E] border border-slate-800 text-center text-slate-400 text-xs">
                No active incidents matching your search filter criteria.
              </div>
            ) : (
              filteredIncidents.map((incident) => {
                const isCritical = incident.priorityLevel === 'CRITICAL';
                const isHigh = incident.priorityLevel === 'HIGH';

                return (
                  <div
                    key={incident.id}
                    className={`p-4 rounded-xl border transition-all hover:border-slate-600 ${
                      isCritical
                        ? 'bg-[#172337]/90 border-red-900/60 shadow-lg shadow-red-950/20'
                        : isHigh
                        ? 'bg-[#172337]/90 border-amber-900/50'
                        : 'bg-[#172337]/70 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                      <div className="flex items-start gap-2.5">
                        {/* Priority Badge */}
                        <div
                          className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono flex items-center gap-1.5 ${
                            isCritical
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                              : isHigh
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          }`}
                        >
                          {isCritical && <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />}
                          <span>{incident.priorityLevel}</span>
                          <span className="text-[10px] opacity-75">({incident.priorityScore})</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-white hover:text-blue-300 cursor-pointer" onClick={() => onOpenIncidentDetail(incident)}>
                              {incident.title}
                            </h3>
                            <span className="text-[10px] font-mono text-slate-500">{incident.id}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1 text-slate-300">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {incident.address}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-blue-400">{incident.zoneName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Tag */}
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border self-start ${
                          incident.status === 'team_assigned'
                            ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                            : incident.status === 'rescue_in_progress'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : incident.status === 'resolved'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-red-500/10 text-red-300 border-red-500/30'
                        }`}
                      >
                        {incident.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                      {incident.description}
                    </p>

                    {/* Meta stats & XAI rationale highlights */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                      <div className="flex items-center gap-4 text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <strong className="text-slate-200">{incident.peopleAffected}</strong> Affected
                        </span>
                        {incident.injuredCount > 0 && (
                          <span className="flex items-center gap-1 text-red-400 font-medium">
                            <HeartPulse className="w-3.5 h-3.5" />
                            {incident.injuredCount} Injured
                          </span>
                        )}
                        {incident.assignedTeamName ? (
                          <span className="text-indigo-300 font-medium flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                            Assigned: {incident.assignedTeamName}
                          </span>
                        ) : (
                          <span className="text-amber-400 font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Needs Team Allocation
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onNavigateToMap(incident)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                          title="View on Interactive GIS Map"
                        >
                          Locate Map
                        </button>

                        <button
                          onClick={() => onOpenIncidentDetail(incident)}
                          className="flex items-center gap-1 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
                        >
                          <span>Review &amp; Dispatch</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Live Event Stream, Multi-Agency Units, and Re-Optimization Audit */}
        <div className="space-y-4">
          {/* Continuous Re-optimization Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#111C2E] to-[#172337] border border-blue-900/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-blue-300">
                  Continuous Re-Optimization Engine
                </h3>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Monitoring Gaula Barrage discharge, rainfall influx, and road closures. Automatically re-evaluates active dispatches when road or team status changes.
            </p>
          </div>

          {/* Rescue Team Readiness Matrix */}
          <div className="p-4 rounded-xl bg-[#111C2E] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-400" />
                <span>Multi-Agency Rescue Units ({rescueTeams.length})</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">{availableTeams} Available</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
              {rescueTeams.slice(0, 7).map((tm) => (
                <div key={tm.id} className="p-2.5 rounded-lg bg-[#172337] border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200">{tm.name}</div>
                    <div className="text-[10px] text-slate-400">{tm.agency} • {tm.vehicleType} • {tm.stationName}</div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      tm.status === 'available'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : tm.status === 'dispatched'
                        ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {tm.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Simulation Event Stream */}
          <div className="p-4 rounded-xl bg-[#111C2E] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-400" />
                <span>Operational Audit Trail</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Real-time</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
              {simulationEvents.slice(0, 8).map((ev) => (
                <div key={ev.id} className="p-2.5 rounded-lg bg-[#172337]/60 border border-slate-800 text-[11px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200">{ev.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{ev.timestamp}</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">{ev.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
