import template from './view-stadium-in-tribunes.html';

let viewStadiumInTribunesComponent = {
  bindings: {
    currentPrice: '<',
    onChangeSchema: '&',
    onTribune: '&',
    onSector: '&'
  },
  templateUrl: template,
  controller: class ViewStadiumInTribunesController {
    constructor() {
      'ngInject';
    }

    $onChanges(changes) {
      if (this.currentPrice) {
        angular.copy(this.currentPrice, this.currentPriceSchema);
      }
    }

  $onInit() {
      this.currentPriceSchema = {}
  }

  changePriceSchema() {
    this.onChangeSchema({
      $event: {
        currentPriceSchema: this.currentPriceSchema
      }
    });
  }

  selectTribune(tribuneName) {
    this.onTribune({
      $event: {
          tribuneName: tribuneName
      }
    });
  }

  getSectorForSetPrice(sectorShema) {
    this.onSector({
      $event: {
          sectorShema: sectorShema
      }
    });
  }

  }
};

export default viewStadiumInTribunesComponent;