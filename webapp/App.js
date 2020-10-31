import React from "react";
import {
  getTxnList,
  addPair,
  addOrder,
  DexContractAddress,
  Testnet,
  getPairArray,
} from "./dex.js";

// example from doc: https://reactjs.org/docs/forms.html#controlled-components
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      txnArray:"",
      PairArray:"",
      TokenA:"",
      TokenB:"",
      New_TokenA_symbol:"",
      New_TokenB_symbol:"",
      New_TokenA_address:"",
      New_TokenB_address:"",
      TokenA_amount:"",
      TokenB_amount:"",
      ETHinput: 0,
      ERC20input: 0,
      queryInput: "",
      depositInput: 0,
      address: "0x0",
      deposit: 0,
    };
    this.handleUpdate = this.handleUpdate.bind(this);
    this.updatePairArray = this.updatePairArray.bind(this);
    this.handleAddPair = this.handleAddPair.bind(this);
    this.handleNewTokenAaddressChange = this.handleNewTokenAaddressChange.bind(this);
    this.handleNewTokenBaddressChange = this.handleNewTokenBaddressChange.bind(this);
    this.handleNewTokenAsymbolChange = this.handleNewTokenAsymbolChange.bind(this);
    this.handleNewTokenBsymbolChange = this.handleNewTokenBsymbolChange.bind(this);
    this.handleBuy = this.handleBuy.bind(this);
    this.handleSell = this.handleSell.bind(this);
    this.handleTokenAChange = this.handleTokenAChange.bind(this);
    this.handleTokenBChange = this.handleTokenBChange.bind(this);
    this.handleTokenAAmountChange = this.handleTokenAAmountChange.bind(this);
    this.handleTokenBAmountChange = this.handleTokenBAmountChange.bind(this);
  }

  updatePairArray = async () => {
    let PairArray = await getPairArray();
    console.log(PairArray);
    const listPairArray = PairArray.map((Pair) =>
    <a class="list-group-item" href="#">{Pair}</a>);
    console.log(listPairArray);
    this.setState({PairArray: listPairArray});
  }
  componentWillMount() {
    this.updatePairArray();
  }
  handleNewTokenAaddressChange = (e) => {
    console.log(e.target.value);
    this.setState({ New_TokenA_address: e.target.value });
  };
  handleNewTokenBaddressChange = (e) => {
    console.log(e.target.value);
    this.setState({ New_TokenB_address: e.target.value });
  };
  handleNewTokenAsymbolChange = (e) => {
    console.log(e.target.value);
    this.setState({ New_TokenA_symbol: e.target.value });
  };
  handleNewTokenBsymbolChange = (e) => {
    console.log(e.target.value);
    this.setState({ New_TokenB_symbol: e.target.value });
  };
  handleTokenAChange = (e) => {
    console.log(e.target.value);
    this.setState({ TokenA: e.target.value });
  };
  handleTokenBChange = (e) => {
    console.log(e.target.value);
    this.setState({ TokenB: e.target.value });
  };
  handleTokenAAmountChange = (e) => {
    console.log(e.target.value);
    this.setState({ TokenA_amount: e.target.value });
  };
  handleTokenBAmountChange = (e) => {
    console.log(e.target.value);
    this.setState({ TokenB_amount: e.target.value });
  };
  handleAddPair = async () => {
    console.log(this.state.ERC20input,this.state.TokenA,this.state.TokenB);
    let result = await addPair(this.state.New_TokenA_symbol,this.state.New_TokenB_symbol,this.state.New_TokenA_address,this.state.New_TokenB_address);
    let PairArray = await getPairArray();
    console.log(PairArray);
    const listPairArray = PairArray.map((Pair) =>
    <a class="list-group-item" href="#">{Pair}</a>);
    console.log(listPairArray);
    this.setState({PairArray: listPairArray});
    
  };
  handleBuy = async () => {
    console.log(this.state.ERC20input,this.state.TokenA,this.state.TokenB);
    let result = await addOrder(this.state.TokenA,this.state.TokenB,this.state.TokenA_amount,this.state.TokenB_amount,true);
    console.log(result);
  };
  handleSell = async () => {
    console.log(this.state.ERC20input,this.state.TokenA,this.state.TokenB);
    let result = await addOrder(this.state.TokenA,this.state.TokenB,this.state.TokenA_amount,this.state.TokenB_amount,false);
    console.log(result);
  };
  handleUpdate = async () => {
    this.updatePairArray();
    let txnArray = await getTxnList();
    console.log(txnArray);
    const listtxnArray = txnArray.map((txn) =>
  <tr> <th>{txn.id}</th><td>{txn.symbolPair}</td><td>{txn.percentage}</td></tr>);
    console.log(listtxnArray);
    this.setState({txnArray: listtxnArray});
  };

  render() {
    return (
      <>
      <div class = "container">
        <h1>Welcome to DEX dApp</h1>
        <h5>Bank Contract Address: {DexContractAddress}</h5>
        <h5>Network: {Testnet}</h5>
        <ul class="list-group mb-5">{this.state.PairArray}</ul>
        <h5>Add ExhchangePair</h5>
        <div class="form-row">
        <div class="col">
        <input
          class="form-control"
          type="text"
          placeholder="Enter TokenA Symbol"
          value={this.state.value}
          onChange={this.handleNewTokenAsymbolChange}
        />
        </div>
        <div class="col">
        <input
          class="form-control"
          type="text"
          placeholder="Enter TokenB Symbol"
          value={this.state.value}
          onChange={this.handleNewTokenBsymbolChange}
        />
        </div>
        <div class="col">
        <input
          class="form-control"
          type="text"
          placeholder="Enter TokenA Address"
          value={this.state.value}
          onChange={this.handleNewTokenAaddressChange}
        />
        </div>
        <div class="col">
        <input
          class="form-control"
          type="text"
          placeholder="Enter TokenB Address"
          value={this.state.value}
          onChange={this.handleNewTokenBaddressChange}
        />
        </div>
        </div>
        <button button class="btn btn-primary" type="button" type="submit" value="AddPair" onClick={this.handleAddPair}>AddPair</button>
        <br />
        <br />
        <h5>Add Order</h5>
        <div class="form-row">
        <div class="col">
        <input
          class="form-control"
          type="text"
          placeholder="Enter TokenA"
          value={this.state.value}
          onChange={this.handleTokenAChange}
        />
        </div>
        <div class="col">
        <input
          class="form-control"
          type="text"
          placeholder="Enter TokenB"
          value={this.state.value}
          onChange={this.handleTokenBChange}
        />
        </div>
        <div class="col">
        <input
          class="form-control"
          type="text"
          placeholder="Enter Amount to approve"
          value={this.state.value}
          onChange={this.handleTokenAAmountChange}
        />
        </div>
        <div class="col">
        <input
          class="form-control"
          type="text"
          placeholder="Enter Amount to approve"
          value={this.state.value}
          onChange={this.handleTokenBAmountChange}
        />
        </div>
        </div>
        <div class="btn-group">
        <button class="btn btn-primary" type="button" type="submit" value="Buy" onClick={this.handleBuy} >Buy</button>
        <button class="btn btn-primary" type="button" type="submit" value="Sell" onClick={this.handleSell} >Sell</button>
        <button class="btn btn-secondary" type="button" type="submit" value="Update" onClick={this.handleUpdate} >Update</button>
        </div>
        <h6>1 Amount = 10^-18 token</h6>
        <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>symbolPair</th>
                    <th>Percentage_filled</th>
                </tr>
            </thead>
            <tbody>{this.state.txnArray}</tbody>
            </table>        
        </div>
      </>
    );
  }
}

export default App;
