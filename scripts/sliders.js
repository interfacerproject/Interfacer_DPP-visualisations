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
// SLIDERS FUNCTIONS
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
import { createCustEl, addDays } from './utils.js';
import { headless } from './setup.js';

// TODO: find a better mechanism
import { params_cola, makeLayout } from './layout.js'

function makeLayoutSlider(opts) {

  var $config = document.getElementById('config');

  var $param = createCustEl('div', { 'class': 'param' }, []);

  var $input = createCustEl('div', { id: 'slider-' + opts.param }, []);

  var $label = createCustEl('label', { 'class': 'label label-default', for: 'slider-' + opts.param }, [document.createTextNode(opts.label)]);

  var $small = createCustEl('small', {}, []);
  var $layoutvalue = createCustEl('span', { 'id': 'layout-' + opts.param }, []);

  $small.appendChild($layoutvalue);


  $param.appendChild($label);
  $param.appendChild($input);
  $param.appendChild($small);

  $config.appendChild($param);

  var el = $('#slider-' + opts.param);

  el.slider(
    {
      orientation: "horizontal",
      range: false,
      min: opts.min,
      max: opts.max,
      value: opts.startValue,
      step: opts.step,
      slide: function (event, ui) {
        $('#layout-' + opts.param).html(ui.value);
      },
      stop: function (event, ui) {
        // _.throttle(function () {
        makeLayout({
          [opts.param]: [ui.value]
        });
        // }, 1000 / 30);
      }
    });
}


function makeTimeSlider(opts) {

  var $config = document.getElementById('config');
  // var $ = document.querySelector.bind(document);


  var $timecontainer = createCustEl('div', { 'class': 'param' }, []);
  var $timeslider = createCustEl('div', { 'id': 'time-slider' }, []);

  var $label = createCustEl('label', { 'class': 'label label-default', for: 'time-slider' }, [document.createTextNode(opts.label)]);
  var $small = createCustEl('small', {}, []);
  var $timerange = createCustEl('span', { 'id': 'time-range' }, []);

  $small.appendChild($timerange);

  $timecontainer.appendChild($label);
  $timecontainer.appendChild($timeslider);
  $timecontainer.appendChild($small);

  $config.appendChild($timecontainer);

  var el = $("#time-slider");

  el.slider(
    {
      orientation: "horizontal",
      range: true,
      min: opts.min,
      max: opts.max,
      values: [opts.startValue, opts.endValue],
      step: opts.step,
      slide: function (event, ui) {
        var startDate = new Date(ui.values[0]).toDateString();
        var endDate = new Date(ui.values[1]).toDateString();

        $("#time-range").html(startDate + " - " + endDate);
      },
      stop: function (event, ui) {
        timeFilterTweets(ui.values[0], ui.values[1]);
      }
    });
}


function makeDegreeSlider(opts) {

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
        degreeFilterNodes(opts.centrality, ui.values[0], ui.values[1]);
      }
    });
}


function makeWeightSlider(opts) {

  var $config = document.getElementById('config');
  // var $ = document.querySelector.bind(document);


  var $weightcontainer = createCustEl('div', { 'class': 'param' }, []);
  var $weightslider = createCustEl('div', { 'id': 'weight-slider' }, []);

  var $label = createCustEl('label', { 'class': 'label label-default', for: 'weight-slider' }, [document.createTextNode(opts.label)]);
  var $small = createCustEl('small', {}, []);
  var $weightrange = createCustEl('span', { 'id': 'weight-range' }, []);


  $small.appendChild($weightrange);

  $weightcontainer.appendChild($label);
  $weightcontainer.appendChild($weightslider);
  $weightcontainer.appendChild($small);


  $config.appendChild($weightcontainer);

  var el = $("#weight-slider");


  el.slider(
    {
      orientation: "horizontal",
      range: true,
      min: opts.min,
      max: opts.max,
      values: [opts.startValue, opts.endValue],
      step: opts.step,
      slide: function (event, ui) {
        $("#weight-range").html(ui.values[0] + " - " + ui.values[1]);
      },
      stop: function (event, ui) {
        weightFilterEdges(ui.values[0], ui.values[1]);
      }
    });

}

export function makeSliders(cntr_minmax, weight_minmax, date_minmax) {


  if (cntr_minmax.min < cntr_minmax.max) {
    var paramDegreeSlider =
    {
      label: 'Node degree',
      centrality: cntr_minmax.name,
      startValue: cntr_minmax.min,
      endValue: cntr_minmax.max,
      min: cntr_minmax.min,
      max: cntr_minmax.max,
      step: 1
    };
    makeDegreeSlider(paramDegreeSlider);
  }

  if (weight_minmax.min < weight_minmax.max) {

    var paramWeightSlider =
    {
      label: 'Edge weight',
      startValue: weight_minmax.min,
      endValue: weight_minmax.max,
      min: weight_minmax.min,
      max: weight_minmax.max,
      step: .5
    };
    // makeWeightSlider(paramWeightSlider);
  }

  if (date_minmax.max.value > (date_minmax.min.value + addDays(1))) {
    var paramTimeSlider = {
      label: 'Time interval',
      startValue: date_minmax.min.value,
      endValue: date_minmax.max.value,
      min: date_minmax.min.value,
      max: date_minmax.max.value,
      step: addDays(1)
    };
    makeTimeSlider(paramTimeSlider);
  }



  // At the moment is only working for cola parameters
  // TODO: find mechanism also for cose layout
  if (!headless) {
    var paramLayoutSliders = [
      {
        label: 'Edge length',
        param: 'edgeLengthVal',
        min: 1,
        max: 200,
        startValue: params_cola.edgeLengthVal,
        step: 1
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
      makeLayoutSlider(slider);
    }
    );
  }
}

