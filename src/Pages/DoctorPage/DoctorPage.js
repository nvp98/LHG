import { Button, message, Popover } from 'antd';
import { getDoctor, getSpecialist, syncDoctor } from 'Api';
import CustomTable from 'Components/CustomTable/CustomTable';
import SearchOption from 'Components/SearchOption/SearchOption';
import {
  DATE_FORMAT,
  FILTER_DOCTOR,
  DOCTOR_VIEW,
  DOCTOR_SYNC,
  TIMESLOT_VIEW,
} from 'GlobalConstants';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentParamsAction, setParamsTableAction } from 'Redux/Actions';
import { paramsTableSelector } from 'Selectors';
import { getErrorMessage } from 'Utils/Helpers';
import './DoctorPage.scss';
import _ from 'lodash';

const DoctorPage = props => {
  const dispatch = useDispatch();

  const paramsTable = useSelector(state =>
    paramsTableSelector(state.searchReducer)
  );

  const { currentParams } = useSelector(state => state.goBackReducer);

  const { history, listkey } = props;
  const [loading, setLoading] = useState(false);
  const [dataTable, setDataTable] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    position: ['bottomCenter'],
  });
  const DOCTOR_COLUMNS = [
    {
      title: 'STT',
      // dataIndex: 'num',
      key: 'num',
      width: '4%',
      align: 'center',
      render: record => {
        return <div>{record.num}</div>;
      },
    },
    {
      title: 'Mã Nhân viên',
      dataIndex: 'staffCode',
      key: 'staffCode',
      width: '5%',
      align: 'center',
    },
    {
      title: 'Tên nhân viên',
      dataIndex: 'name',
      key: 'name',
      width: '14%',
      textWrap: 'word-break',
      ellipsis: true,
      render: record => {
        return (
          <Popover content={record}>
            <div
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: 'auto',
              }}
            >
              {record}
            </div>
          </Popover>
        );
      },
    },
    {
      title: 'Học Vị',
      dataIndex: 'title',
      key: 'title',
      width: '6%',
    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone',
      width: '8%',
      align: 'center',
    },
    {
      title: 'Chuyên khoa',
      dataIndex: 'specialists',
      key: 'specialists',
      width: '15%',
      textWrap: 'word-break',
      ellipsis: true,
      render: record => {
        const sortedRecord = _.sortBy(record, x => x.DoctorSpecialists.isMain);
        let content = sortedRecord.map((item, i) => {
          return (
            <span key={i}>
              {item.name}
              {i === record.length - 1 ? '' : '; '}
            </span>
          );
        });
        return (
          <Popover content={content}>
            <div
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: 'auto',
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
      key: 'isActive',
      align: 'center',
      width: '7%',
      render: record => <div>{record.isActive ? 'Hoạt động' : 'Khóa'}</div>,
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      align: 'center',
      width: '5%',
      render: record => <div>{record && record != '0.0' ? record : 'N/A'}</div>,
    },

    {
      title: 'Lần sử dụng gần nhất',
      dataIndex: 'lastUsed',
      key: 'lastUsed',
      align: 'center',
      width: '11%',
      render: record =>
        record ? moment(record).format(`HH:mm ${DATE_FORMAT}`) : '',
    },

    {
      title: 'Chi tiết',
      align: 'center',
      width: '5%',
      render: record => (
        <a
          onClick={() => {
            redirectToDoctorDetail(record.id);
          }}
        >
          Xem
        </a>
      ),
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
      setLoading(true);

      const { data } = await getSpecialist();
      if (data) {
        fetchDataTable(currentParams);
        let specialistFilter = FILTER_DOCTOR.find(
          item => item.name === 'specialists'
        );

        specialistFilter.options = data.items.map(item => {
          return {
            key: item.id,
            name: item.name,
          };
        });
        FILTER_DOCTOR = [...FILTER_DOCTOR, specialistFilter];
      }

      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

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
    const { page, pageSize } = pagination;
    const customParams = {
      page: params.page || page,
      limit: params.pageSize || pageSize,
      sortBy: params.sortBy,
      sortType: params.sortType,

      staffCode: params.staffCode,
      name: params.name,
      specialists: params.specialists,
      status: params.status,
    };
    try {
      const { data } = await getDoctor(customParams);
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

      setPagination(paper);
      dispatch(setParamsTableAction(customParams));
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const redirectToDoctorDetail = id => {
    dispatch(setCurrentParamsAction(paramsTable));
    history.push(`/admin/doctor/detail/${id}`);
  };

  const syncDoctorFunction = async () => {
    try {
      setLoading(true);
      const { data } = await syncDoctor();
      if (data.success) {
        setLoading(false);
        message.success('Đồng bộ dữ liệu thành công');
      }
      if (!data.success) {
        setLoading(false);
        message.error('Đồng bộ dữ liệu thất bại');
      }
      initData();
    } catch (error) {
      setLoading(false);
      message.error(getErrorMessage(error));
    }
  };

  return (
    <>
      <div className="doctor_wrap">
        <div className="doctor">
          <h2 className="doctorTitle">Danh sách bác sĩ</h2>
          <div className="btn-group">
            <Button
              onClick={syncDoctorFunction}
              style={{
                display: listkey.includes(DOCTOR_SYNC) ? 'inline' : 'none',
              }}
            >
              ĐỒNG BỘ
            </Button>
            <Button
              onClick={() => {
                history.push('/admin/timeslot');
              }}
              style={{
                display: listkey.includes(TIMESLOT_VIEW) ? 'inline' : 'none',
              }}
            >
              KHUNG GIỜ
            </Button>
          </div>
        </div>
        <SearchOption
          columnFilter={FILTER_DOCTOR}
          fetchDataTable={fetchDataTable}
        />
        <CustomTable
          fixed={false}
          rowKey={record => record.id}
          loading={loading}
          pagination={pagination}
          columns={
            listkey.includes(DOCTOR_VIEW)
              ? DOCTOR_COLUMNS
              : DOCTOR_COLUMNS.splice(0, DOCTOR_COLUMNS.length - 1)
          }
          dataSource={dataTable}
          rowClassName={(record, index) => {
            let className = index % 2 ? 'table-row-light' : 'table-row-dark';
            return className;
          }}
          onChange={handleChangeTable}
        />
      </div>
    </>
  );
};

export default DoctorPage;
