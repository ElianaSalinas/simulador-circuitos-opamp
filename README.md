# CircuitSim Op-Amp 🔬⚡

> Simulador educativo interactivo de circuitos analógicos y amplificadores operacionales de alta fidelidad, con simbología electrónica canónica (IEEE/IEC), animación continua de corriente a 60 FPS, osciloscopio virtual en tiempo real y motor numérico MNA / Transitorio Trapezoidal.

---

## 🌟 Características Principales

- **🎨 Simbología Electrónica Canónica (IEEE / IEC)**:
  - Amplificadores operacionales con glifos de polaridad $+/-$ y terminales de alimentación $V^+/V^-$.
  - Resistores con trazado estándar en zigzag de 6 crestas.
  - Capacitores de placas paralelas y fuentes de tensión con glifos de forma de onda (DC, Senoidal, Cuadrada).
  - Terminales de tierra canónicos de 3 barras normalizadas.
- **⚡ Animación Continua de Corriente a 60 FPS**:
  - Partículas de flujo de electrones en cables con velocidad y sentido proporcionales a la diferencia de potencial nodal ($\Delta V$).
  - Resplandor y halo luminoso dinámico según el potencial eléctrico.
- **📈 Osciloscopio Digital Virtual en Tiempo Real**:
  - Modo continuo de barrido en vivo (*Continuous Sweep*) con estela de fósforo CRT y línea de barrido.
  - Mediciones automáticas en tiempo real: Frecuencia ($f_0$), Tensión Pico a Pico ($V_{pp}$), $V_{rms}$, $V_{max}$ y $V_{min}$.
  - Controles de pausa/reanudación (**▶ / ⏸**), multiplicadores de velocidad (**0.5x, 1x, 2x**) y ventana flotante arrastrable.
- **🧮 Motor Numérico de Alta Precisión**:
  - **Análisis DC**: Modified Nodal Analysis (MNA) con eliminación gaussiana y pivotaje parcial.
  - **Análisis Transitorio**: Integración Trapezoidal (*Trapezoidal Rule*) libre de amortiguamiento numérico artificial ($|A_{num}| = 1.000$), soporte para osciladores de alta $Q$, multivibradores astables e integradores.
  - **Modelado PWL de Op-Amp**: Modo lineal con ganancia en lazo abierto $A_{vol} = 10^5$ y saturación simétrica a rieles de alimentación ($\pm 14.5\text{V}$).
- **📚 Biblioteca de Prácticas de Laboratorio Integradas**:
  1. `01` - Amplificador de Instrumentación (3 Op-Amps, ganancia $A_d = 11$).
  2. `02` - Puente de Wheatstone + Amplificador de Instrumentación (acondicionamiento de sensores).
  3. `03` - Oscilador Puente de Wien ($f_0 = 159.15\text{ Hz}$, onda senoidal pura y criterio de Barkhausen).
  4. `04` - Multivibrador Astable con Op-Amp ($f \approx 455\text{ Hz}$, onda cuadrada $\pm 14.5\text{V}$).
  5. `05` - Integrador Activo (Respuesta a onda cuadrada).

---

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js (v18 o superior)
- npm

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

El simulador estará disponible en: **`http://localhost:5173`**

Para verificar tipos y compilar el bundle de producción:
```bash
npm run build
```

### 2. Backend (Opcional - Persistencia en la nube)

```bash
cd backend
npm install
npm run dev
```

El servidor API estará disponible en: **`http://localhost:3001`**

---

## 📁 Estructura del Monorepo

```
simulador-circuitos-opamp/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── symbols/          # Símbolos vectoriales canónicos (IEEE/IEC)
│   │   │   │   ├── OpAmpSymbol.tsx
│   │   │   │   ├── ResistorSymbol.tsx
│   │   │   │   ├── CapacitorSymbol.tsx
│   │   │   │   ├── VoltageSymbol.tsx
│   │   │   │   └── GroundSymbol.tsx
│   │   │   ├── CircuitCanvas.tsx # Lienzo Konva con Pan/Zoom y animación de electrones
│   │   │   ├── CanvasToolbar.tsx # Barra flotante de zoom, centrado y flujo
│   │   │   ├── Oscilloscope.tsx  # Osciloscopio digital en tiempo real
│   │   │   ├── SimulationPanel.tsx # Multímetro digital LCD
│   │   │   ├── ComponentPalette.tsx
│   │   │   └── PropertyPanel.tsx
│   │   ├── simulation/
│   │   │   ├── MNASolver.ts       # Solver DC MNA
│   │   │   ├── TransientSolver.ts # Solver Transitorio con Integración Trapezoidal
│   │   │   ├── netlistBuilder.ts  # Generador de Netlist desde nodos esquemáticos
│   │   │   └── types.ts
│   │   ├── library/
│   │   │   └── circuits.ts        # Circuitos y prácticas precargadas
│   │   ├── store/                 # Redux Toolkit (circuit, simulation, auth)
│   │   └── App.tsx                # Orquestador UI con tema Cyber-Lab Pro
├── backend/                       # Autenticación JWT y persistencia MongoDB
├── shared/                        # Tipos e interfaces compartidas
└── README.md
```

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 19, TypeScript, Vite, Konva.js / React-Konva, Redux Toolkit, Tailwind CSS / Vanilla CSS Cyber-Lab.
- **Backend**: Node.js, Express, TypeScript, MongoDB / Mongoose, JWT, bcryptjs.
- **Tipografía**: Google Fonts (Inter para interfaz general, JetBrains Mono para telemetría y mediciones).

---

## 🧪 Validación y Pruebas

Los algoritmos de cálculo han sido validados contra análisis teóricos y simulaciones de referencia:
- Oscilador Puente de Wien: $f_{sim} = 158.94\text{ Hz}$ (teórico $159.15\text{ Hz}$, $99.87\%$ de concordancia).
- Multivibrador Astable: $f_{sim} = 454.09\text{ Hz}$ (teórico $454.5\text{ Hz}$).
- Amplificador de Instrumentación: $A_d = 11.00$ ($V_{in,diff} = 0.1\text{V} \implies V_{out} = 1.10\text{V}$).
