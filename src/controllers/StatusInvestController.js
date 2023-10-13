const statusInvestService = require("../services/StatusInvestService");
const axios = require("axios");

class StatusInvestController {
  async downloadAssetsDataInCSV() {
    console.log("Downloading assets");
    await new statusInvestService().downloadAssetsDataInCSV();
  }
}

module.exports = StatusInvestController;
