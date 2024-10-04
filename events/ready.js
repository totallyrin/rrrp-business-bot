const { Events } = require("discord.js");
const { Businesses, Employees } = require("../utils/Businesses");

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
  },
};
