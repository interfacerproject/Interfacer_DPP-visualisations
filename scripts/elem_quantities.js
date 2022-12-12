// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// CENTRALITIES FUNCTIONS
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

import { cy } from './setup.js';
import {floorDay, ceilingDay} from './utils.js';

export function calculateCentralities(cntr_names) {


  const HIGHVALUE = 10000000;
  const LOWVALUE = -10000000;

  var opts = {
    // weight: function(edge) [optional]
    // A function that returns the positive weight for the edge.
    // The weight indicates the importance of the edge, with a high value representing high importance.
    weight: undefined,

    // The alpha value for the centrality calculation, ranging on [0, 1].
    // With value 0 (default), disregards edge weights and solely uses number of edges in the centrality calculation.
    // With value 1, disregards number of edges and solely uses the edge weights in the centrality calculation.
    alpha: 0,

    directed: false,

    // harmonic [optional] A boolean indicating whether the algorithm calculates the harmonic mean (true, default)
    //  or the arithmetic mean (false) of distances. The harmonic mean is very useful for graphs that are not strongly connected.
    harmonic: true
  };

  var cntr_minmax = {
    dc: {
      name: 'dc',
      min: HIGHVALUE,
      max: LOWVALUE
    },
    dcn: {
      name: 'dcn',
      min: HIGHVALUE,
      max: LOWVALUE
    },
    cc: {
      name: 'cc',
      min: HIGHVALUE,
      max: LOWVALUE
    },
    ccn: {
      name: 'ccn',
      min: HIGHVALUE,
      max: LOWVALUE
    },
    bc: {
      name: 'bc',
      min: HIGHVALUE,
      max: LOWVALUE
    },
    bcn: {
      name: 'bcn',
      min: HIGHVALUE,
      max: LOWVALUE
    },
    pr: {
      name: 'pr',
      min: HIGHVALUE,
      max: LOWVALUE
    }
  };

  var set_minmax = function (name, value) {
    if (value < cntr_minmax[name].min) {
      cntr_minmax[name].min = value;
    }
    if (value > cntr_minmax[name].max) {
      cntr_minmax[name].max = value;
    }
  }

  var dcn_all = {}, ccn_all = {}, bc_all = {}, pr_all = {};

  var eles = cy.elements();

  if (cntr_names.includes('dcn')) {
    dcn_all = eles.degreeCentralityNormalized(opts);
  }

  if (cntr_names.includes('ccn')) {
    ccn_all = eles.closenessCentralityNormalized(opts);
  }

  if ((cntr_names.includes('bc') || cntr_names.includes('bcn'))) {
    bc_all = eles.betweennessCentrality(opts);
  }

  if (cntr_names.includes('pr')) {
    pr_all = eles.pageRank(
      {
        dampingFactor: 0.8,
        precision: 0.000001,
        iterations: 200
      }
    )
  }

  var dc = -1, dcn = -1, cc = -1, ccn = -1, bc = -1, bcn = -1, pr = -1;
  cy.nodes().forEach(function (node) {

    opts['root'] = node;
    if (cntr_names.includes('dc')) {
      dc = eles.degreeCentrality(opts).degree;
      node.data('dc', dc);
      set_minmax('dc', dc);
    }

    if (cntr_names.includes('dcn')) {
      dcn = dcn_all.degree(node);
      node.data('dcn', dcn);
      set_minmax('dcn', dcn);
    }

    if (cntr_names.includes('cc')) {
      cc = eles.closenessCentrality(opts);

      node.data('cc', cc);
      set_minmax('cc', cc);
    }

    if (cntr_names.includes('ccn')) {
      ccn = ccn_all.closeness(node);
      node.data('ccn', ccn);
      set_minmax('ccn', ccn);
    }

    if (cntr_names.includes('bc')) {
      bc = bc_all.betweenness(node);
      node.data('bc', bc);
      set_minmax('bc', bc);
    }

    if (cntr_names.includes('bcn')) {
      bcn = bc_all.betweennessNormalized(node);
      node.data('bcn', bcn);
      set_minmax('bcn', bcn);
    }

    if (cntr_names.includes('pr')) {
      pr = pr_all.rank(node);
      node.data('pr', pr);
      set_minmax('pr', pr);
    }

    // console.log('cntr_minmax for node: ' + node.id() + ' are (node.degree(), dc, dcn, cc, ccn, bc, bcn, pr): ' + node.degree(), dc, dcn, cc, ccn, bc, bcn, pr);


  });
  return (cntr_minmax);
}

export function calculateEdgeWeights() {

  const HIGHVALUE = 10000000;
  const LOWVALUE = -10000000;

  var weight_minmax = {
    min: HIGHVALUE,
    max: LOWVALUE
  };

  cy.edges().forEach(function (edge) {
    var weight = edge.data('weight');

    if (weight < weight_minmax.min) {
      weight_minmax.min = weight;
    }
    if (weight > weight_minmax.max) {
      weight_minmax.max = weight;
    }

  });

  return (weight_minmax);
}

export function calculateTweetsTime() {

  const EARLYVALUE = new Date("1020-01-01T00:00:00.000").getTime();
  const LATEVALUE = new Date("3020-01-01T00:00:00.000").getTime();

  var date_minmax = {
    min: {
      value: LATEVALUE,
      string: "3020-01-01T00:00:00.000"
    },
    max: {
      value: EARLYVALUE,
      string: "1020-01-01T00:00:00.000"
    }
  };

  cy.nodes()
    .filter(node => node.data('type') == 'tweet')
    .forEach(function (node) {
      var date_str = node.data('created_at');

      if (date_str != null) {
        var date = new Date(node.data('created_at')).getTime();
        if (date == 0) {
          console.log(date_str)
        }

        if (date < date_minmax.min.value) {
          date_minmax.min.value = date;
          date_minmax.min.string = date_str;
        }
        if (date > date_minmax.max.value) {
          date_minmax.max.value = date;
          date_minmax.max.string = date_str;
        }


      }
    });

  var wholeDay = floorDay(date_minmax.min.value);
  date_minmax.min.value = wholeDay.getTime();
  date_minmax.min.string = wholeDay.toISOString();

  wholeDay = ceilingDay(date_minmax.max.value);
  date_minmax.max.value = wholeDay.getTime();
  date_minmax.max.string = wholeDay.toISOString();

  
  return (date_minmax);

}
