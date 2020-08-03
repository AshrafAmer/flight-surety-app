import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.FlightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];

            let counter = 1;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }


    registerAirline(airline_address, callback) {
        let self = this;
        self.flightSuretyApp.methods
            .registerAirline(airline_address)
            .send({ from: self.owner}, (error, result) => {
                callback(error);
            });
    }

    fundAirline(airline_address, val, callback) {
        let self = this;
        self.FlightSuretyData.methods
            .fund(airline_address)
            .send({ from: self.owner, value: val}, (error, result) => {
                callback(error);
            });
    }

    buyTicket(airline, passenger, name, departure, callback){
        let self = this;
        self.FlightSuretyData.methods
            .buy(passenger, airline, name, departure)
            .send({ from: self.owner, value: 1}, (error, result) => {
                callback(error);
            });
    }


    updateAirline(airline, callback){
        let self = this;
        self.FlightSuretyData.methods
            .setOperatingStatus(false)
            .send({ from: airline}, (error, result) => {
                callback(error);
            });
    }
}