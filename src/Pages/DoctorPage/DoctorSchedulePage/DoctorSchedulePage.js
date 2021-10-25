import { Button, message, Spin, Modal, Input, Form } from 'antd';
import {
  getDoctorTimeslotByID,
  getSettingHoliday,
  updateDoctorTimeslot,
} from 'Api';
import CustomBigCalendar from 'Components/CustomBigCalendar/CustomBigCalendar';
import CustomEvent from 'Components/CustomEvent/CustomEvent';
import CustomModal from 'Components/CustomModal/CustomModal';
import CustomProgress from 'Components/CustomProgress/CustomProgress';
import WorkWeek from 'Components/WorkWeek/workWeek';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import { fetchAllApi } from 'Utils';
import { getErrorMessage } from 'Utils/Helpers';
import { TIMESLOT_LOCK, APPOINTMENT_CREATE } from 'GlobalConstants';
import './DoctorSchedulePage.scss';

const DoctorSchedulePage = props => {
  const { history, match, listkey } = props;
  const { id } = match.params;
  const views = {
    myweek: WorkWeek,
  };
  const [isLoading, setIsLoading] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState();
  const [arrDay, setArrDay] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [view, setView] = useState('myweek');
  const [events, setEvent] = useState([]);
  const [step, setStep] = useState(15);
  const [holidays, setHolidays] = useState();
  const [isShowModal, setIsShowModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [modal, setModal] = useState({
    content: '',
    onOk: () => {},
  });
  const [form] = Form.useForm();
  const [timeslotId, setTimeslotId] = useState('');

  useEffect(() => {
    //Khởi tạo dữ liệu ban đầu
    initData();
  }, []);

  const initData = async () => {
    try {
      setIsLoading(true);
      if (id) {
        const paramsHoliday = {
          startDate: moment().startOf('year').toISOString(),
          endDate: moment().endOf('year').add(5, 'years').toISOString(),
        };

        const response = await fetchAllApi([
          getDoctorTimeslotByID(id),
          getSettingHoliday(paramsHoliday),
        ]);
        setHolidays(response[1].data);

        setDoctorInfo(response[0].data);
        const result = [
          ...convertDataCalendar(response[0].data.timeslots),
          ...convertHoliday(response[1].data),
        ];
        setEvent(result);
        setEfficiency(moment(), result);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      message.error(getErrorMessage(error));
    }
  };

  const convertHoliday = holidays => {
    let slot = [];
    holidays.forEach(item => {
      const convertedHoliday = {
        title: item.name,
        type: 'rest',
        start: new Date(moment(item.date).startOf('day')),
        end: new Date(moment(item.date).endOf('day')),
      };
      slot = [...slot, convertedHoliday];
    });
    return slot;
  };

  const convertTitleEvent = item => {
    return !item.isActive || !item.DoctorTimeslots.status
      ? 'Khóa'
      : item.type === 'rest'
      ? 'N/A'
      : item.capacity === item.bookings.length && item.capacity === 1
      ? item.bookings[0].code
      : `${item.bookings.length} / ${item.capacity}`;
  };

  const convertTypeEvent = item => {
    return moment(`${item.day}:${item.startTime}`).unix() < moment().unix()
      ? 'expire'
      : !item.isActive || !item.DoctorTimeslots.status
      ? 'lock'
      : item.capacity === item.bookings.length
      ? item.capacity === 1
        ? 'oneTimeslot'
        : 'rest'
      : item.type;
  };

  //Chuyển dữ liệu từ API cho phù hợp với dữ liệu của Calendar
  const convertDataCalendar = times => {
    let slot = [];
    times.forEach(item => {
      const convertedTimeslot = {
        ...item,
        title: convertTitleEvent(item),
        type: convertTypeEvent(item),
        start: new Date(moment(`${item.day}:${item.startTime}`)),
        end: new Date(moment(`${item.day}:${item.endTime}`)),
      };
      slot = [...slot, convertedTimeslot];
    });

    setStep(getStep(slot));
    return slot;
  };

  const handleDayClick = (date, modifiers = {}) => {
    if (modifiers.disabled) {
      return;
    }
    setEfficiency(date, events);
    setSelectedDay(date);
  };

  // Lấy hiệu suất ngày trong tuần đã chọn
  const setEfficiency = (day, timeslot) => {
    let startOfWeek = moment(day).startOf('week').add(1, 'd');
    const endOfWeek = moment(day).endOf('week');

    let daysOfWeek = [];
    let week = {};

    while (startOfWeek <= endOfWeek) {
      const day = startOfWeek.format('DD/MM');

      week = {
        ...week,
        [day]: timeslot.filter(
          item => item.day === moment(startOfWeek).format('yyyy-MM-DD')
        ),
      };

      daysOfWeek = [
        ...daysOfWeek,
        {
          day,
          percent: Math.ceil(
            (week[day].reduce((acc, cur) => {
              return acc + cur.bookings.length;
            }, 0) /
              week[day].reduce((acc, cur) => {
                return acc + cur.capacity;
              }, 0)) *
              100
          ),
        },
      ];
      startOfWeek = startOfWeek.add(1, 'd');
    }
    setArrDay(daysOfWeek);
  };

  const lockTimeSlot = async (timeslotId, body) => {
    try {
      await updateDoctorTimeslot(id, timeslotId, body);
      setIsShowModal(false);
      setShowLockModal(false);
      initData();
      if (!body.status) {
        message.success('Khóa thành công');
      } else {
        message.success('Mở khóa thành công');
      }
      setIsShowModal(false);
      setShowLockModal(false);
    } catch (error) {
      message.error(getErrorMessage(error));
      setIsShowModal(false);
      setShowLockModal(false);
    }
  };

  const onClickBooking = timeslot => {
    const doctorBooking = {
      doctor: doctorInfo,
      timeslot: timeslot,
    };
    history.push({
      pathname: '/admin/appointment/create/booking',
      state: { doctorBooking },
    });
  };

  const onFinish = async (values = {}) => {
    const body = {
      note: values.reason || '',
      status: false,
    };
    lockTimeSlot(timeslotId, body);
  };

  const onSelectEvent = timeslot => {
    form.resetFields();
    const body = {
      note: '',
    };

    setTimeslotId(timeslot.id);

    let modalContent = { ...modal };
    if (timeslot.type === 'work' && timeslot.bookings.length === 0) {
      if (
        listkey.includes(APPOINTMENT_CREATE) ||
        listkey.includes(TIMESLOT_LOCK)
      ) {
        setIsShowModal(true);
      }

      // body.status = false;
      modalContent.content = 'Vui lòng chọn';
      modalContent.title = 'Cảnh báo';
      modalContent.footer = [
        <Button
          key="submit"
          onClick={() => {
            setIsShowModal(false);
            setShowLockModal(true);
          }}
          style={{
            display: listkey.includes(TIMESLOT_LOCK) ? 'initial' : 'none',
          }}
        >
          KHÓA
        </Button>,
        <Button
          onClick={() => {
            onClickBooking(timeslot);
          }}
          style={{
            display: listkey.includes(APPOINTMENT_CREATE) ? 'initial' : 'none',
          }}
        >
          ĐẶT HẸN
        </Button>,
      ];
    }
    if (timeslot.type === 'lock' && timeslot.isActive) {
      setIsShowModal(true);
      body.status = true;
      modalContent.title = 'Bạn có muốn mở khóa khung giờ này';
      modalContent.content = (
        <>
          <p
            style={{
              textAlign: 'left',
              width: '400px',
              margin: 'auto',
              marginBottom: '10px',
            }}
          >
            Lý do khung giờ bị khóa trước đây
          </p>
          <div
            style={{
              color: 'red',
              width: '400px',
              height: '100px',
              margin: 'auto',
              textAlign: 'left',
            }}
          >
            {events.map((item, index) => {
              if (item.id === timeslot.id) return item.DoctorTimeslots.note;
            })}
          </div>
        </>
      );
      modalContent.footer = [
        <Button
          key="submit"
          onClick={() => {
            lockTimeSlot(timeslot.id, body);
          }}
        >
          MỞ KHÓA
        </Button>,
        <Button
          className="btn-white"
          onClick={() => {
            setIsShowModal(false);
          }}
        >
          THOÁT
        </Button>,
      ];
    }
    if (timeslot.type === 'oneTimeslot' && timeslot.bookings.length !== 0) {
      history.push(`/admin/appointment/edit/${timeslot.bookings[0].id}`);
    }
    setModal(modalContent);
  };
  //Disabled cho DayPicker
  const modifiers = {
    sundays: [{ daysOfWeek: [0] }],
  };

  if (holidays) {
    holidays.forEach(item => {
      modifiers.sundays.push(new Date(item.date));
    });
  }

  // const modifiersStyles = {
  // saturdays: {
  //   color: '#68B2A0',
  // },
  // sundays: {
  //   color: '#cccccc',
  // },
  // };

  const eventStyleGetter = timeslot => {
    const backgroundColor = timeslot => {
      if (timeslot.type === 'lock' || timeslot.type === 'oneTimeslot') {
        return '#f4d174';
      } else if (['rest', 'holiday', 'expire'].includes(timeslot.type)) {
        return '#ddd';
      } else {
        return '#FFFFFF';
      }
    };
    const style = {
      backgroundColor: backgroundColor(timeslot),
      // borderRadius: '5px',
      color: '#205072',
      border: '0.1px solid #38bcb2',
      display: 'block',
    };
    return {
      style: style,
    };
  };

  const renderSpecialist = () => {
    let arr = [];
    if (doctorInfo?.specialists.length > 0) {
      arr = doctorInfo?.specialists?.sort((a, b) => {
        return a.DoctorSpecialists?.isMain - b.DoctorSpecialists?.isMain;
      });
    }
    return arr.map((item, i) => {
      return (
        <p key={i}>
          {item.name}
          {arr.length - 1 === i ? '' : '; '}
        </p>
      );
    });
  };

  const getStep = slot => {
    if (slot.length > 0) {
      let start = new Date(`${slot[0].day} ${slot[0].startTime}`).getTime();
      let end = new Date(`${slot[0].day} ${slot[0].endTime}`).getTime();
      return (end - start) / 60000;
    }
    return 30;
  };

  return (
    <>
      <Spin spinning={isLoading}>
        {/* {doctorInfo && ( */}
        <div className="doctor_calendar">
          <div className="doctor">
            <div className="doctor_info">
              <div>
                <div>Tên nhân viên:</div>
                <span style={{ textTransform: 'uppercase' }}>
                  {doctorInfo?.name}
                </span>
              </div>

              <div style={{ display: 'flex' }}>
                <div>Chuyên khoa:</div>
                <span>{renderSpecialist()}</span>
              </div>

              <div>
                <div>Nơi làm việc:</div>
                <span>Phòng khám: {doctorInfo?.department}</span>
              </div>
            </div>
            <Button
              className="doctor_button"
              onClick={() => {
                history.push(`/admin/doctor/detail/${id}`);
              }}
            >
              XEM HỒ SƠ
            </Button>
          </div>

          <div className="calendar">
            <div>
              <div className="day_picker">
                <DayPicker
                  modifiers={modifiers}
                  // modifiersStyles={modifiersStyles}
                  onDayClick={handleDayClick}
                  selectedDays={selectedDay}
                  firstDayOfWeek={1}
                  disabledDays={[
                    {
                      after:
                        doctorInfo?.timeslots[0] &&
                        new Date(moment(doctorInfo?.timeslots[0].day)),
                    },
                    ...modifiers.sundays,
                  ]}
                />
              </div>
              <div style={{ paddingTop: '30px' }}>
                <h3>Hiệu suất ngày</h3>
                {arrDay && <CustomProgress arrDay={arrDay} />}
              </div>
            </div>
            <div className="big-calendar">
              <CustomBigCalendar
                selectable="ignoreEvents"
                step={step}
                events={events}
                view={view}
                onView={newView => setView(newView)}
                views={views}
                date={selectedDay}
                onNavigate={date => {
                  setSelectedDay(date);
                }}
                style={{
                  height: 600,
                  paddingLeft: '100px',
                  paddingRight: '100px',
                }}
                onSelectEvent={onSelectEvent}
                eventPropGetter={eventStyleGetter}
                messages={{
                  myweek: 'My Week',
                }}
                components={{
                  event: CustomEvent,
                }}
              />
            </div>
          </div>
        </div>
        {/* )} */}
        <CustomModal
          visible={isShowModal}
          // type="warning"
          title={modal.title}
          onOk={modal.onOk}
          onCancel={() => setIsShowModal(false)}
          footer={modal.footer}
        >
          {modal.content}
        </CustomModal>
        <Modal
          visible={showLockModal}
          title="Bạn có chắc chắn khóa khung giờ này"
          style={{ textAlign: 'center' }}
          onCancel={() => {
            setShowLockModal(false);
          }}
          footer={[]}
        >
          <Form form={form} onFinish={onFinish} hideRequiredMark={true}>
            <Form.Item
              name="reason"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: 'Vui lòng nhập lý do khóa khung giờ.',
                },
              ]}
            >
              <Input.TextArea
                style={{ width: '400px', margin: 'auto' }}
                maxLength={255}
                showCount
                rows={4}
                placeholder="Nhập lý do khóa khung giờ"
              />
            </Form.Item>
            <div>
              <Button htmlType="submit">ĐỒNG Ý</Button>
              <Button
                className="btn-white"
                onClick={() => setShowLockModal(false)}
              >
                THOÁT
              </Button>
            </div>
          </Form>
        </Modal>
      </Spin>
    </>
  );
};

export default DoctorSchedulePage;
