import aws from "aws-sdk";
import * as dotenv from "dotenv";

dotenv.config();

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.REGION,
    signatureVersion: "v4",
});

const Bucket = process.env.BUCKET;

const getSignedURL = async (fileID, expireMins) => {
    const aws3 = new aws.S3();
    const Key = `${fileID}.mp3`;
    const Expires = 60 * expireMins;
    return aws3.getSignedUrl("putObject", { Bucket, Key, Expires });
};

export default getSignedURL;
