'use strict';

import * as orderService from '../order/order.service';
import * as seatService from '../seat/seat.service';
import config from "../../config/environment";
import * as log4js from 'log4js';
import {SEASON_TICKET} from "../seat/seat.constants";

const logger = log4js.getLogger('Order Controller');

export function getPaymentStatus(req, res) {
  return orderService.getPendingPaymentByUser(req.user)
    .then(order => {
      if (order) {
        return {status: true};
      } else {
        return {status: false};
      }
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function getOrderByPrivateId(req, res) {
  return orderService.getByPrivateId(req.params.privateId)
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function checkout(req, res) {
  let publicId = req.cookies.cart;

  return orderService.findCartByPublicId(publicId)
    .then(handleEntityNotFound(res))
    .then(cart => {
      logger.info('checkout cart: ' + cart);
      return Promise.all([
        seatService.extendReservationTime(cart.seats, publicId),
        Promise.resolve(cart)
      ])
    })
    .then(([seats, cart]) => {
      return orderService.createOrderFromCart(cart, req.user);
    })
    .then(order => {
      logger.info('checkout order: ' + order);
      return {'paymentLink': orderService.createPaymentLink(order)};
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function liqpayRedirect(req, res) {
  if (config.env === 'development') {
    orderService.processLiqpayRequest(req)
  }

  return orderService.getLiqPayParams(req)
    .then(params => {
      if (params.status === 'success' || params.status === 'sandbox' || params.status === 'wait_accept') {
        req.cookies.cart = '';
        return res.redirect('/tickets');
      } else {
        return res.redirect('/checkout');
      }
    })
}

export function liqpayCallback(req, res) {
  return orderService.processLiqpayRequest(req)
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function payCashier(req, res) {
  let publicId = req.cookies.cart;
  const freeMessageStatus = req.body.freeMessageStatus;
  const customPrice = req.body.customPrice;
  return orderService.findCartByPublicId(publicId) // find currents order
    .then(handleEntityNotFound(res))
    .then(handleEntityWithoutTicketsAndSeats(res))
    .then(cart => {
      return Promise.all([
        seatService.reserveSeatsAsPaid(cart.seats, publicId), // long 30 min reserv
        Promise.resolve(cart)
      ])
    })
    .then(([seats, cart]) => {
      return orderService.createOrderFromCartByCashier(cart, req.user, freeMessageStatus); // new order pending
    })
    .then(order => {
      return Promise.all([
        orderService.createTicketsByOrder(order, freeMessageStatus, customPrice),
        Promise.resolve(order)
      ]);
    })
    .then(([[tickets, seasonTickets], order]) => {
      order.tickets = tickets;
      order.seasonTickets = seasonTickets;
      return order.save();
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// private functions ---------------------

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleEntityWithoutTicketsAndSeats(res) {
  return function (entity) {
    if ((entity && entity.seats && !entity.seats.length) && (entity.tickets && !entity.tickets.length)) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}


function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    logger.error('Error 1: ' + err);
    if (err.message === 'notReservedSeat') {
      res.status(406).send(err);
    } else {
      res.status(err.statusCode || statusCode).send(err);
    }

  };
}
