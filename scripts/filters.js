// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// FILTER FUNCTIONS
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
import { cy } from './setup.js';


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



