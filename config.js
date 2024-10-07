// config file

module.exports.CreateDB = true;

module.exports.Config = {
  // commented out gov. jobs
  jobList: [
    { name: "Blacksmith", value: "blacksmith" },
    // {name: 'DOJ', value: 'lawyer'},
    { name: "Gunsmith", value: "gunsmith" },
    { name: "Horse Trainer", value: "horsetrainer" },
    // {name: 'LEO', value: 'leo'},
    // {name: 'Doctor', value: 'doctor'},
    { name: "Naturalist", value: "naturalist" },
    { name: "Publishing", value: "publishing" },
    // {name: 'Railroad', value: 'train'},
    { name: "Saloon", value: "saloon" },
    { name: "Miscellaneous", value: "misc" },
  ],
};

module.exports.Roles = {
  Admin: "",
  Mod: "",
};

module.exports.Channels = {
  logs: "",
  marketplace: "",
  warnings: "",
  closures: "",
  openings: "",
  rules: "",
};
