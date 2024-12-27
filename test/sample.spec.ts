import { exampleFunction } from '../src';

describe('exampleFunction', () => {
    it('should return hello message', () => {
        expect(exampleFunction('World')).toBe('Hello World');
    });
});
