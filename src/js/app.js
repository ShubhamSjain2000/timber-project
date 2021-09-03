
App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,

    init: function() {
        console.log("App initialized...")
        return App.initWeb3();
      },
    
      initWeb3: function() {
        
        if (typeof web3 !== 'undefined') {
          
          

          // If a web3 instance is already provided by Meta Mask.
          App.web3Provider = web3.currentProvider;
          
          web3 = new Web3(web3.currentProvider);
          
          

        } else {
          
          App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
          web3 = new Web3(App.web3Provider);
          
        }
        
        return App.initContracts();
      
      
      },


      initContracts:  function() {
        
          $.getJSON("TimberSale.json" , function(timberSale) {
            
              App.contracts.TimberSale = TruffleContract(timberSale);
              App.contracts.TimberSale .setProvider(web3.currentProvider);
              App.contracts.TimberSale.deployed().then(function(timberSale) {
                    console.log("address of contract",timberSale.address);
                    
                    App.account = timberSale.address;
                    
                    
                    return timberSale.tokenPrice() ;

               }).then(function(tokenPrice) {
                 

               })
              })
              .done(function(){
                $.getJSON("Timber.json" , function(timber) {
                  App.contracts.Timber = TruffleContract(timber);
                  App.contracts.Timber .setProvider(web3.currentProvider);
                  App.contracts.Timber.deployed().then(function(timber) {
                        console.log("address of contract",timber.address);
                   })
                   App.listenForEvents();
                   return App.render();

                })

               });



        

      },

      listenForEvents: function() {
        App.contracts.TimberSale.deployed().then(function(instance) {
          instance.Sell({}, {
            fromBlock: 0,
            toBlock: 'latest',
          }).watch(function(error, event) {
            console.log("event triggered", event);
            App.render();
          })
        })
      },

      render: function() {
        if (App.loading) {
          return;
        }
        App.loading = true;
    
        var loader  = $('#loader');
        var content = $('#content');
    
        loader.show();
       
    
        // Load account data
        web3.eth.getCoinbase(function(err, account) {
          if(err === null) {
            
            
            $('#accountAddress').html("Your Account: " + account);
            App.account = account;
          }
        })
        App.contracts.TimberSale.deployed().then(function(instance) {
            timberSale = instance;
            return timberSale.tokenPrice(); 
        }).then(function(tokenPrice) {
          App.tokenPrice = tokenPrice;
          
          console.log(tokenPrice.toNumber())
          $('.token-price').html("price :" + web3.fromWei(App.tokenPrice , "ether"  ).toNumber());
          return timberSale.tokensSold()
        }).then(function(tokensSold) {
          App.tokensSold = tokensSold.toNumber();
          console.log("sold tokens" + App.tokensSold)
          $(".tokens-sold").html(+ App.tokensSold);
          var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');
          
      App.contracts.Timber.deployed().then(function(instance) {
        timber = instance;
        console.log(App.account)
        
        return timber.balanceOf(App.account);

      }).then(function(balance) {
          console.log("balance is " , + balance);
          $('.dapp-balance').html(balance.toNumber());
      })


        })
    
      },
      buyTokens: function() {
        var numberOfTokens = $('#numberOfTokens').val();
        App.contracts.TimberSale.deployed().then(function(instance) {
          return instance.buyTokens(numberOfTokens, { from: App.account , value: numberOfTokens * App.tokenPrice, gas:500000});
        }).then(function(result) {
          console.log("bought")
          
        })
      }

    
}
$(function() {
  $(window).load(function() {
    App.init();
  })
});