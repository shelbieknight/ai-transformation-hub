@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body,
#root {
  height: 100%;
}

body {
  margin: 0;
  font-family: "Manrope", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  background-color: #F6F7F9;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

::selection {
  background: rgba(110, 73, 203, 0.18);
}

/* tabular figures for any data set in mono */
.tnum {
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
