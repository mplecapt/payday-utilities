# Payday Progress Utilities
A web app to help you track your progress through Payday's countless achievements. Check out the live build [here](https://mplecapt.github.io/payday-utilities).

## Local Deployment
In order to deploy the source locally, you must generate an amplify configuration...

`amplify init`

and provide a [Steam API key](https://steamcommunity.com/dev/apikey).
Store the key using this command from the src folder (replace *%API_KEY%* with the actual key).

`echo export default "%API_KEY%" > ./steam.js`