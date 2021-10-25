import { DownOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Menu } from 'antd';
import logo from 'Assets/Images/LHG_logo_short.svg';
import { TOKEN_KEY, REFRESH_TOKEN } from 'GlobalConstants';
import React, { useEffect, useState } from 'react';
import { getCookie, removeCookie } from 'Utils/Helpers/cookie';
import './Header.scss';
import { useHistory } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import title from '../../Assets/Images/title.svg';

const HeaderComponent = () => {
  const history = useHistory();
  const [display, setDisplay] = useState('none');
  const logout = () => {
    removeCookie(TOKEN_KEY);
    removeCookie(REFRESH_TOKEN);
    history.push('/login');
  };
  useEffect(() => {
    const { pathname } = history.location;
    if (pathname === '/login') {
      setDisplay('initial');
    }
  }, [history]);

  const menu = (
    <Menu>
      <Menu.Item key="1">
        <div onClick={logout}>Đăng xuất</div>
      </Menu.Item>
    </Menu>
  );
  return (
    <div className="header">
      <div className="logo">
        <img src={logo} className="logo-lhg" alt="Lim Health Go" />
        <div className="title_wrap">
          <img className="slogan-lhg" src={title} />
        </div>
      </div>
      <div className="title_center">
        <p style={{ display: `${display}`, fontWeight: 'bold' }}>CÔNG TY TNHH ĐẦU TƯ VÀ THƯƠNG MẠI ÁNH DƯƠNG SUNSHINE</p>
        <br/>
        <p style={{ display: `${display}` }}>02 Thi Sách, phường Bến Nghé, quận 1, TP. Hồ Chí Minh</p>
      </div>

      {getCookie(TOKEN_KEY) && (
        <div className="header-item">
          <Dropdown overlay={menu} trigger={['click']}>
            <div
              className="ant-dropdown-link"
              onClick={e => e.preventDefault()}
            >
              <Avatar
                className="avatar-icon"
                size={32}
                icon={<UserOutlined />}
              />
              {jwt_decode(getCookie(TOKEN_KEY)).username} <DownOutlined />
            </div>
          </Dropdown>
        </div>
      )}
    </div>
  );
};

export default HeaderComponent;
