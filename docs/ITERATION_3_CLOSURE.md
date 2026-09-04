# SUPERFIND — WALKTHROUGH ACTUALIZADO: THREE.JS 10/10 REFINEMENT
## Transformación de Shaders: De Esferas Rígidas a Pompas de Jabón Vivas

### 1. Diagnóstico y Corrección de Raíz

El prototipo previo de Three.js lucía estático y anticuado por tres razones matemáticas y estéticas:
1. **Desplazamiento imperceptible en vértices**: La deformación de la superficie utilizaba amplitudes de $\approx 0.012$ píxeles en esferas de radio $100px$. Se reemplazó por armónicos esféricos vivos en escala de píxeles ($2\% - 4.5\%$ del radio), dotando a la silueta de oscilación armónica elástica (*living respiration*), tensión superficial asimétrica e inercia de velocidad (*squash & stretch*) guiada por Matter.js.
2. **Error ortográfico de `viewDir` en WebGL**:
   En proyecciones ortográficas con coordenadas mundiales amplias, calcular `viewDir = normalize(-mvPosition.xyz)` causaba que los rayos de visión incidieran con ángulos oblicuos extremos en las burbujas laterales. Se corrigió a `viewDir = vec3(0.0, 0.0, 1.0)`, garantizando una simetría esférica perfecta de 360° en todos los cuadrantes del canvas.
3. **Ausencia de remolinos de fluido (*marbling*)**:
   Se implementó un algoritmo procedimental de ruido **Simplex 3D (`snoise`)** acoplado a la ecuación física de interferencia por longitud de onda de película delgada. Los colores de la burbuja (turquesa, lila, melocotón, esmeralda, oro) ahora fluyen en remolinos vivos por la membrana en lugar de ser un gradiente congelado.

---

### 2. Galería de Capturas Definitivas

* **Three.js Modo Claro Refinado (10/10)**:
  [`docs/screenshots/three_10_desktop_light_v2.png`](file:///F:/WWZ/docs/screenshots/three_10_desktop_light_v2.png)
  * Transparencia cristalina del centro que permite apreciar el horizonte líquido y las microburbujas del fondo.
  * Destellos anamórficos de estrella de 4 puntas centelleante en el cuadrante superior derecho.
  * Arco lunar fino superior izquierdo sin sobreexposición blanca (*zero white blowout*).
  * Ondulación viva en la silueta.

* **Three.js Modo Oscuro Refinado (10/10)**:
  [`docs/screenshots/three_10_desktop_dark_v2.png`](file:///F:/WWZ/docs/screenshots/three_10_desktop_dark_v2.png)
  * Eliminación total de medialunas blancas o recortes sólidos.
  * Pompas de jabón cósmicas en la oscuridad con aros iridiscentes de neón líquido (cian, esmeralda, violeta, magenta) y centro oscuro translúcido.
  * Hero Track activo (*Urban Pulse*) con halo gravitacional respirando al compás de la música.

* **Canvas 2D Intacto**:
  [`BubbleWorld.jsx`](file:///F:/WWZ/frontend/src/components/BubbleWorld.jsx) permanece 100% inalterado como benchmark visual continuo.

* **Validación en Docker Compose**:
  Captura en [`docs/screenshots/docker_three_10_desktop.png`](file:///F:/WWZ/docs/screenshots/docker_three_10_desktop.png) ejecutándose en `http://localhost:3000`.
