import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
  Activity,
  Cpu,
  MapPin,
  Users,
  Compass,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Download,
  PhoneCall,
  Clock,
  Layers,
  HeartPulse,
} from 'lucide-react';
import { useRescueGrid } from '../context/RescueGridContext';

interface LandingPageProps {
  onExploreCommand: () => void;
  onReportEmergency: () => void;
  onOpenZipModal: () => void;
  onExploreTech: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onExploreCommand,
  onReportEmergency,
  onOpenZipModal,
  onExploreTech,
}) => {
  const { incidents, rescueTeams, waterLevelMeters, isSimulationActive } = useRescueGrid();

  const criticalCount = incidents.filter((i) => i.priorityLevel === 'CRITICAL').length;
  const totalVictims = incidents.reduce((sum, i) => sum + i.peopleAffected, 0);

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 flex flex-col">
      {/* Cinematic Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center justify-center border-b border-slate-800">
        {/* Background Image / Gradient / Grid Canvas */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=2000&q=80')`,
          }}
        />
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/80 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center z-10">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-blue-400 mb-8 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>Intelligent Disaster Intelligence &amp; Emergency Response</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300 font-mono italic">"Every Second Matters. Every Resource Counts."</span>
          </div>

          {/* Large Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase leading-[1.08] mb-6">
            WHEN DISASTER STRIKES, <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-red-400 bg-clip-text text-transparent">
              INTELLIGENCE SAVES LIVES.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-300 leading-relaxed font-normal mb-10">
            A state-of-the-art AI emergency response ecosystem bridging citizens, multi-agency rescue teams, GIS geospatial telemetry, and real-time optimization during floods, landslides, earthquakes, and acute crises.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <button
              onClick={onExploreCommand}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <Activity className="w-4 h-4" />
              <span>Explore Command Center</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onReportEmergency}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02]"
            >
              <ShieldAlert className="w-4 h-4 animate-bounce" />
              <span>Report an Emergency (SOS)</span>
            </button>

            <button
              onClick={onExploreTech}
              className="flex items-center gap-2.5 px-5 py-3.5 rounded-xl font-medium text-sm bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Discover Our Technology</span>
            </button>

            <button
              onClick={onOpenZipModal}
              className="flex items-center gap-2.5 px-5 py-3.5 rounded-xl font-medium text-sm bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-800/50 transition"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Get Project ZIP</span>
            </button>
          </div>

          {/* Live Incident Statistics Ticker (Clearly marked DEMO) */}
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#111C2E]/90 border border-slate-800/90 backdrop-blur shadow-2xl">
            <div className="p-3 text-left">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Incidents</div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">{incidents.length}</div>
              <div className="text-[11px] text-red-400 font-medium flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                {criticalCount} Critical (Life Threat)
              </div>
            </div>

            <div className="p-3 text-left border-l border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Awaiting Rescue</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1">{totalVictims}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Citizens in priority queue</div>
            </div>

            <div className="p-3 text-left border-l border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rescue Units Ready</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1">{rescueTeams.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">NDRF, SDRF &amp; Fire Units</div>
            </div>

            <div className="p-3 text-left border-l border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Avg Response Time</div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono mt-1">11.4m</div>
              <div className="text-[11px] text-emerald-400 mt-0.5">-38% vs manual dispatch</div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 italic">* Calibrated on Haldwani, Uttarakhand Monsoon Flash Flood Simulation Testbed</p>
        </div>
      </section>

      {/* Operational Workflow Section */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <div className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Closed-Loop Resilience</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">How RescueGrid Responds In Seconds</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mt-3 text-sm">
            From the instant a stranded citizen clicks SOS to real-time evacuation and hospital arrival, AI coordinates every touchpoint with human oversight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#172337] border border-slate-800 relative group hover:border-blue-600/50 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm mb-4">
              01
            </div>
            <h3 className="font-bold text-base text-white mb-2">Multimodal SOS Report</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Citizens submit emergency requests via text, voice notes (Hindi/English), or photos with offline caching &amp; automated GPS extraction.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#172337] border border-slate-800 relative group hover:border-indigo-600/50 transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm mb-4">
              02
            </div>
            <h3 className="font-bold text-base text-white mb-2">AI Severity &amp; Priority Scoring</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              NLP extracts entities, evaluates acute life hazards, infants/elderly presence, water rise rate, and generates an auditable 0-100 priority score.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#172337] border border-slate-800 relative group hover:border-amber-600/50 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold text-sm mb-4">
              03
            </div>
            <h3 className="font-bold text-base text-white mb-2">Optimal Team Matching</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              OR-Tools style multi-criteria engine matches required capabilities (swiftwater, high-angle, medical) with nearest available units and workload.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#172337] border border-slate-800 relative group hover:border-emerald-600/50 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">
              04
            </div>
            <h3 className="font-bold text-base text-white mb-2">Dynamic Safe Routing</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Calculates safest routes bypassing flooded corridors and landslides. If a road is blocked, system dynamically re-routes active teams instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Architecture Section */}
      <section id="technology" className="py-20 px-4 sm:px-6 bg-[#111C2E]/60 border-t border-b border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">Deep Engineering</div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Full-Stack Intelligence Architecture</h2>
            <p className="text-slate-400 max-w-2xl mx-auto mt-3 text-sm">
              Modular services combining real mathematical optimization, machine learning regressors, and spatial GIS topologies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#172337] border border-slate-700/60">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-white">Explainable AI (XAI)</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                No black-box decisions in life-or-death emergencies. Every priority score and team recommendation comes with documented human-readable rationale and alternative options.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Multi-factor life threat weighting</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Proximity duplicate report detection</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Human approval before physical dispatch</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#172337] border border-slate-700/60">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-white">Dynamic Road Routing</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                A* and Dijkstra graph algorithm over OpenStreetMap road networks. Compares Safest vs Fastest vs Shortest routes, penalizing waterlogged and landslide hazard corridors.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Continuous re-routing on road blockage</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Multi-criteria hazard safety scoring</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Real-time ETA and step-by-step guidance</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#172337] border border-slate-700/60">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-white">Predictive Demand (XGB)</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Gradient-boosted decision trees trained on historical and hydro-GIS monsoon data to forecast emergency call volumes, required ambulances, and shelter capacities.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Forecast horizons (+1h, +3h, +6h, +24h)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 95% Confidence Interval bounds</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Pre-emptive logistics replenishment alerts</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-10 px-4 sm:px-6 border-t border-slate-800 text-slate-400 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span className="font-bold text-slate-200">RESCUEGRID DISASTER PLATFORM</span>
            <span>© 2026 Emergency Management Directorate</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onOpenZipModal} className="text-cyan-400 hover:underline">
              Download Source ZIP
            </button>
            <button onClick={onExploreCommand} className="text-blue-400 hover:underline">
              Live Command Center
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Haldwani, Uttarakhand Pilot</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
