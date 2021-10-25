import { DownOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Menu } from 'antd';
import { TOKEN_KEY, REFRESH_TOKEN } from 'GlobalConstants';
import React, { useEffect } from 'react';
import { getCookie, removeCookie } from 'Utils/Helpers/cookie';
import './Logout.scss';
import { useHistory } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import Logout from "../../Assets/Images/logout.png"

const LogoutComponent = ({className, img}) => {
  const history = useHistory();
  const logout = () => {
    removeCookie(TOKEN_KEY);
    removeCookie(REFRESH_TOKEN);
    history.push('/login');
  };
  useEffect(() => {
    const { pathname } = history.location;
    if (pathname === '/login') {
    }
  }, [history]);

  return (
    <div className={className}>
      {getCookie(TOKEN_KEY) && (
        <div onClick={logout} className='logout-container'>
          <span className='text-logout'>Đăng xuất</span>
          <img className='img-logout' src={img || Logout}/>
        </div>
      )}
    </div>
  );
};

// <div className="header-item">
//   <Dropdown overlay={menu} trigger={['click']}>
//     <div
//       className="ant-dropdown-link"
//       onClick={e => e.preventDefault()}
//     >
//       <Avatar
//         className="avatar-icon"
//         size={32}
//         icon={<UserOutlined />}
//       />
//       {jwt_decode(getCookie(TOKEN_KEY)).username} <DownOutlined />
//     </div>
//   </Dropdown>
// </div>

export default LogoutComponent;
