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

	console.log(`DEV --- ${SKILL_ID}`)

	const params = {
		TableName: "alexa-radios",
		KeyConditionExpression: "radioID = :radioID",
		ExpressionAttributeValues: {
			":radioID": { "S": SKILL_ID}
		}
	}

	const tableData = await dynamoDB.query(params, (err, data) => {
		console.log(`DEV --- ${JSON.stringify(params)}`)
		if (err) {
			console.log("Query FAILED", err);
			throw new Error("Error while querying table")
		}

		return data
	}).promise()


	// const dynamoDB = new AWS.DynamoDB({
	// 	apiVersion: '2012-08-10',
	// 	accessKeyId: credentials.Credentials.AccessKeyId,
	// 	secretAccessKey: credentials.Credentials.SecretAccessKey,
	// 	sessionToken: credentials.Credentials.SessionToken,
	// 	region: `eu-north-1`
	// });
	// const tableData = await dynamoDB.scan({ TableName: 'alexa-radios' }, (err, data) => {
	// 	if (err) {
	// 		console.log('Scan FAILED', err);
	// 		throw new Error('Error while scanning table');
	// 	}
	// 	return data;
	// }).promise();
	console.log(`DEV --- ${JSON.stringify(tableData)}`)
	let unpacked = await AWS.DynamoDB.Converter.unmarshall(tableData)
	console.log(`DEV --- ${JSON.stringify(unpacked)}`)
	console.log(`DEV --- ${unpacked}`)
	console.log(unpacked)
	console.log(JSON.stringify(unpacked))
	console.log(console.dir(unpacked, { depth: null }))
	const util = require('util')

	console.log(util.inspect(unpacked, { showHidden: false, depth: null }))

	return tableData

	// ... Use table data as required ...
}

module.exports = { getStationInfo }
