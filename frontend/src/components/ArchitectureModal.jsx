import React from 'react';
import { X, Layers, Cpu, Cloud, Brain, Shield, Clock, Zap, CheckCircle2 } from 'lucide-react';

export default function ArchitectureModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-3xl bg-white/95 border border-slate-200/90 p-5 sm:p-8 relative shadow-2xl backdrop-blur-2xl text-slate-800">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
              Arquitectura Técnica & Portfolio Defense
            </h3>
            <p className="text-xs text-slate-500">
              Diseño de sistemas, patrones de ingeniería y stack Serverless en Google Cloud Platform
            </p>
          </div>
        </div>

        {/* Stack Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase mb-1">
              <Cpu className="w-4 h-4 flex-shrink-0" /> Java 21 & Spring Boot 3
            </div>
            <p className="text-xs text-slate-600">
              <strong>Monolito Modular</strong> empaquetado en contenedor ligero con Java 21, optimizando rendimiento y memoria.
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
            <div className="flex items-center gap-2 text-cyan-700 text-xs font-bold uppercase mb-1">
              <Cloud className="w-4 h-4 flex-shrink-0" /> GCP Cloud Run
            </div>
            <p className="text-xs text-slate-600">
              Escalado automático a <strong>cero instancias</strong> en reposo ($0.00 costo) y alta disponibilidad sin servidores fijos.
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
            <div className="flex items-center gap-2 text-purple-700 text-xs font-bold uppercase mb-1">
              <Brain className="w-4 h-4 flex-shrink-0" /> Gemini AI Engine
            </div>
            <p className="text-xs text-slate-600">
              Curaduría por tiers de tracción para rescatar gemas ocultas y nuevos artistas con <em>Explainable AI</em>.
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase mb-1">
              <Zap className="w-4 h-4 flex-shrink-0" /> Cloud Firestore NoSQL
            </div>
            <p className="text-xs text-slate-600">
              Persistencia atómica y distribuida para catálogo, auditoría de eventos de escucha y checkpoints de sincronización.
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase mb-1">
              <Shield className="w-4 h-4 flex-shrink-0" /> Secret Manager
            </div>
            <p className="text-xs text-slate-600">
              Gestión segura de API keys inyectadas en tiempo de ejecución sin credenciales en código ni repositorios.
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
            <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase mb-1">
              <Clock className="w-4 h-4 flex-shrink-0" /> Cloud Scheduler
            </div>
            <p className="text-xs text-slate-600">
              Trigger programado cada 10 minutos con token OIDC para orquestar la sincronización multi-fuente de forma desacoplada.
            </p>
          </div>
        </div>

        {/* Key Interview Questions Accordion */}
        <div className="space-y-3.5 mb-6">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            Preguntas Clave para Entrevistas Técnicas
          </h4>

          <div className="space-y-3">
            <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
              <h5 className="text-xs font-bold text-indigo-700 mb-1">
                ¿Por qué un Monolito Modular en vez de Microservicios distribuidos?
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                Para esta escala, crear 4 microservicios multiplicaría el consumo de memoria JVM, generaría latencia de red entre servicios y riesgo de salir del Free Tier de GCP. Un Monolito Modular optimiza los recursos de Cloud Run a costo cero real, mientras mantiene los dominios desacoplados mediante interfaces (como <code>MusicCatalogProvider</code>), listos para migrar a microservicios si el volumen lo requiriese.
              </p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
              <h5 className="text-xs font-bold text-indigo-700 mb-1">
                ¿Cómo se garantizó la extensibilidad para sumar nuevas APIs de música a futuro?
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aplicando el <strong>Principio Abierto/Cerrado (OCP)</strong> mediante el patrón <strong>Strategy</strong> y un <strong>Registry dinámico</strong>. Para sumar una nueva plataforma (ej. Free Music Archive o Audius), sólo se implementa la interfaz <code>MusicCatalogProvider</code>; Spring la detecta e incorpora automáticamente sin tocar el orquestador ni el modelo de datos.
              </p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
              <h5 className="text-xs font-bold text-indigo-700 mb-1">
                ¿Cómo funciona la resiliencia si una API externa o Gemini fallan?
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                El orquestador aísla los fallos por proveedor y registra el incidente en Cloud Logging sin tirar el sistema. Si Gemini no está disponible o no hay API key, el servicio activa un <strong>motor heurístico inteligente de fallback</strong> que analiza las desviaciones estándar de escuchas para ofrecer recomendaciones fundamentadas sin interrumpir la experiencia.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-slate-200 text-xs text-slate-500">
          Proyecto preparado con estándares Enterprise para Portfolio de Ingeniería Java & Cloud GCP.
        </div>

      </div>
    </div>
  );
}
