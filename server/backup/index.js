'use strict';
import * as fs from 'fs';
import * as sys from 'child_process';
import * as log4js from 'log4js';
var multer  = require('multer');

let logger = log4js.getLogger('dump');

let outputDir='./dump/';

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, outputDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

var upload = multer({storage: storage}).single('myfile');

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    logger.error('handleError ' + err);
    res.status(statusCode).send(err);
  };
}

export function uploadFile(req, res) {
  upload(req,res,function(err){
    if(err){
      res.json({error_code:1,err_desc:err});
      return;
    }
    logger.info('uploadFile ');
    res.json({error_code:0,err_desc:null});
  });
}

let createDumpFolder = (outputDir) => {
  return new Promise((resolve, reject) => {
    sys.exec('mongodump --db metalisttickets-dev --out ' + outputDir + ' && tar -czvf - > ./dump/backup.tar.gz ',
      function (err, itog1) {
        if (err) {
          logger.error('mongodump ' + err);
          return reject(err);
        } else {
          logger.info('mongodump ' + itog1);
          return resolve(itog1);
        }
      });
  });
};

let unTar = (outputDir) => {
  return new Promise((resolve, reject) => {
    sys.exec('tar -xvf backup.tar.gz',
      function (err, itog1) {
        if (err) {
          return reject(err);
        } else {
          return resolve(itog1);
        }
      });
  });
};
let dumpRestore = (outputDir) => {
  return new Promise((resolve, reject) => {
    sys.exec('mongorestore --db metalisttickets-dev --drop ./dump/metalisttickets-dev/',
      function (err, itog1) {
        if (err) {
          return reject(err);
        } else {
          return resolve(itog1);
        }
      });
  });
};

let deleteDumpFolder = (outputDir) => {
  return new Promise((resolve, reject) => {
    sys.exec('rm -rf ' + outputDir,
      function (err, itog1) {
        if (err) {
          return reject(err);
        } else {
          return resolve(itog1);
        }
      });
  });
};

let readDump = (res) => {
  var readStream = fs.createReadStream('./dump/backup.tar.gz');
  var fileContent = "";
  readStream.pipe(res);
  readStream.on("data", function (chunk) {
    fileContent += chunk;
    process.stdout.write(chunk);
  });
  readStream.end();
};

export function backup(req, res) {
  return createDumpFolder(outputDir)
    .then(itog1 => {
      deleteDumpFolder(outputDir);
      return new Promise((resolve) => {
        readDump(res);
        return resolve(res);
      });
    })
    .catch(handleError(res));
}

export function getfile(req, res) {
  return new Promise((resolve) => {
    readDump(res);
    console.log('res', res);
    return resolve(res);
  })
    .catch(handleError(res));
}

export function restoreDb(req, res) {
  return unTar(outputDir)
    .then(itog1 => {
      dumpRestore(outputDir);
      return new Promise((resolve) => {
        console.log('dumpRestore');
        return resolve(res);
      });
    })
    .catch(handleError(res));
}
