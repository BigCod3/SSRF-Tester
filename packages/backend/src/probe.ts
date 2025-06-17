// packages/backend/src/probe.ts

import { SDK } from '@caido/sdk-backend';
import { Request, fetch, Headers } from 'caido:http';
import { extractUrlsFromRequestBody, generateBodySignature, getDeduplicationKey } from './utils';

export class ProbeModule {
    private _isEnabled: boolean;
    private sdk: SDK;
    private callbackUrl: string;

    constructor(sdk: SDK) {
        this._isEnabled = false;
        this.sdk = sdk;
        this.callbackUrl = 'https://request-spy.iownthisdomainname.net'; // Default callback URL
    }

    public get isEnabled(): boolean {
        return this._isEnabled;
    }

    public set isEnabled(value: boolean) {
        this._isEnabled = value;
        this.sdk.console.log(`Probe module ${value ? 'enabled' : 'disabled'}`);
    }

    public setCallbackUrl(url: string) {
        this.callbackUrl = url;
        this.sdk.console.log(`Callback URL set to: ${url}`);
    }

    private async createProbeRequestBody(request: Request): Promise<string | null> {
        try {
            const body = await request.text();
            const contentType = request.headers.get('content-type') || '';
            
            // Extract URLs from the request body
            const urls = extractUrlsFromRequestBody(body, contentType);
            if (urls.length === 0) {
                this.sdk.console.log('No URLs found in request body');
                return null;
            }

            // Replace each URL with the callback URL
            let probeBody = body;
            urls.forEach(url => {
                probeBody = probeBody.replace(url, this.callbackUrl);
            });

            return probeBody;
        } catch (error) {
            this.sdk.console.error(`Error creating probe request body: ${error}`);
            return null;
        }
    }

    private async createProbeRequest(request: Request): Promise<Request | null> {
        try {
            // Get the original URL components
            const originalUrl = new URL(request.url);
            const originalHost = originalUrl.host;
            const originalPath = originalUrl.pathname;
            
            // Create timestamp in a URL-safe format
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            
            // Construct the callback path
            const callbackPath = `/${originalHost}${originalPath}/${timestamp}`;
            
            // Create the full callback URL
            const callbackUrl = new URL(callbackPath, this.callbackUrl);
            
            this.sdk.console.log('Probe: Created callback URL:', callbackUrl.toString());

            // Create a new request with the callback URL
            const probeRequest = new Request(callbackUrl, {
                method: request.method,
                headers: new Headers(request.headers),
                body: request.body
            });

            return probeRequest;
        } catch (error) {
            this.sdk.console.error('Error creating probe request:', error);
            return null;
        }
    }

    public async sendProbe(request: Request): Promise<{
        status: number;
        headers: Record<string, string>;
        body: string;
        probeRequest: {
            url: string;
            method: string;
            headers: Record<string, string>;
            body: string;
        };
        probeStatus: 'probed' | 'error';
    } | null> {
        if (!this._isEnabled) {
            this.sdk.console.log('Probe module is disabled, skipping probe');
            return null;
        }

        try {
            this.sdk.console.log('Probe: Starting probe request...');
            
            // Extract URLs from the original request body
            const originalBody = await request.text();
            const urlsInBody = extractUrlsFromRequestBody(originalBody);

            if (urlsInBody.length === 0) {
                this.sdk.console.log('Probe: No URLs found in request body, skipping probe');
                return null;
            }

            let probeBody = originalBody;
            const targetUrlInBody = new URL(urlsInBody[0]);
            const originalHost = request.host;
            const originalPath = targetUrlInBody.pathname;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            
            // Construct the unique path for the callback
            const uniquePath = `/${originalHost}${originalPath}/${timestamp}`;
            
            // Create the full callback URL using the base callbackUrl
            const newProbeUrl = new URL(uniquePath, this.callbackUrl);

            this.sdk.console.log('Probe: Replacing body URL with:', newProbeUrl.toString());

            // Replace the original URL in the body with the new probe URL
            probeBody = originalBody.replace(urlsInBody[0], newProbeUrl.toString());

            // Create probe request using the original request's URL but with the modified body
            const probeRequest = new Request(request.url.toString(), {
                method: request.method,
                headers: new Headers(request.headers),
                body: probeBody
            });

            // Update content length if present
            const contentLengthHeader = probeRequest.headers.get('content-length');
            if (contentLengthHeader) {
                probeRequest.headers.set('content-length', Buffer.byteLength(probeBody).toString());
            }

            // Store the probe request details
            const probeRequestDetails = {
                url: probeRequest.url.toString(),
                method: probeRequest.method,
                headers: Object.fromEntries(probeRequest.headers.entries()),
                body: probeBody
            };

            this.sdk.console.log('Probe: Sending probe request:', probeRequestDetails);

            const response = await fetch(probeRequest);
            
            this.sdk.console.log('Probe: Received probe response:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
            });

            const responseBody = await response.text();

            this.sdk.console.log('Probe: Successfully completed probe request');
            return {
                status: response.status,
                headers: Object.fromEntries(response.headers.entries()),
                body: responseBody,
                probeRequest: probeRequestDetails,
                probeStatus: 'probed'
            };

        } catch (error) {
            this.sdk.console.error('Error sending probe:', error);
            return {
                status: 0,
                headers: {},
                body: '',
                probeRequest: {
                    url: request.url.toString(),
                    method: request.method,
                    headers: Object.fromEntries(request.headers.entries()),
                    body: await request.text()
                },
                probeStatus: 'error'
            };
        }
    }

    public getStats(): { probesSent: number } {
        // Implementation of getStats method
        // This method should return an object containing the number of probes sent
        // You can implement this method based on your specific requirements
        return { probesSent: 0 }; // Placeholder return, actual implementation needed
    }
}