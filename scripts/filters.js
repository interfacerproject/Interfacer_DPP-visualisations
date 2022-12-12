// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// FILTER FUNCTIONS
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
import { cy } from './setup.js';

var parameters = {
  degree: {
    min: -1,
    max: -1
  },
  weigth: {
    min: -1,
    max: -1
  },
  date: {
    min: -1,
    max: -1
  }
}
var chosen_cntr = null;

var removed_edges = null;

export function weightFilterEdges(cy, low, high) {

  if (removed_edges != null) {
    removed_edges.restore();
    removed_edges = null;
  }
  var edges = cy.edges()
    .filter(function (edge) {
      weight = edge.data('weight');
      return (!(weight >= low && weight <= high));
    }
    );

  removed_edges = edges.remove();
  // removeLonelyNodes(cy);
}

var removed_nodes = null;

function filterNodes(node) {

  var deg_res = false;

  if (parameters.degree.min != -1 && parameters.degree.max != -1 && chosen_cntr != null) {
    var degree = node.data(chosen_cntr);
    deg_res = !(degree >= parameters.degree.min && degree <= parameters.degree.max);
  } else {
    deg_res = false;
  }

  var date_res = false;

  if (parameters.date.min != -1 && parameters.date.max != -1) {

    if (node.data('type') == 'tweet') {
      var date_str = node.data('created_at');

      if (date_str != null) {
        var date = new Date(node.data('created_at')).getTime();
        date_res = !(date >= parameters.date.min && date <= parameters.date.max);
      } else {
        date_res = true;
      }
    } else {
      date_res = false;
    }
  } else {
    date_res = false;
  }
  return (deg_res || date_res);

}

export function degreeFilterNodes(cntr, low, high) {

  chosen_cntr = cntr;

  var less_restrictive = false;

  if (parameters.degree.min > low || parameters.degree.max < high) {
    less_restrictive = true;
  }

  if (less_restrictive == true && removed_nodes != null) {
    removed_nodes.restore();
    removed_nodes = null;
  }
  parameters.degree.min = low;
  parameters.degree.max = high;

  var nodes = cy.nodes()
    .filter(function (node) {
      // console.log('node.degree: ' + node.degree() + ', node.data("' + cntr + '"): ' + node.data(cntr));
      return (filterNodes(node));
    }
      // node => node.degree < threshold
    );

  if (less_restrictive == false) {
    removed_nodes = removed_nodes.union(nodes.remove());
  } else {
    removed_nodes = nodes.remove();
  }

  removeLonelyNodes();
}

export function timeFilterTweets(start, end) {

  var less_restrictive = false;

  if (parameters.date.min > start || parameters.date.max < end) {
    less_restrictive = true;
  }

  if (less_restrictive == true && removed_nodes != null) {
    removed_nodes.restore();
    removed_nodes = null;
  }
  parameters.date.min = start;
  parameters.date.max = end;

  var nodes = cy.nodes()
    .filter(function (node) {
      // console.log('node.degree: ' + node.degree() + ', node.data("' + cntr + '"): ' + node.data(cntr));
      return (filterNodes(node));
    }
      // node => node.degree < threshold
    );

  if (less_restrictive == false) {
    removed_nodes = removed_nodes.union(nodes.remove());
  } else {
    removed_nodes = nodes.remove();
  }
  removeLonelyNodes();

}

function removeLonelyNodes() {

  var nodes = cy.nodes()
    .filter(function (node) {
      // we do not include node removed
      if (!node.removed()) {
        var degree = node.degree(false);
        return (degree == 0);
      } else {
        return false;
      }
    }
    );

  if (removed_nodes != null) {
    removed_nodes = removed_nodes.union(nodes.remove());
  } else {
    removed_nodes = nodes.remove();
  }

}



