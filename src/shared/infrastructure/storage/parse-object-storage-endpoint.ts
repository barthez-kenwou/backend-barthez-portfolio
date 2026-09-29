/**
 * MinIO JS client wants host only — no scheme, no path, no trailing slash.
 * Operators often paste full URLs; normalize so boot does not crash.
 */
export type ParsedObjectStorageEndpoint = {
  endPoint: string;
  port?: number;
  useSSL?: boolean;
};

export function parseObjectStorageEndpoint(
  raw: string,
  defaults: { port: number; useSSL: boolean },
): ParsedObjectStorageEndpoint {
  const trimmed = (raw || '').trim();
  if (!trimmed) {
    return { endPoint: 'localhost', port: defaults.port, useSSL: defaults.useSSL };
  }

  // Bare host (optionally host:port) — keep explicit env port/ssl.
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    const withoutSlash = trimmed.replace(/\/+$/, '');
    const hostPort = withoutSlash.split('/')[0] ?? withoutSlash;
    if (hostPort.includes(':') && !hostPort.startsWith('[')) {
      const [host, portStr] = hostPort.split(':');
      const port = Number(portStr);
      if (host && Number.isFinite(port)) {
        return { endPoint: host, port, useSSL: defaults.useSSL };
      }
    }
    return { endPoint: hostPort, port: defaults.port, useSSL: defaults.useSSL };
  }

  try {
    const url = new URL(trimmed);
    const endPoint = url.hostname;
    const port =
      url.port && Number.isFinite(Number(url.port))
        ? Number(url.port)
        : url.protocol === 'https:'
          ? 443
          : url.protocol === 'http:'
            ? 80
            : defaults.port;
    const useSSL =
      url.protocol === 'https:' ? true : url.protocol === 'http:' ? false : defaults.useSSL;
    return { endPoint, port, useSSL };
  } catch {
    return {
      endPoint:
        trimmed
          .replace(/^https?:\/\//i, '')
          .replace(/\/+$/, '')
          .split('/')[0] || 'localhost',
      port: defaults.port,
      useSSL: defaults.useSSL,
    };
  }
}
