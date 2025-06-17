// Helper function getJsonKeys
function getJsonKeys(json: any, keys: Set<string> = new Set()): Set<string> {
  if (typeof json === 'object' && json !== null) {
    if (Array.isArray(json)) {
      json.forEach(item => getJsonKeys(item, keys));
    } else {
      Object.keys(json).forEach(key => {
        keys.add(key);
        getJsonKeys(json[key], keys);
      });
    }
  }
  return keys;
}

// Helper function normalizeRequestBodyWithRegex
function normalizeRequestBodyWithRegex(requestBody: string): string {
  if (!requestBody) return "empty-body";

  let normalizedBody = requestBody;

  // Replace URLs with more comprehensive regex
  normalizedBody = normalizedBody.replace(
    /(?:https?|ftp|file|ws|wss):\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
    '__URL__'
  );

  // Replace UUIDs
  normalizedBody = normalizedBody.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    '__RANDOM_ID__'
  );

  // Replace long hexadecimal strings
  normalizedBody = normalizedBody.replace(
    /\b[0-9a-f]{20,}\b/gi,
    '__RANDOM_ID__'
  );

  // Replace long numerical strings
  normalizedBody = normalizedBody.replace(
    /\b\d{10,}\b/g,
    '__RANDOM_NUM__'
  );

  // Replace email addresses
  normalizedBody = normalizedBody.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '__EMAIL__'
  );

  // Replace IP addresses
  normalizedBody = normalizedBody.replace(
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    '__IP__'
  );

  // Check if normalizedBody is too short or effectively empty
  if (normalizedBody.replace(/__URL__|__RANDOM_ID__|__RANDOM_NUM__|__EMAIL__|__IP__|\s/g, '').length < 10) {
    return "short-normalized-content";
  }

  return normalizedBody;
}

export function generateBodySignature(requestBody: string | undefined | null, rawContentType?: string): string {
  const contentType = rawContentType?.toLowerCase().split(';')[0];

  if (!requestBody) {
    return "empty-body";
  }

  let signature = "";

  // Ensure requestBody is a string and trim it
  const trimmedBody = String(requestBody).trim();
  
  // If the trimmed body is empty, return early
  if (!trimmedBody) {
    return "empty-body";
  }

  // Tier 1: Content-Type based analysis
  if (contentType === 'application/json' || (!contentType && (trimmedBody.startsWith('{') || trimmedBody.startsWith('[')))) {
    try {
      const jsonData = JSON.parse(trimmedBody);
      const keys = Array.from(getJsonKeys(jsonData)).sort();
      if (keys.length > 0) {
        signature = `json-keys:${keys.join(',')}`;
      } else {
        signature = 'json-empty';
      }
    } catch (e) {
      signature = "fallback:json-parsing-failed";
    }
  } else if (contentType === 'application/x-www-form-urlencoded') {
    try {
      const params = new URLSearchParams(trimmedBody);
      const keys = Array.from(params.keys()).sort();
      if (keys.length > 0) {
        signature = `form-keys:${keys.join(',')}`;
      } else {
        signature = 'form-empty';
      }
    } catch (e) {
      signature = "fallback:form-parsing-failed";
    }
  } else if (contentType === 'multipart/form-data') {
    const names = new Set<string>();
    const nameRegex = /Content-Disposition:(?:.*;)?\s*name="([^"]+)"/gi;
    let match;
    while ((match = nameRegex.exec(trimmedBody)) !== null) {
      names.add(match[1]);
    }
    if (names.size > 0) {
      signature = `multipart-names:${Array.from(names).sort().join(',')}`;
    } else {
      signature = 'fallback:multipart-no-names-found';
    }
  } else {
    signature = 'fallback:unknown-content-type';
  }

  // Tier 2: Fallback to regex-based normalization
  if (signature.startsWith('fallback:') || 
    signature === 'json-empty' || 
    signature === 'form-empty' || 
    signature === 'fallback:multipart-no-names-found' || 
    signature === 'fallback:unknown-content-type') {
    
    const normalizedBody = normalizeRequestBodyWithRegex(trimmedBody);
    if (normalizedBody === "empty-body" || normalizedBody === "short-normalized-content") {
      return normalizedBody;
    }
    return `regex-normalized:${normalizedBody}`;
  }

  return signature;
}

export function getDeduplicationKey(host: string, path: string, bodySignature: string): string {
  const safeHost = host || "no-host";
  const safePath = path || "no-path";
  const safeBodySignature = bodySignature || "no-signature";
  return `${safeHost}|${safePath}|${safeBodySignature}`;
}

export function extractUrlsFromRequestBody(requestBody: string, _contentType?: string): string[] {
  if (!requestBody) {
    return [];
  }

  const foundUrls = new Set<string>();

  // Comprehensive URL regex that handles various schemes and formats
  const urlRegex = /(?:https?|ftp|file|ws|wss):\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

  let match;
  while ((match = urlRegex.exec(requestBody)) !== null) {
    const url = match[0];
    // Basic validation to ensure it's a real URL
    try {
      new URL(url);
      foundUrls.add(url);
    } catch (e) {
      // Invalid URL, skip it
      continue;
    }
  }

  return Array.from(foundUrls);
}
