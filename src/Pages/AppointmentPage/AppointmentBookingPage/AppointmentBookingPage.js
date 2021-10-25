import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Progress,
  Modal,
  Tag,
  message,
  Spin,
} from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import './AppointmentBookingPage.scss';
import CustomBigCalendar from 'Components/CustomBigCalendar/CustomBigCalendar';
import { DATE_FORMAT, APPOINTMENT_EDIT } from 'GlobalConstants';
import {
  getBookingById,
  getSpecialist,
  getDoctorTimeslot,
  createBooking,
  putUpdateStatus,
  putUpdateBooking,
  createPatient,
  getPatient,
} from 'Api';
import CustomModal from 'Components/CustomModal/CustomModal';
import { fetchAllApi } from 'Utils';
import CustomEvent from 'Components/CustomEvent/CustomEvent';
import jwt_decode from 'jwt-decode';
import { getCookie, convertPatientRelative } from 'Utils/Helpers/';
import {
  CANCEL,
  DONE,
  RECEIVED,
  EXPIRE,
  WAITING,
  TOKEN_KEY,
} from 'GlobalConstants';
import BookingDetail from 'Components/BookingDetail/BookingDetail';
import Review from 'Components/Review/Review';

const AppointmentBookingPage = props => {
  const { history, match, location, listkey } = props;
  const bookingId = match.params.id;
  const [form] = Form.useForm();

  const requiredMessage = 'Vui lòng điền thông tin này!';
  const required = true;
  const listStatus = [CANCEL, DONE, RECEIVED, EXPIRE];

  const user = getCookie(TOKEN_KEY) ? jwt_decode(getCookie(TOKEN_KEY)) : '';
  const [doctorList, setDoctorList] = useState([]);
  const [specialist, setSpecialist] = useState([]);

  const [isShowModal, setIsShowModal] = useState(false);
  const [modal, setModal] = useState({
    content: '',
    onOk: () => {},
  });

  const [view, setView] = useState('day');
  const [slot, setSlot] = useState({});
  const [healthInsurance, setHealthInsurance] = useState(false);
  const [reExamination, setReExamination] = useState(false);

  const [step, setStep] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [bookDetail, setBookDetail] = useState();

  const [selectedSpecialist, setSelectedSpecialist] = useState();
  const [selectedDoctor, setSelectedDoctor] = useState();
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedAccount, setSelectedAccount] = useState();
  const [selectedPatient, setSelectedPatient] = useState();

  const [events, setEvents] = useState([]);
  const [resourceMap, setResourceMap] = useState([]);

  const [patientList, setPatientList] = useState([]);

  const [isSubmit, setIsSubmit] = useState(false);

  const [bookingStatus, setBookingStatus] = useState(false);
  const [hospital, setHospital] = useState();
  const [radio, setRadio] = useState(1);
  const [val, setVal] = useState('');
  const [dis, setDis] = useState('none');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [bookedTimeslot, setBookedTimeslot] = useState();

  useEffect(() => {
    initData();
    // window.addEventListener('beforeunload', handleUnload);
    // return () => {
    //   window.removeEventListener('beforeunload', handleUnload);
    // };
  }, []);

  const handleUnload = e => {
    const message = 'o/';
    (e || window.event).returnValue = message; //Gecko + IE
    return message;
  };

  //Tạo dữ liệu ban đầu
  const initData = async () => {
    try {
      setIsLoading(true);
      const initParams = {
        limit: '10000',
      };
      const response = await fetchAllApi([
        getSpecialist(),
        getPatient(initParams),
      ]);

      setSpecialist(response[0].data.items);
      setPatientList(response[1].data.items);

      //Edit
      if (bookingId) {
        const { data } = await getBookingById(bookingId);
        setHospital(data?.hospital);
        setBookDetail(data);
        const paramsBooking = {
          date: new Date(data?.bookingDate).toISOString(),
          specialistId: data?.specialist?.id,
          doctorId: data?.doctorId,
        };
        const res = await getDoctorTimeslot(paramsBooking);
        const paramsFilterSelectBox = {
          date: moment(data?.bookingDate).format(),
          specialistId: data?.specialist?.id,
        };
        //Lấy dữ liệu cho select doctorlist theo chuyên khoa vì dữ liệu ở trên chỉ trả ra 1 bác sĩ trong chuyên khoa
        const res1 = await getDoctorTimeslot(paramsFilterSelectBox);
        form.setFieldsValue({
          patientId: data?.patientId,
          code: data?.code,
          name: data?.relativeId ? data.relative.name : data?.patient.name,
          phone: data?.relativeId ? data?.relative.phone : data?.patient.phone,
          hospitalId: data?.doctor.hospitalId,
          doctorId: data?.doctor.id,
          status: data?.status,
          createdBy: data?.createdBy,
          specialist: data?.specialist?.id,
          note: data?.note,
          reason: data?.reason,
          date: moment(new Date(data?.bookingDate)),
        });

        setBookedTimeslot(data?.timeslot);
        convertDataCalendar(res.data, data?.timeslot);

        setDoctorList(res1.data);
        setBookingStatus(listStatus.includes(data?.status));
        setHealthInsurance(data?.healthInsurance);
        setReExamination(data?.reExamination);

        setSelectedDate(new Date(data?.bookingDate).toISOString());
        setSelectedSpecialist(data?.specialist?.id);
        setSelectedDoctor(data?.doctor.id);
        setSelectedPatient(data);
      }

      //Booking từ route lịch làm việc bác sĩ
      else if (location?.state?.doctorBooking) {
        const { doctor, timeslot } = location.state.doctorBooking;

        const specialist = doctor?.specialists?.filter(
          ({ DoctorSpecialists }) => {
            return DoctorSpecialists.isMain === 1;
          }
        );

        const defaultParams = {
          date: new Date(timeslot.day).toISOString(),
          specialistId: specialist[0]?.id,
          doctorId: doctor?.id,
        };

        const paramsFilterSelectBox = {
          date: moment(timeslot.day).format(),
          specialistId: specialist[0]?.id,
        };

        let { data } = await getDoctorTimeslot(defaultParams);
        const res = await getDoctorTimeslot(paramsFilterSelectBox);
        for (let item of data[0]?.timeslots) {
          if (item.id === timeslot.id) {
            item.type = 'selecting';
            item.resourceId = doctor.id;
            item.hospitalId = doctor.hospitalId;
            setSlot(item);
          }
          continue;
        }

        convertDataCalendar(data);
        setDoctorList(res.data);
        setSelectedSpecialist(specialist[0]?.id);
        setSelectedDoctor(doctor.id);
        setSelectedDate(new Date(timeslot.day).toISOString());

        form.setFieldsValue({
          doctorId: `${doctor.title}  ${doctor.name}`,
          specialist: specialist[0]?.id,
          date: moment(new Date(timeslot.day)),
        });
        setIsLoading(false);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  //Chuyển dữ liệu từ API cho phù hợp với dữ liệu của Calendar
  const convertDataCalendar = (data, bookedSlot = {}) => {
    setEvents(convertBookingEvent(data, bookedSlot));
    setResourceMap(convertBookingResourceMap(data));
  };

  const convertBookingEvent = (data, bookedSlot = {}) => {
    let newEvents = [];
    for (const item of data) {
      if (item?.timeslots?.length > 0) {
        for (const timeslot of item.timeslots) {
          if (!bookingId) {
            if (
              moment(`${timeslot.day}:${timeslot.startTime}`).unix() >
              moment().unix()
            ) {
              const event = {
                id: timeslot.id,
                type: convertTypeEvent(timeslot),
                title: convertTitleEvent(timeslot),
                start: new Date(
                  moment(`${timeslot.day}:${timeslot.startTime}`)
                ),
                end: new Date(moment(`${timeslot.day}:${timeslot.endTime}`)),
                resourceId: item.id,
                capacity: timeslot.capacity,
                bookingLength: timeslot.bookings.length,
                hospitalId: item.hospitalId,
              };
              newEvents = [...newEvents, event];
            }
          }
          if (bookingId) {
            if (bookedSlot) {
              //bookedSlot dữ liệu bookingId lần đầu vào
              //bookedTimeslot trường hợp user thay đổi các lựa chọn vẫn giữ đc bookingId ban đầu
              const booked = bookedTimeslot || bookedSlot;
              const event = {
                id: timeslot.id,
                type:
                  booked?.id === timeslot.id && timeslot.bookings.length > 0
                    ? 'booked'
                    : convertTypeEvent(timeslot),
                title:
                  booked?.id === timeslot.id && timeslot.bookings.length > 0
                    ? 'Đã chọn'
                    : convertTitleEvent(timeslot),
                start: new Date(
                  moment(`${timeslot.day}:${timeslot.startTime}`)
                ),
                end: new Date(moment(`${timeslot.day}:${timeslot.endTime}`)),
                resourceId: item.id,
                capacity: timeslot.capacity,
                bookingLength: timeslot.bookings.length,
                hospitalId: item.hospitalId,
              };
              if (booked.id === timeslot.id) {
                setSlot(event);
              }
              newEvents = [...newEvents, event];
            } else {
              const event = {
                id: timeslot.id,
                type: convertTypeEvent(timeslot),
                title: convertTitleEvent(timeslot),
                start: new Date(
                  moment(`${timeslot.day}:${timeslot.startTime}`)
                ),
                end: new Date(moment(`${timeslot.day}:${timeslot.endTime}`)),
                resourceId: item.id,
                capacity: timeslot.capacity,
                bookingLength: timeslot.bookings.length,
                hospitalId: item.hospitalId,
              };
              newEvents = [...newEvents, event];
            }
          }
        }
      }
    }

    setStep(getStep(newEvents));
    return newEvents;
  };

  const convertTypeEvent = item => {
    return moment(`${item.day}:${item.startTime}`).unix() < moment().unix() ||
      (item.capacity === item.bookings.length && item.capacity !== 1) ||
      !item.isActive ||
      !item.DoctorTimeslots.status
      ? 'rest'
      : item.capacity === item.bookings.length && item.capacity === 1
      ? 'oneTimeslot'
      : item.type;
  };

  const convertTitleEvent = item => {
    return item.type === 'selecting'
      ? 'Đang chọn'
      : !item.isActive || !item.DoctorTimeslots.status
      ? 'N/A'
      : item.type === 'rest'
      ? 'Thời gian nghỉ'
      : item.capacity === item.bookings.length
      ? item.capacity === 1
        ? item.bookings[0].code
        : 'Hết sức chứa'
      : `${item.bookings.length} / ${item.capacity}`;
  };
  //Header Calendar
  const convertBookingResourceMap = data => {
    let resourceMap = [];

    for (const item of data) {
      if (item?.timeslots?.length > 0) {
        if (item?.timeslots?.length > 0) {
          let countBooking = item?.timeslots?.reduce((acc, cur) => {
            return acc + cur?.bookings.length;
          }, 0);
          let countCapacity = item.timeslots.reduce((acc, cur) => {
            return acc + cur.capacity;
          }, 0);

          let percent = Math.ceil((countBooking / countCapacity) * 100);

          const resource = {
            resourceId: item.id,
            resourceTitle: (
              <div>
                <div>
                  {item.title} {item.name}
                </div>
                <Progress
                  percent={percent}
                  strokeWidth={10}
                  style={{ width: '80%' }}
                  format={percent => `${percent}%`}
                />
              </div>
            ),
          };
          resourceMap = [...resourceMap, resource];
        }
      }
    }
    return resourceMap;
  };

  //Lấy dữ liệu step cho calendar
  const getStep = slot => {
    if (slot.length > 0) {
      let start = new Date(slot[0].start).getTime();
      let end = new Date(slot[0].end).getTime();
      return (end - start) / 60000;
    }
    return 30;
  };

  const onSelectEvent = timeslot => {
    if (timeslot.type === 'work' && !bookingStatus) {
      let list = events.filter(item => item.type === 'selecting');
      if (list.length > 0) {
        for (const item of list) {
          item.type = 'work';
          item.title = `${item.bookingLength} / ${item.capacity}`;
        }
      }
      timeslot.type = 'selecting';
      timeslot.title = 'Đang chọn';
      setSlot(timeslot);
    }
  };

  //Custom màu sắc cho event Calendar
  const eventStyleGetter = ({ type }) => {
    const backgroundColor = type => {
      if (['booked', 'selecting'].includes(type)) {
        return '#ACC7ED';
      } else if (['rest', 'holiday', 'expire'].includes(type)) {
        return '#ddd';
      } else if (type === 'oneTimeslot') {
        return '#f4d174';
      } else {
        return '#ECFAF7';
      }
    };
    const style = {
      backgroundColor: backgroundColor(type),
      borderRadius: '5px',
      color: '#205072',
      border: '0.1px solid #38bcb2',
      display: 'block',
    };
    return {
      style: style,
    };
  };

  const disabledDate = start => {
    // Disable ngày quá khứ
    return start && start < moment().startOf('day');
  };

  const onChangeSpecialist = async value => {
    try {
      setIsLoading(true);
      // Reset comboBox chọn bác sĩ

      form.setFieldsValue({
        doctorId: undefined,
      });

      setSelectedDoctor(undefined);

      //Filter comboBox danh sách bác sĩ theo chuyên khoa đã chọn
      const params = {
        specialistId: value,
        date: moment(selectedDate).format(),
      };
      const { data } = await getDoctorTimeslot(params);

      convertDataCalendar(data);
      setDoctorList(data);
      setSelectedSpecialist(value);
      setSlot({});
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const onChangeDoctor = async value => {
    try {
      setIsLoading(true);
      if (selectedSpecialist) {
        const params = {
          specialistId: selectedSpecialist,
          doctorId: value,
          date: new Date(selectedDate).toISOString(),
        };
        const { data } = await getDoctorTimeslot(params);

        convertDataCalendar(data);
      }
      setSelectedDoctor(value);
      setSlot({});
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const onChangeDatePicker = async value => {
    try {
      setIsLoading(true);
      if (selectedSpecialist && selectedDoctor) {
        const params = {
          date: moment(value).format(),
          specialistId: selectedSpecialist,
          doctorId: selectedDoctor,
        };
        const { data } = await getDoctorTimeslot(params);
        const paramsFilterDoctorList = {
          date: moment(value).format(),
          specialistId: selectedSpecialist,
        };
        const res = await getDoctorTimeslot(paramsFilterDoctorList);
        setDoctorList(res.data);
        convertDataCalendar(data);
      }
      if (selectedSpecialist && !selectedDoctor) {
        const params = {
          specialistId: selectedSpecialist,
          date: moment(value).format(),
        };
        const { data } = await getDoctorTimeslot(params);
        convertDataCalendar(data);
        setDoctorList(data);
      }

      setSlot({});
      setSelectedDate(value);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const onChangeLHGAccount = value => {
    if (value) {
      const patient = patientList.find(item => item.id === value);
      const accountInfo = [{ ...patient }, ...patient.relatives];
      setSelectedAccount(accountInfo);
    } else {
      setSelectedAccount({});
    }
    form.setFieldsValue({
      name: undefined,
      phone: undefined,
    });
  };

  const onChangePatientInfo = value => {
    if (value) {
      const patientInfo = selectedAccount.find(item => item.id === value);
      setSelectedPatient(patientInfo);
      form.setFieldsValue({
        phone: patientInfo.phone,
      });
    } else {
      form.setFieldsValue({
        phone: undefined,
      });
    }
  };

  const onBooking = async values => {
    if (bookingId) {
      const body = {
        note: values.note,
        doctorId: slot.resourceId,
        timeslotId: slot.id,
        bookingDate: slot.start,
        hospitalId: slot.hospitalId,
        specialistId: selectedSpecialist,
        reason: values.reason,
        reExamination,
        healthInsurance,
        patientId: selectedPatient?.patientId,
        relativeId: selectedPatient?.relativeId
          ? selectedPatient.relativeId
          : undefined,
      };
      try {
        setIsLoading(true);
        const res = await putUpdateBooking(bookingId, body);

        if (res.status === 200) {
          message.success('Chỉnh sửa lịch hẹn thành công.');
        }
        history.push('/admin/appointment');
      } catch (error) {
        message.error('Chỉnh sửa lịch hẹn thất bại.');
        setIsShowModal(false);
        setIsLoading(false);
        throw error;
      }
    } else {
      try {
        let id;
        setIsLoading(true);
        if (!selectedAccount) {
          const bodyCreatePatient = {
            name: values.name,
            phone: values.phone,
          };

          const { data } = await createPatient(bodyCreatePatient);
          id = data.success.id;
        }
        const body = {
          patientId: selectedAccount
            ? selectedPatient?.patientId
              ? selectedPatient.patientId
              : selectedPatient.id
            : id,
          relativeId: selectedPatient?.patientId
            ? selectedPatient.id
            : undefined,
          doctorId: slot.resourceId,
          timeslotId: slot.id,
          reExamination,
          healthInsurance,
          note: values.note,
          reason: values.reason,
          created_by: user.username,
          bookingDate: slot.start,
          hospitalId: slot.hospitalId,
          specialistId: selectedSpecialist,
        };
        const res = await createBooking(body);
        if (res.status === 201) {
          message.success('Đặt lịch hẹn khám thành công.');
        }
        history.push('/admin/appointment');
      } catch (error) {
        const { data } = error;
        if (
          data.statusCode === 400 &&
          data.message === 'The Timeslot has passed'
        ) {
          message.error(
            'Bạn không thể đặt hẹn với khung giờ trong quá khứ. Vui lòng chọn khung giờ khác.'
          );
        } else {
          message.error('Đặt lịch hẹn khám thất bại.');
        }
        setIsShowModal(false);
        setIsLoading(false);
        throw error;
      }
    }
  };

  const onFinishFailed = () => {
    setIsSubmit(true);
  };

  const onFinish = values => {
    let isShow = false;
    setIsShowModal(false);
    patientList.map((item, index) => {
      if (values.phone === item.phone && !values.patientId)
        return (isShow = true);
    });
    //Kiểm tra đã chọn khung giờ trong calendar
    if (!isShow) {
      setIsSubmit(true);
      if (Object.keys(slot).length !== 0) {
        setIsShowModal(true);
        let modalContent = { ...modal };
        modalContent.onOk = () => {
          setIsShowModal(false);
          onBooking(values);
        };
        modalContent.content = bookingId ? (
          <div>Bạn có thật sự muốn thay đổi cho ca khám này</div>
        ) : (
          <div>Bạn có thật sự muốn đặt hẹn cho ca khám này</div>
        );
        setModal(modalContent);
      }
    } else {
      setIsShowModal(false);
      setIsSubmit(false);
      message.warning(
        'Số điện thoại này đã được khai báo. Vui lòng kiểm tra lại hoặc chọn tài khoản từ "Tài khoản LHG" để chọn thông tin người bệnh'
      );
    }
  };

  const saveBooking = val => {
    setIsShowModal(true);
    let newModal = { ...modal };

    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    const onChangeRadio = e => {
      setRadio(e);
      setModal(newModal);
    };
    newModal = {
      title: 'Bạn có chắc bạn muốn hủy lịch hẹn này',
      content: (
        <>
          <p>Vui lòng chọn lý do hủy lịch hẹn vào ô bên dưới</p>
          <Radio.Group
            onChange={e => onChangeRadio(e.target.value)}
            style={{ textAlign: 'left' }}
          >
            <Radio style={radioStyle} value={1}>
              Không có nhu cầu khám nữa
            </Radio>
            <Radio style={radioStyle} value={2}>
              Muốn đổi ngày giờ
            </Radio>
            <Radio style={radioStyle} value={3}>
              Muốn đổi bác sĩ
            </Radio>
            <Radio style={radioStyle} value={4}>
              Lý do khác
            </Radio>

            <Input.TextArea
              disabled={val === 4 ? false : true}
              style={{ width: '100%' }}
              maxLength={255}
              showCount
              rows={2}
              // value={val}
              onChange={e => {
                setVal(e.target.value);
              }}
            />
          </Radio.Group>
          {/* <div style={{ color: 'red', display: `${dis}` }}>
            Vui lòng nhập lý do hủy hẹn.
          </div> */}
        </>
      ),
      onOk: () => {
        history.push(`/admin/appointment`);
      },
    };
  };

  const onCancelBooking = async () => {
    try {
      const data = {
        status: CANCEL,
        cancelledNote: noteCancelBooking(radio),
      };
      radio === 4
        ? val.trim() === ''
          ? setDis('block')
          : setDis('none')
        : setDis('none');
      if (radio === 4 && val.trim() !== '') {
        await putUpdateStatus(bookingId, data);
        history.push(`/admin/appointment`);
      } else if (radio !== 4) {
        await putUpdateStatus(bookingId, data);
        history.push(`/admin/appointment`);
      }
      // await putUpdateStatus(bookingId, data);
    } catch (error) {
      throw error;
    }
  };

  const noteCancelBooking = value => {
    switch (value) {
      case 1:
        return 'Không có nhu cầu khám nữa';
      case 2:
        return 'Muốn đổi ngày giờ';
      case 3:
        return 'Muốn đổi bác sĩ';
      case 4:
        return val;
      default:
        break;
    }
  };

  return (
    <>
      <Spin spinning={isLoading}>
        {/* <Prompt when={true} message="Are you sure you want to leave?" /> */}
        <div className="appointment_booking">
          <h2 className="appointment_booking_tittle">
            {bookingId ? 'Chi tiết lịch hẹn' : 'Đặt hẹn khám'}
            {!bookingId && (
              <span
                style={{
                  fontSize: '1.3rem',
                  float: 'right',
                  marginRight: '100px',
                }}
              >
                Gia An
              </span>
            )}
          </h2>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            hideRequiredMark={true}
            onFinishFailed={onFinishFailed}
          >
            {bookingId && (
              <BookingDetail bookDetail={bookDetail} hospital={hospital} />
            )}

            {/* Row 1 */}
            <Row>
              {/* Tài khoản LHG */}
              <Col xl={6} md={6} sm={13} style={{ marginRight: '3rem' }}>
                <Form.Item label="Tài khoản LHG:" name="patientId">
                  <Select
                    optionFilterProp="children"
                    showSearch
                    maxLength={9}
                    disabled={bookingId ? true : false}
                    onChange={onChangeLHGAccount}
                    allowClear
                  >
                    {patientList.map(item => (
                      <Select.Option key={item.id} value={item.id}>
                        {item.phone}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              {/* Tên người bênh */}
              <Col xl={6} md={6} sm={13} style={{ marginRight: '3rem' }}>
                <Form.Item
                  label="Tên người bệnh:"
                  name="name"
                  rules={[{ required: required, message: requiredMessage }]}
                >
                  {selectedAccount &&
                  Object.keys(selectedAccount).length !== 0 ? (
                    <Select maxLength={255} onChange={onChangePatientInfo}>
                      {selectedAccount &&
                        selectedAccount.map(item => {
                          return (
                            <Select.Option key={item.id} value={item.id}>
                              {item.name}{' '}
                              {convertPatientRelative(item.relationship)}
                            </Select.Option>
                          );
                        })}
                    </Select>
                  ) : (
                    <Input
                      disabled={
                        bookingId ||
                        (selectedAccount &&
                          Object.keys(selectedAccount).length !== 0)
                          ? true
                          : false
                      }
                      maxLength={255}
                    />
                  )}
                </Form.Item>
              </Col>
              {/* Số điện thoại */}
              <Col xl={6} md={6} sm={13} style={{ marginRight: '3rem' }}>
                <Form.Item
                  label="Số điện thoại:"
                  name="phone"
                  rules={[
                    {
                      required: required,
                      message: requiredMessage,
                    },
                    {
                      pattern: new RegExp(/^(0|[0-9][0-9]*)(\.[0-9]*)?$/),
                      message: 'Số điện thoại không phù hợp',
                    },
                    {
                      pattern: '.{10,15}',
                      message:
                        'Vui lòng nhập số điện thoại đúng từ 10-15 ký tự số',
                    },
                  ]}
                >
                  <Input
                    maxLength={15}
                    disabled={
                      bookingId ||
                      (selectedAccount &&
                        Object.keys(selectedAccount).length !== 0)
                        ? true
                        : false
                    }
                  ></Input>
                </Form.Item>
              </Col>
            </Row>
            {/* Row 2 */}
            <Row>
              {/* Chuyên khoa */}
              <Col xl={6} md={6} sm={13} style={{ marginRight: '3rem' }}>
                <Form.Item
                  label="Chuyên khoa:"
                  name="specialist"
                  rules={[
                    {
                      required: required,
                      message: requiredMessage,
                    },
                  ]}
                >
                  <Select
                    maxLength={100}
                    showSearch
                    optionFilterProp="children"
                    onChange={onChangeSpecialist}
                    disabled={bookingStatus}
                  >
                    {specialist?.map(({ id, name }) => {
                      return (
                        <Select.Option value={id} key={id}>
                          {name}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
              {/* Ngày hẹn khám */}
              <Col xl={6} md={6} sm={13} style={{ marginRight: '3rem' }}>
                <Form.Item
                  label="Ngày hẹn khám:"
                  name="date"
                  initialValue={selectedDate}
                >
                  <DatePicker
                    disabledDate={disabledDate}
                    format={DATE_FORMAT}
                    allowClear={false}
                    onChange={onChangeDatePicker}
                    disabled={bookingStatus}
                  />
                </Form.Item>
              </Col>
              {/* Bác sĩ */}
              <Col xl={6} md={6} sm={13} style={{ marginRight: '3rem' }}>
                <Form.Item label="Bác sĩ:" name="doctorId">
                  <Select
                    maxLength={25}
                    showSearch
                    optionFilterProp="children"
                    onChange={onChangeDoctor}
                    disabled={bookingStatus}
                    allowClear={true}
                  >
                    {doctorList?.map(({ id, name, title }) => {
                      return (
                        <Select.Option value={id} key={id}>
                          {title} {name}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            {/* Row 3 */}
            <Row>
              {events.length > 0 ? (
                <Col span={23}>
                  <div className="dayCalendar">
                    <CustomBigCalendar
                      selectable="ignoreEvents"
                      step={step}
                      toolbar={false}
                      events={events}
                      view={view}
                      onView={newView => setView(newView)}
                      onSelectEvent={onSelectEvent}
                      eventPropGetter={eventStyleGetter}
                      components={{
                        event: CustomEvent,
                      }}
                      min={new Date(events[0]?.start)}
                      // max={new Date(events[events.length - 1]?.end)}
                      date={selectedDate}
                      onNavigate={date => {
                        setSelectedDate(date);
                      }}
                      // className={
                      //   resourceMap.length === 1 ? 'showOne' : 'showFull'
                      // }
                      style={
                        isSubmit && Object.keys(slot).length === 0
                          ? { border: '1px solid red' }
                          : {}
                      }
                      resources={resourceMap}
                      resourceIdAccessor="resourceId"
                      resourceTitleAccessor="resourceTitle"
                    />
                  </div>
                </Col>
              ) : (
                <Col span={22}>
                  <Tag
                    className="emptyCalendar"
                    style={
                      isSubmit && Object.keys(slot).length === 0
                        ? { border: '1px solid red' }
                        : {}
                    }
                  >
                    {selectedSpecialist
                      ? 'Không tìm thấy khung giờ phù hợp'
                      : 'Vui Lòng chọn chuyên khoa'}
                    .
                  </Tag>
                </Col>
              )}
              {isSubmit && Object.keys(slot).length === 0 && (
                <div style={{ color: 'red' }}>Vui lòng chọn khung giờ!</div>
              )}
            </Row>
            {/* Row 4 */}
            <Row>
              <Col xl={12} md={12} sm={12}>
                <Form.Item
                  label="Lý do hẹn khám:"
                  name="reason"
                  // rules={[{ required: required, message: requiredMessage }]}
                >
                  <Input.TextArea
                    style={{ width: '90%' }}
                    maxLength={255}
                    showCount
                    rows={4}
                    disabled={bookingStatus}
                    placeholder="Nhập mô tả triệu chứng, câu hỏi hoặc dấu hiệu mà người bệnh đang gặp phải"
                  />
                </Form.Item>
              </Col>
              <Col xl={12} md={12} sm={12}>
                <Form.Item
                  label="Ghi chú:"
                  name="note"
                  // rules={[{ required: required, message: requiredMessage }]}
                >
                  <Input.TextArea
                    style={{ width: '90%' }}
                    maxLength={255}
                    showCount
                    disabled={bookingStatus}
                    rows={4}
                  />
                </Form.Item>
              </Col>
            </Row>
            {/* Row 5 */}
            <Row>
              <Col span={24} style={{ display: 'flex' }}>
                <Form.Item
                  name="healthInsurance"
                  initialValue={healthInsurance}
                >
                  <Checkbox
                    onChange={e => {
                      setHealthInsurance(e.target.checked);
                    }}
                    checked={healthInsurance}
                    disabled={bookingStatus}
                  >
                    Khám BHYT
                  </Checkbox>
                </Form.Item>

                <Form.Item
                  name="reExamination"
                  initialValue={reExamination}
                  style={{ marginLeft: '100px' }}
                >
                  <Checkbox
                    onChange={e => {
                      setReExamination(e.target.checked);
                    }}
                    checked={reExamination}
                    disabled={bookingStatus}
                  >
                    Tái Khám
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>

            {/* Review row */}

            {bookDetail?.status === DONE && bookDetail?.comment && (
              <Row>
                <Review comment={bookDetail?.comment} />
              </Row>
            )}

            {/* Row Button */}
            <Row>
              <Col span={16}>
                <Button
                  onClick={() => {
                    window.history.back();
                  }}
                >
                  QUAY LẠI
                </Button>
                {bookingId ? (
                  !bookingStatus && (
                    <>
                      <Button
                        style={{
                          marginRight: 20,
                          display: listkey.includes(APPOINTMENT_EDIT)
                            ? 'inline'
                            : 'none',
                        }}
                        onClick={() => {
                          setShowCancelModal(true);
                        }}
                      >
                        HỦY
                      </Button>
                      <Button
                        style={{
                          marginRight: 20,
                          display: listkey.includes(APPOINTMENT_EDIT)
                            ? 'inline'
                            : 'none',
                        }}
                        htmlType="submit"
                      >
                        LƯU
                      </Button>
                    </>
                  )
                ) : (
                  <Button style={{ marginRight: 20 }} htmlType="submit">
                    ĐẶT HẸN
                  </Button>
                )}
              </Col>
              <Col
                style={{
                  margin: 'auto',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
                span={7}
              >
                {bookingId ? (
                  bookDetail?.relativeId ? (
                    <>
                      <Button
                        style={{ marginRight: 20 }}
                        onClick={() => {
                          history.push(
                            `/admin/patient/depent/${bookDetail?.relative?.id}`
                          );
                        }}
                      >
                        Xem Profile
                      </Button>
                      <Button
                        style={{ marginRight: 20 }}
                        onClick={() => {
                          history.push(
                            `/admin/patient/detail/${bookDetail?.patient?.id}`
                          );
                        }}
                      >
                        Xem Profile Chính
                      </Button>
                    </>
                  ) : (
                    <Button
                      style={{ marginRight: 20 }}
                      onClick={() => {
                        history.push(
                          `/admin/patient/detail/${bookDetail?.patient?.id}`
                        );
                      }}
                    >
                      Xem Profile
                    </Button>
                  )
                ) : (
                  ''
                )}
              </Col>
            </Row>
          </Form>
        </div>

        <CustomModal
          visible={isShowModal}
          onOk={modal.onOk}
          title={modal.title}
          onCancel={() => setIsShowModal(false)}
        >
          {modal.content}
        </CustomModal>

        <Modal
          visible={showCancelModal}
          title="Bạn có chắc bạn muốn hủy lịch hẹn này"
          style={{ textAlign: 'center' }}
          onCancel={() => setShowCancelModal(false)}
          footer={[
            <Button onClick={onCancelBooking}>ĐỒNG Ý</Button>,
            <Button
              className="btn-white"
              onClick={() => setShowCancelModal(false)}
            >
              QUAY LẠI
            </Button>,
          ]}
        >
          <Radio.Group
            onChange={e => {
              setRadio(e.target.value);
              setDis('none');
            }}
            defaultValue={1}
            style={{ textAlign: 'left' }}
          >
            <Radio className="radioStyle" value={1}>
              Không có nhu cầu khám nữa
            </Radio>
            <Radio className="radioStyle" value={2}>
              Muốn đổi ngày giờ
            </Radio>
            <Radio className="radioStyle" value={3}>
              Muốn đổi bác sĩ
            </Radio>
            <Radio className="radioStyle" value={4}>
              Lý do khác
            </Radio>

            <Input.TextArea
              disabled={radio === 4 ? false : true}
              style={{ width: '100%' }}
              maxLength={255}
              showCount
              rows={2}
              placeholder="Nhập lý do hủy hẹn..."
              onChange={e => {
                setVal(e.target.value);
              }}
            />
          </Radio.Group>
          <div
            style={{
              color: 'red',
              textAlign: 'center',
              display: `${dis}`,
            }}
          >
            Vui lòng nhập lý do hủy hẹn.
          </div>
        </Modal>
      </Spin>
    </>
  );
};

export default AppointmentBookingPage;
