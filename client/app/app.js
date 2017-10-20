"use strict";

import angular from 'angular';
import datePicker from './../../node_modules/angular-datepicker/index';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';
import validationMatch from 'angular-validation-match';
import uiRouter from '@uirouter/angularjs';
import uiBootstrap from 'angular-ui-bootstrap';
import ioBarcode from 'angular-io-barcode';

import './angular-locale_ru-ru';

import MatchDetailsComponent from './match-details/match-details.component';
import CartDetailsComponent from './cart/details/cart-details.component';
import CartSummaryComponent from './cart/summary/cart-summary.component';
import NavpanelComponent from './navpanel/navpanel.component';
import StadiumComponent from './stadium/stadium.component';
import CalendarComponent from './calendar/calendar.component';
import RenderTicketComponent from './render-ticket/render-ticket.component';

import CartService from './services/cart.service';
import MatchService from './services/match.service';
import TicketsService from './services/ticket.service';
import PrintTicketService from './print-ticket/print-ticket.servise';
import FileService from './services/file.service';

import footerDirective from './footer/footer.directive';
import mongooseErrorDirective from './mongoose-error/mongoose-error.directive';
import navbarDirective from './navbar/navbar.directive';
import oauthButtonsDirective from './oauth-buttons/oauth-buttons.directive';

import { routerConfig } from './router';
import routerDecorator from './auth/router.decorator';

import adminModule from './admin/admin.module';
import cashboxModule from './cashbox/cashbox.module';
import authModule from './auth/auth.module';
import constantsModule from './app.constant';
import filtersModule from './filters/filters';

import CheckoutController from './checkout/checkout.controller';
import HomeController from './home/home.controller';
import LoginController from './account/login/login.controller';
import LogoutController from './account/logout/logout.controller';
import MatchController from './match/match.controller';
import NotFoundController from './404/404.controller';
import NavbarController from './navbar/navbar.controller';
import RecoveryController from './account/recovery/recovery.controller';
import SectorController from './sector/sector.controller';
import SettingsController from './account/settings/settings.controller';
import SignupController from './account/signup/signup.controller';
import TicketsController from './tickets/tickets.controller';

import '../favicon.ico';
import './app.less';
import './../../node_modules/angular-datepicker/dist/index.min.css';

angular.module('metalistTicketsApp', [
  adminModule,
  cashboxModule,
  authModule,
  filtersModule,
  constantsModule,
  ngCookies,
  ngResource,
  ngSanitize,
  uiRouter,
  uiBootstrap,
  validationMatch,
  datePicker,
  ioBarcode.name
])
  .component('matchDetails', MatchDetailsComponent)
  .component('cartDetails', CartDetailsComponent)
  .component('cartSummary', CartSummaryComponent)
  .component('navpanel', NavpanelComponent)
  .component('stadium', StadiumComponent)
  .component('calendar', CalendarComponent)
  .component('renderTicket', RenderTicketComponent)
  .directive('footer', footerDirective)
  .directive('mongooseError', mongooseErrorDirective)
  .directive('navbar', navbarDirective)
  .directive('oauthButtons', oauthButtonsDirective)
  .service('CartService', CartService)
  .service('MatchService', MatchService)
  .service('TicketsService', TicketsService)
  .service('PrintTicketService', PrintTicketService)
  .service('FileService', FileService)
  .controller('HomeController', HomeController)
  .controller('CheckoutController', CheckoutController)
  .controller('LoginController', LoginController)
  .controller('LogoutController', LogoutController)
  .controller('MatchController', MatchController)
  .controller('NavbarController', NavbarController)
  .controller('RecoveryController', RecoveryController)
  .controller('SectorController', SectorController)
  .controller('SettingsController', SettingsController)
  .controller('SignupController', SignupController)
  .controller('NotFoundController', NotFoundController)
  .controller('TicketsController', TicketsController)
  .config(routerConfig)
  .config(function ($httpProvider) {
    'ngInject';
    $httpProvider.interceptors.push('authInterceptor');
  })
  .run(function ($rootScope, $window) {
    'ngInject';
    $rootScope.$on('$stateChangeStart', function (event, next, nextParams, prev, prevParams) {
      if (next.name === 'login' && prev && prev.name && !prev.authenticate) {
        next.referrer = prev.name;
        next.params = prevParams;
        $window.sessionStorage.href = $window.location.href;
      }
      if (next.name === 'signup') {
        $window.sessionStorage.href = $window.location.href;
      }
      if ($window.location.hash && ( $window.location.hash == '#_=_' || $window.location.hash == '#-=-' )) {
        event.preventDefault();
        $window.location.href = $window.sessionStorage.href;
      }
    });
  })
  .run(routerDecorator);