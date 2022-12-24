import React from 'react';

import { render } from 'enzyme';
import { perf, wait } from 'react-performance-testing';
import 'jest-performance-testing';

import App from './App';

test('should render within specified time', async () => {
	const { renderTime } = perf(React);

	render(<App />);

	await wait(() => {
		expect(renderTime.current.App).toBeMountedWithin(38);
		expect(renderTime.current.App).toBeUpdatedWithin(38);
	});
});
