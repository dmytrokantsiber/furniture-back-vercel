function parseFilterParams(queryString) {
  const params = new URLSearchParams(queryString);
  const result = {};

  for (const [key, value] of params) {
    if (value.includes(",")) {
      result[key] = value.split(",").map((item) => decodeURIComponent(item));
    } else {
      result[key] = decodeURIComponent(value);
    }
  }

  return result;
}

module.exports = { parseFilterParams };
