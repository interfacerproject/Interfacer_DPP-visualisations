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
// CENTRALITIES FUNCTIONS
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

import { cy } from './setup.js';
import {floorDay, ceilingDay} from './utils.js';

export function calculateEdgeWeights() {

  const HIGHVALUE = 10000000;
  const LOWVALUE = -10000000;

  var weight_minmax = {
    min: HIGHVALUE,
    max: LOWVALUE
  };

  cy.edges().forEach(function (edge) {
    var weight = edge.data('weight');

    if (weight < weight_minmax.min) {
      weight_minmax.min = weight;
    }
    if (weight > weight_minmax.max) {
      weight_minmax.max = weight;
    }

  });

  return (weight_minmax);
}

export function calculateTweetsTime() {

  const EARLYVALUE = new Date("1020-01-01T00:00:00.000").getTime();
  const LATEVALUE = new Date("3020-01-01T00:00:00.000").getTime();

  var date_minmax = {
    min: {
      value: LATEVALUE,
      string: "3020-01-01T00:00:00.000"
    },
    max: {
      value: EARLYVALUE,
      string: "1020-01-01T00:00:00.000"
    }
  };

  cy.nodes()
    .filter(node => node.data('type') == 'tweet')
    .forEach(function (node) {
      var date_str = node.data('created_at');

      if (date_str != null) {
        var date = new Date(node.data('created_at')).getTime();
        if (date == 0) {
          console.log(date_str)
        }

        if (date < date_minmax.min.value) {
          date_minmax.min.value = date;
          date_minmax.min.string = date_str;
        }
        if (date > date_minmax.max.value) {
          date_minmax.max.value = date;
          date_minmax.max.string = date_str;
        }


      }
    });

  var wholeDay = floorDay(date_minmax.min.value);
  date_minmax.min.value = wholeDay.getTime();
  date_minmax.min.string = wholeDay.toISOString();

  wholeDay = ceilingDay(date_minmax.max.value);
  date_minmax.max.value = wholeDay.getTime();
  date_minmax.max.string = wholeDay.toISOString();

  
  return (date_minmax);

}
