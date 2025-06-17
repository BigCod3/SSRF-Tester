// packages/frontend/src/ui.ts

import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
hljs.registerLanguage('json', json);

let settingsViewEl: HTMLElement | null = null;
let findingsViewEl: HTMLElement | null = null;
let loggingViewEl: HTMLElement | null = null;
let debugLogTextArea: HTMLTextAreaElement | null = null;
let mainPluginView: HTMLElement | null = null;
let globalRefreshFunction: (() => Promise<void>) | null = null;
let matrixAnimationId: number | undefined;
let autoRefreshInterval: number | null = null;
let autoRefreshEnabled: boolean = false;

const MATRIX_CHARS = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

async function handleSettingChange(input: HTMLInputElement, setting: string, caido: any) {
    const enabled = input.checked;
    const apiMethod = `ssrf-scanner.${enabled ? 'enable' : 'disable'}${setting.charAt(0).toUpperCase() + setting.slice(1)}`;
    try {
        await caido.backend[apiMethod]();
        appendLogMessage(`${setting} module ${enabled ? 'enabled' : 'disabled'}`, 'info');
    } catch (error) {
        appendLogMessage(`Failed to ${enabled ? 'enable' : 'disable'} ${setting} module: ${error}`, 'error');
        input.checked = !enabled; // Revert the checkbox
    }
}

export function appendLogMessage(message: string, level: 'info' | 'error' = 'info') {
    if (!debugLogTextArea) return;
    const timestamp = new Date().toLocaleTimeString();
    debugLogTextArea.value += `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    debugLogTextArea.scrollTop = debugLogTextArea.scrollHeight;
}

// Helper function to highlight URLs in text
function highlightUrls(text: string): string {
    // URL regex pattern
    const urlPattern = /(https?:\/\/[^\s"']+)/g;
    
    // Replace URLs with highlighted spans
    return text.replace(urlPattern, (url) => {
        return `<span class="highlighted-url">${url}</span>`;
    });
}

// Helper function for syntax highlighting JSON
function highlightJson(jsonString: string, shouldHighlightUrls: boolean = false): string {
    if (!jsonString) return '';
    try {
        // Use highlight.js to highlight the JSON string
        const highlightedCode = hljs.highlight(jsonString, {language: 'json'}).value;
        // Add URL highlighting only if specified
        return shouldHighlightUrls ? highlightUrls(highlightedCode) : highlightedCode;
    } catch (e) {
        // If not valid JSON or highlighting fails, treat as plain text
        return highlightText(jsonString, shouldHighlightUrls);
    }
}

// Helper function to make plain text selectable (already default for pre, but for consistency)
function highlightText(text: string, shouldHighlightUrls: boolean = false): string {
    // Ensure any HTML sensitive characters in plain text are escaped.
    const escapedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    // Add URL highlighting only if specified
    return shouldHighlightUrls ? highlightUrls(escapedText) : escapedText;
}

export function renderSettings(settingsData: any, caido: any) {
    if (!settingsViewEl) return;
    
    // Clear existing content
    settingsViewEl.innerHTML = '';
    
    const header = document.createElement('h2');
    header.textContent = 'Settings';
    const description = document.createElement('p');
    description.textContent = 'Configure the SSRF Scanner plugin modules.';
    
    settingsViewEl.appendChild(header);
    settingsViewEl.appendChild(description);
    
    const form = document.createElement('form');
    form.className = 'settings-form';

    const createSettingRow = (id: string, labelText: string): [HTMLLabelElement, HTMLInputElement] => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'setting-row';
        
        const label = document.createElement('label');
        label.htmlFor = id;
        label.textContent = labelText;
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = id;
        input.className = 'checkbox-input';
        
        // Set initial state
        input.checked = settingsData[`${id.split('-')[0]}Enabled`] || false;
        
        rowDiv.appendChild(label);
        rowDiv.appendChild(input);
        form.appendChild(rowDiv);
        
        return [label, input];
    };

    // Create settings rows
    const [_dLabel, discoveryInput] = createSettingRow('discovery-toggle', 'Enable Discovery Module:');
    const [_pLabel, probeInput] = createSettingRow('probe-toggle', 'Enable Probe Module:');
    const [_dbgLabel, debugInput] = createSettingRow('debug-logging-checkbox', 'Enable Debug Logging (UI & Backend):');

    // Add event listeners
    discoveryInput.addEventListener('change', (e) => handleSettingChange(e.target as HTMLInputElement, 'discovery', caido));
    probeInput.addEventListener('change', (e) => handleSettingChange(e.target as HTMLInputElement, 'probe', caido));
    debugInput.addEventListener('change', (e) => handleSettingChange(e.target as HTMLInputElement, 'debugLogging', caido));

    settingsViewEl.appendChild(form);
    
    // Add a temporary button to process a sample request
    const processSampleRequestButton = document.createElement('button');
    processSampleRequestButton.textContent = 'Process Sample Request';
    processSampleRequestButton.className = 'refresh-button'; // Reusing style
    settingsViewEl.appendChild(processSampleRequestButton);

    processSampleRequestButton.addEventListener('click', async () => {
        appendLogMessage('Frontend: Starting sample request processing...', 'info');
        try {
            const sampleRequestData = {
                url: 'http://bsdgfds.iownthisdomainname.net/test',
                method: 'POST',
                headers: {
                    'User-Agent': 'Caido-SSRF-Tester',
                    'Accept': 'text/html',
                    'Content-Type': 'application/json'
                },
                body: '{"URL": "https://bb.iownthisdomainname.net/test12354"}'
            };
            
            // Log the request data before sending
            appendLogMessage('Frontend: Sending request data: ' + JSON.stringify(sampleRequestData, null, 2), 'info');
            
            // Ensure we're passing the entire object
            const result = await caido.backend['ssrf-scanner.processRequest'](sampleRequestData);
            appendLogMessage('Frontend: Received raw response: ' + result, 'info');
            
            if (typeof result !== 'string') {
                throw new Error(`Expected string response but got ${typeof result}`);
            }
            
            const response = JSON.parse(result);
            appendLogMessage('Frontend: Parsed response: ' + JSON.stringify(response, null, 2), 'info');
            
            if (response.success) {
                if (response.finding) {
                    appendLogMessage(`Frontend: New finding created with ID: ${response.finding.id} Host: ${response.finding.host} Path: ${response.finding.path}`, 'info');
                } else {
                    appendLogMessage(`Frontend: ${response.message || 'Request processed successfully'}`, 'info');
                }
                // Refresh findings after processing sample request
                if (globalRefreshFunction) {
                    appendLogMessage('Frontend: Refreshing findings view...', 'info');
                    await globalRefreshFunction();
                    appendLogMessage('Frontend: Findings view refreshed', 'info');
                } else {
                    appendLogMessage('Frontend: Warning - refresh function not available', 'error');
                }
            } else {
                appendLogMessage(`Frontend: Error: ${response.error || 'Unknown error'}`, 'error');
            }
        } catch (error: any) {
            appendLogMessage(`Frontend: Error processing sample request: ${error.message || JSON.stringify(error)}`, 'error');
            appendLogMessage('Frontend: Error stack: ' + (error.stack || 'No stack trace available'), 'error');
        }
    });
    
    // Log initial state
    appendLogMessage('Settings initialized with:', 'info');
    appendLogMessage(`- Discovery Module: ${settingsData.discoveryEnabled ? 'Enabled' : 'Disabled'}`, 'info');
    appendLogMessage(`- Probe Module: ${settingsData.probeEnabled ? 'Enabled' : 'Disabled'}`, 'info');
    appendLogMessage(`- Debug Logging: ${settingsData.debugLoggingEnabled ? 'Enabled' : 'Disabled'}`, 'info');
}

// The rest of this file (renderFindings, startMatrixRain, createPluginView) remains unchanged
// from the previous version and can be kept as is. I am omitting it here for brevity.

export function renderFindings(findingsData: any[]) {
    if (!findingsViewEl) return;
    
    // Clear existing content
    findingsViewEl.innerHTML = '';
    
    // Add header with refresh button and auto-refresh toggle
    const header = document.createElement('div');
    header.className = 'findings-header';
    header.innerHTML = `
        <h2>Findings</h2>
        <div class="refresh-controls">
            <div class="auto-refresh-toggle">
                <label for="auto-refresh">Auto-refresh:</label>
                <input type="checkbox" id="auto-refresh" class="toggle-switch" ${autoRefreshEnabled ? 'checked' : ''}>
            </div>
            <button class="refresh-button">Refresh Findings</button>
        </div>
    `;
    findingsViewEl.appendChild(header);
    
    // Add refresh button event listener
    header.querySelector('.refresh-button')?.addEventListener('click', () => {
        if (globalRefreshFunction) globalRefreshFunction();
    });

    // Add auto-refresh toggle event listener
    const autoRefreshToggle = header.querySelector('#auto-refresh') as HTMLInputElement;
    autoRefreshToggle?.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        autoRefreshEnabled = target.checked;
        
        if (autoRefreshEnabled) {
            // Start auto-refresh (every 5 seconds)
            autoRefreshInterval = window.setInterval(() => {
                if (globalRefreshFunction) {
                    globalRefreshFunction();
                }
            }, 5000);
            appendLogMessage('Auto-refresh enabled', 'info');
        } else {
            // Stop auto-refresh
            if (autoRefreshInterval) {
                clearInterval(autoRefreshInterval);
                autoRefreshInterval = null;
            }
            appendLogMessage('Auto-refresh disabled', 'info');
        }
    });

    if (findingsData.length === 0) {
        const noFindings = document.createElement('p');
        noFindings.textContent = 'No findings yet. Discovered endpoints will appear here.';
        findingsViewEl.appendChild(noFindings);
        return;
    }

    // Create findings table
    const table = document.createElement('table');
    table.className = 'findings-table';
    
    // Create table header
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    ['Date/Time', 'Host', 'Path', 'Method', 'Status', 'Actions'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });

    // Create table body
    const tbody = table.createTBody();
    findingsData
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .forEach((finding: any) => {
            const row = tbody.insertRow();
            row.className = 'finding-row';
            row.setAttribute('data-finding-id', finding.id);
            
            // Determine probe status icon and title
            let probeIcon = '-';
            let probeTitle = '';
            let probeStatusClass = finding.probeStatus || 'not_probed'; // Default to not_probed if undefined

            // Log the probe status received by the frontend
            appendLogMessage(`Frontend UI: Rendering finding ${finding.id} with probeStatus: ${probeStatusClass}`, 'info');

            switch (probeStatusClass) {
                case 'probed':
                    probeIcon = '✔';
                    probeTitle = `Probed @ ${new Date(finding.probeTimestamp || 0).toLocaleString()}`;
                    break;
                case 'error':
                    probeIcon = '✖';
                    probeTitle = `Error @ ${new Date(finding.probeTimestamp || 0).toLocaleString()}: ${finding.probeError}`;
                    break;
                case 'disabled':
                    probeIcon = '➖';
                    probeTitle = `Probing disabled when found. Timestamp: ${new Date(finding.probeTimestamp || finding.timestamp).toLocaleString()}`;
                    break;
                case 'pending':
                    probeIcon = '⏳';
                    probeTitle = 'Pending';
                    break;
                case 'not_probed':
                default:
                    probeIcon = '-';
                    probeTitle = 'Not Probed';
                    break;
            }

            // Add basic finding info
            row.innerHTML = `
                <td>${new Date(finding.timestamp).toLocaleString()}</td>
                <td>${finding.host}</td>
                <td>${finding.path}</td>
                <td>${finding.method}</td>
                <td>
                    <span class="status-badge ${probeStatusClass}" title="${probeTitle}">
                        ${probeIcon}
                    </span>
                </td>
                <td>
                    <button class="view-details-btn" data-finding-id="${finding.id}">
                        View Details
                    </button>
                </td>
            `;
        });

    findingsViewEl.appendChild(table);

    // Add event listeners for view details buttons
    findingsViewEl.querySelectorAll('.view-details-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const findingId = (e.target as HTMLElement).getAttribute('data-finding-id');
            const finding = findingsData.find(f => f.id === findingId);
            if (!finding) return;

            // Create modal for request/response details
            const modal = document.createElement('div');
            modal.className = 'details-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Request Details</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="tabs">
                            <button class="tab-button active" data-tab="original">Original Request</button>
                            <button class="tab-button" data-tab="probe">Probe Request</button>
                        </div>
                        <div class="tab-content active" id="original-tab">
                            <div class="request-section">
                                <h4>Original Request</h4>
                                <div class="editor-container">
                                    <div class="editor-header">
                                        <span>Headers</span>
                                    </div>
                                    <pre class="request-headers selectable-text" id="original-request-headers"></pre>
                                    <div class="editor-header">
                                        <span>Body</span>
                                    </div>
                                    <pre class="request-body selectable-text" id="original-request-body"></pre>
                                </div>
                            </div>
                            <div class="response-section">
                                <h4>Original Response</h4>
                                <div class="editor-container">
                                    <div class="editor-header">
                                        <span>Status: ${finding.originalResponse?.status || 'N/A'}</span>
                                    </div>
                                    <div class="editor-header">
                                        <span>Headers</span>
                                    </div>
                                    <pre class="response-headers selectable-text" id="original-response-headers"></pre>
                                    <div class="editor-header">
                                        <span>Body</span>
                                    </div>
                                    <pre class="response-body selectable-text" id="original-response-body"></pre>
                                </div>
                            </div>
                        </div>
                        <div class="tab-content" id="probe-tab">
                            <div class="request-section">
                                <h4>Probe Request</h4>
                                <div class="editor-container">
                                    <div class="editor-header">
                                        <span>Headers</span>
                                    </div>
                                    <pre class="request-headers selectable-text" id="probe-request-headers"></pre>
                                    <div class="editor-header">
                                        <span>Body</span>
                                    </div>
                                    <pre class="request-body selectable-text" id="probe-request-body"></pre>
                                </div>
                            </div>
                            ${finding.probeResponse ? `
                            <div class="response-section">
                                <h4>Probe Response</h4>
                                <div class="editor-container">
                                    <div class="editor-header">
                                        <span>Status: ${finding.probeResponse.status}</span>
                                    </div>
                                    <div class="editor-header">
                                        <span>Headers</span>
                                    </div>
                                    <pre class="response-headers selectable-text" id="probe-response-headers"></pre>
                                    <div class="editor-header">
                                        <span>Body</span>
                                    </div>
                                    <pre class="response-body selectable-text" id="probe-response-body"></pre>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>`;

            // Add close button functionality
            const closeButton = modal.querySelector('.close-modal');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    modal.remove();
                });
            }

            // Add tab switching functionality
            const tabButtons = modal.querySelectorAll('.tab-button');
            const tabContents = modal.querySelectorAll('.tab-content');
            
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Remove active class from all buttons and contents
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    tabContents.forEach(content => content.classList.remove('active'));
                    
                    // Add active class to clicked button and corresponding content
                    button.classList.add('active');
                    const tabId = button.getAttribute('data-tab');
                    modal.querySelector(`#${tabId}-tab`)?.classList.add('active');
                });
            });

            // Close modal when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });

            document.body.appendChild(modal);

            // Populate the pre tags with highlighted JSON content after modal is in DOM
            (modal.querySelector('#original-request-headers') as HTMLElement).innerHTML = highlightJson(JSON.stringify(finding.originalRequest?.headers || {}, null, 2), false);
            try {
                const originalRequestBody = JSON.parse(finding.originalRequest?.body || '');
                (modal.querySelector('#original-request-body') as HTMLElement).innerHTML = highlightJson(JSON.stringify(originalRequestBody, null, 2), true);
            } catch (e) {
                (modal.querySelector('#original-request-body') as HTMLElement).innerHTML = highlightText(finding.originalRequest?.body || '', true);
            }

            // Populate original response data
            (modal.querySelector('#original-response-headers') as HTMLElement).innerHTML = highlightJson(JSON.stringify(finding.originalResponse?.headers || {}, null, 2), false);
            try {
                const originalResponseBody = JSON.parse(finding.originalResponse?.body || '');
                (modal.querySelector('#original-response-body') as HTMLElement).innerHTML = highlightJson(JSON.stringify(originalResponseBody, null, 2), true);
            } catch (e) {
                (modal.querySelector('#original-response-body') as HTMLElement).innerHTML = highlightText(finding.originalResponse?.body || '', true);
            }
            
            if (finding.probeResponse) {
                (modal.querySelector('#probe-request-headers') as HTMLElement).innerHTML = highlightJson(JSON.stringify(finding.probeRequest?.headers || {}, null, 2), false);
                try {
                    const probeRequestBody = JSON.parse(finding.probeRequest?.body || '');
                    (modal.querySelector('#probe-request-body') as HTMLElement).innerHTML = highlightJson(JSON.stringify(probeRequestBody, null, 2), true);
                } catch (e) {
                    (modal.querySelector('#probe-request-body') as HTMLElement).innerHTML = highlightText(finding.probeRequest?.body || '', true);
                }
                (modal.querySelector('#probe-response-headers') as HTMLElement).innerHTML = highlightJson(JSON.stringify(finding.probeResponse.headers || {}, null, 2), false);
                try {
                    const probeResponseBody = JSON.parse(finding.probeResponse.body || '');
                    (modal.querySelector('#probe-response-body') as HTMLElement).innerHTML = highlightJson(JSON.stringify(probeResponseBody, null, 2), true);
                } catch (e) {
                    (modal.querySelector('#probe-response-body') as HTMLElement).innerHTML = highlightText(finding.probeResponse.body || '', true);
                }
            }
        });
    });
}

function startMatrixRain(canvas: HTMLCanvasElement) {
    if (matrixAnimationId) cancelAnimationFrame(matrixAnimationId);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const fontSize = 16;
    const columns = Math.ceil(canvas.width / fontSize);

    const drops: number[] = [];
    for (let x = 0; x < columns; x++) {
        drops[x] = Math.random() * canvas.height / fontSize;
    }

    function draw() {
        ctx!.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx!.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx!.fillStyle = '#00C853';
        ctx!.font = fontSize + 'px "Fira Code", monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
            ctx!.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    let lastTime = 0;
    const fps = 15;
    const interval = 1000 / fps;

    function animate(currentTime: number) {
        matrixAnimationId = requestAnimationFrame(animate);
        const deltaTime = currentTime - lastTime;

        if (deltaTime > interval) {
            lastTime = currentTime - (deltaTime % interval);
            draw();
        }
    }
    
    animate(0);
}

export function createPluginView(refreshFn: () => Promise<void>, caido: any) {
    globalRefreshFunction = refreshFn;
    if (mainPluginView) return mainPluginView;

    const viewContainer = document.createElement('div');
    viewContainer.className = 'ssrf-scanner-container';
    viewContainer.innerHTML = `
        <canvas id="matrix-canvas"></canvas>
        <div class="plugin-main-content">
            <div class="plugin-header"><h1>SSRF Scanner Plugin</h1></div>
            <div class="plugin-tabs">
                <button class="tab-button active" data-tab="settings">Settings</button>
                <button class="tab-button" data-tab="findings">Findings</button>
                <button class="tab-button" data-tab="logging">Logging</button>
            </div>
            <div class="plugin-content">
                <div id="settings-view" class="tab-content active"></div>
                <div id="findings-view" class="tab-content"></div>
                <div id="logging-view" class="tab-content">
                    <h2>Debug Log</h2>
                    <textarea id="debug-log-textarea" readonly></textarea>
                </div>
            </div>
        </div>`;
    
    settingsViewEl = viewContainer.querySelector('#settings-view');
    findingsViewEl = viewContainer.querySelector('#findings-view');
    loggingViewEl = viewContainer.querySelector('#logging-view');
    debugLogTextArea = viewContainer.querySelector('#debug-log-textarea');
    
    viewContainer.querySelectorAll('.tab-content').forEach(el => {
        (el as HTMLElement).style.display = 'none';
    });
    (viewContainer.querySelector('#settings-view') as HTMLElement)!.style.display = 'block';

    viewContainer.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            viewContainer.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const tabName = button.getAttribute('data-tab');
            viewContainer.querySelectorAll('.tab-content').forEach(content => {
                const el = content as HTMLElement;
                el.style.display = el.id === `${tabName}-view` ? 'block' : 'none';
            });
        });
    });

    mainPluginView = viewContainer;
    
    const canvas = mainPluginView.querySelector<HTMLCanvasElement>('#matrix-canvas');
    if (canvas) {
        const observer = new ResizeObserver(() => startMatrixRain(canvas));
        observer.observe(viewContainer);
    }

    // Add styles for the new findings UI
    const style = document.createElement('style');
    style.textContent = `
        .findings-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        
        .findings-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }
        
        .findings-table th,
        .findings-table td {
            padding: 0.5rem;
            border: 1px solid #444;
            text-align: left;
        }
        
        .findings-table th {
            background-color: #2a2a2a;
        }
        
        .status-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.875rem;
        }
        
        .status-badge.probed {
            background-color: #00C853;
            color: white;
        }
        
        .status-badge.not_probed {
            background-color: #FF5252;
            color: white;
        }
        
        .status-badge.error {
            background-color: #FFD600;
            color: black;
        }
        
        .status-badge.pending {
            background-color: #FFA500;
            color: white;
        }
        
        .status-badge.disabled {
            background-color: #757575;
            color: white;
        }
        
        .view-details-btn {
            padding: 0.25rem 0.5rem;
            background-color: #2196F3;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .view-details-btn:hover {
            background-color: #1976D2;
        }
        
        .details-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .modal-content {
            background-color: #1e1e1e;
            border-radius: 8px;
            width: 80%;
            max-width: 1200px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            z-index: 1001;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid #444;
            background-color: #1e1e1e;
        }
        
        .close-modal {
            background: none;
            border: none;
            color: #fff;
            font-size: 1.5rem;
            cursor: pointer;
        }
        
        .modal-body {
            padding: 1rem;
            background-color: #1e1e1e;
        }
        
        .tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid #444;
            padding-bottom: 0.5rem;
        }
        
        .tab-button {
            padding: 0.5rem 1rem;
            background: rgba(13, 2, 8, 0.85);
            border: none;
            color: #fff;
            cursor: pointer;
            border-radius: 4px;
        }
        
        .tab-button:hover {
            background-color: #333;
        }
        
        .tab-button.active {
            background-color: #2196F3;
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .request-section,
        .response-section {
            margin-bottom: 2rem;
            background-color: #1e1e1e;
        }
        
        .editor-container {
            background-color: #2a2a2a;
            border-radius: 4px;
            margin-top: 0.5rem;
            border: 1px solid #444;
        }
        
        .editor-header {
            padding: 0.5rem;
            background-color: #333;
            border-bottom: 1px solid #444;
        }
        
        .request-headers,
        .request-body,
        .response-headers,
        .response-body {
            margin: 0;
            padding: 1rem;
            overflow-x: auto;
            white-space: pre-wrap;
            font-family: 'Fira Code', monospace;
            font-size: 0.875rem;
            background-color: #2a2a2a;
            color: #00ff00;
        }

        /* Styles for JSON highlighting */
        .json-key {
            color: #A0C0D0; /* Muted Cyan-Blue */
        }

        .json-string {
            color: #88BBAA; /* Soft Green */
        }

        .json-number,
        .json-boolean {
            color: #BB88CC; /* Muted Purple */
        }

        /* Ensure text is selectable */
        .selectable-text {
            user-select: text; /* Standard property */
            -webkit-user-select: text; /* Safari */
            -moz-user-select: text; /* Firefox */
            -ms-user-select: text; /* IE/Edge */
        }

        /* Base style for pre tags */
        pre {
            white-space: pre-wrap; /* Ensures long lines wrap */
            word-wrap: break-word; /* Ensures long words break */
        }

        .highlighted-url {
            background-color: rgba(255, 255, 0, 0.3);
            padding: 2px 4px;
            border-radius: 3px;
        }
    `;
    document.head.appendChild(style);

    return viewContainer;
}