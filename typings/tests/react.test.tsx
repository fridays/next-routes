import * as React from 'react';
import { render, cleanup } from 'react-testing-library';

import App from './react';

/**
 * Automatically unmount and cleanup DOM after the test is finished.
 */
afterEach(cleanup);

test('renders without crashing', () => {
  const { container } = render(<App />);
  expect(container).toMatchSnapshot();
});
