import { SDK } from '@caido/sdk-backend';
import { Request } from 'caido:http';
import { generateBodySignature, getDeduplicationKey, extractUrlsFromRequestBody } from './utils';

export interface DiscoveredEndpoint {
    id: string;
    timestamp: string;
    host: string;
    path: string;
    method: string;
    originalRequest: {
        body: string;
        headers: Record<string, string | string[] | undefined>;
        contentType?: string;
    };
    originalResponse: {
        status: number;
        headers: Record<string, string>;
        body: string;
    };
    bodySignature: string;
    deduplicationKey: string;
    containedUrls: string[];
    probeStatus: 'not_probed' | 'probed' | 'error' | 'disabled' | 'pending';
    probeTimestamp?: string;
    probeError?: string;
    probeRequest?: {
        url: string;
        method: string;
        headers: Record<string, string>;
        body: string;
    };
    probeResponse?: {
        status: number;
        headers: Record<string, string>;
        body: string;
    };
}

export class DiscoveryModule {
    private discoveredEndpoints: Map<string, DiscoveredEndpoint>;
    private _isEnabled: boolean;
    private sdk: SDK;
    private processedRequestsCount: number;
    private findingsCount: number;

    constructor(sdk: SDK) {
        this.discoveredEndpoints = new Map();
        this._isEnabled = false;
        this.sdk = sdk;
        this.processedRequestsCount = 0;
        this.findingsCount = 0;
    }

    public get isEnabled(): boolean {
        return this._isEnabled;
    }

    public set isEnabled(value: boolean) {
        this._isEnabled = value;
        this.sdk.console.log(`Discovery module ${value ? 'enabled' : 'disabled'}`);
    }

    public async processRequest(request: Request): Promise<DiscoveredEndpoint | null> {
        if (!this._isEnabled) return null;

        try {
            const body = await request.text();
            const headers = Object.fromEntries(request.headers.entries());
            const contentType = headers['content-type'];
            
            // Generate body signature and deduplication key
            const bodySignature = generateBodySignature(body, contentType);
            const deduplicationKey = getDeduplicationKey(request.method, request.host, request.path, bodySignature);
            
            // Extract URLs from the request body
            const containedUrls = extractUrlsFromRequestBody(body);

            // If no URLs are found, do not create a finding
            if (containedUrls.length === 0) {
                this.sdk.console.log(`No URLs found in body for ${request.method} ${request.host}${request.path}, skipping finding creation.`);
                return null;
            }

            // Check if we already have this endpoint
            if (this.discoveredEndpoints.has(deduplicationKey)) {
                this.sdk.console.log(`Endpoint already discovered: ${request.method} ${request.host}${request.path}`);
                return null;
            }

            // Get probe module status
            let initialProbeStatus: 'pending' | 'disabled' = 'disabled';
            try {
                const settings = await this.sdk.api.call('ssrf-scanner.getSettings');
                const parsedSettings = JSON.parse(settings);
                initialProbeStatus = parsedSettings.probeEnabled ? 'pending' : 'disabled';
            } catch (error) {
                this.sdk.console.error('Error getting probe module status:', error);
            }

            // Create new endpoint
            const endpoint: DiscoveredEndpoint = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date().toISOString(),
                host: request.host,
                path: request.path,
                method: request.method,
                originalRequest: {
                    body,
                    headers,
                    contentType
                },
                originalResponse: {
                    status: 0,
                    headers: {},
                    body: ''
                },
                bodySignature,
                deduplicationKey,
                containedUrls,
                probeStatus: initialProbeStatus,
                probeTimestamp: initialProbeStatus === 'disabled' ? new Date().toISOString() : undefined
            };

            // Store the endpoint
            this.discoveredEndpoints.set(deduplicationKey, endpoint);
            this.sdk.console.log(`New endpoint discovered: ${request.method} ${request.host}${request.path} with probe status: ${initialProbeStatus}`);
            
            // Notify frontend of new finding
            this.sdk.api.call('ssrf-scanner.updateFinding', endpoint);
            
            return endpoint;
        } catch (error) {
            this.sdk.console.error('Error processing request:', error);
            return null;
        }
    }

    public updateProbeStatus(deduplicationKey: string, probeResponse: {
        status: number;
        headers: Record<string, string>;
        body: string;
    }): void {
        const endpoint = this.discoveredEndpoints.get(deduplicationKey);
        if (!endpoint) return;

        try {
            endpoint.probeStatus = 'probed';
            endpoint.probeTimestamp = new Date().toISOString();
            endpoint.probeResponse = probeResponse;

            this.sdk.console.log(`Updated probe status for ${endpoint.method} ${endpoint.host}${endpoint.path}`);
        } catch (error) {
            this.sdk.console.error(`Error updating probe status: ${error}`);
            endpoint.probeStatus = 'error';
            endpoint.probeError = `Failed to update probe status: ${error}`;
        }
    }

    public getAllFindings(): DiscoveredEndpoint[] {
        return Array.from(this.discoveredEndpoints.values());
    }

    public getFindingById(id: string): DiscoveredEndpoint | undefined {
        return Array.from(this.discoveredEndpoints.values()).find(endpoint => endpoint.id === id);
    }

    public getStats(): { processedRequests: number; findingsCount: number } {
        return {
            processedRequests: this.processedRequestsCount,
            findingsCount: this.findingsCount
        };
    }

    public getFindingByRequest(request: Request): DiscoveredEndpoint | undefined {
        const host = request.getHost();
        const path = request.getPath();
        const method = request.getMethod();
        const body = request.getBody();
        const bodySignature = generateBodySignature(body);
        const deduplicationKey = getDeduplicationKey(method, host, path, bodySignature);
        
        return this.discoveredEndpoints.get(deduplicationKey);
    }

    public updateFinding(finding: DiscoveredEndpoint): void {
        const existingFinding = this.discoveredEndpoints.get(finding.deduplicationKey);
        if (existingFinding) {
            // Update the existing finding with new probe details
            existingFinding.probeStatus = finding.probeStatus;
            existingFinding.probeTimestamp = finding.probeTimestamp;
            existingFinding.probeRequest = finding.probeRequest;
            existingFinding.probeResponse = finding.probeResponse;
            existingFinding.probeError = finding.probeError;
            
            this.sdk.console.log(`Updated finding for ${finding.method} ${finding.host}${finding.path} with probe status: ${finding.probeStatus}`);
            
            // Notify the frontend of the update
            this.sdk.api.call('ssrf-scanner.updateFinding', existingFinding);
        }
    }
}