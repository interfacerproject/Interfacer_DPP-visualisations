// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// SETUP FUNCTIONS
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

import {hideAllTippies, createToolTip} from './tootips.js';
import {makeSliders} from './sliders.js';
import {applyStyle, makeLayout} from './layout.js';

export var cy = {};
export var headless;


export function setup(data, headless, elementId) {
    console.log("Setup started")
  
 
    const data_size_limit = 5000;
  
    if ((data.nodes.length + data.edges.length) > data_size_limit) {
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
  
      elements: data,
    
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
        hideAllTippies();
      }
    });
  
    cy.on('tap', 'edge', function (e) {
      hideAllTippies();
    });
  
    cy.on('zoom pan', function (e) {
      hideAllTippies();
    });
  
    

    cy.ready(function () {
      console.log("Instance ready")

      cy.batch(applyStyle);

      console.log("Style applied");

      // removeSpinner();
  
 
      // makeSliders(cntr_minmax[cntr_names[0]], weight_minmax, date_minmax);
  
      createToolTip();

      console.log("Graphic components added");

      if (headless) {
        cy.mount(document.getElementById(elementId));
      }
      makeLayout();

      console.log("Instance configured");
  
    });
  
      console.log("Setup done")
    // return (cy);
  }
  