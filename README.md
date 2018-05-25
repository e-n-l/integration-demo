# Description

node / express.js github integration offering a single endpoint (/user) which will display the user's public repos sorted by number of open pull requests.

# Usage

0. copy / rename `default_config.json` to `config.json` and fill in the relevant values so you can avoid hitting the anonymous GitHub API limits.

1. `npm install`

2. `node app.js`

3. direct your browser to localhost:3000/user/:username 
