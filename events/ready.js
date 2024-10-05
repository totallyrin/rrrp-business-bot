const { Events } = require("discord.js");
const { Businesses, Employees } = require("../utils/db");
const { startTimer } = require("../utils/timer");

const createdb = false;

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    Businesses.sync({ force: createdb }).then(async () => {
      Employees.sync({ force: createdb }).then(async () => {
        console.log("Database synced");
      });
    });
    console.log(`Ready! Logged in as ${client.user.tag}`);
    startTimer(client)
      .then(() => console.log("Timer started"))
      .catch((error) => console.error(error));
  },
};
