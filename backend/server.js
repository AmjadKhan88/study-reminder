require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { ensureIndex } = require("./src/config/pinecone");

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => ensureIndex())
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Startup error:", err);
    process.exit(1);
  });
