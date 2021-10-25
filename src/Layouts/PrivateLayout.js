import React, { Suspense } from 'react';
import SideBar from 'Components/SideBar/SideBar';
import LogoutComponent from '../Components/Logout/Logout';
import LogoutImg from '../Assets/Images/logout-white.png';
import { useDispatch, useSelector} from "react-redux";
import { Layout, Spin, Button } from 'antd';
import { useHistory } from 'react-router';
import _ from 'lodash';
import Logout from "../Assets/Images/logout.png";
const { Content } = Layout;

export const PrivateLayout = props => {
  const { collapsed } = useSelector(state => state.sideBarReducer);
  const permision = props.children?.props.permision;
  const history = useHistory();

  const handleBack = () => {
    history.goBack();
  };

  const mainPages = [
    '/admin',
    '/admin/patient',
    '/admin/appointment',
    '/admin/doctor',
    '/admin/timeslot',
    '/admin/permission/user',
    '/admin/permission/group',
    '/admin/promotion',
    '/admin/content',
    '/admin/banner',
  ];

  return (
    <>
      {/* {console.log(props.children, 'props')} */}
      <Layout style={{ minHeight: '80vh' }} className="app-layout">
        <SideBar />
        <Layout>
          <Content
            style={{
              margin: '15px 15px 15px 215px',
              background: '#FFFFFF',
              borderRadius: 20,
              marginLeft: collapsed ? '95px' : '215px',
            }}
          >
            <Suspense
              fallback={
                <Spin>
                  <div className="is-spining" />
                </Spin>
              }
            >
              <div className="main-content">
                <div className="main-header-table">
                  {!_.includes(mainPages, props.children?.props.match.path) && (
                    <div onClick={handleBack} className='detail-back-container'>
                      <span className='detail-back-text'>Quay lại</span>
                    </div>
                  )}
                  <LogoutComponent className="logout-table" img={LogoutImg} />
                </div>
                <div className="content_wrap">
                  {permision === 'null' ? (
                    ''
                  ) : permision === false ? (
                    <p style={{ fontWeight: 'bold' }}>
                      Bạn không có quyền truy cập vào tính năng này. Vui lòng
                      liên hệ quản trị để được hỗ trợ
                    </p>
                  ) : (
                    props.children
                  )}
                  {/* {props.children} */}
                </div>
              </div>
            </Suspense>
          </Content>
        </Layout>
      </Layout>
    </>
  );
};
