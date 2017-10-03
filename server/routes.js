/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';

export default function (app) {
  // Insert routes below
  app.use('/api/users', require('./api/user'));
  app.use('/api/matches', require('./api/match'));
  app.use('/api/tickets', require('./api/ticket'));
  app.use('/api/orders', require('./api/order'));
  app.use('/api/carts', require('./api/cart'));
  app.use('/api/seats', require('./api/seat'));
  app.use('/api/priceSchema', require('./api/priceSchema'));
  app.use('/api/seasonTicket', require('./api/seasonTicket'));
  app.use('/api/adminTool', require('./api/adminTool'));

  app.use('/auth', require('./auth').default);

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
    .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
}
