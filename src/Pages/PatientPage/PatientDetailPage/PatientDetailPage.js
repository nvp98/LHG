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
          message.success('Kh??a th??nh c??ng');
        } else {
          message.success('M??? kh??a th??nh c??ng');
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
        ? 'B???n c?? ch???c ch???n kh??a t??i kho???n n??y ?'
        : 'B???n c?? ch???c ch???n m??? kh??a t??i kho???n n??y ?',
      content: isActive ? (
        <Form form={form} onFinish={onFinish} hideRequiredMark={true}>
          <Form.Item
            name="lockReason"
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'Vui l??ng nh???p l?? do kh??a t??i kho???n.',
              },
            ]}
          >
            <Input.TextArea
              style={{ width: '100%' }}
              maxLength={255}
              showCount
              rows={4}
              placeholder="Vui l??ng nh???p l?? do kh??a t??i kho???n."
            />
          </Form.Item>
          <Button onClick={() => setIsShowModal(false)}>KH??NG</Button>
          <Button className="btn-white" htmlType="submit">
            ?????NG ??
          </Button>
        </Form>
      ) : (
        <>
          <Button onClick={() => setIsShowModal(false)}>KH??NG</Button>
          <Button className="btn-white" onClick={() => onFinish()}>
            ?????NG ??
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
      return message.success('?????t l???i OTP th??nh c??ng');
    } catch (err) {
      message.error('?????t l???i OTP th???t b???i');
    }
  };
  const click = id => {
    history.push(`/admin/appointment/edit/${id}`);
  };
  const changeStatus = status => {
    switch (status) {
      case WAITING:
        return (
          <div style={{ color: '#205072 ', margin: 'auto' }}>??ang ch???</div>
        );
      case RECEIVED:
        return (
          <div style={{ color: '#00D4C0 ', margin: 'auto' }}>Ti???p nh???n</div>
        );
      case DONE:
        return <div style={{ color: '#00D4C0 ', margin: 'auto' }}>???? xong</div>;
      case CANCEL:
        return <div style={{ color: '#FF0000 ', margin: 'auto' }}>???? h???y</div>;
      case EXPIRE:
        return <div style={{ color: '#FF0000 ', margin: 'auto' }}>Qu?? h???n</div>;
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
        <h2 style={{ fontWeight: '600' }}>Th??ng tin ng?????i b???nh</h2>
        <div className="patient_detail">
          <div className="left">
            <div className="patient_info">
              <Tabs type="card">
                <TabPane tab="Th??ng tin c?? b???n" key="1">
                  <Row>
                    <Col xs={8} sm={7} md={5} lg={5}>
                      <p>T??n ng?????i b???nh:</p>
                    </Col>
                    <Col xs={16} sm={17} md={19} lg={19}>
                      <span>
                        {patientDetail.name ? patientDetail.name : '-'}
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={8} sm={7} md={5} lg={5}>
                      <p>Ng??y sinh:</p>
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
                      <p>Gi???i t??nh:</p>
                    </Col>
                    <Col xs={16} sm={17} md={19} lg={19}>
                      <span>
                        {patientDetail.gender === '1'
                          ? 'Nam'
                          : patientDetail.gender === '2'
                          ? 'N???'
                          : '-'}
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={8} sm={7} md={5} lg={5}>
                      <p>S??? ??i???n tho???i:</p>
                    </Col>
                    <Col xs={16} sm={17} md={19} lg={19}>
                      <span>
                        {patientDetail.phone ? patientDetail.phone : '-'}
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={8} sm={7} md={5} lg={5}>
                      <p>?????a ch???:</p>
                    </Col>
                    <Col xs={16} sm={17} md={19} lg={19}>
                      <span>
                        {patientDetail.address ? patientDetail.address : '-'}
                      </span>
                    </Col>
                  </Row>
                </TabPane>
                <TabPane tab="Th??ng tin b??? sung" key="2">
                  <Row>
                    <Col xs={8} sm={7} md={5} lg={5}>
                      <p>CMND/CCCD/H??? chi???u:</p>
                    </Col>
                    <Col xs={16} sm={17} md={19} lg={19}>
                      <span>
                        {patientDetail.identity ? patientDetail.identity : '-'}
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={8} sm={7} md={5} lg={5}>
                      <p>Ngh??? nghi???p:</p>
                    </Col>
                    <Col xs={16} sm={17} md={19} lg={19}>
                      <span>
                        {patientDetail.career ? patientDetail.career : '-'}
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={8} sm={7} md={5} lg={5}>
                      <p>Qu???c t???ch:</p>
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
                <TabPane tab="Th??ng tin s???c kh???e" key="3">
                  <Row>
                    <Col xs={8} sm={7} md={5} lg={5}>
                      <p>Nh??m m??u:</p>
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
                      <p>Chi???u cao (cm):</p>
                    </Col>
                    <Col xs={16} sm={17} md={19} lg={19}>
                      <span>
                        {patientDetail.height ? patientDetail.height : '-'}
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={8} sm={7} md={5} lg={5}>
                      <p>C??n n???ng (kg):</p>
                    </Col>
                    <Col xs={16} sm={17} md={19} lg={19}>
                      <span>
                        {patientDetail.weight ? patientDetail.weight : '-'}
                      </span>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={8} sm={7} md={5} lg={5}>
                      <p>D??? ???ng:</p>
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
                <TabPane tab="H??? s?? ph??? thu???c" key="1">
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
                <TabPane tab="L???ch h???n kh??m" key="2" className="collapse">
                  <Collapse
                    expandIconPosition="right"
                    bordered={false}
                    defaultActiveKey={2}
                  >
                    <Panel header="C??c l???ch h???n trong qu?? kh???" key="1">
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
                                    Chuy??n khoa {item.specialist?.name}
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
                          Xem th??m
                        </a>
                      </p>
                    </Panel>
                    <Panel header="C??c l???ch h???n ti???p theo" key="2">
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
                                    Chuy??n khoa {item.specialist?.name}
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
                          Xem th??m
                        </a>
                      </p>
                    </Panel>
                  </Collapse>
                </TabPane>
                <TabPane tab="Th??ng tin ????nh gi??" key="3">
                  {voteInfor.slice(0, moreVote).map((item, index) => {
                    return (
                      <Card>
                        <div className="tab_remark">
                          <Row className="tab_remark_title">
                            <div>
                              T??n b??c s??:
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
                            ????nh d???u l?? nh???n x??t r??c
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
                      Xem th??m
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
                    {patientDetail.isActive ? '(Ho???t ?????ng)' : '(Kh??a)'}
                  </span>
                  {!patientDetail.isActive && (
                    <LockPopover content={patientDetail.reason} />
                  )}
                </h2>
                <p style={{ color: '#205072' }}>
                  Ng??y t???o t??i kho???n:
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
                  S??? d???ng g???n nh???t:
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
                    KH??A T??I KHO???N
                  </Button>
                ) : (
                  <Button
                    style={{
                      boxShadow: '15px 15px 40px #329D9C36',
                    }}
                    onClick={() => lockAccount(true)}
                  >
                    M??? KH??A
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
                      : 'LI??N K???T H??? S?? Y T???'}
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
