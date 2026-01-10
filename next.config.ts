import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  // 1. Configure pageExtensions to include md and mdx
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],

  // 2. Keep your existing experimental settings
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

// 3. Wrap the config with MDX
export default withMDX(nextConfig);