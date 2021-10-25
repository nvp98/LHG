import { Layout, Menu } from 'antd';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  collapseAction,
  collapseActionSubmenu,
  setCurrentParamsAction,
} from 'Redux/Actions';
import icon5 from '../../Assets/Images/ic_permission.png';
import icon1 from '../../Assets/Images/ic_patient.png';
import icon2 from '../../Assets/Images/ic_doctor.png';
import icon3 from '../../Assets/Images/ic_appointment.png';
import icon4 from '../../Assets/Images/ic_timeslot.png';
import icon6 from '../../Assets/Images/ic_content.png';
import './SideBar.scss';
import logo from 'Assets/Images/LHG_logo_short.svg';
import title from '../../Assets/Images/title.svg';
import _ from 'lodash';

const { Sider } = Layout;
const { SubMenu } = Menu;

const Sidebar = () => {
  const dispatch = useDispatch();
  const { collapsed } = useSelector(state => state.sideBarReducer);
  const { collapsedSubmenu } = useSelector(state => state.submenuReducer);
  let history = useHistory();
  const [selectedKey, setSelectedKey] = useState('');
  const [homePage, setHomePage] = useState(false);
  useEffect(() => {
    const { pathname } = history.location;
    const activeKey = 'doctor';
    const menuActive = [
      { pathname: '/patient', key: 'patient' },
      { pathname: '/doctor', key: 'doctor' },
      { pathname: '/timeslot', key: 'timeslot' },
      { pathname: '/appointment', key: 'appointment' },
      { pathname: '/permission/user', key: 'userPermission' },
      { pathname: '/permission/group', key: 'groupPermission' },
      { pathname: '/permission/edit/user', key: 'userPermission' },
      { pathname: '/permission/edit/group', key: 'groupPermission' },
      { pathname: '/permission/add/user', key: 'userPermission' },
      { pathname: '/permission/add/group', key: 'groupPermission' },
      { pathname: '/promotion', key: 'promotion' },
      { pathname: '/content', key: 'content' },
      { pathname: '/banner', key: 'banner' },
    ];

    if (pathname === '/' || pathname === '/admin' || pathname === '/admin/') {
      // setSelectedKey(activeKey);
      setHomePage(true);
      history.push(`/admin`);
    } else {
      for (let i = 0; i < menuActive.length; i++) {
        if (pathname?.indexOf(menuActive[i].pathname) > -1) {
          setSelectedKey(menuActive[i].key);
        }
      }
      setHomePage(false);
    }
  }, [history]);

  const onCollapse = () => {
    dispatch(collapseAction(!collapsed));
  };
  const openChange = openKeys => {
    dispatch(collapseActionSubmenu(openKeys));
  };

  const onOpenSelected = data => {
    if (
      !_.includes(
        ['userPermission', 'groupPermission', 'promotion', 'content', 'banner'],
        data.key
      )
    ) {
      dispatch(collapseActionSubmenu([]));
    }
    dispatch(setCurrentParamsAction());
    switch (data.key) {
      case 'patient':
        history.push('/admin/patient');
        break;
      case 'appointment':
        history.push('/admin/appointment');
        break;
      case 'doctor':
        history.push('/admin/doctor');
        break;
      case 'timeslot':
        history.push('/admin/timeslot');
        break;
      case 'userPermission':
        history.push('/admin/permission/user');
        break;
      case 'groupPermission':
        history.push('/admin/permission/group');
        break;
      case 'promotion':
        history.push('/admin/promotion');
        break;
      case 'content':
        history.push('/admin/content');
        break;
      case 'banner':
        history.push('/admin/banner');
        break;
      default:
        break;
    }
  };

  return (
    <Sider
      className="site-layout-background"
      // collapsible
      // collapsed={homePage ? false : collapsed}
      // onCollapse={onCollapse}
      collapsible
      collapsed={homePage ? false : collapsed}
      onCollapse={onCollapse}
      trigger={homePage ? null : ''}
    >
      <div className="title_wrap">
        <div style={{ justifyContent: 'center', display: 'flex' }}>
          <img src={logo} style={{ width: '30%' }} alt="Lim Health Go" />
        </div>
        {/*<div*/}
        {/*  style={{ justifyContent: 'center', display: 'flex', marginTop: 7 }}*/}
        {/*>*/}
        {/*  <img src={title} style={{ width: '45%' }} />*/}
        {/*</div>*/}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        // defaultOpenKeys={['doctor']}
        style={{ height: '100%', borderRight: 0 }}
        onClick={onOpenSelected}
        style={{
          backgroundColor: `${homePage ? 'rgba(0, 0, 0, 0) ' : 'none'}`,
        }}
        openKeys={collapsedSubmenu}
        onOpenChange={openKeys => openChange(openKeys)}
      >
        <Menu.Item key="patient">
          <span
            className="side-icon anticon anticon-usergroup-add side-icon"
            style={{ marginRight: '10px' }}
          >
            <img src={icon1}></img>
          </span>
          <span>NGƯỜI BỆNH</span>
        </Menu.Item>
        <Menu.Item key="doctor">
          <span
            className="side-icon anticon anticon-usergroup-add side-icon"
            style={{ marginRight: '10px' }}
          >
            <img src={icon2}></img>
          </span>
          <span>BÁC SĨ</span>
        </Menu.Item>
        <Menu.Item key="appointment">
          <span
            className="side-icon anticon anticon-usergroup-add side-icon"
            style={{ marginRight: '10px' }}
          >
            <img src={icon3}></img>
          </span>
          <span>LỊCH HẸN</span>
        </Menu.Item>
        <Menu.Item key="timeslot">
          <span
            className="side-icon anticon anticon-usergroup-add side-icon"
            style={{ marginRight: '10px' }}
          >
            <img src={icon4}></img>
          </span>
          <span>KHUNG GIỜ</span>
        </Menu.Item>
        <Menu.SubMenu
          title="PHÂN QUYỀN"
          icon={
            <span
              className="side-icon anticon anticon-usergroup-add side-icon"
              style={{
                marginRight: '10px',
                backgroundColor: 'rgba(0, 0, 0, 0)',
              }}
            >
              <img src={icon5}></img>
            </span>
          }
          key="permission"
        >
          <Menu.Item
            key="userPermission"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
          >
            <span>Cá nhân</span>
          </Menu.Item>
          <Menu.Item
            key="groupPermission"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
          >
            <span>Nhóm</span>
          </Menu.Item>
        </Menu.SubMenu>

        <SubMenu
          key="noidung"
          icon={
            <span
              className="side-icon anticon anticon-usergroup-add side-icon"
              style={{ marginRight: '10px' }}
            >
              <img src={icon6}></img>
            </span>
          }
          title="NỘI DUNG"
        >
          <Menu.Item
            key="promotion"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
          >
            <span>CTKM</span>
          </Menu.Item>
          <Menu.Item
            key="content"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
          >
            <span>Nội dung</span>
          </Menu.Item>
          <Menu.Item
            key="banner"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
          >
            <span>Banner</span>
          </Menu.Item>
        </SubMenu>
      </Menu>
      <div className="sidebar-footer">
        <p className="sidebar-footer-text">{`${!collapsed ? '2020 © Bản quyền thuộc SunShine' : ''}`}</p>
      </div>
    </Sider>
  );
};

export default Sidebar;
