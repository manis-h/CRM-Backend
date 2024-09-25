import S3 from "aws-sdk/clients/s3.js";

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION;
const bucketName = process.env.AWS_BUCKET_NAME;

const s3 = new S3({ region, accessKeyId, secretAccessKey });

// Upload a file to S3
export async function uploadFilesToS3(buffer, key, mimeType) {
    var params = {
        Bucket: bucketName,
        Body: buffer,
        Key: key,
        ContentType: mimeType,
    };
    return await s3.upload(params).promise();
}

// Generate pre-signed url to view the files
export function generatePresignedUrl(key, mimeType) {
    var params = {
        Bucket: bucketName,
        Key: key,
        Expires: 3 * 60 * 60, // Set expiration time (e.g., 3 hour)
        ResponseContentDisposition: "inline", // Display the file in the browser
        ResponseContentType: mimeType || "application/octet-stream", // Ensure correct MIME type
    };
    return s3.getSignedUrl("getObject", params);
}
