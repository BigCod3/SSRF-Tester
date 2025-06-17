import type { DefineAPI, DefineEvents } from '@caido/sdk-backend';
import { DiscoveryModule } from './discovery';
import { ProbeModule } from './probe';
import { appendLogMessage } from 'packages/frontend/src/ui';

let discoveryModule: DiscoveryModule | null = null;
let probeModule: ProbeModule | null = null;
let debugLoggingEnabled = false;

export function initializeModules(discovery: DiscoveryModule, probe: ProbeModule) {
    discoveryModule = discovery;
    probeModule = probe;
}

// Helper function to log messages
function logMessage(message: string, isError: boolean = false) {
    if (debugLoggingEnabled) {
        appendLogMessage(`[SSRF Scanner] ${message}`);
    }
}

const api = {
    'ssrf-scanner.enableDiscovery': async (): Promise<string> => {
        if (!discoveryModule) return 'Discovery module not initialized';
        try {
            discoveryModule.isEnabled = true;
            logMessage('Discovery module enabled');
            return 'Discovery module enabled';
        } catch (error) {
            const message = `Failed to enable discovery module: ${error}`;
            logMessage(message, true);
            return message;
        }
    },

    'ssrf-scanner.disableDiscovery': async (): Promise<string> => {
        if (!discoveryModule) return 'Discovery module not initialized';
        try {
            discoveryModule.isEnabled = false;
            logMessage('Discovery module disabled');
            return 'Discovery module disabled';
        } catch (error) {
            const message = `Failed to disable discovery module: ${error}`;
            logMessage(message, true);
            return message;
        }
    },

    'ssrf-scanner.enableProbe': async (): Promise<string> => {
        if (!probeModule) return 'Probe module not initialized';
        try {
            probeModule.isEnabled = true;
            logMessage('Probe module enabled');
            return 'Probe module enabled';
        } catch (error) {
            const message = `Failed to enable probe module: ${error}`;
            logMessage(message, true);
            return message;
        }
    },

    'ssrf-scanner.disableProbe': async (): Promise<string> => {
        if (!probeModule) return 'Probe module not initialized';
        try {
            probeModule.isEnabled = false;
            logMessage('Probe module disabled');
            return 'Probe module disabled';
        } catch (error) {
            const message = `Failed to disable probe module: ${error}`;
            logMessage(message, true);
            return message;
        }
    },

    'ssrf-scanner.enableDebugLogging': async (): Promise<string> => {
        debugLoggingEnabled = true;
        logMessage('Debug logging enabled');
        return 'Debug logging enabled';
    },

    'ssrf-scanner.disableDebugLogging': async (): Promise<string> => {
        debugLoggingEnabled = false;
        logMessage('Debug logging disabled');
        return 'Debug logging disabled';
    },

    'ssrf-scanner.getSettings': async (): Promise<string> => {
        try {
            const settings = {
                discoveryEnabled: discoveryModule?.isEnabled || false,
                probeEnabled: probeModule?.isEnabled || false,
                debugLoggingEnabled
            };
            return JSON.stringify(settings);
        } catch (error) {
            const message = `Failed to get settings: ${error}`;
            logMessage(message, true);
            return JSON.stringify({ error: message });
        }
    },

    'ssrf-scanner.getAllFindings': async (): Promise<string> => {
        if (!discoveryModule) return JSON.stringify({ error: 'Discovery module not initialized' });
        try {
            const findings = discoveryModule.getAllFindings();
            logMessage(`Retrieved ${findings.length} findings`);
            return JSON.stringify(findings);
        } catch (error) {
            const message = `Failed to get findings: ${error}`;
            logMessage(message, true);
            return JSON.stringify({ error: message });
        }
    },

    'ssrf-scanner.getFindingById': async (id: string): Promise<string> => {
        if (!discoveryModule) return JSON.stringify({ error: 'Discovery module not initialized' });
        try {
            const finding = discoveryModule.getFindingById(id);
            if (!finding) {
                return JSON.stringify({ error: 'Finding not found' });
            }
            logMessage(`Retrieved finding ${id}`);
            return JSON.stringify(finding);
        } catch (error) {
            const message = `Failed to get finding ${id}: ${error}`;
            logMessage(message, true);
            return JSON.stringify({ error: message });
        }
    },

    'ssrf-scanner.processRequest': async (request: any): Promise<string> => {
        // This definition is for type checking. The actual logic is in index.ts.
        // It expects a JSON stringified result of { success: boolean, error?: string }.
        throw new Error('This method should be implemented in index.ts');
    }
};

const events = {
    'ssrf-scanner.log': (message: string, isError: boolean): void => {
        if (debugLoggingEnabled) {
            console.log(`[SSRF Scanner] ${message}`);
        }
    }
};

export type API = DefineAPI<typeof api>;
export type Events = DefineEvents<typeof events>;