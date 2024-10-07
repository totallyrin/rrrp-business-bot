const { Events } = require("discord.js");
const { Businesses, Employees } = require("../utils/db");
const { startTimer } = require("../utils/timer");
const { CreateDB } = require("../config");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    Businesses.sync({ force: CreateDB }).then(async () => {
      Employees.sync({ force: CreateDB }).then(async () => {
        console.log("Database synced");
      });
    });
    console.log(`Ready! Logged in as ${client.user.tag}`);
    startTimer(client)
      .then(() => console.log("Timer started"))
      .catch((error) => console.error(error));
  },
};
