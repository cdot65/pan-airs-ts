import axios, {
    AxiosResponse,
    AxiosError,
    InternalAxiosRequestConfig,
} from 'axios';

import {
    PanAirsTsClient,
    PanAirsTsConfig,
    PanAirsApiError,
    ScanRequest,
    AsyncScanRequest,
} from '../src';
import {
    ScanResponse,
    PanAirsApiErrorResponse,
} from '../src';

jest.mock('axios');

// The shape of our mock axios instance
const mockAxiosInstance = {
    interceptors: {
        response: {
            use: jest.fn((successFn, errorFn) => {
                interceptorSuccessFn = successFn;
                interceptorErrorFn = errorFn;
            }),
        },
    },
    post: jest.fn(),
    get: jest.fn(),
};

// The actual interceptor callbacks that get set in the constructor
let interceptorSuccessFn: (response: AxiosResponse) => AxiosResponse;
let interceptorErrorFn: (error: AxiosError<PanAirsApiErrorResponse>) => Promise<never>;

describe('PanAirsTsClient', () => {
    let client: PanAirsTsClient;

    beforeAll(() => {
        // 1) The default "axios.create()" will return "mockAxiosInstance"
        (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);

        // 2) Intercept the "interceptors.response.use" calls so we capture successFn, errorFn
        mockAxiosInstance.interceptors.response.use.mockImplementation(
            (successFn, errorFn) => {
                interceptorSuccessFn = successFn;
                interceptorErrorFn = errorFn;
                // The real axios interceptor returns an ID (number) for reference, we can return 0
                return 0;
            }
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();

        // Re-initialize the client each time, which sets up the interceptor
        const config: PanAirsTsConfig = {
            apiToken: 'test-token',
            baseURL: 'https://mocked.api.endpoint',
        };
        client = new PanAirsTsClient(config);
    });

    /* ------------------------------------------------------------------
     * scanSyncRequest
     * ------------------------------------------------------------------ */
    describe('scanSyncRequest', () => {
        it('should return data on success', async () => {
            // 1) Prepare the "mock response" that post() initially returns
            const mockScanResponse: ScanResponse = {
                report_id: 'rep123',
                scan_id: 'scanXYZ',
                category: 'malicious',
                action: 'block',
            };
            const mockAxiosResponse: AxiosResponse<ScanResponse> = {
                data: mockScanResponse,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as InternalAxiosRequestConfig,
            };

            // 2) Define how post() works in a success scenario:
            mockAxiosInstance.post.mockImplementationOnce(async () => {
                // 3) "post" resolves => we pass the response to the interceptor successFn
                return interceptorSuccessFn(mockAxiosResponse);
            });

            // 4) Actual test
            const requestBody: ScanRequest = {
                ai_profile: { profile_name: 'test-profile' },
                contents: [{ prompt: 'test prompt' }],
            };
            const result = await client.scanSyncRequest(requestBody);

            expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                '/v1/scan/sync/request',
                requestBody
            );
            expect(result).toEqual(mockScanResponse);
        });

        it('should throw PanAirsApiError on error response', async () => {
            // 1) Create a real Error object (cast to AxiosError)
            const mockError = new Error('Bad Request') as AxiosError<PanAirsApiErrorResponse>;
            mockError.config = {} as InternalAxiosRequestConfig;
            mockError.response = {
                status: 400,
                data: { message: 'Bad Request' },
                statusText: 'Bad Request',
                headers: {},
                config: {} as InternalAxiosRequestConfig,
            };
            mockError.isAxiosError = true;

            // 2) post() rejects => we pass the error to the interceptor errorFn
            mockAxiosInstance.post.mockImplementationOnce(async () => {
                return Promise.reject(interceptorErrorFn(mockError));
            });

            const requestBody: ScanRequest = {
                ai_profile: { profile_name: 'test-profile' },
                contents: [{ prompt: 'test prompt' }],
            };

            // 3) Confirm it ends up throwing PanAirsApiError
            await expect(client.scanSyncRequest(requestBody)).rejects.toThrow(
                PanAirsApiError
            );
            expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                '/v1/scan/sync/request',
                requestBody
            );
        });
    });

    /* ------------------------------------------------------------------
     * scanAsyncRequest
     * ------------------------------------------------------------------ */
    describe('scanAsyncRequest', () => {
        it('should return async response on success', async () => {
            const mockResponseData = {
                received: new Date().toISOString(),
                scan_id: 'scan123',
                report_id: 'R-async',
            };

            const mockResponse: AxiosResponse = {
                data: mockResponseData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as InternalAxiosRequestConfig
            };

            mockAxiosInstance.post.mockImplementationOnce(async () => {
                return interceptorSuccessFn(mockResponse);
            });

            const requestBody: AsyncScanRequest = [
                {
                    req_id: 1,
                    scan_req: {
                        ai_profile: { profile_name: 'test-profile' },
                        contents: [{ prompt: 'test prompt' }],
                    },
                },
            ];

            const result = await client.scanAsyncRequest(requestBody);

            expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                '/v1/scan/async/request',
                requestBody
            );
            expect(result).toEqual(mockResponseData);
        });


        it('should throw PanAirsApiError on error response', async () => {
            const mockError = new Error('Forbidden') as AxiosError<PanAirsApiErrorResponse>;
            mockError.response = {
                status: 403,
                data: { message: 'Forbidden' },
                statusText: 'Forbidden',
                headers: {},
                config: {} as InternalAxiosRequestConfig,
            };
            mockError.isAxiosError = true;

            mockAxiosInstance.post.mockImplementationOnce(async () => {
                return Promise.reject(interceptorErrorFn(mockError));
            });

            const requestBody: AsyncScanRequest = [
                {
                    req_id: 1,
                    scan_req: {
                        ai_profile: { profile_name: 'test-profile' },
                        contents: [{ prompt: 'test prompt' }],
                    },
                },
            ];

            await expect(client.scanAsyncRequest(requestBody)).rejects.toThrow(
                PanAirsApiError
            );
            expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                '/v1/scan/async/request',
                requestBody
            );
        });
    });

    /* ------------------------------------------------------------------
     * getScanResultsByScanIds
     * ------------------------------------------------------------------ */
    describe('getScanResultsByScanIds', () => {
        it('should throw error if no scanIds are provided', async () => {
            await expect(client.getScanResultsByScanIds([])).rejects.toThrow(
                'At least 1 scan_id is required'
            );
        });

        it('should throw error if more than 5 scanIds are provided', async () => {
            const tooManyIds = ['1', '2', '3', '4', '5', '6'];
            await expect(client.getScanResultsByScanIds(tooManyIds)).rejects.toThrow(
                'Max of 5 scan_ids can be requested at a time'
            );
        });

        it('should return scan results on success', async () => {
            const mockData = [
                {
                    scan_id: 'scan1',
                    status: 'complete',
                    result: {
                        report_id: 'rep1',
                        scan_id: 'scan1',
                        category: 'benign',
                        action: 'allow',
                    },
                },
            ];

            const mockResponse: AxiosResponse = {
                data: mockData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as InternalAxiosRequestConfig
            };

            mockAxiosInstance.get.mockImplementationOnce(async () => {
                return interceptorSuccessFn(mockResponse);
            });

            const result = await client.getScanResultsByScanIds(['scan1']);
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/scan/results', {
                params: { scan_ids: 'scan1' },
            });
            expect(result).toEqual(mockData);
        });

        it('should throw PanAirsApiError on error response', async () => {
            const mockError = new Error('Not Found') as AxiosError<PanAirsApiErrorResponse>;
            mockError.response = {
                status: 404,
                data: { message: 'Not Found' },
                statusText: 'Not Found',
                headers: {},
                config: {} as InternalAxiosRequestConfig,
            };
            mockError.isAxiosError = true;

            mockAxiosInstance.get.mockImplementationOnce(async () => {
                return Promise.reject(interceptorErrorFn(mockError));
            });

            await expect(client.getScanResultsByScanIds(['unknown'])).rejects.toThrow(
                PanAirsApiError
            );
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/scan/results', {
                params: { scan_ids: 'unknown' },
            });
        });
    });

    /* ------------------------------------------------------------------
     * getThreatScanReports
     * ------------------------------------------------------------------ */
    describe('getThreatScanReports', () => {
        it('should throw error if no reportIds are provided', async () => {
            await expect(client.getThreatScanReports([])).rejects.toThrow(
                'At least 1 report_id is required'
            );
        });

        it('should throw error if more than 5 reportIds are provided', async () => {
            const tooManyIds = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'];
            await expect(client.getThreatScanReports(tooManyIds)).rejects.toThrow(
                'Max of 5 report_ids can be requested at a time'
            );
        });

        it('should return threat scan reports on success', async () => {
            const mockData = [
                {
                    report_id: 'rep123',
                    scan_id: 'scanXYZ',
                    detection_results: [
                        {
                            data_type: 'prompt',
                            detection_service: 'pi',
                            verdict: 'malicious',
                            action: 'block',
                        },
                    ],
                },
            ];

            const mockResponse: AxiosResponse = {
                data: mockData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as InternalAxiosRequestConfig
            };

            mockAxiosInstance.get.mockImplementationOnce(async () => {
                return interceptorSuccessFn(mockResponse);
            });

            const result = await client.getThreatScanReports(['rep123']);
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/scan/reports', {
                params: { report_ids: 'rep123' },
            });
            expect(result).toEqual(mockData);
        });

        it('should throw PanAirsApiError on error response', async () => {
            const mockError = new Error('Too Many Requests') as AxiosError<PanAirsApiErrorResponse>;
            mockError.response = {
                status: 429,
                data: { message: 'Too Many Requests' },
                statusText: 'Too Many Requests',
                headers: {},
                config: {} as InternalAxiosRequestConfig,
            };
            mockError.isAxiosError = true;

            mockAxiosInstance.get.mockImplementationOnce(async () => {
                return Promise.reject(interceptorErrorFn(mockError));
            });

            await expect(client.getThreatScanReports(['spam-id'])).rejects.toThrow(PanAirsApiError);
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/scan/reports', {
                params: { report_ids: 'spam-id' },
            });
        });
    });
});
