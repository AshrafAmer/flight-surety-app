
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });
    

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        });

        DOM.elid('submit-ticket').addEventListener('click', () => {
            let flight = DOM.elid('flight-name').value;
            let departure = DOM.elid('departure').value;
            let address = DOM.elid('flight-address').value;
            // Write transaction
            contract.buy(address, flight, departure,(error, result) => {
                display('Flight', [ { label: 'Buy Ticket', error: error, value: result + ' ' + result.timestamp} ]);
            });
        });


        DOM.elid('get-flight-data').addEventListener('click', () => {
            let _flight = DOM.elid('get-flight-name').value;
            let _departure = DOM.elid('get-departure').value;
            // Write transaction
            contract.insuranceData(_flight, _departure,(error, result) => {
                display('Flight', [ { label: 'Flight Data', error: error, value: result + ' ' + result.timestamp} ]);
            });
        });
    
    });
    

})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
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







