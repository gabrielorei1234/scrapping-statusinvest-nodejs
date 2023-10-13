const StatusInvestController = require("./src/controllers/StatusInvestController");

async function init() {
  await new StatusInvestController().downloadAssetsDataInCSV();
  await new StatusInvestController().downloadRealEstateInvestmentFundsDataInCSV();
}

init();
