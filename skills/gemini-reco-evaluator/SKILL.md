---
name: gemini-reco-evaluator
description: Evalúa, prueba y calibra la calidad y balance de las recomendaciones generadas por Gemini AI y el motor heurístico en SoundWave.
---

# Gemini Recommendation Evaluator Skill

Esta skill permite validar que el algoritmo de recomendación de **SoundWave** cumpla con su objetivo central: **rescatar artistas emergentes y joyas ocultas sin perder afinidad musical**.

## Criterios de Evaluación de Recomendaciones:

1. **Balance de Tiers (Distribución Recomendada)**:
   - ~50% a 60% **`UNDERGROUND`** (Gemas ocultas / Nuevos artistas con < 25% de escuchas relativas).
   - ~30% **`GROWING`** (Artistas en alza con 25% - 70% de escuchas relativas).
   - ~10% a 20% **`HEAVY_ROTATION`** (Temas consolidados para mantener anclaje).

2. **Calidad de la Explicabilidad (*Explainable AI*)**:
   - Cada recomendación debe tener una justificación humana de 1 o 2 oraciones.
   - Debe evitar frases genéricas ("Esta canción es buena") y enfocarse en producción, texturas, armonía y atmósfera.

3. **Prueba de Invocación Rápida**:
   ```bash
   # Invocar endpoint de recomendaciones
   curl -s http://localhost:8080/api/recommendations/gemini?limit=6
   ```

4. **Validación de Fallback**:
   - Desconectar la API Key y verificar que el endpoint responda en menos de 100ms con recomendaciones heurísticas ricas y explicables.
