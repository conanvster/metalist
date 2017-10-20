import template from './cashier-last-tickets.html';

let cashierLastTicketsComponent = {
  templateUrl: template,
  bindings: {
    lastTickets: '<'
  },
  controller: class CashierLastTicketsController {

    constructor(CashboxService, PrintTicketService) {
      'ngInject';
      this.cashboxService = CashboxService;
      this.printTicketService = PrintTicketService;
      this.ticket = [];
      this.statistics = [];
      this.lastTickets =[];
    }

    $onInit() {
      this.statistics = this.lastTickets;
    }

    dateChanges($event){
      this.getStatistics({
          date: $event.date,
          metod: 'event'
      });
    };

    getStatistics(date) {
      this.cashboxService.getStatistics(date)
        .then(response => {
          this.statistics = response;
        })
    }

    prints(stat) {
      let blank = angular.copy(stat);
      this.ticket = [];
      let seat = {};
      seat.tribune = blank.tribune;
      seat.sector = blank.sector;
      seat.row = blank.row;
      seat.seat = blank.seat;
      blank.seat = seat;
      this.ticket.push(blank);
    }

    ticketRendering(){
      this.printTicketService.print();
    }

  }
};

export default cashierLastTicketsComponent;