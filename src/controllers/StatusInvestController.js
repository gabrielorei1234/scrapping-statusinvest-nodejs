const statusInvestService = require("../services/StatusInvestService");
const axios = require("axios");

class StatusInvestController {
  async downloadAssetsDataInCSV() {
    console.log("Downloading assets");
    await new statusInvestService().downloadAssetsDataInCSV();
  }

  async downloadRealEstateInvestmentFundsDataInCSV() {
    console.log("Downloading Real Estate Investment Funds");
    await new statusInvestService().downloadRealEstateInvestmentFundsDataInCSV();
  }
}

module.exports = StatusInvestController;
