import { S3Client } from "@aws-sdk/client-s3";
import { CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_ENDPOINT, CLOUDFLARE_R2_SECRET_ACCESS_KEY } from "./env";

export const r2 = new S3Client({
  region: "auto",
  endpoint: CLOUDFLARE_R2_ENDPOINT!,
  forcePathStyle: true,
  credentials: {
    accessKeyId: CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});