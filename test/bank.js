const DEX = artifacts.require("DEX");
const KumaToken = artifacts.require("KumaToken");
const TrialToken = artifacts.require("TrialToken");

contract("DEX", async (accounts) => {
  // accounts are the list of account created by the Truffle (i.e. 10 key pair)
  // by default, the first account will deploy the contract
  it("KumaToken is created correctly", async () => {
    let kuma = await KumaToken.deployed(); // get the deployed Bank contract
    let symbol = await kuma.symbol(); // call the getter on public state variable, https://solidity.readthedocs.io/en/v0.7.1/contracts.html#getter-functions
    //console.log(owner.address);
    assert.equal(symbol, "KUMA"); // compare the expected owner with the actual owner
  });

  it("account[1] has 100 kuma token", async () => {
    let kuma = await KumaToken.deployed();
    let trial = await TrialToken.deployed();
    let dex = await DEX.deployed();

    await kuma.transfer(accounts[1],100);
    await kuma.transfer(accounts[2],100);

    
    // await dex.addPair("0x123",kuma.address,trial.address);
    // await kuma.approve(dex.address,5,{from:accounts[1]});


    // result = await dex.addOrder("0x123",accounts[1],5,5,true);

    // result = await

    // result = await trial.approve(dex.address,5,{from:accounts[2]});
    // result = await dex.addOrder("0x123",accounts[2],3,3,false);

    // sending 3 Ether to deposit() function from accounts[4],
    // Note that deposit() function in the contract doesn't have any input parameter,
    // but in test, we are allowed to pass one optional special object specifying ethers to send to this
    // contract while we are making this function call.
    // Another similar example here: https://www.trufflesuite.com/docs/truffle/getting-started/interacting-with-your-contracts#making-a-transaction
    // let result = await bank.deposit({
    //   from: accounts[4],
    //   value: web3.utils.toWei("3"), // all amount are expressed in wei, this is 3 Ether in wei
    // });
    // get deposited balance
    // let deposited = await bank.balance({ from: accounts[4] });
    let balance = await kuma.balanceOf(accounts[1]);
    assert.equal(balance,100);
  });

  it("account[2] has 100 trial token", async () => {
    let kuma = await KumaToken.deployed();
    let trial = await TrialToken.deployed();
    let dex = await DEX.deployed();

    await trial.transfer(accounts[1],100);
    await trial.transfer(accounts[2],100);

    let balance = await trial.balanceOf(accounts[2]);
    assert.equal(balance,100);
  });

  it("1 exchangePair is added", async () => {
    let kuma = await KumaToken.deployed();
    let trial = await TrialToken.deployed();
    let dex = await DEX.deployed();

    await dex.addPair("0x123",kuma.address,trial.address);

    let sizeOfPairs = await dex.getSize();
    assert.equal(sizeOfPairs,1);
  });

  it("account[1] has added an order", async () => {
    let kuma = await KumaToken.deployed();
    let trial = await TrialToken.deployed();
    let dex = await DEX.deployed();

    let exchange_address = await dex.getAddress("0x123");

    await trial.approve(exchange_address,5,{from:accounts[1]});
    await dex.addOrder("0x123",accounts[1],5,5,true);

    let idList = await dex.getidList("0x123",accounts[1]);
    let Orders =  await idList.length;
    assert.equal(Orders,1);
  });
  it("account[1] has an order of 0% filled", async () => {
    let kuma = await KumaToken.deployed();
    let trial = await TrialToken.deployed();
    let dex = await DEX.deployed();

    let idList = await dex.getidList("0x123",accounts[1]);
    let id = idList[0];
    let percentage = await dex.getPercentage("0x123",id);
    assert.equal(percentage,0);
  });

  it("account[1] has an exchange rate of 1", async () => {
    let kuma = await KumaToken.deployed();
    let trial = await TrialToken.deployed();
    let dex = await DEX.deployed();

    let idList = await dex.getidList("0x123",accounts[1]);
    let id = idList[0];
    let rate = await dex.getexchangeRate("0x123",id);
    assert.equal(rate,1);
  });
  it("dex has allownace of 5 trial token for accounts[1]", async () => {
    let kuma = await KumaToken.deployed();
    let trial = await TrialToken.deployed();
    let dex = await DEX.deployed();

    let exchange_address = await dex.getAddress("0x123");

    let allowance = await trial.allowance(accounts[1],exchange_address);
    assert.equal(allowance,5);
  });

  it("Percentage filled should be 60%", async () => {
    let kuma = await KumaToken.deployed();
    let trial = await TrialToken.deployed();
    let dex = await DEX.deployed();

    let idList = await dex.getidList("0x123",accounts[1]);
    let id = idList[0];

    let exchange_address = await dex.getAddress("0x123");

    await kuma.approve(exchange_address,3,{from:accounts[2]});
    await dex.addOrder("0x123",accounts[2],3,3,false);
    
    let percentage = await dex.getPercentage("0x123",id);
    assert.equal(percentage,60);
  });

  it("account[2] has 97 kuma tokens", async () => {
    let kuma = await KumaToken.deployed();
    let trial = await TrialToken.deployed();
    let dex = await DEX.deployed();

    let balance = await kuma.balanceOf(accounts[2]);
    assert.equal(balance,97);
  });

  it("account[1] has 103 kuma tokens", async () => {
    let kuma = await KumaToken.deployed();
    let trial = await TrialToken.deployed();
    let dex = await DEX.deployed();

    let balance = await kuma.balanceOf(accounts[1]);
    assert.equal(balance,103);
  });

  it("Should have only 1 order left for accounts[1]", async () => {
    let kuma = await KumaToken.deployed();
    let trial = await TrialToken.deployed();
    let dex = await DEX.deployed();

    let idList = await dex.getidList("0x123",accounts[1]);
    let Orders =  await idList.length;
    assert.equal(Orders,1);
  });
  it("Testing Limit Order(test for 0 order left): Add sell order of exchange rate of 0.5 with buy order of 1 exchange rate in orderlist ", async () => {
    let kuma = await KumaToken.deployed();
    let trial = await TrialToken.deployed();
    let dex = await DEX.deployed();

    let exchange_address = await dex.getAddress("0x123");

    await kuma.approve(exchange_address,4,{from:accounts[2]});
    await dex.addOrder("0x123",accounts[2],4,2,false);
    
    let idList = await dex.getidList("0x123",accounts[1]);
    let Orders =  await idList.length;
    assert.equal(Orders,0);
  });
});
