import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['sequelize', 'pg', 'pg-hstore', 'bcrypt'],
};

export default nextConfig;
