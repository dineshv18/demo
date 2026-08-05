import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import getEnv from "./env.js";

let r2Client;

function getR2Client() {
  if (!r2Client) {
    const env = getEnv();
    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return r2Client;
}

export async function uploadToR2(file, folder = "kyc") {
  const env = getEnv();
  const ext = file.originalname.split(".").pop();
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  await getR2Client().send(new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  }));

  return { key, url: `${env.R2_PUBLIC_URL}/${key}` };
}

export async function deleteFromR2(key) {
  const env = getEnv();
  await getR2Client().send(new DeleteObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
  }));
}