import template from './abonement-ticket-list.html';

let abonementTicketListComponent = {
  templateUrl: template,
  bindings: {
    seasonTickets: '<',
    onDelete: '&'
  },
  controller: class AbonementTicketListController {
    constructor() {
      this.tickets = [];
    }

    $onChanges(changes) {
      if ( changes.seasonTickets ) {
        this.tickets = this.seasonTickets;
      }
    }

    deleteTicket(ticket) {
      this.onDelete({$event: { slug: ticket.slug }});
    }
  },
};

export default abonementTicketListComponent;