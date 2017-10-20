'use strict';

import {PAID} from '../seat/seat.constants';
import Order from './order.model';
import User from '../user/user.model';
import moment from 'moment';
import * as crypto from 'crypto';
import * as priceSchemeService from '../priceSchema/priceSchema.service';
import * as seatService from '../seat/seat.service';
import * as ticketService from '../ticket/ticket.service';
import * as LiqPay from '../../liqpay';
import * as config from "../../config/environment";
import * as Mailer from '../../mailer/mailer.js';
import * as log4js from 'log4js';

const logger = log4js.getLogger('Order Service');

export function getStatistics(userId, date) {
  let day = moment(new Date(date)).tz('Europe/Kiev');
  return Order.find({"user.id": userId, created : {
    $gte: day.startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    $lt: day.endOf('day').format('YYYY-MM-DD HH:mm:ss')
  }}).populate('tickets');
}

export function findCartByPublicId(publicId) {
  return Order.findOne({publicId: publicId})
    .populate({
      path: 'seats',
      match: { reservationType: { $nin: [ PAID ]}, reservedUntil: {$gte: new Date()} },
      populate: { path: 'match' }
    });
}

export function getByPrivateId(privateId) {
  return Order.findOne({privateId: privateId})
    .populate({
      path: 'seats',
      populate: { path: 'match' }
    });
}

export function getPendingPaymentByUser(user) {
  return Order.findOne({"user.id": user.id, status: "pending", created: {$gte: moment().subtract(10, 'minutes')}})
}

export function createOrderFromCart(cart, user) {
  return countPriceBySeats(cart.seats)
    .then(price => {
      let order = new Order({
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        seats: cart.seats,
        type: 'order',
        status: 'pending',
        publicId: crypto.randomBytes(20).toString('hex'),
        privateId: ticketService.randomNumericString(8),
        created: new Date(),
        price: price
      });

      return order.save();
    })
}

export function createPaymentLink(order) {
  let orderDescription = createDescription(order);

  let paymentParams = {
    'action': 'pay',
    'amount': order.price,
    'currency': 'UAH',
    'description': orderDescription.slice(0,150),
    'order_id': order.publicId,
    'sandbox': config.liqpay.sandboxMode,
    'server_url': config.liqpay.callbackUrl,
    'result_url': config.liqpay.redirectUrl
  };

  return LiqPay.generatePaymentLink(paymentParams);
}

export function processLiqpayRequest(request) {
  return getLiqPayParams(request)
    .then(params => {
      return Promise.all([
        findCartByPublicId(params.order_id),
        params
      ]);
    })
    .then(([order, params]) => {
      if (!order) {
        throw new Error('Order not found');
      }
      order.paymentDetails = params;
      if (params.status === 'success' || params.status === 'sandbox') {
        order.status = 'paid';
        logger.info('paid order: ' + order);
        return handleSuccessPayment(order);
      } else {
        order.status = 'failed';
        return order.save();
      }
    })
    .catch(error => {
      logger.error('liqpayCallback error: ' + error);
    });
}

export function getLiqPayParams(req) {
  return new Promise((resolve, reject) => {
    if (!req.body.data || !req.body.signature) {
      return reject(new Error('data or signature missing'));
    }

    if (LiqPay.signString(req.body.data) !== req.body.signature) {
      return reject(new Error('signature is wrong'));
    }

    return resolve(JSON.parse(new Buffer(req.body.data, 'base64').toString('utf-8')));
  })
}


export function createOrderFromCartByCashier(cart, user) {
  return countPriceBySeats(cart.seats)
    .then(price => {
      let order = new Order({
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        seats: cart.seats,
        type: 'order',
        status: 'paid',
        publicId: crypto.randomBytes(20).toString('hex'),
        privateId: ticketService.randomNumericString(8),
        created: new Date(),
        price: price
      });

      return order.save();
    })
}


////////private function
function handleSuccessPayment(order) {

  return Promise.all([
    User.findOne({_id: order.user.id}),
    createTicketsByOrder(order),
    seatService.reserveSeatsAsPaid(order.seats, order.seats[0].reservedByCart)
  ])
    .then(([user, tickets]) => {
      user.tickets.push(...tickets);
      order.tickets = tickets;
      return Promise.all([
        user.save(),
        order.save()
      ]);
    })
    .then(() => {
      Mailer.sendMailByOrder(order);
      return true;
    })
    .catch(error => {
      logger.error('handleSuccessPayment error: ' + error);
    });
}

function createDescription(order) {
  let uniqueRival = getUniqueMatchRival(order.seats),
    matchesDescription =  createMatchesDescription(uniqueRival, order.seats);

  return `${order.privateId} | ${matchesDescription}`;
}

export function createTicketsByOrder(order) {
  return Promise.all(order.seats.map(seat => {
    return ticketService.createTicket(seat);
  }));
}

function countPriceBySeats(seats) {
  return Promise.all(seats.map(seat => {
    return priceSchemeService.getSeatPrice(seat);
  })).then(prices => prices.reduce((sum, price) => {
    return sum + price;
  }, 0))
}

function getUniqueMatchRival(seats) {
  let rivals = seats.map(seat => seat.match.rival);
  return [...new Set(rivals)];
}

function createMatchesDescription(uniqueRival, seats) {
  return uniqueRival.reduce((description, rival) => {
    let count = seats.filter(seat => seat.match.rival === rival).length;

    return `${description} ${rival}: ${count} шт. | `;
  }, '');
}
