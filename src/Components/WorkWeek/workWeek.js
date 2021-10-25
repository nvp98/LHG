import PropTypes from 'prop-types';
import React from 'react';

import Week from 'react-big-calendar/lib/Week';
import TimeGrid from 'react-big-calendar/lib/TimeGrid';

const workWeekRange = (date, options) => {
  return Week.range(date, options).filter(d => [0].indexOf(d.getDay()) === -1);
};

const WorkWeek = props => {
  let { date } = props;
  let range = workWeekRange(date, props);

  return <TimeGrid {...props} range={range} eventOffset={15} />;
};

WorkWeek.defaultProps = TimeGrid.defaultProps;

WorkWeek.range = workWeekRange;

WorkWeek.navigate = Week.navigate;

WorkWeek.title = (date, { localizer }) => {
  let [start, ...rest] = workWeekRange(date, { localizer });

  return localizer.format({ start, end: rest.pop() }, 'dayRangeHeaderFormat');
};

WorkWeek.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
};

export default WorkWeek;
