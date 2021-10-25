import moment from 'moment';
import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import './CustomBigCalendar.scss';
// import WorkWeek from 'Components/WorkWeek/workWeek';
const localizer = momentLocalizer(moment);

const CustomBigCalendar = props => {
  return (
    <div className="big-calendar">
      <Calendar
        {...props}
        // style={{
        //   height: 600,
        // }}
        timeslots={1}
        localizer={localizer}
        min={props.min || new Date(0, 0, 0, 7)}
        max={props.max || new Date(0, 0, 0, 18)}
      />
    </div>
  );
};

export default CustomBigCalendar;
