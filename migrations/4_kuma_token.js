const KumaToken = artifacts.require("KumaToken");

module.exports = function (deployer) {
  deployer.deploy(KumaToken);
};
