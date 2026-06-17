require("dotenv").config();
const PORT = process.env.PORT || 5000;
const app = require("./src/app");



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});