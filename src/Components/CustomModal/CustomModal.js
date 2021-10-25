import { Button, Modal } from 'antd';
import React from 'react';
import './CustomModal.scss';

const CustomModal = props => {
  const { type, onOk, onCancel, children } = props;

  return (
    <div>
      <Modal
        {...props}
        className={type || 'default'}
        destroyOnClose={true}
        keyboard={true}
        footer={
          props.footer || [
            <Button key="submit" onClick={onOk}>
              ĐỒNG Ý
            </Button>,
            <Button className="btn-white" key="back" onClick={onCancel}>
              QUAY LẠI
            </Button>,
          ]
        }
      >
        <div className="modal-content">{children}</div>
      </Modal>
    </div>
  );
};

export default CustomModal;
