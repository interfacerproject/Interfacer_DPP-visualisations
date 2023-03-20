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
// TOOLTIP FUNCTIONS
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

import { createCustEl } from './utils.js';

function edge_tootip(edge) {
  var tooltip = {
    'label': edge.data('name') || ""
  }
  return (tooltip);
}

function node_tooltip(node) {
  var tooltip = null;
  switch (node.data('type')) {
    case 'EconomicResource':
      tooltip = {
        'trackingId': node.data('trackingIdentifier'),
        'primaryAccountable': node.data('primaryAccountable.name'),
        'custodian': node.data('custodian.name'),
        'accountingQuantity': node.data('accountingQuantity.hasNumericalValue') + " " + node.data('accountingQuantity.hasUnit.symbol'),
        'onhandQuantity': node.data('onhandQuantity.hasNumericalValue') + " " + node.data('onhandQuantity.hasUnit.symbol'),
        "mappableAddress": node.data('currentLocation.mappableAddress'),
        'lat': node.data('currentLocation.lat'),
        'long': node.data('currentLocation.long')
      };
      break;
    case 'EconomicEvent':
      tooltip = {
        'note': node.data('note'),
        'hasPointInTime': node.data('hasPointInTime'),
        'provider': node.data('provider.name'),
        'receiver': node.data('receiver.name'),
        'resourceQuantity': node.data('resourceQuantity.hasNumericalValue') != undefined ? node.data('resourceQuantity.hasNumericalValue') + " " + node.data('resourceQuantity.hasUnit.symbol') : null,
        'effortQuantity': node.data('effortQuantity.hasNumericalValue') != undefined ? node.data('effortQuantity.hasNumericalValue') + " " + node.data('effortQuantity.hasUnit.symbol') : null,
        "mappableAddress": node.data('toLocation.mappableAddress'),
        'lat': node.data('toLocation.lat'),
        'long': node.data('toLocation.long')

      };
      break;
    case 'Process':
      tooltip = {
        'note': node.data('note')
      };
      break;
    case 'ProcessGroup':
      tooltip = {
        'note': node.data('note')
      };
      break;
    case 'Person':
      tooltip = {
        'note': node.data('note'),
        "mappableAddress": node.data('primaryLocation.mappableAddress'),
        'lat': node.data('primaryLocation.lat'),
        'long': node.data('primaryLocation.long')
      };
      break;
    default:
      throw new Error('type is not defined: ' + node.data('type'));
  }
  return (tooltip);
}

export function createToolTip(cy) {

  cy.nodes().forEach(function (node) {

    let tooltip = node_tooltip(node);

    let content = {};
    // if ('link' in tooltip) {
    //   content = createCustEl('a', { target: '_blank', href: tooltip.link, 'class': 'tip-link' }, [document.createTextNode(tooltip.label)]);

    // } else {
    // console.log(Object.keys(tooltip));

    let lines = [];
    Object.keys(tooltip).forEach(function (key) {
      if (key != 'label' && tooltip[key] != null) {
        let val = tooltip[key];
        lines.push(createCustEl('p', {}, [document.createTextNode(key + ": " + val)]));
      }
    });

    content = createCustEl('p', {}, lines);
    // }

    var tippy = makeTippy(createCustEl('div', {}, []), content, node);

    node.data('tippy', tippy);

    node.on('click', function (e) {
      tippy.show();
      e.stopPropagation();
      // cy.nodes().not(node).forEach(hideTippy);
    });
  });
}

// function makePopper(ele) {
//   let ref = ele.popperRef();
//   ele.tippy = tippy(document.createElement('div'), {
//     content: ele.id(),
//     hideOnClick: false,
//     flipOnUpdate: true,
//     sticky: true,
//     onShow(instance) {
//       instance.popperInstance.reference = ref;
//     },
//   });
// }


// cy.elements().unbind('mouseover');
// cy.elements().bind('mouseover', (event) => event.target.tippy.show());

// cy.elements().unbind('mouseout');
// cy.elements().bind('mouseout', (event) => event.target.tippy.hide());



function makeTippy(element, content, node) {
  let ref = node.popperRef();
  return tippy(element, {
    getReferenceClientRect: ref.getBoundingClientRect,
    allowHTML: true,
    content: content,
    trigger: 'manual',
    arrow: true,
    placement: 'bottom',
    hideOnClick: false,
    interactive: true,
    appendTo: document.body,
    theme: 'light-border',
    // onCreate(instance) {
    //   console.log(instance);
    //   // instance.popperInstance.reference = ref;
    // },
  });
}

export function hideTippy(node) {
  var tippy = node.data('tippy');

  if (tippy != null) {
    tippy.hide();
  }
}

export function hideAllTippies(eles) {
  eles.nodes().forEach(hideTippy);
}
