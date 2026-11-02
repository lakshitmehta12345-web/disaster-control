import React, { useState, useEffect } from 'react';
import { RescueGridProvider, useRescueGrid } from './context/RescueGridContext';
import { Navigation } from './components/Navigation';
import { LandingPage } from './components/LandingPage';
import { CommandCenter } from './components/CommandCenter';
import { GisMap } from './components/GisMap';
import { CitizenSosView } from './components/CitizenSosView';
import { DemandPredictionView } from './components/DemandPredictionView';
import { DamageDetectionView } from './components/DamageDetectionView';
import { InventoryView } from './components/InventoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { TeamAllocationModal } from './components/TeamAllocationModal';
import { SimulationControlPanel } from './components/SimulationControlPanel';
import { MultilingualAssistantModal } from './components/MultilingualAssistantModal';
import { ZipDownloadModal } from './components/ZipDownloadModal';
import { IncidentReport } from './types';

function AppContent() {
  const { selectedIncident, setSelectedIncident } = useRescueGrid();

  const [activeTab, setActiveTab] = useState<string>('command');
  const [isSimulationDrawerOpen, setIsSimulationDrawerOpen] = useState(false);
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [focusedIncidentOnMap, setFocusedIncidentOnMap] = useState<IncidentReport | null>(null);

  // Check URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

  const handleOpenIncidentDetail = (incident: IncidentReport) => {
    setSelectedIncident(incident);
  };

  const handleNavigateToMap = (incident?: IncidentReport) => {
    if (incident) {
      setFocusedIncidentOnMap(incident);
    }
    setActiveTab('map');
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#F8FAFC] flex flex-col font-sans">
      {/* Top Command Bar & Global Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSimulationDrawer={() => setIsSimulationDrawerOpen(true)}
        onOpenZipModal={() => setIsZipModalOpen(true)}
        onOpenAssistantModal={() => setIsAssistantModalOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            onExploreCommand={() => setActiveTab('command')}
            onReportEmergency={() => setActiveTab('citizen_sos')}
            onOpenZipModal={() => setIsZipModalOpen(true)}
            onExploreTech={() => setActiveTab('prediction')}
          />
        )}

        {activeTab === 'command' && (
          <CommandCenter
            onOpenIncidentDetail={handleOpenIncidentDetail}
            onNavigateToMap={handleNavigateToMap}
            onOpenSimulationDrawer={() => setIsSimulationDrawerOpen(true)}
          />
        )}

        {activeTab === 'map' && (
          <GisMap
            onOpenIncidentDetail={handleOpenIncidentDetail}
            focusedIncident={focusedIncidentOnMap}
          />
        )}

        {activeTab === 'citizen_sos' && <CitizenSosView />}

        {activeTab === 'prediction' && <DemandPredictionView />}

        {activeTab === 'damage_ai' && <DamageDetectionView />}

        {activeTab === 'inventory' && <InventoryView />}

        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Explainable AI Team Allocation Modal */}
      {selectedIncident && (
        <TeamAllocationModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onOpenMap={(inc) => {
            setSelectedIncident(null);
            handleNavigateToMap(inc);
          }}
        />
      )}

      {/* Simulation Control Drawer */}
      <SimulationControlPanel
        isOpen={isSimulationDrawerOpen}
        onClose={() => setIsSimulationDrawerOpen(false)}
      />

      {/* Multilingual AI Assistant Modal */}
      <MultilingualAssistantModal
        isOpen={isAssistantModalOpen}
        onClose={() => setIsAssistantModalOpen(false)}
      />

      {/* Project Source Code ZIP Exporter Modal */}
      <ZipDownloadModal
        isOpen={isZipModalOpen}
        onClose={() => setIsZipModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <RescueGridProvider>
      <AppContent />
    </RescueGridProvider>
  );
}
