# API Contracts — SoundWave Music Discovery

Especificación de contratos HTTP, payloads y respuestas JSON estandarizadas de la API REST.

---

## Formato Estándar de Respuesta (`ApiResponse<T>`)

Todas las respuestas de la API siguen la estructura envelope:

```json
{
  "success": true,
  "message": "Mensaje descriptivo opcional",
  "data": { ... },
  "timestamp": "2026-08-31T10:00:00.000Z"
}
```

---

## 1. Catálogo & Métricas (`/api/tracks`)

### `GET /api/tracks/top-24h`
Devuelve el ranking de canciones más escuchadas en las últimas 24 horas (**Bloque A**).
* **Parámetros Query**: `limit` (opcional, default: `10`, max: `50`).
* **Respuesta Exitosa (200 OK)**:
```json
{
  "success": true,
  "message": "Top canciones 24h recuperadas con éxito",
  "data": [
    {
      "id": "seed-001",
      "title": "Neon Horizon",
      "artist": "Aether Wave",
      "genre": "Synthwave",
      "audioUrl": "https://...",
      "coverUrl": "https://...",
      "durationSeconds": 214,
      "playCount24h": 142,
      "license": "Creative Commons CC-BY 4.0",
      "provider": "SEED_CATALOG"
    }
  ]
}
```

### `GET /api/tracks/recent`
Devuelve los lanzamientos más recientes sincronizados (**Bloque B**).
* **Parámetros Query**: `limit` (opcional, default: `12`, max: `50`).

### `POST /api/tracks/{id}/play`
Registra un evento de reproducción tras 5 segundos de escucha activa.
* **Payload**:
```json
{
  "clientSession": "sess_xyz_12345",
  "userAgent": "Mozilla/5.0..."
}
```
* **Respuesta Exitosa (200 OK)**:
```json
{
  "success": true,
  "message": "Reproducción registrada correctamente",
  "data": "OK"
}
```

---

## 2. Recomendaciones con IA (`/api/recommendations`)

### `GET /api/recommendations/gemini`
Devuelve recomendaciones generadas por Gemini con explicaciones humanas (**Bloque C**).
* **Parámetros Query**: `limit` (opcional, default: `6`).
* **Respuesta Exitosa (200 OK)**:
```json
{
  "success": true,
  "message": "Recomendaciones de Gemini generadas con éxito",
  "data": [
    {
      "track": {
        "id": "seed-002",
        "title": "Midnight Coffee & Rain",
        "artist": "Lofi Dreams Collective",
        "genre": "Lofi Hip Hop",
        "playCount24h": 28
      },
      "reasoning": "Gema oculta en alza: Aunque cuenta con pocas reproducciones recientes, su textura armónica relajante complementa la tendencia acústica del día.",
      "tier": "UNDERGROUND",
      "vibeSummary": "Texturas cálidas de vinilo y relajación acústica para concentración profunda.",
      "confidenceScore": 0.94
    }
  ]
}
```

---

## 3. Operaciones & Sincronización (`/api/internal`)

### `POST /api/internal/sync`
Disparador de sincronización multi-fuente invocado por **Cloud Scheduler**.

### `GET /api/internal/providers`
Lista los proveedores registrados en el sistema y su estado de disponibilidad (`available: true/false`).
