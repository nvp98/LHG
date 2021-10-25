import React, { useState, useEffect } from 'react';
import { Button, Popover } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { setCurrentParamsAction, setParamsTableAction } from 'Redux/Actions';
import { paramsTableSelector } from 'Selectors';
import CustomTable from 'Components/CustomTable/CustomTable';
import SearchOption from 'Components/SearchOption/SearchOption';
import { PERMISSION_CREATE, PERMISSION_EDIT } from 'GlobalConstants';
import { getPermissionUser, getHospital } from 'Api';
import './UserPermissionPage.scss';

const UserPermissionPage = props => {
  const dispatch = useDispatch();

  const paramsTable = useSelector(state =>
    paramsTableSelector(state.searchReducer)
  );
  const { currentParams } = useSelector(state => state.goBackReducer);
  const { listkey } = props;
  const history = useHistory();
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hospitalSelect, setHospitalSelect] = useState();
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    position: ['bottomCenter'],
  });

  const USER_COLUMNS = [
    {
      title: 'Tên tài khoản',
      dataIndex: 'username',
      key: 'username',
      width: '15%',
      align: 'center',
      textWrap: 'word-break',
      render: record => {
        return <Popover content={record}>{record}</Popover>;
      },
    },
    {
      title: 'Họ và tên',
      dataIndex: 'name',
      key: 'name',
      width: '15%',
      align: 'center',
      textWrap: 'word-break',
      render: record => {
        return <Popover content={record}>{record}</Popover>;
      },
    },
    {
      title: 'Bệnh viện',
      dataIndex: 'hospital',
      key: 'hospital',
      width: '15%',
      align: 'center',
      textWrap: 'word-break',
      ellipsis: true,
      render: record => {
        return <Popover content={record?.name}>{record?.name}</Popover>;
      },
    },
    {
      title: 'Nhóm',
      dataIndex: 'group',
      key: 'group',
      width: '15%',
      align: 'center',
      textWrap: 'word-break',
      ellipsis: true,
      render: record => {
        return <Popover content={record?.name}>{record?.name}</Popover>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: '8%',
      render: record => <div>{record ? 'Hoạt động' : 'Khóa'}</div>,
    },
    {
      title: 'Thao tác',
      align: 'center',
      width: '10%',
      render: record => (
        <a
          onClick={() => {
            redirectToPermissionUser(record.id);
          }}
        >
          Xem
        </a>
      ),
    },
  ];

  const FILTER_USER_PERMISSION = [
    {
      type: 'input',
      label: 'Tên tài khoản',
      name: 'username',
      placeholder: 'Nhập tên tài khoản',
    },
    {
      type: 'select',
      label: 'Bệnh viện',
      name: 'hospitalId',
      placeholder: 'Tất cả',
      defaultValue: 'Tất cả',
      options: hospitalSelect,
    },
    {
      type: 'select',
      label: 'Trạng thái',
      name: 'status',
      placeholder: 'Tất cả',
      defaultValue: 0,
      options: [
        { key: 0, name: 'Tất cả' },
        { key: 'true', name: 'Hoạt động' },
        { key: 'false', name: 'Khóa' },
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
      fetchDataTable({
        sortBy: 'username',
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

      username: params.username,
      status: params.status,
      hospitalId: params.hospitalId,
    };
    try {
      const { data } = await getPermissionUser(customParams);
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

  const redirectToPermissionUser = id => {
    dispatch(setCurrentParamsAction(paramsTable));
    history.push(`/admin/permission/edit/${'user'}/${id}`);
  };

  return (
    <>
      <div
        className="Userpermission-warp"
        style={{ boxShadow: '34px 34px 89px #329D9C14' }}
      >
        <div className="Userpermission_title">
          <h2 style={{ fontWeight: 'bold' }}>Phân quyền cá nhân</h2>
          <div
            className="btn-app"
            style={{
              display: listkey.includes(PERMISSION_CREATE) ? 'initial' : 'none',
            }}
          >
            <Button
              loading={false}
              onClick={() => {
                history.push(`/admin/permission/add/${'user'}`);
              }}
            >
              THÊM
            </Button>
          </div>
        </div>
        <SearchOption
          columnFilter={FILTER_USER_PERMISSION}
          fetchDataTable={fetchDataTable}
          lg={8}
          xl={8}
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
          columns={USER_COLUMNS}
          dataSource={dataTable}
          onChange={handleChangeTable}
        />
      </div>
    </>
  );
};

export default UserPermissionPage;
