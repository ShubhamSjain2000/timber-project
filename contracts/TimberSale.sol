pragma solidity ^0.5.16;
import "./Timber.sol";

contract TimberSale {
    address admin;
    Timber public tokenContract;
    uint256 public tokenPrice ;
    uint256 public tokensSold = 0 ;
    event Sell(address indexed _buyer, uint256 _amount);

    constructor(Timber _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
        //require(tokenPrice == 0);
    }

    function multiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
        z = x * y;
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value >= 0 );
        
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens ) ;
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        tokensSold += _numberOfTokens;
        //tokenContract.balanceOf[msg.sender] += _numberOfTokens;
        emit Sell(msg.sender, _numberOfTokens);
       // return true;
    }

    function endSale() public {
        require(msg.sender == admin);
        //require(tokenContract.balanceOf(address(this)) == 0);
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        
    }
}

