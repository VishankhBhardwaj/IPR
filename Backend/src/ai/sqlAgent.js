const { ChatGroq } = require("@langchain/groq");
const { DataSource } = require("typeorm");

const { SqlDatabase } = require("@langchain/classic/sql_db");

const {
  SqlToolkit,
  createSqlAgent,
} = require("@langchain/classic/agents/toolkits/sql");

require("dotenv").config();

let agentExecutor = null;

async function getAgent() {


  if (agentExecutor) {
    return agentExecutor;
  }


  const dataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3305),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await dataSource.initialize();

  const db = await SqlDatabase.fromDataSourceParams({
    appDataSource: dataSource,

    includesTables: [
      "user",
      "patent",
      "patentinventor",
      "department",
      "inventordepartment",
    ],

    sampleRowsInTableInfo: 1,
  });

  const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature: 0,
  });

  const toolkit = new SqlToolkit(db, llm);

  agentExecutor = createSqlAgent(
    llm,
    toolkit,
    {
      topK: 5,
    }
  );

  return agentExecutor;
}


async function askDatabase(question) {

  const agent = await getAgent();

  const result = await agent.invoke({
    input: question,
  });

  return result.output;
}


module.exports = {
  askDatabase,
};