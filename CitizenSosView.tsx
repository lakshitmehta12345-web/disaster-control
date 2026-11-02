import React, { useState } from 'react';
import {
  ShieldAlert,
  MapPin,
  Phone,
  Users,
  HeartPulse,
  Camera,
  Mic,
  MicOff,
  CheckCircle,
  Clock,
  Building2,
  Bed,
  Home,
  AlertCircle,
  WifiOff,
  RefreshCw,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useRescueGrid } from '../context/RescueGridContext';
import { DisasterType, IncidentStatus } from '../types';

export const CitizenSosView: React.FC = () => {
  const {
    submitIncidentReport,
    isOffline,
    offlineQueue,
    syncOfflineQueue,
    shelters,
    hospitals,
    incidents,
  } = useRescueGrid();

  const [activeTab, setActiveTab] = useState<'sos' | 'track' | 'shelters' | 'hospitals'>('sos');
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  // SOS Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<DisasterType>('flood');
  const [people, setPeople] = useState(2);
  const [injured, setInjured] = useState(0);
  const [vulnerable, setVulnerable] = useState(0);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('Kathgodam Riverside Colony, Haldwani');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 29.266, lng: 79.544 });
  const [isLocating, setIsLocating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [trackingSearchId, setTrackingSearchId] = useState('INC-HAL-01');

  // Translations dictionary
  const t = {
    en: {
      sosTitle: 'EMERGENCY SOS DISPATCH',
      sosSubtitle: 'Tap below if you or anyone near you requires immediate disaster rescue.',
      pressSos: 'TRIGGER SOS NOW',
      peopleAwaiting: 'People in Distress',
      injuredCount: 'Injured Casualties',
      vulnerableCount: 'Infants / Seniors / Disabled',
      disasterType: 'Emergency Category',
      location: 'Your GPS Location',
      locateMe: 'Detect GPS',
      details: 'Situation Details',
      submitBtn: 'TRANSMIT RESCUE BEACON',
      submittedSuccess: 'Rescue Beacon Acknowledged!',
      trackStatus: 'Track My Rescue Status',
      nearbyShelters: 'Nearby Relief Shelters',
      nearbyHospitals: 'Emergency Trauma Hospitals',
      offlineAlert: 'Offline Mode: Beacon will queue locally and auto-transmit on reconnection.',
      disclaimer: 'DISCLAIMER: This is a demonstration disaster testbed. In real life emergencies, dial 112 / 1070.',
    },
    hi: {
      sosTitle: 'आपातकालीन सहायता (SOS)',
      sosSubtitle: 'यदि आपको या आपके परिजनों को तुरंत बचाव दल की आवश्यकता है तो नीचे दबाएं।',
      pressSos: 'आपातकालीन SOS भेजें',
      peopleAwaiting: 'फंसे हुए व्यक्तियों की संख्या',
      injuredCount: 'घायलों की संख्या',
      vulnerableCount: 'शिशु / बुजुर्ग / दिव्यांग',
      disasterType: 'आपदा का प्रकार',
      location: 'आपका वर्तमान स्थान (GPS)',
      locateMe: 'GPS स्थान पता करें',
      details: 'स्थिति का विवरण',
      submitBtn: 'राहत दल को संदेश भेजें',
      submittedSuccess: 'आपातकालीन संदेश स्वीकार कर लिया गया है!',
      trackStatus: 'राहत कार्य की स्थिति देखें',
      nearbyShelters: 'नजदीकी राहत शिविर',
      nearbyHospitals: 'नजदीकी अस्पताल',
      offlineAlert: 'ऑफ़लाइन मोड: संदेश सुरक्षित है, इंटरनेट आते ही कंट्रोल रूम को पहुंच जाएगा।',
      disclaimer: 'सूचना: यह एक प्रदर्शन प्रणाली है। वास्तविक आपातकाल में 112 या 1070 पर कॉल करें।',
    },
  }[lang];

  // Geolocation trigger
  const handleDetectGps = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: Number(pos.coords.latitude.toFixed(5)),
            lng: Number(pos.coords.longitude.toFixed(5)),
          });
          setAddress(`Haldwani (GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
          setIsLocating(false);
        },
        () => {
          // Fallback to Haldwani default
          setCoords({ lat: 29.2662, lng: 79.5468 });
          setAddress('Gaula Barrage Road, Kathgodam, Haldwani');
          setIsLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Simulated Voice Note transcription with Hindi / English phrases
  const handleToggleVoice = () => {
    if (!isListening) {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        if (lang === 'hi') {
          setDescription('हमारे घर के भूतल पर 4 फीट पानी भर गया है, छत पर 2 बच्चे और एक बुजुर्ग फंसे हैं। कृपया नाव भेजें।');
        } else {
          setDescription('Water level reached 4 feet on ground floor. 2 children and grandmother trapped on roof. Please dispatch swiftwater boat.');
        }
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  // Submit SOS
  const handleSubmitSos = (e: React.FormEvent) => {
    e.preventDefault();
    const result = submitIncidentReport({
      reporterName: name || (lang === 'hi' ? 'नागरिक' : 'Citizen Caller'),
      reporterPhone: phone || '+91-9876543210',
      disasterType: category,
      title: `${category.toUpperCase()} Distress: ${address.split(',')[0]}`,
      description: description || 'Immediate assistance requested by citizen.',
      address,
      location: coords,
      peopleAffected: Number(people),
      injuredCount: Number(injured),
      vulnerableCount: Number(vulnerable),
    });

    setSubmittedId(result.incident.id);
    setTrackingSearchId(result.incident.id);
    setSubmittedSuccess(true);
  };

  // Tracking query
  const trackedIncident = incidents.find(
    (i) => i.id.toLowerCase() === trackingSearchId.trim().toLowerCase()
  );

  const statusSteps: { key: IncidentStatus; labelEn: string; labelHi: string }[] = [
    { key: 'submitted', labelEn: 'Beacon Transmitted', labelHi: 'संदेश प्राप्त' },
    { key: 'under_review', labelEn: 'Under Review', labelHi: 'समीक्षाधीन' },
    { key: 'verified', labelEn: 'Location Verified', labelHi: 'स्थान सत्यापित' },
    { key: 'team_assigned', labelEn: 'Team Deployed', labelHi: 'राहत दल रवाना' },
    { key: 'rescue_in_progress', labelEn: 'Rescue In Progress', labelHi: 'बचाव कार्य जारी' },
    { key: 'resolved', labelEn: 'Safely Extracted', labelHi: 'सुरक्षित निकाला गया' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Language Switcher & Disclaimer */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#111C2E] border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Language / भाषा:</span>
          <button
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 rounded-md font-semibold transition ${
              lang === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLang('hi')}
            className={`px-2.5 py-1 rounded-md font-semibold transition ${
              lang === 'hi' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            हिन्दी (Hindi)
          </button>
        </div>

        <div className="text-[11px] text-amber-400 flex items-center gap-1.5 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{t.disclaimer}</span>
        </div>
      </div>

      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400" />
            <span>{t.offlineAlert} ({offlineQueue.length} pending local records)</span>
          </div>
          <button
            onClick={syncOfflineQueue}
            className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Now</span>
          </button>
        </div>
      )}

      {/* Citizen View Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('sos')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'sos' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-slate-400 hover:text-white bg-slate-800/50'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>SOS Request</span>
        </button>

        <button
          onClick={() => setActiveTab('track')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'track' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800/50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t.trackStatus}</span>
        </button>

        <button
          onClick={() => setActiveTab('shelters')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'shelters' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800/50'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>{t.nearbyShelters}</span>
        </button>

        <button
          onClick={() => setActiveTab('hospitals')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'hospitals' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800/50'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>{t.nearbyHospitals}</span>
        </button>
      </div>

      {/* TAB 1: SOS TRIGGER & SUBMISSION FORM */}
      {activeTab === 'sos' && (
        <div className="space-y-6">
          {/* Hero SOS Button Pulsar */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#172337] to-[#111C2E] border border-red-900/40 text-center relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-lg mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-2">
                {t.sosTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mb-8">{t.sosSubtitle}</p>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('sos-form-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-red-800 text-white font-black text-xl tracking-wider uppercase shadow-2xl shadow-red-600/50 flex flex-col items-center justify-center gap-2 mx-auto border-4 border-red-400/30 hover:scale-105 active:scale-95 transition-transform animate-radar"
              >
                <ShieldAlert className="w-12 h-12" />
                <span>{t.pressSos}</span>
                <span className="text-[10px] font-mono opacity-80">1-CLICK EMERGENCY</span>
              </button>
            </div>
          </div>

          {/* Emergency Form */}
          <div id="sos-form-section" className="p-6 rounded-2xl bg-[#111C2E] border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>Emergency Dispatch Details</span>
            </h3>

            {submittedSuccess && submittedId && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>{t.submittedSuccess}</span>
                </div>
                <p>
                  Your emergency tracking token is <strong className="font-mono text-white text-sm">#{submittedId}</strong>.
                  Command center coordinators have been alerted and AI matching is locating the nearest certified responder.
                </p>
                <button
                  onClick={() => setActiveTab('track')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs mt-1"
                >
                  Track Live Rescue Progress
                </button>
              </div>
            )}

            <form onSubmit={handleSubmitSos} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#172337] px-3.5 py-2.5 rounded-xl border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91-98XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#172337] px-3.5 py-2.5 rounded-xl border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Location & GPS Detection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">{t.location}</label>
                  <button
                    type="button"
                    onClick={handleDetectGps}
                    disabled={isLocating}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[11px] font-medium"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{isLocating ? 'Detecting...' : t.locateMe}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#172337] px-3.5 py-2.5 rounded-xl border border-slate-700 text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Category & Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t.disasterType}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DisasterType)}
                    className="w-full bg-[#172337] px-3 py-2.5 rounded-xl border border-slate-700 text-slate-100"
                  >
                    <option value="flood">Flood</option>
                    <option value="landslide">Landslide</option>
                    <option value="medical">Medical</option>
                    <option value="building_collapse">Collapse</option>
                    <option value="fire">Fire</option>
                    <option value="road_accident">Road Accident</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t.peopleAwaiting}</label>
                  <input
                    type="number"
                    min="1"
                    value={people}
                    onChange={(e) => setPeople(Number(e.target.value))}
                    className="w-full bg-[#172337] px-3 py-2.5 rounded-xl border border-slate-700 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t.injuredCount}</label>
                  <input
                    type="number"
                    min="0"
                    value={injured}
                    onChange={(e) => setInjured(Number(e.target.value))}
                    className="w-full bg-[#172337] px-3 py-2.5 rounded-xl border border-slate-700 text-slate-100 text-red-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t.vulnerableCount}</label>
                  <input
                    type="number"
                    min="0"
                    value={vulnerable}
                    onChange={(e) => setVulnerable(Number(e.target.value))}
                    className="w-full bg-[#172337] px-3 py-2.5 rounded-xl border border-slate-700 text-slate-100 text-amber-400 font-bold"
                  />
                </div>
              </div>

              {/* Description & Speech input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">{t.details}</label>
                  <button
                    type="button"
                    onClick={handleToggleVoice}
                    className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded transition ${
                      isListening ? 'bg-red-500/20 text-red-300 animate-pulse' : 'text-indigo-400 hover:text-indigo-300'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isListening ? 'Listening (Hindi/En)...' : 'Record Voice Note'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="Describe trapped location, landmarks, rising water, immediate hazards..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#172337] p-3 rounded-xl border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm tracking-wide uppercase shadow-lg shadow-red-600/30 transition hover:scale-[1.01]"
              >
                {t.submitBtn}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: TRACK STATUS */}
      {activeTab === 'track' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#111C2E] border border-slate-800 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Enter Incident Token (e.g. INC-HAL-01)..."
              value={trackingSearchId}
              onChange={(e) => setTrackingSearchId(e.target.value)}
              className="flex-1 bg-[#172337] px-4 py-2.5 rounded-xl border border-slate-700 text-xs text-slate-100 uppercase"
            />
          </div>

          {trackedIncident ? (
            <div className="p-6 rounded-2xl bg-[#111C2E] border border-slate-800 space-y-6 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-blue-400">#{trackedIncident.id}</span>
                    <span className="font-bold text-white text-base">{trackedIncident.title}</span>
                  </div>
                  <div className="text-slate-400 text-xs mt-0.5">{trackedIncident.address}</div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase">Priority Rating</div>
                  <div className="text-sm font-black text-red-400 font-mono">
                    {trackedIncident.priorityLevel} ({trackedIncident.priorityScore} pts)
                  </div>
                </div>
              </div>

              {/* Status Stepper */}
              <div className="space-y-3">
                <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Real-time Operational Timeline
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {statusSteps.map((step, idx) => {
                    const stepOrder = ['submitted', 'under_review', 'verified', 'team_assigned', 'rescue_in_progress', 'resolved'];
                    const currentIdx = stepOrder.indexOf(trackedIncident.status);
                    const isDone = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;

                    return (
                      <div
                        key={step.key}
                        className={`p-3 rounded-xl border text-center transition ${
                          isCurrent
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold'
                            : isDone
                            ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                            : 'bg-slate-900/40 border-slate-800/60 text-slate-500'
                        }`}
                      >
                        <div className="text-[10px] font-mono text-slate-400 mb-1">0{idx + 1}</div>
                        <div className="text-xs">{lang === 'hi' ? step.labelHi : step.labelEn}</div>
                        {isCurrent && <div className="text-[10px] text-blue-400 mt-1">● Current</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Assigned Team Card */}
              {trackedIncident.assignedTeamName && (
                <div className="p-4 rounded-xl bg-[#172337] border border-blue-900/50 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-blue-400">Assigned Response Team</div>
                    <div className="text-sm font-bold text-white mt-0.5">{trackedIncident.assignedTeamName}</div>
                    <div className="text-slate-400 text-xs">Certified Swiftwater &amp; Paramedic Unit</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Estimated Arrival</div>
                    <div className="text-lg font-black text-emerald-400 font-mono">
                      ~{trackedIncident.estimatedArrivalMinutes || 8} mins
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-10 rounded-2xl bg-[#111C2E] border border-slate-800 text-center text-slate-400 text-xs">
              No incident found matching token "{trackingSearchId}".
            </div>
          )}
        </div>
      )}

      {/* TAB 3: NEARBY SHELTERS */}
      {activeTab === 'shelters' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {shelters.map((s) => (
            <div key={s.id} className="p-5 rounded-2xl bg-[#111C2E] border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{s.name}</h4>
                  <div className="text-slate-400 text-xs mt-0.5">Helpline: {s.contactNumber}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold text-[10px]">
                  {s.availableSpots} SPOTS OPEN
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300 bg-[#172337] p-2.5 rounded-xl">
                <div>Capacity: <strong>{s.capacity}</strong></div>
                <div>Occupants: <strong>{s.currentOccupants}</strong></div>
                <div>Food Kits: <strong>{s.foodPacketsAvailable}</strong></div>
                <div>Drinking Water: <strong>{s.waterLitersAvailable} L</strong></div>
              </div>

              <a
                href={`tel:${s.contactNumber}`}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Call Shelter Coordinator</span>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: NEARBY HOSPITALS */}
      {activeTab === 'hospitals' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {hospitals.map((h) => (
            <div key={h.id} className="p-5 rounded-2xl bg-[#111C2E] border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{h.name}</h4>
                  <div className="text-slate-400 text-xs mt-0.5">{h.phone}</div>
                </div>
                {h.hasTraumaCenter && (
                  <span className="px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 font-bold text-[10px]">
                    24/7 TRAUMA
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-slate-300 bg-[#172337] p-2.5 rounded-xl text-center">
                <div>
                  <div className="text-[10px] text-slate-400">Total Beds</div>
                  <div className="font-bold text-white text-sm">{h.totalBeds}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Available</div>
                  <div className="font-bold text-emerald-400 text-sm">{h.availableBeds}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">ICU Ready</div>
                  <div className="font-bold text-cyan-400 text-sm">{h.icuAvailable}</div>
                </div>
              </div>

              <a
                href={`tel:${h.phone}`}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Phone className="w-3.5 h-3.5 text-pink-400" />
                <span>Emergency Casualty Line</span>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
