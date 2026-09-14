import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker 自部署: standalone 输出, 最小化镜像
  output: "standalone",
  // better-sqlite3 是原生模块, 不需要 webpack 处理
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
