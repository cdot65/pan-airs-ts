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

After installation, import it into your project:

```ts
import { AIRSClient } from 'pan-airs-ts';

// Initialize and configure the AIRS client as needed
const client = new AIRSClient({
  // Your configuration details...
});
```

---

## Usage

1. **Initialize the Client**: Configure credentials and relevant API endpoints for AI Runtime Security.
2. **Scan Prompts/Responses**: Call the library’s scanning methods before or after communicating with your AI models.
3. **Respond to Threats**: Based on verdicts, handle user experience gracefully (e.g., block malicious requests, sanitize inputs, or log incidents).

**Example (NestJS)**

```ts
import { Controller, Post, Body } from '@nestjs/common';
import { AIRSClient } from 'pan-airs-ts';

@Controller('ai')
export class AIController {
  private readonly airsClient: AIRSClient;

  constructor() {
    this.airsClient = new AIRSClient({
      apiKey: process.env.AIRS_API_KEY,
      // Other config options...
    });
  }

  @Post('prompt')
  async handlePrompt(@Body() promptData: { prompt: string }) {
    // 1. Scan prompt before sending it to your LLM
    const verdict = await this.airsClient.scanPrompt(promptData.prompt);

    // 2. If safe, proceed to your AI model
    if (verdict.isSafe) {
      // ...call your LLM or RAG pipeline
      return { success: true, output: 'LLM response here' };
    }
    
    // 3. Otherwise, handle as per your security policy
    return { success: false, message: 'Potentially malicious prompt detected.' };
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