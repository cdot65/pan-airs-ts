# AI Runtime Security TypeScript Library

A best-practices TypeScript library providing an easier way to interact with Palo Alto Networks **AI Runtime Security (AIRS)** product. This library is designed to be integrated into modern TypeScript applications (including NestJS backends, RAG applications, and more) to scan and protect AI interactions at runtime.

---

## Table of Contents
1. [Overview](#overview)
2. [AI Runtime Security in a Nutshell](#ai-runtime-security-in-a-nutshell)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Contributing](#contributing)

---

## Overview

**Project Goals:**
- Offer a simple, TypeScript-first interface to **AI Runtime Security** APIs.  
- Enable developers to quickly integrate runtime scanning and threat prevention for LLM-based apps.  
- Provide a foundation for building secure enterprise AI services in modern JavaScript/TypeScript ecosystems.

This project aims to help developers embed the Palo Alto Networks AI Runtime Security intercept mechanism in their applications with minimal effort, ensuring that both inbound and outbound interactions with LLMs or AI workflows remain safe, monitored, and compliant.

---

## AI Runtime Security in a Nutshell

AI Runtime Security (AIRS) is designed to protect enterprise AI applications from new, AI-specific threats such as prompt injection attacks, malicious URLs, unmoderated data leakage, and model misuse. It seamlessly inspects prompts and responses, enforcing policies to mitigate malicious activity or data exfiltration without disrupting your AI’s normal workflow.

By providing advanced detection and filtering mechanisms, AIRS helps developers guard against model vulnerabilities, data leaks, and other security risks unique to the AI landscape. This ensures that sensitive data is properly handled, potential threats are neutralized, and AI-enabled experiences remain stable and protected.

---

## Installation

```bash
npm install pan-airs-ts
```

Or using Yarn:

```bash
yarn add pan-airs-ts
```

---

## Usage

Below is an **example** TypeScript file demonstrating how to import and use the **`PanAirsTsClient`** in a real application. It shows both **synchronous** and **asynchronous** scanning, as well as retrieving scan results and threat reports.

```ts
// example-usage.ts
import {
  PanAirsTsClient,
  PanAirsApiError,
  ScanRequest,
  AsyncScanRequest
} from 'pan-airs-ts';

async function main() {
  // 1) Create the client with your API token (and optionally, a custom base URL)
  const client = new PanAirsTsClient({
    apiToken: 'YOUR_AIRS_API_TOKEN',
    // baseURL: 'https://service.api.aisecurity.paloaltonetworks.com' // defaults if omitted
  });

  try {
    // 2) Perform a Synchronous Scan
    const syncRequest: ScanRequest = {
      ai_profile: { profile_name: 'my-airs-profile' },
      metadata: {
        app_name: 'MyApp',
        app_user: 'User123',
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
    console.log('Synchronous scan result:', syncResult);

    // 3) Perform an Asynchronous Scan
    const asyncRequest: AsyncScanRequest = [
      {
        req_id: 1,
        scan_req: {
          ai_profile: { profile_name: 'my-airs-profile' },
          contents: [
            {
              prompt: 'Tell me about machine learning.',
              response: 'Machine learning is...'
            }
          ]
        }
      },
      {
        req_id: 2,
        scan_req: {
          ai_profile: { profile_name: 'my-airs-profile' },
          contents: [
            {
              prompt: 'What are neural networks?',
              response: 'Neural networks are...'
            }
          ]
        }
      }
    ];

    console.log('Sending asynchronous scan request...');
    const asyncResult = await client.scanAsyncRequest(asyncRequest);
    console.log('Async scan initial result:', asyncResult);

    // 4) Check results by Scan ID, if provided
    if (asyncResult.scan_id) {
      console.log('Fetching scan results...');
      const scanResults = await client.getScanResultsByScanIds([asyncResult.scan_id]);
      console.log('Scan results:', scanResults);
    }

    // 5) Check threat reports, if provided
    if (asyncResult.report_id) {
      console.log('Fetching threat report...');
      const threatReports = await client.getThreatScanReports([asyncResult.report_id]);
      console.log('Threat reports:', threatReports);
    }

  } catch (error) {
    // 6) Catch and handle PanAirsApiError
    if (error instanceof PanAirsApiError) {
      console.error('AIRS API Error:', {
        statusCode: error.statusCode,
        message: error.message,
        details: error.details,
      });
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Execute if this file is run directly (e.g., via ts-node)
if (require.main === module) {
  main().catch(console.error);
}
```

To run this file in a TypeScript environment, you can do:

```bash
npx ts-node example-usage.ts
```

or compile and run with:

```bash
tsc example-usage.ts
node example-usage.js
```

---

### NestJS Example

Below is a quick snippet showing how you might integrate **`PanAirsTsClient`** into a NestJS application:

```ts
import { Controller, Post, Body } from '@nestjs/common';
import { PanAirsTsClient } from 'pan-airs-ts';

@Controller('ai')
export class AIController {
  private readonly airsClient: PanAirsTsClient;

  constructor() {
    this.airsClient = new PanAirsTsClient({
      apiToken: process.env.AIRS_API_TOKEN || 'MY_TOKEN'
    });
  }

  @Post('prompt')
  async handlePrompt(@Body() body: { prompt: string, response?: string }) {
    const requestBody = {
      ai_profile: { profile_name: 'my-airs-profile' },
      contents: [{ prompt: body.prompt, response: body.response }],
    };

    // Synchronous scan request
    const scanResult = await this.airsClient.scanSyncRequest(requestBody);
    return scanResult;
  }
}
```

---

## Contributing

We appreciate all contributions to the **pan-airs-ts** project! If you’d like to contribute:

1. **Fork** this repository and clone it locally.
2. **Install** dependencies: `npm install`
3. **Create** a new branch for your feature or fix.
4. **Commit** changes with clear messages, and **open** a Pull Request.
5. Our team will review your proposal, provide feedback, and merge it if it aligns with the project’s goals.

We strive to maintain a welcoming environment: please be respectful, follow existing coding standards, and ensure your PR passes all checks (lint, tests, etc.).

---

_This project is not an official product of Palo Alto Networks, but rather a community-driven TypeScript library to interface with Palo Alto Networks AI Runtime Security._
