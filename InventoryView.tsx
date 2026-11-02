import React, { useState } from 'react';
import {
  Boxes,
  Truck,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Plus,
  RefreshCw,
  Send,
  Building,
  ShieldCheck,
} from 'lucide-react';
import { useRescueGrid } from '../context/RescueGridContext';
import { auditInventoryShortages } from '../utils/inventoryEngine';

export const InventoryView: React.FC = () => {
  const { warehouses, shelters, dispatchResource } = useRescueGrid();

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(warehouses[0]?.id || 'WH-CENTRAL-01');
  const [dispatchItemKey, setDispatchItemKey] = useState<string>('water_bottles');
  const [dispatchQuantity, setDispatchQuantity] = useState<number>(50);
  const [dispatchDestination, setDispatchDestination] = useState<string>('Indira Gandhi Stadium Shelter');
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  const selectedWarehouse = warehouses.find((w) => w.id === selectedWarehouseId) || warehouses[0];
  const { alerts, totalStockSummary } = auditInventoryShortages(warehouses, shelters);

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    setDispatchSuccessMsg(null);
    const success = dispatchResource(selectedWarehouseId, dispatchItemKey, Number(dispatchQuantity), dispatchDestination);
    if (success) {
      setDispatchSuccessMsg(`Dispatched ${dispatchQuantity} units of ${selectedWarehouse.resources[dispatchItemKey]?.name} to ${dispatchDestination}.`);
      setDispatchQuantity(20);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">LOGISTICS &amp; RESOURCE INVENTORY</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              SUPPLY CHAIN HQ
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time warehouse stockpiles, automated shortage rebalancing, and shelter ration replenishment.
          </p>
        </div>
      </div>

      {/* Shortage Alerts Banner (if any) */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                alert.severity === 'critical'
                  ? 'bg-red-950/30 border-red-800/60 text-red-300'
                  : 'bg-amber-950/30 border-amber-800/60 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div>
                  <div className="font-bold text-sm">
                    {alert.warehouseName}: Low Stock on {alert.resourceName}
                  </div>
                  <div className="text-[11px] opacity-90 mt-0.5">
                    Current Available: <strong>{alert.available}</strong> (Threshold: {alert.minThreshold})
                  </div>
                </div>
              </div>

              {alert.recommendedTransferFromWarehouseId && (
                <div className="text-[11px] bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                  Recommended Transfer: <strong>+{alert.recommendedTransferAmount} units</strong> from Central Logistics Hub
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Global Resource Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(totalStockSummary).map(([key, item]) => (
          <div key={key} className="p-3.5 rounded-xl bg-[#172337] border border-slate-800 shadow">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
              {key.replace('_', ' ')}
            </div>
            <div className="text-xl font-black text-white font-mono mt-1">
              {item.available.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {item.reserved} reserved ({item.unit})
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Warehouse Browser & Dispatch Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Warehouse Stockpile Inspector */}
        <div className="lg:col-span-7 space-y-4">
          {/* Warehouse Selector Tabs */}
          <div className="flex gap-2 border-b border-slate-800 pb-2">
            {warehouses.map((wh) => (
              <button
                key={wh.id}
                onClick={() => setSelectedWarehouseId(wh.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  selectedWarehouseId === wh.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-[#111C2E] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>{wh.name.split(' ')[0]} Hub</span>
              </button>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-[#111C2E] border border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">{selectedWarehouse.name}</h3>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Capacity: {selectedWarehouse.capacityMetricTons} MT • Utilization:{' '}
                  <strong className="text-blue-400">{selectedWarehouse.currentUtilizationPercent}%</strong>
                </div>
              </div>
              <span className="font-mono text-slate-400 text-xs">{selectedWarehouse.id}</span>
            </div>

            {/* Inventory table */}
            <div className="space-y-2">
              {Object.entries(selectedWarehouse.resources).map(([resKey, res]) => {
                const isLow = res.available <= res.minThreshold;
                return (
                  <div
                    key={resKey}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                      isLow ? 'bg-red-950/20 border-red-900/50' : 'bg-[#172337] border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{res.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        Category: {res.category.replace('_', ' ')} • Min Buffer: {res.minThreshold} {res.unit}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-mono text-base font-black ${isLow ? 'text-red-400' : 'text-emerald-400'}`}>
                        {res.available.toLocaleString()} <span className="text-xs font-normal text-slate-400">{res.unit}</span>
                      </div>
                      {isLow && (
                        <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
                          LOW STOCK ALERT
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Dispatch Simulator */}
        <div className="lg:col-span-5 space-y-4 text-xs">
          <div className="p-5 rounded-2xl bg-[#111C2E] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-400" />
                <span>Dispatch / Consignment Simulator</span>
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">Guaranteed Non-Negative</span>
            </div>

            {dispatchSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 font-semibold">
                ✅ {dispatchSuccessMsg}
              </div>
            )}

            <form onSubmit={handleDispatch} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Source Depot</label>
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  className="w-full bg-[#172337] px-3 py-2 rounded-xl border border-slate-700 text-slate-100"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Resource Commodity</label>
                <select
                  value={dispatchItemKey}
                  onChange={(e) => setDispatchItemKey(e.target.value)}
                  className="w-full bg-[#172337] px-3 py-2 rounded-xl border border-slate-700 text-slate-100"
                >
                  {Object.entries(selectedWarehouse.resources).map(([k, item]) => (
                    <option key={k} value={k}>
                      {item.name} ({item.available} {item.unit} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Quantity to Release</label>
                <input
                  type="number"
                  min="1"
                  max={selectedWarehouse.resources[dispatchItemKey]?.available || 100}
                  value={dispatchQuantity}
                  onChange={(e) => setDispatchQuantity(Number(e.target.value))}
                  className="w-full bg-[#172337] px-3 py-2 rounded-xl border border-slate-700 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Destination Facility / Shelter</label>
                <select
                  value={dispatchDestination}
                  onChange={(e) => setDispatchDestination(e.target.value)}
                  className="w-full bg-[#172337] px-3 py-2 rounded-xl border border-slate-700 text-slate-100"
                >
                  {shelters.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.availableSpots} spots open)
                    </option>
                  ))}
                  <option value="Gaula Riverside Staging Post">Gaula Riverside Staging Post</option>
                  <option value="Damuadhunga Base Camp">Damuadhunga Base Camp</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition mt-2"
              >
                Execute Inventory Transfer
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
