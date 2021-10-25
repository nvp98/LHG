import React from 'react';
import background from '../../Assets/Images/background_home.jpg';
import Footer from '../../Components/Footer/Footer';
import Header from '../../Components/Header/Header';
import SideBar from 'Components/SideBar/SideBar';
import './HomePage.scss';
import star from '../../Assets/Images/star.svg';
import { LOGIN_URL, TOKEN_KEY } from 'GlobalConstants';
import { getCookie } from 'Utils/Helpers';
import { Route, Redirect } from 'react-router-dom';
import LogoutComponent from "../../Components/Logout/Logout";

const HomePage = () => {
  const style = {
    color: '#205072',
  };

  return (
    <>
      <Route>
        {getCookie(TOKEN_KEY) ? (
          <>
            <div
              className="homePage_wrap"
              style={{
                // height: '80vh',
                padding: '0px',
                margin: '0px',
                // backgroundSize: '100% 80vh',
                // height: '100vh',
                // color: "#f5f5f5"
                display: 'flex',
              }}
            >
              <SideBar />

              <div className="homePage_container" style={{backgroundImage: `url(${background})`}}>
                <LogoutComponent className="logout"/>
                <div className="homePage_content">
                  <span style={{ fontWeight: 'bold', fontSize: 21 }}>LIM HEALTH GO</span>
                  <span style={{  }}>GIẢI PHÁP CHĂM SÓC SỨC KHOẺ THÔNG MINH</span>
                  <div className="homePage_present">
                    <p style={style}>
                      <span style={{ fontWeight: 'bold' }}>Lim Health Go</span> –
                      Giải pháp chăm sóc sức khỏe thông minh.
                      <br />
                      Lấy giá trị y tế là trọng tâm,{' '}
                      <span style={{ fontWeight: 'bold' }}>Lim Health Go</span> là
                      giải pháp Chăm sóc sức khỏe thông qua điện thoại thông minh
                      nhằm thay đổi cách tiếp cận dịch vụ y tế theo hướng hiệu quả,
                      tiện lợi và chất lượng, tối giản quy trình khám chữa bệnh
                      thường quy tại bệnh viện. Ứng dụng ra đời với sứ mệnh xây dựng
                      một hệ sinh thái Y tế hoàn chỉnh và toàn diện, tạo nên cầu nối
                      vững chắc giữa <br />
                      <span style={{ color: '#205072', fontWeight: 'bold' }}>
                    BÁC SĨ - NGƯỜI BỆNH - BỆNH VIỆN.
                  </span>
                    </p>
                    <p style={style}>
                      Ứng dụng{' '}
                      <span style={{ fontWeight: 'bold' }}>Lim Health Go</span> mang
                      đến giải pháp kết nối và lưu trữ:
                      <br /> + Đăng kí khám bệnh trực tuyến.
                      <br /> + Cổng thông tin hồ sơ người bệnh.
                      <br /> + Quản lý lịch sử khám chữa bệnh.
                      <br /> + Nhắc hẹn tái khám.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <Redirect
            to={{
              pathname: LOGIN_URL,
            }}
          />
        )}
      </Route>
    </>
  );
};

export default HomePage;
