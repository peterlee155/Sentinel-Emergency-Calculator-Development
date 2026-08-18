let store = {};

module.exports = {
  getItem: jest.fn(async (key) => store[key] || null),
  setItem: jest.fn(async (key, val) => {
    store[key] = val;
  }),
  removeItem: jest.fn(async (key) => {
    delete store[key];
  }),
  clear: jest.fn(async () => {
    store = {};
  }),
  getAllKeys: jest.fn(async () => Object.keys(store)),
};
