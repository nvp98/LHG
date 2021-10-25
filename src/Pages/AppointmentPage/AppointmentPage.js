import { Button } from 'antd';
import { getAllBooking, getRelativeID } from 'Api';
import CustomTable from 'Components/CustomTable/CustomTable';
import SearchOption from 'Components/SearchOption/SearchOption';
import {
  DATE_FORMAT,
  APPOINTMENT_VIEW,
  APPOINTMENT_EDIT,
  APPOINTMENT_CREATE,
} from 'GlobalConstants';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { setCurrentParamsAction, setParamsTableAction } from 'Redux/Actions';
import { paramsTableSelector } from 'Selectors';
import { convertStatus } from 'Utils/Helpers';
import './AppointmentPage.scss';
import { convertUsernameToFullname } from '../../Utils/Helpers/convertUsernameToFullname';
import { CheckOutlined } from "@ant-design/icons";

const AppointmentPage = props => {
  const { listkey } = props;
  const { startDate, endDate } = props.location?.state
    ? props.location?.state
    : '';

  const dispatch = useDispatch();
  const paramsTable = useSelector(state =>
    paramsTableSelector(state.searchReducer)
  );
  const { currentParams } = useSelector(state => state.goBackReducer);
  const history = useHistory();
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    position: ['bottomCenter'],
  });

  const FILTER_APPOINTMENT = [
    {
      type: 'input',
      label: 'Mã đặt hẹn',
      name: 'code',
      placeholder: '',
    },
    {
      type: 'input',
      label: 'Tên người bệnh',
      name: 'name',
      placeholder: '',
    },
    {
      type: 'inputNumber',
      label: 'Số điện thoại',
      name: 'phone',
    },
    {
      type: 'select',
      label: 'Trạng thái',
      name: 'status',
      placeholder: 'Tất cả',
      defaultValue: 0,
      options: [
        { key: 0, name: 'Tất cả' },
        { key: 'waiting', name: 'Đang chờ' },
        { key: 'received', name: 'Tiếp nhận' },
        { key: 'cancelled', name: 'Đã hủy' },
        { key: 'done', name: 'Đã xong' },
        { key: 'late', name: 'Quá hạn' },
      ],
    },
    {
      label: 'Thời gian',
      type: 'rangePicker',
      name: ['from', 'to'],
      format: DATE_FORMAT,
      placeholder: ['Từ ngày', 'Đến ngày'],
      defaultValue: startDate
        ? [moment(startDate).startOf('day'), moment(endDate).endOf('day')]
        : [moment().startOf('day'), moment().endOf('day')],
    },
    {
      type: 'select',
      label: 'Lịch hẹn',
      name: 'hasTimeslot',
      placeholder: 'Tất cả',
      defaultValue: 0,
      options: [
        { key: 0, name: 'Tất cả' },
        { key: 'true', name: 'Có khung giờ' },
        { key: 'false', name: 'Không có khung giờ' },
      ],
    },
  ];

  useEffect(() => {
    initData();
    return () => {
      dispatch(setParamsTableAction());
    };
  }, []);
  const initData = async () => {
    try {
      if (startDate) {
        fetchDataTable({
          from: startDate,
          to: endDate,
          ...currentParams,
        });
      } else {
        fetchDataTable({
          from: moment().startOf('day').format(),
          to: moment().endOf('day').format(),
          ...currentParams,
        });
      }
    } catch {
      setLoading(false);
    }
  };

  const APPOINTMENT_COLUMNS = [
    {
      title: 'STT',
      key: 'num',
      width: '4%',
      align: 'center',
      render: record => {
        console.log('record', record);
        return <div>{record.num}</div>;
      },
    },
    {
      title: 'Mã đặt hẹn',
      key: 'code',
      width: '10%',
      align: 'center',
      render: record => <div>{record?.code ? record.code : ''}</div>,
    },
    {
      title: 'Lịch hẹn',
      key: 'calander',
      width: '10%',
      align: 'center',
      render: record => {
        const { timeslot, bookingDate } = record;

        let title = '';
        if (timeslot) {
          title = moment(`${timeslot.day} ${timeslot.startTime}`).format(
            `HH:mm ${DATE_FORMAT}`
          );
        } else {
          title = `00:00 ${moment(bookingDate).format(DATE_FORMAT)}`;
        }
        return title;
      },
    },
    {
      title: 'Tên người bệnh',
      // dataIndex: 'name',
      key: 'name',
      width: '15%',
      textWrap: 'word-break',
      ellipsis: true,
      align: 'center',
      render: record => (
        <div>
          {record?.relativeId !== null
            ? record.relative?.name
            : record?.patient.name}
        </div>
      ),
    },
    {
      title: 'TK chính',
      key: 'type',
      width: '5%',
      align: 'center',
      render: record => (
        <div>
          {record?.relativeId !== null
            ? ''
            : <CheckOutlined />}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: '10%',
      align: 'center',
      render: record => (
        <div>{record?.status ? convertStatus(record?.status) : ''}</div>
      ),
    },
    {
      title: 'Hồ sơ y tế',
      key: 'codeRecord',
      width: '10%',
      align: 'center',
      render: record => (
        <div>
          {record?.relativeId !== null
            ? record.relative?.code
              ? record.relative?.code
              : 'Chưa liên kết'
            : record?.patient.code
            ? record.patient?.code
            : 'Chưa liên kết'}
        </div>
      ),
    },
    {
      title: 'Đánh giá',
      key: '',
      align: 'center',
      width: '10%',
      render: record => (
        <div>{record?.comment ? record?.comment.vote : 'N/A'}</div>
      ),
    },
    {
      title: 'Người đặt hẹn',
      key: '',
      align: 'center',
      width: '10%',
      render: record => (
        <div style={{color: record?.createdBy == 'Người bệnh' ? '#205072' : 'coral'}}>{record?.createdBy ? convertUsernameToFullname(record?.createdBy) : 'N/A'}</div>
      ),
    },
    {
      title: 'Chi tiết',
      align: 'center',
      width: '10%',
      render: record => (
        <a
          onClick={() => {
            redirectToAppointmentDetail(record.id);
          }}
        >
          Xem
        </a>
      ),
    },
  ];

  const handleChangeTable = (pagination, filters, sorter) => {
    const sortOrder =
      sorter.order === 'ascend'
        ? 'ASC'
        : sorter.order === 'descend'
        ? 'DESC'
        : undefined;

    fetchDataTable({
      ...paramsTable,
      pageSize: pagination.pageSize,
      page: pagination.current,
      sortBy: sorter.field,
      sortType: sortOrder,
    });
  };

  const fetchDataTable = async (params = {}) => {
    setLoading(true);
    // if (params.from === undefined && props.location.state)
    //   history.replace(props.location.state, null);
    const { page, pageSize } = pagination;
    const customParams = {
      page: params.page || page,
      limit: params.pageSize || pageSize,
      sortBy: params.sortBy,
      sortType: params.sortType,

      code: params.code,
      from: params.from
        ? moment(params.from).startOf('day').format()
        : params.from,
      to: params.to ? moment(params.to).endOf('day').format() : params.to,
      name: params.name,
      phone: params.phone,
      status: params.status,
      patientId: params.patientId,
      doctorId: params.doctorId,
      hasTimeslot: params.hasTimeslot,
      specialists: params.specialists,
    };

    try {
      const { data } = await getAllBooking(customParams);
      const paper = { ...pagination };
      paper.total = data.totalItems;
      paper.current = customParams.page;

      let arr = [];
      let count = {};
      data.items.map((item, i) => {
        count['num'] = i + 1 + (customParams.page - 1) * pageSize;
        const obj = Object.assign(item, count);
        return arr.push(obj);
      });

      setDataTable(arr);

      setLoading(false);
      setPagination(paper);
      dispatch(setParamsTableAction(customParams));
    } catch {
      setLoading(false);
    }
  };
  const redirectToAppointmentDetail = id => {
    dispatch(setCurrentParamsAction(paramsTable));
    history.push(`/admin/appointment/edit/${id}`);
  };
  return (
    <>
      <div
        className="Appointment"
        style={{ boxShadow: '34px 34px 89px #329D9C14' }}
      >
        <div className="Appointment_Title">
          <h2 style={{ fontWeight: 'bold' }}>Danh sách đặt hẹn</h2>
          <div
            className="btn-app"
            style={{
              display: listkey.includes(APPOINTMENT_CREATE)
                ? 'initial'
                : 'none',
            }}
          >
            <Button
              loading={false}
              onClick={() => {
                history.push('/admin/appointment/create/booking');
              }}
            >
              ĐẶT HẸN
            </Button>
          </div>
        </div>

        <SearchOption
          columnFilter={FILTER_APPOINTMENT}
          fetchDataTable={fetchDataTable}
        />

        <CustomTable
          fixed={false}
          rowKey={record => record.id}
          loading={loading}
          pagination={pagination}
          columns={APPOINTMENT_COLUMNS}
          // columns={
          //   listkey.includes(APPOINTMENT_EDIT)
          //     ? APPOINTMENT_COLUMNS
          //     : APPOINTMENT_COLUMNS.splice(0, APPOINTMENT_COLUMNS.length - 1)
          // }
          rowClassName={(record, index) => {
            let className = index % 2 ? 'table-row-light' : 'table-row-dark';
            return className;
          }}
          dataSource={dataTable}
          onChange={handleChangeTable}
        />
      </div>
    </>
  );
};
export default AppointmentPage;
