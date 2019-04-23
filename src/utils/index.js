export function debounce (callback, delay, immediate) {
  let timeout;
  return function () {
    let callNow;
    if (timeout)
      clearTimeout(timeout);
    callNow = !timeout && immediate;
    if (callNow) {
      // let result = callback.apply(this, Array.prototype.slice.call(arguments, 0));
      timeout = {};
    }
    else {
      timeout = setTimeout(() => {
        callback.apply(this, Array.prototype.slice.call(arguments, 0));
      }, delay);
    }
  };
}
