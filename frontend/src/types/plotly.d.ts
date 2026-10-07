// O react-plotly.js usa o bundle `plotly.js-dist-min` (alias no vite.config.ts).
// Só precisamos do resize; o resto dos tipos vem de @types/plotly.js.
declare module "plotly.js-dist-min" {
  const Plotly: {
    Plots: { resize(graphDiv: HTMLElement): Promise<void> };
  };
  export default Plotly;
}
