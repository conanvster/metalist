import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import CashboxService from './cashbox.service';
import CashboxComponent from './cashbox.component';
import AbonementTicketComponent from './abonement-ticket/abonement-ticket.component';
import AbonementTicketListComponent from './abonement-ticket/abonement-ticket-list/abonement-ticket-list.component';
import CashierDaysStatisticComponent from './cashier-days-statistic/cashier-days-statistic.component';
import CashierLastTicketsComponent from './cashier-last-tickets/cashier-last-tickets.component';

const cashboxModule = angular.module('metalistTicketsApp.cashbox', [uiRouter])
  .service('CashboxService', CashboxService)
  .component('cashbox', CashboxComponent)
  .component('abonementTicket', AbonementTicketComponent)
  .component('abonementTicketList', AbonementTicketListComponent)
  .component('cashierDaysStatistic', CashierDaysStatisticComponent)
  .component('cashierLastTickets', CashierLastTicketsComponent)
  .config(($stateProvider, $urlRouterProvider) => {
    $stateProvider
      .state('cashbox', {
        url: "/cashbox",
        component: 'cashbox'
      })
      .state('cashbox.abonementTicket', {
        url: "/abonementTicket",
        component: 'abonementTicket'
      })
      .state('cashbox.daysStatistic', {
        url: "/daysStatistic",
        component: 'cashierDaysStatistic',
        resolve: {
          dayStatistics: (CashboxService) => {
            'ngInject';
            return CashboxService.getStatistics({
                date: new Date(),
                metod: 'day'
              })
          },
        }
      })
      .state('cashbox.lastTickets', {
        url: "/lastTickets",
        component: 'cashierLastTickets',
        resolve: {
          lastTickets: (CashboxService) => {
            'ngInject';
            return CashboxService.getStatistics({
                date: new Date(),
                metod: 'event'
              })
          },
        }
      });
    $urlRouterProvider.otherwise('/');
  })
  .name;

export default cashboxModule;