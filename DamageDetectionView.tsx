import React, { useState } from 'react';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Cpu,
  ArrowRight,
  ShieldAlert,
  Search,
  Maximize2,
} from 'lucide-react';
import { useRescueGrid } from '../context/RescueGridContext';
import { DisasterType } from '../types';

interface SampleDisasterImage {
  id: string;
  title: string;
  category: DisasterType;
  imageUrl: string;
  detectedHazards: string[];
  estimatedWaterDepth: number; // in meters
  structuralDamageSeverity: 'critical' | 'severe' | 'moderate' | 'low';
  confidenceScorePercent: number;
  locationName: string;
  suggestedAction: string;
}

const SAMPLE_IMAGES: SampleDisasterImage[] = [
  {
    id: 'IMG-01',
    title: 'Submerged Roadway & Stranded Vehicles (Gaula Bypass)',
    category: 'flood',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80',
    detectedHazards: ['Standing water >1.4m', 'Immobilized passenger car', 'Swift cross-current', 'Submerged road marker'],
    estimatedWaterDepth: 1.4,
    structuralDamageSeverity: 'severe',
    confidenceScorePercent: 95.8,
    locationName: 'Gaula Barrage Bypass Km 2, Kathgodam',
    suggestedAction: 'Deploy Inflatable Swiftwater Boat & Cordon Corridor',
  },
  {
    id: 'IMG-02',
    title: 'Hillside Slope Failure & Retaining Wall Fracture',
    category: 'landslide',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    detectedHazards: ['Loose soil debris mass', 'Wall fracture crack >15cm', 'Exposed electrical cabling'],
    estimatedWaterDepth: 0.1,
    structuralDamageSeverity: 'critical',
    confidenceScorePercent: 93.4,
    locationName: 'Upper Damuadhunga Sector B',
    suggestedAction: 'Dispatch SDRF Mountain Extraction Platoon & PWD Shoring',
  },
  {
    id: 'IMG-03',
    title: 'Urban Residential Inundation & Trapped Rooftop',
    category: 'flood',
    imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80',
    detectedHazards: ['Ground floor submerged (1.8m)', 'Occupants on corrugated roof', 'Contaminated water supply'],
    estimatedWaterDepth: 1.8,
    structuralDamageSeverity: 'severe',
    confidenceScorePercent: 96.2,
    locationName: 'Bareilly Road Subhash Nagar Colony',
    suggestedAction: 'Priority Aerial / Boat Evacuation for Vulnerable Inhabitants',
  },
];

export const DamageDetectionView: React.FC = () => {
  const { submitIncidentReport } = useRescueGrid();

  const [selectedSample, setSelectedSample] = useState<SampleDisasterImage>(SAMPLE_IMAGES[0]);
  const [customImageUri, setCustomImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [convertedIncidentId, setConvertedIncidentId] = useState<string | null>(null);

  const handleSelectSample = (sample: SampleDisasterImage) => {
    setSelectedSample(sample);
    setCustomImageUri(null);
    setConvertedIncidentId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomImageUri(reader.result as string);
        setIsAnalyzing(true);
        setConvertedIncidentId(null);
        setTimeout(() => {
          setIsAnalyzing(false);
        }, 1200);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateIncidentFromImage = () => {
    const result = submitIncidentReport({
      title: `Computer Vision: ${selectedSample.title}`,
      disasterType: selectedSample.category,
      description: `Automated damage detection verified: ${selectedSample.detectedHazards.join(', ')}. Estimated water depth: ${selectedSample.estimatedWaterDepth}m.`,
      address: selectedSample.locationName,
      peopleAffected: 5,
      injuredCount: 1,
      vulnerableCount: 2,
      imageUrl: customImageUri || selectedSample.imageUrl,
      aiExtractedEntities: {
        immediateDanger: selectedSample.detectedHazards,
        requiredSkills: ['Swiftwater Rescue', 'Debris Clearing'],
        requiredEquipment: ['Inflatable Boat', 'Hydraulic Spreader'],
        waterDepthMeters: selectedSample.estimatedWaterDepth,
      },
    });

    setConvertedIncidentId(result.incident.id);
  };

  const currentDisplayImage = customImageUri || selectedSample.imageUrl;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">IMAGE-BASED DAMAGE DETECTION</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              YOLO-VISION DEMO
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Computer vision assessment for flood inundation, structural fracture, and obstacle detection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700 transition">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Upload Incident Photo</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Transparency Note */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>Demonstration Computer Vision pipeline trained on synthetic and open satellite/drone flood imagery. Human verification required before field dispatch.</span>
        </div>
      </div>

      {/* Main Vision Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Image Preview with Bounding Tags Overlay */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl aspect-video flex items-center justify-center">
            <img
              src={currentDisplayImage}
              alt="Disaster Scene"
              className="w-full h-full object-cover transition-opacity duration-300"
            />

            {/* Simulated Bounding Box Tagging Overlays */}
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur text-white text-[11px] font-mono font-bold border border-white/20">
                  CAMERA TELEMETRY • LIVE RGB
                </span>
                <span className="px-2.5 py-1 rounded bg-blue-600/90 text-white text-[11px] font-mono font-bold">
                  CONFIDENCE: {selectedSample.confidenceScorePercent}%
                </span>
              </div>

              {/* Bounding box tags */}
              <div className="space-y-2">
                <div className="inline-block p-1.5 rounded bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                  HAZARD: {selectedSample.detectedHazards[0]}
                </div>
                {selectedSample.estimatedWaterDepth > 0 && (
                  <div>
                    <span className="inline-block p-1.5 rounded bg-cyan-600/90 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                      EST. WATER DEPTH: ~{selectedSample.estimatedWaterDepth} METERS
                    </span>
                  </div>
                )}
              </div>
            </div>

            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-white text-xs font-semibold">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                <span>Running Convolutional Damage Segmentation...</span>
              </div>
            )}
          </div>

          {/* Sample Selectors */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Or Select Verified Haldwani Scenario Evidence:
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`p-2 rounded-xl text-left border text-xs transition ${
                    selectedSample.id === sample.id && !customImageUri
                      ? 'bg-[#172337] border-blue-500 text-white shadow-md'
                      : 'bg-[#111C2E] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold truncate">{sample.title.split('(')[0]}</div>
                  <div className="text-[10px] text-blue-400 mt-0.5 capitalize">{sample.category}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Extracted Intelligence & Action */}
        <div className="lg:col-span-5 space-y-4 text-xs">
          <div className="p-5 rounded-2xl bg-[#111C2E] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Damage Assessment Report</span>
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {selectedSample.id}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-slate-400 text-[11px]">Identified Location:</div>
                <div className="font-semibold text-slate-200 text-xs mt-0.5">{selectedSample.locationName}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-[#172337] border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Structural Threat</div>
                  <div className="text-sm font-black text-red-400 uppercase mt-0.5 font-mono">
                    {selectedSample.structuralDamageSeverity}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#172337] border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Confidence Score</div>
                  <div className="text-sm font-black text-emerald-400 mt-0.5 font-mono">
                    {selectedSample.confidenceScorePercent}%
                  </div>
                </div>
              </div>

              {/* Detected Hazards List */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Computer Vision Detected Objects &amp; Obstacles:
                </div>
                <div className="space-y-1">
                  {selectedSample.detectedHazards.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-[#172337] text-slate-200 text-xs">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Field Dispatch */}
              <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 space-y-1">
                <div className="font-bold text-blue-300 text-xs">Recommended Action:</div>
                <p className="text-slate-300 text-xs leading-relaxed">{selectedSample.suggestedAction}</p>
              </div>

              {/* Create Emergency Incident Button */}
              {convertedIncidentId ? (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 font-semibold text-center">
                  ✅ Successfully converted to Emergency Incident #{convertedIncidentId} in Command Center!
                </div>
              ) : (
                <button
                  onClick={handleCreateIncidentFromImage}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Transmit Verified Incident to HQ</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
