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
// FILTER FUNCTIONS
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
import { cy } from './setup.js';


function removeLonelyNodes() {

  var nodes = cy.nodes()
    .filter(function (node) {
      // we do not include node removed
      if (!node.removed()) {
        var degree = node.degree(false);
        return (degree == 0);
      } else {
        return false;
      }
    }
    );

  if (removed_nodes != null) {
    removed_nodes = removed_nodes.union(nodes.remove());
  } else {
    removed_nodes = nodes.remove();
  }

}



