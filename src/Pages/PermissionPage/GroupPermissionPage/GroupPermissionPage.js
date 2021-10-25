import React, { useState, useEffect } from 'react';
import { Button, Popover } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { setCurrentParamsAction, setParamsTableAction } from 'Redux/Actions';
import { paramsTableSelector } from 'Selectors';
import CustomTable from 'Components/CustomTable/CustomTable';
import SearchOption from 'Components/SearchOption/SearchOption';
import { PERMISSION_CREATE, PERMISSION_EDIT } from 'GlobalConstants';
import { getPermissionGroup, getHospital } from 'Api';
import './GroupPermissionPage.scss';

const GroupPermissionPage = props => {
  const dispatch = useDispatch();

  const paramsTable = useSelector(state =>
    paramsTableSelector(state.searchReducer)
  );
  const { currentParams } = useSelector(state => state.goBackReducer);
  const { listkey } = props;
  const history = useHistory();
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    position: ['bottomCenter'],
  });
  const [hospitalSelect, setHospitalSelect] = useState();

  const USER_COLUMNS = [
    {
      title: 'Tên nhóm',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      textWrap: 'word-break',
      align: 'center',
      render: record => {
        return <Popover content={record}>{record}</Popover>;
      },
    },
    {
      title: 'Bệnh viện',
      dataIndex: 'hospitalId',
      key: 'hospitalId',
      width: '20%',
      textWrap: 'word-break',
      align: 'center',
      render: record => {
        return hospitalSelect?.map((item, index) => {
          return item?.key === record ? (
            <Popover content={item.name}>{item.name}</Popover>
          ) : (
            ''
          );
        });
      },
    },
    {
      title: 'Số lượng người dùng',
      dataIndex: 'userCount',
      key: 'userCount',
      width: '15%',
      textWrap: 'word-break',
      align: 'center',
    },
    {
      title: 'Thao tác',
      align: 'center',
      width: '10%',
      render: record => (
        <a
          onClick={() => {
            redirectToPermissionGroup(record.id);
          }}
        >
          Xem
        </a>
      ),
    },
  ];

  const FILTER_GROUP_PERMISSION = [
    {
      type: 'input',
      label: 'Tên nhóm',
      name: 'name',
      placeholder: 'Nhập tên nhóm',
    },
    {
      type: 'select',
      label: 'Bệnh viện',
      name: 'hospitalId',
      placeholder: 'Tất cả',
      defaultValue: 'Tất cả',
      options: hospitalSelect,
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
      fetchDataTable({
        sortBy: 'name',
        sortType: 'ASC',
        ...currentParams,
      });
      const { data } = await getHospital();
      let hosList = [{ key: 0, name: 'Tất cả' }];
      data.items.map(item => {
        let c = { key: item?.id, name: item?.name };
        return hosList.push(c);
      });
      setHospitalSelect(hosList);
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
      hospitalId: params.hospitalId,
    };
    try {
      const { data } = await getPermissionGroup(customParams);
      const paper = { ...pagination };
      paper.total = data.totalItems;
      paper.current = customParams.page;

      setDataTable(data.items);
      setLoading(false);
      setPagination(paper);
      dispatch(setParamsTableAction(customParams));
    } catch {
      setLoading(false);
    }
  };

  const redirectToPermissionGroup = id => {
    dispatch(setCurrentParamsAction(paramsTable));
    history.push(`/admin/permission/edit/${'group'}/${id}`);
  };

  return (
    <>
      <div
        className="Grouppermission-wrap"
        style={{ boxShadow: '34px 34px 89px #329D9C14' }}
      >
        <div className="Grouppermission_title">
          <h2 style={{ fontWeight: 'bold' }}>Phân quyền nhóm</h2>
          <div
            className="btn-app"
            style={{
              display: listkey.includes(PERMISSION_CREATE) ? 'inline' : 'none',
            }}
          >
            <Button
              loading={false}
              onClick={() => {
                history.push(`/admin/permission/add/${'group'}`);
              }}
            >
              THÊM
            </Button>
          </div>
        </div>
        <SearchOption
          columnFilter={FILTER_GROUP_PERMISSION}
          fetchDataTable={fetchDataTable}
          lg={12}
          xl={12}
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
            listkey.includes(PERMISSION_EDIT)
              ? USER_COLUMNS
              : USER_COLUMNS.splice(0, USER_COLUMNS.length - 1)
          }
          dataSource={dataTable}
          onChange={handleChangeTable}
        />
      </div>
    </>
  );
};

export default GroupPermissionPage;
