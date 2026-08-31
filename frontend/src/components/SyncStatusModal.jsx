import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Layers } from 'lucide-react';

export default function SyncStatusModal({ isOpen, onClose, providers, syncStatuses, onTriggerSync, isSyncing }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl rounded-3xl glass-panel border border-slate-700/80 p-6 sm:p-8 relative shadow-2xl overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Estado de Proveedores & Sincronización
            </h3>
            <p className="text-xs text-slate-400">
              Arquitectura Strategy Multi-Catálogo (Jamendo, Seed Catalog, APIs Abiertas)
            </p>
          </div>
        </div>

        {/* Providers List */}
        <div className="space-y-4 mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Proveedores Conectados
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {providers && providers.length > 0 ? (
              providers.map((p, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-surfaceLight/80 border border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${p.available ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-500'}`} />
                    <span className="font-mono text-xs font-bold text-white">{p.name}</span>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    p.available ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {p.available ? 'Activo' : 'Inactivo / Opcional'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400">Cargando proveedores...</div>
            )}
          </div>
        </div>

        {/* Sync History Audit */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Últimas Sincronizaciones Registradas
          </h4>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {syncStatuses && syncStatuses.length > 0 ? (
              syncStatuses.map((status, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-surface/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-slate-200">{status.providerName}</span>
                      <span className="text-slate-400 text-[11px] block">
                        {status.lastSyncAt ? new Date(status.lastSyncAt).toLocaleTimeString() : 'Reciente'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-mono font-semibold">+{status.newlyAddedTracks || 0} pistas</span>
                    <span className="text-[10px] text-slate-400 block">{status.totalTracksSynced || 0} total</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 italic">No hay registros previos de sincronización.</div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Cloud Scheduler invoca automáticamente cada 10 min
          </span>

          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Forzar Sincronización'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
