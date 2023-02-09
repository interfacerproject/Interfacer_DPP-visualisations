// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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

var file = './dpp.cyto.json';
var headless = false;

console.log("Reading file " + file);
fetch(file)
  .then(function (response) {
    console.log("Reading file done");
    return (response.json());
  })
  .then(data => setup(data, headless, 'cyto'));
