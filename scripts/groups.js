// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// GROUPING FUNCTIONS
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

export function groupNodes(cy) {

    var nodes = cy.elements();

    const groups = cy.data().groups;

    var all_grouped_eles = [];

    var all_grouping_eles = [];

    // Determine the neighboorhood of the nodes to be grouped
    for (const grouping of groups) {
        var grouped_eles = cy.collection();
        const items = grouping.groups;
        if (items.length < 2) {
            console.warn("Groups has less than 2 elements");
            continue;
        }
        for (const item of items) {
            var node = nodes.getElementById(item);
            grouped_eles = grouped_eles.union(node);
        }
        // do not grouping actors (persons for the moment)
        var non_actor_eles = grouped_eles.neighborhood().filter(function (ele, i, eles) {
            return ele.isEdge() || (ele.isNode() && ele.data('type') != 'Person');
        });
        grouped_eles = grouped_eles.union(non_actor_eles);
        // Understand what edges should be connected to the new node representing the grouping
        var grouped_nodes = grouped_eles.filter(function (ele, i, eles) {
            return ele.isNode();
        });
        var grouped_edges = grouped_nodes.edgesWith(grouped_nodes);
        var external_edges = grouped_nodes.connectedEdges().difference(grouped_edges);
        // Create new node and edges
        var grouping_node_json = {
            grouping: 'nodes',
            data: grouping
        };

        var grouping_edges_json = [];
        // avoid multiple edges between the same nodes
        var sources = [];
        var targets = [];
        for (const edge of external_edges) {
            var grouping_edge_json = undefined;
            var node_source = edge.source();
            var node_target = edge.target();
            if (grouped_nodes.contains(node_source)){
                var id = node_target.data('id');
                if (targets.includes(id)){
                    continue;
                }
                targets.push(id);
                grouping_edge_json = { 
                    data: {
                      id: edge.data('id') + "_grouped",
                      source: grouping.id,
                      target: node_target.data('id')
                    }
                  };
            }else if(grouped_nodes.contains(node_target)){
                var id = node_source.data('id');
                if (sources.includes(id)){
                    continue;
                }
                sources.push(id);
                grouping_edge_json = { 
                    data: {
                      id: edge.data('id') + "_grouped",
                      source: node_source.data('id'),
                      target: grouping.id
                    }
                  };
            }else{
                throw new Exception("Inconsistent grouping")
            }
            grouping_edges_json.push(grouping_edge_json);
        }
        // Remove grouped elements
        cy.remove(grouped_eles);
        var grouping_eles = cy.collection();
        grouping_eles = grouping_eles.union(cy.add(grouping_node_json));
        
        grouping_eles = grouping_eles.union(cy.add(grouping_edges_json));

        all_grouped_eles.push(grouped_eles);
        all_grouping_eles.push(grouping_eles);

    }



    

}
    //     for (var j = i+1; j <= items.length - 1; j++) {
    //     var node_j = nodes.getElementById(items[j]);

    //     do {
    //         var result = nodes.aStar({ root: node_i, goal: node_j, directed: true });
    //         if (result.found) {
    //         var strict_path = result.path.filter(function (i, x) { return x != node_i && x != node_j; })
    //         nodes = nodes.difference(strict_path);
    //         if (grouped_eles == undefined){
    //             grouped_eles = strict_path;
    //         }else{
    //             grouped_eles.add(strict_path);
    //         }
    //         }
    //         var result_inv = nodes.aStar({ root: node_j, goal: node_i, directed: true });
    //         if (result_inv.found) {
    //         var strict_path = result_inv.path.filter(function (i, x) { return x != node_i && x != node_j; })
    //         nodes = nodes.difference(strict_path);
    //         if (grouped_eles == undefined){
    //             grouped_eles = strict_path;
    //         }else{
    //             grouped_eles.add(strict_path);
    //         }
    //         }
    //     } while (result.found || result_inv.found);
    //     }
    // }
    // }

    // cy.remove(nodes);