// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// IMPORTS
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

import {setup} from './setup.js';

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// in case we switch to 
// Node mode and Webpack
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

// const cytoscape = require('../../node_modules/cytoscape/dist/cytoscape.cjs.js')

// import * as cytoscape from '../../node_modules/cytoscape/dist/cytoscape.esm.min.js'


// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// TODO
// 1) FIx interaction between sliders, since
//    restoring an edge when its ends have been
//    removed gives an error
// 2) Size of nodes depending on centrality
// 3) color of edges depending on weight
// 4) add to tooltip the centralities 
//    and maybe other data
// 5) Implement better layout
// 6) Add button for lonely nodes
// 7) Understand browser memory handling
// 8) Optimize centrality calculation
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

var file = './gownshirt_trace.cyto.json';
var headless = true;

console.log("Reading file " + file);
fetch(file)
  .then(function (response) {
    console.log("Reading file done");
    return (response.json());
  })
  .then(data => setup(data, headless, 'cyto'));
