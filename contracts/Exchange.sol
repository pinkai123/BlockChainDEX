pragma solidity ^0.6.10;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

/**
 * @dev Example of the ERC20 Token.
 */
contract ExchangePair{

    event Sold(uint256 tokenA_amount,uint256 tokenB_amount);
	event Done(string smth);
	event PairAdded(string tokenA_symbol, string tokenB_symbol);
	event exchnage_rate(uint exchnage_rate);
	event percentage_update(uint percentage_fill, uint order_tokenA_amount,uint tokenA_original_Amount);
	event order_amount(uint order_tokenA_amount,uint order_tokenB_amount);

	using SafeMath for uint256;
	// Accuracy our exhange can handle. 2 decimal place //
	uint decimal_point = 1000; 

	ERC20 public tokenA;
	address public tokenA_address;
	string public tokenA_symbol;

	ERC20 public tokenB;
	address public tokenB_address;
	string public tokenB_symbol;

	uint  public counter;
	address public pair_address;

	 struct Order {
		uint id;
        address owner_Address;
        uint tokenA_Amount;
        uint tokenB_Amount;
		uint tokenA_original_Amount;
		uint tokenB_original_Amount;
		uint percentage_fill;
        uint exchange;
		uint current_time;
    }

    Order[] public buyorderList;
    Order[] public sellorderList;

	constructor (address _tokenA_address, address _tokenB_address) public {
		tokenA_address = _tokenA_address;
		tokenA = ERC20(_tokenA_address);
		tokenA_symbol = tokenA.symbol();

		tokenB_address = _tokenB_address;
		tokenB = ERC20(_tokenB_address);
		tokenB_symbol = tokenB.symbol();

		pair_address = address(this);
		counter = 0;
		emit PairAdded(tokenA_symbol,tokenB_symbol);

	}

	function getTokenA() public view returns (ERC20) {
        return tokenA;
    }
	function getTokenB() public view returns (ERC20) {
        return tokenB;
    }
	function getTokenA_symbol() public view returns (string memory) {
        return tokenA_symbol;
    }
	function getTokenB_symbol() public view returns (string memory) {
        return tokenB_symbol;
    }
	function getListsize() public view returns (uint) {
        return buyorderList.length + sellorderList.length;
    }

	function executeOrder(address tokenA_owner_address,uint256 tokenA_amount,address tokenB_owner_address,uint256 tokenB_amount) public {
		require(tokenA_amount > 0, "You need to sell at least some token_A");
		require(tokenB_amount > 0, "You need to sell at least some token_B");

		uint256 tokenA_owner_balance = tokenA.balanceOf(tokenA_owner_address);
		uint256 tokenB_owner_balance = tokenB.balanceOf(tokenB_owner_address);
		require(tokenA_owner_balance >= tokenA_amount, "The tokenA_owner does not have enough balance");
		require(tokenB_owner_balance >= tokenB_amount, "The tokenB_owner does not have enough balance");

		tokenA.transferFrom(tokenA_owner_address, tokenB_owner_address, tokenA_amount);
		tokenB.transferFrom(tokenB_owner_address, tokenA_owner_address, tokenB_amount);
		emit Sold(tokenA_amount,tokenB_amount);
	}


	function addOrder(address _owner_address,uint256 _tokenA_amount,uint256 _tokenB_amount,bool buy) public{
		emit Done("Adding Order ....");
		counter++;
		Order memory test;
		test.id = counter;
        test.owner_Address = _owner_address;
        test.tokenA_Amount = _tokenA_amount;
        test.tokenB_Amount = _tokenB_amount;
		test.tokenA_original_Amount = _tokenA_amount;
		test.tokenB_original_Amount = _tokenB_amount;
		test.percentage_fill = 0;
        test.exchange = _tokenB_amount*decimal_point/_tokenA_amount;
		test.current_time = now;
		emit exchnage_rate(test.exchange);
		
		if (buy) {
			buyorderList.push(test);
			insertionAsc();
		}
		else {
			sellorderList.push(test);
			insertionDec();
		}
		emit Done("Order Added");
		checkOrder(buy);
	}

	function checkOrder(bool buy) public{
		emit Done("Checking Order");
		// Limit order profit the newest order //
		// If a buy order came in and it matches, it will execute at the sell price which could be lower than the buy price. //
		// If a sell order came in and it matches, it will execute at the buy price which could be highrt than the sell price. //
		if (buyorderList.length == 0 || sellorderList.length == 0) {
			return;
		}
		Order memory buyorder = buyorderList[buyorderList.length-1];
		Order memory sellorder = sellorderList[sellorderList.length-1];
		uint order_tokenA_amount;
		uint order_tokenB_amount;

		if (buyorder.exchange >= sellorder.exchange){
			if (buyorder.tokenA_Amount >= sellorder.tokenA_Amount){
				order_tokenA_amount = sellorder.tokenA_Amount;
			}
			else {
				order_tokenA_amount = buyorder.tokenA_Amount;
			}
			// This implement limit order profit for the newest order //
			if (buy){
					order_tokenB_amount = order_tokenA_amount*sellorder.exchange/decimal_point;
				}
			else {
					order_tokenB_amount = order_tokenA_amount*buyorder.exchange/decimal_point;
				}
			
			// Execute order //
			emit order_amount(order_tokenA_amount,order_tokenB_amount);
			executeOrder(sellorder.owner_Address,order_tokenA_amount,buyorder.owner_Address,order_tokenB_amount);

			// Update order after execution //
			buyorderList[buyorderList.length-1].tokenA_Amount -= order_tokenA_amount;
			buyorderList[buyorderList.length-1].tokenB_Amount -= order_tokenB_amount;
			sellorderList[sellorderList.length-1].tokenA_Amount -= order_tokenA_amount;
			sellorderList[sellorderList.length-1].tokenB_Amount -= order_tokenB_amount;

			// Update percentage filled //
			uint tokenA_differece = buyorder.tokenA_original_Amount-buyorderList[buyorderList.length-1].tokenA_Amount;
			uint tokenB_difference = sellorder.tokenB_original_Amount-sellorderList[sellorderList.length-1].tokenB_Amount;
			buyorderList[buyorderList.length-1].percentage_fill = tokenA_differece*100/buyorder.tokenA_original_Amount;
			sellorderList[sellorderList.length-1].percentage_fill = tokenB_difference*100/sellorder.tokenB_original_Amount;

			emit percentage_update(buyorder.percentage_fill,order_tokenA_amount,buyorder.tokenA_original_Amount);
			emit percentage_update(sellorder.percentage_fill,order_tokenB_amount,sellorder.tokenB_original_Amount);

			// If order is fully filled, remove the order // 
			if(buyorderList[buyorderList.length-1].percentage_fill == 100){
				buyorderList.pop();
			}

			if(sellorderList[sellorderList.length-1].percentage_fill == 100){
				sellorderList.pop();
			}

			// Checkorder just in case the order is not fully filled //
			checkOrder(buy);
		}
		emit Done("Order Checked");
	}

	function insertionDec() public payable {
		uint length = buyorderList.length;
			for (uint i = 1; i < length; i++) {
				Order memory key = buyorderList[i];
				uint j = i - 1;
				while ((int(j) >= 0) && (buyorderList[j].exchange >= key.exchange)) {
					if (buyorderList[j].exchange == key.exchange){
						if (buyorderList[j].current_time < key.current_time){
							buyorderList[j + 1] = buyorderList[j];
						}
						else{
							break;
						}
					}
					else{
						buyorderList[j + 1] = buyorderList[j];
					}
					j--;
				}
				buyorderList[j + 1] = key;
			}
	}

	function insertionAsc() public payable {
		uint length = sellorderList.length;
		for (uint i = 1; i < length; i++) {
			Order memory key = sellorderList[i];
			uint j = i - 1;
			while ((int(j) >= 0) && (sellorderList[j].exchange <= key.exchange)) {
				if (sellorderList[j].exchange == key.exchange){
					if (sellorderList[j].current_time < key.current_time){
						sellorderList[j + 1] = sellorderList[j];
					}
					else{
						break;
					}
				}
				else{
					sellorderList[j + 1] = sellorderList[j];
				}
				j--;
			}
			sellorderList[j + 1] = key;
		}
	}

	function uintToString(uint _i) internal pure returns (string memory str) {
		if (_i == 0) {
			return "0";
		}
		uint j = _i;
		uint len;
		while (j != 0) {
			len++;
			j /= 10;
		}
		bytes memory bstr = new bytes(len);
		uint k = len - 1;
		while (_i != 0) {
			bstr[k--] = byte(uint8(48 + _i % 10));
			_i /= 10;
		}
		return string(bstr);
    }

	function addressToString(address _pool) public pure returns (string memory _uintAsString) {
		uint _i = uint256(_pool);
		if (_i == 0) {
			return "0";
		}
		uint j = _i;
		uint len;
		while (j != 0) {
			len++;
			j /= 10;
		}
		bytes memory bstr = new bytes(len);
		uint k = len - 1;
		while (_i != 0) {
			bstr[k--] = byte(uint8(48 + _i % 10));
			_i /= 10;
		}
		return string(bstr);
	}

	function getidList(address _owner_address) public view returns (uint[] memory){
		uint size = getListsize();
		uint[] memory idList = new uint[](size);
		for (uint j=0; j < buyorderList.length; j++) {
			if (buyorderList[j].owner_Address == _owner_address){
				idList[idList.length-1] = buyorderList[j].id;
			}
		}
		for (uint j=0; j < sellorderList.length; j++) {
			if (sellorderList[j].owner_Address == _owner_address){
				idList[idList.length-1] = sellorderList[j].id;
			}
		}
		return idList;
	}

	function getPercentage(uint _id) public view returns (uint){
		bool locate = false;
		Order memory order;
		//string[] memory Stringorder = new string[](4);
		for (uint j=0; j < buyorderList.length; j++) {
			if (_id == buyorderList[j].id){
				order = buyorderList[j];
				locate = true;
				break;
			}
		}
		if (!locate){
			for (uint j=0; j < sellorderList.length; j++) {
				if (_id == sellorderList[j].id){
					order = sellorderList[j];
					locate = true;
					break;
				}
			}
		}
		if(!locate){
			// No id. Assume that order is already filled and remove from orderList //
			return 100;
		}
		// Stringorder.push(uintToString(order.id));
		// Stringorder.push(addressToString(order.address));
		// Stringorder.push(uintToString(order.tokenA_original_Amount));
		// Stringorder.push(uintToString(order.percentage_fill));

		return order.percentage_fill;
	}
	function getexchangeRate(uint _id) public view returns (uint){
		bool locate = false;
		Order memory order;
		//string[] memory Stringorder = new string[](4);
		for (uint j=0; j < buyorderList.length; j++) {
			if (_id == buyorderList[j].id){
				order = buyorderList[j];
				locate = true;
				break;
			}
		}
		if (!locate){
			for (uint j=0; j < sellorderList.length; j++) {
				if (_id == sellorderList[j].id){
					order = sellorderList[j];
					locate = true;
					break;
				}
			}
		}
		// Stringorder.push(uintToString(order.id));
		// Stringorder.push(addressToString(order.address));
		// Stringorder.push(uintToString(order.tokenA_original_Amount));
		// Stringorder.push(uintToString(order.percentage_fill));

		return order.exchange/1000;
	}
}

contract DEX{
	mapping(bytes32 => ExchangePair) public Exchange;
	bytes32[] public PairArray;
	uint[] TestArray;
	string name;

	event Done(string smth);

	constructor() public {
		name = "KKS";
	}

	function addPair(bytes32 symbolPair,address tokenA_address, address tokenB_address) public payable{
		ExchangePair NewPair = new ExchangePair(tokenA_address, tokenB_address);
		Exchange[symbolPair] = NewPair;
		PairArray.push(symbolPair);
	}
	function addOrder(bytes32 symbolPair,address owner_address,uint256 tokenA_amount,uint256 tokenB_amount, bool buy) public{
		ExchangePair Pair = Exchange[symbolPair];
		emit Done("Found Pair");

		// if (buy){
		// 	ERC20 TokenB = ERC20(Pair.getTokenB());
		// 	TokenB.approve(address(this),tokenB_amount,{from:owner_address});
		// }
		// else{
		// 	Pair.getTokenA().approve(address(this),tokenA_amount,{from:owner_address});
		// }
		 
		Pair.addOrder(owner_address,tokenA_amount,tokenB_amount,buy);
	}

	function getidList(bytes32 symbolPair,address owner_address) public view returns (uint[] memory){
		ExchangePair Pair = Exchange[symbolPair];
		uint size = Pair.getListsize();
		uint[] memory idList = new uint[](size)
		;
		idList = Pair.getidList(owner_address);
		return idList;
	}

	function getPercentage(bytes32 symbolPair,uint id) public view returns (uint){
		ExchangePair Pair = Exchange[symbolPair];
		uint percentage = Pair.getPercentage(id);
		return percentage;
	}

	function getexchangeRate(bytes32 symbolPair,uint id) public view returns (uint){
		ExchangePair Pair = Exchange[symbolPair];
		uint rate = Pair.getexchangeRate(id);
		return rate;
	}
	function getSize() public view returns (uint){
		return PairArray.length;
	}
	function addList(bytes32 smth) public{
		PairArray.push(smth);
	}
	function getName() public view returns (string memory){
		return name;
	}
	function getAddress(bytes32 symbolPair) public view returns (address){
		ExchangePair Pair = Exchange[symbolPair];
		address Address = address(Pair);
		return Address;
	}

}