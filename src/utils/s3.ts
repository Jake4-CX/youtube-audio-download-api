import * as AWS from 'aws-sdk';
import { PassThrough } from "stream";

export const s3 = new AWS.S3({
  endpoint: process.env.BACKBLAZE_ENDPOINT,
  accessKeyId: process.env.BACKBLAZE_ACCOUNT_ID,
  secretAccessKey: process.env.BACKBLAZE_APP_KEY,
  signatureVersion: "v4",
});

export function createUploadStream(key: string, contentType?: string) {
  const pass = new PassThrough();

  const promise = s3
    .upload({
      Bucket: process.env.BACKBLAZE_BUCKET_NAME,
      Body: pass,
      Key: key,
      ContentType: contentType,
    })
    .promise();

  return { pass, promise };
}
