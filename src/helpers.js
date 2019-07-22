// https://github.com/odyniec/tinyAgo-js/blob/master/tinyAgo.js
export const timeAgo = val => {
  val = 0 | (Date.now() - val) / 1000;
  var unit, length = { s: 60, min: 60, h: 24, day: 7, week: 4.35,
      month: 12, year: 10000 }, result;

      for (unit in length) {
    result = val % length[unit];
    if (!(val = 0 | val / length[unit])) {
      return result + ' ' + (result-1 && unit.length !== 1 ? unit + 's' : unit);
    }
  }
};