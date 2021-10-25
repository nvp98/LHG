import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, message } from 'antd';
import {
  getBanner,
  deleteBanner,
  uploadAttachmentFile,
  updateBanner,
} from 'Api';
import CustomModal from 'Components/CustomModal/CustomModal';
import iconDelete from '../../Assets/Images/icon_delete.svg';
import iconPlus from '../../Assets/Images/plus-solid.svg';
import './BannerPage.scss';
import _ from 'lodash';

const BannerPage = () => {
  const [isShowModal, setIsShowModal] = useState();
  const [loading, setLoading] = useState(false);
  const [listBanner, setListBanner] = useState([]);
  const [banner, setBanner] = useState({});
  const [modal, setModal] = useState({
    content: '',
    onOk: () => {},
  });

  const ref = useRef();
  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    try {
      setLoading(true);
      const { data } = await getBanner();
      setListBanner(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const fileHandlerChange = e => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('files', file);
      formData.append('type', 'BANNER');
      formData.append('isEditor', true);
      const dotname = file.name.split('.')[file.name.split('.').length - 1];
      if (dotname == 'png' || dotname == 'jpg') {
        uploadAttachmentFile(formData)
          .then(data => {
            getBanner()
              .then(data => {
                setListBanner(data.data);
              })
              .catch(err => console.log(err));
          })
          .catch(error => console.log(error));
      } else {
        message.error('Tệp tin không đúng định dạng png, jpg');
      }
    }
  };
  const handleClick = () => {
    ref.current.click();
  };
  const deleteBannerClick = item => {
    setBanner(item);
    setIsShowModal(true);
  };
  const onOk = () => {
    deleteBanner(banner.id)
      .then(res => {
        if (res.data.success) {
          // setListBanner(_.filter(listBanner, b => b.id !== banner.id));
          // }
          getBanner()
            .then(data => {
              setListBanner(data.data);
              message.success('Xóa banner thành công');
            })
            .catch(err => console.log(err));
        }
      })
      .catch(err => console.log(err));
    setIsShowModal(false);
  };

  function allowDrop(ev) {
    ev.preventDefault();
  }
  function dragLeave(ev) {
    ev.target.style.border = '';
  }
  function dragEnter(ev) {
    ev.target.style.border = '2px solid red';
  }
  function dragEnd(ev) {
    ev.target.style.opacity = 1;
  }
  function drag(ev) {
    ev.dataTransfer.setDragImage(ev.target, 100, 100);
    ev.dataTransfer.setData('src', ev.target.id);
    ev.target.style.opacity = 0.5;
  }
  function drop(ev) {
    ev.preventDefault();
    const src = document.getElementById(ev.dataTransfer.getData('src'));
    // const srcParent = src.parentNode;
    const tgt = ev.target;
    src.style.opacity = 1;
    tgt.style.border = '';
    if (src.name !== tgt.name) {
      updateBanner(src.id, {
        orderOld: Number(src.name),
        orderNew: Number(tgt.name),
      }).then(res => {
        if (res.data.success) {
          getBanner()
            .then(data => {
              setListBanner(data.data);
            })
            .catch(err => console.log(err));
          // tgt.parentElement.replaceChild(src, tgt);
          // srcParent.appendChild(tgt);
        }
      });
    }
  }

  return (
    <div className="banner-wrap">
      <h2>Danh sách banner</h2>
      <Row>
        {_.sortBy(listBanner, banner => banner.order).map((item, index) => {
          return (
            <Col xs={24} sm={24} md={8} style={{ marginBottom: '60px' }}>
              <div className="banner-item">
                <p>
                  {index + 1}
                  <img
                    src={iconDelete}
                    onClick={() => deleteBannerClick(item)}
                  ></img>
                </p>
                <div
                  onDrop={drop}
                  onDragOver={allowDrop}
                  onDragLeave={dragLeave}
                  onDragEnter={dragEnter}
                  id={`div_${index}`}
                  className="banner-img"
                >
                  <img
                    id={item.id}
                    name={item.order}
                    src={item.fileName}
                    alt="test"
                    draggable={true}
                    onDragEnd={dragEnd}
                    onDragStart={drag}
                  ></img>
                </div>
              </div>
            </Col>
          );
        })}
        <Col
          xs={24}
          sm={24}
          md={8}
          style={{
            marginBottom: '60px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="banner-add">
            <div className="banner-plus" onClick={handleClick}>
              <img src={iconPlus}></img>
            </div>
            <input
              ref={ref}
              type="file"
              name="myImage"
              style={{ display: 'none' }}
              onChange={fileHandlerChange}
            />
          </div>
        </Col>
      </Row>
      <CustomModal
        visible={isShowModal}
        type="warning"
        title="CẢNH BÁO"
        onOk={onOk}
        onCancel={() => setIsShowModal(false)}
        footer={modal.footer}
      >
        <p style={{ marginTop: '-1.3em', marginBottom: '2.5em' }}>
          Banner bị xóa sẽ không thể khôi phục lại. Bạn có muốn tiếp tục không ?
        </p>
      </CustomModal>
    </div>
  );
};

export default BannerPage;
