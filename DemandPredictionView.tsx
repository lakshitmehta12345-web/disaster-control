import React, { useState } from 'react';
import {
  TrendingUp,
  Cpu,
  BarChart3,
  Clock,
  Layers,
  AlertTriangle,
  Waves,
  Truck,
  Home,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { useRescueGrid } from '../context/RescueGridContext';
import { generateDemandForecasts, ML_MODEL_METRICS } from '../utils/demandPrediction';

export const DemandPredictionView: React.FC = () => {
  const { incidents, waterLevelMeters, isSimulationActive } = useRescueGrid();
  const [selectedHorizon, setSelectedHorizon] = useState<'+1h' | '+3h' | '+6h' | '+24h'>('+3h');

  const { forecasts, zoneForecasts, summaryAlert } = generateDemandForecasts(
    incidents.length,
    waterLevelMeters,
    isSimulationActive
  );

  const activeForecast = forecasts.find((f) => f.timeOffset === selectedHorizon) || forecasts[1];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">AI DISASTER DEMAND PREDICTION</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              XGB-HYDRO v2.4
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Predictive time-series modeling for emergency call surges, ambulance saturation, and evacuation demand.
          </p>
        </div>

        {/* Forecast Horizon Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-[#111C2E] p-1 rounded-xl border border-slate-800 text-xs">
          {(['+1h', '+3h', '+6h', '+24h'] as const).map((hz) => (
            <button
              key={hz}
              onClick={() => setSelectedHorizon(hz)}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                selectedHorizon === hz
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {hz} Forecast
            </button>
          ))}
        </div>
      </div>

      {/* Alert Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-[#111C2E] border border-blue-800/50 flex items-start gap-3 text-xs">
        <TrendingUp className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-white uppercase tracking-wider text-[11px]">
            Hydro-Meteorological Surge Advisory ({selectedHorizon})
          </div>
          <p className="text-slate-300 leading-relaxed">{summaryAlert}</p>
        </div>
      </div>

      {/* Top 4 Forecast Metric Cards for Selected Horizon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Expected Requests & CI */}
        <div className="p-4 rounded-xl bg-[#172337] border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Projected Distress Calls</span>
            <Clock className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono mt-1">
            {activeForecast.expectedRequests}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            95% Confidence: <strong className="text-slate-200">[{activeForecast.ciLower} - {activeForecast.ciUpper}]</strong>
          </div>
        </div>

        {/* Ambulances Needed */}
        <div className="p-4 rounded-xl bg-[#172337] border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Ambulance Saturation</span>
            <Truck className="w-3.5 h-3.5 text-pink-400" />
          </div>
          <div className="text-3xl font-black text-pink-400 font-mono mt-1">
            {activeForecast.requiredAmbulances} <span className="text-xs text-slate-400 font-normal">fleet units</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Trauma evacuation buffer needed
          </div>
        </div>

        {/* Swiftwater Boats Needed */}
        <div className="p-4 rounded-xl bg-[#172337] border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Rescue Boats Required</span>
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-400 font-mono mt-1">
            {activeForecast.requiredRescueBoats} <span className="text-xs text-slate-400 font-normal">vessels</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Rooftop &amp; riverside extraction
          </div>
        </div>

        {/* Shelter Space */}
        <div className="p-4 rounded-xl bg-[#172337] border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Evacuation Shelter Need</span>
            <Home className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
            {activeForecast.requiredShelterCapacity} <span className="text-xs text-slate-400 font-normal">beds</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Ready in Indira Gandhi Stadium
          </div>
        </div>
      </div>

      {/* Main Grid: Zone Forecasts & ML Model Documentation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Zone-wise Inundation & Landslide Risks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-[#111C2E] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Geographic Sub-Zone Risk Projections ({selectedHorizon})</span>
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">Auto-recalculated with River Gauge</span>
            </div>

            <div className="space-y-3">
              {zoneForecasts.map((zf) => (
                <div key={zf.zoneId} className="p-4 rounded-xl bg-[#172337] border border-slate-800 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-100 text-sm">{zf.zoneName}</div>
                      <div className="text-[11px] text-slate-400">
                        Current Risk: <strong className="text-amber-400">{zf.currentRiskScore}/100</strong> → 6h Predicted:{' '}
                        <strong className="text-red-400">{zf.predictedRiskScore6h}/100</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          zf.trend === 'rapidly_rising'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {zf.trend.replace('_', ' ')}
                      </span>

                      {zf.evacuationRecommended && (
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                          EVACUATION ADVISED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bars for Inundation and Landslide */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Flood Inundation Probability</span>
                        <span className="font-mono font-bold text-cyan-400">{zf.inundationRiskPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${zf.inundationRiskPercent}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Landslide Debris Probability</span>
                        <span className="font-mono font-bold text-amber-400">{zf.landslideRiskPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${zf.landslideRiskPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Baseline ML Model Evaluation & Transparency */}
        <div className="space-y-4 text-xs">
          <div className="p-5 rounded-2xl bg-[#111C2E] border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <h2 className="font-bold text-white text-xs uppercase tracking-wider">
                Model Evaluation &amp; Accuracy
              </h2>
            </div>

            <div className="space-y-2 text-slate-300 leading-relaxed">
              <div>
                <span className="text-slate-400">Model: </span>
                <strong className="text-white">{ML_MODEL_METRICS.modelName}</strong>
              </div>
              <div>
                <span className="text-slate-400">Architecture: </span>
                <span className="text-slate-200">{ML_MODEL_METRICS.architecture}</span>
              </div>
              <div>
                <span className="text-slate-400">Sample Count: </span>
                <span className="font-mono text-slate-200">{ML_MODEL_METRICS.sampleCount.toLocaleString()} observations</span>
              </div>
            </div>

            {/* Test Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-[#172337] border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Test R² Score</div>
                <div className="text-lg font-black text-emerald-400 font-mono">{ML_MODEL_METRICS.testR2Score}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#172337] border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">RMSE Requests</div>
                <div className="text-lg font-black text-cyan-400 font-mono">{ML_MODEL_METRICS.rmseRequests}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#172337] border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">MAE Error</div>
                <div className="text-lg font-black text-blue-400 font-mono">{ML_MODEL_METRICS.maeRequests}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#172337] border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Critical Recall</div>
                <div className="text-lg font-black text-purple-400 font-mono">
                  {(ML_MODEL_METRICS.recallCriticalEscalation * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Feature Importance */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Top Predictive Features (Gini Importance)
              </div>
              {ML_MODEL_METRICS.featureImportances.map((f, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span className="truncate pr-2">{f.feature}</span>
                    <span className="font-mono font-bold text-indigo-400">{f.importancePercent}%</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${f.importancePercent}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
              * Note: In production deployments, real telemetry hooks into Central Water Commission (CWC) telemetry gauges and IMD Doppler Radar feeds.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
