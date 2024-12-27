import {
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';

import {
    PanAirsTsClient,
    PanAirsTsConfig,
    ScanRequest,
    AsyncScanRequest,
} from '../src';
import {
    ScanResponse,
} from '../src';

// -------------------------------------------------------------------------
// 1) Define a mock Axios instance that your library's "axios.create()" returns.
//    Must have interceptors and the post/get methods to avoid "undefined" errors.
// -------------------------------------------------------------------------
const mockAxiosInstance = {
    interceptors: {
        response: {
            use: jest.fn(), // We don't need a real implementation; we only need to ensure it's "there."
        },
    },
    post: jest.fn(),
    get: jest.fn(),
};

// -------------------------------------------------------------------------
// 2) Mock the 'axios' module so that "axios.create()" returns "mockAxiosInstance."
// -------------------------------------------------------------------------
jest.mock('axios', () => {
    const originalAxios = jest.requireActual('axios') as typeof import('axios');
    return {
        ...originalAxios,
        create: jest.fn(() => mockAxiosInstance),
    };
});

describe('PanAirsTsClient', () => {
    let client: PanAirsTsClient;

    // -----------------------------------------------------------------------
    // 3) Before each test, clear all mocks and set default resolved values.
    // -----------------------------------------------------------------------
    beforeEach(() => {
        jest.clearAllMocks();

        mockAxiosInstance.post.mockResolvedValue({ data: {} });
        mockAxiosInstance.get.mockResolvedValue({ data: {} });

        const config: PanAirsTsConfig = {
            apiToken: 'test-token',
            baseURL: 'https://mocked.api.endpoint',
        };
        // This calls axios.create(...) -> returns mockAxiosInstance
        client = new PanAirsTsClient(config);
    });

    // =========================================================================
    // scanSyncRequest
    // =========================================================================
    describe('scanSyncRequest', () => {
        it('should return data on success', async () => {
            // Arrange
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
            mockAxiosInstance.post.mockResolvedValueOnce(mockAxiosResponse);

            const requestBody: ScanRequest = {
                ai_profile: { profile_name: 'test-profile' },
                contents: [{ prompt: 'test prompt' }],
            };

            // Act
            const result = await client.scanSyncRequest(requestBody);

            // Assert
            expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                '/v1/scan/sync/request',
                requestBody
            );
            expect(result).toEqual(mockScanResponse);
        });


    });

    // =========================================================================
    // scanAsyncRequest
    // =========================================================================
    describe('scanAsyncRequest', () => {
        it('should return async response on success', async () => {
            // Arrange
            const mockResponseData = {
                received: new Date().toISOString(),
                scan_id: 'scan123',
                report_id: 'R-async',
            };
            mockAxiosInstance.post.mockResolvedValueOnce({
                data: mockResponseData,
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

            // Act
            const result = await client.scanAsyncRequest(requestBody);

            // Assert
            expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                '/v1/scan/async/request',
                requestBody
            );
            expect(result).toEqual(mockResponseData);
        });

    });

    // =========================================================================
    // getScanResultsByScanIds
    // =========================================================================
    describe('getScanResultsByScanIds', () => {
        it('should throw error if no scanIds are provided', async () => {
            await expect(client.getScanResultsByScanIds([])).rejects.toThrowError(
                'At least 1 scan_id is required'
            );
        });

        it('should throw error if more than 5 scanIds are provided', async () => {
            const tooManyIds = ['1', '2', '3', '4', '5', '6'];
            await expect(client.getScanResultsByScanIds(tooManyIds)).rejects.toThrowError(
                'Max of 5 scan_ids can be requested at a time'
            );
        });

        it('should return scan results on success', async () => {
            // Arrange
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
            mockAxiosInstance.get.mockResolvedValueOnce({ data: mockData });

            // Act
            const result = await client.getScanResultsByScanIds(['scan1']);

            // Assert
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/scan/results', {
                params: { scan_ids: 'scan1' },
            });
            expect(result).toEqual(mockData);
        });

    });

    // =========================================================================
    // getThreatScanReports
    // =========================================================================
    describe('getThreatScanReports', () => {
        it('should throw error if no reportIds are provided', async () => {
            await expect(client.getThreatScanReports([])).rejects.toThrowError(
                'At least 1 report_id is required'
            );
        });

        it('should throw error if more than 5 reportIds are provided', async () => {
            const tooManyIds = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'];
            await expect(client.getThreatScanReports(tooManyIds)).rejects.toThrowError(
                'Max of 5 report_ids can be requested at a time'
            );
        });

        it('should return threat scan reports on success', async () => {
            // Arrange
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
            mockAxiosInstance.get.mockResolvedValueOnce({ data: mockData });

            // Act
            const result = await client.getThreatScanReports(['rep123']);

            // Assert
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/scan/reports', {
                params: { report_ids: 'rep123' },
            });
            expect(result).toEqual(mockData);
        });

    });
});
