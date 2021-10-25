import { Popover } from 'antd';
import { getPatient } from 'Api';
import CustomTable from 'Components/CustomTable/CustomTable';
import SearchOption from 'Components/SearchOption/SearchOption';
import { DATE_FORMAT, FILTER_PATIENT, PATIENT_VIEW } from 'GlobalConstants';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { setParamsTableAction, setCurrentParamsAction } from 'Redux/Actions';
import { paramsTableSelector } from 'Selectors';
import './PatientPage.scss';

const PatientPage = props => {
  const dispatch = useDispatch();

  const { listkey } = props;
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

  const PATIENT_COLUMNS = [
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
      title: 'Tên người bệnh',
      dataIndex: 'name',
      key: 'name',
      width: '15%',
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
      title: 'Ngày sinh',
      key: 'dateOfBirth',
      width: '10%',
      align: 'center',
      render: record => (
        <div>
          {record.dateOfBirth
            ? record.dateOfBirth &&
              moment(record.dateOfBirth).format(DATE_FORMAT)
            : ''}
        </div>
      ),
    },
    {
      title: 'Giới tính',
      key: 'gender',
      width: '10%',
      align: 'center',
      render: record => (
        <div>
          {record.gender === '1' ? 'Nam' : record.gender === '2' ? 'Nữ' : ''}
        </div>
      ),
    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone',
      align: 'center',
      width: '10%',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      width: '25%',
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
      title: 'Trạng thái',
      key: 'isActive',
      align: 'center',
      width: '8%',
      render: record => <div>{record.isActive ? 'Hoạt động' : 'Khóa'}</div>,
    },
    {
      title: 'Hồ sơ y tế',
      key: 'resume',
      width: '10%',
      render: record => (
        <div>{record.code ? record.code : 'Chưa liên kết'}</div>
      ),
    },
    {
      title: 'Thao Tác',
      align: 'center',
      width: '10%',
      render: record => (
        <a
          onClick={() => {
            redirectToPatientDetail(record.id);
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
      fetchDataTable(currentParams);
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

      name: params.name,
      code: params.code,
      phone: params.phone,
      isActive: params.isActive,
      from: params.from
        ? moment(params.from).startOf('day').format()
        : undefined,
      to: params.to ? moment(params.to).endOf('day').format() : undefined,
      isConnect: params.isConnect,
    };
    try {
      // debugger;
      const { data } = await getPatient(customParams);
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

  const redirectToPatientDetail = id => {
    dispatch(setCurrentParamsAction(paramsTable));
    history.push(`/admin/patient/detail/${id}`);
  };

  return (
    <>
      <div
        className="Patient"
        style={{ boxShadow: '34px 34px 89px #329D9C14' }}
      >
        <h2 className="Patient_Title">Danh sách người bệnh</h2>
        <SearchOption
          columnFilter={FILTER_PATIENT}
          fetchDataTable={fetchDataTable}
        />
        <CustomTable
          fixed={false}
          rowKey={record => record.id}
          loading={loading}
          rowClassName={(record, index) => {
            let className = index % 2 ? 'table-row-light' : 'table-row-dark';
            return className;
          }}
          pagination={pagination}
          columns={
            listkey.includes(PATIENT_VIEW)
              ? PATIENT_COLUMNS
              : PATIENT_COLUMNS.splice(0, PATIENT_COLUMNS.length - 1)
          }
          dataSource={dataTable}
          onChange={handleChangeTable}
        />
      </div>
    </>
  );
};

export default PatientPage;
