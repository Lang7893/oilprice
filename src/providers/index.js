const { getBangchakPrices } = require("./bangchak");
const { getGoldPrices } = require("./gold");

async function getOilPrices() {
  const providers = await Promise.all([getBangchakPrices(), getGoldPrices()]);
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
