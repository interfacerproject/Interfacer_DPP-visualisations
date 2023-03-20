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
// LAYOUT FUNCTIONS
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@


function make_label(node) {
    let label;
    switch (node.data('type')) {
        case 'EconomicResource':
            label = node.data('name') + "\n" + "\u25A3" + " ";
            if (node.data('primaryAccountable.name') != node.data('custodian.name')) {
                label = label + node.data('primaryAccountable.name') + "(" + node.data('custodian.name') + ")";
            } else {
                label = label + node.data('primaryAccountable.name');
            }
            break;
        case 'EconomicEvent':
            switch (node.data('name')) {
                case 'transfer': case 'transferCustody': case 'transferAllRights':
                    label = node.data('name') + "\n" + node.data('provider.name') + " -> " + node.data('receiver.name');
                    break;
                default:
                    label = node.data('name')
                    break;
            }
            break;
        default:
            label = node.data('name')
            break;
    }
    return label;
}



export function applyStyle(cy) {
    fetch('./css/graph.json')
        .then(
            res => res.json()
        )
        .then(function(resjson){
            for(var slc of resjson){
                if( slc.selector == 'node'){
                    slc.style.label = function(ele){return make_label(ele)};
                    break;
                }
            }
            return (resjson)
        })
        .then(resjson => cy.style().fromJson(resjson).update()
        )
}
