// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// LAYOUT FUNCTIONS
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

import { cy, headless } from './setup.js';

var layout_params = {};
var layout = {};

const default_size = 15;

const node_edge_style = [ // the stylesheet for the graph
    {
        selector: 'node',
        style: {
            'background-color': function (node) {
                return colorNode(node)
            },
            'font-size': '10px',
            'font-style': 'normal',
            'text-wrap': 'ellipsis',
            'text-max-width': '75px',
            'label': function (node) {
                return labelNode(node)
            },
            'width': function (node) {
                return widthNode(node)
            },
            'height': function (node) {
                return heightNode(node)
            }
            ,
            'shape': function (node) {
                return shapeNode(node)
            }
        }
    },

    {
        selector: 'edge',
        style: {
            'width': function (ele) {
                return ele.data('weight')
            },
            'label': function (ele) {
                return ele.data('action')
            },
            'font-size': '10px',
            'font-style': 'oblique',
            'color': '#ccc',
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
        }
    }
];

export var params_cola = {
    name: 'cola',
    nodeSpacing: 30,
    edgeLengthVal: 80,
    animate: true,
    randomize: false,
    maxSimulationTime: 3000
};
var param_elk = {
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
        // 'org.eclipse.elk.' can be dropped from the Identifier
        // Or look at demo.html for an example.
        // Enums use the name of the enum e.g.
        // 'searchOrder': 'DFS'
        //
        // The main field to set is `algorithm`, which controls which particular
        // layout algorithm is used.
    },
    priority: function (edge) { return null; }, // Edges with a non-nil value are skipped when geedy edge cycle breaking is enabled
};

var param_cise = {
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

var param_fcose = {

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

var params_cose = {
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


export function removeSpinner() {
    var el = document.getElementById('spinnerDiv');
    el.remove();
}

export function type_switch(type) {
    let ret;
    switch (type) {
        case 'EconomicResource':
            ret = 0;
            break;
        case 'EconomicEvent':
            ret = 1;
            break;
        case 'Process':
            ret = 2;
            break;
        case 'EconomicAgent':
            ret = 3;
            break;
        case 'entity':
            ret = 4;
            break;
        default:
            throw new Error('type is not defined: ' + type);
        // ret = -1;
    }
    return (ret);
}

export function classification_switch(classification) {
    if (classification === undefined){
        return(0);
    }
    let ret;
    switch (classification) {
        case '5g_corona_conspiracy':
            ret = 0;
            break;
        case 'non_conspiracy':
            ret = 1;
            break;
        case 'other_conspiracy':
            ret = 2;
            break;
        case 'None':
            ret = 3;
            break;
        default:
            throw new Error('Classification is not defined: ' + classification);
        // ret = -1;
    }
    return (ret);
}

export function applyStyle() {
    cy.style()
        .fromJson(node_edge_style)
        .update();
}

function colorNode(node) {
    // # Hexadecimal color specification 
    // brewer.pal(n = 8, name = "Dark2")
    // https://www.datanovia.com/en/wp-content/uploads/dn-tutorials/ggplot2/figures/029-r-color-palettes-display-rcolorbrewer-single-palette-1.png
    // "#1B9E77" "#D95F02" "#7570B3" "#E7298A" "#66A61E" "#E6AB02" "#A6761D" "#666666"
    var colorNodeArray = [
        {
            type: 'hashtag',
            color: '#66A61E'
        },
        {
            type: 'tweet',
            color: 'rgb(140, 162, 82)'
        },

        {
            type: 'url',
            color: '#D95F02'
        },
        {
            type: 'user',
            color: '#E6AB02'
        },
        {
            type: 'entity',
            color: '#66A61E'
        },
    ];
    var colorClassificationTweet = [
        {
            color: '#607466',
            classification: '5g_corona_conspiracy'
        },
        {
            color: '#aedcc0',
            classification: 'non_conspiracy'
        },
        {
            color: '#008cc6',
            classification: 'other_conspiracy'
        },
        {
            color: '#E7298A',
            classification: 'None'
        }
    ];
    var index = type_switch(node.data('type'));

    var col = {};
    if (index == 1) {
        col = colorClassificationTweet[classification_switch(node.data('classification'))].color;
    } else {
        col = colorNodeArray[index].color;
    }

    return (col);
}

function labelNode(node) {

    var labels = [
        node.data('name') || "",
        "", //node.data('text') || "No tweet text",
        node.data('name') || "",
        node.data('name') || "",
        node.data('name') || "",
    ];
    
    // console.log(type_switch(node.data('type')))
    let label = labels[type_switch(node.data('type'))]
    // label = label.substring(0, Math.min(label_limit, label.length));
    return label;
}

function widthNode(node) {
    const a = node.data('type');
    var sizes = [
        default_size,
        Math.max(node.data('followers_count') + node.data('favorite_count'), default_size) || default_size,
        default_size,
        Math.max(node.data('followers_count') + node.data('friends_count'), default_size) || default_size
    ];
    return default_size;
}

function heightNode(node) {
    const a = node.data('type');
    var sizes = [
        default_size,
        Math.max(node.data('followers_count') + node.data('favorite_count'), default_size) || default_size,
        default_size,
        Math.max(node.data('followers_count') + node.data('friends_count'), default_size) || default_size
    ];
    return default_size;
}

function shapeNode(node) {
    // ellipse triangle round-triangle rectangle round-rectangle bottom-round-rectangle cut-rectangle barrel rhomboid diamond round-diamond
    // pentagon round-pentagon hexagon round-hexagon concave-hexagon heptagon round-heptagon octagon round-octagon star tag round-tag
    // vee polygon (custom polygon specified via shape-polygon-points).
    var shapesArray = [
        'triangle', // hashtag
        'ellipse', // tweet
        'diamond', // url
        'rectangle', // user
        'triangle', // entity
    ];
    var shape = shapesArray[type_switch(node.data('type'))];
    return (shape);
    // return( 'ellipse' );
}

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

export function makeLayout(opts) {
    stopLayout();

    // TODO: adapt layout

    if (headless == true) {
        layout_params = param_fcose;
    } else {
        // layout_params = params_cola;
        layout_params = {
            name: 'breadthfirst',
            directed: true,
            padding: 10
          };
    }

    layout_params.randomize = false;
    layout_params.edgeLength = function (e) {
        return layout_params.edgeLengthVal / e.data('weight');
        // return layout_params.edgeLengthVal; 
    };

    for (var i in opts) {
        layout_params[i] = opts[i];
    }

    layout = cy.layout(layout_params);
    runLayout();
}
