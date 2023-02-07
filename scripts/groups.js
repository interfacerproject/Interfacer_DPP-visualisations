// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// GROUPING FUNCTIONS
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

import { makeLayout } from "./layout.js";

var all_grouped_eles = [];

var all_grouping_eles = [];

export function groupNodes(cy) {

    var nodes = cy.elements();

    const groups = cy.data().groups;


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
            data: grouping
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
                        source: grouping.id,
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
                        target: grouping.id
                    }
                };
            } else {
                throw new Exception("Inconsistent grouping")
            }
            grouping_edges_json.push(grouping_edge_json);
        }
        // Remove grouped elements
        cy.remove(grouped_eles);
        var grouping_eles = cy.collection();
        grouping_eles = grouping_eles.union(cy.add(grouping_node_json));

        grouping_eles = grouping_eles.union(cy.add(grouping_edges_json));
        handleGroups(grouping_eles, true);

        all_grouped_eles.push(grouped_eles);
        all_grouping_eles.push(grouping_eles);
    }
}

function expandGroup(node) {
    // Find to which group this node belongs
    var found = false;
    for (var i=0; i < all_grouping_eles.length; i++) {
        if (all_grouping_eles[i].contains(node)) {
            found = true;
            node.cy().remove(all_grouping_eles[i]);
            node.cy().add(all_grouped_eles[i]);
            handleGroups(all_grouped_eles[i], false);
            makeLayout();
            return;   
        }
    }
    if (!found){
        throw new Exception("Node not found in grouping nodes")
    }
}

function collapseGroup(node) {
    // Find to which group this node belongs
    var found = false;
    for (var i=0; i < all_grouped_eles.length; i++) {
        if (all_grouped_eles[i].contains(node)) {
            found = true;
            node.cy().remove(all_grouped_eles[i]);
            node.cy().add(all_grouping_eles[i]);
            handleGroups(all_grouping_eles[i], true);
            makeLayout();
            return;   
        }
    }
    if (!found){
        throw new Exception("Node not found in grouped nodes")
    }
}

function handleGroups(eles, grouping_eles) {

    if (grouping_eles) {
        eles.nodes().forEach(function (node) {

            node.on('cxttap', function (e) {
                expandGroup(e.target);

            });
        });
    } else {
        eles.nodes().forEach(function (node) {

            node.on('cxttap', function (e) {
                collapseGroup(e.target);
            });
        });
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
