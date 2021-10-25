import { Tag } from 'antd';
import { CANCEL, DONE, EXPIRE, RECEIVED, WAITING } from 'GlobalConstants';
import React from 'react';

const BookingStatus = ({ status }) => {
  const changeStatus = status => {
    switch (status) {
      case WAITING:
        return 'Đang chờ';
      case RECEIVED:
        return 'Tiếp nhận';
      case DONE:
        return 'Đã xong';
      case CANCEL:
        return 'Đã hủy';
      case EXPIRE:
        return 'Quá hạn';
      default:
        break;
    }
  };
  return (
    <Tag
      color="gold"
      style={{
        fontSize: '1rem',
        float: 'right',
        padding: '10px',
        borderRadius: 10,
      }}
    >
      {changeStatus(status)}
    </Tag>
  );
};

export default BookingStatus;
