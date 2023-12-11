const AWS=require('aws-sdk');

const uploadToS3=async function (data,filename){
    const BUCKET_NAME=process.env.BUCKET_NAME;
    const IAM_USER_KEY=process.env.IAM_USER_KEY;
    const IAM_USER_SECRET=process.env.IAM_USER_SECRET;

    const s3Bucket=new AWS.S3({
        accessKeyId:IAM_USER_KEY,
        secretAccessKey:IAM_USER_SECRET,
    });

    const params={
        Bucket:BUCKET_NAME,
        Key:filename,
        Body:data,
        ACL:'public-read',
    }
    return new Promise((resolve,reject)=>{
        s3Bucket.upload(params,async(err,response)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(response.Location);
            }
        });
    })
}

module.exports={uploadToS3,}