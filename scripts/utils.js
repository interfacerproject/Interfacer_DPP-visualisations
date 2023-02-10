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
// HELPER FUNCTIONS
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@


export function createCustEl(tag, attrs, children) {
  var el = document.createElement(tag);

  Object.keys(attrs).forEach(function (key) {
    var val = attrs[key];

    el.setAttribute(key, val);
  });

  children.forEach(function (child) {
    el.appendChild(child);
  });

  return el;
}

// seconds * minutes * hours * milliseconds = 1 day 
const day = 60 * 60 * 24 * 1000;

export function floorDay(value) {
  var wholeDay = new Date(value);
  wholeDay.setHours(0);
  wholeDay.setMinutes(0);
  wholeDay.setSeconds(0);
  wholeDay.setMilliseconds(0);
  return (wholeDay);
}

export function ceilingDay(value) {

  var wholeDay = new Date(value + day);
  wholeDay.setHours(0);
  wholeDay.setMinutes(0);
  wholeDay.setSeconds(0);
  wholeDay.setMilliseconds(0);
  return (wholeDay);
}

export function addDays(value) {

  return(value * day);

}
