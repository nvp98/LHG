import { Button, Form, Input, message } from 'antd';
import { postAuthLogin } from 'Api';
import { REFRESH_TOKEN, TOKEN_KEY, USER_ID } from 'GlobalConstants';
import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { setCookie, getCookie } from 'Utils/Helpers/';
import logo from '../../Assets/Images/LHG_logo.png';
import Footer from '../../Components/Footer/Footer';
import Header from '../../Components/Header/Header';
import './LoginPage.scss';
import background from '../../Assets/Images/background.png';
import {UserOutlined, LockOutlined} from "@ant-design/icons";

const LoginPage = props => {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async values => {
    try {
      setIsSubmiting(true);
      const body = {
        username: values.username,
        password: values.password,
        deviceId: '',
      };
      const { data } = await postAuthLogin(body);
      setCookie(TOKEN_KEY, data.accessToken);
      setCookie(REFRESH_TOKEN, data.refreshToken);
      setCookie(USER_ID, data.userId);
      props.history.push('/admin');
    } catch (error) {
      form.resetFields();
      if (
        error.status === 400 &&
        error.data.message == 'User has been block!'
      ) {
        message.error(
          'Tài khoản không khả dụng. Vui lòng liên hệ Bộ phận Kỹ thuật để được hỗ trợ.'
        );
      } else
        message.error(
          'Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng thử lại.'
        );
      setIsSubmiting(false);
    }
  };
  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 16,
    },
  };

  return !getCookie(TOKEN_KEY) ? (
    <div
      style={{
        backgroundImage: `url(${background})`,
        backgroundRepeat: 'round',
        // backgroundSize: '100% 100%',
      }}
    >
      <Header />
      <div
        id="login-content"
      >
        <div className="login-wrap">
          <div className="logo">
            {/*<img src={logo} alt="Lim Health Go" />*/}
          </div>
          <Form
            {...layout}
            onFinish={onFinish}
            className="login-form"
            layout={'vertical'}
            form={form}
          >
            <Form.Item
              name="username"
              label="Tên đăng nhập:"
              rules={[
                {
                  message: 'Vui lòng nhập tên đăng nhập.',
                },
              ]}
            >
              <Input
                placeholder="Vui lòng nhập tên đăng nhập"
                prefix={<UserOutlined className="site-form-item-icon" />}
              />
            </Form.Item>
            <Form.Item
              name="password"
              label="Mật khẩu:"
              rules={[
                {
                  message: 'Vui lòng nhập mật khẩu.',
                },
              ]}
            >
              <Input.Password
                placeholder="Vui lòng nhập mật khẩu"
                prefix={<LockOutlined className="site-form-item-icon" />}
                // style={{ backgroundColor: '#61C8CE', color: '#FFFFFF' }}
              />
            </Form.Item>
            <div style={{ textAlign: 'center' }}>
              <Button
                loading={isSubmiting}
                className="btn-primary login-form-button"
                htmlType="submit"
                style={{
                  height: 'auto',
                  textTransform: 'initial',
                }}
              >
                Đăng nhập
              </Button>
            </div>
          </Form>
        </div>
      </div>
      <Footer />
    </div>
  ) : (
    <Redirect
      to={{
        pathname: '/admin',
      }}
    />
  );
};

export default LoginPage;
