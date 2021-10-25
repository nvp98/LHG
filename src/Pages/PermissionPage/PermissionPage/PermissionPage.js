import React, { useState, useEffect } from 'react';
import {
  Spin,
  Row,
  Col,
  Checkbox,
  Button,
  Input,
  Select,
  Form,
  message,
} from 'antd';
import CustomCheckBox from '../../../Components/CustomCheckBox/CustomCheckBox';
import { PERMISSION_EDIT, PERMISSION_CREATE } from 'GlobalConstants';
import {
  getGroupID,
  getUserID,
  getHospital,
  postUser,
  postGroup,
  getModule,
  putUserID,
  putGroupID,
  getPermissionGroup,
  getPermissionUser,
  getAllUserFromLdap,
} from 'Api';
import './PermissionPage.scss';

const PermissionPage = props => {
  const { history, match, listkey } = props;
  const { name, id } = match.params;
  const [form] = Form.useForm();
  const warningMessage = 'Vui lòng điền thông tin này';
  const warningUser =
    'Tài khoản đã được phân quyền, vui lòng kiểm tra lại thông tin.';
  const warningGroup =
    'Tên nhóm đã được phân quyền, vui lòng kiểm tra lại thông tin.';

  const [permissionDetail, setPermissionDetail] = useState();
  const [hospitalSelect, setHospitalSelect] = useState();
  const [loading, setLoading] = useState(false);

  const [checkActive, setCheckActive] = useState(false);
  const [checkValues, setCheckValues] = useState({});

  const [groupList, setGroupList] = useState();

  const [userList, setUserList] = useState();
  const [groupName, setGroupName] = useState();
  const [disable, setDisable] = useState(false);
  const [disname, setDisname] = useState(false);
  const [itemCheck, setItemCheck] = useState([]);
  const [hospital, setHospital] = useState();

  useEffect(() => {
    initData();
  }, []);
  const initData = async () => {
    try {
      setLoading(true);
      //set defauld checkList
      const module = await getModule({
        sortBy: 'order',
        sortType: 'ASC',
      });

      const itemcheck = module.data.items.map((item, index) => []);
      // setItemCheck(itemcheck);
      //group
      if (name === 'group' && id) {
        const { data } = await getGroupID(id);
        setPermissionDetail(data);
        form.setFieldsValue({
          hospitalId: data.hospitalId,
          nameGroup: data.name,
        });
        // //set defauld checkList
        // const module = await getModule({
        //   sortBy: 'order',
        //   sortType: 'ASC',
        // });

        // const itemcheck = module.data.items.map((item, index) => {
        //   return [];
        // });

        module.data.items.map((item, ins) => {
          return item.functions
            .sort((a, b) => parseFloat(a.order) - parseFloat(b.order))
            .map((i, k) => {
              return data.permissions.map(g => {
                if (g.functionId === i.id) return (itemcheck[ins][k] = true);
              });
            });
        });
        setItemCheck(itemcheck);
        setHospital(data?.hospitalId);
        // setCheckValues();
      }
      //user
      else if (name === 'user' && id) {
        const { data } = await getUserID(id);
        setPermissionDetail(data);
        form.setFieldsValue({
          hospitalId: data?.hospitalId,
          nameUser: data?.username,
          name: data?.name,
          groupId: data?.group ? data?.group.id : 'defaul',
        });
        data?.group ? setDisable(true) : setDisable(false);
        setCheckActive(data?.status);
        //set defauld listGroup
        const grouplist = await getPermissionGroup({
          hospitalId: data?.hospitalId,
        });
        setGroupList(grouplist.data.items);

        //defauld checkList
        // const module = await getModule({
        //   sortBy: 'order',
        //   sortType: 'ASC',
        // });
        // const itemcheck = module.data.items.map(() => []);
        module.data.items.map((item, ins) => {
          return item.functions
            .sort((a, b) => parseFloat(a.order) - parseFloat(b.order))
            .map((i, k) => {
              return data.permissions.map(g => {
                if (g.functionId === i.id) return (itemcheck[ins][k] = true);
              });
            });
        });
        setItemCheck(itemcheck);
        setDisname(true);
      } else {
        setItemCheck(itemcheck);
      }
      //set list userName
      if (name === 'user') {
        if (!id) {
          setCheckActive(true);
        }
        const userlist = await getAllUserFromLdap();
        let arr = [];
        userlist.data.map(item => {
          return arr.push(item.cn);
        });
        setUserList(userlist.data);
      }
      // setItemCheck(itemcheck);

      const { data } = await getHospital();
      setHospitalSelect(data.items);

      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const callbackFunction = childData => {
    setCheckValues(childData);
  };

  const onChangeGroup = async value => {
    if (value !== 'defaul') {
      try {
        setLoading(true);
        const { data } = await getGroupID(value);

        //Defauld checkList
        const module = await getModule({
          sortBy: 'order',
          sortType: 'ASC',
        });
        const itemcheck = module.data.items.map(() => []);
        module.data.items.map((item, ins) => {
          return item.functions
            .sort((a, b) => parseFloat(a.order) - parseFloat(b.order))
            .map((i, k) => {
              return data.permissions.map(g => {
                if (g.functionId === i.id) return (itemcheck[ins][k] = true);
              });
            });
        });
        setItemCheck(itemcheck);

        setDisable(true);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    } else if (value === 'defaul') {
      try {
        const module = await getModule({
          sortBy: 'order',
          sortType: 'ASC',
        });
        if (id) {
          setLoading(true);
          const { data } = await getUserID(id);

          const itemcheck = module.data.items.map(() => []);
          module.data.items.map((item, ins) => {
            return item.functions
              .sort((a, b) => parseFloat(a.order) - parseFloat(b.order))
              .map((i, k) => {
                return data.permissions.map(g => {
                  if (g.functionId === i.id) return (itemcheck[ins][k] = true);
                });
              });
          });
          setItemCheck(itemcheck);
        } else {
          const itemcheck = module.data.items.map(() => []);
          setItemCheck(itemcheck);
        }
        setDisable(false);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    }
  };

  const onChangeHospital = async value => {
    if (name === 'user') {
      form.setFieldsValue({
        groupId: 'defaul',
      });
    }
    try {
      setLoading(true);
      const { data } = await getPermissionGroup({
        hospitalId: value,
        sortBy: 'name',
        sortType: 'ASC',
      });
      setGroupList(data.items);
      let arrName = [];
      data.items.map(items => {
        arrName.push(items.name);
        return arrName;
      });
      setGroupName(arrName);
      setHospital(value);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const onFinish = async values => {
    // onChangeHospital(hospital);
    //edit
    if (id) {
      //User
      if (name === 'user') {
        const body = {
          hospitalId: values.hospitalId,
          username: values.nameUser,
          groupId: values.groupId !== 'defaul' ? values.groupId : null,
          permissions: checkValues,
          status: checkActive,
        };

        try {
          setLoading(true);
          const res = await putUserID(id, body);
          if (res.status === 200) {
            message.success('Cập nhật dữ liệu thành công');
            history.push(`/admin/permission/${name}`);
          }
          setLoading(false);
        } catch (error) {
          message.error('Tạo thất bại');

          setLoading(false);
        }
      }
      //Group
      else if (name === 'group') {
        const body = {
          hospitalId: values.hospitalId,
          name: values.nameGroup,
          permissions: checkValues ? checkValues : undefined,
        };

        try {
          setLoading(true);
          const res = await putGroupID(id, body);
          if (res.status === 200) {
            message.success('Cập nhật dữ liệu thành công');
            history.push(`/admin/permission/${name}`);
          }
          setLoading(false);
        } catch (error) {
          message.error('Tạo thất bại');

          setLoading(false);
        }
      }
    }
    //Add
    else {
      //User
      if (name === 'user') {
        const body = {
          username: values.nameUser.trim(),
          hospitalId: values.hospitalId,
          name: values.name.trim(),
          groupId: values.groupId !== 'defaul' ? values.groupId : null,
          permissions: checkValues,
          status: checkActive,
        };

        try {
          setLoading(true);
          const res = await postUser(body);
          if (res.status === 201) {
            message.success('Tạo thành công');
            history.push(`/admin/permission/${name}`);
          }
          setLoading(false);
        } catch (error) {
          const { data, status } = error;
          if (status === 400 && data.message === 'username must be unique') {
            message.error(warningUser);
          } else {
            message.error('Tạo thất bại');
          }
          setLoading(false);
        }
      }
      //Group
      else if (name === 'group') {
        const body = {
          hospitalId: values.hospitalId,
          name: values.nameGroup.trim(),
          permissions: checkValues ? checkValues : undefined,
        };
        try {
          setLoading(true);
          const res = await postGroup(body);
          if (res.status === 201) {
            message.success('Tạo thành công');
            history.push(`/admin/permission/${name}`);
          }
          setLoading(false);
        } catch (error) {
          const { data, status } = error;
          if (status === 400 && data.message === 'name must be unique') {
            message.error(warningGroup);
          } else {
            message.error('Tạo thất bại');
          }
          setLoading(false);
        }
      }
    }
  };
  const changeTitle = title => {
    switch (title) {
      case 'user':
        return 'cá nhân';
      case 'group':
        return 'nhóm';
      default:
        break;
    }
  };
  const onChangeUserName = (value, key) => {
    form.setFieldsValue({
      name: key.key,
    });
  };

  return (
    <>
      <Spin spinning={loading}>
        <Form
          form={form}
          hideRequiredMark={true}
          onFinish={onFinish}
          // onFinishFailed={onFinishFailed}
        >
          {id ? (
            <h2 style={{ fontWeight: 'bold' }}>
              {`Chi tiết phân quyền ${changeTitle(name)}`}{' '}
            </h2>
          ) : (
            <h2 style={{ fontWeight: 'bold' }}>{`Thêm phân quyền ${changeTitle(
              name
            )}`}</h2>
          )}
          {/* group */}
          {name === 'group' && (
            <Row className="row">
              <Col xl={6} md={6} sm={13} style={{ marginRight: '3rem' }}>
                <Form.Item
                  label="Tên nhóm"
                  name="nameGroup"
                  rules={[
                    {
                      required: true,
                      message: warningMessage,
                    },
                    // {
                    //   validator: (_, value) => {
                    //     if (id) {
                    //       if (permissionDetail?.name !== value) {
                    //         if (groupName.includes(value))
                    //           return Promise.reject(warningGroup);
                    //         else return Promise.resolve();
                    //       } else if (
                    //         permissionDetail?.hospitalId !== hospital
                    //       ) {
                    //         if (groupName.includes(value))
                    //           return Promise.reject(warningGroup);
                    //         else return Promise.resolve();
                    //       } else return Promise.resolve();
                    //     } else {
                    //       if (groupName) {
                    //         return !groupName.includes(value)
                    //           ? Promise.resolve()
                    //           : Promise.reject(warningGroup);
                    //       } else {
                    //         return Promise.resolve();
                    //       }
                    //     }
                    //   },
                    // },
                  ]}
                >
                  <Input placeholder="Nhập tên nhóm" maxLength={255}></Input>
                </Form.Item>
              </Col>
              <Col xl={6} md={6} sm={13} style={{ marginRight: '3rem' }}>
                <Form.Item
                  label="Bệnh viện"
                  name="hospitalId"
                  rules={[
                    {
                      required: true,
                      message: warningMessage,
                    },
                  ]}
                  // initialValue="Chọn bệnh viện"
                >
                  <Select
                    placeholder="Chọn bệnh viện"
                    onChange={onChangeHospital}
                  >
                    {hospitalSelect?.map((option, index) => {
                      return (
                        <Select.Option value={option.id} key={option.id}>
                          {option.name}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}
          {/* user */}
          {name === 'user' && (
            <Row className="row">
              <Col xl={6} md={6} sm={13}>
                <Form.Item
                  label="Tên tài khoản"
                  name="nameUser"
                  rules={[
                    {
                      required: true,
                      message: warningMessage,
                    },
                    // {
                    //   validator: (_, value) => {
                    //     if (id) {
                    //       if (permissionDetail.username !== value) {
                    //         return !userList.includes(value)
                    //           ? Promise.resolve()
                    //           : Promise.reject(warningUser);
                    //       } else {
                    //         return Promise.resolve();
                    //       }
                    //     } else {
                    //       if (groupName) {
                    //         return !userList.includes(value)
                    //           ? Promise.resolve()
                    //           : Promise.reject(warningUser);
                    //       } else return Promise.resolve();
                    //     }
                    //   },
                    // },
                  ]}
                >
                  {/* <Input
                    placeholder="Nhập tên tài khoản"
                    disabled={disname}
                    maxLength={255}
                  ></Input> */}
                  <Select
                    optionFilterProp="children"
                    showSearch
                    maxLength={9}
                    disabled={id ? true : false}
                    onChange={onChangeUserName}
                    allowClear
                  >
                    {userList?.map(item => (
                      <Select.Option key={item.fullName} value={item.cn}>
                        {item.cn}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xl={6} md={6} sm={13}>
                <Form.Item
                  label="Họ và tên"
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: warningMessage,
                    },
                  ]}
                >
                  <Input
                    placeholder="Họ và tên"
                    disabled={true}
                    maxLength={255}
                  ></Input>
                </Form.Item>
              </Col>
              <Col xl={6} md={6} sm={13}>
                <Form.Item
                  label="Bệnh viện"
                  name="hospitalId"
                  rules={[
                    {
                      required: true,
                      message: warningMessage,
                    },
                  ]}
                  // initialValue="Chọn bệnh viện"
                >
                  <Select
                    onChange={onChangeHospital}
                    placeholder="Chọn bệnh viện"
                  >
                    {hospitalSelect?.map((option, index) => {
                      return (
                        <Select.Option value={option.id} key={option.id}>
                          {option.name}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
              <Col xl={6} md={6} sm={13}>
                <Form.Item label="Nhóm" name="groupId" initialValue="defaul">
                  <Select onChange={onChangeGroup}>
                    <Select.Option value="defaul">Chọn nhóm</Select.Option>
                    {groupList?.map((option, index) => {
                      return (
                        <Select.Option value={option.id} key={option.id}>
                          {option.name}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}
          <Form.Item name="isActive" initialValue={checkActive}>
            {name === 'user' && (
              <Checkbox
                className="checkBox"
                style={{
                  color: '#2cb9aa',
                  fontWeight: 'bold',
                }}
                checked={checkActive}
                onChange={e => {
                  setCheckActive(e.target.checked);
                }}
              >
                Hoạt động
              </Checkbox>
            )}
          </Form.Item>
          <h3 style={{ fontWeight: 'bold' }}>
            Tính năng
            {name === 'user' && (
              <span
                style={{
                  fontWeight: 'initial',
                  fontStyle: 'italic',
                  marginLeft: '20px',
                }}
              >
                ** Chỉ được phép phân quyền tính năng nếu user không thuộc về
                một nhóm nào
              </span>
            )}
          </h3>
          {/* Row Group checkBox  */}
          <Row style={{ marginTop: '2rem' }}>
            <CustomCheckBox
              // checkboxFilter={CHECKBOX_FILTER}
              name={name}
              id={id}
              check={itemCheck}
              parentCallback={callbackFunction}
              disable={disable}
            />
          </Row>
          {/* End Row Group checkBox  */}
          {/* Row btn */}
          <Row>
            <Col span={24}>
              {id ? (
                <>
                  <Button
                    style={{
                      marginRight: 20,
                      display: listkey.includes(PERMISSION_EDIT)
                        ? 'initial'
                        : 'none',
                    }}
                    htmlType="submit"
                  >
                    LƯU
                  </Button>
                  <Button
                    className="btn-white"
                    onClick={() => {
                      window.history.back();
                    }}
                  >
                    QUAY LẠI
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    style={{
                      marginRight: 20,
                      display: listkey.includes(PERMISSION_CREATE)
                        ? 'initial'
                        : 'none',
                    }}
                    htmlType="submit"
                  >
                    TẠO
                  </Button>
                  <Button
                    className="btn-white"
                    onClick={() => {
                      window.history.back();
                    }}
                  >
                    QUAY LẠI
                  </Button>
                </>
              )}
            </Col>
          </Row>
          {/* End Row btn */}
        </Form>
      </Spin>
    </>
  );
};

export default PermissionPage;
