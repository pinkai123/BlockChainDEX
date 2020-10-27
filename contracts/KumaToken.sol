pragma solidity ^0.6.10;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

/**
 * @dev Example of the ERC20 Token.
 */
contract KumaToken is ERC20 {

	using SafeMath for uint256;

	uint256 CAP = 1000000000;
	uint256 TOTALSUPPLY = CAP.mul(10 ** 18);

	constructor()
		public
		ERC20('KumaToken', 'KUMA')
	{
		_mint(msg.sender, TOTALSUPPLY);
	}
}

