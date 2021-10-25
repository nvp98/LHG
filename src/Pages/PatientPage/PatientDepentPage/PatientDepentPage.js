import {
  CalendarFilled,
  ContactsFilled,
  PlusSquareFilled,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Col, Collapse, Image, message, Row, Tabs } from 'antd';
import {
  downloadAttachmentFile,
  getRelativeID,
  putResetRelativeOTP,
  getAllBooking,
} from 'Api';
import {
  DATE_FORMAT,
  PATIENT_RESET_OTP,
  PATIENT_RECORDHEATH,
} from 'GlobalConstants';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { convertPatientRelative } from 'Utils/Helpers';
import { CANCEL, DONE, RECEIVED, EXPIRE, WAITING } from 'GlobalConstants';
import './PatientDepentPage.scss';

const { TabPane } = Tabs;
const { Panel } = Collapse;

const PatientDepentPage = props => {
  const { history, match, listkey } = props;
  const { id } = match.params;
  const [avatarDepent, setAvatarDepent] = useState();
  const [depent, setDepent] = useState([]);

  const [bookingNext, setBookingNext] = useState([]);
  const [bookingPre, setBookingPre] = useState([]);
  const [moreNext, setMoreNext] = useState(4);
  const [morePre, setMorePre] = useState(4);

  useEffect(() => {
    initData();
  }, [setDepent]);

  const resetOTP = async () => {
    try {
      await putResetRelativeOTP(id);
      initData();
      return message.success('Đặt lại OTP thành công');
    } catch (err) {
      message.error('Đặt lại OTP thất bại');
    }
  };

  const initData = async () => {
    const { data } = await getRelativeID(id);
    setDepent(data);

    const next = await getAllBooking({
      relativeId: id,
      schedule: 'next',
    });
    setBookingNext(next.data.items);
    const previous = await getAllBooking({
      relativeId: id,
      schedule: 'previous',
    });
    setBookingPre(previous.data.items);

    const imgdepent = await fetchAvatar(data.avatarId);
    setAvatarDepent(imgdepent);
  };
  const fetchAvatar = async avatarId => {
    if (avatarId) {
      const response = await downloadAttachmentFile(avatarId);
      const arrayBufferView = new Uint8Array(response.data); //change url respon
      const blob = new Blob([arrayBufferView], { type: 'image/png' });
      const urlCreator = window.URL || window.webkitURL;
      const imageUrl = urlCreator.createObjectURL(blob);
      // setAvatar(imageUrl)
      return imageUrl;
    }
  };
  const click = id => {
    history.push(`/admin/appointment/edit/${id}`);
  };
  const changeStatus = status => {
    switch (status) {
      case WAITING:
        return (
          <div style={{ color: '#205072 ', margin: 'auto' }}>Đang chờ</div>
        );
      case RECEIVED:
        return (
          <div style={{ color: '#00D4C0 ', margin: 'auto' }}>Tiếp nhận</div>
        );
      case DONE:
        return <div style={{ color: '#00D4C0 ', margin: 'auto' }}>Đã xong</div>;
      case CANCEL:
        return <div style={{ color: '#FF0000 ', margin: 'auto' }}>Đã hủy</div>;
      case EXPIRE:
        return <div style={{ color: '#FF0000 ', margin: 'auto' }}>Quá hạn</div>;
      default:
        break;
    }
  };

  return (
    <div className="depent">
      <h2 style={{ fontWeight: '600' }}>Thông tin người phụ thuộc</h2>
      <div className="depent_detail">
        <div className="left">
          <div className="depent_info">
            <Tabs type="card" centered>
              <TabPane tab="Thông tin cơ bản" key="1">
                <Row>
                  <Col xs={8} sm={7} md={5} lg={6}>
                    <p>Tên người phụ thuộc:</p>
                  </Col>
                  <Col xs={16} sm={17} md={19} lg={18}>
                    <span>{depent.name}</span>
                  </Col>
                </Row>
                <Row>
                  <Col xs={8} sm={7} md={5} lg={6}>
                    <p>Mối quan hệ:</p>
                  </Col>
                  <Col xs={16} sm={17} md={19} lg={18}>
                    <span>
                      {depent.relationship
                        ? convertPatientRelative(depent.relationship)
                        : '-'}
                    </span>
                  </Col>
                </Row>
                <Row>
                  <Col xs={8} sm={7} md={5} lg={6}>
                    <p>Ngày sinh:</p>
                  </Col>
                  <Col xs={16} sm={17} md={19} lg={18}>
                    <span>
                      {depent?.dateOfBirth
                        ? depent?.dateOfBirth &&
                          moment(depent?.dateOfBirth).format(DATE_FORMAT)
                        : '-'}
                    </span>
                  </Col>
                </Row>
                <Row>
                  <Col xs={8} sm={7} md={5} lg={6}>
                    <p>Giới tính:</p>
                  </Col>
                  <Col xs={16} sm={17} md={19} lg={18}>
                    <span>
                      {depent.gender === '1'
                        ? 'Nam'
                        : depent.gender === '2'
                        ? 'Nữ'
                        : '-'}
                    </span>
                  </Col>
                </Row>
                <Row>
                  <Col xs={8} sm={7} md={5} lg={6}>
                    <p>Số điện thoại:</p>
                  </Col>
                  <Col xs={16} sm={17} md={19} lg={18}>
                    <span>{depent.phone ? depent.phone : '-'}</span>
                  </Col>
                </Row>
                <Row>
                  <Col xs={8} sm={7} md={5} lg={6}>
                    <p>Địa chỉ:</p>
                  </Col>
                  <Col xs={16} sm={17} md={19} lg={18}>
                    <span>{depent.address ? depent.address : '-'}</span>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tab="Thông tin bổ sung" key="2">
                <Row>
                  <Col xs={8} sm={7} md={5} lg={5}>
                    <p>CMND/CCCD/Hộ chiếu:</p>
                  </Col>
                  <Col xs={16} sm={17} md={19} lg={19}>
                    <span>{depent.identity ? depent.identity : '-'}</span>
                  </Col>
                </Row>
                <Row>
                  <Col xs={8} sm={7} md={5} lg={5}>
                    <p>Nghề nghiệp:</p>
                  </Col>
                  <Col xs={16} sm={17} md={19} lg={19}>
                    <span>{depent.career ? depent.career : '-'}</span>
                  </Col>
                </Row>
                <Row>
                  <Col xs={8} sm={7} md={5} lg={5}>
                    <p>Quốc tịch:</p>
                  </Col>
                  <Col xs={16} sm={17} md={19} lg={19}>
                    <span>{depent.country ? depent.country : '-'}</span>
                  </Col>
                </Row>
                <Row>
                  <Col xs={8} sm={7} md={5} lg={5}>
                    <p>Email:</p>
                  </Col>
                  <Col xs={16} sm={17} md={19} lg={19}>
                    <span>{depent.email ? depent.email : '-'}</span>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tab="Thông tin sức khỏe" key="3">
                <Row>
                  <Col xs={8} sm={7} md={5} lg={5}>
                    <p>Nhóm máu:</p>
                  </Col>
                  <Col xs={16} sm={17} md={19} lg={19}>
                    <span>{depent.bloodGroup ? depent.bloodGroup : '-'}</span>
                  </Col>
                </Row>
                <Row>
                  <Col xs={8} sm={7} md={5} lg={5}>
                    <p>Chiều cao (cm):</p>
                  </Col>
                  <Col xs={16} sm={17} md={19} lg={19}>
                    <span>{depent.height ? depent.height : '-'}</span>
                  </Col>
                </Row>
                <Row>
                  <Col xs={8} sm={7} md={5} lg={5}>
                    <p>Cân nặng (kg):</p>
                  </Col>
                  <Col xs={16} sm={17} md={19} lg={19}>
                    <span>{depent.weight ? depent.weight : '-'}</span>
                  </Col>
                </Row>
                <Row>
                  <Col xs={8} sm={7} md={5} lg={5}>
                    <p>Dị ứng:</p>
                  </Col>
                  <Col xs={16} sm={17} md={19} lg={19}>
                    <span>{depent.allergy ? depent.allergy : '-'}</span>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </div>
          <div className="other_info">
            <Tabs type="card">
              <TabPane
                className="collapse"
                tab="Lịch hẹn khám"
                key="1"
                style={{ width: '100%' }}
              >
                <Collapse
                  expandIconPosition="right"
                  bordered={false}
                  defaultActiveKey={2}
                >
                  <Panel header="Các lịch hẹn trong quá khứ" key="1">
                    <div>
                      {bookingPre.slice(0, morePre).map((item, index) => {
                        return (
                          <div
                            className="tab_appointment_schedule"
                            onClick={() => click(item.id)}
                            style={{ display: 'flex' }}
                          >
                            <div style={{ width: '80%' }}>
                              <div>
                                <CalendarFilled />
                                <span>
                                  {item.timeslot?.startTime &&
                                  item.timeslot?.endTime ? (
                                    `${moment(
                                      item.timeslot?.startTime,
                                      'HH:mm:ss'
                                    ).format('HH:mm')} - ${moment(
                                      item.timeslot?.endTime,
                                      'HH:mm:ss'
                                    ).format('HH:mm')},`
                                  ) : (
                                    <>
                                      <span style={{ color: 'red' }}>
                                        --:--
                                      </span>
                                      {` - `}
                                      <span style={{ color: 'red' }}>
                                        --:--
                                      </span>
                                      ,
                                    </>
                                  )}
                                  {` ${moment(item.timeslot?.day).format(
                                    DATE_FORMAT
                                  )}`}
                                </span>
                              </div>
                              <div>
                                <PlusSquareFilled />
                                <span>Chuyên khoa {item.specialist?.name}</span>
                              </div>
                              <div>
                                <ContactsFilled />
                                <span>{item.doctor?.name}</span>
                              </div>
                            </div>
                            {changeStatus(item.status)}
                          </div>
                        );
                      })}
                    </div>
                    <p
                      style={{
                        textAlign: 'center',
                        display: bookingPre.length < morePre ? 'none' : 'block',
                      }}
                    >
                      <a
                        onClick={() => {
                          setMorePre(morePre + 10);
                        }}
                      >
                        Xem thêm
                      </a>
                    </p>
                  </Panel>
                  <Panel header="Các lịch hẹn tiếp theo" key="2">
                    <div>
                      {bookingNext.slice(0, moreNext).map((item, index) => {
                        return (
                          <div
                            className="tab_appointment_schedule"
                            onClick={() => click(item.id)}
                            style={{ display: 'flex' }}
                          >
                            <div style={{ width: '80%' }}>
                              <div>
                                <CalendarFilled />
                                <span>
                                  {item.timeslot?.startTime &&
                                  item.timeslot?.endTime ? (
                                    `${moment(
                                      item.timeslot?.startTime,
                                      'HH:mm:ss'
                                    ).format('HH:mm')} - ${moment(
                                      item.timeslot?.endTime,
                                      'HH:mm:ss'
                                    ).format('HH:mm')},`
                                  ) : (
                                    <>
                                      <span style={{ color: 'red' }}>
                                        --:--
                                      </span>
                                      {` - `}
                                      <span style={{ color: 'red' }}>
                                        --:--
                                      </span>
                                      ,
                                    </>
                                  )}
                                  {` ${moment(item.timeslot?.day).format(
                                    DATE_FORMAT
                                  )}`}
                                </span>
                              </div>
                              <div>
                                <PlusSquareFilled />
                                <span>Chuyên khoa {item.specialist?.name}</span>
                              </div>
                              <div>
                                <ContactsFilled />
                                <span>{item.doctor?.name}</span>
                              </div>
                            </div>
                            {changeStatus(item.status)}
                          </div>
                        );
                      })}
                    </div>
                    <p
                      style={{
                        textAlign: 'center',
                        display:
                          bookingNext.length < moreNext ? 'none' : 'block',
                      }}
                    >
                      <a
                        onClick={() => {
                          setMoreNext(moreNext + 10);
                        }}
                      >
                        Xem thêm
                      </a>
                    </p>
                  </Panel>
                </Collapse>
              </TabPane>
            </Tabs>
          </div>
        </div>
        <div className="right">
          <div className="patient-right">
            <div className="avatar">
              <Avatar size={150} icon={<UserOutlined />} src={avatarDepent} />
            </div>
            <div className="depent-name">
              <h2>
                {depent.name}
                <span> | </span>
                <span>
                  {depent.relationship
                    ? convertPatientRelative(depent.relationship)
                    : ' '}
                </span>
              </h2>
              <p>
                Ngày tạo thông tin:
                <span> </span>
                <span>
                  {depent?.createdDate
                    ? depent?.createdDate &&
                      moment(depent?.createdDate).format(`HH:mm ${DATE_FORMAT}`)
                    : ''}
                </span>
              </p>
            </div>
            {/* <div style={{ paddingTop: '20px', width: '208px', margin: 'auto' }}>
              <Button
                style={{ boxShadow: '15px 15px 40px #329D9C36' }}
                onClick={resetOTP}
              >
                RESET OTP
              </Button>
            </div> */}
            <div
              style={{
                paddingTop: '20px',
                width: '208px',
                margin: 'auto',
                display: listkey.includes(PATIENT_RECORDHEATH)
                  ? 'block'
                  : 'none',
              }}
            >
              <Link
                to={{
                  pathname: `/admin/patient/medical-records/${depent.id}`,
                  state: { patientId: depent.patientId },
                }}
              >
                <Button style={{ boxShadow: '15px 15px 40px #329D9C36' }}>
                  {depent.code ? depent.code : 'LIÊN KẾT HỒ SƠ Y TẾ'}
                </Button>
              </Link>
            </div>
            <div
              style={{
                paddingTop: '20px',
                width: '208px',
                margin: 'auto',
                display: listkey.includes(PATIENT_RESET_OTP) ? 'block' : 'none',
              }}
            >
              <Button
                style={{ boxShadow: '15px 15px 40px #329D9C36' }}
                onClick={resetOTP}
              >
                RESET OTP
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDepentPage;
