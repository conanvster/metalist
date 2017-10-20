const CashboxComponent = {
  template: `<div class="container">
    <ul class="nav nav-tabs">
      <li ui-sref="cashbox.daysStatistic" ui-sref-active="active"><a>Статистика за день</a></li>
      <li ui-sref="cashbox.lastTickets" ui-sref-active="active" ><a>Последние билеты</a></li>
      <li ui-sref="cashbox.abonementTicket" ui-sref-active="active" ><a>Регистрация абонемента</a></li>
    </ul>
    <div ui-view></div>
  </div>`

};

export default CashboxComponent;