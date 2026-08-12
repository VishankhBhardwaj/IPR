const { askDatabase } = require("./sqlAgent");

async function test() {

  try {

    const answer = await askDatabase(
      "How many patents were filed in 2024?"
    );

    console.log("ANSWER:");
    console.log(answer);

  } catch (error) {

    console.error("ERROR:");
    console.error(error);

  }
}

test();