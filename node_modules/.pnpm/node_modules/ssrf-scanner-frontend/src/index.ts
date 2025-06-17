import type { FrontendSDK } from './types';
import { createPluginView, appendLogMessage, renderSettings, renderFindings } from './ui.js';
import './style.css';

let caido: FrontendSDK;
let isInitialized = false;

async function refreshFindingsOnlyAndRender() {
    if (!caido || !isInitialized) return;
    try {
        appendLogMessage('Refreshing findings data...', 'info');
        const findingsString = await caido.backend['ssrf-scanner.getAllFindings']();
        const findings = JSON.parse(findingsString);
        renderFindings(findings);
        appendLogMessage('Findings data refreshed successfully', 'info');
    } catch (e: any) {
        appendLogMessage(`Error refreshing findings: ${e.message || JSON.stringify(e)}`, "error");
    }
}

async function refreshSettingsAndRender() {
    if (!caido || !isInitialized) return;
    try {
        appendLogMessage('Refreshing settings data...', 'info');
        const settingsString = await caido.backend['ssrf-scanner.getSettings']();
        const settings = JSON.parse(settingsString);
        renderSettings(settings, caido);
        appendLogMessage('Settings data refreshed successfully', 'info');
    } catch (e: any) {
        appendLogMessage(`Error refreshing settings: ${e.message || JSON.stringify(e)}`, "error");
    }
}

export function init(caidoInstance: FrontendSDK) {
    if (isInitialized) {
        appendLogMessage('Plugin already initialized', 'info');
        return;
    }
    
    try {
        caido = caidoInstance;
        isInitialized = true;

        const PLUGIN_PATH = "/ssrf-scanner";
        const pluginViewContainer = createPluginView(refreshFindingsOnlyAndRender, caido);

        // Register sidebar item
        caido.sidebar.registerItem("SSRF Scanner", PLUGIN_PATH, {
            icon: "fas fa-user-secret",
        });

        // Add navigation page
        caido.navigation.addPage(PLUGIN_PATH, {
            body: pluginViewContainer,
        });
        
        // Set up event listener for backend logs
        caido.backend.onEvent('ssrf-scanner.log', (message, isError) => {
            appendLogMessage(message, isError ? 'error' : 'info');
        });

        // Initial data load
        refreshSettingsAndRender(); // Load settings initially
        refreshFindingsOnlyAndRender(); // Load findings initially
        
        appendLogMessage('Plugin initialized successfully', 'info');
    } catch (e: any) {
        appendLogMessage(`Error initializing plugin: ${e.message || JSON.stringify(e)}`, "error");
        isInitialized = false;
    }
}