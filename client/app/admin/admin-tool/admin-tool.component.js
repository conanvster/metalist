import template from './admin-tool.html';

let adminToolComponent = {
  templateUrl: template,
  controller: class AdminToolController {

    constructor(AdminToolService) {
      'ngInject';
      this.AdminToolService = AdminToolService;

    }

    $onInit() {
    }

    clickCreateBackup() {
      return this.AdminToolService.createBackup()
        .then( response => this.backupLink = response.data );
    }

    clickRestore() {
      return this.AdminToolService.restore()
        .then( response => this.backupLink = response.data );
    }

    uploadToServer(data) {
      return this.AdminToolService.uploadServer(data)
        .then( response => this.backupLink = response.data );
    }
    //
    // uploadFileToUrl(file, uploadUrl){
    //   var fd = new FormData();
    //   fd.append('file', file);
    //   $http.post(uploadUrl, fd, {
    //     transformRequest: angular.identity,
    //     headers: {'Content-Type': undefined}
    //   })
    //     .success(function(){
    //     })
    //     .error(function(){
    //     });
    // }


    clickUpload0() {
      let file = document.getElementById('file').files[0];
      let formData = new FormData();
        formData.append("myfile", file);

      // let body = 'name=' + encodeURIComponent(formData) +'&file=' + file;
      //   console.log('body' , body);

      this.AdminToolService.uploadServer(formData);

    }

    //Загрузка файлов
     upload (url, item, permit) {

      var uploadDeferred = $q.defer();

      item = angular.extend(item, this);
      delete item.$upload;
      delete item.$preview;

      var errors = opts.validate(item, permit);

      if (errors) {
        uploadDeferred.reject(opts.setError('validate', {item: item, data: errors}));
        return uploadDeferred.promise;
      }

      //Собираем все необходимые для загрузки данные в один объект и помещаем его в очередь
      var uploadObject = {
        url:      url,
        item:     item,
        deferred: uploadDeferred,
        xhr: undefined //ссылку на xhr храним в очереди, а не в модели файла (item), чтобы избежать циклической ссылки, т.к. в xhr хранится ссылка на item
                       //иначе возникает ошибка (Error: An attempt was made to use an object that is not, or is no longer, usable.)
      }
      queue.push(uploadObject);

      //Начинаем загрузку при добавлении первого файла (пока загрузка не завершена остальные элементы будут добавляться в эту же очередь, иначе создастся новая очередь)
      if (queue.length === 1) {
        queue.total    = item[opts.fileSize];
        queue.loaded   = 0;
        queue.progress = 0;
        queue.all      = 1;

        uploadQueue();

      } else {
        queue.total += item[opts.fileSize];
        queue.all++;
      }

      //Загрузка следующего файла начинается когда предыдущий загружен либо отменен
      function uploadQueue () {
        if (queue.length) {

          queue[0].item._file._form ? this.iframeTransport(queue[0]) : this._xhrTransport(queue[0]);

          queue[0].deferred.promise.all(function () {
            //Удаляем этот и переходим к следующему элементу очереди в случае завершения загрузки или ошибки (в т. ч. из-за отмены)
            queue.shift();
            uploadQueue();
          })
        } else {
          //Обнуляем очередь когда все файлы загружены
          delete queue.total;
          delete queue.loaded;
          delete queue.all;
          delete queue.progress;
        }
      }

      return uploadDeferred.promise;
    }

    //Отмена загрузки
     abort () {
      //forEach используется для организации замыкания для передачи каждого элемента value в setTimeout
      angular.forEach(queue, function (value, key) {
        if (value.item === this) {
          if (value.xhr) {
            //Если запустить abort напрямую возникает ошибка (Error: apply already in progress)
            setTimeout(function () {
              value.xhr.abort();
            }, 0)
          } else {
            //Удаляем из очереди элемент, который еще не начал загружаться
            queue.splice(key, 1);
          }
          queue.total -= value.item[opts.fileSize];
          queue.loaded -= value.item[opts.fileLoaded];
          queue.all--;
        }
      }, this)
    }

    //xhr-загрузчик
     _xhrTransport (uObj) {

      var xhr = new XMLHttpRequest(),
        form = new FormData();

      xhr.item = uObj.item;
      uObj.xhr = xhr;

      form.append(opts.fieldName, uObj.item._file);

      angular.forEach( uObj.item._file.headers, function (value, name) {
        xhr.setRequestHeader(name, value);
      });

      // xhr.upload.addEventListener('progress', function (e) {
      //
      //   scope.$apply(function () {
      //     //Вычисляем прогресс загрузки файла
      //     uObj.item[opts.fileLoaded]   = e.lengthComputable ? e.loaded : undefined;
      //     uObj.item[opts.fileProgress] = e.lengthComputable ? Math.round(e.loaded * 100 / e.total) : undefined;
      //
      //     //Вычисляем общий прогресс загрузки всех файлов
      //     queue.loaded += uObj.item[opts.fileLoaded];
      //     queue.progress = Math.round(queue.loaded * 100 / queue.total);
      //     xhr.data = e;
      //   });
      // }, false);

      xhr.addEventListener('load', function () {

        var response = xhr.data = this.parseJSONs(xhr.responseText);

        delete uObj.item._file; //удаляем техническую информацию о загружаемом файле из модели
        delete uObj.item.$abort;
        delete uObj.item[opts.fileProgress];
        delete uObj.item[opts.fileLoaded];
        delete uObj.item[opts.fileUploading];

        scope.$apply(function () {
          if (xhr.status === 200 && response) {
            angular.extend(uObj.item, response);
            uObj.deferred.resolve(xhr);

          } else {
            uObj.deferred.reject(opts.setError('upload', xhr));
          }
        });
      }, false);

      xhr.addEventListener('error', function () {
        xhr.data = this.parseJSONs(xhr.responseText);

        scope.$apply(function () {
          uObj.deferred.reject(opts.setError('load', xhr));
        });
      }, false);

      xhr.addEventListener('abort', function () {
        xhr.data = this.parseJSONs(xhr.responseText);

        scope.$apply(function () {
          uObj.deferred.reject(opts.setError('abort', xhr));
        });
      }, false);

      xhr.open('POST', uObj.url, true);
      xhr.send(form);
    }

    //iframe-загрузчик
     iframeTransport (uObj) {

      uObj.xhr = false;

      var form = uObj.item._file._form,
        iframe = form.find('iframe'),
        input = form.find('input');

      input.prop('name', opts.fieldName);

      form.prop({
        action: uObj.url,
        method: 'post',
        target: iframe.prop('name'),
        enctype: 'multipart/form-data',
        encoding: 'multipart/form-data' // old IE
      });

      iframe.bind('load', function () {
        var response, rawResponse;
        // Wrap in a try/catch block to catch exceptions thrown
        // when trying to access cross-domain iframe contents:
        try {
          response = iframe.contents();
          // Google Chrome and Firefox do not throw an
          // exception when calling iframe.contents() on
          // cross-domain requests, so we unify the response:
          if (!response.length || !response[0].firstChild) throw new Error();

          rawResponse = angular.element(response[0].body).text();
          response = this.parseJSONs(rawResponse);
        } catch (e) {}

        form.remove(); //Удаляем скрытую форму
        delete uObj.item._file; //удаляем техническую информацию о загружаемом файле из модели

        scope.$apply(function () {
          if (response && !response.error) { //Нельзя узнать статус загрузки во фрейм, поэтому ошибка определяется наличием параметра error в ответе
            angular.extend(uObj.item, response);
            uObj.deferred.resolve({item: uObj.item, response: response});

          } else {
            uObj.deferred.reject(opts.setError('upload', {responseText: rawResponse, data: response, item: uObj.item, dummy: true}));
          }
        });
      });

      form[0].submit();
    }

    //Парсим JSON
     parseJSONs (data) {

      if (typeof data !== 'object') {
        try {
          return angular.fromJson(data);
        } catch (e) {
          return false;
        }
      }
      return data;
    }











    // clickUpload() {
    //
    //   var file = document.getElementById('file').files[0],
    //     reader = new FileReader();
    //
    //    reader.onloadend = function (event) {
    //     var data = event.target.result;
    //
    //     console.log('data', data);
    //      this.upload(data);
    //     return data;
    //
    //   };
    //
    //   reader.onerror = function (event) {
    //     console.error("Файл не может быть прочитан! код " + event.target.error.code);
    //   };
    //   console.log('---1data', reader.onload);
    //   console.log('---1data', reader.result);
    //   reader.readAsBinaryString(file);
    //   // console.log('---2reader', reader.result);
    //   // uploadToServer(reader.result);
    //
    //
    // }

  }
};

export default adminToolComponent;