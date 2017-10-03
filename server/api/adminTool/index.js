'use strict';

const express = require('express'),
  backup = require('../../backup');
import * as auth from '../../auth/auth.service';

const router = express.Router();

router.post('/backup', backup.backup);
router.get('/backup.tar.gz', backup.getfile);
router.post('/upload', backup.uploadFile);
// router.post('/upload', auth.hasRole('admin'), backup.upload);
router.post('/restore', auth.hasRole('admin'), backup.restoreDb);

module.exports = router;