const CalendarComponent = {
  template: `<div class="col-md-6">
    <p class="input-group">
        <input type="text" class="form-control"
               uib-datepicker-popup='dd-MMMM-yyyy'
               ng-model="$ctrl.date"
               ng-change="$ctrl.dateChanges()"
               is-open="$ctrl.popup.opened"
               datepicker-options="$ctrl.dateOptions"
               ng-required="true"
               show-button-bar="false"
               alt-input-formats="$ctrl.altInputFormats"/>
        <span class="input-group-btn">
            <button type="button" class="btn btn-default"
                    ng-click="$ctrl.open()"><i class="glyphicon glyphicon-calendar"></i></button>
          </span>
    </p>
</div>`,
  bindings: { onDateChanges: '&' },
  controller: class CalendarController {
    constructor() {
      this.date = new Date();
      this.dateOptions = {
        dateDisabled: false,
        formatYear: 'yy',
        maxDate: new Date(),
        minDate: new Date(2017, 1, 1),
        startingDay: 1,
        showWeeks: false
      };

      this.popup = { opened: false };

      this.open = function () { this.popup.opened = true; };
    }

    dateChanges() {
      this.onDateChanges({
        $event: { date: this.date }
      });
    }
  }
};

export default CalendarComponent;