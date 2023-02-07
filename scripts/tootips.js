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

export function hideAllTippies(cy) {
  cy.nodes().forEach(hideTippy);
}
