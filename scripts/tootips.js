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
// TOOLTIP FUNCTIONS§§
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

import { createCustEl } from './utils.js';
import { node_properties } from './layout.js';

export function createToolTip(cy) {
  
  cy.nodes().forEach(function (node) {

    let tooltip = node_properties(node).tooltip;

    let content = {};
    // if ('link' in tooltip) {
    //   content = createCustEl('a', { target: '_blank', href: tooltip.link, 'class': 'tip-link' }, [document.createTextNode(tooltip.label)]);

    // } else {
    // console.log(Object.keys(tooltip));

    let lines = [];
    Object.keys(tooltip).forEach(function (key) {
      if (key != 'label' && tooltip[key] != null){
        let val = tooltip[key];
        lines.push(createCustEl('p', {}, [document.createTextNode(key + ": " + val )]));
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
