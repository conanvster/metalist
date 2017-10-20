const RenderTicketComponent = {
  template: `  <div id="printable" ng-show=false> 
    <div ng-repeat="ticket in $ctrl.tickets">
      <h3> </h3>
      <b>{{$ctrl.translate(ticket.seat.tribune)}} </b><br>
      <b>{{ticket.seat.sector}} </b><br>
      <b>{{ticket.seat.row}} </b><br>
      <b>{{ticket.seat.seat}} </b><br>
      <b>{{ticket.amount}} </b><br>
      <b>{{ticket.accessCode}}</b><br>
      <io-barcode code="ticket.accessCode" type="CODE128B" options="$ctrl.options"></io-barcode>
    </div>
  </div>`,
  bindings: {
    tickets: '<',
    onChange: '&'
  },
  controller: class RenderTicketController {
    constructor(PrintTicketService) {
      'ngInject';
      this.printTicketService = PrintTicketService;
      this.tickets = [];
    }

    $onChanges(changes) {
      if (changes.tickets) {
        this.tickets = angular.copy(changes.tickets.currentValue);
        if (this.tickets[0]) {
          this.onChange();
        }
      }
    }

    translate(direction) {
      if (direction === 'north') { return 'Северная'}
      if (direction === 'south') { return 'Южная'}
      if (direction === 'east') { return 'Восточная'}
      if (direction === 'west') { return 'Западная'}
    }

  }
};

export default RenderTicketComponent;