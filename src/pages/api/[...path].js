const app = require("../../../backend/server");
module.exports = app;
module.exports.config = {
  api: {
    bodyParser: false,
  },
};