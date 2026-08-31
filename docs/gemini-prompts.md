# Gemini AI Prompt Engineering & Heuristics Guide

Este documento describe las directivas de prompting, esquemas JSON y parámetros de inferencia utilizados para el motor de recomendación inteligente en **SoundWave**.

---

## 1. Parámetros del Modelo

| Parámetro | Valor Configurado | Justificación |
| :--- | :--- | :--- |
| **Modelo** | `gemini-1.5-flash` / `gemini-2.0-flash` | Respuesta ultrarrápida (< 1.5s) y costo mínimo por token. |
| **Temperature** | `0.7` | Balance óptimo entre creatividad en la redacción explicativa y precisión taxonómica de géneros. |
| **Response MIME Type** | `application/json` | Fuerza al modelo a retornar un JSON estricto sin bloques de texto Markdown sobrantes. |
| **Timeout** | `15 segundos` | Límite preventivo antes de conmutar al motor heurístico de fallback. |

---

## 2. Estructura del Prompt

El backend pre-procesa el catálogo dividiendo las pistas por el rango de escuchas relativas de las últimas 24 horas:

```
Score = (Plays - MinPlays) / (MaxPlays - MinPlays)
- Score >= 0.70  -> HEAVY_ROTATION
- 0.25 <= Score < 0.70 -> GROWING
- Score < 0.25  -> UNDERGROUND (Gemas Ocultas)
```

### System & User Prompt Template:

```text
Eres un curador musical experto en artistas emergentes y música sin copyright (Creative Commons).
Analiza las siguientes canciones registradas en las últimas 24 horas y selecciona exactamente {LIMIT} recomendaciones inteligentes.

REGLAS DE RECOMENDACIÓN:
1. Da visibilidad a canciones con pocas o medianas reproducciones (Gemas Ocultas) que tengan gran valor musical.
2. Evita recomendar únicamente las canciones más populares; combina temas emergentes con coherencia estilística.
3. Para cada canción seleccionada, redacta un razonamiento humano de 1 o 2 frases explicando por qué el usuario debería escucharla hoy.

CATÁLOGO DE CANCIONES (JSON):
[
  {"id": "...", "title": "...", "artist": "...", "genre": "...", "plays24h": 140},
  {"id": "...", "title": "...", "artist": "...", "genre": "...", "plays24h": 22}
]

RESPONDE EXCLUSIVAMENTE CON UN ARREGLO JSON VÁLIDO CON ESTE FORMATO:
[
  {
    "trackId": "ID_DE_LA_CANCION",
    "reasoning": "Razón humana de recomendación...",
    "tier": "UNDERGROUND" | "GROWING" | "HEAVY_ROTATION",
    "vibeSummary": "Resumen del ambiente (ej: Synthwave nostálgico para programar)"
  }
]
```

---

## 3. Estrategia de Fallback Heurístico

Si la llamada a Gemini no se puede completar (por falta de API Key o degradación de red):
1. El backend selecciona un balance de 60% *Underground*, 30% *Growing* y 10% *Heavy Rotation*.
2. Genera dinámicamente descripciones explicables basadas en la taxonomía acústica de cada género.
3. Asegura que el usuario siempre reciba una experiencia fluida sin advertencias de error intrusivas.
