const app = require("./app");
const dotenv = require("dotenv");

const connectDataBase = require("./database/database.js");

//Handling Uncaught exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Uncaught exception`);
  process.exit(1);
});

//Config
dotenv.config({ path: "database/config.env" });

//Connecting to database
connectDataBase();

const Port = process.env.PORT || 3000;

const server = app.listen(4000, () => {
  console.log(`Server is running`);
});

//Unhandled Promise rejections
//This may occur if we miss handle the connection strings

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Unhandled Promise rejections`);

  server.close(() => {
    process.exit(1);
  });
});
