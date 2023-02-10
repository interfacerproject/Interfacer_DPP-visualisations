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
// SETUP FUNCTIONS
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

import { hideAllTippies, createToolTip } from './tootips.js';
import { makeSliders } from './sliders.js';
import { applyStyle, makeLayout } from './layout.js';
import { groupNodes } from './groups.js';

export var cy = {};
export var headless;


export function setup(data, headless, elementId) {
  console.debug("Setup started")


  const data_size_limit = 5000;

  if ((data.elements.nodes.length + data.elements.edges.length) > data_size_limit) {
    headless = true;
  }

  var container = null;

  if (headless == true) {
    container = null;
  } else {
    container = document.getElementById(elementId);
  }

  cy = cytoscape({


    container: container, // container to render in

    elements: data.elements,

    data: { groups: data.groups },

    // initial viewport state:
    zoom: 1,
    pan: { x: 0, y: 0 },

    // interaction options:
    minZoom: 1e-50,
    maxZoom: 1e50,
    zoomingEnabled: true,
    userZoomingEnabled: true,
    panningEnabled: true,
    userPanningEnabled: true,
    boxSelectionEnabled: true,
    selectionType: 'single',
    touchTapThreshold: 8,
    desktopTapThreshold: 4,
    autolock: false,
    autoungrabify: false,
    autounselectify: false,

    // rendering options:
    headless: headless,
    styleEnabled: true,
    hideEdgesOnViewport: false,
    textureOnViewport: false,
    motionBlur: false,
    motionBlurOpacity: 0.2,
    // wheelSensitivity: 1, //Do not set it, cytoscape complains
    pixelRatio: 'auto'

  });



  cy.on('tap', function (e) {
    if (e.target === cy) {
      hideAllTippies(cy);
    }
  });

  cy.on('tap', 'edge', function (e) {
    hideAllTippies(cy);
  });

  cy.on('zoom pan', function (e) {
    hideAllTippies(cy);
  });



  cy.ready(function () {
    console.debug("Instance ready")

    cy.batch(applyStyle);
    console.debug("Style applied");

    // removeSpinner();

    // makeSliders(cntr_minmax[cntr_names[0]], weight_minmax, date_minmax);


    if (headless) {
      cy.mount(document.getElementById(elementId));
    }
    
    groupNodes(cy);
    console.debug("Nodes grouped");
    
    createToolTip(cy);
    console.debug("Tooltips added");

    makeLayout(cy.elements());
    console.debug("Layout applied");
    
    console.debug("Instance configured");

  });

  console.log("Setup done")
  // return (cy);
}
