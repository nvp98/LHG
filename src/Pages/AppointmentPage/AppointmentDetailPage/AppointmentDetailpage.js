import React from 'react';
import { Row, Col, Input, Checkbox, Button } from 'antd';
import './AppointmentDetailPage.scss';
const { TextArea } = Input;

const AppointmentDetailpage = () => {
  return (
    <>
      <h2>Chi tiết hẹn khám</h2>
      <div className="appoint-content">
        <Row>
          <Col span={7} className="appoint-col">
            <Row>
              <Col xs={8} sm={10} md={10} lg={10}>
                <p>Mã hẹn khám</p>
              </Col>
              <Col xs={16} sm={14} md={14} lg={14}>
                LHG-1
              </Col>
            </Row>
            <Row>
              <Col xs={8} sm={7} md={5} lg={10}>
                <p>Người bệnh</p>
              </Col>
              <Col xs={16} sm={17} md={19} lg={14}>
                Nguyễn Văn B(BA)
              </Col>
            </Row>
            <Row>
              <Col xs={8} sm={7} md={5} lg={10}>
                <p>Người thân</p>
              </Col>
              <Col xs={16} sm={17} md={19} lg={14}>
                Nguyễn Văn A
              </Col>
            </Row>
          </Col>
          <Col span={7} className="appoint-col">
            <Row>
              <Col xs={8} sm={7} md={5} lg={10}>
                <p>Mã hẹn khám</p>
              </Col>
              <Col xs={16} sm={17} md={19} lg={14}>
                LHG-1
              </Col>
            </Row>
            <Row>
              <Col xs={8} sm={7} md={5} lg={10}>
                <p>Người bệnh</p>
              </Col>
              <Col xs={16} sm={17} md={19} lg={14}>
                Nguyễn Văn B(BA)
              </Col>
            </Row>
            <Row>
              <Col xs={8} sm={7} md={5} lg={10}>
                <p>Người thân</p>
              </Col>
              <Col xs={16} sm={17} md={19} lg={14}>
                Nguyễn Văn A
              </Col>
            </Row>
          </Col>
          <Col span={7} className="appoint-col">
            <Row>
              <Col xs={8} sm={7} md={5} lg={10}>
                <p>Mã hẹn khám</p>
              </Col>
              <Col xs={16} sm={17} md={19} lg={14}>
                LHG-1
              </Col>
            </Row>
            <Row>
              <Col xs={8} sm={7} md={5} lg={10}>
                <p>Người bệnh</p>
              </Col>
              <Col xs={16} sm={17} md={19} lg={14}>
                Nguyễn Văn B(BA)
              </Col>
            </Row>
            <Row>
              <Col xs={8} sm={7} md={5} lg={10}>
                <p>Người thân</p>
              </Col>
              <Col xs={16} sm={17} md={19} lg={14}>
                Nguyễn Văn A
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
      <h2>Lí do hẹn khám</h2>
      <div style={{ width: '500px' }}>
        <TextArea rows={4}></TextArea>
      </div>
      <div className="appoint-checkbox">
        <Checkbox onChange={''}>Khám BHYT</Checkbox>
        <Checkbox onChange={''}>Tái khám</Checkbox>
      </div>
      <h2>Ghi chú</h2>
      <div style={{ width: '500px' }}>
        <TextArea
          rows={6}
          placeholder="nhập ghi chú liên quan đến lịch hẹn khám"
        ></TextArea>
      </div>
      <div className="appoint-btn">
        <Button>Lưu</Button>
        <Button>Hủy hẹn</Button>
      </div>
    </>
  );
};
export default AppointmentDetailpage;
