import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display("display-wrapper", 'Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });
    

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display("display-wrapper", 'Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        });


        // User-submitted new Airline Address
        DOM.elid('submit-airline').addEventListener('click', () => {
            let airline = DOM.elid('airline-address').value;
            // Write transaction
            contract.registerAirline(airline, (error, result) => {
                display('display-airline', 'Airline', 'Submit Airline', [ { label: 'Airline Address Added', value: airline} ]);
            });
        });


        // User-submitted Airline Fund
        DOM.elid('fund-airline').addEventListener('click', () => {
            let airline = DOM.elid('airline-fund-address').value;
            let val = DOM.elid('airline-fund-value').value;
            // Write transaction
            contract.fundAirline(airline, val, (error, result) => {
                display('display-airline-fund', 'Airline', 'Fund Airline', [ { label: 'Airline Funded', value: airline + ' ' + val + ' ether'} ]);
            });
        });

        // User-submitted Airline Buy
        DOM.elid('buy-airline').addEventListener('click', () => {
            let airline = DOM.elid('airline-ticket-address').value;
            let passenger = DOM.elid('airline-passenger-address').value;
            let name = DOM.elid('airline-flight-name').value;
            let departure = DOM.elid('airline-flight-departure').value;
            // Write transaction
            contract.buyTicket(airline, passenger, name, departure, (error, result) => {
                display('display-airline-buy', 'Airline', 'Buy Airline', [ { label: 'Successfully Paid', value: airline } ]);
            });
        });

        // User-submitted Airline Update
        DOM.elid('update-airline').addEventListener('click', () => {
            let airline = DOM.elid('airline-update-address').value;
            // Write transaction
            contract.updateAirline(airline, (error, result) => {
                display('display-airline-update', 'setOperatingStatus', 'Update Airline', [ { label: 'Successfully Updated', value: airline } ]);
            });
        });

    
    });
})();


function display(_id,title, description, results) {
    let displayDiv = DOM.elid(_id);
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}