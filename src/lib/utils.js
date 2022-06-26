export const zip = (rows) => rows[0].map((_, c) => rows.map((row) => row[c]));

export const range = (n) => Array.from(Array(n).keys());

// https://stackoverflow.com/a/2878746
export const partition = (str, sep) => {
  const i = str.indexOf(sep);
  return [str.slice(0, i), str.slice(i + sep.length)];
};

// https://stackoverflow.com/a/12646864
export const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};
