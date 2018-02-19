# Template of SDExplorer
- Homepage of SDExplorer: https://lyukx.github.io/SDExplorer/

This is a template of SDExplorer demo using `node.js`, `express` and `mongodb`. You can use this template to build large-scale Sequence diagrams using database.
## Quick Start
1. Download or clone this repository:
```bash
git clone https://github.com/Lyukx/template-of-SDExplorer
```

2. Be sure you have installed `node.js` and `mongodb`. If not, refer to the homepage:
  - https://nodejs.org/
  - https://www.mongodb.com/

3. Start mongodb with local service:
```bash
mongod --dbpath=<your-database-path>
```

4. Install requirements by node.js package manager `npm`, and setup database.
```bash
npm install
npm run setup
```

5. start server.
```bash
npm start
```

You can see the result in http://localhost:3000/

## Create a new demo
Configurable options are listed in `./config/default.json`. You can modify it to create your own demonstration. Refer [project wiki](https://github.com/Lyukx/SDExplorer/wiki/Link-to-Database) to see the data format.

```json
{
  "SDExplorerDemo": {
    "dbUri": "<Your mongod database uri>",
    "demoName": "<Your demo name>"
  }
}
```

We prepare a fragment of `jPacMan` demonstration (5000 messages here, and over 2 million messages in the full version) in `./database/json`. You can import them into a mongodb collection `pacManSequenceDiagram` (refer to [official guide](https://docs.mongodb.com/manual/reference/program/mongoimport/)). And modify `default.json` like this:
```json
{
  "SDExplorerDemo": {
    "dbUri": "mongodb://localhost:27017/pacManSequenceDiagram",
    "demoName": "PacMan Demo"
  }
}
```
Then see the result in http://localhost:3000/
