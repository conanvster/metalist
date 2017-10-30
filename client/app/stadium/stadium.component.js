import template from './stadium.html';

let stadiumComponent = {
  templateUrl: template,
  bindings: {
    priceSchema: '<',
    onSectorSelect: '&'
  },
  controller: class StadiumController {

    constructor(DefaultPriceColor) {
      'ngInject';
      this.defaultPriceColor = DefaultPriceColor;
      this.prices =[];
    }

    $onInit() {
      this.stadiumName = this.priceSchema.stadiumName;
    }

    onSectorClick($event, tribuneName, sectorNumber) {
      let price = this.getPriceBySector(tribuneName, sectorNumber, this.priceSchema);

      $event.preventDefault();

      this.onSectorSelect({
        $event: {
          price: price,
          tribune: tribuneName,
          sector: sectorNumber
        }
      });
    }

    getColor(tribuneName, sectorNumber) {
      let price = this.getPriceBySector(tribuneName, sectorNumber, this.priceSchema);

      if (!price) {
        return this.defaultPriceColor.color;
      }
      else {
        return this.getColorByPrice(price);
      }
    }

    getColorByPrice(price) {
      return this.priceSchema.colorSchema
        .filter(color => color.price == price)
        .map(color => color.color)[0];
    }

    getPriceBySector(tribuneName, sectorNumber, priceSchema) {
      const currentTribune = priceSchema['tribune_' + tribuneName];
      if (!currentTribune) {
        return undefined;
      }
      if (currentTribune) {
        const currentSector = currentTribune['sector_' + sectorNumber];
        if (!currentSector) {
          if (!currentTribune.price) {
            return undefined;
          } else {
            return currentTribune.price;
          }
        } else {
          if (!currentSector.price) {
            return currentTribune.price;
          }
          return currentSector.price;
        }
      }

    }
  }
};

export default stadiumComponent;