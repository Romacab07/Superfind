# FASE 2: PARTE 2 — Interacción, Pop Experience, Física y Ciclo de Vida Dinámico

Una vez aprobada la Fase 1, se procederá con la evolución de la experiencia principal de SuperFind.

**Objetivo de esta fase**: Transformar el mapa de canciones en una experiencia física de pompas de jabón: las burbujas deben sentirse individuales, flotantes, conectadas y con profundidad, reaccionando de forma orgánica al usuario. La pantalla principal estará enfocada inicialmente en **Top Songs**; la arquitectura visual y física debe quedar preparada para recibir una cantidad mucho mayor de canciones cuando exista integración con la API y para permitir posteriormente navegar entre categorías mediante slide/swipe.

---

## 2.0 Pantalla Principal — Top Songs como Experiencia Base

La primera implementación de esta fase debe tomar **Top Songs** como la categoría principal visible del mapa.

### Composición Inicial
* Mostrar un conjunto inicial de canciones como una constelación de pompas, evitando una grilla rígida o distribución perfectamente simétrica.
* La composición debe sentirse orgánica y ligeramente impredecible, pero mantener una jerarquía visual clara.
* La burbuja de la canción actualmente reproducida debe ser visualmente dominante.
* Las demás burbujas deben conservar suficiente separación para poder identificarlas y seleccionarlas individualmente.
* Permitir pequeñas intersecciones/roces visuales entre burbujas cuando la física las acerque, sin convertir el mapa en una masa ilegible.
* Reservar espacio visual suficiente para que puedan incorporarse más canciones posteriormente sin rediseñar el sistema.
* La cantidad de burbujas visible debe adaptarse al viewport y a la densidad disponible, priorizando legibilidad sobre cantidad.

### Escalabilidad hacia la API
* El sistema no debe depender de una cantidad fija de canciones.
* El layout debe aceptar dinámicamente nuevos `track.id`.
* Las posiciones iniciales deben generarse mediante un sistema de distribución orgánica, no mediante coordenadas hardcodeadas por canción.
* Al aumentar la cantidad de tracks, las nuevas burbujas deben incorporarse progresivamente a la constelación sin provocar saltos bruscos en las existentes.
* Debe existir un límite visual razonable de densidad por viewport; las canciones adicionales pueden quedar fuera del área inmediata o incorporarse mediante navegación/slide.
* La identidad de cada track debe mantenerse estable durante re-renderizados, cambios de categoría y reorganizaciones físicas.

### Preparación para Categorías Futuras
Aunque esta fase se centra en Top Songs, la arquitectura debe prepararse para futuras categorías como:
* Top 24h
* Novedades
* Sugeridos IA
* Todas las burbujas
* Otras categorías provenientes de la API

La navegación futura entre categorías mediante slide/swipe horizontal debe poder cambiar el conjunto de canciones mostrado sin romper el sistema de física. El cambio de categoría debe sentirse como una transición de una masa de pompas a otra, no como un cambio instantáneo de página.

---

## 2.1 Sistema Físico de Pompas — Matter.js + Three.js

La física debe dejar de percibirse como una colección de círculos posicionados y pasar a comportarse como un sistema de pompas independientes.

### Comportamiento Base
Cada burbuja debe tener:
* Un cuerpo físico propio en **Matter.js**.
* Una representación visual propia en **Three.js**.
* Un ancla lógica asociada a su posición ideal dentro de la composición.
* Un radio/tamaño propio.
* Una masa y comportamiento físico coherentes con su tamaño.
* Una profundidad visual independiente.
* Un `track.id` estable como identidad principal.

### Principios de Movimiento
Las pompas deben:
* Flotar lentamente.
* Tener micro-oscilaciones orgánicas.
* Separarse suavemente cuando se acercan demasiado.
* Poder rozarse y desplazarse entre sí.
* Reacomodarse después de una interacción.
* Evitar movimientos completamente circulares o repetitivos.
* Evitar que todas las burbujas se muevan al mismo tiempo de forma sincronizada.
* Mantener una sensación de flotabilidad, no de partículas rígidas.

> [!NOTE]
> La física debe ser sutil. El objetivo no es crear un simulador físico agresivo, sino una interfaz musical que se sienta viva.

### Sistema de Anclas
* Cada burbuja tendrá una posición objetivo o *anchor*.
* La física debe permitir desviaciones temporales respecto de esa posición:
  $$\text{anchor} \longrightarrow \text{interacción/fuerza} \longrightarrow \text{desplazamiento} \longrightarrow \text{amortiguación} \longrightarrow \text{retorno orgánico}$$
* Las anclas no deben actuar como posiciones rígidas.
* El retorno debe utilizar fuerzas/resortes amortiguados para conservar inercia y evitar teletransportes.

---

## 2.2 Espaciado y Composición Orgánica

La composición debe resolver simultáneamente: legibilidad, jerarquía, profundidad, densidad, movimiento y escalabilidad.

### Distribución Inicial
* No utilizar una grilla uniforme ni una simetría perfecta.
* Priorizar distribución radial/orgánica, variaciones de tamaño, pequeñas diferencias de profundidad, separaciones irregulares, agrupaciones naturales y espacios negativos alrededor de la burbuja protagonista.
* La composición debe parecer una agrupación de pompas que se encontró físicamente, no elementos colocados manualmente en una UI tradicional.

### Prevención de Solapamiento Excesivo
Las burbujas pueden tocarse o solaparse ligeramente, pero no deben:
* Ocultar permanentemente títulos.
* Cubrir completamente otras canciones.
* Formar una masa imposible de seleccionar.
* Generar colisiones violentas.
* Saltar continuamente de posición.
* Implementar una distancia mínima suave mediante fuerzas de separación y no mediante correcciones instantáneas de coordenadas.

### Reorganización Dinámica
Cuando una burbuja cambia de posición, las vecinas deben reaccionar:
$$\text{usuario interactúa} \longrightarrow \text{burbuja se desplaza} \longrightarrow \text{vecinas reciben fuerzas} \longrightarrow \text{grupo se reacomoda} \longrightarrow \text{sistema recupera equilibrio}$$
* No reposicionar individualmente cada burbuja mediante CSS o coordenadas absolutas después de cada interacción.

---

## 2.3 Profundidad Visual y Jerarquía de la Burbuja Activa

La profundidad debe ser perceptible sin convertir el mapa en un espacio 3D complejo.

### Profundidad
Cada burbuja debe tener pequeñas diferencias en:
* Escala.
* Opacidad.
* Intensidad del highlight.
* Blur/reflexión.
* Z-index / render order.
* Posición visual en profundidad.
* Las burbujas cercanas al usuario deben sentirse ligeramente más presentes.

### Burbuja en Reproducción
La canción actualmente reproducida debe ser el punto focal del mapa y distinguirse mediante una combinación sutil de:
* Mayor escala.
* Mayor claridad del contenido.
* Highlight especular más definido.
* Glow/refracción ligeramente superior.
* Badge **EN REPRODUCCIÓN**.
* Waveform activo.
* Mayor profundidad visual.
* Movimiento ambiental ligeramente diferente.
* *No utilizar un tamaño exagerado que destruya la composición.*

### Regla de Unicidad
Solo una burbuja puede poseer simultáneamente:
* Badge **EN REPRODUCCIÓN**.
* Waveform activo.
* Estado visual de reproducción activa.
* **La fuente de verdad debe ser `currentTrack`, no estados locales duplicados por burbuja.**

---

## 2.4 Hover Físico Real en Matter.js + Shader

### Respuesta al Cursor
* Desplazamiento reactivo de la burbuja ante el cursor.
* Fuerza repulsiva sutil proporcional a la proximidad.
* La fuerza debe disminuir progresivamente con la distancia.
* Evitar saltos o desplazamientos bruscos.
* Las burbujas cercanas pueden reaccionar secundariamente a la perturbación.

### Shader
* **Al acercarse el cursor**:
  * Compresión leve de la membrana hacia el lado del cursor.
  * Desplazamiento ligero del highlight especular.
  * Distorsión/reflexión sutil de la superficie.
  * Aumento muy pequeño de tensión visual.
* **Al retirar el puntero**:
  * Retorno elástico.
  * Damping.
  * Oscilación armónica orgánica de corta duración.
* El efecto debe comunicar membrana de jabón, no un botón que cambia de escala.

---

## 2.5 Arrastre Libre de Burbujas — Drag & Drop Físico

### Interacción
* El usuario puede tomar cualquier burbuja con `mousedown`, `touchstart` o Pointer Events y arrastrarla libremente por el lienzo.
* **Durante el arrastre**:
  * El cuerpo de Matter.js debe seguir al puntero mediante una restricción/fuerza suave (`Matter.Constraint` o resorte suave).
  * Evitar setear rígidamente la posición cada frame.
  * Mantener inercia y respuesta física.
  * Las burbujas vecinas deben reaccionar a la perturbación.
  * La membrana debe deformarse ligeramente en la dirección del movimiento.

### Liberación
* Al soltar:
  * La burbuja conserva parte de la velocidad del gesto (throw/fling).
  * Después debe regresar gradualmente hacia su anchor.
  * Las vecinas deben reacomodarse por colisión, separación y fuerzas de retorno.

### Distinción Drag vs Tap
* **Tap/click**: interacción de selección que puede iniciar el Pop.
* **Drag**: movimiento superior a aproximadamente 6px.
* *Nunca detonar el Pop accidentalmente por comenzar un arrastre.*

### Mobile
* Soporte táctil completo con un dedo.
* Utilizar `touch-action` apropiadamente.
* `preventDefault()` únicamente cuando sea necesario sobre la interacción de la burbuja.
* No bloquear innecesariamente el scroll general de la página.

---

## 2.6 Movimiento Ambiental — Floating Bubble Loop

Además de la física de Matter.js, incorporar un movimiento ambiental de muy baja amplitud. Cada burbuja puede tener:
* Oscilación vertical mínima.
* Desplazamiento horizontal mínimo.
* Rotación/reflexión visual casi imperceptible.
* Variación temporal individual.
* Evitar utilizar exactamente el mismo `sin(time)` para todas las burbujas; usar offsets/fases independientes para que el conjunto parezca vivo.

> [!IMPORTANT]
> **Regla de Prioridad**: El movimiento ambiental nunca debe competir con hover, drag, selección, Pop, reorganización ni reproducción. La interacción del usuario tiene prioridad absoluta sobre el movimiento automático.

---

## 2.7 Secuencia de Soap Pop Coreografiada

El Pop representa la transición física de una canción del mapa hacia el reproductor.

* **Fase 1 — Pre-pop (100–180ms)**:
  * Aumento de tensión superficial.
  * Contracción leve de escala.
  * Contenido interno se densifica hacia el centro.
  * Highlight se concentra.
  * El movimiento de la burbuja disminuye brevemente.
* **Fase 2 — Expansión súbita**:
  * Escala aproximada de $1.00 \longrightarrow 1.28$.
  * Duración muy corta, sensación de acumulación y liberación de presión.
* **Fase 3 — Pop / ruptura de jabón**:
  * Destello de refracción.
  * Anillo de choque translúcido.
  * Dispersión de 12–16 microgotas (partículas de agua/jabón en Three.js con desvanecimiento alfa rápido).
  * Pequeños desplazamientos radiales.
  * **Cero fuego. Cero confeti.**
* **Fase 4 — Liberación de sonido**:
  * Los metadatos de la burbuja (título, artista, waveform e identidad visual relevante) se reducen y realizan una trayectoria curva interpolada mediante lerp/Bezier hacia el reproductor inferior.
  * La transición debe transmitir que la canción sale de la pompa y entra al player.

---

## 2.8 Sincronización del Player y Audio-reactividad

* Actualización atómica de `currentTrack`.
* Actualización coherente de `isPlaying`.
* Sincronización de metadatos y waveform.
* Evitar glitches de React y desincronizaciones de audio.
* Evitar estados intermedios donde dos canciones aparezcan simultáneamente como activas.
* **Audio-reactividad**:
  * Durante el Pop y reproducción, la amplitud visual puede responder moderadamente a la energía/volumen del track.
  * La respuesta debe ser sutil: no convertir la burbuja en un visualizador agresivo, manteniendo siempre la estética de pompa de jabón.

---

## 2.9 Eliminación Definitiva y Reorganización de Espuma en Matter.js

### Eliminación
Al finalizar el Pop:
* Remover el body de Matter.js.
* Remover el mesh y recursos correspondientes de Three.js.
* Eliminar listeners y referencias temporales asociadas.
* No ocultar mediante `display: none` ni dejar cuerpos invisibles activos en el mundo físico.

### Reorganización
$$\text{burbuja desaparece} \longrightarrow \text{espacio liberado} \longrightarrow \text{vecinas reaccionan} \longrightarrow \text{nuevas posiciones objetivo} \longrightarrow \text{equilibrio}$$
* Las burbujas restantes deben ocupar el espacio de manera natural mediante inercia, fuerzas de separación, resortes amortiguados, flotabilidad y anclas dinámicas.
* No realizar un re-layout instantáneo que provoque un salto visual.

---

## 2.10 Incorporación Progresiva de Nuevas Canciones

La arquitectura debe soportar el escenario donde la API entregue muchas más canciones que las visibles inicialmente:
* Crear su identidad estable.
* Asignar un anchor disponible.
* Crear body en Matter.js y mesh en Three.js.
* Incorporarlos progresivamente a la constelación sin desplazar violentamente las burbujas existentes.
* Mantener `currentTrack` intacto.
* Evitar duplicados por `track.id`.
* Si la cantidad de canciones supera la densidad razonable del viewport, utilizar la navegación por categorías/slide en lugar de comprimir indefinidamente todas las burbujas.

---

## 2.11 Navegación Futura por Categorías mediante Slide / Swipe

Esta funcionalidad se prepara arquitectónicamente en esta fase:
* El usuario podrá deslizar horizontalmente para pasar entre conjuntos de canciones:
  $$\text{Top Songs} \longrightarrow \text{Novedades} \longrightarrow \text{Sugeridos IA} \longrightarrow \text{Todas} \longrightarrow \dots$$
* La transición debe preservar la metáfora de burbujas: no debe sentirse como un cambio de pantalla A $\to$ B, sino como una transición física de una constelación de pompas a otra.
* **Requisitos de Arquitectura**:
  * Dataset desacoplado del motor físico.
  * Cambiar de categoría no debe romper las referencias `track.id`.
  * Reutilización de componentes/renderers.
  * Transición animada sin desmontar innecesariamente la escena Three.js.
  * Soporte para gesto táctil horizontal diferenciado del drag sobre una burbuja individual.
  * Categoría activa sincronizada con la navegación superior.

---

## 2.12 Registro de Tracks Consumidos e Identidad Estable

* Mantener `consumedTrackIds: Set<string>` en `sessionStorage` para:
  * Evitar que tracks explotados reaparezcan.
  * Mantener el estado al cambiar filtros/categorías.
  * Evitar reapariciones por re-renderizados o actualizaciones desde la API.
* **Mapeo estricto**:
  $$\text{track.id} \longrightarrow \text{bubble.id} \longrightarrow \text{Matter body} \longrightarrow \text{Three mesh}$$
  * No utilizar índices de array como identidad principal.

---

## 2.13 Fix — Unicidad de Estado "EN REPRODUCCIÓN"

* Validar que únicamente una burbuja pueda estar en estado de reproducción.
* La fuente de verdad debe ser `currentTrack.id`.
* Todas las burbujas deben derivar su estado visual de esa referencia única.
* Prevenir:
  * `isPlaying` duplicado localmente por burbuja.
  * Waveforms activos en más de una burbuja.
  * Badges "EN REPRODUCCIÓN" duplicados.
  * Estados obsoletos tras un Pop rápido o race conditions entre selección, Pop y player.

---

## 2.14 Mobile & Accesibilidad

* **Touch**: Tap-to-pop, drag con un dedo, swipe horizontal para navegación de categorías, pool reducido de partículas en pantallas pequeñas.
* **Teclado**: Focus visible, navegación mediante tabulador, `Enter` / `Space` para activar selección o Pop. No depender exclusivamente de hover. Orden de foco lógico.
* **Reduced Motion**: Respetar `prefers-reduced-motion`. Cuando esté activo: reducir floating, oscilaciones y partículas, simplificar Pop y mantener las transiciones esenciales sin movimiento excesivo.

---

## Plan de Verificación y Criterios de Aceptación

### Verificación Automatizada
```bash
# 1. Frontend build
cd F:\WWZ\frontend && npm run build

# 2. Frontend test suite
cd F:\WWZ\frontend && npm test

# 3. Backend tests
cd F:\WWZ && .\mvnw.cmd test
```

### Verificación Visual
* **Desktop**:
  * Light 1920x1080 vs `reference_2_musica.png`.
  * Dark 1920x1080 vs `reference_1_mapa.png`.
* **Responsive**:
  * Tablet 1024x768.
  * Mobile 390x844.

### Criterios Específicos de Física
- [ ] Las pompas no se mueven todas sincronizadas (fases sinusoidales independientes).
- [ ] Existe flotabilidad ambiental sutil.
- [ ] Las burbujas se separan suavemente al acercarse.
- [ ] Las colisiones no generan explosiones físicas ni teletransportes.
- [ ] Las burbujas pueden rozarse y reagruparse con naturalidad.
- [ ] El hover genera una reacción física visible pero sutil.
- [ ] El drag conserva inercia y deforma sutilmente la membrana.
- [ ] Al soltar, la burbuja retorna orgánicamente a su anchor.
- [ ] La burbuja activa mantiene una jerarquía visual clara.
- [ ] El Pop no se dispara accidentalmente durante un arrastre (umbral > 6px).
- [ ] Después de un Pop, las burbujas restantes ocupan el espacio sin saltos.
- [ ] No quedan bodies ni meshes invisibles después de eliminar una burbuja.

### Criterios Específicos de Experiencia
* La pantalla de Top Songs debe transmitir:
  $$\text{pompas individuales} \to \text{flotan} \to \text{se rozan} \to \text{se agrupan} \to \text{profundidad} \to \text{destacan al interactuar} \to \text{al seleccionar explotan} \to \text{entran al player} \to \text{se reorganizan}$$
* La experiencia debe sentirse como una bañera de pompas de jabón musical, no como una grilla de cards circulares.

### Criterios de Identidad Visual
* **Mantener**: Estética Light tipo bañera/pompas de jabón, transparencia nacarada, refracción, highlights iridiscentes, profundidad suave, chrome/luz líquida, sensación limpia y luminosa.
* **Evitar**: Aspecto de planetas, texturas psicodélicas, bordes toscos, glow excesivo, saturación artificial, simetría rígida o tarjetas tipo Spotify.
* **Criterio de Color**: Ausencia total de acentos rojizos o rosados no deseados en el player y chrome. Los tonos iridiscentes solo aparecen como refracción natural del shader.

---

## Resultado Esperado de la Fase 2

SuperFind evoluciona desde:
> *"un mapa visual de canciones dentro de burbujas"*

hacia:
> *"un ecosistema físico de pompas musicales donde cada canción existe como un objeto vivo, flotante e interactivo."*

La implementación queda arquitectónicamente desacoplada y lista para recibir ingesta masiva desde la API y navegación fluida por slide/swipe entre categorías.
