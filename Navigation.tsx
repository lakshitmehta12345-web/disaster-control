import React, { useState } from 'react';
import {
  ShieldAlert,
  Map,
  Activity,
  TrendingUp,
  Camera,
  Boxes,
  MessageSquareText,
  FileBarChart,
  Radio,
  Sliders,
  Download,
  Bell,
  WifiOff,
  Wifi,
  ChevronDown,
  UserCheck,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useRescueGrid } from '../context/RescueGridContext';
import { UserRole } from '../types';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSimulationDrawer: () => void;
  onOpenZipModal: () => void;
  onOpenAssistantModal: () => void;
}

const ROLES: { role: UserRole; label: string; badge: string }[] = [
  { role: 'disaster_officer', label: 'Disaster Management Officer', badge: 'SDMA Lead' },
  { role: 'super_admin', label: 'Super Administrator', badge: 'DG Office' },
  { role: 'response_coordinator', label: 'Emergency Response Coordinator', badge: 'HQ Ops' },
  { role: 'rescue_leader', label: 'Rescue Team Leader', badge: 'NDRF Comms' },
  { role: 'medical_coordinator', label: 'Medical Coordinator', badge: 'Trauma Lead' },
  { role: 'logistics_coordinator', label: 'Logistics Coordinator', badge: 'Supply Lead' },
  { role: 'citizen', label: 'Citizen / Public User', badge: 'Public SOS' },
];

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenSimulationDrawer,
  onOpenZipModal,
  onOpenAssistantModal,
}) => {
  const {
    currentUser,
    setCurrentUserRole,
    notifications,
    markAllNotificationsRead,
    isOffline,
    setIsOffline,
    offlineQueue,
    isSimulationActive,
    waterLevelMeters,
  } = useRescueGrid();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { id: 'command', label: 'Command Center', icon: Activity },
    { id: 'map', label: 'GIS Disaster Map', icon: Map },
    { id: 'citizen_sos', label: 'Citizen SOS', icon: ShieldAlert, highlight: true },
    { id: 'prediction', label: 'AI Demand Prediction', icon: TrendingUp },
    { id: 'damage_ai', label: 'Damage Vision AI', icon: Camera },
    { id: 'inventory', label: 'Resource Inventory', icon: Boxes },
    { id: 'analytics', label: 'Analytics & Audit', icon: FileBarChart },
    { id: 'landing', label: 'Public Portal', icon: Radio },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B1220]/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Notification / Scenario Ticker Bar */}
      <div className="bg-slate-900/90 px-4 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            LIVE SIMULATION
          </span>
          <span className="text-slate-400">Scenario:</span>
          <span className="font-semibold text-slate-200">Major Flood &amp; Landslide Emergency — Haldwani, Uttarakhand</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Gaula Gauge:</span>
          <span className="font-mono text-cyan-400 font-bold">{waterLevelMeters.toFixed(2)}m</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition ${
              isOffline ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'hover:text-slate-200'
            }`}
            title="Toggle simulated offline network connectivity"
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isOffline ? `Offline (${offlineQueue.length} queued)` : 'Network Online'}</span>
          </button>

          <button
            onClick={onOpenZipModal}
            className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium transition"
            title="Download full project source code zip"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download ZIP</span>
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('command')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-red-600 p-0.5 shadow-lg shadow-blue-900/30">
            <div className="w-full h-full bg-[#0B1220] rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                RESCUEGRID
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60 font-semibold">
                v2.5 AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Intelligent Disaster Intelligence &amp; Emergency Response</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/70 p-1 rounded-xl border border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : item.highlight
                    ? 'text-red-400 hover:text-red-300 hover:bg-red-950/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${item.highlight && !isActive ? 'text-red-400' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Multilingual Assistant button */}
          <button
            onClick={onOpenAssistantModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/50 transition"
            title="Open Multilingual AI Emergency Assistant (English / Hindi)"
          >
            <MessageSquareText className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">AI Sahayak (Hindi/En)</span>
          </button>

          {/* Simulation Controls Trigger */}
          <button
            onClick={onOpenSimulationDrawer}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition shadow-sm"
            title="Open Disaster Simulation Triggers &amp; Control Panel"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Simulation Hub</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
              aria-label="Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#111C2E] border border-slate-700 rounded-xl shadow-2xl z-50 p-3">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-400" />
                    <span>Real-Time Operation Alerts</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-blue-400 hover:text-blue-300"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 text-xs">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg border transition ${
                        n.level === 'critical'
                          ? 'bg-red-950/30 border-red-800/50 text-red-200'
                          : n.level === 'warning'
                          ? 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                          : 'bg-slate-800/40 border-slate-700/50 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-left transition"
            >
              <div className="w-6 h-6 rounded-md bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-semibold text-slate-200 text-xs leading-none">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 capitalize">{currentUser.role.replace('_', ' ')}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#111C2E] border border-slate-700 rounded-xl shadow-2xl z-50 p-2 text-xs">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                  Switch Operational Role
                </div>
                {ROLES.map((r) => {
                  const isCurrent = currentUser.role === r.role;
                  return (
                    <button
                      key={r.role}
                      onClick={() => {
                        setCurrentUserRole(r.role);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition ${
                        isCurrent
                          ? 'bg-blue-600 text-white font-medium'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{r.label}</div>
                        <div className={`text-[10px] ${isCurrent ? 'text-blue-100' : 'text-slate-500'}`}>{r.badge}</div>
                      </div>
                      {isCurrent && <CheckCircle className="w-4 h-4 text-white" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Scroller */}
      <div className="lg:hidden px-3 py-1.5 overflow-x-auto flex gap-1 border-t border-slate-800/80 bg-slate-900/60">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : item.highlight
                  ? 'text-red-400 bg-red-950/30'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
