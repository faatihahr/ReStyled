import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverComponentsExternalPackages: ['clarifai-nodejs-grpc', 'mongodb'],
  },
};

export default nextConfig;
