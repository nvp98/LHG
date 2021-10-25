import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import './Footer.scss';

const Footer = () => {
  const history = useHistory();
  const [display, setDisplay] = useState('');

  useEffect(() => {
    const { pathname } = history.location;
    if (pathname === '/login') {
      setDisplay('login');
    }
  }, [history]);
  return (
    <div id="Footer">
      {/*{display === 'login' ? (*/}
      {/*  <p style={{ padding: '15px' }}>*/}
      {/*    CÔNG TY TNHH ĐẦU TƯ VÀ THƯƠNG MẠI ÁNH DƯƠNG SUNSHINE <br /> 02 Thi*/}
      {/*    sách, phường Bến Nghé, quận 1, TP.Hồ Chí Minh.*/}
      {/*  </p>*/}
      {/*) : (*/}
      {/*  <p style={{ padding: '20px' }}>2020 © Bản quyền thuộc SunShine</p>*/}
      {/*)}*/}
      <p style={{ padding: '20px' }}>2020 © Bản quyền thuộc SunShine</p>
    </div>
  );
};

export default Footer;
