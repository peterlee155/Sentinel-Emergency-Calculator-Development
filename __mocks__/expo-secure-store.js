let secureStore = {};

module.exports = {
  getItemAsync: jest.fn(async (key) => secureStore[key] || null),
  setItemAsync: jest.fn(async (key, val) => {
    secureStore[key] = val;
  }),
  deleteItemAsync: jest.fn(async (key) => {
    delete secureStore[key];
  }),
};
