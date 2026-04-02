const { getBangchakPrices } = require("./bangchak");
const { getPttPrices } = require("./ptt");

async function getOilPrices() {
  const providers = await Promise.all([getBangchakPrices(), getPttPrices()]);
  const availableProviders = providers.filter((provider) => provider.status === "ok").length;

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalProviders: providers.length,
      availableProviders,
      unavailableProviders: providers.length - availableProviders
    },
    providers
  };
}

module.exports = {
  getOilPrices
};
