/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  redirects: async () => {
    return [
      {
        source: "/invite/:code*",
        destination: "/auth/register?invite=:code*",
        permanent: true
      }
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.themoviedb.org"
      },
      {
        protocol: "https",
        hostname: "*.storytel.com"
      }
    ]
  }
}

module.exports = nextConfig
