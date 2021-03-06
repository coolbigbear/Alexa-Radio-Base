const AWS = require("aws-sdk")

const SKILL_ID = process.env.AWS_LAMBDA_FUNCTION_NAME;

async function getStationInfo() {
	// 1. Assume the AWS resource role using STS AssumeRole Action
	const STS = new AWS.STS()
	const credentials = await STS.assumeRole(
		{
			RoleArn: "arn:aws:iam::256885192842:role/AlexaDynamoDBFullAccess",
			RoleSessionName: "ReadRadioInfo", // You can rename with any name
		},
		(err, res) => {
			if (err) {
				console.log("AssumeRole FAILED: ", err)
				throw new Error("Error while assuming role")
			}
			return res
		}
	).promise()

	// 2. Make a new DynamoDB instance with the assumed role credentials
	//    and scan the DynamoDB table
	const dynamoDB = new AWS.DynamoDB({
		apiVersion: "2012-08-10",
		accessKeyId: credentials.Credentials.AccessKeyId,
		secretAccessKey: credentials.Credentials.SecretAccessKey,
		sessionToken: credentials.Credentials.SessionToken,
		region: `eu-north-1`
	})

	const params = {
		TableName: "alexa-radios",
		KeyConditionExpression: "radioID = :radioID",
		ExpressionAttributeValues: {
			":radioID": { "S": SKILL_ID}
		}
	}

	const tableData = await dynamoDB.query(params, (err, data) => {
		// console.log(`DEV --- ${JSON.stringify(params)}`)
		if (err) {
			console.log("Query FAILED", err);
			throw new Error("Error while querying table")
		}

		return data
	}).promise()

	// console.log(`DEV --- ${JSON.stringify(tableData)}`)
	let unpacked = AWS.DynamoDB.Converter.unmarshall(tableData.Items[0])

	return unpacked

}

module.exports = { getStationInfo }
