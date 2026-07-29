# CircuitSim Op-Amp 🔬

> Simulador educativo interactivo de circuitos con amplificadores operacionales.

## 🚀 Inicio Rápido

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

### Backend

```bash
cd backend
npm install
npm run dev
```

El backend estará disponible en `http://localhost:3001`

---

## 📁 Estructura del Proyecto (Monorepo)

```
simulador-circuitos-opamp/
├── frontend/       # React + Vite + TypeScript + Konva.js
├── backend/        # Node.js + Express + TypeScript
├── shared/         # Tipos compartidos
├── docs/           # Documentación adicional
└── DOCUMENTOS_PLANIFICACION_SIMULADOR_OPAMP.md
```

---

## 📋 Fases de Desarrollo

| Fase      | Estado       | Descripción                                  |
|-----------|-------------|----------------------------------------------|
| Fase 0    | ✅ Completo  | Setup monorepo, boilerplate frontend/backend |
| Sprint 1  | ✅ Completo  | Lienzo interactivo y paleta de componentes   |
| Sprint 2  | ✅ Completo  | Conexiones y validación de circuitos         |
| Sprint 3  | ✅ Completo  | Motor de simulación DC (MNA)                 |
| Sprint 4  | ✅ Completo  | Análisis transitorio y modelos Op-Amp        |
| Sprint 5  | ✅ Completo  | Instrumentos virtuales (Osciloscopio, etc.)  |
| Sprint 6  | ✅ Completo  | Autenticación y persistencia                 |
| Sprint 7  | ✅ Completo  | Biblioteca de circuitos prediseñados         |
| Sprint 8  | 🔄 En progreso| Testing, pulido y exportación                |

---

## 🛠️ Stack Tecnológico

**Frontend:** React 19 · TypeScript · Vite · Konva.js · Redux Toolkit · Tailwind CSS  
**Backend:** Node.js · Express · TypeScript  
**Simulación:** Modified Nodal Analysis (MNA) — en desarrollo
