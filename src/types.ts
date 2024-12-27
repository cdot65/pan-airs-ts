// src/types.ts

/**
 * Common AI Profile reference:
 *   Either profile_id or profile_name must be provided.
 */
export interface AiProfile {
    profile_id?: string;
    profile_name?: string;
}

/**
 * Optional metadata about your application or AI model
 */
export interface Metadata {
    app_name?: string;
    app_user?: string;
    ai_model?: string;
}

/**
 * Content object for scanning (prompt/response pairs or partial).
 */
export interface ScanContent {
    prompt?: string;
    response?: string;
}

/**
 * Sync Scan Request:
 *   - A single scan request object
 */
export interface ScanRequest {
    tr_id?: string;
    ai_profile: AiProfile;
    metadata?: Metadata;
    contents: ScanContent[];
}

/**
 * Response sub-objects: indicates detections for prompt or response.
 */
export interface PromptDetected {
    url_cats?: boolean;
    dlp?: boolean;
    injection?: boolean;
}

export interface ResponseDetected {
    url_cats?: boolean;
    dlp?: boolean;
}

/**
 * Sync Scan Response object
 */
export interface ScanResponse {
    report_id: string;
    scan_id: string;
    tr_id?: string;
    profile_id?: string;
    profile_name?: string;
    category: string; // e.g. "malicious", "benign"
    action: string;   // e.g. "block", "allow"
    prompt_detected?: PromptDetected;
    response_detected?: ResponseDetected;
    created_at?: string;
    completed_at?: string;
}

/**
 * Async Scan Request:
 *   - You can post multiple items in a single request
 */
export interface AsyncScanObject {
    req_id: number;      // unique ID for each item in the batch
    scan_req: ScanRequest; // each item is basically the same structure as a sync request
}

export type AsyncScanRequest = AsyncScanObject[];

/**
 * Async Scan Response
 */
export interface AsyncScanResponse {
    received: string;    // date-time
    scan_id: string;
    report_id?: string;
}

/**
 * Scan Results (GET /v1/scan/results) - returns array of scan results by scan IDs
 */
export interface ScanIdResult {
    req_id?: number;
    status?: string; // e.g. "complete", "pending"
    scan_id: string;
    result?: ScanResponse;
}

/**
 * Threat Scan Reports (GET /v1/scan/reports)
 *   Returns an array of ThreatScanReportObject
 */
export interface ThreatScanReportObject {
    report_id: string;
    scan_id: string;
    req_id?: number;
    transaction_id?: string;
    detection_results?: DetectionServiceResultObject[];
}

export type ThreatScanReportObjects = ThreatScanReportObject[];

/**
 * Detailed detection results
 */
export interface DetectionServiceResultObject {
    data_type?: string;         // e.g. "prompt" or "response"
    detection_service?: string; // e.g. "urlf", "dlp", "prompt injection"
    verdict?: string;           // e.g. "malicious" or "benign"
    action?: string;            // e.g. "block" or "allow"
    result_detail?: DSDetailResultObject;
}

export interface DSDetailResultObject {
    urlf_report?: UrlFilterReportObject[];
    dlp_report?: DlpReportObject;
}

/**
 * URL Filtering entries
 */
export interface UrlFilterReportObject extends Array<UrlfEntryObject> {}

export interface UrlfEntryObject {
    url?: string;
    risk_level?: string;   // e.g. "high", "medium", "low"
    categories?: string[]; // e.g. ["malware"]
}

/**
 * DLP report details
 */
export interface DlpReportObject {
    dlp_report_id?: string;
    dlp_profile_name?: string;
    dlp_profile_id?: string;
    dlp_profile_version?: number;
    data_pattern_rule1_verdict?: string; // e.g. "MATCHED", "NOT_MATCHED"
    data_pattern_rule2_verdict?: string;
}

/**
 * Error response object
 */
export interface PanAirsApiErrorResponse {
    status_code?: number;
    message?: string;
    error?: {
        message?: string;
        [key: string]: any;
    };
    retry_after?: {
        interval?: number;
        unit?: string;
    };
}
