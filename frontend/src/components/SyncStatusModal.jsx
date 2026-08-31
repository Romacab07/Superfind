import React from 'react';
import { X, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';

export default function SyncStatusModal({ isOpen, onClose, providers, syncStatuses, onTriggerSync, isSyncing }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl bg-white/95 border border-slate-200/90 p-5 sm:p-8 relative shadow-2xl backdrop-blur-2xl text-slate-800">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
              Fuentes de Catálogo & Sincronización
            </h3>
            <p className="text-xs text-slate-500">
              Estado de las plataformas de música abierta y sincronizaciones
            </p>
          </div>
        </div>

        {/* Providers List */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Fuentes de Música Conectadas
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {providers && providers.length > 0 ? (
              providers.map((p, idx) => (
                <div key={idx} className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${p.available ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-400'}`} />
                    <span className="font-mono text-xs font-bold text-slate-800">{p.name}</span>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    p.available ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {p.available ? 'Activo' : 'Opcional'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500">Cargando fuentes disponibles...</div>
            )}
          </div>
        </div>

        {/* Sync History Audit */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">
            Últimas Sincronizaciones
          </h4>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {syncStatuses && syncStatuses.length > 0 ? (
              syncStatuses.map((status, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs shadow-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">{status.providerName}</span>
                      <span className="text-slate-500 text-[11px] block">
                        {status.lastSyncAt ? new Date(status.lastSyncAt).toLocaleTimeString() : 'Reciente'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-700 font-mono font-semibold">+{status.newlyAddedTracks || 0} pistas</span>
                    <span className="text-[10px] text-slate-500 block">{status.totalTracksSynced || 0} total</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic">No hay registros previos de sincronización.</div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            Sincronización periódica automática
          </span>

          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Catálogo Ahora'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
