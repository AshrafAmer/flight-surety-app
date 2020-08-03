
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });

  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.airlineRegistered.call(newAirline); 

    // ASSERT
    assert.equal(result, true, "Airline should not be able to register another airline if it hasn't provided funding");

  });


  it('(airline) can fund itself', async () => {

    await config.flightSuretyData.AirlineFunded((error, res)=>{
    });

    let fundedAirlinesCountBefore = await config.flightSuretyData.getFundedAirlinesCount.call();

    // ACT
    try {
      await config.flightSuretyApp.fundAirline(config.firstAirline, {from: config.firstAirline, value: web3.utils.toWei('10', "ether")});

    }
    catch(e) {
    }

    let fundedAirlinesCountAfter = await config.flightSuretyData.getFundedAirlinesCount.call();

    assert.equal(fundedAirlinesCountAfter.toNumber(), fundedAirlinesCountBefore.toNumber() + 1 , "funded Airlines count did not increase");

    let result = await config.flightSuretyData.airlineFunded.call(config.firstAirline); 

    // ASSERT
    assert.equal(result, true, "Airline funding is not successful");

  });


  it('(airline) can register using registerAirline() if it funded', async () => {

    // ARRANGE
    let newAirline = accounts[3];
    // ACT
    try {
      await config.flightSuretyApp.fundAirline(config.firstAirline, {from: config.firstAirline,value: web3.utils.toWei('10', "ether")});
      await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
    }
    catch(e) {
      assert.equal(false, true, `Catch Error=> ${e}`);
    }

    let result = await config.flightSuretyData.airlineRegistered.call(newAirline); 

    // ASSERT
    assert.equal(result, true, "Airline was not able to register another airline given it was funded");

  });


  it('(airline) can vote => voteForAirline() if it funded', async () => {

    // ARRANGE
    let newAirline = accounts[4];
    let voteCount;

    // ACT
    try {
      await config.flightSuretyApp.fundAirline(config.firstAirline, {from: config.firstAirline,value: web3.utils.toWei('10', "ether")});
      await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
      voteCount = await config.flightSuretyData.getAirlineVotesCount.call(newAirline, {from: config.firstAirline});
      await config.flightSuretyApp.voteForAirline(newAirline, {from: config.firstAirline});
    }
    catch(e) {
      assert.equal(e, true, "Error in try");
    }

    let result = await config.flightSuretyData.getAirlineVotesCount.call(newAirline, {from: config.firstAirline});

    // ASSERT
    assert.equal(result.toNumber(), voteCount.toNumber() + 1, "Airline can not able to vote for a registered airline if it funded");

  });

  it('5th (airline) will recieve vogtes utill it get registered', async () => {

    // ARRANGE
    let newAirline = accounts[3];

    // ACT
    try {
        await config.flightSuretyApp.fundAirline(accounts[0], 
                        { from: accounts[0], value: web3.utils.toWei('10', "ether") });
        await config.flightSuretyApp.fundAirline(accounts[1], 
                        { from: accounts[1], value: web3.utils.toWei('10', "ether") });
        await config.flightSuretyApp.fundAirline(accounts[2], 
                        { from: accounts[2], value: web3.utils.toWei('10', "ether") });
    }
    catch(e){
    }

    try {
        await config.flightSuretyApp.voteForAirline(newAirline, { from: config.firstAirline });
        await config.flightSuretyApp.voteForAirline(newAirline, { from: accounts[0] });
        await config.flightSuretyApp.voteForAirline(newAirline, { from: accounts[1] });
    }
    catch(e){
    }

    let registered = await config.flightSuretyData.airlineRegistered(newAirline);
    // ASSERT
    assert.equal(registered, true, "Voting for airlines will make it registered if pass the needed number");

});

  it(`passenger can buy insurance for his ticket, event InsuranceBought emited`, async () => {

    let passenger = accounts[9];

    await Test.passesWithEvent(
        'InsuranceIsBought',
        config.flightSuretyData.buy(
            passenger,
            config.firstAirline,
            "AshrafAmer",
            12345,
            { from: passenger, value: web3.utils.toWei('0.1', 'ether') })
    );

    let insurance = await config.flightSuretyApp.insuranceData.call(
        passenger,
        config.firstAirline,
        "AshrafAmer",
        12345,
        { from: passenger }
    );
    let value = web3.utils.fromWei(insurance.value, 'ether').toString();
    assert.equal(insurance.state, "2", "state of insurance not in bought state")
    assert.equal(value, "0.1", "value of insurance did not match the data in contract");
});

});
