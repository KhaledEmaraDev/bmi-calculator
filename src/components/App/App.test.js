import React from 'react';
import { shallow, render } from 'enzyme';

import App from './App';

describe('A suite', function () {
	it('should be selectable by class "container"', function () {
		expect(shallow(<App />).is('.container')).toBe(true);
	});

	it('should render to static HTML', function () {
		expect(render(<App />).text()).toEqual(
			' BMI Tracker Weight (in kg)Height (in cm)Calculate BMI7 Day DataNo log found'
		);
	});
});
