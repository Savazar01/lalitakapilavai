/**
 * Enterprise Nextcloud WebDAV Storage Driver
 * Implements WebDAV file streaming, recursive collection creation (MKCOL),
 * file deletion, and public share URL generation via Nextcloud OCS Share API.
 */

export interface NextcloudConfig {
  enabled: boolean;
  serverUrl: string;
  username: string;
  appPassword: string;
  baseFolder?: string;
}

function getAuthHeader(config: NextcloudConfig): string {
  const credentials = `${config.username}:${config.appPassword}`;
  return `Basic ${Buffer.from(credentials).toString("base64")}`;
}

function getCleanServerUrl(serverUrl: string): string {
  return serverUrl.trim().replace(/\/+$/, "");
}

function getWebdavBaseUrl(config: NextcloudConfig): string {
  const cleanServer = getCleanServerUrl(config.serverUrl);
  const cleanUser = encodeURIComponent(config.username.trim());
  return `${cleanServer}/remote.php/dav/files/${cleanUser}`;
}

/**
 * Ensures parent folders exist in Nextcloud by creating them sequentially with MKCOL.
 */
async function ensureRemoteDirectory(
  fullPath: string,
  config: NextcloudConfig
): Promise<void> {
  const webdavBase = getWebdavBaseUrl(config);
  const authHeader = getAuthHeader(config);

  const parts = fullPath.split("/").filter(Boolean);
  let currentPath = "";

  for (let i = 0; i < parts.length - 1; i++) {
    currentPath += `/${encodeURIComponent(parts[i])}`;
    const dirUrl = `${webdavBase}${currentPath}`;

    try {
      await fetch(dirUrl, {
        method: "MKCOL",
        headers: {
          Authorization: authHeader,
        },
      });
      // 405 Method Not Allowed means directory already exists, which is acceptable
    } catch {
      // Ignore MKCOL error if path segment already exists
    }
  }
}

/**
 * Uploads a buffer to Nextcloud via WebDAV HTTP PUT.
 */
export async function uploadToNextcloud(
  buffer: Buffer,
  key: string,
  contentType: string,
  config: NextcloudConfig
): Promise<{ key: string; publicUrl: string; shareUrl?: string }> {
  if (!config.serverUrl || !config.username || !config.appPassword) {
    throw new Error("Missing Nextcloud credentials (serverUrl, username, or appPassword)");
  }

  const baseFolder = (config.baseFolder || "SavazAI-Media").replace(/^\/+|\/+$/g, "");
  const sanitizedKey = key.replace(/^\/+/, "");
  const fullRemoteRelativePath = `${baseFolder}/${sanitizedKey}`;

  // 1. Ensure remote parent directories exist
  await ensureRemoteDirectory(fullRemoteRelativePath, config);

  // 2. Put object to WebDAV
  const webdavBase = getWebdavBaseUrl(config);
  const encodedFilePath = fullRemoteRelativePath
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  const uploadUrl = `${webdavBase}/${encodedFilePath}`;

  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: getAuthHeader(config),
      "Content-Type": contentType,
      "Content-Length": buffer.length.toString(),
    },
    body: new Uint8Array(buffer),
  });

  if (!response.ok && response.status !== 201 && response.status !== 204) {
    const errorText = await response.text();
    throw new Error(`Nextcloud WebDAV upload failed (${response.status}): ${errorText}`);
  }

  // 3. Generate public share link via Nextcloud OCS Share API
  let publicUrl = uploadUrl;
  let shareUrl: string | undefined;

  try {
    const cleanServer = getCleanServerUrl(config.serverUrl);
    const ocsUrl = `${cleanServer}/ocs/v2.php/apps/files_sharing/api/v1/shares?format=json`;

    const shareParams = new URLSearchParams({
      path: `/${fullRemoteRelativePath}`,
      shareType: "3", // Public Link
      permissions: "1", // Read Only
    });

    const shareRes = await fetch(ocsUrl, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(config),
        "OCS-APIRequest": "true",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: shareParams.toString(),
    });

    if (shareRes.ok) {
      const shareData = (await shareRes.json()) as {
        ocs?: {
          data?: {
            url?: string;
            token?: string;
          };
        };
      };

      if (shareData.ocs?.data?.url) {
        shareUrl = shareData.ocs.data.url;
        // Direct download URL format for Nextcloud public links
        publicUrl = `${shareData.ocs.data.url}/download`;
      }
    }
  } catch (shareErr) {
    console.warn("Could not create public Nextcloud share link, using WebDAV URL fallback:", shareErr);
  }

  return {
    key: fullRemoteRelativePath,
    publicUrl,
    shareUrl,
  };
}

/**
 * Deletes a file from Nextcloud via WebDAV DELETE.
 */
export async function deleteFromNextcloud(
  key: string,
  config: NextcloudConfig
): Promise<boolean> {
  const baseFolder = (config.baseFolder || "SavazAI-Media").replace(/^\/+|\/+$/g, "");
  const fullRemoteRelativePath = key.startsWith(baseFolder) ? key : `${baseFolder}/${key.replace(/^\/+/, "")}`;

  const webdavBase = getWebdavBaseUrl(config);
  const encodedFilePath = fullRemoteRelativePath
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  const deleteUrl = `${webdavBase}/${encodedFilePath}`;

  const response = await fetch(deleteUrl, {
    method: "DELETE",
    headers: {
      Authorization: getAuthHeader(config),
    },
  });

  return response.ok || response.status === 404;
}

/**
 * Tests connection to Nextcloud WebDAV server.
 */
export async function testNextcloudConnection(
  config: NextcloudConfig
): Promise<{ success: boolean; message: string }> {
  try {
    const webdavBase = getWebdavBaseUrl(config);
    const response = await fetch(webdavBase, {
      method: "PROPFIND",
      headers: {
        Authorization: getAuthHeader(config),
        Depth: "0",
      },
    });

    if (response.ok || response.status === 207) {
      return {
        success: true,
        message: `Successfully connected to Nextcloud server at ${getCleanServerUrl(config.serverUrl)}`,
      };
    }

    const errText = await response.text();
    return {
      success: false,
      message: `Nextcloud connection failed with HTTP status ${response.status}: ${errText.slice(0, 150)}`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to connect to Nextcloud server",
    };
  }
}
