/** @type {import('next').NextConfig} */
const nextConfig = {
  // Wiki pages are read from the local filesystem at request time (Karpathy
  // LLM-Wiki, file-backed). Nothing to configure for slice 1.

  // Build/serve into a per-target dir so a local production server
  // (`next start`) and the dev server (`next dev`) don't fight over `.next/`.
  // Dev leaves NEXT_DIST_DIR unset → `.next`; prod sets it → `.next-prod`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
