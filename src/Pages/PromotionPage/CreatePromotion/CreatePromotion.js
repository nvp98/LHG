import {
  Avatar,
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  Spin,
  Tabs,
  Upload,
} from 'antd';
import {
  createPackage,
  downloadAttachmentFile,
  getHospital,
  getPackageDetail,
  updatePackage,
  uploadAttachmentFile,
} from 'Api';
import CustomEditor from 'Components/CustomEditor/CustomEditor';
import { PROMOTION_CREATE, PROMOTION_EDIT } from 'GlobalConstants';
import React, { useEffect, useRef, useState } from 'react';
import { convertBufferBase64, getBinaryString } from 'Utils/Helpers';
import './CreatePromotionPage.scss';

const { TabPane } = Tabs;

const CreatePackagePage = props => {
  /* ------------------------------------------------ */
  /* ------------------ CONSTRUCTOR ----------------- */
  /* ------------------------------------------------ */
  const { history, listkey } = props;

  const btnEl = useRef();
  const [form] = Form.useForm();

  const requiredMessage = 'Vui lòng điền thông tin này!';
  const required = true;
  const [hospitalList, setHospitalList] = useState([]);
  const [hospital, setHospital] = useState();
  const [status, setStatus] = useState(true);
  const [priority, setPriority] = useState(false);
  const [activeTab, setActiveTab] = useState('vi');
  const [isEdit, setIsEdit] = useState(false);
  const [tabItem, setTabItem] = useState([
    {
      tab: 'Tiếng Việt',
      languageId: 'vi',
      title: null,
      content: null,
    },
    {
      tab: 'English',
      languageId: 'en',
      title: null,
      content: null,
    },
  ]);
  const [avatar, setAvatar] = useState({
    file: null,
    src: null,
  });
  const [avatarId, setAvatarId] = useState(null);
  const [isloading, setIsloading] = useState(false);

  /* ------------------------------------------------ */
  /* ------------------ LIFE CYCLE ------------------ */
  /* ------------------------------------------------ */

  useEffect(() => {
    initData();
  }, []);

  /* ---------------------------------------------- */
  /* ------------------ FUNCTION ------------------ */
  /* ---------------------------------------------- */

  const initData = async () => {
    const { data } = await getHospital();
    const { match } = props;

    //get data for select
    const id = match.params.id;
    setHospitalList(data.items);

    //get and set form value package
    if (id) {
      setIsEdit(true);
      await fetchDataPackage(id);
    }
  };

  const fetchDataPackage = async id => {
    setIsloading(true);
    const { data } = await getPackageDetail(id);

    const itemInit = {};
    const packageDetails = tabItem.map(t1 => ({
      ...t1,
      ...data.promotionsDetails.find(t2 => t2.languageId === t1.languageId),
    }));
    data.promotionsDetails.map(item => {
      itemInit['title-' + item.languageId] = item.title;
      itemInit['content-' + item.languageId] = item.content;
    });
    form.setFieldsValue({
      ...itemInit,
      hospitalId: data.hospitalId,
      status: data.active,
      priority: data.priority,
    });
    setTabItem(packageDetails);
    setAvatarId(data.avatar);
    setPriority(data.priority);
    setStatus(data.active);
    setStatus(data.active);
    if (data.avatar) {
      try {
        await getAvatarBy(data.avatar);
      } catch (error) {
        setIsloading(false);
      }
    }
    setIsloading(false);
  };

  const getAvatarBy = async id => {
    const response = await downloadAttachmentFile(id);
    convertBufferBase64(response.data, result => {
      const avatarCopy = { ...avatar };
      avatarCopy['src'] = result;
      setAvatar(avatarCopy);
    });
  };

  const handleAvatarUpload = async () => {
    setIsloading(true);
    if (avatar.file) {
      const formData = new FormData();
      formData.append('files', avatar?.file);
      const { data } = await uploadAttachmentFile(formData);
      const avatarId = data[0].id;
      setAvatarId(avatarId);

      return avatarId;
    }
    setIsloading(false);
    return;
  };

  const handleChangeTitle = (langId, e) => {
    const newTabItem = [...tabItem];
    newTabItem.find(item => item.languageId === langId).title = e.target.value;
    setTabItem(newTabItem);
  };

  const handleChangeContent = (langId, e) => {
    const newTabItem = [...tabItem];
    newTabItem.find(item => item.languageId === langId).content = e;
    setTabItem(newTabItem);
  };

  const onFinish = async value => {
    const [viTab, enTab] = tabItem;
    Object.keys(viTab).forEach(key => {
      if (!viTab[key]) viTab[key] = enTab[key];
      if (!enTab[key]) enTab[key] = viTab[key];
    });

    const body = {
      avatar: await handleAvatarUpload(),
      hospitalId: value.hospitalId,
      active: status,
      priority: priority,
      promotionsDetails: [...tabItem],
    };
    try {
      setIsloading(true);
      //CREATE
      if (!isEdit) {
        const res = await createPackage(body);
        if (res.status === 201 && res.data.success) {
          message.success('Tạo thành công');
          history.push('/admin/promotion');
        }
      }
      //EDIT
      else {
        const res = await updatePackage(props.match.params.id, body);
        if (res.status === 200) {
          message.success('Cập nhật thành công');
          history.push('/admin/promotion');
        }
      }
      setIsloading(false);
    } catch (e) {
      setIsloading(false);
    }
  };

  /* -------------------------------------------- */
  /* ------------------ LAYOUT ------------------ */
  /* -------------------------------------------- */

  return (
    <div className="create-package">
      <Spin spinning={isloading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          hideRequiredMark={true}
        >
          <h2 className="create-package-title">{`${
            isEdit ? 'Chi tiết' : 'Thêm'
          } chương trình khuyến mãi`}</h2>
          <Row>
            <Col xl={12} md={16} sm={14}>
              <Form.Item
                label="Bệnh viện"
                name="hospitalId"
                rules={[{ required: required, message: requiredMessage }]}
                style={{ width: '70%' }}
              >
                <Select
                  optionFilterProp="children"
                  placeholder="Chọn bệnh viện"
                >
                  {hospitalList?.map(item => {
                    return (
                      <Select.Option value={item.id} key={item.id}>
                        {item.name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col xl={8} md={8} sm={8} style={{ zIndex: 100 }}>
              <div className="upload-avatar">
                <div>
                  <Avatar alt="avatar" src={avatar?.src} size={150} />
                </div>
                <div>
                  <Upload
                    name="files"
                    showUploadList={false}
                    beforeUpload={file => {
                      const dotname = file.name.split('.')[
                        file.name.split('.').length - 1
                      ];
                      if (dotname === 'jpg' || dotname === 'png') {
                        getBinaryString(file, result => {
                          setAvatar({
                            file: file,
                            src: 'data:image/png;base64,' + btoa(result),
                          });
                        });
                        return false;
                      } else {
                        message.error('Tệp tin không đúng định dạng png, jpg');
                      }
                    }}
                  >
                    <Button className="btn-upload-avatar">Tải lên</Button>
                  </Upload>
                </div>
              </div>
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{ display: 'flex' }}>
              <Col xl={7} md={7} sm={12}>
                <Form.Item name="status" initialValue={status}>
                  <Checkbox
                    onChange={e => {
                      setStatus(e.target.checked);
                    }}
                    checked={status}
                  >
                    Hoạt động
                  </Checkbox>
                </Form.Item>
              </Col>
              <Col xl={4} md={4} sm={4}>
                <Form.Item name="priority" initialValue={priority}>
                  <Checkbox
                    onChange={e => {
                      setPriority(e.target.checked);
                    }}
                    checked={priority}
                  >
                    Ưu tiên
                  </Checkbox>
                </Form.Item>
              </Col>
            </Col>
          </Row>
          {/* content */}
          <Row>
            <Col xl={15} md={20} sm={20}>
              <Tabs
                defaultActiveKey="1"
                activeKey={activeTab}
                onChange={value => {
                  setActiveTab(value);
                }}
                type="card"
              >
                {tabItem.map(tab => {
                  return (
                    <TabPane tab={tab.tab} key={tab.languageId}>
                      <Form.Item
                        label="Tiêu đề"
                        name={`title-${tab.languageId}`}
                        rules={[
                          // { required: required, message: requiredMessage },
                          ({ getFieldValue }) => {
                            const dependency =
                              tab.languageId === 'vi' ? 'title-en' : 'title-vi';
                            return {
                              validator(_, value) {
                                if (getFieldValue(dependency) || value) {
                                  return Promise.resolve();
                                }
                                return Promise.reject(
                                  new Error(requiredMessage)
                                );
                              },
                            };
                          },
                        ]}
                        dependencies={[
                          tab.languageId === 'vi' ? 'title-en' : 'title-vi',
                        ]}
                      >
                        <Input
                          type="text"
                          placeholder="Nhập tiêu đề"
                          onChange={e => handleChangeTitle(tab.languageId, e)}
                          maxLength={255}
                        />
                      </Form.Item>
                      <Form.Item
                        label="Nội dung"
                        name={`content-${tab.languageId}`}
                        rules={[
                          // { required: required, message: requiredMessage },
                          ({ getFieldValue }) => {
                            const dependency =
                              tab.languageId === 'vi'
                                ? 'content-en'
                                : 'content-vi';
                            return {
                              validator(_, value) {
                                if (getFieldValue(dependency) || value) {
                                  return Promise.resolve();
                                }
                                return Promise.reject(
                                  new Error(requiredMessage)
                                );
                              },
                            };
                          },
                        ]}
                        dependencies={[
                          tab.languageId === 'vi' ? 'content-en' : 'content-vi',
                        ]}
                      >
                        <CustomEditor
                          size="large"
                          onChange={e => handleChangeContent(tab.languageId, e)}
                        />
                      </Form.Item>
                    </TabPane>
                  );
                })}
              </Tabs>
            </Col>
          </Row>
          <Col xl={12} md={24} sm={24}>
            {isEdit ? (
              <Button
                style={{
                  marginRight: 20,
                  display: listkey.includes(PROMOTION_EDIT) ? 'inline' : 'none',
                }}
                htmlType="submit"
              >
                LƯU
              </Button>
            ) : (
              <Button
                style={{
                  marginRight: 20,
                  display: listkey.includes(PROMOTION_CREATE)
                    ? 'inline'
                    : 'none',
                }}
                htmlType="submit"
              >
                TẠO
              </Button>
            )}
            <Button
              style={{ marginRight: 20 }}
              className="btn-white"
              onClick={() => {
                history.push('/admin/promotion');
              }}
            >
              QUAY LẠI
            </Button>
          </Col>
        </Form>
      </Spin>
    </div>
  );
};

export default CreatePackagePage;
