var Timber = artifacts.require("./Timber.sol");
var TimberSale = artifacts.require("./TimberSale.sol");


module.exports = function (deployer) {
  deployer.deploy(Timber,1000000)
  .then(function() {
    var tokenPrice = 1000000000000000;
    return deployer.deploy(TimberSale, Timber.address , tokenPrice );

  })
};
