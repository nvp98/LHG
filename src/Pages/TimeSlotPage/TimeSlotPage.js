import { Button, message, Popover, Table } from 'antd';
import {
  deleteAllTimeslot,
  deleteTimeslotByID,
  getSpecialist,
  getTimeslot,
  updateTimeslot,
} from 'Api';
import CustomModal from 'Components/CustomModal/CustomModal';
import CustomTable from 'Components/CustomTable/CustomTable';
import SearchOption from 'Components/SearchOption/SearchOption';
import {
  DATE_FORMAT,
  FILTER_TIMESLOT,
  TIMESLOT_CREATE,
  TIMESLOT_DELETE,
  TIMESLOT_LOCK,
} from '../../GlobalConstants';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setParamsTableAction } from 'Redux/Actions';
import { paramsTableSelector } from 'Selectors';
import { getErrorMessage } from 'Utils/Helpers';
import './TimeSlotPage.scss';

const TimeSlotPage = props => {
  const dispatch = useDispatch();
  const paramsTable = useSelector(state =>
    paramsTableSelector(state.searchReducer)
  );

  const { history, listkey } = props;
  const [loading, setLoading] = useState(false);
  const [isShowModal, setIsShowModal] = useState(false);
  const [dataTable, setDataTable] = useState([]);
  const [arrSelected, setArrSelected] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [initValue, setInitValue] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    position: ['bottomCenter'],
    showSizeChanger: false,
  });
  const [paginationModal, setPaginationModal] = useState({
    page: 1,
    pageSize: 50,
    position: ['bottomCenter'],
    showSizeChanger: false,
    hideOnSinglePage: true,
  });
  const [modal, setModal] = useState({
    content: '',
    onOk: () => {},
  });
  const [selectDay, setSelectDay] = useState({
    startDate: '',
    endDate: '',
    isActive: false,
  });

  const TIMESLOT_COLUMNS = [
    {
      title: 'Ngày',
      dataIndex: 'day',
      key: 'day',
      align: 'center',
      width: '15%',
      render: record => {
        return <span>{moment(record).format(DATE_FORMAT)}</span>;
      },
    },
    {
      title: 'Thời gian',
      align: 'center',
      width: '20%',
      render: record => {
        return (
          <span>{`${moment(record.startTime, 'HH:mm').format(
            'HH:mm'
          )} - ${moment(record.endTime, 'HH:mm').format('HH:mm')}`}</span>
        );
      },
    },
    {
      title: 'Chuyên khoa',
      dataIndex: 'specialist',
      key: 'specialist',
      align: 'center',
      width: '40%',
      render: record => {
        let content = record.name;
        return (
          <Popover content={content}>
            <div
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '500px',
              }}
            >
              {content}
            </div>
          </Popover>
        );
      },
    },
    {
      title: 'Trạng thái',
      align: 'center',
      width: '20%',
      render: record => <div>{record.isActive ? 'Hoạt động' : 'Khóa'}</div>,
    },
  ];

  const onSelectCheckbox = (selectedRowKeys, selectedRows) => {
    setArrSelected(selectedRows);
    setSelectedRowKeys(selectedRowKeys);
  };

  const rowSelection = {
    selectedRows: arrSelected,
    selectedRowKeys: selectedRowKeys,
    onChange: onSelectCheckbox,
    getCheckboxProps: record => ({
      // Column configuration not to be checked
      disabled: moment(record.day).unix() < moment().unix(),
      name: record.name,
    }),
  };

  const initData = async () => {
    try {
      let specialistFilter = FILTER_TIMESLOT.find(
        item => item.name === 'specialists'
      );

      const { data } = await getSpecialist();

      const list = data.items.map(item => {
        return {
          key: item.id,
          name: item.name,
        };
      });

      specialistFilter.options = [...list, specialistFilter.options[0]].sort(
        (a, b) => a.key - b.key
      );

      fetchDataTable({
        startDateTime: moment().startOf('day').format(),
        endDateTime: moment().endOf('day').format(),
      });
    } catch {}
  };

  useEffect(() => {
    initData();
    return () => {
      dispatch(setParamsTableAction());
    };
  }, [dispatch]);

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

  const fetchDataTable = async (params = {}, cancelToken) => {
    const { page, pageSize } = pagination;
    setLoading(true);
    setSelectDay({
      ...selectDay,
      ['startDate']: moment(params.startDateTime).startOf('day').format(),
      ['endDate']: moment(params.endDateTime).endOf('day').format(),
      ['isActive']: params.isActive
        ? params.isActive === 'true'
          ? true
          : false
        : params.isActive,
    });
    const defaultValue = {
      // day: params.day,
      specialists: params.specialists,
      startDateTime: params.startDateTime
        ? moment(params.startDateTime).startOf('day').format()
        : undefined,
      endDateTime: params.endDateTime
        ? moment(params.endDateTime).endOf('day').format()
        : undefined,
      isActive: params.isActive,
    };

    const customParams = {
      page: params.page || page,
      limit: params.pageSize || pageSize,
      sortBy: params.sortBy,
      sortType: params.sortType,

      // startDate: moment(params.day)
      //   .startOf('month')
      //   .add('12', 'hour')
      //   .toISOString(),
      // endDate: moment(params.day)
      //   .endOf('month')
      //   .add('-12', 'hour')
      //   .toISOString(),
      specialists: params.specialists,
      startDateTime: params.startDateTime
        ? moment(params.startDateTime).startOf('day').format()
        : undefined,
      endDateTime: params.endDateTime
        ? moment(params.endDateTime).endOf('day').format()
        : undefined,
      isActive: params.isActive,
    };
    try {
      const { data } = await getTimeslot(customParams);
      const paper = { ...pagination };
      paper.total = data.totalItems;
      paper.current = customParams.page;

      const filterData = data.items.filter(item => item.type === 'work');
      setDataTable(filterData);
      setPagination(paper);
      setInitValue(defaultValue);
      setArrSelected([]);
      setSelectedRowKeys([]);
      dispatch(setParamsTableAction(customParams));
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const confirmDeleteAll = async () => {
    try {
      const body = {
        // month: moment(paramsTable.day).month() + 1,
        // year: moment(paramsTable.day).year(),
        startDateTime: selectDay.startDate,
        endDateTime: selectDay.endDate,
        specialistIds:
          paramsTable?.specialists === undefined
            ? []
            : [+paramsTable.specialists],
        isActive: selectDay.isActive,
      };
      const { data } = await deleteAllTimeslot(body);
      if (data.success) {
        message.success('Xóa thành công');
        setIsShowModal(false);
        dispatch(setParamsTableAction());
        fetchDataTable(initValue);
      } else {
        const { doctorTimeslots } = data;
        setIsShowModal(false);
        renderModalList(doctorTimeslots);
      }
    } catch (e) {
      message.error(getErrorMessage(e));
      setIsShowModal(false);
    }
  };

  const confirmDeleteSelected = async () => {
    try {
      const params = {
        ids: arrSelected.map(item => item.id).join(','),
      };
      const { data } = await deleteTimeslotByID(params);
      if (data.success) {
        message.success('Xóa thành công.');
        setIsShowModal(false);
        dispatch(setParamsTableAction());
        fetchDataTable(initValue);
      } else {
        const { doctorTimeslots } = data;
        renderModalList(doctorTimeslots);
      }
    } catch (e) {
      message.error(getErrorMessage(e));
      setIsShowModal(false);
    }
  };

  const renderModalList = async (doctorTimeslots, type = 'XÓA') => {
    const location = {
      pathname: '/admin/appointment',
      state: { startDate: selectDay.startDate, endDate: selectDay.endDate },
    };

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
              loading={loading}
              columns={TABLE_TIMESLOT_GET_BOOKING}
              pagination={paginationModal}
              dataSource={doctorTimeslots}
              // onChange={handleChangeTable}
            />
          </div>
        </>
      ),
      footer: [
        <Button onClick={() => history.push(location)}>XEM TẤT CẢ</Button>,
      ],
    };
    setModal(newModal);
  };

  const changeStatus = async () => {
    try {
      const timeslotIds = [];
      arrSelected.map(item => timeslotIds.push(item.id));
      const body = {
        isActive: !arrSelected[0].isActive,
        timeslotIds,
      };
      const { data } = await updateTimeslot(body);
      if (data.success) {
        fetchDataTable(initValue);
        message.success('Thay đổi thành công.');
      } else {
        const { doctorTimeslots } = data;
        const type = 'KHÓA';
        renderModalList(doctorTimeslots, type);
      }
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const handleOpenModal = type => {
    setIsShowModal(true);
    // let newModal = { ...modal };
    let newModal = {
      content: '',
      onOk: () => {},
    };

    let deleteType = null;

    if (type === 'deleteAll') {
      deleteType = <span style={{ color: 'red' }}> XÓA TẤT CẢ </span>;
      newModal.onOk = () => {
        return confirmDeleteAll();
      };
    } else {
      deleteType = <span style={{ color: 'red' }}> XÓA ĐÃ CHỌN </span>;
      newModal.onOk = () => {
        return confirmDeleteSelected();
      };
    }

    newModal.content = (
      <div style={{ fontWeight: 'bold' }}>
        <div>
          Bạn đã chọn {deleteType}
          timeslot có trên hệ thống.
        </div>
        <div>
          Sau khi xóa hệ thống sẽ không thể khôi phục được danh sách timeslot
          này
        </div>
        <div>Bạn có thật sự muốn XÓA</div>
      </div>
    );

    setModal(newModal);
  };

  const disabledLockBtn = () => {
    if (arrSelected.length > 0) {
      if (arrSelected.length > 1) {
        const result =
          arrSelected.every(item => item.isActive === false) ||
          arrSelected.every(item => item.isActive === true);
        return !result;
      }
      return false;
    }
    return true;
  };

  const renderBtnName = () => {
    if (arrSelected.length > 0) {
      if (arrSelected.every(item => item.isActive === false)) {
        return 'MỞ KHÓA';
      }
      if (arrSelected.every(item => item.isActive === true)) {
        return 'KHÓA';
      }
    }
    return 'KHÓA / MỞ KHÓA';
  };

  return (
    <>
      <div className="timeslot_wrap">
        <div className="timeslot">
          <h2 className="timeslot-title">Danh sách khung giờ làm việc</h2>
          <div
            style={{
              display: listkey.includes('timeslot-create') ? 'inline' : 'none',
            }}
          >
            <Button
              onClick={() => {
                history.push(`/admin/timeslot/create`);
              }}
            >
              TẠO KHUNG GIỜ
            </Button>
          </div>
        </div>
        <div className="btn-group">
          <Button
            onClick={() => handleOpenModal('deleteAll')}
            style={{
              display: listkey.includes(TIMESLOT_DELETE) ? 'inline' : 'none',
            }}
          >
            XÓA TẤT CẢ
          </Button>
          <Button
            disabled={arrSelected.length > 0 ? false : true}
            onClick={() => handleOpenModal('deleteSelected')}
            style={{
              display: listkey.includes(TIMESLOT_DELETE) ? 'inline' : 'none',
            }}
          >
            XÓA ĐÃ CHỌN
          </Button>
          <Button
            disabled={disabledLockBtn()}
            onClick={changeStatus}
            style={{
              display: listkey.includes(TIMESLOT_LOCK) ? 'inline' : 'none',
            }}
          >
            {renderBtnName()}
          </Button>
        </div>

        <SearchOption
          columnFilter={FILTER_TIMESLOT}
          fetchDataTable={fetchDataTable}
        />

        <CustomTable
          rowKey={record => record.id}
          rowSelection={rowSelection}
          loading={loading}
          pagination={pagination}
          columns={TIMESLOT_COLUMNS}
          dataSource={dataTable}
          rowClassName={(record, index) => {
            let className = index % 2 ? 'table-row-light' : 'table-row-dark';
            return className;
          }}
          onChange={handleChangeTable}
        />
      </div>
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
    </>
  );
};

export default TimeSlotPage;
