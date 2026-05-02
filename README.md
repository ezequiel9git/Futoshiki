# :sparkles: Futoshiki

Puzzle de desigualdades japonés construido con React, Vite y Tailwind CSS.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)

<br><br>

## :thinking: ¿Qué es Futoshiki?

Futoshiki (不等式, *desigualdad* en japonés) es un puzzle lógico de origen japonés creado en 2001 que me encanta. El objetivo es rellenar una cuadrícula de N×N con los números del 1 al N de manera que:

- Cada número aparezca **exactamente una vez** en cada fila y en cada columna.
- Se respeten todas las **restricciones de desigualdad** (`<` y `>`) que aparecen entre celdas adyacentes.

No se necesita hacer suposiciones: cada puzzle tiene **una única solución lógica**.

<br><br>

## :clipboard: Características

- **3 niveles de dificultad** — Fácil (4×4), Medio (5×5) y Difícil (6×6).
- **Generador de puzzles aleatorios** — cada partida es única.
- **Validación en tiempo real** — los errores se resaltan al instante en rojo.
- **Restricciones visuales** — desigualdades horizontales en ámbar, verticales en esmeralda.
- **Resaltado de fila y columna** — al seleccionar una celda se ilumina su contexto.
- **Sistema de pistas** — revela una celda aleatoria vacía (tecla `H`).
- **Cronómetro y contador de errores** — lleva el registro de tu rendimiento.
- **Modal de victoria** con puntuación perfecta si terminas sin errores ni pistas.
- **Control por teclado** completo.
- **Diseño oscuro** con gradiente animado, tipografía Cinzel y estética dorada.

<br><br>

## :computer: Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| [React](https://react.dev/) | 19 | Interfaz de usuario y estado |
| [Vite](https://vitejs.dev/) | 6 | Bundler y servidor de desarrollo |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Utilidades CSS base |
| [Google Fonts](https://fonts.google.com/) | — | Tipografías Cinzel y Crimson Pro |

<br><br>

## :minidisc: Instalación y puesta en marcha

### Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- npm v9 o superior

### Pasos

```bash
# 1. Clona el repositorio
git clone https://github.com/tu-usuario/futoshiki.git
cd futoshiki

# 2. Instala las dependencias
npm install

# 3. Arranca el servidor de desarrollo
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

### Compilar para producción

```bash
npm run build
```

Los archivos optimizados se generan en la carpeta `dist/`. Para previsualizar el build:

```bash
npm run preview
```

<br><br>


## :bookmark_tabs: Estructura del proyecto

```
futoshiki/
├── public/                 # Archivos estáticos
├── src/
│   ├── futoshiki.js        # Lógica del juego: generador, validador y solver
│   ├── Game.jsx            # Componente principal y estado global
│   ├── index.css           # Estilos globales y variables CSS
│   └── main.jsx            # Punto de entrada de la aplicación
├── index.html
├── vite.config.js          # Configuración de Vite + Tailwind
└── package.json
```

<br><br>

## :scroll: Cómo jugar

1. **Selecciona una celda** vacía haciendo clic sobre ella.
2. **Introduce un número** usando el teclado numérico o los botones en pantalla.
3. Respeta las **restricciones de desigualdad** entre celdas adyacentes:
   - `<` significa que la celda izquierda/superior debe ser **menor** que la derecha/inferior.
   - `>` significa que debe ser **mayor**.
4. Cada número del 1 al N debe aparecer **una sola vez** por fila y por columna.
5. El puzzle está resuelto cuando todas las celdas son correctas y no hay conflictos.

### Controles de teclado

| Tecla | Acción |
|---|---|
| `1` – `N` | Introducir número en la celda seleccionada |
| `Backspace` / `Delete` | Borrar el valor de la celda seleccionada |
| `H` | Revelar una pista |
| `Escape` | Deseleccionar celda |

<br><br>

## :microscope: Lógica interna

### Generación de puzzles (`futoshiki.js`)

El generador sigue tres fases:

1. **Solución completa** — se construye un tablero N×N válido mediante backtracking con orden aleatorio, garantizando que no haya repeticiones en filas ni columnas.
2. **Restricciones** — se seleccionan aleatoriamente pares de celdas adyacentes y se registra su relación de desigualdad según la solución.
3. **Puzzle** — se eliminan valores del tablero hasta dejar el número de pistas configurado por dificultad, manteniendo siempre la jugabilidad.

### Validación en tiempo real

Tras cada entrada, `checkConstraints` comprueba:
- Repeticiones en filas y columnas.
- Incumplimiento de restricciones horizontales y verticales.

Las celdas en conflicto se marcan con animación de error.

<br><br>

## :chart_with_upwards_trend: Configuración de dificultad

| Nivel | Tamaño | Pistas iniciales | Restricciones visibles |
|---|---|---|---|
| Fácil | 4 × 4 | 10 | 6 |
| Medio | 5 × 5 | 10 | 8 |
| Difícil | 6 × 6 | 8 | 10 |


<br><br>

## :black_nib: Créditos

Este juego ha sido desarrollado con mucho cariño por Ezequiel Parrado López.

<br>
