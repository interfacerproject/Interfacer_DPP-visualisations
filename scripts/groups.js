// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// GROUPING FUNCTIONS
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
import { hideAllTippies } from './tootips.js';

var group_tree_array = [];

function calc_groups(cy, grouping_data) {

    var elements = cy.elements();

    var grouped_eles = cy.collection();

    const items = grouping_data.groups;
    if (items.length < 2) {
        console.warn("Groups has less than 2 elements");
        return;
    }
    for (const item of items) {
        var node = elements.getElementById(item);
        grouped_eles = grouped_eles.union(node);
    }
    // neighboorhood excluding actors (only persons for the moment)
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
                // avoid including Persons in the group
                var in_between_nodes = components[i].neighborhood().filter(function (ele) {
                    return (ele.isNode() && ele.data('type') != 'Person');
                }).intersection(components[j].neighborhood());
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
    var ext_edges = grouped_nodes.connectedEdges().difference(grouped_edges);

    // Create new node and edges
    var grouping_node_json = {
        grouping: 'nodes',
        data: grouping_data
    };
    var grouping_edges_json = [];

    // These 2 arrays are used to avoid multiple edges between the same nodes
    var sources = [];
    var targets = [];
    for (const edge of ext_edges) {
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

    var group_level = {
        grouping: grouping_eles,
        grouped: grouped_eles,
        ext_edges: ext_edges
    };
    return (group_level);
}

function getParentNode(eles) {
    var parent_node = eles.grouping.nodes();
    if (parent_node.length > 1) {
        throw new Error("More than one parent");
    }
    return (parent_node[0]);
}

function findNode(node, group_tree, search_grouping) {

    if (search_grouping) {
        if (group_tree.eles.grouping.contains(node)) {
            return (group_tree);
        } else {
            if (group_tree.group_objs !== undefined) {
                for (const child of group_tree.group_objs) {
                    var result = findNode(node, child, search_grouping);
                    if (result != null) {
                        return (result);
                    }
                }
            }
        }
    } else {
        if (group_tree.eles.grouped.contains(node)) {
            return (group_tree);
        } else {
            if (group_tree.group_objs !== undefined) {
                if (group_tree.group_objs !== undefined) {
                    for (const child of group_tree.group_objs) {
                        var result = findNode(node, child, search_grouping);
                        if (result != null) {
                            return (result);
                        }
                    }
                }
            }
        }
    }
}

function collapseGroup(eles) {

    var parent_node = getParentNode(eles);

    var aNode = eles.grouping.nodes()[0];
    aNode.cy().add(eles.grouping);
    aNode.cy().remove(eles.ext_edges);
    eles.grouped.forEach(function (ele) {
        ele.addClass('collapsed-child');
    }
    );

    eles.grouped.nodes().move({
        parent: parent_node.data('id')
    });
}

function expandGroup(eles) {

    eles.grouped.nodes().move({
        parent: null
    });

    var aNode = eles.grouped.nodes()[0];
    // var parent_node = get_par_node(index);
    // parent_node.removeListener('cxttap');
    hideAllTippies(eles.grouping);
    aNode.cy().remove(eles.grouping);
    aNode.cy().add(eles.ext_edges);
    eles.grouped.forEach(function (ele) {
        ele.removeClass('collapsed-child');
    }
    );

}

function expandGroupFromNode(node) {
    // Find to which group this node belongs
    var group_tree = null;
    for (var agroup_tree of group_tree_array) {
        group_tree = findNode(node, agroup_tree, true);
        if (group_tree != null) {
            break;
        }
    }
    if (group_tree == null) {
        throw new Error("Node not found in grouping nodes: " + node.data('name'));
    }
    expandGroup(group_tree.eles);
}

function collapseGroupFromNode(node) {
    // Find to which group this node belongs
    var group_tree = null;
    for (var agroup_tree of group_tree_array) {
        group_tree = findNode(node, agroup_tree, false);
        if (group_tree != null) {
            break;
        }
    }
    if (group_tree == null) {
        throw new Error("Node not found in grouped nodes: " + node.data('name'));
    }
    collapseGroup(group_tree.eles);
}

function assignHandler(group_tree) {
    // Only assign handlers to the eles.grouped
    // for all groups that are not head or tree_head
    // For head and tree_head assign both eles.grouping and eles.grouped
    var position = null;
    if (group_tree.group_objs == undefined) {
        if (group_tree.groupedIn == null) {
            position = 'head';
        } else {
            position = 'leaf';
        }

    } else {
        if (group_tree.groupedIn == null) {
            position = 'tree_head';
        } else {
            position = 'intermediate';
        }
    }
    if (position == null) {
        throw new Error("Could not calculate position");
    }
    var eles = group_tree.eles;

    if (position == 'head') {
        eles.grouping.nodes().forEach(function (node) {

            node.removeListener('cxttap');
            node.on('cxttap', function (e) {
                expandGroupFromNode(e.target);
                e.stopPropagation();
            });
        });
        eles.grouped.nodes().forEach(function (node) {

            node.removeListener('cxttap');
            node.on('cxttap', function (e) {
                collapseGroupFromNode(e.target);
                e.stopPropagation();
            });
        });
    } else if (position == 'tree_head') {

        eles.grouping.nodes().forEach(function (node) {

            node.removeListener('cxttap');
            node.on('cxttap', function (e) {
                expandGroupFromNode(e.target);
                e.stopPropagation();
            });
        });
        eles.grouped.nodes().forEach(function (node) {

            node.removeListener('cxttap');
            node.on('cxttap', function (e) {
                if (e.target.selected()) {
                    expandGroupFromNode(e.target);
                } else {
                    collapseGroupFromNode(e.target);
                }
                e.stopPropagation();
            });
        });

    } else if (position == 'leaf') {
        eles.grouped.nodes().forEach(function (node) {
            node.removeListener('cxttap');
            node.on('cxttap', function (e) {
                collapseGroupFromNode(e.target);
                e.stopPropagation();
            });
        });
    } else if (position == 'intermediate') {
        eles.grouped.nodes().forEach(function (node) {

            node.removeListener('cxttap');
            node.on('cxttap', function (e) {
                collapseGroupFromNode(e.target);
                e.stopPropagation();
            });
        });
    } else {
        throw new Error("Unknown position: " + position);
    }
}

function findParent(group_tree_array, grouping_data) {
    for (var group of group_tree_array) {
        if (group.id == grouping_data.groupedIn) {
            if (group.group_objs == undefined) {
                group.group_objs = [];
            }
            group.group_objs.push(grouping_data);
            return (true);
        } else if (group.group_objs == undefined) {
            continue;
        } else {
            if (findParent(group.group_objs, grouping_data)) {
                return (true);
            }
        }
    }
    return (false);
}

function createTree(cy) {
    const groups_data = cy.data().groups;

    var groups_len = groups_data.length;

    for (const grouping_data of groups_data) {
        if (grouping_data.groupedIn == null) {
            group_tree_array.push(grouping_data);
            groups_len--
        }
    }
    while (groups_len > 0) {
        for (const grouping_data of groups_data) {
            if (grouping_data.groupedIn != null) {
                if (findParent(group_tree_array, grouping_data)) {
                    groups_len--
                }
            }
        }
    }
    return;
}

function calcAllGroups(cy, group_tree_array) {
    for (var group_tree of group_tree_array) {

        if (group_tree.group_objs == undefined) {
            group_tree.eles = calc_groups(cy, group_tree);
            collapseGroup(group_tree.eles);
        } else {
            calcAllGroups(cy, group_tree.group_objs);
            group_tree.eles = calc_groups(cy, group_tree);
            collapseGroup(group_tree.eles);
        }
    }
}

function printTree(group_tree_array, level) {
    for (var group_tree of group_tree_array) {
        console.debug(level + "name: " + group_tree.name);
        console.debug(level + "grouping: ");
        group_tree.eles.grouping.nodes().filter(function (node) {
            return node.data('type') == "ProcessGroup" || node.data('type') == "Process";
        }).forEach(function (node) {
            console.debug(level + " * " + node.data('name'));
        })
        console.debug(level + "grouped: ");
        group_tree.eles.grouped.nodes().filter(function (node) {
            return node.data('type') == "ProcessGroup" || node.data('type') == "Process";
        }).forEach(function (node) {
            console.debug(level + " * " + node.data('name'));
        })
        if (group_tree.group_objs != undefined) {
            printTree(group_tree.group_objs, level + "--");
        }
    }

}

function assignAllHandlers(group_tree_array) {
    for (var group_tree of group_tree_array) {
        assignHandler(group_tree);
        if (group_tree.group_objs != undefined) {
            assignAllHandlers(group_tree.group_objs);
        }
    }
}
export function groupNodes(cy) {

    createTree(cy);

    calcAllGroups(cy, group_tree_array);
    printTree(group_tree_array, "--");

    assignAllHandlers(group_tree_array);

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
