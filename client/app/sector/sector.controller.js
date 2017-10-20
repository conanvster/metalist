export default class SectorController {
    constructor(match, sector, TicketsService, $stateParams, CartService, PriceSchemaService, StadiumMetalist, StadiumDinamo, StadiumSolar, Auth, PrintTicketService) {
      'ngInject';
      this.cartService = CartService;
      this.priceSchemaService = PriceSchemaService;
      this.ticketsService = TicketsService;
      this.printTicketService = PrintTicketService;
      this.match = match;
      this.hasRoleCashier = Auth.hasRole('cashier');
      this.printTickets = [];
      this.tickets = [];

      if (match.priceSchema.priceSchema.stadiumName == 'dinamo') {
        this.sector = StadiumDinamo['tribune_' + sector.tribune]['sector_' + sector.sector];
      } else {
        if (match.priceSchema.priceSchema.stadiumName == 'solar') {
          this.sector = StadiumSolar['tribune_' + sector.tribune]['sector_' + sector.sector];
        } else {
        this.sector = StadiumMetalist['tribune_' + sector.tribune]['sector_' + sector.sector];
        }
      }

      this.reservedSeats = [];
      this.selectedSeats = [];
      this.tribuneName = $stateParams.tribune;
      this.sectorPrice = '';
      this.rowRow = 'Ряд';
      this.message = '';
      this.firstUpperRow = this.getFirstUpperRow($stateParams.sector);

      this.getPrice();
      this.getReservedSeats();
      this.getSelectedSeats();
    }

  getPrice() {
    let priceSchema = this.match.priceSchema.priceSchema;
    this.sectorPrice = this.priceSchemaService.getPriceBySector(this.tribuneName, this.sector.name, priceSchema);
  }

  getReservedSeats() {
    let matchId = this.match.id,
      sectorName = this.sector.name;

    return this.ticketsService.fetchReservedSeats(matchId, sectorName)
      .then( seats => this.reservedSeats = seats );
  }

  getSelectedSeats() {
    this.selectedSeats = this.cartService.getMyCart().seats.map(seat => {
      return {
        slug: seat.slug,
        matchId: seat.match.id
      };
    });
  }
//@TODO need verification
  updateReservedTickets() {
    this.getReservedSeats();
    this.getSelectedSeats();
  }

  addClassByCheckSoldSeat(slug) {
    let [ checkSeat ] = this.selectedSeats.filter(seat => seat.slug === slug && seat.matchId === this.match.id);

    if (this.reservedSeats.includes(slug) && checkSeat) {
      return 'blockedSeat';
    }

    if ( this.reservedSeats.includes(slug) && !checkSeat ) {
      return 'soldSeat';
    }

    return 'imgSeatsStyle';
  }

  addSeatToCart(sectorName, rowName, seat) {
    let slug = 's' + sectorName + 'r' + rowName + 'st' + seat,
      [ checkSeat ] = this.selectedSeats.filter(seat => seat.slug === slug && seat.matchId === this.match.id);
    this.message = '';
    this.isReserveSuccess = false;

    if ( checkSeat && this.reservedSeats.includes(slug) ) {
      this.cartService.removeSeatFromCart(slug, this.match.id)
        .then(() => {
          this.getReservedSeats();
          this.getSelectedSeats();
        });
    }

    if( !this.reservedSeats.includes(slug) ) {
      this.cartService.addSeatToCart(slug, this.match.id)
        .then(() => {
          this.getReservedSeats();
          this.getSelectedSeats();
        })
        .catch((err) => {
          if (err.status === 409) {
            this.message = 'Это место уже занято.';
            this.getReservedSeats();
          }
        });
    }
  }

  getFirstUpperRow(sectorNumber) {
    let sectorDividers = {
      "1": 19,
      "2": 20,
      "8": 20,
      "9": 19,
      "10": 15,
      "11": 15,
      "12": 15,
      "13": 15,
      "14": 15,
      "15": 15,
      "16": 15,
      "17": 15,
      "18": 15,
      "19": 15,
      "20": 15,
      "22": 9,
      "23": 9,
      "24": 9,
      "25": 9,
      "26": 9,
      "27": 9,
      "28": 9,
      "29": 9,
    };
    return sectorDividers[sectorNumber] || 1;
  }

  makeArrayFromNumber (number) {
    return [...Array(parseInt(number) + 1).keys()].filter(Boolean);
  }

  isSkybox() {
    let skyBoxes = ['SB_1', 'SB_2', 'SB_3_5', 'SB_6', 'SB_7', 'SB_8', 'SB_9', 'SB_10', 'SB_11' ];
    return skyBoxes.includes(this.sector.name);
  }

  pay() {
    this.cartService.pay()
      .then((order) => {
        this.tickets = order.tickets;
      console.log('order', order);
        this.cartService.loadCart()
          .then(() => {
            this.printTickets = [];
            this.printTickets = angular.copy(this.tickets);
            this.updateReservedTickets();
          });
      })
      .catch((err) => {
        if (err.status === 406) {
          this.isReserveSuccess = true;
        } else {
          this.message = 'err';
        }
      });
  }

  ticketRendering(){
    this.printTicketService.print();
  }

}
