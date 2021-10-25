import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { setParamsTableAction } from 'Redux/Actions';
import { Button, Popover, Input, Form, message } from 'antd';
import { paramsTableSelector } from 'Selectors';
import SearchOption from 'Components/SearchOption/SearchOption';
import CustomTable from 'Components/CustomTable/CustomTable';
import { FILTER_CONTENT } from 'GlobalConstants/columnFilter';
import CustomModal from 'Components/CustomModal/CustomModal';
import { CONTENT_EDIT } from 'GlobalConstants';
import { getContents, putContents } from 'Api';
import './ContentPage.scss';

const ContentPage = props => {
  const { listkey } = props;
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const paramsTable = useSelector(state =>
    paramsTableSelector(state.searchReducer)
  );

  const history = useHistory();
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState();
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    position: ['bottomCenter'],
  });

  const [isShowModal, setIsShowModal] = useState(false);
  const [modal, setModal] = useState({
    content: '',
    onOk: () => {},
  });

  const convertLanguege = languageId => {
    switch (languageId) {
      case 'vi':
        return 'Tiếng Việt';
      case 'en':
        return 'Tiếng Anh';
      default:
        break;
    }
  };
  const CONTENT_COLUMNS = [
    {
      title: 'STT',
      // dataIndex: 'num',
      key: 'num',
      width: '5%',
      align: 'center',
      render: record => {
        return <div>{record.num}</div>;
      },
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      width: '70%',
      // // textWrap: 'word-break',
      align: 'center',
      textWrap: 'word-break',
      ellipsis: true,
      // width: 'auto',
      render: record => {
        return (
          <Popover
            content={
              <div
                style={{
                  // whiteSpace: 'nowrap',
                  overflow: 'auto',
                  // textOverflow: 'ellipsis',
                  overflowWrap: 'break-word',
                  width: '600px',
                  height: '100px',
                  textAlign: 'center',
                }}
              >
                {record}
              </div>
            }
          >
            <div
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {record}
            </div>
          </Popover>
        );
      },
    },
    {
      title: 'Ngôn ngữ',
      dataIndex: 'languageId',
      key: 'languageId',
      width: '15%',
      // textWrap: 'word-break',
      align: 'center',
      render: record => {
        return (
          <Popover content={convertLanguege(record)}>
            {convertLanguege(record)}
          </Popover>
        );
      },
    },
    {
      title: 'Phrase_Key',
      dataIndex: 'key',
      key: 'key',
      width: '20%',
      align: 'center',
    },
    {
      title: 'Thao tác',
      // dataIndex: 'content',
      // key: 'name',
      width: '15%',
      align: 'center',
      render: record => (
        <a
          onClick={() => {
            FuncShowModal(record);
          }}
        >
          Xem
        </a>
      ),
    },
  ];

  const onFinish = async (values, record) => {
    const body = {
      languageId: record.languageId,
      phraseId: record.phraseId,
      key: record.key,
      content: values.content,
    };
    // console.log(body, 'onfinish');

    try {
      setLoading(true);
      const { data } = await putContents(body);
      if (data.success) {
        message.success('Chỉnh sửa nội dung thành công');
        setIsShowModal(false);
        window.location.reload();
        // setReload(true);
        // history.push('admin/content');
        // initData();
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const FuncShowModal = async record => {
    setIsShowModal(true);
    form.setFieldsValue({
      content: record.content,
    });
    let modalContent = { ...modal };
    // modalContent.onOk = () => {
    //   setIsShowModal(false);
    //   onBooking(values);
    // };
    modalContent.title = 'Chi tiết nội dung';
    modalContent.content = (
      <Form
        form={form}
        layout="vertical"
        onFinish={values => onFinish(values, record)}
        hideRequiredMark={true}
        // onFinishFailed={onFinishFailed}
      >
        <Form.Item
          name="content"
          rules={[
            {
              required: true,
              message: 'Vui lòng điền nội dung này.',
            },
          ]}
        >
          <Input.TextArea rows={6}>{record.content}</Input.TextArea>
        </Form.Item>

        <div style={{ marginTop: '1rem', textAlign: 'left' }}>
          <Button
            htmlType="submit"
            style={{
              display: listkey.includes(CONTENT_EDIT) ? 'inline' : 'none',
            }}
          >
            LƯU
          </Button>
          <Button className="btn-white" onClick={() => setIsShowModal(false)}>
            QUAY LẠI
          </Button>
        </div>
      </Form>
    );
    modalContent.footer = <div></div>;
    setModal(modalContent);
  };

  useEffect(() => {
    initData();
    return () => {
      dispatch(setParamsTableAction());
    };
  }, []);

  const initData = async () => {
    try {
      const { data } = await getContents({ languageId: 'vi' });
      let phraseKey = FILTER_CONTENT.find(item => item.name === 'key');
      phraseKey.options = [{ key: 0, name: 'Tất cả' }];
      data.map(item => {
        phraseKey.options.push({
          key: item.key,
          name: item.key,
        });
      });
      fetchDataTable();
    } catch (error) {}
  };
  const handleChangeTable = (pagination, filters, sorter) => {
    // const sortOrder =
    //   sorter.order === 'ascend'
    //     ? 'ASC'
    //     : sorter.order === 'descend'
    //     ? 'DESC'
    //     : undefined;

    fetchDataTable({
      ...paramsTable,
      pageSize: pagination.pageSize,
      page: pagination.current,
      // sortBy: sorter.field,
      // sortType: sortOrder,
    });
  };

  const fetchDataTable = async (params = {}) => {
    console.log(params, 'parmas');
    setLoading(true);
    const { page, pageSize } = pagination;
    const customParams = {
      page: params.page || page,
      limit: params.pageSize || pageSize,
      sortBy: params.sortBy,
      sortType: params.sortType,

      languageId: params.languageId,
      content: params.content,
      key: params.key,
    };

    try {
      const { data } = await getContents(customParams);
      const paper = { ...pagination };
      paper.total = data.totalItems;
      paper.current = customParams.page;

      let arr = [];
      let count = {};
      data.map((item, i) => {
        count['num'] = i + 1 + (customParams.page - 1) * pageSize;
        const obj = Object.assign(item, count);
        return arr.push(obj);
      });

      setDataTable(arr);

      // setDataTable(data);
      setPagination(paper);
      dispatch(setParamsTableAction(customParams));
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="content-wrap">
      <h2>Danh sách nội dung</h2>
      <SearchOption
        columnFilter={FILTER_CONTENT}
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
        columns={CONTENT_COLUMNS}
        dataSource={dataTable}
        onChange={handleChangeTable}
      />

      <CustomModal
        visible={isShowModal}
        onOk={modal.onOk}
        title={modal.title}
        footer={modal.footer}
        type="content-modal"
        onCancel={() => setIsShowModal(false)}
      >
        {modal.content}
      </CustomModal>
    </div>
  );
};

export default ContentPage;
