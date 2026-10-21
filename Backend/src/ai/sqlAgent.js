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


  // const dataSource = new DataSource({
  //   type: "postgres",
  //   host: process.env.DB_HOST,
  //   port: Number(process.env.DB_PORT || 5432),
  //   username: process.env.DB_USER,
  //   password: process.env.DB_PASSWORD,
  //   database: process.env.DB_NAME,
  //   ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  // });
  const dataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
  await dataSource.initialize();
  console.log("Database connected successfully");

const result = await dataSource.query(
  "SELECT current_database(), current_user"
);

console.log(result);
  const db = await SqlDatabase.fromDataSourceParams({
    appDataSource: dataSource,

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
  try {
    const agent = await getAgent();

    const result = await agent.invoke({
      input: question,
    });

    return result.output;
  } catch (error) {
    console.error("SQL Agent Error:", error.message);
    throw error;
  }
}


module.exports = {
  askDatabase,
};
