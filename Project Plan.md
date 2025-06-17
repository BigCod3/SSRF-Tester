Project Brief: Caido Plugin - Automated URL Endpoint Scanner & SSRF Prober

Reference Documentation Development MUST adhere to the official Caido Plugin SDK documentation. The primary language for the plugin will be JavaScript/TypeScript.
Frontend SDK Reference: https://developer.caido.io/reference/sdks/frontend/

Plugin Development Guides: https://developer.caido.io/guides/getting-started/

Backend SDK Reference: https://developer.caido.io/reference/sdks/backend/

Project Goal The objective is to create a sophisticated Caido plugin that automates the discovery and preliminary testing of potential Server-Side Request Forgery (SSRF) vulnerabilities. The plugin will passively inspect all in-scope HTTP traffic, identify unique API endpoints that process URLs within their request bodies, and, if enabled, automatically send a probe request with a custom callback URL to test for out-of-band interactions. The plugin must be highly configurable and provide all its findings and logging within a dedicated, self-contained UI tab.

Core Functionality & Configuration The plugin will consist of two primary modules that can be controlled independently from the plugin's settings panel:

Discovery Module: When enabled, this module passively analyzes requests to find unique endpoints that contain one or more URLs in the request body. It uses an advanced structural deduplication algorithm to avoid creating duplicate findings for the same endpoint.

Probe Module: When enabled, this module automatically sends a modified "attack" request for every unique endpoint discovered by the Discovery Module.

Configuration Requirements:

A dedicated settings area within the plugin's UI.

A toggle switch to Enable/Disable the Discovery Module.

A toggle switch to Enable/Disable the Probe Module.

A checkbox to Enable/Disable Debug Logging for troubleshooting.

Detailed Technical Requirements 4.1. Passive Request Interception The plugin must hook into Caido's request pipeline to passively analyze every in-scope HTTP request that has a request body.
4.2. Structural Deduplication Logic This is the most critical component. To avoid flooding the findings list, the plugin must generate a stable "structural signature" for each request body, ignoring dynamic values. This signature will be used as part of a deduplication key.

The logic for generating this signature must be implemented in a tiered, intelligent manner:

Tier 1: High-Precision Analysis (Content-Type Driven)

Check for an Explicit Content-Type Header: The plugin must look for both Content-Type and content-type (case-insensitive).

Infer JSON Content: If no Content-Type header is present, but the request body text trim()'d starts with { or [, the plugin must assume it is JSON and attempt to parse it.

Processing Logic:

If application/json: Recursively walk the entire JSON object and collect every unique key name into a sorted, comma-separated string (e.g., json-keys:actionType,bottomSheetContext,bottomSheetEmpty,...).

If application/x-www-form-urlencoded: Parse the body and collect every unique parameter name into a sorted, comma-separated string (e.g., form-keys:param1,param2,query,version).

If multipart/form-data: Parse the body and extract the name attribute from each Content-Disposition header, creating a sorted, comma-separated string (e.g., multipart-names:file1,file2,text).

Tier 2: Best-Effort Fallback (Regex Normalization)

If the content is not a recognized type from Tier 1, or if JSON parsing fails, the plugin must fall back to a regex-based normalization of the entire request body. This process should replace dynamic values with static placeholders:

All URLs (http://..., https://...) -> URL

UUIDs and long hexadecimal strings -> RANDOM_ID

Long numerical strings (e.g., timestamps) -> RANDOM_NUM

The signature will be the resulting normalized string (e.g., regex-normalized:{"queryText":"QUERY",...}).

The final Deduplication Key for any given request will be a combination of (Host + Path + Body Signature).

4.3. Automated Probing Logic The Probe Module must use the exact same structural deduplication logic to ensure it only attacks each unique endpoint once.

When a new, unique endpoint is discovered and the Probe Module is enabled, it must construct and send a new HTTP request.

This probe request should be a clone of the original, with one change: all URLs found in the original body must be replaced with a single, dynamic callback payload.

Payload Format: The URL should be https://request-spy.iownthisdomainname.net/plugin-ssrf/<original_hostname>/<current_date+time>

Example: https://request-spy.iownthisdomainname.net/plugin-ssrf/api.example.com/yyyy-MM-ddTHH:mm

The plugin must use the appropriate Backend SDK method to send this HTTP request.

User Interface (UI) Requirements The plugin must create its own dedicated view/tab within the Caido UI, which will house all its features. This view should be split into three components: Settings, Findings, and Logging.
5.1. Findings View This is the main view and should display all discovered endpoints in a filterable, sortable table similar to Caido's HTTP History.

Columns:

Date / Time: Timestamp of when the endpoint was first discovered.

Finding ID: A unique identifier for the finding (e.g., sequential number).

Host: The hostname of the request.

Path: The path of the request.

Probed?: A status indicator for the probe action.

Green Checkmark (✔): The probe request was sent successfully.

Red X (✖): An error occurred while attempting to send the probe.

Grey Dash (-): The Probe Module was disabled when this endpoint was discovered, so no probe was attempted.

Functionality: Clicking on a row in the table should display the full original request and response details associated with that finding.

5.2. Logging View A console-like window or text area that is only visible when "Enable Debug Logging" is checked in the settings.

This console must display all the detailed log messages generated by the plugin (e.g., the content-type detection, signature generation, probe attempts, and errors). This is crucial for troubleshooting the plugin's behavior.