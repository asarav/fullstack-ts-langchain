import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    // Detect if running in Kubernetes (check for KUBERNETES_SERVICE_HOST) or local development
    const isKubernetes = process.env.KUBERNETES_SERVICE_HOST;
    const backendUrl = isKubernetes 
      ? "http://server:3001" // Kubernetes service name
      : "http://localhost:3001"; // Local development
    
    console.log(`Next.js proxy configured for ${isKubernetes ? 'Kubernetes' : 'local development'}: ${backendUrl}`);
    
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;