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
// GROUPING FUNCTIONS
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
import { hideAllTippies } from './tootips.js';

var group_tree_array = [];
// Structure of a group object contained in the above array:
// Normal attributes:
// --- id: its id, e.g. "0633PG9H9BPA5X1YFKENNNG9ZW"
// --- name: e.g. "design_assemble_bike"
// --- note: e.g. "Groups bike design and assemblage"
// --- type:"ProcessGroup"
// Grouping references coming from the data
// --- groupedIn: parent group
// --- groups: array of ids e.g. ['0633PG8FT49NGPX00TRSZM7K8W', '0633PG8BMRA60VJAAT8YFQYX1M'], either Processes or ProcessGroups
// Object structure containing the parent and children nodes:
// --- group_objs: Array of objects that corresponds to the ids in attribute "groups" and have the same structure as this object
// --- eles: {
//    grouping: Collection of elements that have to be present when node is grouped and removed when it is expanded,
//    grouped: Collection of elements that have to be hidden when grouped and visible when expanded,
//    ext_edges: Collection of edges that have to be reinserted when node is expanded
//    }


function calcGroups(cy, grouping_data) {

    // all elements in the graph
    var elements = cy.elements();

    // the collection for the elements that we want to group
    var grouped_eles = cy.collection();

    const items = grouping_data.groups;
    if (items.length < 2) {
        console.warn("Groups has less than 2 elements");
        return;
    }
    // find and add the grouped nodes to the collection
    for (const item of items) {
        var node = elements.getElementById(item);
        grouped_eles = grouped_eles.union(node);
    }
    // get their neighboorhood (EconomicEvent nodes)
    var non_actor_eles = grouped_eles.neighborhood().filter(function (ele, i, eles) {
        // return ele.isEdge() || (ele.isNode() && ele.data('type') != 'Person');
        return ele.isEdge() || (ele.isNode() && ele.data('type') == 'EconomicEvent');
    });

    grouped_eles = grouped_eles.union(non_actor_eles);

    // determine all nodes to be grouped
    var grouped_nodes = grouped_eles.nodes();

    // there might be nodes in between the grouped ones that 
    // we need to collect as well
    // We check whether the collection is separate
    var components = grouped_eles.components();
    if (components.length > 1) {
        for (var i = 0; i < components.length - 1; i++) {
            for (var j = i + 1; j <= components.length - 1; j++) {
                // intersect the neighborhoods 
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
    // First calculate the internal edges
    var internal_edges = grouped_nodes.edgesWith(grouped_nodes);
    // Update the grouped elements since we have possibly added nodes
    grouped_eles = grouped_eles.union(grouped_nodes).union(internal_edges);
    // The difference between all edges and internal edges are edges not leading to a node in the group
    var ext_edges = grouped_nodes.connectedEdges().difference(internal_edges);

    // We now need to create the new node and its edges to other external nodes
    var grouping_node_json = {
        grouping: 'nodes',
        data: grouping_data
    };
    var grouping_edges_json = [];

    // These 2 arrays are used to avoid multiple edges between the same nodes
    var sources = [];
    var targets = [];
    // examine each external edge to rewire it to the grouped node
    console.debug("-- Parent " + grouping_data.name);
    for (const edge of ext_edges) {
        var grouping_edge_json = undefined;
        var node_source = edge.source();
        var node_target = edge.target();
        console.debug("-- * Edge with source " + node_source.data('name') + " and target " + node_target.data('name'));
        if (grouped_nodes.contains(node_source)) {
            // The external edge is from a grouped node,
            // change its source to the grouped node
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
            // The external edge is to a grouped node,
            // change its target to the grouped node
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
        // add the new edge to the array of edges to add
        grouping_edges_json.push(grouping_edge_json);
    }
    // create the collection of elements to add when grouping
    var grouping_eles = cy.collection();
    grouping_eles = grouping_eles.union(cy.add(grouping_node_json));
    grouping_eles = grouping_eles.union(cy.add(grouping_edges_json));

    // return the object that contains the grouping elements
    var group_level = {
        grouping: grouping_eles,
        grouped: grouped_eles,
        ext_edges: ext_edges
    };
    return (group_level);
}

function calcAllGroups(cy, group_tree_array) {
    // This function (RECURSIVE) calculates the elements
    // used in grouping starting from the leaves up
    // and collapses them
    for (var group_tree of group_tree_array) {

        if (group_tree.group_objs == undefined) {
            group_tree.eles = calcGroups(cy, group_tree);
            collapseGroup(group_tree.eles);
        } else {
            calcAllGroups(cy, group_tree.group_objs);
            group_tree.eles = calcGroups(cy, group_tree);
            collapseGroup(group_tree.eles);
        }
    }
}

function findParentNode(eles) {
    var parent_node = eles.grouping.nodes();
    if (parent_node.length > 1) {
        throw new Error("More than one parent");
    }
    return (parent_node[0]);
}

function findNode(node, group_tree_array, search_grouping) {
    for (var group_tree of group_tree_array) {
        if (search_grouping) {
            if (group_tree.eles.grouping.contains(node)) {
                return (group_tree);
            } else if (group_tree.group_objs !== undefined) {
                return findNode(node, group_tree.group_objs, search_grouping);
            }
        } else {
            if (group_tree.eles.grouped.contains(node)) {
                return (group_tree);
            } else if (group_tree.group_objs !== undefined) {
                return findNode(node, group_tree.group_objs, search_grouping);
            }
        }
    }
}

function findParentGroup(group_tree_array, grouping_data) {
    // This functon (RECURSIVE) finds the parent
    // to append the child to
    for (var group of group_tree_array) {
        if (group.id == grouping_data.groupedIn) {
            // Found parent
            if (group.group_objs == undefined) {
                group.group_objs = [];
            }
            group.group_objs.push(grouping_data);
            return (true);
        } else if (group.group_objs == undefined) {
            // This is not a parent and does not have children, continue
            continue;
        } else {
            // recursively inspect children
            if (findParentGroup(group.group_objs, grouping_data)) {
                return (true);
            }
        }
    }
    return (false);
}

function collapseGroup(eles) {

    var parent_node = findParentNode(eles);

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

function collapseAllGroups(group_tree_array) {
    for (var group_tree of group_tree_array) {

        if (group_tree.group_objs == undefined) {
            collapseGroup(group_tree.eles);
        } else {
            collapseAllGroups(group_tree.group_objs);
            collapseGroup(group_tree.eles);
        }
    }
}

function collapseGroupFromNode(node) {
    // This function is more complex since
    // when collapsing a branch we need to collapse
    // Also all other sibling branches

    // Find to which group this node belongs
    var group_tree = findNode(node, group_tree_array, false);
    if (group_tree == null) {
        throw new Error("Node not found in grouped nodes: " + node.data('name'));
    }

    var parent_node = findParentNode(group_tree.eles);
    var group_parent = findNode(parent_node, group_tree_array, true);

    if (group_parent == null) {
        throw new Error("Parent node not found in grouped nodes: " + parent_node.data('name'));
    }
    collapseAllGroups([group_parent]);
}

function expandGroupFromNode(node) {
    // Find to which group this node belongs
    var group_tree = findNode(node, group_tree_array, true);

    if (group_tree == null) {
        throw new Error("Node not found in grouping nodes: " + node.data('name'));
    }
    expandGroup(group_tree.eles);
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

function assignAllHandlers(group_tree_array) {
    for (var group_tree of group_tree_array) {
        assignHandler(group_tree);
        if (group_tree.group_objs != undefined) {
            assignAllHandlers(group_tree.group_objs);
        }
    }
}

function createTree(cy) {
    // This function (NOT RECURSIVE) transform a list of object with links to each other
    // in a tree structure with partent - children
    const groups_data = cy.data().groups;

    var groups_len = groups_data.length;

    for (const grouping_data of groups_data) {
        if (grouping_data.groupedIn == null) {
            group_tree_array.push(grouping_data);
            groups_len--
        }
    }
    while (groups_len > 0) {
        // loops until all groups have found a place in the tree
        for (const grouping_data of groups_data) {
            if (grouping_data.groupedIn != null) {
                if (findParentGroup(group_tree_array, grouping_data)) {
                    groups_len--
                }
            }
        }
    }
    return;
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

export function groupNodes(cy) {

    createTree(cy);

    calcAllGroups(cy, group_tree_array);

    printTree(group_tree_array, "--");

    assignAllHandlers(group_tree_array);

}
