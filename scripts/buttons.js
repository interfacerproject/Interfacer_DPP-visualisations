// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// BUTTON FUNCTIONS
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
import { createCustEl } from './utils.js';
import { degreeFilterNodes } from './filters.js';
import { headless } from './setup.js';

/*
var $ = document.querySelector.bind(document);

function makeButton( opts ){
  var $button = createCustEl('button', { 'class': 'btn btn-default' }, [ opts.label ]);

  $btnParam.appendChild( $button );

  $button.addEventListener('click', function(){
    layout.stop();

    if( opts.fn ){ opts.fn(); }

    layout = makeLayout( opts.layoutOpts );
    layout.run();
  });
}




$('#config-toggle').addEventListener('click', function(){
  $('body').classList.toggle('config-closed');

  cy.resize();
});


var $btnParam = createCustEl('div', {
  'class': 'param'
}, []);

var $config = $('#config');

$config.appendChild( $btnParam );


var buttons = [
  {
    label: createCustEl('span', { 'class': 'fa fa-random' }, []),
    layoutOpts: {
      randomize: true,
      flow: null
    }
  },

  {
    label: createCustEl('span', { 'class': 'fa fa-long-arrow-down' }, []),
    layoutOpts: {
      flow: { axis: 'y', minSeparation: 30 }
    }
  }
];


buttons.forEach( makeButton );



{/* <div id="cyto_checkboxes">
      <!-- <fieldset> -->
        <!-- <legend>Format options</legend> -->
        <label for="checkbox-size">Size ~ degree</label>
        <input type="checkbox" name="checkbox-size" id="checkbox-size">
        <br/>
        <label for="checkbox-color">Color ~ weight</label>
        <input type="checkbox" name="checkbox-color" id="checkbox-color">
      <!-- </fieldset> -->
    </div>
     }
$('#cyto_checkboxes :checkbox-size').change(function () {
  // this will contain a reference to the checkbox   
  if (this.checked) {
    // the checkbox is now checked 
  } else {
    // the checkbox is now no longer checked
  }
});
*/
function makeDegreeSlider(cy, opts) {

  var $config = document.getElementById('config');
  // var $ = document.querySelector.bind(document);


  var $degreecontainer = createCustEl('div', { 'class': 'param' }, []);
  var $degreeslider = createCustEl('div', { 'id': 'degree-slider' }, []);

  var $label = createCustEl('label', { 'class': 'label label-default', for: 'degree-slider' }, [document.createTextNode(opts.label)]);
  var $small = createCustEl('small', {}, []);
  var $degreerange = createCustEl('span', { 'id': 'degree-range' }, []);


  $small.appendChild($degreerange);

  $degreecontainer.appendChild($label);
  $degreecontainer.appendChild($degreeslider);
  $degreecontainer.appendChild($small);


  $config.appendChild($degreecontainer);

  var el = $("#degree-slider");


  el.slider(
    {
      orientation: "horizontal",
      range: true,
      min: opts.min,
      max: opts.max,
      values: [opts.startValue, opts.endValue],
      step: opts.step,
      slide: function (event, ui) {
        $("#degree-range").html(ui.values[0] + " - " + ui.values[1]);
      },
      stop: function (event, ui) {
        degreeFilterNodes(cy, opts.centrality, ui.values[0], ui.values[1]);
      }
    });



  // var update = _.throttle(function () {
  //   layout_params[opts.param] = $input.value;

  //   layout.stop();
  //   layout = makeLayout(cy, {});
  //   layout.run();
  // }, 1000 / 30);
}



function makeButtons() {


  var paramLayoutButtons = [
    {
      label: 'Remove Isolated',
      param: 'edgeLengthVal',
    },

    {
      label: 'Node spacing',
      param: 'nodeSpacing',
      min: 1,
      max: 50,
      startValue: params_cola.nodeSpacing,
      step: 1
    }
  ];

  paramLayoutSliders.forEach(function (slider) {
    makeLayoutSlider(cy, slider);
  }
  );

}
