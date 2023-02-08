// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// GROUPING FUNCTIONS
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

import { makeLayout } from "./layout.js";

var all_grouped_eles = [];

var all_grouping_eles = [];

function calculateGroups(cy) {

    var elements = cy.elements();

    const groups_data = cy.data().groups;


    // Determine the neighboorhood of the nodes to be grouped
    for (const grouping_data of groups_data) {
        var grouped_eles = cy.collection();
        const items = grouping_data.groups;
        if (items.length < 2) {
            console.warn("Groups has less than 2 elements");
            continue;
        }
        for (const item of items) {
            var node = elements.getElementById(item);
            grouped_eles = grouped_eles.union(node);
        }
        // do not group actors (persons for the moment)
        var non_actor_eles = grouped_eles.neighborhood().filter(function (ele, i, eles) {
            return ele.isEdge() || (ele.isNode() && ele.data('type') != 'Person');
        });
        grouped_eles = grouped_eles.union(non_actor_eles);

        // determine all nodes to be grouped
        var grouped_nodes = grouped_eles.filter(function (ele, i, eles) {
            return ele.isNode();
        });
        // there might be nodes in between the grouped ones that 
        // we need to collect as well
        // We check whether the collection is separate
        var components = grouped_eles.components();
        if (components.length > 1) {
            for (var i = 0; i < components.length - 1; i++) {
                for (var j = i + 1; j <= components.length - 1; j++) {
                    var in_between_nodes = components[i].neighborhood().intersection(components[j].neighborhood());
                    if (in_between_nodes.length > 0) {
                        grouped_nodes = grouped_nodes.union(in_between_nodes)
                    }
                }
            }
        }

        // Understand what edges should be connected to the new node representing the grouping
        var grouped_edges = grouped_nodes.edgesWith(grouped_nodes);
        // Update the grouped elements since we have possibly added nodes
        grouped_eles = grouped_eles.union(grouped_nodes).union(grouped_edges);
        // These are edges not leading to a node in the group
        var external_edges = grouped_nodes.connectedEdges().difference(grouped_edges);

        // Update the grouped elements since when we remove the nodes we will lose the external edges
        grouped_eles = grouped_eles.union(external_edges);

        // Create new node and edges
        var grouping_node_json = {
            grouping: 'nodes',
            data: grouping_data
        };
        var grouping_edges_json = [];

        // These 2 arrays are used to avoid multiple edges between the same nodes
        var sources = [];
        var targets = [];
        for (const edge of external_edges) {
            var grouping_edge_json = undefined;
            var node_source = edge.source();
            var node_target = edge.target();
            if (grouped_nodes.contains(node_source)) {
                var id = node_target.data('id');
                if (targets.includes(id)) {
                    continue;
                }
                targets.push(id);
                grouping_edge_json = {
                    data: {
                        id: edge.data('id') + "_grouped",
                        source: grouping_data.id,
                        target: node_target.data('id')
                    }
                };
            } else if (grouped_nodes.contains(node_target)) {
                var id = node_source.data('id');
                if (sources.includes(id)) {
                    continue;
                }
                sources.push(id);
                grouping_edge_json = {
                    data: {
                        id: edge.data('id') + "_grouped",
                        source: node_source.data('id'),
                        target: grouping_data.id
                    }
                };
            } else {
                throw new Error("Inconsistent grouping")
            }
            grouping_edges_json.push(grouping_edge_json);
        }
        var grouping_eles = cy.collection();
        grouping_eles = grouping_eles.union(cy.add(grouping_node_json));
        grouping_eles = grouping_eles.union(cy.add(grouping_edges_json));

        all_grouped_eles.push(grouped_eles);
        all_grouping_eles.push(grouping_eles);
    }
}
function getParentNode(index){
    var parent_node = all_grouping_eles[index].nodes();
    if (parent_node.length > 1){
        throw new Error("More than one parent");
    }
    return(parent_node[0]);
}

function collapseGroup(index) {

    var parent_node = getParentNode(index);
    
    var aNode = all_grouped_eles[index].nodes()[0];
    aNode.cy().add(all_grouping_eles[index]);

    all_grouped_eles[index].nodes().move({
        parent: parent_node.data('id')
    });
}

function expandGroup(index) {

    all_grouped_eles[index].nodes().move({
        parent: null
    });

    var aNode = all_grouped_eles[index].nodes()[0];
    // var parent_node = getParentNode(index);
    // parent_node.removeListener('cxttap');
    assignHandler(index, false);
    
    aNode.cy().remove(all_grouping_eles[index]);
    

}

function expandGroupFromNode(node) {
    // Find to which group this node belongs
    var found = false;
    for (var i = 0; i < all_grouping_eles.length; i++) {
        if (all_grouping_eles[i].contains(node)) {
            found = true;
            expandGroup(i);
            return;
        }
    }
    if (!found) {
        throw new Error("Node not found in grouping nodes " + node.data('name'));
    }
}

function collapseGroupFromNode(node) {
    // Find to which group this node belongs
    var found = false;
    for (var i = 0; i < all_grouped_eles.length; i++) {
        if (all_grouped_eles[i].contains(node)) {
            found = true;
            collapseGroup(i);
            assignHandler(i, true);
            return;
        }
    }
    if (!found) {
        throw new Error("Node not found in grouped nodes " + node.data('name'));
    }
}

function assignHandler(index, grouping_eles) {

    if (grouping_eles) {
        all_grouping_eles[index].nodes().forEach(function (node) {

            node.removeListener('cxttap');
            node.on('cxttap', function (e) {
                expandGroupFromNode(e.target);
                e.stopPropagation();

            });
        });
        all_grouped_eles[index].nodes().forEach(function (node) {

            node.removeListener('cxttap');
            node.on('cxttap', function (e) {
                e.stopPropagation();
            });
        });
        
    } else {
        // all_grouped_eles[index].nodes()[0].cy().removeListener('cxttap');
        all_grouping_eles[index].nodes().forEach(function (node) {

            node.removeListener('cxttap');
            node.on('cxttap', function (e) {
                e.stopPropagation();
            });
        });
        all_grouped_eles[index].nodes().forEach(function (node) {

            node.removeListener('cxttap');
            node.on('cxttap', function (e) {
                collapseGroupFromNode(e.target);
                e.stopPropagation();
            });
        });
    }
}


export function groupNodes(cy) {
    calculateGroups(cy);

    for (var i = 0; i < all_grouped_eles.length; i++) {
        // assignHandler(i, false);
        collapseGroup(i);
        assignHandler(i, true);
    }
    // cy.remove(grouped_eles);

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
