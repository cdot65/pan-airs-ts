import { PanAirsApiError } from '../src';

describe('PanAirsApiError', () => {
    it('should create error with basic properties', () => {
        const error = new PanAirsApiError(404, 'Not Found');

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(PanAirsApiError);
        expect(error.name).toBe('PanAirsApiError');
        expect(error.message).toBe('Not Found');
        expect(error.statusCode).toBe(404);
        expect(error.details).toBeUndefined();
    });

    it('should create error with details when provided', () => {
        const details = JSON.stringify({ code: 'NOT_FOUND', entity: 'user' });
        const error = new PanAirsApiError(404, 'Not Found', details);

        expect(error.details).toBe(details);
    });

    it('should have proper stack trace', () => {
        const error = new PanAirsApiError(500, 'Server Error');
        expect(error.stack).toBeDefined();
        expect(error.stack).toContain('PanAirsApiError');
    });
});