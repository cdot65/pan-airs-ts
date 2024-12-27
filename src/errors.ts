// src/errors.ts

export class PanAirsApiError extends Error {
    public statusCode: number;
    public details?: string;

    constructor(statusCode: number, message: string, details?: string) {
        super(message);
        this.name = 'PanAirsApiError';
        this.statusCode = statusCode;
        if (details) {
            this.details = details;
        }
        // Maintains proper stack trace (V8 only)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, PanAirsApiError);
        }
    }
}
