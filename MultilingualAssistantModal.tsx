import React, { useState } from 'react';
import {
  MessageSquareText,
  X,
  Send,
  Mic,
  MicOff,
  ShieldAlert,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Bot,
  User,
} from 'lucide-react';
import { useRescueGrid } from '../context/RescueGridContext';
import { DisasterType } from '../types';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  extractedData?: {
    disasterType: DisasterType;
    peopleAffected: number;
    urgency: string;
    actionRequired: string;
    locationNote?: string;
  };
}

interface MultilingualAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_QUERIES = [
  'Mere ghar mein paani bhar raha hai aur 2 log fase hue hain.',
  'Kathgodam Gaula barrage ke paas road block hai aur 5 log fas gaye hain.',
  'Need urgent medical oxygen for elderly patient in Damuadhunga.',
  'What should I do during rapid flash flood water rise?',
];

export const MultilingualAssistantModal: React.FC<MultilingualAssistantModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { submitIncidentReport } = useRescueGrid();

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'MSG-01',
      sender: 'ai',
      text: 'Namaste. I am RescueGrid AI Sahayak, your multilingual disaster intelligence assistant. You can speak or type in English, Hindi (हिन्दी), or Hinglish. If you are in immediate danger, please describe your situation or tap below.',
      timestamp: 'Just now',
    },
  ]);
  const [pendingReportData, setPendingReportData] = useState<any | null>(null);
  const [convertedId, setConvertedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `USER-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setConvertedId(null);

    // AI Intent & Entity Extraction logic
    const lower = query.toLowerCase();
    let disaster: DisasterType = 'flood';
    let count = 1;
    let urgency = 'CRITICAL';
    let replyText = '';

    if (lower.includes('paani') || lower.includes('flood') || lower.includes('water') || lower.includes('barrage')) {
      disaster = 'flood';
      count = lower.includes('do log') || lower.includes('2') ? 2 : lower.includes('5') ? 5 : 3;
      replyText =
        'Maine aapki emergency note kar li hai. (Disaster: Flood, Estimated People: ' +
        count +
        '). IMMEDIATE SAFETY ADVICE: Do NOT wade into moving flood water. Turn off main electric circuit breaker if accessible safely. Move to highest solid structure. Command center has been primed.';
    } else if (lower.includes('landslide') || lower.includes('road block') || lower.includes('debris') || lower.includes('pahad')) {
      disaster = 'landslide';
      count = 4;
      replyText =
        'Landslide & road blockage hazard identified. Do not attempt to drive through mud debris or unstable slopes. Stay away from retaining walls and report any fallen wires.';
    } else if (lower.includes('oxygen') || lower.includes('medical') || lower.includes('doctor')) {
      disaster = 'medical';
      urgency = 'CRITICAL';
      replyText =
        'Medical emergency recognized. Connecting to Dr. Sushila Tiwari Hospital Trauma Dispatch. Paramedic units carry portable oxygen and cardiac stabilization equipment.';
    } else {
      replyText =
        'Understood. For flash flood safety: Keep emergency radio / phone charged, preserve drinking water, stay on upper floors. Would you like to transmit an emergency dispatch beacon?';
    }

    const aiMsg: Message = {
      id: `AI-${Date.now()}`,
      sender: 'ai',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      extractedData: {
        disasterType: disaster,
        peopleAffected: count,
        urgency,
        actionRequired: 'Dispatch Swiftwater / Paramedic Team',
        locationNote: query.includes('Kathgodam') ? 'Kathgodam Gaula Corridor' : 'Haldwani Urban Sector',
      },
    };

    setTimeout(() => {
      setMessages((prev) => [...prev, aiMsg]);
      setPendingReportData({
        title: `Sahayak SOS: ${disaster.toUpperCase()} in ${aiMsg.extractedData?.locationNote || 'Haldwani'}`,
        disasterType: disaster,
        description: query,
        peopleAffected: count,
        address: aiMsg.extractedData?.locationNote || 'Kathgodam Riverside, Haldwani',
        location: { lat: 29.266, lng: 79.544 },
      });
    }, 600);
  };

  const handleConvertReport = () => {
    if (!pendingReportData) return;
    const res = submitIncidentReport(pendingReportData);
    setConvertedId(res.incident.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111C2E] border border-indigo-700/60 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100 flex flex-col h-[650px] max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#172337] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Bot className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <span>AI Sahayak (सहायक)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                  MULTILINGUAL NLP
                </span>
              </div>
              <div className="text-[11px] text-slate-400">English • हिन्दी (Hindi) • Kumaoni Assistance</div>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Prompt Buttons */}
        <div className="p-3 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-500 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Quick test:
          </span>
          {PRESET_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition"
            >
              "{q.slice(0, 32)}..."
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed space-y-2 ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-[#172337] border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <p>{m.text}</p>

                {/* Extracted NLP Entity Card */}
                {m.extractedData && (
                  <div className="p-2.5 rounded-xl bg-black/40 border border-indigo-500/30 space-y-1.5 text-[11px] text-slate-300">
                    <div className="font-bold text-indigo-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Extracted Disaster Telemetry:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 font-mono">
                      <div>Disaster: <strong className="text-white uppercase">{m.extractedData.disasterType}</strong></div>
                      <div>People: <strong className="text-white">{m.extractedData.peopleAffected}</strong></div>
                      <div>Urgency: <strong className="text-red-400">{m.extractedData.urgency}</strong></div>
                      <div>Location: <strong className="text-blue-300">{m.extractedData.locationNote}</strong></div>
                    </div>
                  </div>
                )}

                <div className="text-[10px] opacity-60 text-right">{m.timestamp}</div>
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Convert to Verified Report CTA (if active) */}
        {pendingReportData && (
          <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300">Convert conversational findings into official incident dispatch?</span>
            {convertedId ? (
              <span className="text-emerald-400 font-bold">✅ Logged as #{convertedId}</span>
            ) : (
              <button
                onClick={handleConvertReport}
                className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1"
              >
                <span>Transmit Incident</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-[#172337] border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type in English or Hindi (e.g. 'Kathgodam bypass me paani aa raha hai')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-[#111C2E] text-slate-100 placeholder-slate-500 px-4 py-2.5 rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-indigo-500"
          />

          <button
            onClick={() => handleSend()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
