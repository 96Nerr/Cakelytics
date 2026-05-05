import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Prisma CLI versi 7 wajib menggunakan DIRECT_URL dari Supabase untuk melakukan push tabel
    url: env("DIRECT_URL"),
  },
});