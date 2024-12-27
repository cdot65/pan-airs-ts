import { PanAirsTsClient, PanAirsApiError, ScanRequest, AsyncScanRequest } from 'pan-airs-ts';

async function main() {
    // Initialize the client
    const client = new PanAirsTsClient({
        apiToken: 'your-airs-api-token-here',
        // Optionally override the base URL if needed
        // baseURL: 'https://your-custom-endpoint.com'
    });

    try {
        // 1. Synchronous Scan Example
        const syncRequest: ScanRequest = {
            ai_profile: {
                profile_name: 'your-airs-profile-name-here'
            },
            metadata: {
                app_name: 'my-app',
                app_user: 'user123',
                ai_model: 'gpt-4'
            },
            contents: [
                {
                    prompt: 'What is the capital of France?',
                    response: 'The capital of France is Paris.'
                }
            ]
        };

        console.log('Sending synchronous scan request...');
        const syncResult = await client.scanSyncRequest(syncRequest);
        console.log('Sync scan result:', syncResult);

        // 2. Asynchronous Scan Example with Multiple Items
        const asyncRequest: AsyncScanRequest = [
            {
                req_id: 1,
                scan_req: {
                    ai_profile: { profile_name: 'your-airs-profile-name-here' },
                    contents: [
                        {
                            prompt: 'Tell me about machine learning.',
                            response: 'Machine learning is a branch of artificial intelligence...'
                        }
                    ]
                }
            },
            {
                req_id: 2,
                scan_req: {
                    ai_profile: { profile_name: 'your-airs-profile-name-here' },
                    contents: [
                        {
                            prompt: 'What are neural networks?',
                            response: 'Neural networks are computing systems inspired by biological brains...'
                        }
                    ]
                }
            }
        ];

        console.log('Sending asynchronous scan request...');
        const asyncResult = await client.scanAsyncRequest(asyncRequest);
        console.log('Async scan initial result:', asyncResult);

        // 3. Check Results by Scan ID
        if (asyncResult.scan_id) {
            console.log('Fetching scan results...');
            const scanResults = await client.getScanResultsByScanIds([asyncResult.scan_id]);
            console.log('Scan results:', scanResults);
        }

        // 4. Get Threat Report
        if (asyncResult.report_id) {
            console.log('Fetching threat report...');
            const threatReports = await client.getThreatScanReports([asyncResult.report_id]);
            console.log('Threat reports:', threatReports);
        }

    } catch (error) {
        if (error instanceof PanAirsApiError) {
            console.error('AIRS API Error:', {
                statusCode: error.statusCode,
                message: error.message,
                details: error.details
            });
        } else {
            console.error('Unexpected error:', error);
        }
    }
}

// Run the example
main().catch(console.error);