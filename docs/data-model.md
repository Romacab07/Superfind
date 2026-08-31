# Data Model — SoundWave Music Discovery

Este documento especifica la estructura del modelo de datos canónico y el esquema de colecciones en **Google Cloud Firestore**.

---

## 1. Esquema de Colecciones en Firestore

```
firestore-root/
│
├── tracks/ (collection)
│   └── {trackId} (document)
│       ├── id: string (UUID)
│       ├── title: string
│       ├── artist: string
│       ├── genre: string (ej: "Synthwave", "Lofi Hip Hop")
│       ├── audioUrl: string (URL de streaming MP3)
│       ├── coverUrl: string (URL de carátula)
│       ├── durationSeconds: number
│       ├── releaseDate: timestamp
│       ├── license: string (ej: "Creative Commons CC-BY 4.0")
│       ├── licenseUrl: string
│       ├── provider: string ("JAMENDO" | "SEED_CATALOG" | "GENERIC_OPEN_API")
│       ├── externalId: string
│       ├── playCount24h: number (contador atómico)
│       ├── totalPlays: number
│       ├── lastPlayedAt: timestamp
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── play_events/ (collection)
│   └── {eventId} (document)
│       ├── id: string (UUID)
│       ├── trackId: string
│       ├── timestamp: timestamp
│       ├── clientSession: string
│       └── userAgent: string
│
└── sync_metadata/ (collection)
    └── {providerName} (document, ej: "JAMENDO", "SEED_CATALOG")
        ├── providerName: string
        ├── lastSyncAt: timestamp
        ├── lastExternalId: string
        ├── newlyAddedTracks: number
        ├── totalTracksSynced: number
        ├── status: string ("SUCCESS" | "FAILED")
        └── lastErrorMessage: string
```

---

## 2. Modelos de Dominio Java

### `Track` (`com.soundwave.musicdiscovery.model.Track`)
Representa una canción normalizada en el catálogo.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `String` | Identificador único interno (UUID). |
| `title` | `String` | Título de la pista. |
| `artist` | `String` | Nombre del artista o colectivo. |
| `genre` | `String` | Género musical categorizado. |
| `audioUrl` | `String` | Enlace directo para streaming de audio MP3. |
| `coverUrl` | `String` | Imagen de alta resolución del arte de tapa. |
| `durationSeconds` | `int` | Duración de la pista en segundos. |
| `license` | `String` | Licencia libre de derechos (Creative Commons CC-BY, CC0). |
| `provider` | `String` | Origen del catálogo (`JAMENDO`, `SEED_CATALOG`). |
| `playCount24h` | `long` | Reproducciones acumuladas en la ventana móvil de 24 horas. |
| `totalPlays` | `long` | Total histórico de escuchas. |

---

### `PlayEvent` (`com.soundwave.musicdiscovery.model.PlayEvent`)
Evento de auditoría temporal registrado cuando un usuario escucha más de 5 segundos de una pista.

---

### `SyncStatus` (`com.soundwave.musicdiscovery.model.SyncStatus`)
Auditoría de sincronización por proveedor para verificar salud e integridad de los datos.
