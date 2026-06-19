const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || "";

/**
 * Submits form data to the Google Apps Script Web App.
 * Uses a plain text Content-Type header to avoid triggering CORS preflight OPTIONS
 * requests, which can fail or redirect awkwardly on Apps Script endpoints.
 * 
 * @param type The sheet name/tab destination (e.g., "Cake Inquiries")
 * @param payload The key-value pairs representing form inputs
 * @returns A promise resolving to true if submission was sent successfully, false otherwise
 */
export async function submitToGoogleSheets(type: string, payload: Record<string, any>): Promise<boolean> {
  if (!GOOGLE_SCRIPT_URL) {
    console.warn(
      `[GoogleSheetsService] VITE_GOOGLE_SCRIPT_URL is not set. ` +
      `Submission for '${type}' was skipped. Payload:`,
      payload
    );
    return false;
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({ type, payload })
    });
    return response.ok;
  } catch (error) {
    console.error(`[GoogleSheetsService] Failed to submit to '${type}':`, error);
    return false;
  }
}
