import React from 'react';
import { Popover } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';

const LockPopover = props => {
  const content = props.content;
  return (
    <>
      <Popover trigger="hover" content={content}>
        <QuestionCircleFilled />
      </Popover>
    </>
  );
};

export default LockPopover;
