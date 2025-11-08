import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder for Firebase packages under Jest/node.
import { TextDecoder, TextEncoder } from 'util';

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder as typeof global.TextEncoder;
}

if (!global.TextDecoder) {
  // @ts-expect-error TextDecoder typing mismatch between dom and util
  global.TextDecoder = TextDecoder;
}

