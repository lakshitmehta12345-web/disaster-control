import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  MapPin,
  ShieldAlert,
  AlertTriangle,
  Building2,
  Boxes,
  Compass,
  PlusCircle,
  X,
  CheckCircle,
  Truck,
  HeartPulse,
} from 'lucide-react';
import { useRescueGrid } from '../context/RescueGridContext';
import { Coordinates, IncidentReport, RescueTeam } from '../types';
import { HALDWANI_CENTER } from '../data/haldwaniScenario';

interface GisMapProps {
  onOpenIncidentDetail: (incident: IncidentReport) => void;
  focusedIncident?: IncidentReport | null;
}

export const GisMap: React.FC<GisMapProps> = ({ onOpenIncidentDetail, focusedIncident }) => {
  const {
    incidents,
    rescueTeams,
    roads,
    hospitals,
    shelters,
    warehouses,
    zones,
    activeRoute,
    submitIncidentReport,
  } = useRescueGrid();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<{ [key: string]: L.LayerGroup }>({});
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Layer toggles
  const [showIncidents, setShowIncidents] = useState(true);
  const [showFloodZones, setShowFloodZones] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [showRescueTeams, setShowRescueTeams] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [showShelters, setShowShelters] = useState(true);

  // Click-on-map to report emergency modal
  const [clickedCoords, setClickedCoords] = useState<Coordinates | null>(null);
  const [newIncidentTitle, setNewIncidentTitle] = useState('');
  const [newIncidentType, setNewIncidentType] = useState<'flood' | 'landslide' | 'medical' | 'building_collapse'>('flood');
  const [newIncidentPeople, setNewIncidentPeople] = useState(4);
  const [newIncidentInjured, setNewIncidentInjured] = useState(0);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [HALDWANI_CENTER.lat, HALDWANI_CENTER.lng],
      zoom: 13,
      zoomControl: true,
    });

    // Dark cartographic tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Click on map to add incident
    map.on('click', (e: L.LeafletMouseEvent) => {
      setClickedCoords({ lat: Number(e.latlng.lat.toFixed(5)), lng: Number(e.latlng.lng.toFixed(5)) });
    });

    // Create layer groups
    layersGroupRef.current = {
      incidents: L.layerGroup().addTo(map),
      floodZones: L.layerGroup().addTo(map),
      roads: L.layerGroup().addTo(map),
      rescueTeams: L.layerGroup().addTo(map),
      hospitals: L.layerGroup().addTo(map),
      shelters: L.layerGroup().addTo(map),
    };

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Flood Zones Layer
  useEffect(() => {
    const group = layersGroupRef.current.floodZones;
    if (!group) return;
    group.clearLayers();

    if (!showFloodZones) return;

    zones.forEach((z) => {
      const polygonCoords = z.polygon.map((c) => [c.lat, c.lng] as [number, number]);
      const color = z.riskLevel === 'extreme' ? '#ef4444' : z.riskLevel === 'high' ? '#f97316' : '#eab308';

      const poly = L.polygon(polygonCoords, {
        color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.22,
        dashArray: '4, 4',
      });

      poly.bindPopup(`
        <div class="text-xs p-1">
          <div class="font-bold text-slate-100 text-sm mb-1">${z.name}</div>
          <div class="text-slate-300">Risk Level: <strong style="color:${color}; text-transform:uppercase">${z.riskLevel}</strong></div>
          <div class="text-slate-300">Water Gauge: <strong>${z.currentWaterLevelMeters}m</strong></div>
          <div class="text-slate-400 mt-1">Vulnerable Population: ${z.vulnerablePopulation.toLocaleString()}</div>
        </div>
      `);

      poly.addTo(group);
    });
  }, [zones, showFloodZones]);

  // Update Road Conditions Layer
  useEffect(() => {
    const group = layersGroupRef.current.roads;
    if (!group) return;
    group.clearLayers();

    if (!showRoads) return;

    roads.forEach((r) => {
      const latlngs = r.coordinates.map((c) => [c.lat, c.lng] as [number, number]);
      const isBlocked = r.status === 'blocked';
      const isWaterlogged = r.status === 'waterlogged';
      const color = isBlocked ? '#dc2626' : isWaterlogged ? '#f59e0b' : '#10b981';

      const line = L.polyline(latlngs, {
        color,
        weight: isBlocked ? 6 : 4,
        dashArray: isBlocked ? '6, 6' : undefined,
        opacity: 0.85,
      });

      line.bindPopup(`
        <div class="text-xs p-1">
          <div class="font-bold text-slate-100 mb-1">${r.name}</div>
          <div class="text-slate-300">Status: <strong style="color:${color}; text-transform:uppercase">${r.status}</strong></div>
          <div class="text-slate-400 mt-1">${r.notes}</div>
          <div class="text-[10px] text-slate-500 mt-1">Updated ${r.lastUpdated}</div>
        </div>
      `);

      line.addTo(group);
    });
  }, [roads, showRoads]);

  // Update Incidents Layer
  useEffect(() => {
    const group = layersGroupRef.current.incidents;
    if (!group) return;
    group.clearLayers();

    if (!showIncidents) return;

    incidents.forEach((inc) => {
      if (inc.status === 'resolved') return;

      const isCritical = inc.priorityLevel === 'CRITICAL';
      const isHigh = inc.priorityLevel === 'HIGH';
      const bgColor = isCritical ? '#ef4444' : isHigh ? '#f97316' : '#eab308';

      // Custom HTML Marker with radar pulse
      const iconHtml = `
        <div style="position:relative; width:28px; height:28px; display:flex; align-items:center; justify-content:center;">
          ${isCritical ? '<div style="position:absolute; width:100%; height:100%; border-radius:50%; background:' + bgColor + '; opacity:0.6; animation:ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
          <div style="width:24px; height:24px; border-radius:50%; background:${bgColor}; border:2px solid #ffffff; box-shadow:0 4px 6px -1px rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; color:#ffffff; font-size:10px; font-weight:900;">
            ${inc.peopleAffected}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-incident-marker',
        html: iconHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([inc.location.lat, inc.location.lng], { icon: customIcon });

      marker.bindPopup(`
        <div class="p-1 text-xs">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span style="background:${bgColor}20; color:${bgColor}; font-weight:bold; padding:2px 6px; border-radius:4px; text-transform:uppercase;">
              ${inc.priorityLevel} (${inc.priorityScore})
            </span>
            <span class="text-slate-400 text-[10px]">${inc.id}</span>
          </div>
          <div class="font-bold text-slate-100 text-sm mb-1">${inc.title}</div>
          <div class="text-slate-300 text-[11px] mb-2">${inc.address}</div>
          <div class="text-slate-400 mb-2">Affected: <strong>${inc.peopleAffected}</strong> • Injured: <strong>${inc.injuredCount}</strong></div>
          <button id="btn-dispatch-${inc.id}" style="width:100%; background:#2563eb; color:#fff; font-weight:bold; padding:6px; border-radius:6px; font-size:11px; cursor:pointer; border:none;">
            Inspect AI Allocation
          </button>
        </div>
      `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-dispatch-${inc.id}`);
        if (btn) {
          btn.onclick = () => onOpenIncidentDetail(inc);
        }
      });

      marker.addTo(group);
    });
  }, [incidents, showIncidents, onOpenIncidentDetail]);

  // Update Rescue Teams Layer
  useEffect(() => {
    const group = layersGroupRef.current.rescueTeams;
    if (!group) return;
    group.clearLayers();

    if (!showRescueTeams) return;

    rescueTeams.forEach((tm) => {
      const isAvailable = tm.status === 'available';
      const iconHtml = `
        <div style="background:#1e293b; border:2px solid ${isAvailable ? '#10b981' : '#3b82f6'}; border-radius:8px; padding:3px 6px; display:flex; align-items:center; gap:4px; box-shadow:0 4px 6px rgba(0,0,0,0.5); font-size:10px; font-weight:bold; color:#f8fafc; white-space:nowrap;">
          <span style="width:6px; height:6px; border-radius:50%; background:${isAvailable ? '#10b981' : '#3b82f6'};"></span>
          ${tm.callSign}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-team-marker',
        html: iconHtml,
        iconSize: [80, 24],
        iconAnchor: [40, 12],
      });

      const marker = L.marker([tm.currentLocation.lat, tm.currentLocation.lng], { icon: customIcon });

      marker.bindPopup(`
        <div class="p-1 text-xs">
          <div class="font-bold text-slate-100 text-sm mb-1">${tm.name}</div>
          <div class="text-slate-300">Agency: <strong>${tm.agency}</strong></div>
          <div class="text-slate-300">Vehicle: <strong>${tm.vehicleType}</strong></div>
          <div class="text-slate-300">Workload: <strong>${tm.currentWorkload} active</strong></div>
          <div class="text-slate-400 mt-1">Leader: ${tm.leaderName}</div>
        </div>
      `);

      marker.addTo(group);
    });
  }, [rescueTeams, showRescueTeams]);

  // Update Hospitals & Shelters
  useEffect(() => {
    const hospGroup = layersGroupRef.current.hospitals;
    const shltGroup = layersGroupRef.current.shelters;
    if (!hospGroup || !shltGroup) return;

    hospGroup.clearLayers();
    shltGroup.clearLayers();

    if (showHospitals) {
      hospitals.forEach((h) => {
        const marker = L.circleMarker([h.location.lat, h.location.lng], {
          radius: 7,
          fillColor: '#ec4899',
          color: '#ffffff',
          weight: 1.5,
          fillOpacity: 0.9,
        });

        marker.bindPopup(`
          <div class="p-1 text-xs">
            <div class="font-bold text-slate-100 mb-1">${h.name}</div>
            <div class="text-slate-300">Available Beds: <strong>${h.availableBeds} / ${h.totalBeds}</strong></div>
            <div class="text-slate-300">ICU Available: <strong>${h.icuAvailable}</strong></div>
            <div class="text-slate-400 mt-1">Phone: ${h.phone}</div>
          </div>
        `);
        marker.addTo(hospGroup);
      });
    }

    if (showShelters) {
      shelters.forEach((s) => {
        const marker = L.circleMarker([s.location.lat, s.location.lng], {
          radius: 7,
          fillColor: '#06b6d4',
          color: '#ffffff',
          weight: 1.5,
          fillOpacity: 0.9,
        });

        marker.bindPopup(`
          <div class="p-1 text-xs">
            <div class="font-bold text-slate-100 mb-1">${s.name}</div>
            <div class="text-slate-300">Available Spots: <strong>${s.availableSpots} / ${s.capacity}</strong></div>
            <div class="text-slate-300">Food Kits: <strong>${s.foodPacketsAvailable}</strong></div>
            <div class="text-slate-400 mt-1">Helpline: ${s.contactNumber}</div>
          </div>
        `);
        marker.addTo(shltGroup);
      });
    }
  }, [hospitals, shelters, showHospitals, showShelters]);

  // Render Dynamic Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    if (activeRoute) {
      const waypoints = activeRoute.routes[activeRoute.selectedStrategy].waypoints.map(
        (c) => [c.lat, c.lng] as [number, number]
      );
      const color = activeRoute.selectedStrategy === 'safest' ? '#10b981' : activeRoute.selectedStrategy === 'fastest' ? '#3b82f6' : '#f97316';

      routePolylineRef.current = L.polyline(waypoints, {
        color,
        weight: 5,
        opacity: 0.9,
      }).addTo(map);

      map.fitBounds(routePolylineRef.current.getBounds(), { padding: [50, 50] });
    }
  }, [activeRoute]);

  // Center on focused incident if provided
  useEffect(() => {
    if (focusedIncident && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([focusedIncident.location.lat, focusedIncident.location.lng], 15, {
        duration: 1.2,
      });
    }
  }, [focusedIncident]);

  const handleCreateClickedIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clickedCoords) return;

    submitIncidentReport({
      title: newIncidentTitle || 'Citizen Disaster Distress Report',
      disasterType: newIncidentType,
      address: `Lat ${clickedCoords.lat}, Lng ${clickedCoords.lng} (Pin Drop)`,
      location: clickedCoords,
      peopleAffected: Number(newIncidentPeople),
      injuredCount: Number(newIncidentInjured),
      description: 'Emergency pinpointed directly via interactive GIS command map.',
    });

    setClickedCoords(null);
    setNewIncidentTitle('');
  };

  return (
    <div className="relative w-full h-[calc(100vh-110px)] min-h-[550px] bg-[#0B1220] overflow-hidden">
      {/* Map Surface */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Control Overlay (Layer Toggles) */}
      <div className="absolute top-4 left-4 z-10 bg-[#111C2E]/90 backdrop-blur border border-slate-800 rounded-xl p-3 shadow-2xl max-w-xs text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-200 uppercase tracking-wider pb-1 border-b border-slate-800">
          <Layers className="w-4 h-4 text-blue-400" />
          <span>GIS Topologies</span>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showIncidents}
              onChange={(e) => setShowIncidents(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              Incidents ({incidents.filter((i) => i.status !== 'resolved').length})
            </span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showFloodZones}
              onChange={(e) => setShowFloodZones(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-500/50 border border-blue-400" />
              Gaula Flood Zones (4)
            </span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showRoads}
              onChange={(e) => setShowRoads(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded bg-red-500" />
              Road Network &amp; Hazards
            </span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showRescueTeams}
              onChange={(e) => setShowRescueTeams(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
              Rescue Units (NDRF/SDRF)
            </span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showHospitals}
              onChange={(e) => setShowHospitals(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
              Trauma Hospitals (5)
            </span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showShelters}
              onChange={(e) => setShowShelters(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              Relief Shelters (4)
            </span>
          </label>
        </div>

        <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
          💡 Click anywhere on map to dispatch emergency at coordinate.
        </div>
      </div>

      {/* Route Info Overlay (if active) */}
      {activeRoute && (
        <div className="absolute bottom-4 left-4 z-10 bg-[#111C2E]/95 backdrop-blur border border-blue-900/60 rounded-xl p-3 shadow-2xl max-w-sm text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Active Route: {activeRoute.selectedStrategy.toUpperCase()}
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              {activeRoute.routes[activeRoute.selectedStrategy].estimatedMinutes} min ETA
            </span>
          </div>
          <div className="text-slate-300 mb-1">
            Distance: <strong>{activeRoute.routes[activeRoute.selectedStrategy].totalDistanceKm} km</strong> • Safety Index: <strong>{activeRoute.routes[activeRoute.selectedStrategy].safetyScore}/100</strong>
          </div>
          {activeRoute.recalculationReason && (
            <div className="text-[11px] text-amber-300 bg-amber-950/40 p-1.5 rounded border border-amber-800/40 mt-1">
              ⚠️ {activeRoute.recalculationReason}
            </div>
          )}
        </div>
      )}

      {/* Pin Drop Emergency Creator Modal */}
      {clickedCoords && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-[#111C2E] border border-blue-700/80 rounded-2xl p-5 shadow-2xl w-96 max-w-[90vw] text-slate-100">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <div className="font-bold text-sm flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-red-500" />
              <span>Create Map Pin Incident</span>
            </div>
            <button onClick={() => setClickedCoords(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateClickedIncident} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Coordinates</label>
              <input
                type="text"
                disabled
                value={`${clickedCoords.lat}, ${clickedCoords.lng}`}
                className="w-full bg-[#172337] px-3 py-1.5 rounded border border-slate-700 text-slate-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Incident Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Roof trapped family near Kathgodam barrage"
                value={newIncidentTitle}
                onChange={(e) => setNewIncidentTitle(e.target.value)}
                className="w-full bg-[#172337] px-3 py-1.5 rounded border border-slate-700 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 mb-1">Disaster Type</label>
                <select
                  value={newIncidentType}
                  onChange={(e) => setNewIncidentType(e.target.value as any)}
                  className="w-full bg-[#172337] px-3 py-1.5 rounded border border-slate-700 text-slate-100"
                >
                  <option value="flood">Flood</option>
                  <option value="landslide">Landslide</option>
                  <option value="medical">Medical</option>
                  <option value="building_collapse">Collapse</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">People Count</label>
                <input
                  type="number"
                  min="1"
                  value={newIncidentPeople}
                  onChange={(e) => setNewIncidentPeople(Number(e.target.value))}
                  className="w-full bg-[#172337] px-3 py-1.5 rounded border border-slate-700 text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Injured Casualties</label>
              <input
                type="number"
                min="0"
                value={newIncidentInjured}
                onChange={(e) => setNewIncidentInjured(Number(e.target.value))}
                className="w-full bg-[#172337] px-3 py-1.5 rounded border border-slate-700 text-slate-100"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setClickedCoords(null)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-semibold"
              >
                Submit Incident
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
