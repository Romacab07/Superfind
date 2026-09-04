import React from 'react';
import { X, Layers, Cpu, Cloud, Brain, Shield, Clock, Zap, CheckCircle2 } from 'lucide-react';

/**
 * ArchitectureModal - Technical portfolio modal with soap bubble glass aesthetic
 */
export default function ArchitectureModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-[32px] bubble-surface p-5 sm:p-8 relative shadow-2xl text-slate-800 dark:text-slate-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bubble-pill text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pr-8">
          <div className="w-11 h-11 rounded-2xl bubble-surface flex items-center justify-center flex-shrink-0 shadow-sm">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div className="bubble-gleam" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-display">
              Arquitectura Técnica & Portfolio Defense
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Diseño de sistemas, patrones de ingeniería y stack Serverless en Google Cloud Platform
            </p>
          </div>
        </div>

        {/* Stack Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="p-4 rounded-2xl bubble-pill">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase mb-1">
              <Cpu className="w-4 h-4 flex-shrink-0" /> Java 21 & Spring Boot 3
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              <strong>Monolito Modular</strong> empaquetado en contenedor ligero con Java 21, optimizando rendimiento y memoria.
            </p>
          </div>

          <div className="p-4 rounded-2xl bubble-pill">
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase mb-1">
              <Cloud className="w-4 h-4 flex-shrink-0" /> GCP Cloud Run
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Escalado automático a <strong>cero instancias</strong> en reposo ($0.00 costo) y alta disponibilidad sin servidores fijos.
            </p>
          </div>

          <div className="p-4 rounded-2xl bubble-pill">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase mb-1">
              <Brain className="w-4 h-4 flex-shrink-0" /> Gemini AI Engine
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Curaduría por tiers de tracción para rescatar gemas ocultas y nuevos artistas con <em>Explainable AI</em>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bubble-pill">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase mb-1">
              <Zap className="w-4 h-4 flex-shrink-0" /> Cloud Firestore NoSQL
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Persistencia atómica y distribuida para catálogo, auditoría de eventos de escucha y checkpoints de sincronización.
            </p>
          </div>

          <div className="p-4 rounded-2xl bubble-pill">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase mb-1">
              <Shield className="w-4 h-4 flex-shrink-0" /> Secret Manager
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Gestión segura de API keys inyectadas en tiempo de ejecución sin credenciales en código ni repositorios.
            </p>
          </div>

          <div className="p-4 rounded-2xl bubble-pill">
            <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 text-xs font-bold uppercase mb-1">
              <Clock className="w-4 h-4 flex-shrink-0" /> Cloud Scheduler
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Trigger programado cada 10 minutos con token OIDC para orquestar la sincronización multi-fuente de forma desacoplada.
            </p>
          </div>
        </div>

        {/* Key Interview Questions Accordion */}
        <div className="space-y-3.5 mb-6">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            Preguntas Clave para Entrevistas Técnicas
          </h4>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bubble-pill">
              <h5 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                ¿Por qué un Monolito Modular en vez de Microservicios distribuidos?
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Para esta escala, crear 4 microservicios multiplicaría el consumo de memoria JVM, generaría latencia de red entre servicios y riesgo de salir del Free Tier de GCP. Un Monolito Modular optimiza los recursos de Cloud Run a costo cero real, mientras mantiene los dominios desacoplados mediante interfaces (como <code>MusicCatalogProvider</code>), listos para migrar a microservicios si el volumen lo requiriese.
              </p>
            </div>

            <div className="p-4 rounded-2xl bubble-pill">
              <h5 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                ¿Cómo se garantizó la extensibilidad para sumar nuevas APIs de música a futuro?
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Aplicando el <strong>Principio Abierto/Cerrado (OCP)</strong> mediante el patrón <strong>Strategy</strong> y un <strong>Registry dinámico</strong>. Para sumar una nueva plataforma (ej. Free Music Archive o Audius), sólo se implementa la interfaz <code>MusicCatalogProvider</code>; Spring la detecta e incorpora automáticamente sin tocar el orquestador ni el modelo de datos.
              </p>
            </div>

            <div className="p-4 rounded-2xl bubble-pill">
              <h5 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                ¿Cómo funciona la resiliencia si una API externa o Gemini fallan?
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                El orquestador aísla los fallos por proveedor y registra el incidente en Cloud Logging sin tirar el sistema. Si Gemini no está disponible o no hay API key, el servicio activa un <strong>motor heurístico inteligente de fallback</strong> que analiza las desviaciones estándar de escuchas para ofrecer recomendaciones fundamentadas sin interrumpir la experiencia.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-slate-200/50 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          Proyecto preparado con estándares Enterprise para Portfolio de Ingeniería Java & Cloud GCP.
        </div>

      </div>
    </div>
  );
}
