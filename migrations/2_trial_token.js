const TrialToken = artifacts.require("TrialToken");

module.exports = function (deployer) {
  deployer.deploy(TrialToken);
};
