import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Nodemailer resolves transports and Node built-ins at runtime, which the
     bundler cannot trace. Left to be bundled it breaks on the server action
     that sends inquiry notifications. */
  serverExternalPackages: ["nodemailer"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
  },
};

export default nextConfig;
