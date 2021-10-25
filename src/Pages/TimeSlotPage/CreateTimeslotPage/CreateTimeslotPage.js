import {
  Button,
  Col,
  DatePicker,
  Form,
  message,
  Row,
  Select,
  Tag,
  TimePicker,
  Spin,
} from 'antd';
import { createTimeslot, getSpecialist, getSettingHoliday } from 'Api';
import CustomModal from 'Components/CustomModal/CustomModal';
import CustomTable from 'Components/CustomTable/CustomTable';
import { DATE_FORMAT } from 'GlobalConstants';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { getErrorMessage } from 'Utils/Helpers';
import './CreateTimeslotPage.scss';

const { RangePicker } = TimePicker;

const CreateTimeslotPage = props => {
  const { history } = props;

  const btnEl = useRef();
  const [form] = Form.useForm();

  const requiredMessage = 'Vui lòng điền thông tin này!';
  const required = true;

  const [startDate, setStateDate] = useState(
    moment().startOf('month').add(1, 'M')
  );
  const [endDate, setEndDate] = useState(moment(startDate).endOf('month'));
  const [toOpenDatePicker, setToOpenDatePicker] = useState(false);
  const [startTime, setStartTime] = useState();
  const [isShowModal, setIsShowModal] = useState(false);
  const [specialist, setSpecialist] = useState([]);
  const [countBreakTime, setCountBreakTime] = useState(0);
  const [holidays, setHolidays] = useState();
  const [hourBreak, setHourBreak] = useState([]);
  const [modal, setModal] = useState({
    content: '',
    onOk: () => {},
  });

  const period = [15, 30, 45, 60];
  const capacity = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const [isloading, setIsloading] = useState(false);

  const [paginationModal, setPaginationModal] = useState({
    page: 1,
    pageSize: 50,
    position: ['bottomCenter'],
    showSizeChanger: false,
    hideOnSinglePage: true,
  });

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    const { data } = await getSpecialist();
    setSpecialist(data.items);
    const paramsHoliday = {
      startDate: moment().startOf('year').toISOString(),
      endDate: moment().endOf('year').add(5, 'years').toISOString(),
    };
    const holiday = await getSettingHoliday(paramsHoliday);
    setHolidays(holiday.data);
  };

  const handleAddBreakTime = () => {
    if (btnEl.current) {
      btnEl.current.click();
    }
  };

  // Ngày bắt đầu && Ngày kết lúc logic
  //START
  const disabledStartDate = start => {
    // Can not select days before today
    return (
      (start && start < moment().subtract(1, 'days').endOf('day')) ||
      //Can not select holiday
      !!holidays.find(d => moment(d.date).format() === moment(start).format())
    );
  };

  const disabledEndDate = end => {
    return (
      (end && moment().endOf('day') > moment(end)) ||
      (end && moment(startDate) > moment(end)) ||
      // Can not select days before startDate or an end date greater than the 1month from start date
      (end && moment(startDate).endOf('month') < moment(end).endOf('month')) ||
      //Can not select holiday
      !!holidays.find(
        d => moment(d.date).endOf('day').format() === moment(end).format()
      )
    );
  };

  const openStartPicker = open => {
    if (!open) {
      setToOpenDatePicker(true);
    }
  };

  const openEndPicker = open => {
    setToOpenDatePicker(open);
  };

  const onChangeStartDate = start => {
    if (moment(start) > moment(endDate)) {
      setEndDate(moment(start));
      form.setFieldsValue({
        endDate: moment(start),
      });
    }

    if (endDate && moment(endDate).month() !== moment(start).month()) {
      setEndDate(moment(start).endOf('month'));
      form.setFieldsValue({
        endDate: moment(start).endOf('month'),
      });
    }
    setStateDate(start);
  };

  const onChangeEndDate = end => {
    setEndDate(end);
  };
  //END

  //Thời gian bắt đầu && Thời gian kết thúc logic
  //START

  const disabledHours = () => {
    let hours = [0, 1, 2, 3, 4, 5, 6, 17, 18, 19, 20, 21, 22, 23];
    if (startTime) {
      for (let i = 0; i < moment(startTime).hour(); i++) {
        hours.push(i);
      }
    }
    return hours;
  };

  const disabledStartHours = () => {
    let hours = [0, 1, 2, 3, 4, 5, 6, 17, 18, 19, 20, 21, 22, 23];
    return hours;
  };

  const disabledMinutes = selectedHour => {
    let minutes = [];
    if (selectedHour !== -1 && selectedHour === moment(startTime).hour()) {
      for (var i = 0; i <= moment(startTime).minutes(); i++) {
        minutes.push(i);
      }
    }
    return minutes;
  };

  const onChangeStartTime = start => {
    setStartTime(start);
  };
  //END

  const handleChangeSelect = end => {};

  const checkBreakTime = (rule, value) => {
    if (!value || moment(value[0]).unix() < moment(value[1]).unix()) {
      return Promise.resolve();
    }
    return Promise.reject('Thời gian kết thúc phải lớn hơn thời gian bắt đầu!');
  };
  const checkBreakNext = (rule, value, i) => {
    if (hourBreak[i] < moment(value[0]).unix()) return Promise.resolve();
    return Promise.reject(
      'Thời gian nghỉ bắt đầu phải lớn hơn thời gian nghỉ kết thúc của thời gian nghỉ trước.'
    );
  };

  const renderModalList = async (doctorTimeslots, type = 'XÓA') => {
    const TABLE_TIMESLOT_GET_BOOKING = [
      {
        title: 'Tên bác sĩ',
        dataIndex: 'doctor',
        align: 'center',
        width: '20%',
        render: record => {
          return <span>{record.name}</span>;
        },
      },
      {
        title: 'Ngày',
        dataIndex: 'timeslot',
        align: 'center',
        width: '10%',
        render: record => {
          return <span>{moment(record.day).format(DATE_FORMAT)}</span>;
        },
      },
      {
        title: 'Khung giờ',
        dataIndex: 'timeslot',
        align: 'center',
        width: '15%',
        render: record => {
          return (
            <span>{`${moment(record.startTime, 'HH:mm:ss').format(
              'HH:mm'
            )}-${moment(record.endTime, 'HH:mm:ss').format('HH:mm')}`}</span>
          );
        },
      },
      {
        title: 'Thao tác',
        dataIndex: 'bookings',
        // key: 'bookingId',
        align: 'center',
        width: '10%',
        render: record => (
          <a
            onClick={() =>
              history.push(`/admin/appointment/edit/${record[0].id}`)
            }
          >
            Xem
          </a>
        ),
      },
    ];
    setIsShowModal(true);
    // let newModal = { ...modal };
    let newModal = {
      content: '',
      onOk: () => {},
    };
    newModal = {
      title: 'Thông báo',
      content: (
        <>
          <div style={{ textAlign: 'left' }}>
            <div>Đã có lịch hẹn khám trong khung giờ này</div>
            <div>
              Vui lòng kiểm tra và hủy lịch hẹn trước khi{' '}
              <span style={{ color: 'red', fontWeight: 'bold' }}>{type}</span>{' '}
              khung giờ đã chọn
            </div>
          </div>
          <div>
            <CustomTable
              // loading={loading}
              columns={TABLE_TIMESLOT_GET_BOOKING}
              pagination={paginationModal}
              dataSource={doctorTimeslots}
              // onChange={handleChangeTable}
            />
          </div>
        </>
      ),
      footer: [
        <Button onClick={() => history.push(`/admin/appointment`)}>
          XEM TẤT CẢ
        </Button>,
      ],
    };
    setModal(newModal);
  };

  const confirmCreateTimeslot = async body => {
    try {
      setIsloading(true);
      // body = JSON.parse(body);
      body.confirm = true;
      const res = await createTimeslot(body);
      if (res.status === 201 && res.data.message === 'booked_timeslot') {
        // handleOpenModal(body);
        const { doctorTimeslots } = res.data;
        renderModalList(doctorTimeslots, 'TẠO');
        setIsloading(false);
      }
      if (res.status === 201 && res.data.success) {
        message.success('Tạo thành công');
        history.push('/admin/timeslot');
        setIsloading(false);
      }
      setIsloading(false);
      // message.success('Tạo thành công');
      // history.push('/admin/timeslot');
    } catch (e) {
      message.error(getErrorMessage(e));
      setIsloading(false);
    }
  };

  const handleOpenModal = body => {
    setIsShowModal(true);
    // let modalContent = { ...modal };
    let modalContent = {
      content: '',
      onOk: () => {},
    };
    modalContent.onOk = () => {
      setIsShowModal(false);
      return confirmCreateTimeslot(body);
    };
    modalContent.content = (
      <div style={{ fontWeight: 'bold' }}>
        <div>
          Khoảng thời gian tạo khung giờ bị trùng, khung giờ sẽ được cập nhật
          lại.
        </div>
        <div>Bạn có muốn tiếp tục</div>
      </div>
    );

    setModal(modalContent);
  };

  const onFinish = async value => {
    try {
      setIsloading(true);
      let timeBase = {
        startTime: moment(value.breakTimeBase[0]).format('HH:mm'),
        endTime: moment(value.breakTimeBase[1]).format('HH:mm'),
      };

      let timePlus = [];
      if (value?.breakTimePlus?.length > 0) {
        timePlus = value.breakTimePlus.map((time, i) => {
          return {
            startTime: moment(time[0]).format('HH:mm'),
            endTime: moment(time[1]).format('HH:mm'),
          };
        });
      }

      const restTime = [...timePlus, timeBase];

      const body = {
        startDate: moment(value.startDate).add('12', 'hour').toISOString(),
        endDate: moment(value.endDate).endOf('day').toISOString(),
        startTime: moment(value.startTime).format('HH:mm'),
        endTime: moment(value.endTime).format('HH:mm'),
        slot: value.slot,
        capacity: value.capacity,
        restTime,
        isActive: true,
        specialists: value.specialists,
      };

      const res = await createTimeslot(body);
      console.log(res, 'es');
      if (res.status === 201 && res.data.message === 'duplicate_timeslot') {
        handleOpenModal(body);
        setIsloading(false);
      }
      if (res.status === 201 && res.data.success) {
        message.success('Tạo thành công');
        history.push('/admin/timeslot');
        setIsloading(false);
      }
      setIsloading(false);
    } catch (e) {
      setIsloading(false);
    }
  };

  return (
    <div className="create-timeslot">
      <Spin spinning={isloading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          hideRequiredMark={true}
        >
          <h2 className="create-timeslot-title">Tạo khung giờ</h2>
          <Row style={{ margin: '32px 0 0 18px' }} gutter={64}>
            <Col xl={17} md={17} sm={17}>
              <Form.Item
                label="Chuyên khoa"
                name="specialists"
                rules={[{ required: required, message: requiredMessage }]}
                style={{ width: '50%' }}
              >
                <Select
                  optionFilterProp="children"
                  mode="multiple"
                  onChange={handleChangeSelect}
                >
                  {specialist?.map(item => {
                    return (
                      <Select.Option value={item.id} key={item.id}>
                        {item.name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>

            <Col xl={9} md={9} sm={13}>
              <Form.Item
                label="Ngày bắt đầu"
                name="startDate"
                initialValue={startDate}
                rules={[{ required: required, message: requiredMessage }]}
              >
                <DatePicker
                  onChange={onChangeStartDate}
                  disabledDate={disabledStartDate}
                  format={DATE_FORMAT}
                  allowClear={false}
                  onOpenChange={openStartPicker}
                />
              </Form.Item>
            </Col>

            <Col xl={9} md={9} sm={13}>
              <Form.Item
                label="Ngày kết thúc"
                name="endDate"
                initialValue={endDate}
                rules={[{ required: required, message: requiredMessage }]}
              >
                <DatePicker
                  onChange={onChangeEndDate}
                  format={DATE_FORMAT}
                  disabledDate={disabledEndDate}
                  open={toOpenDatePicker}
                  allowClear={false}
                  onOpenChange={openEndPicker}
                />
              </Form.Item>
            </Col>

            <Col xl={9} md={9} sm={13}>
              <Form.Item
                label="Thời gian bắt đầu"
                name="startTime"
                rules={[{ required: required, message: requiredMessage }]}
              >
                <TimePicker
                  disabledHours={disabledStartHours}
                  placeholder="7:00"
                  format="HH:mm"
                  allowClear={false}
                  onChange={onChangeStartTime}
                  minuteStep={5}
                  hideDisabledOptions={true}
                />
              </Form.Item>
            </Col>

            <Col xl={9} md={9} sm={13}>
              <Form.Item
                label="Thời gian kết thúc"
                name="endTime"
                rules={[
                  { required: required, message: requiredMessage },
                  ({ getFieldValue }) => ({
                    validator(rule, value) {
                      if (
                        !value ||
                        !getFieldValue('startTime') ||
                        getFieldValue('startTime') < moment(value)
                      ) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        'Thời gian kết thúc phải lớn hơn thời gian bắt đầu!'
                      );
                    },
                  }),
                ]}
              >
                <TimePicker
                  disabledHours={disabledHours}
                  disabledMinutes={disabledMinutes}
                  placeholder="16:00"
                  format="HH:mm"
                  allowClear={false}
                  minuteStep={5}
                  hideDisabledOptions={true}
                />
              </Form.Item>
            </Col>

            <Col xl={9} md={9} sm={13}>
              <Form.Item
                label="Khoảng thời gian (phút)"
                name="slot"
                rules={[{ required: required, message: requiredMessage }]}
                initialValue={15}
              >
                <Select>
                  {period.map((option, index) => {
                    return (
                      <Select.Option value={option} key={option}>
                        {option}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>

            <Col xl={9} md={9} sm={13}>
              <Form.Item
                label="Sức chứa (ca khám)"
                name="capacity"
                rules={[{ required: required, message: requiredMessage }]}
                initialValue={1}
              >
                <Select>
                  {capacity.map((option, index) => {
                    return (
                      <Select.Option value={option} key={option}>
                        {option}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>

            <Col xl={9} md={9} sm={13}>
              <Form.Item
                label={
                  <label>
                    Thời gian nghỉ
                    <Tag
                      color={countBreakTime < 4 ? '#61c8ce' : '#cccccc'}
                      onClick={handleAddBreakTime}
                    >
                      Thêm
                    </Tag>
                  </label>
                }
                name="breakTimeBase"
                rules={[
                  {
                    required: required,
                    message: requiredMessage,
                  },
                  {
                    validator: checkBreakTime,
                  },
                ]}
              >
                <RangePicker
                  // clearIcon={false}
                  disabledHours={disabledHours}
                  hideDisabledOptions={true}
                  minuteStep={5}
                  format="HH:mm"
                  placeholder={['12:00', '13:00']}
                  allowClear={true}
                  order={false}
                  onChange={(date, dateString, time) => {
                    setHourBreak({ ...hourBreak, [0]: moment(date[1]).unix() });
                  }}
                />
              </Form.Item>
            </Col>

            <Form.List name="breakTimePlus">
              {(fields, { add, remove }) => {
                return (
                  <>
                    <Col xl={16} md={16} sm={16}>
                      {fields.map((field, i) => (
                        <Form.Item
                          key={field.fieldKey}
                          required={true}
                          label={
                            <div style={{ height: '24px' }}>Thời gian nghỉ</div>
                          }
                        >
                          <Form.Item
                            {...field}
                            rules={[
                              {
                                required: required,
                                message: requiredMessage,
                              },
                              {
                                validator: checkBreakTime,
                              },
                              {
                                validator: (rule, value) =>
                                  checkBreakNext(rule, value, i),
                              },
                            ]}
                            noStyle
                          >
                            <RangePicker
                              format="HH:mm"
                              placeholder={['12:00', '13:00']}
                              disabledHours={disabledHours}
                              minuteStep={5}
                              hideDisabledOptions={true}
                              style={{ width: '50%' }}
                              allowClear={true}
                              order={false}
                              onChange={(date, dateString, time) => {
                                setHourBreak({
                                  ...hourBreak,
                                  [i + 1]: moment(date[1]).unix(),
                                });
                              }}
                            />
                          </Form.Item>
                          <Tag
                            color="#f75010"
                            style={{ lineHeight: '25px', height: '25px' }}
                            onClick={() => {
                              setCountBreakTime(prevCount => prevCount - 1);
                              remove(field.name);
                            }}
                          >
                            Xóa
                          </Tag>
                        </Form.Item>
                      ))}
                      {fields.length < 4 ? (
                        <Form.Item>
                          <input
                            ref={btnEl}
                            type="button"
                            onClick={() => {
                              setCountBreakTime(prevCount => prevCount + 1);
                              add();
                            }}
                            hidden={true}
                          />
                        </Form.Item>
                      ) : null}
                    </Col>
                  </>
                );
              }}
            </Form.List>
          </Row>

          <Col xl={12} md={24} sm={24}>
            <Button style={{ marginRight: 20 }} htmlType="submit">
              TẠO
            </Button>
            <Button
              style={{ marginRight: 20 }}
              onClick={() => {
                history.push('/admin/timeslot');
              }}
            >
              THOÁT
            </Button>
          </Col>
        </Form>

        <CustomModal
          visible={isShowModal}
          type="warning"
          title="Cảnh báo"
          onOk={modal.onOk}
          onCancel={() => setIsShowModal(false)}
          footer={modal.footer}
        >
          {modal.content}
        </CustomModal>
      </Spin>
    </div>
  );
};

export default CreateTimeslotPage;
