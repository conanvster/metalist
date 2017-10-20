import template from './abonement-ticket.html';

const abonementTicketComponent = {
  templateUrl: template,
  controller: class AbonementTicketController {

    constructor(SeasonTicketService, CashboxService) {
      'ngInject';
      this.seasonTicketService = SeasonTicketService;
      this.cashboxService = CashboxService;
      this.errorMessageSeat;
      this.preSellTicket = null;
      this.ticket = {};
      this.endSeasonDate = new Date(2018, 6, 1);
    }

    $onInit() {
      this.loadSeasonTickets();
    }

    $onChanges(changes) {
      if (changes.seasonTickets) {
        this.tickets = this.seasonTickets;
      }
    }

    loadSeasonTickets() {
      this.seasonTicketService.loadSeasonTickets().then(response => this.seasonTickets = response.data);
      this.errorMessageSeat = '';
    }

    deleteTicket($event) {
      this.seasonTicketService.deleteSeasonTicket($event.slug)
        .then(() => {
          this.loadSeasonTickets();
        });
    }

    regTicket(accessCode) {
      this.cashboxService.getTicketByAccessCode(accessCode)
        .then(response => {
          this.preSellTicket = response;
        });
    }

    createSeasonTicket() {
      let slug = 's' + this.preSellTicket.seat.sector + 'r' + this.preSellTicket.seat.row + 'st' + this.preSellTicket.seat.seat;
      let ticket = this.preSellTicket.seat;
      ticket.reservedUntil = this.endSeasonDate;
      ticket.accessCode = this.preSellTicket.accessCode;
      this.seasonTicketService.createSeasonTicket(ticket, slug)
        .then(() => {
          this.cashboxService.setTicketUsed(this.preSellTicket._id)
        })
        .catch((err) => {
          if (err.status === 409) {
            this.errorMessageSeat = 'Это место уже занято.';
          }
        });
    }

  }
};

export default abonementTicketComponent;
