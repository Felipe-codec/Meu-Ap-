import { Capacitor } from "@capacitor/core";

export const isWebPlatform = (): boolean => {
  return Capacitor.getPlatform() === "web";
};

const SHEETS_URL_KEY = "meuape_google_sheets_url";

export function getGoogleSheetsUrl(): string {
  try {
    return localStorage.getItem(SHEETS_URL_KEY) || "";
  } catch {
    return "";
  }
}

export function setGoogleSheetsUrl(url: string): void {
  try {
    localStorage.setItem(SHEETS_URL_KEY, url.trim());
  } catch {}
}

/**
 * Saves a key-value pair to Google Sheets (Web only)
 */
export async function syncToGoogleSheets(key: string, value: any): Promise<boolean> {
  if (!isWebPlatform()) return false;
  const scriptUrl = getGoogleSheetsUrl();
  if (!scriptUrl) return false;

  try {
    const payload = JSON.stringify({
      action: "save",
      key,
      value,
    });

    // Use text/plain to prevent CORS preflight issues with Google Apps Script
    await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: payload,
    });

    return true;
  } catch (err) {
    console.warn("Failed to sync to Google Sheets:", err);
    return false;
  }
}

/**
 * Fetches all keys and values from Google Sheets (Web only)
 */
export async function fetchAllFromGoogleSheets(): Promise<Record<string, any> | null> {
  if (!isWebPlatform()) return null;
  const scriptUrl = getGoogleSheetsUrl();
  if (!scriptUrl) return null;

  try {
    const res = await fetch(`${scriptUrl}?action=getAll`);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("Failed to fetch from Google Sheets:", err);
    return null;
  }
}

/**
 * Google Apps Script snippet for the user to copy/paste into Google Sheets
 */
export const GOOGLE_APPS_SCRIPT_CODE = `function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var action = e ? e.parameter.action : "getAll";
  
  if (action === "getAll") {
    var data = sheet.getDataRange().getValues();
    var result = {};
    for (var i = 0; i < data.length; i++) {
      if (data[i][0]) {
        try {
          result[data[i][0]] = JSON.parse(data[i][1]);
        } catch(err) {
          result[data[i][0]] = data[i][1];
        }
      }
    }
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var postData = {};
  
  try {
    postData = JSON.parse(e.postData.contents);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Invalid JSON" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (postData.action === "save") {
    var key = postData.key;
    var value = typeof postData.value === "string" ? postData.value : JSON.stringify(postData.value);
    var data = sheet.getDataRange().getValues();
    var found = false;

    for (var i = 0; i < data.length; i++) {
      if (data[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(value);
        found = true;
        break;
      }
    }

    if (!found) {
      sheet.appendRow([key, value]);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: "ignored" }))
    .setMimeType(ContentService.MimeType.JSON);
}`;
