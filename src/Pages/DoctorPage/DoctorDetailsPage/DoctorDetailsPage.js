import { UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Checkbox, Modal, message } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  getDoctorByID,
  getAllBooking,
  getSpecialist,
  getComment,
  downloadAttachmentFile,
  putComment,
} from 'Api';
import {
  DATE_FORMAT,
  APPOINTMENT_VIEW,
  APPOINTMENT_EDIT,
} from 'GlobalConstants';
import './DoctorDetailsPage.scss';
import CustomTable from 'Components/CustomTable/CustomTable';
import { setParamsTableAction } from 'Redux/Actions';
import { paramsTableSelector } from 'Selectors';
import { useDispatch, useSelector } from 'react-redux';
import { convertStatus, convertColor } from 'Utils/Helpers';
import VoteStar from 'Components/VoteStar/VoteStar';

const DoctorDetailsPage = props => {
  const { history, match, listkey } = props;
  const { id } = match.params;
  const [doctorDetail, setDoctorDetail] = useState();
  const [imageRender, setImageRender] = useState();
  const [specialist, setSpecialist] = useState([]);
  const [isShowModal, setIsShowModal] = useState(false);
  const [voteInfor, setVoteInfo] = useState([]);
  const [moreVote, setMoreVote] = useState(3);
  const [avatarPatient, setAvatarPatient] = useState({});

  const dispatch = useDispatch();
  const paramsTable = useSelector(state =>
    paramsTableSelector(state.searchReducer)
  );
  const [loading, setLoading] = useState(false);
  const [dataTable, setDataTable] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    position: ['bottomCenter'],
  });

  const BOOKING_COLUMNS = [
    {
      title: 'Lịch hẹn',
      key: 'calander',
      width: '15%',
      align: 'center',
      render: record => {
        const { bookingDate } = record;
        return moment(bookingDate).format(`HH:mm ${DATE_FORMAT}`);
      },
    },
    {
      title: 'Tên người bệnh',
      // dataIndex: 'name',
      key: 'name',
      width: '25%',
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
      title: 'Chuyên khoa',
      // dataIndex: 'specialists',
      // key: 'specialists',
      // textWrap: 'word-break',
      // ellipsis: true,
      width: '15%',
      align: 'center',
      render: record => (
        <div>
          {record?.specialistId
            ? specialistChoose(record?.specialistId)
            : 'N/A'}
        </div>
      ),
    },
    {
      title: 'Tình Trạng',
      key: 'status',
      width: '12%',
      align: 'center',
      render: record => (
        <div
          style={{
            color: convertColor(record?.status),
            border: '1px solid',
            borderColor: convertColor(record?.status),
            borderRadius: '6px',
            padding: '3px 6px 3px 6px',
            width: '80px',
            margin: 'auto',
          }}
        >
          {record?.status ? convertStatus(record?.status) : ''}
        </div>
      ),
    },
    {
      title: 'Thao tác',
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

  useEffect(() => {
    initData();
    return () => {
      dispatch(setParamsTableAction());
    };
  }, []);

  const initData = async () => {
    try {
      fetchDataTable();
      const { data } = await getSpecialist();
      setSpecialist(data.items);
      if (id) {
        const { data } = await getDoctorByID(id);
        setDoctorDetail(data);
        renderImage(data.avatar);
        const voteInfor = await getComment({
          doctorId: id,
          sortBy: 'createdDate',
          sortType: 'DESC',
        });
        setVoteInfo(voteInfor.data.items);
      }
      setLoading(false);
    } catch {
      setLoading(false);
      history.push('/admin/doctor');
    }
  };

  const fetchAvatar = async avatarId => {
    if (avatarId) {
      const response = await downloadAttachmentFile(avatarId);
      const arrayBufferView = new Uint8Array(response.data);
      const blob = new Blob([arrayBufferView], { type: 'image/png' });
      const urlCreator = window.URL || window.webkitURL;
      const imageUrl = urlCreator.createObjectURL(blob);
      return imageUrl;
    }
  };

  const renderSpecialist = () => {
    let arr = [];
    arr = doctorDetail.specialists?.sort((a, b) => {
      return a.DoctorSpecialists.isMain - b.DoctorSpecialists.isMain;
    });
    return arr.map((item, i) => {
      return (
        <span key={i}>
          {item.name}
          {arr.length - 1 === i ? '' : '; '}
        </span>
      );
    });
  };

  const renderImage = async data => {
    if (!data) {
      setImageRender(
        <Avatar shape="square" size={200} icon={<UserOutlined />} />
      );
    }
    if (data) {
      setImageRender(
        <Avatar
          shape="square"
          style={{ width: '414px', height: '351px' }}
          size={200}
          src={data}
          icon={<div style={{ height: '200px' }}></div>}
        />
      );
    }
  };
  const specialistChoose = specialistId => {
    let arr = '';
    specialist.map((item, index) => {
      if (item.id === specialistId) {
        arr = item.name;
      }
    });
    return arr;
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

  const fetchDataTable = async (params = {}, cancelToken) => {
    setLoading(true);
    const { page, pageSize } = pagination;
    const customParams = {
      page: params.page || page,
      limit: params.pageSize || pageSize,
      sortBy: params.sortBy || 'bookingDate',
      sortType: params.sortType || 'DESC',

      doctorId: id,
    };
    try {
      const { data } = await getAllBooking(customParams);
      const paper = { ...pagination };
      paper.total = data.totalItems;
      paper.current = customParams.page;

      setDataTable(data.items);
      setPagination(paper);
      dispatch(setParamsTableAction(customParams));
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };
  const onChecked = async (id, e) => {
    const check = e.target.checked;
    try {
      setLoading(true);
      if (check) {
        const { data } = await putComment(id, { status: false });
        data.success && message.success('success');
      } else {
        const { data } = await putComment(id, { status: true });
        data.success && message.success('success');
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const showVote = async () => {
    setIsShowModal(true);
    try {
      let listAvatar = {};
      await Promise.all(
        voteInfor.map(async item => {
          if (item.patient.avatarId) {
            const imageUrl = await fetchAvatar(item.patient.avatarId);
            listAvatar[item.patient.avatarId] = imageUrl;
          }
        })
      );
      setAvatarPatient(listAvatar);
    } catch (error) {
      console.log(error);
    }
  };

  const redirectToAppointmentDetail = id => {
    history.push(`/admin/appointment/edit/${id}`);
  };

  return (
    <>
      {doctorDetail && (
        <div className="doctor-page">
          <div className="doctor-content">
            <h2>Thông tin bác sĩ</h2>
            <div>
              <p>Mã nhân viên:</p> <span>{doctorDetail.staffCode}</span>
            </div>
            <div>
              <p>Tên nhân viên:</p> <span>{doctorDetail.name}</span>
            </div>
            <div>
              <p>Số CCHN:</p> <span>{doctorDetail.code}</span>
            </div>
            <div>
              <p>Chức danh:</p> <span>{doctorDetail.title}</span>
            </div>
            <div>
              <p>Ngày sinh:</p>
              <span> </span>
              <span>
                {doctorDetail?.dateOfBirth &&
                  moment(doctorDetail?.dateOfBirth).format(DATE_FORMAT)}
              </span>
            </div>
            <div>
              <p>Giới tính:</p>
              <span> </span>
              <span>{doctorDetail.gender === '1' ? 'Nam' : 'Nữ'}</span>
            </div>
            <div>
              <p>Quốc tịch:</p> <span>{doctorDetail.country}</span>
            </div>
            <div>
              <p>Ngày vào:</p>
              <span> </span>
              <span>
                {doctorDetail?.startDate &&
                  moment(doctorDetail?.startDate).format(DATE_FORMAT)}
              </span>
            </div>
            <div style={{ display: 'flex' }}>
              <p>Chuyên khoa:</p>
              <div className="specialist">
                <span> </span>
                {renderSpecialist()}
              </div>
            </div>
            <div>
              <p>Chức vụ:</p> <span>{doctorDetail.position}</span>
            </div>
            <div>
              <p>Email:</p> <span>{doctorDetail.email}</span>
            </div>
            <div>
              <p>SĐT:</p> <span>{doctorDetail.phone}</span>
            </div>
          </div>
          <div className="doctor-right">
            <div className="avatar">{imageRender}</div>

            <div className="doctor-name">
              <h2>
                {doctorDetail.name}
                <span> | </span>
                {doctorDetail.isActive === true ? (
                  <>
                    <span style={{ fontSize: '14px' }}> Hoạt động </span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '14px' }}> Khóa</span>
                  </>
                )}
              </h2>
              <p>
                {doctorDetail.yearStartWorking
                  ? moment().year() - doctorDetail.yearStartWorking
                  : ''}
                <span> Năm kinh nghiệm</span>
              </p>
              <VoteStar vote={doctorDetail?.rating} />
              <p>
                <a onClick={showVote}>{`(${
                  doctorDetail?.ratingTotal ? doctorDetail?.ratingTotal : '0'
                } đánh giá/ ${
                  doctorDetail?.bookingTotal ? doctorDetail?.bookingTotal : '0'
                } cuộc hẹn)`}</a>
              </p>
              <p>
                Đăng nhập lần đầu:{' '}
                <span>
                  {doctorDetail.firstLogin
                    ? moment(doctorDetail.firstLogin).format(
                        `HH:mm ${DATE_FORMAT}`
                      )
                    : ''}
                </span>
              </p>

              <p>
                Sử dụng gần nhất:{' '}
                <span>
                  {doctorDetail.lastUsed
                    ? moment(doctorDetail.lastUsed).format(
                        `HH:mm ${DATE_FORMAT}`
                      )
                    : ''}
                </span>
              </p>
            </div>

            <div className="button-calen">
              <Button
                onClick={() => {
                  history.push(`/admin/doctor/schedule/${id}`);
                }}
              >
                Xem lịch làm việc
              </Button>
            </div>
          </div>
          <div className="booking_doctor">
            <h2
              style={{
                backgroundColor: '#61C8CE',
                borderRadius: '15px 15px 0px 0px',
                textAlign: 'center',
                padding: '10px',
                color: '#FFFFFF',
              }}
            >
              DANH SÁCH HẸN KHÁM GẦN ĐÂY
            </h2>
            {/* <SearchOption
              // columnFilter={FILTER_APPOINTMENT}
              fetchDataTable={fetchDataTable}
            /> */}
            <CustomTable
              fixed={false}
              rowKey={record => record.id}
              loading={loading}
              pagination={pagination}
              columns={
                listkey.includes(APPOINTMENT_EDIT)
                  ? BOOKING_COLUMNS
                  : BOOKING_COLUMNS.splice(0, BOOKING_COLUMNS.length - 1)
              }
              dataSource={dataTable}
              rowClassName={(record, index) => {
                let className =
                  index % 2 ? 'table-row-light' : 'table-row-dark';
                return className;
              }}
              onChange={handleChangeTable}
            />
          </div>

          <Modal
            visible={isShowModal}
            title=""
            footer={[]}
            onCancel={() => {
              setIsShowModal(false);
              setMoreVote(3);
            }}
            closable={false}
            style={{
              top: '5%',
              overflow: 'auto',
              maxHeight: '830px',
              borderRadius: '0px',
              paddingBottom: '0px',
              pointerEvents: 'auto',
            }}
            bodyStyle={{ borderRadius: '0px' }}
            className="content"
          >
            {voteInfor.length ? (
              <>
                {' '}
                {voteInfor.slice(0, moreVote).map((item, index) => (
                  <>
                    <div
                      style={{
                        border: '1px solid #2cb9aa',
                        padding: '0.5rem',
                        borderRadius: '21px',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex' }}>
                        <Avatar
                          size={30}
                          src={avatarPatient[item.patient?.avatarId]}
                        />
                        <div
                          style={{ fontWeight: 'bold', marginLeft: '0.5rem' }}
                        >
                          {item.patient.name}
                        </div>
                        <div style={{ margin: 'auto 10px auto auto' }}>
                          {moment(item.createdDate).format(
                            `HH:mm - ${DATE_FORMAT}`
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'initial' }}>
                        <VoteStar vote={item.vote} w="20px" h="20px"></VoteStar>
                        <p>{item.comments}</p>
                        <Checkbox
                          className="tab_modal_checkbox"
                          onChange={e => onChecked(item.id, e)}
                          defaultChecked={item.status ? false : true}
                        >
                          Đánh dấu là nhận xét rác
                        </Checkbox>
                      </div>
                    </div>
                  </>
                ))}
                <p
                  style={{
                    textAlign: 'center',
                    display: voteInfor.length < moreVote ? 'none' : 'block',
                  }}
                >
                  <a
                    onClick={() => {
                      setMoreVote(moreVote + 10);
                    }}
                  >
                    Xem thêm
                  </a>
                </p>
              </>
            ) : (
              'Không có thông tin đánh giá'
            )}
          </Modal>
        </div>
      )}
    </>
  );
};

export default DoctorDetailsPage;
