var TimberSale = artifacts.require("./TimberSale.sol")
var Timber = artifacts.require("./Timber.sol")
contract("TimberSale", accounts => {

    var tokenSaleInstance;
    var tokenInstance;
    var tokenPrice = 1000000000000000;
    var buyer = accounts[1];
    var admin = accounts[0];
    var tokensAvailable = 750000;

    it("inititalize contracts the way we expect", function() {
        return TimberSale.deployed().then(function(instance) {
            tokenSaleInstance = instance;
            return tokenSaleInstance.address

        }).then(function (addresss) {
            assert.notEqual, 0x0, 'timbersale is address is present'
            return tokenSaleInstance.tokenContract();
        }).then(function (addresss) {
            assert.notEqual, 0x0, 'timbersale has timber contract '
            return tokenSaleInstance.tokenPrice();


        }).then(function (price) {
            assert.equal(price, tokenPrice, 'token Price is correct')
        });
    });

    it("buys tokens", function() {
        
        return Timber.deployed() 
    .then(function(instance) {
            
            tokenInstance = instance;
            return TimberSale.deployed()
        }).then(function(instance) {
            
            


            tokenSaleInstance = instance;

            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin });
        }).then(function(receipt) {

            assert.equal(receipt.logs[0].event, 'Transfer', "should be the 'transfer' event ");
            assert.equal(receipt.logs[0].args._value , tokensAvailable , "to is not working event ");
        
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance) {
            assert.equal(balance,tokensAvailable, " done")
            
            numberOfTokens = 10;

            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 10000000000000000 });
        }).then(function(receipt) {
            
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Sell', "should be the 'transfer' event ");
            assert.equal(receipt.logs[0].args._buyer, buyer, "buyer is fine");
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, "amount is fine");
            

        

            return tokenSaleInstance.tokensSold();

        }).then(function(amount) {
            assert.equal(amount, numberOfTokens, "sold tokens is equal to requested tokens");
            return tokenInstance.balanceOf(tokenSaleInstance.address)
        })
            .then(function (amount) {
                assert.equal(amount.toNumber(), 749990, "balance is changed")
                return tokenInstance.balanceOf(buyer)
            }).then(function (amount) {
                assert.equal(amount, 10 , " buyer balance is changed")




                return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 })
            }).then(assert.fail).catch(function (error) {
                assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number')
                return tokenSaleInstance.buyTokens(800000, { from: buyer, value: numberOfTokens * tokenPrice })
            }).then(assert.fail).catch(function (error) {
                assert(error.message.indexOf('revert') >= 0, 'more number')
            })


    })

    it('ends token sale', function() {
        return Timber.deployed().then(function(instance) {
          
          tokenInstance = instance;
          return TimberSale.deployed();
        }).then(function(instance) {
         
          tokenSaleInstance = instance;
          
          return tokenSaleInstance.endSale({ from: buyer });
        }).then(assert.fail).catch(function(error) {
          assert(error.message.indexOf('revert' >= 0, 'must be admin to end sale'));
          //return tokenInstance.balanceOf()
          return tokenSaleInstance.endSale({ from: admin });
        }).then(function(receipt) {

          return tokenInstance.balanceOf(admin);
        }).then(function(balance) {
          assert.equal(balance.toNumber(), 999990, 'returns all unsold Timbers to admin');
         
          return web3.eth.getBalance(tokenSaleInstance.address)
        }).then(function(balance) {
          assert.equal(balance, 10000000000000000, " balance is correct");
        });
      });
})



