var Timber = artifacts.require("./Timber.sol")
contract("Timber", accounts => {

    it("contract name and stuff", function(){
        return Timber.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function(nameoftoken) {
            assert.equal(nameoftoken,"Timber CryptoCurrency","name is correct");
            return tokenInstance.symbol();
        }).then(function(symb) {
            assert.equal(symb,"TIM","symbol is correct");
        });
    })

    it("sets the total supply", function () {
        return Timber.deployed().then(function (instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function (totalSupply) {
            assert.equal(totalSupply.toNumber(), 1000000, "total supply is correct");
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(adminBalance) {
            assert.equal(adminBalance.toNumber(), 1000000, "the first acc has all the tokens in the begining");
        });

        });

    it('send and recieve tokens', async function() {
        return Timber.deployed().then(async function (instance) {
            tokenInstance = instance;
            return tokenInstance.transfer.call(accounts[1],9999999999);

    }).then(assert.fail).catch(async function(error) {
        assert(error.message.indexOf('revert') >= 0,'error message');
        return await tokenInstance.transfer( accounts[1] , 25000 , { from: accounts[0] });
    }).then(function(reciept) { 
        assert.equal(reciept.logs.length,1,'triggers one event');
        assert.equal(reciept.logs[0].event,'Transfer',"should be the 'transfer' event ");
        assert.equal(reciept.logs[0].args._from , accounts[0],"from is fine" );
        assert.equal(reciept.logs[0].args._to , accounts[1],"from is fine" );
        assert.equal(reciept.logs[0].args._value,25000,"value is fine");

        
        return tokenInstance.balanceOf(accounts[1]);
    }).then(function(balance){
        assert.equal(balance,25000,"second account got the timbers")
        return tokenInstance.balanceOf(accounts[0])
    }).then(function(balance){
        assert.equal(balance,1000000-25000,"subtracted for first")
    })

    });

    it("approves transfer",function() {
        return Timber.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100);


        }).then(function(success) {
            assert.equal(success, true , 'approved');
            return tokenInstance.approve(accounts[1],100, {from: accounts[0] })
        }).then(function(reciept){
        assert.equal(reciept.logs.length,1,'triggers one event');
        assert.equal(reciept.logs[0].event,'Approval',"should be the 'Approve' event ");
        assert.equal(reciept.logs[0].args._owner, accounts[0],"owner is fine" );
        assert.equal(reciept.logs[0].args._spender , accounts[1],"spender is fine" );
        assert.equal(reciept.logs[0].args._value,100,"value is fine");
        return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function(allowance) {
            assert.equal(allowance,100,'mapping is storing the allowance');

        })
    })

    it("transfers from different account", function() {
        return Timber.deployed().then(function(instance){
            tokenInstance = instance;
            fromAccount = accounts[2]
            toAccount = accounts[3]
            spendingAccount = accounts[4]
            return tokenInstance.transfer(fromAccount, 100 , { from: accounts[0] })
        }).then(function(reciept) {
            return tokenInstance.approve(spendingAccount, 10 , { from: fromAccount })

        }).then(function(reciept) {
            return tokenInstance.transferFrom(fromAccount, toAccount , 1000 ,{ from: spendingAccount } )
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0,'cannot transfer more than balance' )
            return tokenInstance.transferFrom(fromAccount , toAccount, 20 , { from: spendingAccount  })
        
        
        
    }).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') >= 0,'cannot transfer more than allowance' )
        return tokenInstance.transferFrom.call(fromAccount, toAccount, 5 , { from: spendingAccount })
}).then(function(success) {
    assert.equal(success , true , " passing bammmm");
    return tokenInstance.transferFrom(fromAccount , toAccount , 5 , { from: spendingAccount });
}).then(function(reciept) {
    assert.equal(reciept.logs.length,1,'triggers one event');
        assert.equal(reciept.logs[0].event,'Transfer',"should be the 'Approve' event ");
        assert.equal(reciept.logs[0].args._from, fromAccount , "from is fine" );
        assert.equal(reciept.logs[0].args._to , toAccount ,"to is fine" );
        assert.equal(reciept.logs[0].args._value , 5 ,"value is fine");
        return tokenInstance.balanceOf(fromAccount);
        

}).then(function(balance) {
    assert.equal(balance.toNumber(), 95 , 'deducted');
    return tokenInstance.balanceOf(toAccount);

}).then(function(balance) {

    assert.equal(balance.toNumber(), 5 , 'Got balance');
    return tokenInstance.allowance(fromAccount, spendingAccount);

}).then(function(allowance) {
    assert.equal(allowance.toNumber() , 5 , 'deducts the amount allowance');    
})
})
})



