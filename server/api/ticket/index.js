'use strict';

const express = require('express'),
  controller = require('./ticket.controller');
import * as auth from '../../auth/auth.service.js';

const router = express.Router();

router.get('/ticket/:ticketNumber', controller.getTicketPdfById);
router.get('/my', auth.isAuthenticated(), controller.getMyTickets);

router.get('/abonticket/:accessCode', auth.hasRole('cashier'), controller.getTicketByAccessCode);
router.get('/useabonticket/:ticketId', auth.hasRole('cashier'), controller.useAbonementTicket);
router.get('/statistics', auth.hasRole('cashier'), controller.getStatistics);

router.get('/events-statistics', auth.hasRole('admin'), controller.getEventsStatistics);
router.get('/days-statistics', auth.hasRole('admin'), controller.getDaysStatistics);

router.get('/tribune/:tribune/code/:code', auth.hasRole('steward'), controller.use);
router.get('/sold-tickets', auth.hasRole('steward'), controller.getTicketsForCheckMobile);
router.get('/count/:tribune', auth.hasRole('steward'), controller.getCountValidTicketsByTribune);

module.exports = router;