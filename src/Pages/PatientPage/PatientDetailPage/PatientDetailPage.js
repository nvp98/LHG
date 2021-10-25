import {
  CalendarFilled,
  ContactsFilled,
  PlusSquareFilled,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  Form,
  Image,
  Input,
  message,
  Rate,
  Row,
  Tabs,
  Spin,
} from 'antd';
import {
  downloadAttachmentFile,
  getPatientID,
  putLockAccount,
  putResetPatientOTP,
  getAllBooking,
  getComment,
  getBookingById,
  putComment,
} from 'Api';
import CustomModal from 'Components/CustomModal/CustomModal';
import LockPopover from 'Components/LockPopover/LockPopover';
import {
  DATE_FORMAT,
  PATIENT_RESET_OTP,
  PATIENT_RECORDHEATH,
  PATIENT_LOCK,
} from 'GlobalConstants';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { convertPatientRelative } from 'Utils/Helpers';
import { CANCEL, DONE, RECEIVED, EXPIRE, WAITING } from 'GlobalConstants';
import VoteStar from 'Components/VoteStar/VoteStar';
import './PatientDetailPage.scss';
const { TabPane } = Tabs;
const { Panel } = Collapse;

const PatientDetailPage = props => {
  const { history, match } = props;
  const { id } = match.params;
  const { listkey } = props;
  const [form] = Form.useForm();
  const [patientDetail, setPatientDetail] = useState([]);
  const [patientDepent, setPatientDepent] = useState([]);
  const [avatar, setAvatar] = useState();
  const [avatarDepent, setAvatarDepent] = useState({});
  const [isShowModal, setIsShowModal] = useState(false);

  const [bookingNext, setBookingNext] = useState([]);
  const [bookingPre, setBookingPre] = useState([]);
  const [voteInfor, setVoteInfo] = useState([]);
  const [bookingCode, setListCode] = useState([]);
  const [doctorName, setListName] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [moreNext, setMoreNext] = useState(3);
  const [morePre, setMorePre] = useState(3);
  const [moreVote, setMoreVote] = useState(3);

  const [modal, setModal] = useState({
    content: '',
    onOk: () => {},
  });

  useEffect(() => {
    initData();
  }, [setPatientDetail]);

  const initData = async () => {
    try {
      const { data } = await getPatientID(id);
      setPatientDetail(data);
      setPatientDepent(data.relatives);
      const img = await fetchAvatar(data.avatarId);
      setAvatar(img);

      let listAvatar = {};
      await Promise.all(
        data.relatives.map(async item => {
          const imageUrl = await fetchAvatar(item.avatarId);
          listAvatar[item.avatarId] = imageUrl;
        })
      );
      setAvatarDepent(listAvatar);

      const next = await getAllBooking({
        patientId: id,
        schedule: 'next',
      });
      setBookingNext(next.data.items);
      const previous = await getAllBooking({
        patientId: id,
        schedule: 'previous',
      });
      setBookingPre(previous.data.items);
      const voteInfor = await getComment({
        patientId: id,
        sortBy: 'createdDate',
        sortType: 'DESC',
      });
      setVoteInfo(voteInfor.data.items);

      let listCode = {},
        listName = {},
        listdate = {};
      await Promise.all(
        voteInfor.data.items.map(async item => {
          const booking = await getBookingById(item.bookingId);
          listCode[item.id] = booking.data.code;
          listName[
            item.id
          ] = `${booking.data.doctor?.title} ${booking.data.doctor?.name}`;
        })
      );
      setListCode(listCode);
      setListName(listName);
    } catch (error) {
      throw error;
    }
  };
  const onFinish = async (values = {}) => {
    const { isActive } = patientDetail;
    const body = {
      isActive: !isActive,
      reason: values.lockReason || '',
    };
    try {
      const { data } = await putLockAccount(id, body);
      if (data.success) {
        if (isActive) {
          message.success('Khóa thành công');
        } else {
          message.success('Mở khóa thành công');
        }
      }
      initData();
      setIsShowModal(false);
    } catch (error) {
      setIsShowModal(false);
      throw error;
    }
  };
  const lockAccount = () => {
    setIsShowModal(true);
    form.resetFields();
    const { isActive } = patientDetail;
    let newModal = { ...modal };
    newModal = {
      title: isActive
        ? 'Bạn có chắc chắn khóa tài khoản này ?'
        : 'Bạn có chắc chắn mở khóa tài khoản này ?',
      content: isActive ? (
        <Form form={form} onFinish={onFinish} hideRequiredMark={true}>
          <Form.Item
            name="lockReason"
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'Vui lòng nhập lý do khóa tài khoản.',
              },
            ]}
          >
            <Input.TextArea
              style={{ width: '100%' }}
              maxLength={255}
              showCount
              rows={4}
              placeholder="Vui lòng nhập lý do khóa tài khoản."
            />
          </Form.Item>
          <Button onClick={() => setIsShowModal(false)}>KHÔNG</Button>
          <Button className="btn-white" htmlType="submit">
            ĐỒNG Ý
          </Button>
        </Form>
      ) : (
        <>
          <Button onClick={() => setIsShowModal(false)}>KHÔNG</Button>
          <Button className="btn-white" onClick={() => onFinish()}>
            ĐỒNG Ý
          </Button>
        </>
      ),
      footer: [],
    };
    setModal(newModal);
    return;
  };

  const fetchAvatar = async avatarId => {
    if (avatarId) {
      const response = await downloadAttachmentFile(avatarId);
      const arrayBufferView = new Uint8Array(response.data);
      const blob = new Blob([arrayBufferView], { type: 'image/png' });
      const urlCreator = window.URL || window.webkitURL;
      const imageUrl = urlCreator.createObjectURL(blob);
      return imageUrl;
    }
  };

  const resetOTP = async () => {
    try {
      await putResetPatientOTP(id);
      initData();
      return message.success('Đặt lại OTP thành công');
    } catch (err) {
      message.error('Đặt lại OTP thất bại');
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
  const onChecked = async (id, e) => {
    const check = e.target.checked;
    try {
      setIsLoading(true);
      if (check) {
        const { data } = await putComment(id, { status: false });
        data.success && message.success('success');
      } else {
        const { data } = await putComment(id, { status: true });
        data.success && message.success('success');
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <Spin spinning={isLoading}>
      <div className="patient">
        <h2 style={{ fontWeight: '600' }}>Thông tin người bệnh</h2>
        <div className="patient_detail">
          <div className="left">
            <div className="patient_info">
              <Tabs type="card">
                <TabPane tab="Thông tin cơ bản" key="1">
                  <Row>
                    <Col xs={8} sm={7} md={5} lg={5}>
                      <p>Tên người bệnh:</p>
                    </Col>
                    <Col xs={16} sm={17} md={19} lg={19}>
                      <span>
                        {patientDetail.name ? patientDetail.name : '-'}
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={8} sm={7} md={5} lg={5}>
                      <p>Ngày sinh:</p>
                    </Col>
                    <Col xs={16} sm={17} md={19} lg={19}>
                      <span>
                        {patientDetail?.dateOfBirth
                          ? patientDetail?.dateOfBirth &&
                            moment(patientDetail?.dateOfBirth).format(
                              DATE_FORMAT
                            )
                          : '-'}
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={8} sm={7} md={5} lg={5}>
                      <p>Giới tính:</p>
                    </Col>
                    <Col xs={16} sm={17} md={19} lg={19}>
                      <span>
                        {patientDetail.gender === '1'
                          ? 'Nam'
                          : patientDetail.gender === '2'
                          ? 'Nữ'
                          : '-'}
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={8} sm={7} md={5} lg={5}>
                      <p>Số điện thoại:</p>
                    </Col>
                    <Col xs={16} sm={17} md={19} lg={19}>
                      <span>
                        {patientDetail.phone ? patientDetail.phone : '-'}
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={8} sm={7} md={5} lg={5}>
                      <p>Địa chỉ:</p>
                    </Col>
                    <Col xs={16} sm={17} md={19} lg={19}>
                      <span>
                        {patientDetail.address ? patientDetail.address : '-'}
                      </span>
                    </Col>
                  </Row>
                </TabPane>
                <TabPane tab="Thông tin bổ sung" key="2">
                  <Row>
                    <Col xs={8} sm={7} md={5} lg={5}>
                      <p>CMND/CCCD/Hộ chiếu:</p>
                    </Col>
                    <Col xs={16} sm={17} md={19} lg={19}>
                      <span>
                        {patientDetail.identity ? patientDetail.identity : '-'}
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={8} sm={7} md={5} lg={5}>
                      <p>Nghề nghiệp:</p>
                    </Col>
                    <Col xs={16} sm={17} md={19} lg={19}>
                      <span>
                        {patientDetail.career ? patientDetail.career : '-'}
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={8} sm={7} md={5} lg={5}>
                      <p>Quốc tịch:</p>
                    </Col>
                    <Col xs={16} sm={17} md={19} lg={19}>
                      <span>
                        {patientDetail.country ? patientDetail.country : '-'}
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={8} sm={7} md={5} lg={5}>
                      <p>Email:</p>
                    </Col>
                    <Col xs={16} sm={17} md={19} lg={19}>
                      <span>
                        {patientDetail.email ? patientDetail.email : '-'}
                      </span>
                    </Col>
                  </Row>
                </TabPane>
                <TabPane tab="Thông tin sức khỏe" key="3">
                  <Row>
                    <Col xs={8} sm={7} md={5} lg={5}>
                      <p>Nhóm máu:</p>
                    </Col>
                    <Col xs={16} sm={17} md={19} lg={19}>
                      <span>
                        {patientDetail.bloodGroup
                          ? patientDetail.bloodGroup
                          : '-'}
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={8} sm={7} md={5} lg={5}>
                      <p>Chiều cao (cm):</p>
                    </Col>
                    <Col xs={16} sm={17} md={19} lg={19}>
                      <span>
                        {patientDetail.height ? patientDetail.height : '-'}
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={8} sm={7} md={5} lg={5}>
                      <p>Cân nặng (kg):</p>
                    </Col>
                    <Col xs={16} sm={17} md={19} lg={19}>
                      <span>
                        {patientDetail.weight ? patientDetail.weight : '-'}
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={8} sm={7} md={5} lg={5}>
                      <p>Dị ứng:</p>
                    </Col>
                    <Col xs={16} sm={17} md={19} lg={19}>
                      <span>
                        {patientDetail.allergy ? patientDetail.allergy : '-'}
                      </span>
                    </Col>
                  </Row>
                </TabPane>
              </Tabs>
            </div>
            <div className="other_info">
              <Tabs type="card">
                <TabPane tab="Hồ sơ phụ thuộc" key="1">
                  {patientDepent.map((item, i) => {
                    return (
                      <Card style={{ width: 300 }} key={i}>
                        <Link
                          to={{
                            pathname: `/admin/patient/depent/${item.id}`,
                          }}
                        >
                          <div className="tab_depends">
                            <div style={{ marginRight: '1rem' }}>
                              <Avatar
                                size={60}
                                src={avatarDepent[item.avatarId]}
                              />
                            </div>
                            <div>
                              <p style={{ marginBottom: '0px' }}>{item.name}</p>
                              <div>
                                {item?.dateOfBirth
                                  ? item?.dateOfBirth &&
                                    moment(item?.dateOfBirth).format(
                                      DATE_FORMAT
                                    )
                                  : ''}
                                <span> | </span>
                                <span>
                                  {convertPatientRelative(item.relationship)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </Card>
                    );
                  })}
                </TabPane>
                <TabPane tab="Lịch hẹn khám" key="2" className="collapse">
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
                              style={{
                                display: 'flex',
                                marginTop: '0.25rem',
                                marginBottom: '0.25rem',
                              }}
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
                                    {` ${moment(item.bookingDate).format(
                                      DATE_FORMAT
                                    )}`}
                                  </span>
                                </div>
                                <div>
                                  <PlusSquareFilled />
                                  <span>
                                    Chuyên khoa {item.specialist?.name}
                                  </span>
                                </div>
                                <div>
                                  <ContactsFilled />
                                  <span>{`${item.doctor?.title} ${item.doctor?.name}`}</span>
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
                            bookingPre.length < morePre ? 'none' : 'block',
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
                              style={{
                                display: 'flex',
                                marginTop: '0.25rem',
                                marginBottom: '0.25rem',
                              }}
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
                                    {` ${moment(item.bookingDate).format(
                                      DATE_FORMAT
                                    )}`}
                                  </span>
                                </div>
                                <div>
                                  <PlusSquareFilled />
                                  <span>
                                    Chuyên khoa {item.specialist?.name}
                                  </span>
                                </div>
                                <div>
                                  <ContactsFilled />
                                  <span>{`${item.doctor?.title} ${item.doctor?.name}`}</span>
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
                <TabPane tab="Thông tin đánh giá" key="3">
                  {voteInfor.slice(0, moreVote).map((item, index) => {
                    return (
                      <Card>
                        <div className="tab_remark">
                          <Row className="tab_remark_title">
                            <div>
                              Tên bác sĩ:
                              <span>{` ${doctorName[item.id]}`}</span>
                            </div>
                            <div>
                              {moment(item.createdDate).format(
                                `HH:mm - ${DATE_FORMAT}`
                              )}
                            </div>
                          </Row>
                          <Row className="tab_remark_rate">
                            <VoteStar vote={item.vote} />
                            <a
                              onClick={() => {
                                history.push(
                                  `/admin/appointment/edit/${item.bookingId}`
                                );
                              }}
                            >
                              Booking: {bookingCode[item.id]}
                            </a>
                          </Row>
                          <Row className="tab_remark_content">
                            <div
                              style={{
                                maxWidth: '760px',
                                wordWrap: 'break-word',
                              }}
                            >
                              {item.comments}
                            </div>
                          </Row>

                          <Checkbox
                            className="tab_remark_checkbox"
                            onChange={e => onChecked(item.id, e)}
                            defaultChecked={item.status ? false : true}
                          >
                            Đánh dấu là nhận xét rác
                          </Checkbox>
                        </div>
                      </Card>
                    );
                  })}
                  <p
                    style={{
                      textAlign: 'center',
                      display: voteInfor.length < moreVote ? 'none' : 'block',
                    }}
                  >
                    <a
                      onClick={() => {
                        setMoreVote(moreVote + 10);
                      }}
                    >
                      Xem thêm
                    </a>
                  </p>
                </TabPane>
              </Tabs>
            </div>
          </div>
          <div className="right">
            <div className="patient-right">
              <div className="avatar">
                <Avatar size={150} icon={<UserOutlined />} src={avatar} />
              </div>
              <div className="patient-name">
                <h2>
                  {patientDetail.name ? patientDetail.name : '-'}
                  <span> </span>
                  <span style={{ color: '#0AAA14', fontSize: '15px' }}>
                    {patientDetail.isActive ? '(Hoạt động)' : '(Khóa)'}
                  </span>
                  {!patientDetail.isActive && (
                    <LockPopover content={patientDetail.reason} />
                  )}
                </h2>
                <p style={{ color: '#205072' }}>
                  Ngày tạo tài khoản:
                  <span> </span>
                  <span>
                    {patientDetail?.firstLogin
                      ? patientDetail?.firstLogin &&
                        moment(patientDetail?.firstLogin).format(
                          `HH:mm ${DATE_FORMAT}`
                        )
                      : ''}
                  </span>
                </p>

                <p style={{ color: '#205072' }}>
                  Sử dụng gần nhất:
                  <span> </span>
                  <span>
                    {patientDetail?.lastUsed
                      ? patientDetail?.lastUsed &&
                        moment(patientDetail?.lastUsed).format(
                          `HH:mm ${DATE_FORMAT}`
                        )
                      : ''}
                  </span>
                </p>
              </div>

              <div
                style={{
                  paddingTop: '20px',
                  width: '208px',
                  margin: 'auto',
                  display: listkey.includes(PATIENT_LOCK) ? 'block' : 'none',
                }}
              >
                {patientDetail.isActive === true ? (
                  <Button
                    style={{
                      boxShadow: '15px 15px 40px #329D9C36',
                    }}
                    onClick={() => lockAccount(false)}
                  >
                    KHÓA TÀI KHOẢN
                  </Button>
                ) : (
                  <Button
                    style={{
                      boxShadow: '15px 15px 40px #329D9C36',
                    }}
                    onClick={() => lockAccount(true)}
                  >
                    MỞ KHÓA
                  </Button>
                )}
              </div>
              <div
                style={{
                  paddingTop: '20px',
                  width: '208px',
                  margin: 'auto',
                  display: listkey.includes(PATIENT_RESET_OTP)
                    ? 'block'
                    : 'none',
                }}
              >
                <Button
                  style={{
                    boxShadow: '15px 15px 40px #329D9C36',
                  }}
                  onClick={resetOTP}
                >
                  RESET OTP
                </Button>
              </div>
              <div
                style={{ paddingTop: '20px', width: '208px', margin: 'auto' }}
              >
                <Link
                  to={{
                    pathname: `/admin/patient/medical-records/${patientDetail.id}`,
                    state: { patientId: patientDetail.id },
                  }}
                >
                  <Button
                    style={{
                      boxShadow: '15px 15px 40px #329D9C36',
                      display: listkey.includes(PATIENT_RECORDHEATH)
                        ? 'block'
                        : 'none',
                    }}
                  >
                    {patientDetail.code
                      ? patientDetail.code
                      : 'LIÊN KẾT HỒ SƠ Y TẾ'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <CustomModal
          visible={isShowModal}
          title={modal.title}
          footer={modal.footer}
          onCancel={() => setIsShowModal(false)}
          preserve={false}
        >
          {modal.content}
        </CustomModal>
      </div>
    </Spin>
  );
};

export default PatientDetailPage;
