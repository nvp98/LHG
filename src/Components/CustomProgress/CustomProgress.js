import React from 'react';
import { Progress } from 'antd';
import './CustomProgress.scss';

const CustomProgress = props => {
  return props.arrDay?.map(item => {
    return (
      <div className="process" key={item.day}>
        <div className="process-title" style={{ width: '90px' }}>
          {item.day}
        </div>
        <Progress
          key={item.day}
          percent={item.percent}
          strokeWidth={10}
          format={percent => `${percent}%`}
        />
      </div>
    );
  });
};

export default CustomProgress;
