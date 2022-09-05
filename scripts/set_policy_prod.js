// Load the AWS SDK for Node.js
const AWS = require('aws-sdk')
// Set the region
AWS.config.update({ region: 'us-east-1' })

// Create S3 service object
const s3 = new AWS.S3({ apiVersion: '2006-03-01' })

let readOnlyAnonUserPolicy = {
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'AddPerm',
      Effect: 'Allow',
      Principal: {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity E3NE648EWWAN4L"
    },
      Action: ['s3:GetObject'],
      Resource: [''],
    },{
      Sid: "Fe deny write",
      Effect: "Deny",
      Principal: "*",
      Action: "s3:PutObject",
      Resource: [
        "arn:aws:s3:::ftct-dashboard-fe-prod",
        "arn:aws:s3:::ftct-dashboard-fe-prod/*"
      ],
      Condition: {
        StringNotLike: {
          "aws:PrincipalArn": "arn:aws:iam::581736890423:user/FE-CI"
        }
      }
    }
  ],
}

// create selected bucket resource string for bucket policy
const bucketName = 'ftct-dashboard-fe-' + process.argv[2]
const bucketResource = 'arn:aws:s3:::' + bucketName + '/*'
console.log(bucketResource)
readOnlyAnonUserPolicy.Statement[0].Resource[0] = bucketResource

// convert policy JSON into string and assign into params
var bucketPolicyParams = { Bucket: bucketName, Policy: JSON.stringify(readOnlyAnonUserPolicy) }

// set the new policy on the selected bucket
s3.putBucketPolicy(bucketPolicyParams, function (err, data) {
  if (err) {
    // display error message
    console.log('Error', err)
  } else {
    console.log('Success', data)
  }
})
