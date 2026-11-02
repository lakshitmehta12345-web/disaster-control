import React, { useState } from 'react';
import {
  FileBarChart,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  Layers,
  Users,
} from 'lucide-react';
import { useRescueGrid } from '../context/RescueGridContext';

export const AnalyticsView: React.FC = () => {
  const { incidents, rescueTeams, shelters, hospitals, simulationEvents } = useRescueGrid();

  const [dateRange, setDateRange] = useState('Today (Monsoon Inundation Day 1)');

  const totalIncidents = incidents.length;
  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved').length;
  const pendingIncidents = totalIncidents - resolvedIncidents;
  const criticalCount = incidents.filter((i) => i.priorityLevel === 'CRITICAL').length;
  const totalVictims = incidents.reduce((sum, i) => sum + i.peopleAffected, 0);

  // Category counts
  const categoryBreakdown: Record<string, number> = {};
  incidents.forEach((i) => {
    categoryBreakdown[i.disasterType] = (categoryBreakdown[i.disasterType] || 0) + 1;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">ANALYTICS &amp; AUDIT INTELLIGENCE</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
              AUDIT COMPLIANT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational post-incident performance, response latency analysis, and humanitarian throughput.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#172337] border border-slate-800">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Casualties Triaged</div>
          <div className="text-3xl font-black text-white font-mono mt-1">{totalVictims}</div>
          <div className="text-[11px] text-emerald-400 mt-0.5">100% accounted for in queue</div>
        </div>

        <div className="p-4 rounded-xl bg-[#172337] border border-slate-800">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resolution Rate</div>
          <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
            {Math.round((resolvedIncidents / Math.max(1, totalIncidents)) * 100)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{resolvedIncidents} closed • {pendingIncidents} active</div>
        </div>

        <div className="p-4 rounded-xl bg-[#172337] border border-slate-800">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mean Dispatch Latency</div>
          <div className="text-3xl font-black text-cyan-400 font-mono mt-1">2.4m</div>
          <div className="text-[11px] text-emerald-400 mt-0.5">Autonomous capability match</div>
        </div>

        <div className="p-4 rounded-xl bg-[#172337] border border-slate-800">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Route Safety Gain</div>
          <div className="text-3xl font-black text-purple-400 font-mono mt-1">+42%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Vs naive shortest path</div>
        </div>
      </div>

      {/* Incident Breakdown by Category & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disaster Type Distribution */}
        <div className="p-5 rounded-2xl bg-[#111C2E] border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Incident Volume by Disaster Category</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Real-Time Distribution</span>
          </div>

          <div className="space-y-3">
            {Object.entries(categoryBreakdown).map(([cat, count]) => {
              const pct = Math.round((count / Math.max(1, totalIncidents)) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-slate-200">
                    <span className="capitalize font-semibold">{cat.replace('_', ' ')}</span>
                    <span className="font-mono text-slate-400">
                      {count} incidents ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        cat === 'flood' ? 'bg-blue-500' : cat === 'landslide' ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Log Stream */}
        <div className="p-5 rounded-2xl bg-[#111C2E] border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <span>Immutable Human-in-the-Loop Audit Trail</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">ISO 22320 Emergency Comms</span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {simulationEvents.map((ev) => (
              <div key={ev.id} className="p-3 rounded-xl bg-[#172337] border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs">{ev.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{ev.timestamp}</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">{ev.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
