// O bundle `plotly.js-dist-min` (alias no vite.config.ts) tem a mesma API
// do `plotly.js`; os tipos vêm de @types/plotly.js.
declare module "plotly.js-dist-min" {
  import * as Plotly from "plotly.js";
  export default Plotly;
}
