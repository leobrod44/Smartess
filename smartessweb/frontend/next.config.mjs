/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "binhqkhubflsxgrlvppg.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/avatars/users/**",
      },
    ],
  },
};

export default nextConfig;
