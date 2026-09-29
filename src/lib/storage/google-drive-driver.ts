/**
 * Enterprise Google Workspace Driver (Google Drive & Google Sheets)
 * Implements direct REST v3 OAuth2 token refresh, multipart file upload,
 * public view link resolution, and Google Sheets CRM lead synchronization.
 */

export interface GoogleServicesConfig {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  driveFolderId?: string;
  sheetId?: string;
  defaultServices?: string[];
}

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let cachedToken: TokenCache | null = null;

/**
 * Retrieves a fresh OAuth2 access token using client credentials and refresh token.
 */
export async function getGoogleAccessToken(config: GoogleServicesConfig): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.accessToken;
  }

  if (!config.clientId || !config.clientSecret || !config.refreshToken) {
    throw new Error("Missing Google Workspace OAuth credentials (clientId, clientSecret, or refreshToken)");
  }

  const tokenEndpoint = "https://oauth2.googleapis.com/token";
  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: config.refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to refresh Google OAuth token (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + (data.expires_in || 3600) * 1000,
  };

  return cachedToken.accessToken;
}

/**
 * Uploads a buffer directly to Google Drive via multipart/related REST v3 upload.
 */
export async function uploadToGoogleDrive(
  buffer: Buffer,
  filename: string,
  contentType: string,
  config: GoogleServicesConfig
): Promise<{ fileId: string; publicUrl: string; webViewLink?: string }> {
  const accessToken = await getGoogleAccessToken(config);

  const metadata: Record<string, unknown> = {
    name: filename,
    mimeType: contentType,
  };

  if (config.driveFolderId && config.driveFolderId.trim().length > 0) {
    metadata.parents = [config.driveFolderId.trim()];
  }

  const boundary = "-------314159265358979323846";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
  const mediaHeader = `${delimiter}Content-Type: ${contentType}\r\nContent-Transfer-Encoding: binary\r\n\r\n`;

  const multipartPayload = Buffer.concat([
    Buffer.from(metadataPart, "utf8"),
    Buffer.from(mediaHeader, "utf8"),
    buffer,
    Buffer.from(closeDelimiter, "utf8"),
  ]);

  const uploadUrl = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink";
  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
      "Content-Length": multipartPayload.length.toString(),
    },
    body: multipartPayload,
  });

  if (!uploadResponse.ok) {
    const errText = await uploadResponse.text();
    throw new Error(`Google Drive upload failed (${uploadResponse.status}): ${errText}`);
  }

  const fileData = (await uploadResponse.json()) as {
    id: string;
    name: string;
    webViewLink?: string;
    webContentLink?: string;
  };

  // Grant public read permission so the asset can be loaded in web applications
  try {
    const permUrl = `https://www.googleapis.com/drive/v3/files/${fileData.id}/permissions`;
    await fetch(permUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "reader",
        type: "anyone",
      }),
    });
  } catch (permErr) {
    console.warn("Could not set public permission on Google Drive file:", permErr);
  }

  // Canonical high-performance direct web view link for Google Drive assets
  const publicUrl = `https://lh3.googleusercontent.com/d/${fileData.id}`;

  return {
    fileId: fileData.id,
    publicUrl,
    webViewLink: fileData.webViewLink,
  };
}

/**
 * Deletes a file from Google Drive by file ID.
 */
export async function deleteFromGoogleDrive(
  fileId: string,
  config: GoogleServicesConfig
): Promise<boolean> {
  const accessToken = await getGoogleAccessToken(config);
  const deleteUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`;

  const response = await fetch(deleteUrl, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.ok;
}

/**
 * Appends an inbound CRM inquiry row to the configured Google Sheet.
 */
export async function appendLeadToGoogleSheet(
  lead: {
    fullName: string;
    email: string;
    phone?: string | null;
    subject?: string | null;
    message: string;
    createdAt?: Date | string;
  },
  config: GoogleServicesConfig
): Promise<boolean> {
  if (!config.sheetId) {
    throw new Error("No Google Sheet ID configured for Lead Sync");
  }

  const accessToken = await getGoogleAccessToken(config);
  const sheetId = config.sheetId.trim();
  const timestamp = lead.createdAt
    ? new Date(lead.createdAt).toISOString()
    : new Date().toISOString();

  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    sheetId
  )}/values/A1:append?valueInputOption=USER_ENTERED`;

  const values = [
    [
      timestamp,
      lead.fullName,
      lead.email,
      lead.phone || "",
      lead.subject || "General Inquiry",
      lead.message,
    ],
  ];

  const response = await fetch(appendUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.warn("Failed to append lead to Google Sheet:", errorText);
    return false;
  }

  return true;
}

/**
 * Tests connection to Google Drive & Google Sheets using supplied configuration.
 */
export async function testGoogleWorkspaceConnection(
  config: GoogleServicesConfig
): Promise<{ success: boolean; message: string; details?: Record<string, unknown> }> {
  try {
    const accessToken = await getGoogleAccessToken(config);

    // 1. Verify Drive access
    const driveUrl = "https://www.googleapis.com/drive/v3/about?fields=user,storageQuota";
    const driveRes = await fetch(driveUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!driveRes.ok) {
      const err = await driveRes.text();
      return { success: false, message: `Google Drive API error: ${err}` };
    }

    const driveData = (await driveRes.json()) as {
      user?: { displayName?: string; emailAddress?: string };
    };

    // 2. If Sheet ID configured, verify Sheet access
    let sheetTitle: string | undefined;
    if (config.sheetId && config.sheetId.trim().length > 0) {
      const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        config.sheetId.trim()
      )}?fields=properties.title`;
      const sheetRes = await fetch(sheetUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (sheetRes.ok) {
        const sheetData = (await sheetRes.json()) as { properties?: { title?: string } };
        sheetTitle = sheetData.properties?.title;
      }
    }

    return {
      success: true,
      message: `Successfully connected as ${driveData.user?.displayName || driveData.user?.emailAddress || "Google User"}`,
      details: {
        user: driveData.user?.emailAddress,
        sheetTitle,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown Google Workspace error",
    };
  }
}
