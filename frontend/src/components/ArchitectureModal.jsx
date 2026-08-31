import React from 'react';
import { X, Layers, Cpu, Cloud, Brain, Shield, Clock, Zap, CheckCircle2 } from 'lucide-react';

export default function ArchitectureModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel border border-slate-700/80 p-6 sm:p-8 relative shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Layers className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              Arquitectura Técnica & Portfolio Defense
            </h3>
            <p className="text-xs text-slate-400">
              Justificaciones de diseño, patrones de ingeniería y stack Serverless en Google Cloud Platform
            </p>
          </div>
        </div>

        {/* Stack Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-surfaceLight border border-slate-700/60">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase mb-1">
              <Cpu className="w-4 h-4" /> Java 21 & Spring Boot 3
            </div>
            <p className="text-xs text-slate-300">
              <strong>Monolito Modular</strong> empaquetado en contenedor ligero con Java 21, eliminando cold starts repetidos y sobrecarga de memoria.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surfaceLight border border-slate-700/60">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase mb-1">
              <Cloud className="w-4 h-4" /> GCP Cloud Run
            </div>
            <p className="text-xs text-slate-300">
              Escalado automático a <strong>cero instancias</strong> en reposo ($0.00 costo) y alta disponibilidad sin mantenimiento de servidores.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surfaceLight border border-slate-700/60">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase mb-1">
              <Brain className="w-4 h-4" /> Gemini AI Engine
            </div>
            <p className="text-xs text-slate-300">
              Razonamiento heurístico en 3 tiers (Underground, Growing, Popular) para rescatar joyas ocultas con <em>Explainable AI</em>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surfaceLight border border-slate-700/60">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase mb-1">
              <Zap className="w-4 h-4" /> Cloud Firestore NoSQL
            </div>
            <p className="text-xs text-slate-300">
              Persistencia atómica y distribuida para metadatos de pistas, eventos de escucha y checkpoints de sincronización.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surfaceLight border border-slate-700/60">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase mb-1">
              <Shield className="w-4 h-4" /> Secret Manager
            </div>
            <p className="text-xs text-slate-300">
              Gestión segura de API keys (Gemini, Jamendo) inyectadas en tiempo de ejecución, cumpliendo directivas OWASP.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surfaceLight border border-slate-700/60">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase mb-1">
              <Clock className="w-4 h-4" /> Cloud Scheduler
            </div>
            <p className="text-xs text-slate-300">
              Trigger automático cada 10 minutos con token OIDC para orquestar la sincronización multi-fuente sin procesos huérfanos.
            </p>
          </div>
        </div>

        {/* Key Interview Questions Accordion */}
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            Preguntas Clave para Entrevistas Técnicas
          </h4>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-surface/90 border border-slate-800">
              <h5 className="text-xs font-bold text-indigo-300 mb-1">
                ¿Por qué un Monolito Modular en vez de Microservicios distribuidos?
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                Para esta escala, crear 4 microservicios multiplicaría el consumo de memoria de la JVM (150MB por contenedor), generaría latencia de red entre servicios y riesgo de salir del Free Tier de GCP. Un Monolito Modular optimiza los recursos de Cloud Run a costo cero real, mientras mantiene los dominios desacoplados mediante interfaces (como <code>MusicCatalogProvider</code>), listos para migrar a microservicios si el volumen de negocio lo requiriese.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface/90 border border-slate-800">
              <h5 className="text-xs font-bold text-indigo-300 mb-1">
                ¿Cómo se garantizó la extensibilidad para sumar nuevas APIs de música a futuro?
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                Aplicando el <strong>Principio Abierto/Cerrado (OCP)</strong> de SOLID mediante el patrón <strong>Strategy</strong> y un <strong>Registry dinámico</strong>. Para sumar una nueva plataforma (ej. Free Music Archive o Audius), sólo se implementa la interfaz <code>MusicCatalogProvider</code>; Spring la detecta e incorpora automáticamente sin tocar el orquestador de sincronización ni la base de datos.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface/90 border border-slate-800">
              <h5 className="text-xs font-bold text-indigo-300 mb-1">
                ¿Cómo funciona la resiliencia si una API externa o Gemini fallan?
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                El orquestador aísla los fallos por proveedor y registra el incidente en Cloud Logging sin tirar el sistema. Si Gemini no está disponible o no hay API key, el servicio activa un <strong>motor heurístico inteligente de fallback</strong> que analiza las desviaciones estándar de escuchas para ofrecer recomendaciones fundamentadas sin interrumpir la experiencia del usuario.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-slate-800 text-xs text-slate-400">
          Proyecto preparado con estándares Enterprise para Portfolio de Ingeniería Java & Cloud GCP.
        </div>

      </div>
    </div>
  );
}
