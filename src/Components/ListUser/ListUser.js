import React, { useState, useEffect } from 'react';
import deleteIcon from '../../Assets/Images/icon_delete.svg';
import CustomModal from 'Components/CustomModal/CustomModal';
import { Pagination } from 'antd';
import { deleteUserOfGroup, getGroupID } from 'Api';
import './ListUser.scss';
import data from './data.json';

const ListUser = props => {
  const { w, userList } = props;
  const [page, setPage] = useState(1);
  const [isShowModal, setIsShowModal] = useState(false);
  const [itemUser, setItemUser] = useState({});
  const [modal, setModal] = useState({
    content: '',
    onOk: () => {},
  });
  function changePage(page, pageSize) {
    setPage(page);
  }
  function deleteUser(item) {
    setItemUser(item);
    setIsShowModal(true);
  }
  const onOk = () => {
    deleteUserOfGroup(itemUser.id)
      .then(res => {
        getGroupID(userList.id)
          .then(data => {
            props.userCallback(data.data);
          })
          .catch(err => {});
      })
      .catch(err => console.log(err));
    setIsShowModal(false);
  };

  return (
    <div className="user-wrap" style={{ width: w }}>
      <div className="list-user">
        {userList.users
          .slice((page - 1) * 20, (page - 1) * 20 + 20)
          .map((item, index) => (
            <div className="item-user" key={`${item.id}-${index}`}>
              {`${item.username} - ${item.name}`}
              <span>
                <img src={deleteIcon} onClick={() => deleteUser(item)} />
              </span>
            </div>
          ))}
      </div>
      <Pagination
        defaultCurrent={1}
        pageSize={20}
        total={userList.users.length}
        onChange={changePage}
        showSizeChanger={false}
      />
      <CustomModal
        visible={isShowModal}
        // type="warning"
        // title="Cảnh báo"
        onOk={onOk}
        onCancel={() => setIsShowModal(false)}
        footer={modal.footer}
      >
        <p>
          Bạn có chắc chắn muốn{' '}
          <span style={{ color: 'red', fontWeight: '600' }}>
            GỠ BỎ {itemUser.name}{' '}
          </span>
          khỏi nhóm{' '}
          <span style={{ color: 'red', fontWeight: '600' }}>
            {userList.name}
          </span>{' '}
          ?
        </p>
        <p>Toàn bộ phân quền cá nhân sẽ bị xóa.</p>
        <p>Bạn không thể khôi phục lại dữ liệu sau khi nhấn "Đồng ý".</p>
      </CustomModal>
    </div>
  );
};

export default ListUser;
