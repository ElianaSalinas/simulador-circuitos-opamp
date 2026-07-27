# DOCUMENTOS DE PLANIFICACIÓN - SIMULADOR DE CIRCUITOS CON OP-AMPS
## Suite Completa de Especificaciones Técnicas y Planificación

---

## 📋 01 - PRODUCT REQUIREMENTS DOCUMENT (PRD)

### 1.1 Visión del Producto
**Nombre:** CircuitSim Op-Amp
**Tagline:** Simulador educativo interactivo de circuitos con amplificadores operacionales

El simulador es una herramienta web educativa que permite a estudiantes de ingeniería simular y comprender el comportamiento de amplificadores operacionales en diferentes configuraciones. La plataforma replica las funcionalidades de herramientas profesionales como Multisim Live y Falstad Circuit Simulator, pero optimizada para propósitos educativos.

### 1.2 Objetivos del Producto
- Permitir la simulación de circuitos con Op-Amps en tiempo real
- Proporcionar mediciones virtuales precisas (voltaje, corriente, frecuencia)
- Visualizar formas de onda en tiempo real
- Facilitar el aprendizaje de conceptos fundamentales de electrónica analógica
- Comparar resultados teóricos con experimentales

### 1.3 Alcance Funcional

#### Funcionalidades Principales (MVP)
1. **Lienzo de diseño de circuitos**
   - Interfaz drag-and-drop para componentes
   - Soporte para Op-Amps reales (LM741, TL082, etc.)
   - Librería de componentes: resistencias, capacitores, fuentes de voltaje, tierra

2. **Módulo de simulación**
   - Motor de simulación en tiempo real
   - Análisis DC y AC
   - Análisis transiente
   - Cálculo de parámetros: ganancia, frecuencia de corte, fase

3. **Instrumentos virtuales**
   - Osciloscopio digital (2-4 canales)
   - Multímetro digital
   - Generador de funciones (onda senoidal, cuadrada, triangular)
   - Analizador de espectro (FFT)

4. **Gestión de proyectos**
   - Guardar/cargar circuitos
   - Historial de simulaciones
   - Exportar resultados (PNG, PDF)
   - Compartir circuitos

#### Funcionalidades Secundarias
- Biblioteca de circuitos prediseñados
- Modo de aprendizaje con tutoriales
- Validación automática de circuitos
- Reportes de simulación

### 1.4 Casos de Uso Principales

#### CU-001: Simular amplificador inversor
**Participante:** Estudiante Equipo 2
**Descripción:** El estudiante diseña un amplificador inversor, aplica una señal de entrada y mide la ganancia resultante.

#### CU-002: Simular integrador
**Participante:** Estudiante Equipo 3
**Descripción:** El estudiante crea un circuito integrador y observa cómo una onda cuadrada se transforma en triangular.

#### CU-003: Simular Trigger de Schmitt
**Participante:** Estudiante Equipo 4
**Descripción:** El estudiante diseña un trigger de Schmitt y verifica el efecto de histéresis con una señal ruidosa.

#### CU-004: Simular oscilador Puente de Wien
**Participante:** Estudiante Equipo 5
**Descripción:** El estudiante implementa un oscilador y verifica que cumple con el criterio de Barkhausen.

### 1.5 Restricciones y Limitaciones
- Plataforma web (sin instalación requerida)
- Compatible con navegadores modernos (Chrome, Firefox, Safari, Edge)
- Sin requerimientos de API externa para simulación básica
- Precisión de simulación: ±5% en DC, ±10% en AC
- Máximo 50 componentes por circuito en MVP

### 1.6 Métricas de Éxito
- Tiempo de carga < 3 segundos
- 95% de precisión en mediciones vs teoría
- Capacidad de simular todos los 5 temas de equipos
- Capacidad de 1000+ usuarios concurrentes
- NPS > 8/10 entre usuarios

### 1.7 Roadmap de Fases

| Fase | Duración | Entregables |
|------|----------|-------------|
| **Fase 1: MVP** | 8 semanas | Motor de simulación básico, 3 tipos de circuitos, osciloscopio |
| **Fase 2: Expansión** | 6 semanas | Biblioteca de 20+ circuitos, tutoriales, exportación |
| **Fase 3: Optimización** | 4 semanas | Performance, UX refinement, análisis avanzado |

---

## 👥 02 - HISTORIAS DE USUARIO

### HU-001: Crear nuevo circuito
**Como:** estudiante de ingeniería
**Quiero:** crear un nuevo circuito en blanco en el simulador
**Para que:** pueda diseñar circuitos con amplificadores operacionales

**Criterios de Aceptación:**
- [ ] El sistema muestra un lienzo vacío al crear nuevo proyecto
- [ ] El usuario tiene acceso a la librería de componentes
- [ ] Se puede seleccionar un componente de la librería
- [ ] Se puede colocar el componente en el lienzo mediante drag-and-drop
- [ ] El componente aparece con etiqueta editable

**Tareas:**
- Crear interfaz de lienzo vacío
- Implementar sistema de drag-and-drop
- Desarrollar componente de librería de elementos
- Crear etiquetado de componentes

---

### HU-002: Conectar componentes
**Como:** estudiante
**Quiero:** conectar componentes entre sí
**Para que:** pueda construir circuitos completos

**Criterios de Aceptación:**
- [ ] Puedo hacer click en un terminal de componente
- [ ] Aparece indicación visual de modo conexión
- [ ] Puedo arrastrar hacia otro terminal
- [ ] Se genera una línea de conexión
- [ ] Se evita conexiones inválidas

**Tareas:**
- Implementar motor de conexiones
- Validar topología de circuitos
- Crear retroalimentación visual

---

### HU-003: Configurar parámetros de componente
**Como:** estudiante
**Quiero:** modificar valores de resistencias, capacitores y voltajes
**Para que:** pueda diseñar circuitos con valores específicos

**Criterios de Aceptación:**
- [ ] Doble click en componente abre diálogo de propiedades
- [ ] Se muestran campos editables para cada parámetro
- [ ] Validación de valores permitidos
- [ ] Unidades mostradas claramente
- [ ] Cambios se aplican inmediatamente

---

### HU-004: Seleccionar Op-Amp específico
**Como:** estudiante
**Quiero:** elegir entre diferentes modelos de Op-Amps reales (LM741, TL082, etc.)
**Para que:** pueda comparar el comportamiento de diferentes dispositivos

**Criterios de Aceptación:**
- [ ] Librería de Op-Amps con al menos 8 modelos
- [ ] Cada Op-Amp tiene datasheet embebido
- [ ] Se muestra especificaciones clave al seleccionar
- [ ] Comportamiento simulado respeta limitaciones del chip real

---

### HU-005: Ejecutar simulación
**Como:** estudiante
**Quiero:** iniciar la simulación del circuito
**Para que:** pueda ver el comportamiento del circuito en tiempo real

**Criterios de Aceptación:**
- [ ] Botón "Simular" disponible cuando circuito es válido
- [ ] Simulación comienza sin errores de validación
- [ ] Se muestra indicador de progreso
- [ ] Los instrumentos se actualizan en tiempo real
- [ ] Puedo pausar/reanudar/detener simulación

---

### HU-006: Visualizar formas de onda en osciloscopio
**Como:** estudiante
**Quiero:** ver las formas de onda de entrada y salida en un osciloscopio virtual
**Para que:** pueda analizar el comportamiento del circuito

**Criterios de Aceptación:**
- [ ] Osciloscopio muestra mínimo 2 canales
- [ ] Las formas de onda se trazan en tiempo real
- [ ] Puedo activar/desactivar canales
- [ ] Control de escala de tiempo y voltaje
- [ ] Opción de "hold" para capturar forma de onda
- [ ] Grilla de referencia visible

---

### HU-007: Realizar mediciones con multímetro
**Como:** estudiante
**Quiero:** medir voltaje y corriente en diferentes puntos del circuito
**Para que:** pueda validar mis cálculos teóricos

**Criterios de Aceptación:**
- [ ] Multímetro muestra voltaje RMS/pico
- [ ] Puedo seleccionar puntos de medición
- [ ] Se actualizan valores en tiempo real
- [ ] Resolución de al menos 0.1 mV
- [ ] Indicador de rango automático

---

### HU-008: Generar formas de onda personalizadas
**Como:** estudiante
**Quiero:** crear una fuente de voltaje con formas de onda específicas
**Para que:** pueda probar el circuito con diferentes tipos de señal

**Criterios de Aceptación:**
- [ ] Soporte de: senoidal, cuadrada, triangular, diente de sierra
- [ ] Control de: frecuencia, amplitud, offset, duty cycle
- [ ] Generador permite valores personalizados
- [ ] Vista previa de forma de onda

---

### HU-009: Guardar circuito
**Como:** estudiante
**Quiero:** guardar mi circuito para continuar después
**Para que:** no pierda mi trabajo

**Criterios de Aceptación:**
- [ ] Botón "Guardar" disponible
- [ ] Se solicita nombre de proyecto
- [ ] Se guarda estado completo (componentes, conexiones, parámetros)
- [ ] Confirmación visual de guardado
- [ ] Opción de guardado automático

---

### HU-010: Cargar circuito guardado
**Como:** estudiante
**Quiero:** acceder a mis circuitos previamente guardados
**Para que:** pueda continuar trabajando en ellos

**Criterios de Aceptación:**
- [ ] Lista de circuitos guardados disponible
- [ ] Puedo buscar por nombre
- [ ] Información de fecha/hora de guardado
- [ ] Carga completa del estado anterior
- [ ] Opción de duplicar circuito

---

### HU-011: Exportar resultados
**Como:** estudiante
**Quiero:** exportar los resultados de la simulación en formato PDF o imagen
**Para que:** pueda incluirlos en mi informe

**Criterios de Aceptación:**
- [ ] Opción de exportar en PNG, PDF
- [ ] Incluye: esquemático, gráficas, mediciones
- [ ] Calidad de imagen adecuada para imprimir
- [ ] Metadatos incluidos (fecha, parámetros)

---

### HU-012: Ver tutoriales de circuitos prediseñados
**Como:** estudiante principiante
**Quiero:** acceder a ejemplos de circuitos já configurados
**Para que:** pueda aprender del comportamiento típico

**Criterios de Aceptación:**
- [ ] Al menos 10 circuitos prediseñados
- [ ] Categorizado por tema (Equipo 1-5)
- [ ] Cada circuito tiene explicación de funcionamiento
- [ ] Puedo cargar y ejecutar ejemplos
- [ ] Puedo modificar parámetros en ejemplos

---

## 📜 03 - REGLAS DE NEGOCIO

### RN-001: Validación de Circuitos
**Regla:** Un circuito solo puede simular si:
- Tiene al menos un Op-Amp
- Todos los nodos están conectados a tierra o a alimentación
- No hay cortocircuitos directos en salida del Op-Amp
- Máximo 50 componentes en MVP

**Consecuencia:** Si no se cumple, se muestra error específico bloqueando simulación

---

### RN-002: Limitaciones de Op-Amp Real
**Regla:** El simulador debe considerar:
- Voltaje de offset de entrada (±Vos típico del modelo)
- Corrientes de polarización (Ib según datasheet)
- Slew Rate (dV/dt máximo)
- Ancho de banda (-3dB)
- Relación de Rechazo en Modo Común (CMRR)
- Riesgo de saturación en ±Vcc

**Consecuencia:** Resultados reflejan limitaciones reales, no ideales

---

### RN-003: Precisión de Simulación
**Regla:** 
- Errores DC: ±5% máximo
- Errores AC: ±10% máximo
- Tiempo de cálculo: < 100ms por paso
- Paso de simulación: 1µs (ajustable)

**Consecuencia:** Si precisión no se alcanza, usar método numérico alternativo

---

### RN-004: Protección de Datos de Usuario
**Regla:**
- Los circuitos guardados son propiedad del usuario
- Se almacenan encriptados
- No se comparten sin consentimiento explícito
- Eliminación de datos después de 1 año de inactividad

---

### RN-005: Rango de Valores Permitidos
**Regla:** 
- Resistencias: 1Ω a 10MΩ
- Capacitores: 1pF a 100µF
- Voltajes: ±30V máximo
- Frecuencias: 1Hz a 1MHz
- Corrientes: Limitadas por Op-Amp seleccionado

---

### RN-006: Validación de Conexiones
**Regla:**
- Un componente no puede conectarse a sí mismo
- Máximo 4 conexiones por terminal (excepto nodo de tierra)
- No permitir componentes flotantes (sin conexión)
- Validación en tiempo real mientras se dibuja

---

### RN-007: Gestión de Proyectos
**Regla:**
- Máximo 100 proyectos por usuario (MVP)
- Tamaño máximo de proyecto: 5MB
- Historial de 10 versiones anteriores
- Almacenamiento: 1GB por usuario

---

### RN-008: Compatibilidad de Frecuencias
**Regla:**
- Si frecuencia de entrada > GBW del Op-Amp, advertir al usuario
- Mostrar banda de paso del dispositivo
- Calcular atenuación predicha para frecuencias fuera de banda

---

## 🔧 04 - ESPECIFICACIÓN TÉCNICA

### 4.1 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React/Vue)                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Componentes UI                                   │   │
│  │ - Lienzo de diseño                               │   │
│  │ - Panel de componentes                           │   │
│  │ - Instrumentos virtuales                         │   │
│  │ - Panel de propiedades                           │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────┘
                   │
         ┌─────────▼──────────┐
         │  State Management  │
         │    (Redux/Vuex)    │
         └─────────┬──────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              Backend Services (Node.js)                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Motor de Simulación (WASM/Native)                │   │
│  │ - Parser de circuitos                            │   │
│  │ - Solucionador de ecuaciones (SPICE-like)        │   │
│  │ - Calculador de frecuencia (FFT)                 │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ API REST                                         │   │
│  │ - Gestión de proyectos                           │   │
│  │ - Autenticación                                  │   │
│  │ - Historial de simulaciones                      │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────▼──────────────┐
        │   PostgreSQL Database   │
        │   Redis Cache           │
        │   File Storage (S3)     │
        └────────────────────────┘
```

### 4.2 Stack Tecnológico

#### Frontend
- **Framework:** React 18 + TypeScript
- **Visualización:** Konva.js (renderizado de lienzo)
- **Gráficos:** Chart.js + D3.js
- **Estado:** Redux Toolkit
- **Estilos:** Tailwind CSS + CSS Modules
- **Build:** Vite
- **Testing:** Vitest + React Testing Library

#### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js / Fastify
- **Motor de Simulación:** 
  - Implementación propia basada en Method Nodal (SPICE-like)
  - O integrar: ngspice (LGPL)
- **Cálculos:** NumPy.js / ml.js
- **FFT:** Butterworth.js
- **Base de Datos:** PostgreSQL 14+
- **Caché:** Redis
- **Autenticación:** JWT + OAuth2
- **Testing:** Jest + Supertest

#### Infraestructura
- **Hosting:** AWS/GCP/DigitalOcean
- **Containerización:** Docker
- **Orquestación:** Kubernetes (opcional para escala)
- **CI/CD:** GitHub Actions
- **Monitoreo:** Prometheus + Grafana
- **Logs:** ELK Stack (Elasticsearch, Logstash, Kibana)

### 4.3 Especificaciones de Componentes

#### Op-Amps Soportados (MVP)
```json
{
  "LM741": {
    "gBW": 1e6,
    "slew_rate": 0.5e6,
    "vos": 2e-3,
    "ib": 80e-9,
    "cmrr": 90,
    "vcc_max": 32,
    "i_out_max": 25e-3
  },
  "TL082": {
    "gBW": 13e6,
    "slew_rate": 13e6,
    "vos": 5e-3,
    "ib": 30e-12,
    "cmrr": 100,
    "vcc_max": 36,
    "i_out_max": 50e-3
  }
  // ... más modelos
}
```

#### Componentes Básicos
- **Resistor:** 1Ω - 10MΩ
- **Capacitor:** 1pF - 100µF
- **Inductor:** 1nH - 1H (opcional MVP+)
- **Fuente DC:** ±30V
- **Fuente AC:** 0-1MHz
- **Tierra/GND:** Referencia 0V
- **Diodo:** (opcional para rectificadores)

### 4.4 Especificaciones de Instrumentos

#### Osciloscopio Virtual
- **Canales:** 2 (MVP) / 4 (MVP+)
- **Resolución:** 12 bits
- **Rango de voltaje:** ±50V
- **Base de tiempo:** 1µs/div a 100ms/div
- **Acoplamiento:** DC, AC
- **Modo de disparo:** Automático, manual
- **Memoria:** 1000 puntos/canal

#### Multímetro Digital
- **Modos:** Voltaje DC, Voltaje AC, Corriente DC, Resistencia
- **Rango:** Automático
- **Resolución:** 0.1mV (voltaje), 1µA (corriente)
- **Precisión:** ±3%

#### Generador de Funciones
- **Formas:** Senoidal, cuadrada, triangular, diente de sierra
- **Frecuencia:** 1Hz - 1MHz
- **Amplitud:** 0 - 30V
- **Offset:** -15V a +15V
- **Duty Cycle:** 1% - 99%

#### Analizador de Espectro
- **Algoritmo:** FFT de 1024 puntos
- **Rango de frecuencia:** DC - 500kHz
- **Resolución:** Δf = Fs/N
- **Ventanas:** Hann, Hamming, Blackman

### 4.5 Algoritmos de Simulación

#### Método Nodal Modificado (MNA)
```
Proceso:
1. Entrada: Netlist del circuito
2. Análisis: Construir matriz admitancia nodal Y
3. Resolver: [Y][V] = [I]
4. Iteración: Hasta convergencia
5. Salida: Voltajes nodales
```

#### Análisis en Frecuencia (AC)
```
1. Linealizar circuito alrededor punto Q
2. Variar frecuencia desde f_inicio a f_fin
3. Resolver para cada frecuencia
4. Calcular magnitud y fase
5. Plotear Bode
```

#### Análisis Transiente
```
1. Condición inicial: t=0
2. Paso temporal: Δt = Ts (período muestreo)
3. Integración numérica (Euler o Runge-Kutta)
4. Hasta: t_final
5. Almacenar waveforms
```

### 4.6 API REST - Endpoints Principales

#### Gestión de Proyectos
```
POST   /api/projects              - Crear proyecto
GET    /api/projects              - Listar proyectos
GET    /api/projects/:id          - Obtener proyecto
PUT    /api/projects/:id          - Actualizar proyecto
DELETE /api/projects/:id          - Eliminar proyecto
POST   /api/projects/:id/save     - Guardar estado
GET    /api/projects/:id/history  - Historial de versiones
```

#### Simulación
```
POST   /api/simulate              - Ejecutar simulación
GET    /api/simulate/:id/status   - Estado de simulación
POST   /api/simulate/:id/stop     - Detener simulación
GET    /api/simulate/:id/results  - Obtener resultados
```

#### Exportación
```
POST   /api/export/pdf/:id        - Exportar PDF
POST   /api/export/png/:id        - Exportar imagen
POST   /api/export/csv/:id        - Exportar datos CSV
```

#### Librería
```
GET    /api/library/components    - Listar componentes
GET    /api/library/opamps        - Listar Op-Amps
GET    /api/library/circuits      - Circuitos prediseñados
GET    /api/library/datasheets/:model - Obtener datasheet
```

---

## 🗺️ 05 - MAPA DE NAVEGACIÓN

### 5.1 Estructura de Sitio

```
CIRCUITSIM OP-AMP
│
├── 🏠 HOME
│   ├── Landing Page
│   ├── Ejemplos destacados
│   └── Llamada a acción (Iniciar)
│
├── 📚 EDUCACIÓN
│   ├── Tutoriales interactivos
│   │   ├── Conceptos básicos
│   │   ├── Configuraciones
│   │   └── Avanzados
│   ├── Biblioteca de circuitos
│   │   ├── Equipo 1: Fundamentos
│   │   ├── Equipo 2: Amplificación
│   │   ├── Equipo 3: Procesamiento dinámico
│   │   ├── Equipo 4: Circuitos no lineales
│   │   └── Equipo 5: Instrumentación
│   ├── Datasheets (en contexto)
│   └── Video tutoriales
│
├── 🔧 SIMULADOR
│   ├── Mi lienzo
│   │   ├── Lienzo de diseño
│   │   ├── Panel de componentes
│   │   ├── Propiedades de componente
│   │   └── Área de simulación
│   ├── Herramientas
│   │   ├── Osciloscopio
│   │   ├── Multímetro
│   │   ├── Generador de funciones
│   │   └── Analizador de espectro
│   ├── Proyectos
│   │   ├── Mis circuitos
│   │   ├── Circuitos compartidos
│   │   └── Historial
│   └── Exportar
│       ├── PDF
│       ├── PNG
│       └── CSV
│
├── 👤 USUARIO
│   ├── Mi perfil
│   │   ├── Información personal
│   │   ├── Configuración
│   │   └── Privacidad
│   ├── Mis proyectos
│   │   ├── Ver todos
│   │   ├── Recientes
│   │   └── Favoritos
│   ├── Mis equipos (Grupo)
│   │   ├── Proyectos compartidos
│   │   ├── Miembros
│   │   └── Configuración grupo
│   └── Cerrar sesión
│
├── ℹ️ INFORMACIÓN
│   ├── Acerca de
│   ├── Contacto
│   ├── Documentación
│   ├── Preguntas frecuentes
│   └── Reporte de errores
│
└── ⚙️ ADMINISTRACIÓN (Admin)
    ├── Usuarios
    ├── Estadísticas
    ├── Logs de simulación
    └── Configuración global
```

### 5.2 Flujos Principales de Usuario

#### Flujo: Crear y Simular Circuito
```
[Home] → [Simulador] → [Crear nuevo] → [Agregar componentes] 
→ [Conectar] → [Configurar parámetros] → [Simular] 
→ [Visualizar resultados] → [Guardar]
```

#### Flujo: Aprender de Ejemplo
```
[Home] → [Educación] → [Biblioteca] → [Seleccionar circuito] 
→ [Ver explicación] → [Cargar en simulador] → [Ejecutar] 
→ [Modificar parámetros] → [Observar cambios]
```

#### Flujo: Exportar Resultados
```
[Simulador] → [Simulación completada] → [Exportar] 
→ [Seleccionar formato] → [Descargar archivo]
```

### 5.3 Wireframes de Vistas Principales

#### Vista: Lienzo de Simulación (Desktop)
```
┌─────────────────────────────────────────────────┐
│ CircuitSim Op-Amp | [Logo] | Usuario | [Menú] │
├─────────┬─────────────────────────┬─────────────┤
│         │                         │             │
│ Panel   │    LIENZO DE DISEÑO    │  Propiedades│
│ Compo-  │                         │  Component  │
│ nentes  │  [Circuito visual]      │             │
│         │                         │             │
│ [+Nuevo]│                         │  R1: 1kΩ    │
│ [+Cargar]                          │  [Editar]   │
│         │                         │             │
├─────────┴─────────────────────────┴─────────────┤
│ [▶ Simular] [⏸ Pausa] [⏹ Detener]              │
├─────────────────────────────────────────────────┤
│         INSTRUMENTOS VIRTUALES                  │
│ ┌──────────────┬──────────────┬──────────────┐ │
│ │ Osciloscopio │  Multímetro  │ Generador   │ │
│ │   [Gráfica]  │  [Lecturas]  │  [Controles]│ │
│ └──────────────┴──────────────┴──────────────┘ │
└─────────────────────────────────────────────────┘
```

#### Vista: Biblioteca de Circuitos
```
┌─────────────────────────────────────────────────┐
│ [Logo] Educación | Biblioteca de Circuitos     │
├─────────────────────────────────────────────────┤
│                                                 │
│  🔍 [Buscar circuitos...]  [Filtrar] [Ordenar] │
│                                                 │
│  Categorías:                                    │
│  □ Equipo 1 | □ Equipo 2 | □ Equipo 3         │
│  □ Equipo 4 | □ Equipo 5 | □ Todos            │
│                                                 │
│  ┌─────────────┬─────────────┬─────────────┐  │
│  │ Amplificador│ Integrador  │ Comparador  │  │
│  │  Inversor   │             │ Schmitt     │  │
│  │ [Cargar]    │ [Cargar]    │ [Cargar]    │  │
│  └─────────────┴─────────────┴─────────────┘  │
│                                                 │
│  ┌─────────────┬─────────────┬─────────────┐  │
│  │ Sumador     │ Filtro      │ Oscilador   │  │
│  │             │ Pasa-Bajas  │ Wien        │  │
│  │ [Cargar]    │ [Cargar]    │ [Cargar]    │  │
│  └─────────────┴─────────────┴─────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🗄️ 06 - DISEÑO DE BASE DE DATOS

### 6.1 Diagrama ER

```
┌─────────────────────┐
│      USERS          │
├─────────────────────┤
│ id (PK)             │
│ email (UQ)          │
│ password (hash)     │
│ nombre              │
│ apellido            │
│ crear_fecha         │
│ ultimo_acceso       │
│ es_admin            │
│ estado              │
└────────┬────────────┘
         │
         ├──→ PROJECTS (1:N)
         ├──→ TEAMS (1:N)
         └──→ SETTINGS (1:1)
         
┌─────────────────────────────┐
│       PROJECTS              │
├─────────────────────────────┤
│ id (PK)                     │
│ user_id (FK → USERS)        │
│ titulo                      │
│ descripcion                 │
│ circuito_json               │
│ fecha_creacion              │
│ fecha_modificacion          │
│ es_publico                  │
│ tags (jsonb)                │
└────────┬────────────────────┘
         │
         ├──→ PROJECT_VERSIONS (1:N)
         ├──→ SIMULATIONS (1:N)
         └──→ EXPORTS (1:N)

┌────────────────────────────────┐
│    PROJECT_VERSIONS            │
├────────────────────────────────┤
│ id (PK)                        │
│ project_id (FK → PROJECTS)     │
│ circuito_json                  │
│ numero_version                 │
│ fecha_creacion                 │
│ descripcion_cambios            │
└────────────────────────────────┘

┌────────────────────────────────┐
│      SIMULATIONS               │
├────────────────────────────────┤
│ id (PK)                        │
│ project_id (FK → PROJECTS)     │
│ resultados_json                │
│ parametros_json                │
│ fecha_simulacion               │
│ tiempo_ejecucion (ms)          │
│ tipo_analisis                  │
│ estado                         │
└────────┬───────────────────────┘
         │
         └──→ MEASUREMENTS (1:N)

┌────────────────────────────────┐
│     MEASUREMENTS               │
├────────────────────────────────┤
│ id (PK)                        │
│ simulation_id (FK)             │
│ tipo (voltaje/corriente/etc)   │
│ ubicacion (nodo)               │
│ valor_medido                   │
│ valor_teorico                  │
│ error_porcentual               │
│ timestamp                      │
└────────────────────────────────┘

┌────────────────────────────────┐
│        COMPONENTS              │
├────────────────────────────────┤
│ id (PK)                        │
│ project_id (FK → PROJECTS)     │
│ tipo (OpAmp/R/C/L/etc)         │
│ modelo                         │
│ designador (R1, U1, etc)       │
│ valor                          │
│ parametros_json                │
│ posicion_x                     │
│ posicion_y                     │
│ orientacion                    │
└────────────────────────────────┘

┌────────────────────────────────┐
│      CONNECTIONS               │
├────────────────────────────────┤
│ id (PK)                        │
│ project_id (FK → PROJECTS)     │
│ componente1_id (FK)            │
│ pin1                           │
│ componente2_id (FK)            │
│ pin2                           │
│ tipo (señal/tierra/alimentacion)
└────────────────────────────────┘

┌────────────────────────────────┐
│        OPAMP_MODELS            │
├────────────────────────────────┤
│ id (PK)                        │
│ nombre_modelo                  │
│ fabricante                     │
│ parametros_json (GBW, SR, etc) │
│ datasheet_url                  │
│ activo                         │
└────────────────────────────────┘

┌────────────────────────────────┐
│         TEAMS                  │
├────────────────────────────────┤
│ id (PK)                        │
│ nombre                         │
│ descripcion                    │
│ fecha_creacion                 │
│ owner_id (FK → USERS)          │
└────────┬───────────────────────┘
         │
         └──→ TEAM_MEMBERS (N:N)

┌────────────────────────────────┐
│     TEAM_MEMBERS               │
├────────────────────────────────┤
│ team_id (FK → TEAMS)           │
│ user_id (FK → USERS)           │
│ rol (admin/miembro/viewer)     │
│ fecha_union                    │
└────────────────────────────────┘
```

### 6.2 Esquema de Tablas Detallado

#### Tabla: USERS
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP,
    es_admin BOOLEAN DEFAULT FALSE,
    estado VARCHAR(20) DEFAULT 'activo', -- activo, suspendido, eliminado
    storage_usado BIGINT DEFAULT 0,
    storage_maximo BIGINT DEFAULT 1073741824, -- 1GB
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);
```

#### Tabla: PROJECTS
```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    circuito_json JSONB NOT NULL, -- Netlist completo
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    es_publico BOOLEAN DEFAULT FALSE,
    tags JSONB DEFAULT '[]'::jsonb,
    viewed_count INTEGER DEFAULT 0,
    favorited_by JSONB DEFAULT '[]'::jsonb,
    INDEX idx_user_projects (user_id),
    INDEX idx_es_publico (es_publico)
);
```

#### Tabla: SIMULATIONS
```sql
CREATE TABLE simulations (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    resultados_json JSONB NOT NULL, -- Waveforms, magnitudes, etc
    parametros_json JSONB NOT NULL, -- Parámetros usados en simulación
    fecha_simulacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tiempo_ejecucion_ms INTEGER,
    tipo_analisis VARCHAR(50) NOT NULL, -- DC, AC, TRANSIENT
    estado VARCHAR(20) DEFAULT 'completado', -- completado, en_progreso, error
    mensaje_error TEXT,
    indice idx_project_simulations (project_id),
    INDEX idx_tipo_analisis (tipo_analisis)
);
```

#### Tabla: OPAMP_MODELS
```sql
CREATE TABLE opamp_models (
    id SERIAL PRIMARY KEY,
    nombre_modelo VARCHAR(100) UNIQUE NOT NULL, -- LM741, TL082, etc
    fabricante VARCHAR(100),
    parametros_json JSONB NOT NULL, -- {
                                      --   gBW: 1000000,
                                      --   slew_rate: 500000,
                                      --   vos: 0.002,
                                      --   ib: 80e-9,
                                      --   cmrr: 90,
                                      --   vcc_max: 32,
                                      --   i_out_max: 0.025
                                      -- }
    datasheet_url VARCHAR(500),
    activo BOOLEAN DEFAULT TRUE,
    fecha_agregacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6.3 Índices para Optimización

```sql
CREATE INDEX idx_projects_user_fecha ON projects(user_id, fecha_modificacion DESC);
CREATE INDEX idx_simulations_project_tipo ON simulations(project_id, tipo_analisis);
CREATE INDEX idx_components_project ON components(project_id);
CREATE INDEX idx_connections_project ON connections(project_id);
CREATE FULL TEXT INDEX fti_projects_titulo ON projects USING GIN(to_tsvector('spanish', titulo));
```

---

## 🎨 07 - GUÍA UI Y UX

### 7.1 Paleta de Colores

#### Colores Principales
```
Azul Eléctrico      #2563EB - Acciones, botones primarios
Morado Tecnológico  #7C3AED - Acento secundario, componentes
Blanco              #FFFFFF - Fondo principal
Negro Carbón        #161616 - Texto principal, fondos oscuros
```

#### Colores Secundarios
```
Gris Claro          #E9EEF5 - Fondos secundarios
Gris Medio          #A3AAB5 - Texto secundario
Turquesa            #2DD4BF - Confirmación, éxito
Lavanda             #C4B5FD - Información, tooltips
```

#### Color de Énfasis
```
Coral               #FF6B6B - Errores, advertencias, destrucción
```

### 7.2 Tipografía

#### Fuentes
- **Encabezados (H1-H3):** Inter Bold, 24-32px
- **Cuerpo:** Inter Regular, 14-16px
- **Código/Técnico:** Fira Code, 12-13px

#### Jerarquía
```
H1: 32px Bold        - Títulos principales (página)
H2: 24px Bold        - Títulos secundarios
H3: 20px Bold        - Subtítulos
Body: 16px Regular   - Texto principal
Small: 14px Regular  - Texto secundario
Caption: 12px Regular - Leyendas, notas
```

### 7.3 Componentes de UI

#### Botones
```
Primario:     Bg: #2563EB, Text: #FFFFFF, Padding: 12px 24px
Secundario:   Bg: #E9EEF5, Text: #2563EB, Padding: 12px 24px
Peligro:      Bg: #FF6B6B, Text: #FFFFFF, Padding: 12px 24px
Deshabilitado: Bg: #A3AAB5, Text: #FFFFFF, Opacity: 50%

Estados:
- Default
- Hover:   Brighten 10%
- Active:  Brighten 20%
- Focus:   Ring 2px #7C3AED
```

#### Tarjetas
```
Fondo:          #FFFFFF
Borde:          1px solid #E9EEF5
Border-radius:  8px
Box-shadow:     0 2px 8px rgba(22, 22, 22, 0.08)
Padding:        16px
```

#### Inputs
```
Fondo:          #FFFFFF
Borde:          1px solid #A3AAB5
Border-radius:  4px
Padding:        8px 12px
Focus-ring:     2px #2563EB
Placeholder:    #A3AAB5
```

#### Badges
```
Info:           Bg: #C4B5FD, Text: #7C3AED
Success:        Bg: #2DD4BF, Text: #005C54
Error:          Bg: #FF6B6B, Text: #FFFFFF
Warning:        Bg: #FFA366, Text: #FFFFFF
```

### 7.4 Principios UX

#### 1. Accesibilidad
- Contraste mínimo 4.5:1 para texto
- Soporte para navegación por teclado
- Labels explícitos en inputs
- ARIA labels en elementos complejos
- Soporte para screen readers

#### 2. Feedback Visual
- Indicadores de carga (spinners)
- Confirmaciones de acción (toasts)
- Cambio de cursor en elementos interactivos
- Transiciones suaves (200ms-300ms)
- Estados hover/active/focus claros

#### 3. Diseño Responsivo
```
Mobile:   < 640px   - Stack vertical, single column
Tablet:   640-1024px - 2 columns, adjusted spacing
Desktop:  > 1024px  - Full layout, 3+ columns
```

#### 4. Espaciado (8px Grid)
```
xs: 4px   - Espacios muy pequeños
sm: 8px   - Espacios pequeños
md: 16px  - Espacios medios (default)
lg: 24px  - Espacios grandes
xl: 32px  - Espacios muy grandes
```

### 7.5 Flujos de Interacción

#### Crear Circuito
```
1. Click en "Nuevo circuito"
2. Modal de nombre/descripción
3. Canvas en blanco
4. Indicación: "Arrastra componentes aquí"
5. Panel de componentes visible
```

#### Conectar Componentes
```
1. Click en pin del componente A
2. Visual feedback (pin destaca)
3. Cursor cambia a "crosshair"
4. Arrastrar hacia pin de componente B
5. Línea de conexión aparece
6. Validación de conexión
7. Confirmación visual (snap)
```

#### Ejecutar Simulación
```
1. Click en "Simular"
2. Validación de circuito (< 1s)
3. Indicador de progreso
4. Osciloscopio activa canales
5. Gráficas se renderean
6. Instrumentos muestran valores
7. "Simulación completada" toast
```

### 7.6 Casos de Uso de Diseño

#### Estado: Circuito Inválido
```
Visual:
- Canvas con borde rojo (#FF6B6B)
- Icono ⚠️ rojo en componentes sin conexión
- Tooltip: "Nodo flotante: Componente sin conexión"
- Botón "Simular" deshabilitado (gris)

Acción:
- Conectar nodo
- Tooltip desaparece
- Canvas vuelve a normal
- Botón "Simular" se habilita
```

#### Estado: Simulación en Progreso
```
Visual:
- Spinner en botón "Simular"
- Botones "Pausar" y "Detener" activos
- Osciloscopio muestra "Adquiriendo datos..."
- Progress bar: X% completado
- Tiempo estimado: Y segundos
```

#### Estado: Error en Simulación
```
Visual:
- Toast rojo: "Error en simulación"
- Detalles del error en expandible
- Sugerencia: "Verificar conexiones"
- Botón "Reintentar"
- Log técnico disponible (dev)
```

### 7.7 Iconografía
```
Simulación:    ▶️ (Play), ⏸️ (Pause), ⏹️ (Stop)
Archivo:       💾 (Save), 📂 (Open), 🗑️ (Delete)
Componentes:   🔧 (Edit), ⚙️ (Settings), ×️ (Remove)
Navegación:    ☰ (Menu), ◀️ (Back), ▶️ (Forward)
Estado:        ✓ (Success), ✗ (Error), ⚠️ (Warning)
```

---

## 📦 08 - BACKLOG Y PRIORIZACIÓN MOSCOW

### 8.1 Product Backlog (Ordenado por Prioridad)

#### MUST HAVE (Crítico para MVP)
```
ID   Descripción                                    Estimación  Story Points
────────────────────────────────────────────────────────────────────────────
M001 Lienzo de diseño interactivo                  2 sprints   21
M002 Librería de componentes básicos               1 sprint    13
M003 Motor de simulación (SPICE-like)              3 sprints   34
M004 Osciloscopio virtual (2 canales)              1 sprint    13
M005 Multímetro digital                           0.5 sprint   8
M006 Generador de funciones                        0.5 sprint   8
M007 Autenticación de usuarios                     1 sprint    13
M008 Guardar/cargar circuitos                      1 sprint    13
M009 Validación de circuitos                       0.5 sprint   8
M010 Soporte para Op-Amps LM741, TL082             0.5 sprint   8

TOTAL MVP: 8-9 semanas, 148 Story Points
```

#### SHOULD HAVE (Importante, versión 1.0)
```
ID   Descripción                                    Estimación  Story Points
────────────────────────────────────────────────────────────────────────────
S001 Osciloscopio 4 canales                        0.5 sprint   8
S002 Analizador de espectro (FFT)                  1 sprint    13
S003 Análisis AC (Bode)                            1 sprint    13
S004 Circuitos prediseñados (10+)                  2 sprints   21
S005 Tutoriales interactivos                       2 sprints   21
S006 Exportar a PDF/PNG                            1 sprint    13
S007 Gestión de equipos (colaborativo)             1 sprint    13
S008 Historial de simulaciones                     0.5 sprint   8
S009 Búsqueda de circuitos                         0.5 sprint   8
S010 Compartir circuitos públicos                  0.5 sprint   8
S011 Más modelos de Op-Amps (8+)                   0.5 sprint   8
S012 Biblioteca de diodos                          0.5 sprint   8

TOTAL v1.0: 10 semanas, 142 Story Points
```

#### COULD HAVE (Nice to Have)
```
ID   Descripción                                    Estimación  Story Points
────────────────────────────────────────────────────────────────────────────
C001 Análisis de Montecarlo                        2 sprints   21
C002 Optimización de circuitos                     2 sprints   21
C003 Integración con Python para scripting         1 sprint    13
C004 Modo oscuro                                   0.5 sprint   8
C005 Gamificación (badges, achievements)          1 sprint    13
C006 Mobile app (iOS/Android)                      6 sprints   89
C007 Generación automática de reportes             1 sprint    13
C008 Integración con GitHub para circuitos         1 sprint    13
C009 Análisis de ruido                             1 sprint    13
C010 Diseño de layout (autorouting)                2 sprints   21
```

#### WON'T HAVE (Fuera de alcance actual)
```
ID   Descripción                                    Razón
────────────────────────────────────────────────────────────────────────────
W001 Simulación de PCB 3D                          Muy complejo para MVP
W002 Integración con herramientas CAD              Requiere APIs externas
W003 Análisis de EMC/EMI                           Especializado, fuera de alcance
W004 Soporte para transistores discretos           Amplía complejidad significativamente
W005 Compilador de hardware (FPGA)                 Totalmente fuera de alcance
```

### 8.2 Matriz de Priorización

```
┌─────────────────────────────────────────────────────┐
│         MATRIZ MOSCOW CIRCUITSIM OP-AMP            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  MUST (44%)     │  SHOULD (36%)   │  COULD (20%)  │
│                 │                 │               │
│  ├─ Lienzo      │ ├─ Osciloscopio │ ├─ Montecarlo│
│  ├─ Componentes │ │   4 canales   │ ├─ Optimizar │
│  ├─ Simulador   │ ├─ FFT          │ ├─ Python    │
│  ├─ Osciloscopio│ ├─ Bode plots   │ ├─ Dark mode │
│  ├─ Multímetro  │ ├─ Circuitos    │ ├─ Gamificación
│  ├─ Generador   │ │   ejemplo     │ ├─ Mobile app│
│  ├─ Auth        │ ├─ Tutoriales   │ └─ Reportes  │
│  ├─ Guardar     │ ├─ Exportar     │               │
│  ├─ Validar     │ ├─ Equipos      │               │
│  └─ Op-Amps     │ └─ Más Op-Amps  │               │
│                 │                 │               │
└─────────────────────────────────────────────────────┘
```

### 8.3 Roadmap de Releases

```
MVP (Semana 1-9)
├── Sprint 1-2: Infraestructura + Lienzo
├── Sprint 2-3: Motor de simulación
├── Sprint 3: Instrumentos básicos
└── Sprint 4: Auth + Guardado

v1.0 (Semana 10-19)
├── Sprint 5-6: Análisis AC + Más instrumentos
├── Sprint 6-7: Biblioteca de circuitos
├── Sprint 7-8: Exportación + Colaboración
└── Sprint 8: Testing + Polish

v1.1 (Semana 20-24)
├── Sprint 9: Más Op-Amps + Análisis avanzado
├── Sprint 9-10: Mobile web
└── Sprint 10: Performance + SEO
```

---

## 🧪 09 - PLAN DE PRUEBAS

### 9.1 Estrategia de Pruebas

```
Nivel de Pruebas:
  ├── Unit Tests (70%)        - Jest, Vitest
  ├── Integration Tests (15%) - Supertest, Testing Library
  ├── E2E Tests (10%)         - Cypress, Playwright
  └── Manual Tests (5%)        - QA team
```

### 9.2 Pruebas Unitarias

#### Frontend - Componentes React

```typescript
// Test: CircuitCanvas.test.tsx
describe('CircuitCanvas', () => {
  test('debe agregar componente al canvas', () => {
    render(<CircuitCanvas />);
    const btn = screen.getByText('Agregar Op-Amp');
    fireEvent.click(btn);
    expect(screen.getByTestId('opamp-component')).toBeInTheDocument();
  });

  test('debe conectar dos componentes', () => {
    // Setup: canvas con 2 componentes
    // Acción: drag-drop conexión
    // Verificar: línea aparece
  });

  test('debe validar circuito incompleto', () => {
    // Setup: Op-Amp sin conexiones
    // Verificar: error mostrado
  });
});

// Test: PropertyPanel.test.tsx
describe('PropertyPanel', () => {
  test('debe actualizar valor de resistencia', () => {
    render(<PropertyPanel component={resistor} />);
    const input = screen.getByDisplayValue('1000');
    fireEvent.change(input, { target: { value: '2200' } });
    expect(onChange).toHaveBeenCalledWith(2200);
  });
});

// Test: Oscilloscope.test.tsx
describe('Oscilloscope', () => {
  test('debe mostrar 2 canales', () => {
    render(<Oscilloscope channels={2} />);
    expect(screen.getAllByTestId('channel')).toHaveLength(2);
  });

  test('debe actualizar waveform en tiempo real', () => {
    // Simular datos de simulación
    // Verificar que gráfica se actualiza
  });
});
```

#### Backend - Motor de Simulación

```javascript
// Test: CircuitParser.test.js
describe('CircuitParser', () => {
  test('debe parsear netlist válido', () => {
    const netlist = {
      components: [...],
      connections: [...]
    };
    const circuit = CircuitParser.parse(netlist);
    expect(circuit.isValid()).toBe(true);
  });

  test('debe detectar circuito inválido', () => {
    const invalidNetlist = { /* sin tierra */ };
    expect(() => CircuitParser.parse(invalidNetlist)).toThrow();
  });

  test('debe crear matriz admitancia correcta', () => {
    // Circuito simple conocido
    // Verificar valores de Y matrix
  });
});

// Test: SimulationEngine.test.js
describe('SimulationEngine', () => {
  test('seguidor de voltaje debe tener ganancia 1', () => {
    const circuit = createBufferCircuit();
    const results = SimulationEngine.run(circuit, {
      type: 'DC',
      Vin: 5
    });
    expect(results.Vout).toBeCloseTo(5, 2); // ±5%
  });

  test('amplificador inversor debe calcular ganancia correcta', () => {
    const circuit = createInvertingAmp(1000, 10000); // Rf=10k, Rin=1k, Av=-10
    const results = SimulationEngine.run(circuit, { Vin: 1 });
    expect(results.Vout).toBeCloseTo(-10, 1);
  });

  test('integrador debe convertir cuadrada a triangular', () => {
    const circuit = createIntegrator();
    const results = SimulationEngine.run(circuit, {
      type: 'TRANSIENT',
      Vin: squareWave(1, 1000),
      tFinal: 4e-3
    });
    // Verificar forma de onda triangular
  });

  test('trigger Schmitt debe mostrar histéresis', () => {
    const circuit = createSchmittTrigger();
    // Aplicar rampa lenta
    // Verificar voltajes de disparo
  });
});

// Test: FFTAnalyzer.test.js
describe('FFTAnalyzer', () => {
  test('debe detectar frecuencia fundamental', () => {
    const signal = generateSineWave(1000, 1000); // 1kHz
    const fft = FFTAnalyzer.compute(signal);
    const peak = fft.getPeak();
    expect(peak.frequency).toBeCloseTo(1000, -1);
  });

  test('debe encontrar armónicos', () => {
    const signal = generateSquareWave(1000, 1000);
    const fft = FFTAnalyzer.compute(signal);
    const harmonics = fft.getHarmonics();
    expect(harmonics).toContainFrequencies([1000, 3000, 5000, 7000]);
  });
});
```

### 9.3 Pruebas de Integración

```javascript
// Test: End-to-End Simulation Flow
describe('E2E: Simulación completa', () => {
  test('flujo: crear → simular → exportar', async () => {
    // 1. Crear nuevo circuito
    const { canvas } = render(<CircuitSimulator />);
    
    // 2. Agregar componentes
    addComponent('OpAmp', 'LM741');
    addComponent('Resistor', '1k');
    addComponent('Resistor', '10k');
    
    // 3. Conectar componentes
    connect('OpAmp.Pin2', 'Ground');
    connect('OpAmp.Pin3', 'Resistor1.terminal1');
    
    // 4. Configurar parámetros
    setComponentValue('Resistor1', 1000);
    setComponentValue('Resistor2', 10000);
    
    // 5. Ejecutar simulación
    const results = await SimulationEngine.run();
    
    // 6. Verificar resultados
    expect(results.status).toBe('completado');
    expect(results.measurements).toBeDefined();
    
    // 7. Exportar
    const pdf = await exportToPDF(results);
    expect(pdf.size).toBeGreaterThan(1000);
  });
});
```

### 9.4 Pruebas de Precisión

```javascript
// Test: Validar contra valores teóricos
describe('Precisión vs Teoría', () => {
  const tolerance = 0.05; // ±5%

  test('Amplificador Inversor: Av = -Rf/Rin', () => {
    const testCases = [
      { Rf: 10000, Rin: 1000, expected: -10 },
      { Rf: 100000, Rin: 10000, expected: -10 },
      { Rf: 47000, Rin: 4700, expected: -10 }
    ];
    
    testCases.forEach(tc => {
      const circuit = createInvertingAmp(tc.Rin, tc.Rf);
      const results = SimulationEngine.run(circuit, { Vin: 1 });
      const error = Math.abs((results.Vout - tc.expected) / tc.expected);
      expect(error).toBeLessThan(tolerance);
    });
  });

  test('Integrador: Vout = -(1/RC) ∫Vin dt', () => {
    const R = 100000;
    const C = 1e-6;
    const circuit = createIntegrator(R, C);
    
    // Entrada: onda cuadrada
    const Vin = [5, 5, 5, 5, -5, -5, -5, -5];
    const results = SimulationEngine.run(circuit, { Vin });
    
    // Esperado: rampa triangular
    // Verificar pendiente = (Vin / (R*C))
    const expectedSlope = 5 / (R * C);
    // ... verificar
  });

  test('Filtro Pasa-Bajas: fc = 1/(2π*RC)', () => {
    const R = 1600;
    const C = 100e-9;
    const circuit = createLowPassFilter(R, C);
    
    // Teoría: fc = 1/(2π*1600*100e-9) ≈ 995 Hz
    const expectedFc = 1 / (2 * Math.PI * R * C);
    
    const results = SimulationEngine.runAC(circuit, {
      fStart: 10,
      fEnd: 100000,
      points: 1000
    });
    
    const measuredFc = results.getCutoffFrequency();
    const error = Math.abs((measuredFc - expectedFc) / expectedFc);
    expect(error).toBeLessThan(0.1); // ±10%
  });
});
```

### 9.5 Test Cases por Tema de Equipo

#### Equipo 1: Fundamentos
```
T1-001: Seguidor de voltaje (buffer) - Av ≈ 1
T1-002: Comparador en lazo abierto - Saturación a rieles
T1-003: Efecto Slew Rate en onda cuadrada alta frecuencia
T1-004: GBW - Producto ganancia-ancho de banda
```

#### Equipo 2: Amplificación
```
T2-001: Amplificador inversor - Av = -Rf/Rin
T2-002: Amplificador no inversor - Av = 1 + (Rf/Rin)
T2-003: Sumador - Vout = -(Rf)(V1/R1 + V2/R2 + V3/R3)
T2-004: Restador (diferencial) - CMRR (Common Mode Rejection Ratio)
```

#### Equipo 3: Procesamiento Dinámico
```
T3-001: Integrador - Entrada cuadrada → salida triangular
T3-002: Diferenciador - Entrada triangular → salida cuadrada
T3-003: Filtro pasa-bajas - fc = 1/(2πRC)
T3-004: Filtro Sallen-Key 2do orden - Q y fc correctos
```

#### Equipo 4: No Lineales
```
T4-001: Comparador con referencia fija
T4-002: Trigger de Schmitt - Histéresis visible
T4-003: Rectificador de precisión - Sin caída 0.7V
T4-004: Eliminación de ruido con histéresis
```

#### Equipo 5: Instrumentación
```
T5-001: Amplificador de instrumentación - Alta impedancia entrada
T5-002: Puente de Wheatstone - Detección de desbalance
T5-003: Oscilador Puente de Wien - Criterio Barkhausen
T5-004: Multivibrador astable - Generación onda cuadrada
```

### 9.6 Criterios de Aceptación

| Aspecto | Criterio | Métrica |
|---------|----------|---------|
| Cobertura | >80% de código | Coverage > 80% |
| Precisión | ±5% DC, ±10% AC | Error < límite |
| Performance | Simulación < 100ms | 95%ile < 100ms |
| Confiabilidad | Tasa de error < 1% | Errors/1000runs < 10 |
| UX | NPS > 8 | User satisfaction |

---

## 🏗️ 10 - ARCHITECTURAL DECISION RECORDS (ADR)

### ADR-001: Lenguaje Backend

**Estado:** APROBADO

**Contexto:**
Necesitamos elegir lenguaje para backend que soporte:
- Simulación numérica intensiva
- Conexiones concurrentes de usuarios
- Bajo overhead de memoria

**Opciones Consideradas:**
1. Python + asyncio
2. Node.js + Express
3. Go
4. Rust

**Decisión:**
**Node.js + Express** con posibilidad de WASM para cálculos pesados

**Justificación:**
- Reuse de conocimiento frontend (JavaScript)
- Ecosystem maduro (npm, libraries)
- Good concurrency model con event loop
- Fácil de desplegar en serverless

**Consecuencias:**
- ✓ Unificación de stack
- ✓ Rápido desarrollo
- ✗ No es óptimo para CPU-bound (mitigado con WASM)
- ✗ Single-threaded (Node cluster module)

---

### ADR-002: Estrategia de Simulación

**Estado:** APROBADO

**Contexto:**
¿Ejecutar simulación en cliente (JavaScript) o servidor (Node)?

**Opciones:**
1. Todo en JavaScript (Cliente)
2. Todo en backend
3. Híbrido: Validación cliente, cálculo servidor

**Decisión:**
**Híbrido**: Validación lightweight en cliente, motor de simulación pesado en servidor

**Justificación:**
- ✓ Responsivo: Feedback inmediato en UI
- ✓ Escalable: Servidor maneja cálculos
- ✓ Preciso: Numérica en entorno controlado
- ✗ Latencia: Requiere API call

**Alternativa con WASM:**
- Compilar motor SPICE a WebAssembly
- Simular en cliente para baja latencia
- Escalar para usuarios Heavy

---

### ADR-003: Base de Datos

**Estado:** APROBADO

**Contexto:**
¿SQL vs NoSQL para almacenar circuitos y resultados?

**Opciones:**
1. PostgreSQL (SQL)
2. MongoDB (NoSQL)
3. Hybrid: PostgreSQL + Redis

**Decisión:**
**PostgreSQL + Redis Cache**

**Justificación:**
- ✓ Relaciones complejas (Users, Projects, Simulations)
- ✓ JSONB para netlist flexible
- ✓ ACID transactions
- ✓ Redis para caché de resultados frecuentes

**Schema:**
```
USERS (1:N) PROJECTS (1:N) SIMULATIONS
                      ↓
                  COMPONENTS
                      ↓
                  CONNECTIONS
```

---

### ADR-004: Arquitectura del Motor de Simulación

**Estado:** APROBADO

**Contexto:**
¿Implementar motor desde cero o usar librería existente?

**Opciones:**
1. Implementación propia (MNA - Modified Nodal Analysis)
2. Integrar ngspice (C library, bindings Node)
3. Usar simulador JavaScript existente (jsSpice)

**Decisión:**
**Implementación propia en JavaScript/TypeScript + WASM opcional**

**Justificación:**
- ✓ Control total sobre algoritmo
- ✓ Optimizable para web
- ✓ Fácil de mantener
- ✗ Más trabajo inicial

**Fases:**
1. Prototipo JavaScript puro
2. Optimizar con WASM si necesario
3. Considerar ngspice bindings para precisión

---

### ADR-005: Frontend Framework

**Estado:** APROBADO

**Contexto:**
Lienzo de circuitos + UI compleja requiere framework robusto

**Opciones:**
1. React + Konva.js
2. Vue + PixiJS
3. Angular + Three.js
4. Svelte + Canvas

**Decisión:**
**React + Konva.js + TypeScript**

**Justificación:**
- ✓ React: Comunidad grande, librerías maduras
- ✓ Konva.js: Especializado en lienzo interactivo
- ✓ TypeScript: Type safety para simulador complejo
- ✓ Redux: State management predecible

---

### ADR-006: Gestión de Estado

**Estado:** APROBADO

**Contexto:**
Simulador tiene estado complejo:
- Circuito (componentes, conexiones)
- Simulación en progreso
- Resultados
- UI state

**Opciones:**
1. Redux Toolkit
2. Zustand
3. Jotai
4. Context API puro

**Decisión:**
**Redux Toolkit**

**Justificación:**
- ✓ DevTools (time travel debugging)
- ✓ Middleware para logging, analytics
- ✓ Predictable updates
- ✓ Community + ecosystem

---

### ADR-007: Autenticación

**Estado:** APROBADO

**Contexto:**
Usuarios necesitan crear cuenta, mantener sesión segura

**Opciones:**
1. JWT + Refresh token
2. Session-based (cookies)
3. OAuth2 con terceros

**Decisión:**
**JWT + Refresh token + HttpOnly cookies**

**Justificación:**
- ✓ Stateless: Escalable
- ✓ CORS-friendly
- ✓ Refresh token rotation: Seguridad
- ✓ HttpOnly cookies: Protección contra XSS

---

### ADR-008: Despliegue

**Estado:** APROBADO

**Contexto:**
¿Dónde alojar la aplicación?

**Opciones:**
1. AWS (EC2 + RDS)
2. DigitalOcean (App Platform)
3. Vercel + AWS Lambda
4. GCP Cloud Run

**Decisión:**
**Docker en DigitalOcean App Platform (MVP) → AWS para escala**

**Justificación:**
- ✓ DigitalOcean: Más simple, económico para MVP
- ✓ Docker: Portable a cualquier proveedor
- ✓ AWS: Para escala (simulations distribuidas)

**Pipeline:**
```
Git push → GitHub Actions → Docker build → Push ECR/Registry → 
Deploy DigitalOcean App Platform
```

---

### ADR-009: Versionado de Circuitos

**Estado:** APROBADO

**Contexto:**
Usuarios necesitan historial de cambios, poder revertir

**Opciones:**
1. Snapshot completo cada guardado
2. Delta (solo cambios)
3. Git-like DAG

**Decisión:**
**Snapshot con compresión, máximo 10 versiones por proyecto**

**Justificación:**
- ✓ Simple de implementar
- ✓ Suficiente para MVP
- ✗ Usa más almacenamiento (mitigado con límite)

**Future:** Implementar Delta si es issue

---

### ADR-010: Testing Strategy

**Estado:** APROBADO

**Contexto:**
Simulador requiere alta confiabilidad (precisión matemática)

**Decisión:**
**Pirámide de tests: Unit > Integration > E2E**
- Unit Tests (70%): Lógica simulación, componentes React
- Integration Tests (20%): Flujos API, base de datos
- E2E Tests (10%): Happy path, flujos usuario

**Tools:**
- Frontend: Vitest + React Testing Library + Cypress
- Backend: Jest + Supertest + Postgres test containers
- E2E: Cypress

---

## 📋 11 - PLAN DE IMPLEMENTACIÓN

### 11.1 Cronograma General

```
FASE 1: PROTOTIPO MVP (Semanas 1-9)
├── Sprint 0 (Semana 0): Setup infraestructura
├── Sprint 1-2: Backend + Frontend base
├── Sprint 2-3: Motor simulación
├── Sprint 3-4: Instrumentos + Integración
└── Sprint 4: Testing + Deploy

FASE 2: VERSIÓN 1.0 (Semanas 10-19)
├── Sprint 5-6: Análisis AC, más Op-Amps
├── Sprint 6-7: Biblioteca y tutoriales
├── Sprint 7-8: Colaboración y exportación
└── Sprint 8: Polish + Marketing prep

FASE 3: OPTIMIZACIÓN (Semanas 20-24)
├── Sprint 9: Performance, mobile
└── Sprint 10: SEO, release
```

### 11.2 Sprint 0: Setup Infraestructura (Semana 1)

#### Sprint 0.1: Preparar Repositorios
```
Tarea: Crear estructura de repositorios
├── circuitsim-frontend (React app)
├── circuitsim-backend (Node API)
├── circuitsim-shared (Tipos, utilitarios)
├── circuitsim-docs (Documentación)
└── circuitsim-devops (Docker, workflows)

Deliverable:
├── GitHub repos creados
├── CI/CD pipeline inicial (GitHub Actions)
├── Docker Compose con stack completo
└── README con instrucciones setup
```

#### Sprint 0.2: Configurar Entorno Local
```
Tarea: Ambiente desarrollo funcional
├── Node.js 18+, npm/yarn
├── PostgreSQL local (Docker)
├── Redis local (Docker)
├── VSCode extensions recomendados

Deliverable:
├── docker-compose.yml
├── .env.example
├── Setup guide
└── First run checklist
```

#### Sprint 0.3: Boilerplate Frontend
```
Tarea: Proyecto React base
├── Vite + React 18
├── TypeScript + ESLint
├── Tailwind CSS
├── Redux Toolkit

Deliverable:
├── Proyecto compilable
├── Home page placeholder
├── Componentes base
└── Build pipeline
```

#### Sprint 0.4: Boilerplate Backend
```
Tarea: Servidor Express básico
├── Express.js + TypeScript
├── PostgreSQL connection
├── Redis connection
├── JWT authentication setup

Deliverable:
├── Server running
├── DB migrations básicas
├── API health check
└── Auth endpoints estructura
```

### 11.3 Sprint 1-2: Lienzo y Componentes (Semanas 2-3)

#### Sprint 1: Lienzo Interactivo

**Objetivos:**
- [ ] Renderizar lienzo vacío con Konva.js
- [ ] Drag-and-drop de componentes
- [ ] Selección y eliminación de componentes

**Tareas:**

| Tarea | Puntos | Asignado | Estado |
|-------|--------|----------|--------|
| Crear componente CircuitCanvas | 5 | Frontend | En progreso |
| Implementar drag-drop con Konva | 8 | Frontend | - |
| Crear ComponentPalette | 5 | Frontend | - |
| Renderizar resistencias, capacitores, Op-Amps | 8 | Frontend | - |
| Selección y edición de componentes | 5 | Frontend | - |
| Tests unitarios Canvas | 3 | QA | - |

**Definición de Hecho:**
- [ ] Puedo arrastrar componente al lienzo
- [ ] El componente se renderiza correctamente
- [ ] Puedo seleccionar y cambiar tamaño
- [ ] Puedo eliminar componente (Delete key)
- [ ] 95% tests passing

**Demo:**
```
Video: Agregar 3 componentes, mover, eliminar
```

#### Sprint 2: Conexiones y Validación

**Objetivos:**
- [ ] Conectar terminales de componentes
- [ ] Validar topología de circuito
- [ ] Visualizar errores en UI

**Tareas:**

| Tarea | Puntos | Asignado | Estado |
|-------|--------|----------|--------|
| Implementar motor de conexiones | 13 | Backend | - |
| UI para crear conexiones | 8 | Frontend | - |
| Validador de circuitos | 8 | Backend | - |
| Visualización de errores | 5 | Frontend | - |
| Tests de validación | 5 | QA | - |

**Definición de Hecho:**
- [ ] Puedo conectar dos componentes
- [ ] Línea de conexión se visualiza
- [ ] Sistema detecta conexiones inválidas
- [ ] Mensajes de error claros
- [ ] 90% tests passing

---

### 11.4 Sprint 3-4: Motor de Simulación (Semanas 4-6)

#### Sprint 3: Análisis DC

**Objetivos:**
- [ ] Implementar Modified Nodal Analysis (MNA)
- [ ] Resolver circuitos simples DC
- [ ] Calcular voltajes nodales

**Tareas:**

| Tarea | Puntos | Asignado | Estado |
|-------|--------|----------|--------|
| Implementar MNA solver | 21 | Backend | - |
| Parsear netlist de circuito | 13 | Backend | - |
| Crear matriz admitancia | 13 | Backend | - |
| Tests de precisión (±5%) | 8 | QA | - |
| Documentar algoritmo | 5 | Docs | - |

**Algoritmo:**
```javascript
class MNASolver {
  // 1. Construir Y-matrix (admitancia nodal)
  // 2. Construir I-vector (inyecciones de corriente)
  // 3. [Y][V] = [I]
  // 4. Resolver sistema lineal
  // 5. Retornar voltajes nodales
}
```

**Test Cases:**
```
✓ Circuito serie R-V: V=IR
✓ Divisor de voltaje
✓ Puente de Wheatstone balanceado
✓ Malla múltiple
```

#### Sprint 4: Simulación DC + Análisis Transitorio

**Objetivos:**
- [ ] Extender motor a análisis transitorio
- [ ] Implementar Euler/RK numérico
- [ ] Integración con Op-Amps

**Tareas:**

| Tarea | Puntos | Asignado | Estado |
|-------|--------|----------|--------|
| Implementación Runge-Kutta 4to orden | 21 | Backend | - |
| Modelo de Op-Amp real (datasheets) | 13 | Backend | - |
| Manejo de eventos (sew rate, saturación) | 13 | Backend | - |
| Tests integradores | 8 | QA | - |

**Modelos Op-Amp:**
```json
{
  "LM741": {
    "gBW": 1e6,
    "slew_rate": 0.5e6,
    "Vos": 2e-3,
    "Ib": 80e-9,
    "CMRR": 90,
    "Vcc_max": 32
  }
}
```

---

### 11.5 Sprint 5: Instrumentos Virtuales (Semana 7-8)

**Osciloscopio Virtual**
- [ ] Renderizar 2 canales
- [ ] Escala de tiempo ajustable
- [ ] Base de datos de puntos

**Multímetro Digital**
- [ ] Mostrar Voltage, Current, Resistance
- [ ] Modo automático / manual

**Generador de Funciones**
- [ ] Onda senoidal, cuadrada, triangular
- [ ] Control de frecuencia/amplitud

**Analizador de Espectro**
- [ ] FFT de datos simulación
- [ ] Gráfica en decibeles

---

### 11.6 Sprint 6: Autenticación y Persistencia (Semana 9)

**Autenticación JWT**
- [ ] Registro de usuarios
- [ ] Login con email/password
- [ ] Refresh token rotation

**Guardar/Cargar Circuitos**
- [ ] Serializar circuito JSON
- [ ] Almacenar en PostgreSQL
- [ ] Interfaz de proyectos

---

### 11.7 Estimación Recursos

#### Equipo MVP
```
Frontend Leads      (2): React, Konva, UI/UX
Backend Leads       (2): Node, Simulación numérica
DevOps/Infra        (1): Docker, CI/CD, DB
QA Engineer         (1): Testing, validación
Product Manager     (1): Requisitos, roadmap
---
TOTAL: 7 personas
```

#### Tiempo Total
```
MVP (v0.1):     9 semanas    = 252 person-days
v1.0:          10 semanas    = 280 person-days
Optimización:   5 semanas    = 140 person-days
---
TOTAL:         24 semanas    = 672 person-days
```

### 11.8 Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|--------|-----------|
| Precisión numérica insuficiente | Media | Alto | Tests tempranos, benchmarking |
| Desempeño simulación lenta | Media | Alto | Profiling, WASM si necesario |
| Complejidad motor más de lo esperado | Alto | Alto | MVP acotado, iterativo |
| Rotación de personal | Baja | Alto | Documentación, código limpio |
| Cambio de requisitos | Media | Medio | Sprints cortos, feedback |

---

## 📊 RESUMEN EJECUTIVO

### Visión
Crear un simulador web educativo de circuitos con amplificadores operacionales que permita a estudiantes de ingeniería comprender conceptos de electrónica analógica mediante simulación interactiva.

### Objetivos Clave
1. ✅ Simular 5 temas de equipos universitarios
2. ✅ Precisión ±5% DC, ±10% AC vs teoría
3. ✅ Interfaz intuitiva y responsiva
4. ✅ Exportación de resultados (PDF/PNG)
5. ✅ Colaboración en equipos

### Milestones
- **Semana 9**: MVP funcional (3 tipos de circuitos)
- **Semana 19**: v1.0 completa (todos los temas)
- **Semana 24**: Versión optimizada y pulida

### Inversión
- **Equipo**: 7 personas
- **Duración**: 24 semanas
- **Presupuesto**: Depende de estructura de costos

---

**Documento compilado**: 2024-2025
**Versión**: 1.0
**Status**: ACTIVO

