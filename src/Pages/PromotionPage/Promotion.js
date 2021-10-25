import { Button, Popover } from 'antd';
import { getHospital, getPackage } from 'Api';
import CustomTable from 'Components/CustomTable/CustomTable';
import SearchOption from 'Components/SearchOption/SearchOption';
import { TIME_FORMAT, FILTER_PACKAGE, PROMOTION_CREATE } from 'GlobalConstants';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentParamsAction, setParamsTableAction } from 'Redux/Actions';
import { paramsTableSelector } from 'Selectors';
import './Promotion.scss';

const PackagePage = props => {
  /* ------------------------------------------------ */
  /* ------------------ CONSTRUCTOR ----------------- */
  /* ------------------------------------------------ */

  const dispatch = useDispatch();

  const paramsTable = useSelector(state =>
    paramsTableSelector(state.searchReducer)
  );

  const { currentParams } = useSelector(state => state.goBackReducer);

  const { history, listkey } = props;
  const [loading, setLoading] = useState(false);
  const [dataTable, setDataTable] = useState([]);
  const [hospital, setHospital] = useState();
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    position: ['bottomCenter'],
  });
  const sorter = { sortType: 'DESC', sortBy: 'createdAt' };

  const PACKAGE_COLUMNS = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      width: '5%',
      align: 'center',
    },
    {
      title: 'Thời gian tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '10%',
      align: 'center',
      render: record => record && moment(record).format(TIME_FORMAT),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'promotionsDetails',
      key: 'title',
      width: '14%',
      textWrap: 'word-break',
      align: 'center',
      ellipsis: true,
      render: record => {
        let packageDetail = record.find(item => item.languageId === 'vi');
        packageDetail = packageDetail
          ? packageDetail
          : record.find(item => item.languageId === 'en');

        return (
          <Popover content={packageDetail?.title}>
            <div
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: 'auto',
              }}
            >
              {packageDetail?.title}
            </div>
          </Popover>
        );
      },
    },
    {
      title: 'Bệnh viện',
      dataIndex: 'hospitalId',
      key: 'hospitalId',
      width: '10%',
      align: 'center',
      render: record => {
        const hos = hospital.find(item => item.id === record);
        return <Popover content={hos?.name}>{hos?.name}</Popover>;
      },
    },
    {
      title: 'Trạng thái',
      key: 'isActive',
      align: 'center',
      width: '10%',
      render: ({ active }) => <div>{active ? 'Hoạt động' : 'Khóa'}</div>,
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      align: 'center',
      width: '5%',
      render: record => <div>{record ? 'Có' : 'Không'}</div>,
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdBy',
      key: 'createdBy',
      align: 'center',
      width: '10%',
    },
    {
      title: 'Thao tác',
      align: 'center',
      width: '8%',
      render: ({ id }) => <a onClick={() => editPackage(id)}> Xem </a>,
    },
  ];

  /* ------------------------------------------------ */
  /* ------------------ LIFE CYCLE ------------------ */
  /* ------------------------------------------------ */

  useEffect(() => {
    initData();
    return () => {
      dispatch(setParamsTableAction());
    };
  }, []);

  /* ---------------------------------------------- */
  /* ------------------ FUNCTION ------------------ */
  /* ---------------------------------------------- */

  const initData = async () => {
    try {
      setLoading(true);

      const { data } = await getHospital();

      if (data) {
        fetchDataTable(currentParams);
        setHospital(data.items);
        let hospitalFilter = FILTER_PACKAGE.find(
          item => item.name === 'hospitalId'
        );
        hospitalFilter.options = [{ key: 0, name: 'Tất cả' }];
        data.items.map(item => {
          hospitalFilter.options.push({
            key: item.id,
            name: item.name,
            // ...item,
          });
        });
        // FILTER_PACKAGE = [...FILTER_PACKAGE, hospitalFilter];
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
      sortBy: params.sortBy || sorter.sortBy,
      sortType: params.sortType || sorter.sortType,

      title: params.title,
      hospitalId: params.hospitalId,
      active: params.active,
      priority: params.priority === 'true' ? params.priority : undefined,
    };

    try {
      const { data } = await getPackage(customParams);
      const paper = { ...pagination };
      paper.total = data.totalItems;
      paper.current = customParams.page;
      setDataTable(
        data.items.map((item, index) => ({ ...item, stt: index + 1 }))
      );
      setPagination(paper);
      dispatch(setParamsTableAction(customParams));
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const editPackage = id => {
    dispatch(setCurrentParamsAction(paramsTable));
    history.push(`/admin/promotion/edit/${id}`);
  };

  /* -------------------------------------------- */
  /* ------------------ LAYOUT ------------------ */
  /* -------------------------------------------- */

  return (
    <>
      <div className="package_wrap">
        <div className="package">
          <h2 className="packageTitle">Danh sách chương trình khuyến mãi</h2>
          <div
            className="btn-group"
            style={{
              display: listkey.includes(PROMOTION_CREATE) ? 'initial' : 'none',
            }}
          >
            <Button onClick={() => history.push('/admin/promotion/create')}>
              THÊM
            </Button>
          </div>
        </div>
        <SearchOption
          columnFilter={FILTER_PACKAGE}
          fetchDataTable={fetchDataTable}
          lg={8}
          xl={8}
        />
        <CustomTable
          fixed={false}
          rowKey={record => record.id}
          loading={loading}
          pagination={pagination}
          columns={PACKAGE_COLUMNS}
          dataSource={dataTable}
          rowClassName={(record, index) => {
            let className = index % 2 ? 'table-row-light' : 'table-row-dark';
            return className;
          }}
          onChange={handleChangeTable}
          mgt="10px"
        />
      </div>
    </>
  );
};

export default PackagePage;
