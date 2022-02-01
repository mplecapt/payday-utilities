package main

import (
	"bytes"
	"context"
	"encoding/json"
	"io/ioutil"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

type Response events.APIGatewayProxyResponse

func callSteam(function, version, apikey, appid, steamid string) ([]byte, error) {
	data, err := http.Get("https://api.steampowered.com/ISteamUserStats/" + function + "/" + version + "/?key=" + apikey + "&appid=" + appid + "&steamid=" + steamid)
	if err != nil {
		return nil, err
	}

	body, err := ioutil.ReadAll(data.Body)
	if err != nil {
		return nil, err
	}

	return body, nil
}

func Handler(ctx context.Context, request events.APIGatewayProxyRequest) (Response, error) {
	var buf bytes.Buffer
	function := request.PathParameters["function"]
	version := request.PathParameters["version"]
	apikey := request.PathParameters["apikey"]
	appid := request.PathParameters["appid"]
	steamid := request.PathParameters["steamid"]

	body, err := callSteam(function, version, apikey, appid, steamid)
	if err != nil {
		return Response{StatusCode: 404}, err
	}
	json.HTMLEscape(&buf, body)

	resp := Response{
		StatusCode:      200,
		IsBase64Encoded: false,
		Body:            buf.String(),
		Headers: map[string]string{
			"Content-Type":                 "application/json",
			"X-MyCompany-Func-Reply":       "hello-handler",
			"Access-Control-Allow-Origin":  "*",
			"Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
			"Access-Control-Allow-Headers": "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization",
		},
	}

	return resp, nil
}

func main() {
	lambda.Start(Handler)
}
