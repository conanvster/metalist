import template from './price-editor.html';

let priceEditorComponent = {
  bindings: {
    currentTribune: '<',
    currentSector: '<',
    applyShema: '<',
    onChange: '&',
    onSave: '&'
  },
  templateUrl: template,
  controller: class PriceEditorController {
    constructor() {
      'ngInject';
    }

  $onChanges(changes) {
    if ( changes.currentTribune ) {
      this.currentTribune = angular.copy(this.currentTribune);
      this.currentSector = angular.copy(this.currentSector);
      this.applyShema = angular.copy(this.applyShema);
    }
  }

  $onInit() {
  }

  changePrice() {
    this.onChange({
      $event: {
        currentTribune: this.currentTribune,
        currentSector: this.currentSector
      }
    });
  }

  saveSchema() {
    this.onSave();
  }

  }
};

export default priceEditorComponent;