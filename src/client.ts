// src/client.ts

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import {
    ScanRequest,
    ScanResponse,
    AsyncScanRequest,
    AsyncScanResponse,
    ScanIdResult,
    ThreatScanReportObjects,
    PanAirsApiErrorResponse,
} from './types';
import { PanAirsApiError } from './errors';

export interface PanAirsTsConfig {
    /**
     * Your API token for x-pan-token header.
     */
    apiToken: string;

    /**
     * Base URL for the AISecurity service.
     * Defaults to "https://service.api.aisecurity.paloaltonetworks.com".
     */
    baseURL?: string;
}

/**
 * Main class to handle interactions with Palo Alto Networks AI Runtime Security (AIRS).
 */
export class PanAirsTsClient {
    private readonly axiosInstance: AxiosInstance;

    constructor(config: PanAirsTsConfig) {
        this.axiosInstance = axios.create({
            baseURL: config.baseURL ?? 'https://service.api.aisecurity.paloaltonetworks.com',
            headers: {
                'Content-Type': 'application/json',
                'x-pan-token': config.apiToken,
            },
        });

        // Intercept responses to throw custom errors
        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => {
                return response;
            },
            (error: AxiosError<PanAirsApiErrorResponse>) => {
                if (error.response) {
                    const statusCode = error.response.status || 500;
                    // error.response.data is already typed as PanAirsApiErrorResponse | undefined
                    const data: PanAirsApiErrorResponse = error.response.data || {};
                    const message = data.message || data.error?.message || `API Error ${statusCode}`;
                    const details = data.error ? JSON.stringify(data.error) : undefined;

                    throw new PanAirsApiError(statusCode, message, details);
                }
                // network or unknown error
                throw new PanAirsApiError(500, 'Unknown error while calling AIRS');
            },
        );
    }

    /**
     * POST /v1/scan/sync/request
     * Synchronous scan request that returns an immediate verdict.
     */
    public async scanSyncRequest(requestBody: ScanRequest): Promise<ScanResponse> {
        const { data } = await this.axiosInstance.post<ScanResponse>(
            '/v1/scan/sync/request',
            requestBody,
        );
        return data;
    }

    /**
     * POST /v1/scan/async/request
     * Asynchronous scan request that may return a partial response or an ID to check results later.
     */
    public async scanAsyncRequest(requestBody: AsyncScanRequest): Promise<AsyncScanResponse> {
        const { data } = await this.axiosInstance.post<AsyncScanResponse>(
            '/v1/scan/async/request',
            requestBody,
        );
        return data;
    }

    /**
     * GET /v1/scan/results?scan_ids=id1,id2
     * Retrieve results for up to 5 Scan IDs
     */
    public async getScanResultsByScanIds(scanIds: string[]): Promise<ScanIdResult[]> {
        if (scanIds.length < 1) {
            throw new Error('At least 1 scan_id is required');
        }
        if (scanIds.length > 5) {
            throw new Error('Max of 5 scan_ids can be requested at a time');
        }

        const query = scanIds.join(',');
        const { data } = await this.axiosInstance.get<ScanIdResult[]>(`/v1/scan/results`, {
            params: { scan_ids: query },
        });
        return data;
    }

    /**
     * GET /v1/scan/reports?report_ids=id1,id2
     * Retrieve Threat Scan Reports by their IDs
     */
    public async getThreatScanReports(reportIds: string[]): Promise<ThreatScanReportObjects> {
        if (reportIds.length < 1) {
            throw new Error('At least 1 report_id is required');
        }
        if (reportIds.length > 5) {
            throw new Error('Max of 5 report_ids can be requested at a time');
        }

        const query = reportIds.join(',');
        const { data } = await this.axiosInstance.get<ThreatScanReportObjects>('/v1/scan/reports', {
            params: { report_ids: query },
        });
        return data;
    }
}
