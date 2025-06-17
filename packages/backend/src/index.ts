import { SDK, DefineAPI } from '@caido/sdk-backend';
import { DiscoveryModule } from './discovery';
import { ProbeModule } from './probe';
import { initializeModules } from './api';
import { Request as FetchRequest, fetch, Request } from 'caido:http';

// Define the API type
export type API = DefineAPI<{
    'ssrf-scanner.processRequest': (
        requestData: {
            url: string;
            host: string;
            path: string;
            method: string;
            headers: Record<string, string>;
            body: string;
        }
    ) => Promise<string>;
}>;



export function init(sdk: SDK<API>) {
    // Initialize modules
    const discoveryModule = new DiscoveryModule(sdk);
    const probeModule = new ProbeModule(sdk);
    
    // Connect modules
    initializeModules(discoveryModule, probeModule);
    // Register API method for processing a request
    sdk.api.register('ssrf-scanner.processRequest', async (sdk: SDK,requestData): Promise<string> => {
        sdk.console.log('Backend: Received request data:', requestData);
        
        try {
            // Validate requestData properties
            if (!requestData || typeof requestData !== 'object') {
                return JSON.stringify({ success: false, error: 'Invalid request data: not an object.' });
            }
            if (typeof requestData.url !== 'string' || requestData.url.trim() === '') {
                return JSON.stringify({ success: false, error: `Invalid URL: Expected a non-empty string, got ${typeof requestData.url}.` });
            }
            if (typeof requestData.method !== 'string' || requestData.method.trim() === '') {
                return JSON.stringify({ success: false, error: `Invalid Method: Expected a non-empty string, got ${typeof requestData.method}.` });
            }
            if (typeof requestData.headers !== 'object' || requestData.headers === null) {
                return JSON.stringify({ success: false, error: `Invalid Headers: Expected an object, got ${typeof requestData.headers}.` });
            }
            if (typeof requestData.body !== 'string') {
                return JSON.stringify({ success: false, error: `Invalid Body: Expected a string, got ${typeof requestData.body}.` });
            }

            // Ensure URL is properly formatted
            let urlString = requestData.url;
            if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
                urlString = 'http://' + urlString;
            }
            
            // Create URL object with proper error handling
            let url: URL;
            try {
                url = new URL(urlString);
                sdk.console.log('Backend: Created URL object:', url.toString());
            } catch (urlError) {
                sdk.console.error('Backend: Invalid URL:', urlString);
                return JSON.stringify({ 
                    success: false, 
                    error: `Invalid URL: ${urlString}. Please ensure the URL is properly formatted.`
                });
            }

            // Create FetchRequest with the validated URL
            const request = new FetchRequest(url, {
                method: requestData.method,
                headers: requestData.headers,
                body: requestData.body || '' // Ensure body is never undefined
            });

            // Add host and path to the request object for discovery module
            (request as any).host = url.host;
            (request as any).path = url.pathname;

            sdk.console.log('Backend: Created FetchRequest:', {
                url: request.url.toString(),
                method: request.method,
                host: url.host,
                path: url.pathname,
                headers: Object.fromEntries(request.headers.entries())
            });

            let response = await fetch(request);

            // Process request through discovery module
            if (discoveryModule.isEnabled) {
                sdk.console.log('Backend: Discovery module enabled, processing request...');
                const finding = await discoveryModule.processRequest(request);
                sdk.console.log('Backend: Discovery module result:', finding ? 'Found new endpoint' : 'No new endpoint');
                
                if (finding) {
                    response = {
                        success: true,
                        message: "New endpoint discovered",
                        finding: finding
                    };
                }
            } else {
                sdk.console.log('Backend: Discovery module disabled');
            }

            // If probe is enabled, send probe request
            if (probeModule.isEnabled) {
                sdk.console.log('Backend: Probe module enabled, sending probe...');
                const probeResult = await probeModule.sendProbe(request);
                if (probeResult) {
                    sdk.console.log('Backend: Probe result:', JSON.stringify(probeResult, null, 2));
                    
                    // Update the finding in our plugin's system
                    const finding = discoveryModule.getFindingByRequest(request);
                    if (finding) {
                        finding.probeStatus = probeResult.probeStatus;
                        finding.probeTimestamp = new Date().toISOString();
                        finding.probeRequest = probeResult.probeRequest;
                        finding.probeResponse = {
                            status: probeResult.status,
                            headers: probeResult.headers,
                            body: probeResult.body
                        };
                        
                        // Notify the frontend of the update
                        sdk.api.call('ssrf-scanner.updateFinding', finding);
                        sdk.console.log('Backend: Updated finding with probe details, status:', probeResult.probeStatus);
                    }
                } else {
                    sdk.console.log('Backend: No probe response received');
                }
            } else {
                sdk.console.log('Backend: Probe module disabled');
            }

            const responseString = JSON.stringify(response);
            sdk.console.log('Backend: Sending response:', responseString);
            return responseString;

        } catch (error) {
            sdk.console.error('Backend: Error processing request:', error);
            const errorResponse = JSON.stringify({ 
                success: false, 
                error: error?.toString() || 'Unknown error'
            });
            sdk.console.log('Backend: Sending error response:', errorResponse);
            return errorResponse;
        }
    });

    // Register API methods (was commands and queries)
    sdk.api.register('ssrf-scanner.enableDiscovery', async () => {
        try {
            discoveryModule.isEnabled = true;
            sdk.console.log('Discovery module enabled');
            return 'Discovery module enabled';
        } catch (error) {
            sdk.console.error(`Failed to enable discovery module: ${error}`);
            return `Failed to enable discovery module: ${error}`;
        }
    });

    sdk.api.register('ssrf-scanner.disableDiscovery', async () => {
        try {
            discoveryModule.isEnabled = false;
            sdk.console.log('Discovery module disabled');
            return 'Discovery module disabled';
        } catch (error) {
            sdk.console.error(`Failed to disable discovery module: ${error}`);
            return `Failed to disable discovery module: ${error}`;
        }
    });

    sdk.api.register('ssrf-scanner.enableProbe', async () => {
        try {
            probeModule.isEnabled = true;
            sdk.console.log('Probe module enabled');
            return 'Probe module enabled';
        } catch (error) {
            sdk.console.error(`Failed to enable probe module: ${error}`);
            return `Failed to enable probe module: ${error}`;
        }
    });

    sdk.api.register('ssrf-scanner.disableProbe', async () => {
        try {
            probeModule.isEnabled = false;
            sdk.console.log('Probe module disabled');
            return 'Probe module disabled';
        } catch (error) {
            sdk.console.error(`Failed to disable probe module: ${error}`);
            return `Failed to disable probe module: ${error}`;
        }
    });

    sdk.api.register('ssrf-scanner.getSettings', async () => {
        try {
            const settings = {
                discoveryEnabled: discoveryModule.isEnabled,
                probeEnabled: probeModule.isEnabled,
                debugLoggingEnabled: false // TODO: Add debug logging setting
            };
            return JSON.stringify(settings);
        } catch (error) {
            sdk.console.error(`Failed to get settings: ${error}`);
            return JSON.stringify({ error: `Failed to get settings: ${error}` });
        }
    });

    sdk.api.register('ssrf-scanner.getAllFindings', async () => {
        try {
            const findings = discoveryModule.getAllFindings();
            sdk.console.log(`Retrieved ${findings.length} findings`);
            return JSON.stringify(findings);
        } catch (error) {
            sdk.console.error(`Failed to get findings: ${error}`);
            return JSON.stringify({ error: `Failed to get findings: ${error}` });
        }
    });

    sdk.api.register('ssrf-scanner.getFindingById', async (id: string) => {
        try {
            const finding = discoveryModule.getFindingById(id);
            if (!finding) {
                return JSON.stringify({ error: 'Finding not found' });
            }
            sdk.console.log(`Retrieved finding ${id}`);
            return JSON.stringify(finding);
        } catch (error) {
            sdk.console.error(`Failed to get finding ${id}: ${error}`);
            return JSON.stringify({ error: `Failed to get finding ${id}: ${error}` });
        }
    });

    // Register callback for intercepted requests for passive analysis
    sdk.events.onInterceptRequest(async (sdk, request) => {
        try {
            sdk.console.log('Backend: Starting request interception flow...');
            
            // Only process requests that are in scope
            if (typeof sdk.requests.inScope === 'function') {
                sdk.console.log(`Backend: Attempting to check scope for request ${request.getId()}`);
                const inScope = await sdk.requests.inScope(request);
                if (!inScope) {
                    sdk.console.log(`Backend: Request ${request.getId()} not in scope, skipping.`);
                    return;
                }
                sdk.console.log(`Backend: Request ${request.getId()} is in scope, proceeding...`);
            } else {
                sdk.console.warn(`Backend: sdk.requests.inScope is not a function. Bypassing scope check for request ${request.getId()}.`);
            }

            sdk.console.log(`Backend: Intercepted in-scope request: ${request.getMethod()} ${request.getHost()}${request.getPath()}`);
            
            // Reconstruct full URL from SDK Request object
            const url = (request.getTls() ? 'https' : 'http') + '://' + request.getHost() + request.getPath() + (request.getQuery() ? '?' + request.getQuery() : '');
            sdk.console.log(`Backend: Reconstructed URL: ${url}`);

            // Convert headers from Record<string, Array<string>> to Record<string, string>
            const headersArray = request.getHeaders();
            const headers: Record<string, string> = {};
            for (const key in headersArray) {
                if (Object.prototype.hasOwnProperty.call(headersArray, key) && Array.isArray(headersArray[key]) && headersArray[key].length > 0) {
                    headers[key] = headersArray[key][0];
                }
            }
            sdk.console.log('Backend: Processed headers:', JSON.stringify(headers, null, 2));

            // Get body as string. SDK Request body is a Body object, not a string directly.
            let body = '';
            const requestBody = request.getBody();
            if (requestBody) {
                body = requestBody.toText();
                sdk.console.log('Backend: Request body extracted:', body.substring(0, 200) + (body.length > 200 ? '...' : ''));
            } else {
                sdk.console.log('Backend: No request body found');
            }

            sdk.console.log('Backend: Calling processRequest with extracted data...');
            // Process the request directly instead of trying to call it as an API
            try {
                // Create a proper Request object for the original request
                const originalRequestObj = new Request(url, {
                    method: request.getMethod(),
                    headers: headers,
                    body: body
                });

                // Add host and path properties that our discovery module expects
                (originalRequestObj as any).host = request.getHost();
                (originalRequestObj as any).path = request.getPath();
                
                // Process through discovery module if enabled
                if (discoveryModule.isEnabled) {
                    sdk.console.log('Backend: Processing request through discovery module...');
                    try {
                        const finding = await discoveryModule.processRequest(originalRequestObj);
                        if (finding) {
                            sdk.console.log('Backend: New finding discovered:', finding);
                        } else {
                            sdk.console.log('Backend: No new finding discovered');
                        }
                    } catch (error) {
                        sdk.console.error('Error processing request:', error);
                    }
                }

                // Process through probe module if enabled
                if (probeModule.isEnabled) {
                    sdk.console.log('Backend: Processing request through probe module...');
                    try {
                        // Create a proper Request object for probe
                        const probeRequest = new Request(url, {
                            method: request.getMethod(),
                            headers: headers,
                            body: body
                        });
                        
                        // Add host and path properties
                        (probeRequest as any).host = request.getHost();
                        (probeRequest as any).path = request.getPath();
                        
                        const probeResult = await probeModule.sendProbe(probeRequest);
                        
                        if (probeResult) {
                            sdk.console.log('Backend: Probe result:', JSON.stringify(probeResult, null, 2));
                            
                            // Update the finding in our plugin's system
                            const finding = discoveryModule.getFindingByRequest(request);
                            if (finding) {
                                finding.probeStatus = probeResult.probeStatus;
                                finding.probeTimestamp = new Date().toISOString();
                                finding.probeRequest = probeResult.probeRequest;
                                finding.probeResponse = {
                                    status: probeResult.status,
                                    headers: probeResult.headers,
                                    body: probeResult.body
                                };
                                
                                // Notify the frontend of the update
                                sdk.api.call('ssrf-scanner.updateFinding', finding);
                                sdk.console.log('Backend: Updated finding with probe details, status:', probeResult.probeStatus);
                            }
                        } else {
                            sdk.console.log('Backend: No probe response received');
                        }
                    } catch (error) {
                        sdk.console.error('Backend: Error processing probe:', error);
                    }
                } else {
                    sdk.console.log('Backend: Probe module disabled');
                }
            } catch (processError) {
                sdk.console.error('Backend: Error processing request:', processError);
            }

        } catch (error: any) {
            sdk.console.error('Backend: Error during onInterceptRequest callback:', error);
            sdk.console.error(`Backend: Error message: ${error.message}`);
            sdk.console.error(`Backend: Stack trace: ${error.stack}`);
        }
    });

    // Register callback for intercepted responses to capture original response
    sdk.events.onInterceptResponse(async (sdk, request, response) => {
        try {
            sdk.console.log(`Backend: Intercepted response for request: ${request.getMethod()} ${request.getHost()}${request.getPath()}`);

            const finding = discoveryModule.getFindingByRequest(request);

            if (finding) {
                sdk.console.log('Backend: Found matching finding for response.');
                const responseBody = await response.text();
                const responseHeaders = Object.fromEntries(response.headers.entries());
                
                finding.originalResponse = {
                    status: response.status,
                    headers: responseHeaders,
                    body: responseBody
                };

                sdk.console.log('Backend: Updated finding with original response details:', {
                    status: finding.originalResponse.status,
                    headers: finding.originalResponse.headers,
                    body: finding.originalResponse.body.substring(0, 100) + (finding.originalResponse.body.length > 100 ? '...' : '')
                });

                // Notify frontend of updated finding
                sdk.api.call('ssrf-scanner.updateFinding', finding);
            } else {
                sdk.console.log('Backend: No matching finding found for intercepted response.');
            }
        } catch (error: any) {
            sdk.console.error('Backend: Error during onInterceptResponse callback:', error);
            sdk.console.error(`Backend: Error message: ${error.message}`);
            sdk.console.error(`Backend: Stack trace: ${error.stack}`);
        }
    });

    // Register API methods
    sdk.api.register('ssrf-scanner.updateFinding', async (sdk: SDK, finding: DiscoveredEndpoint) => {
        try {
            // Update the finding in our store
            discoveryModule.updateFinding(finding);
            return { success: true };
        } catch (error) {
            sdk.console.error('Error updating finding:', error);
            return { success: false, error: error?.toString() };
        }
    });

    // Log initialization
    sdk.console.log('SSRF Scanner plugin initialized');
}