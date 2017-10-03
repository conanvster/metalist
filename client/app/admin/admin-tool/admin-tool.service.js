export default class AdminToolService {

  constructor($http) {
    'ngInject';
    this.$http = $http;
  }

  createBackup() {
    return this.$http({
      method: 'POST',
      url: '/api/adminTool/backup',
      headers: {'Accept': 'application/json'}
    });
  }

  restore() {
    return this.$http({
      method: 'POST',
      url: '/api/adminTool/restore',
      headers: {'Accept': 'application/json'}
    });
  }

  uploadFileToUrl(file){
    var fd = new FormData();
    fd.append('file', file);
    this.$http.post('/api/adminTool/upload', fd, {
      transformRequest: angular.identity,
      headers: {'Content-Type': undefined}
    })
      .success(function(){
      })
      .error(function(){
      });
  }


  uploadServer(file) {
    return this.$http({
      method: 'POST',
      url: '/api/adminTool/upload',
      data: file,
      headers: {
        'Content-Type': undefined
      }
      // headers: {'Accept': 'multipart/form-data'}
    });
  }
}