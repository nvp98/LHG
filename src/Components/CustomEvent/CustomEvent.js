import { Popover } from 'antd';
import React from 'react';

const CustomEvent = ({ event }) => {
  const content = <div></div>;
  return (
    // <Popover
    //   content={content}
    //   trigger={
    //     event.type === 'work' &&
    //     event.DoctorTimeslots.capacity - event.capacity > 0
    //       ? 'click'
    //       : ''
    //   }
    // >
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <span>
        <strong style={{ width: '100%', height: '100%' }}>{event.title}</strong>
      </span>
    </div>
    // </Popover>
  );
};

export default CustomEvent;
