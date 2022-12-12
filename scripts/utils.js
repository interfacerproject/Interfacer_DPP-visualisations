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
