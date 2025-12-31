// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
jest.mock('axios', () => ({
  __esModule: true,
  default: (() => {
    const instance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
    };
    return {
      ...instance,
      create: () => instance,
    };
  })(),
}));
jest.mock('jspdf', () => ({
  __esModule: true,
  default: function () {
    return {
      save: jest.fn(),
      text: jest.fn(),
      addImage: jest.fn(),
    };
  },
}));
jest.mock('html2canvas', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve({})),
}));
