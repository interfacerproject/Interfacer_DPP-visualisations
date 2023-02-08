// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// LAYOUT FUNCTIONS
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

import { cy, headless } from './setup.js';

var layout_params = {};
var layout = {};


export function node_properties(node) {
    // # Hexadecimal color specification 
    // brewer.pal(n = 8, name = "Dark2")
    // https://www.datanovia.com/en/wp-content/uploads/dn-tutorials/ggplot2/figures/029-r-color-palettes-display-rcolorbrewer-single-palette-1.png
    // "#1B9E77" "#D95F02" "#7570B3" "#E7298A" "#66A61E" "#E6AB02" "#A6761D" "#666666"
    let prop;
    let color;
    switch (node.data('type')) {
        case 'EconomicResource':
            prop = {
                color: '',
                label: node.data('name') || "",
                shape: 'ellipse',
                width: 40,
                height: 40,
                tooltip: {
                    'trackingId': node.data('trackingIdentifier'),
                    'primaryAccountable': node.data('primaryAccountable.name'),
                    'custodian': node.data('custodian.name'),
                    'accountingQuantity': node.data('accountingQuantity.hasNumericalValue') + " " + node.data('accountingQuantity.hasUnit.symbol'),
                    'onhandQuantity': node.data('onhandQuantity.hasNumericalValue') + " " + node.data('onhandQuantity.hasUnit.symbol'),
                    "mappableAddress": node.data('currentLocation.mappableAddress'),
                    'lat': node.data('currentLocation.lat'),
                    'long': node.data('currentLocation.long')
                },
            }


            if (node.data('origin')) {
                prop.color = '#e34a33';
            } else {
                prop.color = '#8980F5';
            }
            break;
        case 'EconomicEvent':
            switch (node.data('name')) {
                case 'transfer':
                    color = '#D6D6D6';
                    break;
                case 'transferCustody':
                    color = '#D6D6D6';
                    break;
                case 'transferAllRights':
                    color = '#D6D6D6';
                    break;
                default:
                    color = '#FFEEDD';
            }
            prop = {
                color: color,
                label: node.data('name') || "",
                shape: 'rectangle',
                width: 40,
                height: 40,
                tooltip: {
                    'note': node.data('note'),
                    'hasPointInTime': node.data('hasPointInTime'),
                    'provider': node.data('provider.name'),
                    'receiver': node.data('receiver.name'),
                    'resourceQuantity': node.data('resourceQuantity.hasNumericalValue') != undefined ? node.data('resourceQuantity.hasNumericalValue') + " " + node.data('resourceQuantity.hasUnit.symbol') : null,
                    'effortQuantity': node.data('effortQuantity.hasNumericalValue') != undefined ? node.data('effortQuantity.hasNumericalValue') + " " + node.data('effortQuantity.hasUnit.symbol') : null,
                    "mappableAddress": node.data('toLocation.mappableAddress'),
                    'lat': node.data('toLocation.lat'),
                    'long': node.data('toLocation.long')

                },
            }
            break;
        case 'Process':
            prop = {
                color: '#21897E',
                label: node.data('name') || "",
                shape: 'diamond',
                width: 40,
                height: 40,
                tooltip: {
                    'note': node.data('note')
                },
            }
            break;
        case 'ProcessGroup':
            prop = {
                color: '#21897E',
                label: node.data('name') || "",
                shape: 'diamond',
                width: 60,
                height: 60,
                tooltip: {
                    'note': node.data('note')
                },
            }
            break;
        case 'Person':
            prop = {
                color: '#000000',
                label: node.data('name') || "",
                shape: 'triangle',
                width: 40,
                height: 40,
                tooltip: {
                    'note': node.data('note'),
                    "mappableAddress": node.data('primaryLocation.mappableAddress'),
                    'lat': node.data('primaryLocation.lat'),
                    'long': node.data('primaryLocation.long')
                },
            }
            break;
        default:
            throw new Error('type is not defined: ' + node.data('type'));
    }
    return (prop);
}

export function edge_properties(edge) {
    let prop = {
        // line_color : '#000000',
        line_color: '#969696',
        // target_arrow_color: '#000000',
        target_arrow_color: '#969696',
        label: edge.data('name') || "",
        width: 3,
        tooltip: {
            'label': edge.data('name') || "",
        },
    }
    return (prop);
}


const node_edge_style = [ // the stylesheet for the graph
    {
        selector: 'node',
        style: {
            'background-color': function (node) {
                return node_properties(node).color;
            },
            'font-size': '25px',
            'font-style': 'normal',
            // 'text-wrap': 'ellipsis',
            'text-max-width': '75px',
            'label': function (node) {
                return node_properties(node).label;
            },
            'width': function (node) {
                return node_properties(node).width;
            },
            'height': function (node) {
                return node_properties(node).height;
            }
            ,
            'shape': function (node) {
                return node_properties(node).shape;
            }
        }
    },

    {
        selector: 'edge',
        style: {
            'width': function (ele) {
                return edge_properties(ele).width;
            },
            'label': function (ele) {
                return edge_properties(ele).label;
            },
            'font-size': '10px',
            'font-style': 'oblique',
            'line-color': function (ele) {
                return edge_properties(ele).line_color;
            },
            'target-arrow-color': function (ele) {
                return edge_properties(ele).target_arrow_color;
            },
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
        }
    }
];

export function applyStyle() {
    cy.style()
        .fromJson(node_edge_style)
        .update();
}


const params_dagre = {
    name: 'dagre',
    // dagre algo options, uses default value on undefined
    nodeSep: undefined, // the separation between adjacent nodes in the same rank
    edgeSep: undefined, // the separation between adjacent edges in the same rank
    rankSep: undefined, // the separation between each rank in the layout
    rankDir: undefined, // 'TB' for top to bottom flow, 'LR' for left to right,
    align: undefined,  // alignment for rank nodes. Can be 'UL', 'UR', 'DL', or 'DR', where U = up, D = down, L = left, and R = right
    acyclicer: undefined, // If set to 'greedy', uses a greedy heuristic for finding a feedback arc set for a graph.
    // A feedback arc set is a set of edges that can be removed to make a graph acyclic.
    ranker: undefined, // Type of algorithm to assign a rank to each node in the input graph. Possible values: 'network-simplex', 'tight-tree' or 'longest-path'
    minLen: function (edge) { return 1; }, // number of ranks to keep between the source and target of the edge
    edgeWeight: function (edge) { return 1; }, // higher weight edges are generally made shorter and straighter than lower weight edges

    // general layout options
    fit: true, // whether to fit to viewport
    padding: 30, // fit padding
    spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
    nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node
    animate: false, // whether to transition the node positions
    animateFilter: function (node, i) { return true; }, // whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
    animationDuration: 500, // duration of animation in ms if enabled
    animationEasing: undefined, // easing of animation if enabled
    boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    transform: function (node, pos) { return pos; }, // a function that applies a transform to the final node position
    ready: function () { }, // on layoutready
    sort: undefined, // a sorting function to order the nodes and edges; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
    // because cytoscape dagre creates a directed graph, and directed graphs use the node order as a tie breaker when
    // defining the topology of a graph, this sort function can help ensure the correct order of the nodes/edges.
    // this feature is most useful when adding and removing the same nodes and edges multiple times in a graph.
    stop: function () { } // on layoutstop
};

export const params_cola = {
    name: 'cola',
    nodeSpacing: 30,
    edgeLengthVal: 80,
    animate: true,
    randomize: false,
    maxSimulationTime: 3000
};
const params_elk = {
    name: 'elk',
    nodeDimensionsIncludeLabels: false, // Boolean which changes whether label dimensions are included when calculating node dimensions
    fit: true, // Whether to fit
    padding: 20, // Padding on fit
    animate: false, // Whether to transition the node positions
    animateFilter: function (node, i) { return true; }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
    animationDuration: 500, // Duration of animation in ms if enabled
    animationEasing: undefined, // Easing of animation if enabled
    transform: function (node, pos) { return pos; }, // A function that applies a transform to the final node position
    ready: undefined, // Callback on layoutready
    stop: undefined, // Callback on layoutstop
    elk: {
        // All options are available at http://www.eclipse.org/elk/reference.html
        //
        // 'org.eclipse.' can be dropped from the identifier. The subsequent identifier has to be used as property key in quotes.
        // E.g. for 'org.eclipse.elk.direction' use:
        // 'elk.direction'
        //
        // Enums use the name of the enum as string e.g. instead of Direction.DOWN use:
        // 'elk.direction': 'DOWN'
        //
        // The main field to set is `algorithm`, which controls which particular layout algorithm is used.
        // Example (downwards layered layout):
        'algorithm': 'layered',
        'elk.direction': 'DOWN',
    },
    priority: function (edge) { return null; }, // Edges with a non-nil value are skipped when geedy edge cycle breaking is enabled
};

const params_klay = {
    name: 'klay',
    nodeDimensionsIncludeLabels: true, // Boolean which changes whether label dimensions are included when calculating node dimensions
    fit: true, // Whether to fit
    padding: 20, // Padding on fit
    animate: false, // Whether to transition the node positions
    animateFilter: function (node, i) { return true; }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
    animationDuration: 500, // Duration of animation in ms if enabled
    animationEasing: undefined, // Easing of animation if enabled
    transform: function (node, pos) { return pos; }, // A function that applies a transform to the final node position
    ready: undefined, // Callback on layoutready
    stop: undefined, // Callback on layoutstop
    klay: {
        // Following descriptions taken from http://layout.rtsys.informatik.uni-kiel.de:9444/Providedlayout.html?algorithm=de.cau.cs.kieler.klay.layered
        addUnnecessaryBendpoints: false, // Adds bend points even if an edge does not change direction.
        aspectRatio: .5, // The aimed aspect ratio of the drawing, that is the quotient of width by height
        borderSpacing: 20, // Minimal amount of space to be left to the border
        compactComponents: false, // Tries to further compact components (disconnected sub-graphs).
        crossingMinimization: 'LAYER_SWEEP', // Strategy for crossing minimization.
        /* LAYER_SWEEP The layer sweep algorithm iterates multiple times over the layers, trying to find node orderings that minimize the number of crossings. The algorithm uses randomization to increase the odds of finding a good result. To improve its results, consider increasing the Thoroughness option, which influences the number of iterations done. The Randomization seed also influences results.
        INTERACTIVE Orders the nodes of each layer by comparing their positions before the layout algorithm was started. The idea is that the relative order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive layer sweep algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
        cycleBreaking: 'GREEDY', // Strategy for cycle breaking. Cycle breaking looks for cycles in the graph and determines which edges to reverse to break the cycles. Reversed edges will end up pointing to the opposite direction of regular edges (that is, reversed edges will point left if edges usually point right).
        /* GREEDY This algorithm reverses edges greedily. The algorithm tries to avoid edges that have the Priority property set.
        INTERACTIVE The interactive algorithm tries to reverse edges that already pointed leftwards in the input graph. This requires node and port coordinates to have been set to sensible values.*/
        direction: 'UNDEFINED', // Overall direction of edges: horizontal (right / left) or vertical (down / up)
        /* UNDEFINED, RIGHT, LEFT, DOWN, UP */
        edgeRouting: 'ORTHOGONAL', // Defines how edges are routed (POLYLINE, ORTHOGONAL, SPLINES)
        edgeSpacingFactor: 0.5, // Factor by which the object spacing is multiplied to arrive at the minimal spacing between edges.
        feedbackEdges: false, // Whether feedback edges should be highlighted by routing around the nodes.
        fixedAlignment: 'NONE', // Tells the BK node placer to use a certain alignment instead of taking the optimal result.  This option should usually be left alone.
        /* NONE Chooses the smallest layout from the four possible candidates.
        LEFTUP Chooses the left-up candidate from the four possible candidates.
        RIGHTUP Chooses the right-up candidate from the four possible candidates.
        LEFTDOWN Chooses the left-down candidate from the four possible candidates.
        RIGHTDOWN Chooses the right-down candidate from the four possible candidates.
        BALANCED Creates a balanced layout from the four possible candidates. */
        inLayerSpacingFactor: 1.0, // Factor by which the usual spacing is multiplied to determine the in-layer spacing between objects.
        layoutHierarchy: true, // Whether the selected layouter should consider the full hierarchy
        linearSegmentsDeflectionDampening: 0.3, // Dampens the movement of nodes to keep the diagram from getting too large.
        mergeEdges: false, // Edges that have no ports are merged so they touch the connected nodes at the same points.
        mergeHierarchyCrossingEdges: true, // If hierarchical layout is active, hierarchy-crossing edges use as few hierarchical ports as possible.
        nodeLayering: 'NETWORK_SIMPLEX', // Strategy for node layering.
        /* NETWORK_SIMPLEX This algorithm tries to minimize the length of edges. This is the most computationally intensive algorithm. The number of iterations after which it aborts if it hasn't found a result yet can be set with the Maximal Iterations option.
        LONGEST_PATH A very simple algorithm that distributes nodes along their longest path to a sink node.
        INTERACTIVE Distributes the nodes into layers by comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
        nodePlacement: 'BRANDES_KOEPF', // Strategy for Node Placement
        /* BRANDES_KOEPF Minimizes the number of edge bends at the expense of diagram size: diagrams drawn with this algorithm are usually higher than diagrams drawn with other algorithms.
        LINEAR_SEGMENTS Computes a balanced placement.
        INTERACTIVE Tries to keep the preset y coordinates of nodes from the original layout. For dummy nodes, a guess is made to infer their coordinates. Requires the other interactive phase implementations to have run as well.
        SIMPLE Minimizes the area at the expense of... well, pretty much everything else. */
        randomizationSeed: 1, // Seed used for pseudo-random number generators to control the layout algorithm; 0 means a new seed is generated
        routeSelfLoopInside: false, // Whether a self-loop is routed around or inside its node.
        separateConnectedComponents: true, // Whether each connected component should be processed separately
        spacing: 50, // Overall setting for the minimal amount of space to be left between objects
        thoroughness: 7 // How much effort should be spent to produce a nice layout..
    },
    priority: function (edge) { return null; }, // Edges with a non-nil value are skipped when greedy edge cycle breaking is enabled
};

const params_cise = {
    // -------- Mandatory parameters --------
    name: 'cise',

    // ClusterInfo can be a 2D array contaning node id's or a function that returns cluster ids. 
    // For the 2D array option, the index of the array indicates the cluster ID for all elements in 
    // the collection at that index. Unclustered nodes must NOT be present in this array of clusters.
    // 
    // For the function, it would be given a Cytoscape node and it is expected to return a cluster id  
    // corresponding to that node. Returning negative numbers, null or undefined is fine for unclustered
    // nodes.  
    // e.g
    // Array:                                     OR          function(node){
    //  [ ['n1','n2','n3'],                                       ...
    //    ['n5','n6']                                         }
    //    ['n7', 'n8', 'n9', 'n10'] ]                         
    // clusters: clusterInfo,

    // -------- Optional parameters --------
    // Whether to animate the layout
    // - true : Animate while the layout is running
    // - false : Just show the end result
    // - 'end' : Animate directly to the end result
    animate: false,

    // number of ticks per frame; higher is faster but more jerky
    refresh: 10,

    // Animation duration used for animate:'end'
    animationDuration: undefined,

    // Easing for animate:'end'
    animationEasing: undefined,

    // Whether to fit the viewport to the repositioned graph
    // true : Fits at end of layout for animate:false or animate:'end'
    fit: true,

    // Padding in rendered co-ordinates around the layout
    padding: 30,

    // separation amount between nodes in a cluster
    // note: increasing this amount will also increase the simulation time 
    nodeSeparation: 12.5,

    // Inter-cluster edge length factor 
    // (2.0 means inter-cluster edges should be twice as long as intra-cluster edges)
    idealInterClusterEdgeLengthCoefficient: 1.4,

    // Whether to pull on-circle nodes inside of the circle
    allowNodesInsideCircle: false,

    // Max percentage of the nodes in a circle that can move inside the circle
    maxRatioOfNodesInsideCircle: 0.1,

    // - Lower values give looser springs
    // - Higher values give tighter springs
    springCoeff: 0.45,

    // Node repulsion (non overlapping) multiplier
    nodeRepulsion: 4500,

    // Gravity force (constant)
    gravity: 0.25,

    // Gravity range (constant)
    gravityRange: 3.8,

    // Layout event callbacks; equivalent to `layout.one('layoutready', callback)` for example
    ready: function () { }, // on layoutready
    stop: function () { }, // on layoutstop
};

const params_fcose = {

    name: 'fcose',
    // 'draft', 'default' or 'proof' 
    // - "draft" only applies spectral layout 
    // - "default" improves the quality with incremental layout (fast cooling rate)
    // - "proof" improves the quality with incremental layout (slow cooling rate) 
    quality: "default",
    // Use random node positions at beginning of layout
    // if this is set to false, then quality option must be "proof"
    randomize: true,
    // Whether or not to animate the layout
    animate: true,
    // Duration of animation in ms, if enabled
    animationDuration: 1000,
    // Easing of animation, if enabled
    animationEasing: undefined,
    // Fit the viewport to the repositioned nodes
    fit: true,
    // Padding around layout
    padding: 30,
    // Whether to include labels in node dimensions. Valid in "proof" quality
    nodeDimensionsIncludeLabels: false,
    // Whether or not simple nodes (non-compound nodes) are of uniform dimensions
    uniformNodeDimensions: false,
    // Whether to pack disconnected components - valid only if randomize: true
    packComponents: true,

    /* spectral layout options */

    // False for random, true for greedy sampling
    samplingType: true,
    // Sample size to construct distance matrix
    sampleSize: 25,
    // Separation amount between nodes
    nodeSeparation: 75,
    // Power iteration tolerance
    piTol: 0.0000001,

    /* incremental layout options */

    // Node repulsion (non overlapping) multiplier
    nodeRepulsion: 4500,
    // Ideal edge (non nested) length
    idealEdgeLength: 50,
    // Divisor to compute edge forces
    edgeElasticity: 0.45,
    // Nesting factor (multiplier) to compute ideal edge length for nested edges
    nestingFactor: 0.1,
    // Maximum number of iterations to perform
    numIter: 2500,
    // For enabling tiling
    tile: true,
    // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
    tilingPaddingVertical: 10,
    // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
    tilingPaddingHorizontal: 10,
    // Gravity force (constant)
    gravity: 0.25,
    // Gravity range (constant) for compounds
    gravityRangeCompound: 1.5,
    // Gravity force (constant) for compounds
    gravityCompound: 1.0,
    // Gravity range (constant)
    gravityRange: 3.8,
    // Initial cooling factor for incremental layout  
    initialEnergyOnIncremental: 0.3,

    /* layout event callbacks */
    ready: () => { }, // on layoutready
    stop: () => { } // on layoutstop
};

const params_cose = {
    name: 'cose',

    // Called on `layoutready`
    // ready: function () { },

    // Called on `layoutstop`
    // stop: function () { },

    // Whether to animate while running the layout
    // true : Animate continuously as the layout is running
    // false : Just show the end result
    // 'end' : Animate with the end result, from the initial positions to the end positions
    animate: false,

    // Easing of the animation for animate:'end'
    // animationEasing: undefined,

    // The duration of the animation for animate:'end'
    // animationDuration: undefined,

    // A function that determines whether the node should be animated
    // All nodes animated by default on animate enabled
    // Non-animated nodes are positioned immediately when the layout starts
    // animateFilter: function (node, i) { return true; },


    // The layout animates only after this many milliseconds for animate:true
    // (prevents flashing on fast runs)
    animationThreshold: 250,

    // Number of iterations between consecutive screen positions update
    refresh: 20,

    // Whether to fit the network view after when done
    fit: true,

    // Padding on fit
    padding: 30,

    // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    // boundingBox: undefined,

    // Excludes the label when calculating node bounding boxes for the layout algorithm
    nodeDimensionsIncludeLabels: false,

    // Randomize the initial positions of the nodes (true) or use existing positions (false)
    randomize: false,

    // Extra spacing between components in non-compound graphs
    componentSpacing: 40,

    // Node repulsion (non overlapping) multiplier
    nodeRepulsion: function (node) { return 2048; },

    // Node repulsion (overlapping) multiplier
    nodeOverlap: 4,

    // Ideal edge (non nested) length
    idealEdgeLength: function (edge) { return 64; },

    // Divisor to compute edge forces
    edgeElasticity: function (edge) { return 32; },

    // Nesting factor (multiplier) to compute ideal edge length for nested edges
    nestingFactor: 1.2,

    // Gravity force (constant)
    gravity: 1,

    // Maximum number of iterations to perform
    numIter: 1000,

    // Initial temperature (maximum node displacement)
    initialTemp: 1000,

    // Cooling factor (how the temperature is reduced between consecutive iterations
    coolingFactor: 0.99,

    // Lower temperature threshold (below this point the layout will end)
    minTemp: 1.0
};

const params_brefi = {
    name: 'breadthfirst',
    directed: true,
    padding: 10
};


var is_running = false;

function stopLayout() {
    if (layout != {} && is_running == true) {
        layout.stop();
        is_running = false;
    }

}

function runLayout() {
    if (layout != {}) {
        layout.run();
        is_running = true;
    }
}

export function makeLayout(elems, opts) {
    stopLayout();

    // TODO: adapt layout
    // see https://blog.js.cytoscape.org/2020/05/11/layouts/

    if (headless == true) {
        layout_params = params_fcose;
    } else {

        // Hierarchical layouts

        // layout_params = params_dagre;
        // layout_params = params_brefi;
        // layout_params = params_elk;
        layout_params = params_klay;

        // Force-directed layouts
        // layout_params = params_cola;
        // layout_params = params_cose;
        // layout_params = params_fcose;
        // layout_params = params_cise;
        // layout_params = params_elk;
    }

    layout_params.randomize = false;
    layout_params.edgeLength = function (e) {
        return layout_params.edgeLengthVal / e.data('weight');
        // return layout_params.edgeLengthVal; 
    };

    if (opts != undefined) {
        for (var i in opts) {
            layout_params[i] = opts[i];
        }
    }

    layout = elems.layout(layout_params);
    runLayout();
}
