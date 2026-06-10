let basePath = process.env.NEXT_BASE_PATH || undefined;
if (basePath) {
  if (!basePath.startsWith("/")) {
    basePath = "/" + basePath;
  }
  if (basePath.endsWith("/")) {
    basePath = basePath.slice(0, -1);
  }
}

let assetPrefix = process.env.NEXT_ASSET_PREFIX || undefined;
if (assetPrefix) {
  if (!assetPrefix.startsWith("/")) {
    assetPrefix = "/" + assetPrefix;
  }
  if (!assetPrefix.endsWith("/")) {
    assetPrefix = assetPrefix + "/";
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Wiki pages are read from the local filesystem at request time (Karpathy
  // LLM-Wiki, file-backed). Nothing to configure for slice 1.

  // Build/serve into a per-target dir so a local production server
  // (`next start`) and the dev server (`next dev`) don't fight over `.next/`.
  // Dev leaves NEXT_DIST_DIR unset → `.next`; prod sets it → `.next-prod`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  basePath,
  assetPrefix,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath || "",
    NEXT_PUBLIC_ASSET_PREFIX: assetPrefix || "",
  },
};

export default nextConfig;
