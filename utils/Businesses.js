const Sequelize = require("sequelize");

// DB connection information
const sequelize = new Sequelize("database", "user", "password", {
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  storage: "database.sqlite",
});

module.exports.Businesses = sequelize.define("businesses", {
  name: {
    type: Sequelize.STRING,
    unique: true,
  },
  type: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  owner: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  last_opened: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: false,
  },
  open_image: {
    type: Sequelize.BLOB,
    allowNull: true,
  },
  closed_image: {
    type: Sequelize.BLOB,
    allowNull: true,
  },
});

module.exports.Employees = sequelize.define("employees", {
  userid: {
    type: Sequelize.STRING,
    unique: false,
  },
  business_id: {
    type: Sequelize.INTEGER,
    references: {
      model: "businesses",
      key: "id",
    },
    onDelete: "CASCADE",
  },
});
