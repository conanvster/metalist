import CashboxService from './cashbox.service';
import CashboxComponent from './cashbox.component';
import AbonementTicketComponent from './abonement-ticket/abonement-ticket.component';
import AbonementTicketListComponent from './abonement-ticket/abonement-ticket-list/abonement-ticket-list.component';
import CashierDaysStatisticComponent from './cashier-days-statistic/cashier-days-statistic.component';
import CashierLastTicketsComponent from './cashier-last-tickets/cashier-last-tickets.component';

const cashboxModule = angular.module('metalistTicketsApp.cashbox', [])
  .service('CashboxService', CashboxService)
  .component('cashbox', CashboxComponent)
  .component('abonementTicket', AbonementTicketComponent)
  .component('abonementTicketList', AbonementTicketListComponent)
  .component('cashierDaysStatistic', CashierDaysStatisticComponent)
  .component('cashierLastTickets', CashierLastTicketsComponent)
  .name;

export default cashboxModule;