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

export function formatLimit(limit) {
  let size = '';

  if (isNaN(limit * 1)) {
    return size;
  }

  let realLimit = limit * 1;

  if (realLimit < 0.1 * 1024) {
    size = realLimit.toFixed(2) + 'B'
  } else if (realLimit < 0.1 * 1024 * 1024) {
    size = (realLimit / 1024).toFixed(2) + 'KB'
  } else if (realLimit < 0.1 * 1024 * 1024 * 1024) {
    size = (realLimit / (1024 * 1024)).toFixed(2) + 'MB'
  } else {
    size = (realLimit / (1024 * 1024 * 1024)).toFixed(2) + 'GB'
  }

  return size;
}
