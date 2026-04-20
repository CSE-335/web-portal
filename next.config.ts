import createNextIntlPlugin from 'next-intl/plugin';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { networkInterfaces } from 'node:os';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const projectRoot = dirname(fileURLToPath(import.meta.url));

function isPrivateIpv4(host: string): boolean {
  if (host.startsWith('10.')) return true;
  if (host.startsWith('192.168.')) return true;
  if (host.startsWith('172.')) {
    const secondOctet = Number.parseInt(host.split('.')[1] ?? '', 10);
    return secondOctet >= 16 && secondOctet <= 31;
  }
  return false;
}

function getDevOrigins(): string[] {
  const hosts = new Set<string>(['localhost', '127.0.0.1']);

  const nic = networkInterfaces();
  for (const entries of Object.values(nic)) {
    for (const entry of entries ?? []) {
      if (entry.family === 'IPv4' && !entry.internal && isPrivateIpv4(entry.address)) {
        hosts.add(entry.address);
      }
    }
  }

  const envHosts = (process.env.NEXT_ALLOWED_DEV_ORIGINS ?? '')
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean);

  for (const host of envHosts) {
    hosts.add(host);
  }

  return [...hosts];
}

const nextConfig = {
  allowedDevOrigins: getDevOrigins(),
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: projectRoot,
  },
};

export default withNextIntl(nextConfig);
