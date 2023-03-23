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

export function download(cy, filename) {
  const options = {
    full: false,
    scale: 1,
    bg: '#FFFFFF'
  };

  var svgContent = cy.svg(options);
  // var blob = new Blob([svgContent], {type:"image/svg+xml;charset=utf-8"});
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(svgContent));
  
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}