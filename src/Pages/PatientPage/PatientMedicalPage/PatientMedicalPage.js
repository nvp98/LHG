import React, { useState, useEffect } from 'react';
import { Button, Modal, Input, message } from 'antd';
import './PatientMedicalPage.scss';
import {
  getHealthRecord,
  postHealthRecord,
  getPatientID,
  getRelativeID,
  postConfirmOTP,
  clearOTP,
  putResetPatientOTP,
  putResetRelativeOTP,
} from 'Api';
import { DATE_FORMAT } from 'GlobalConstants';
import moment from 'moment';
import OtpInput from 'react-otp-input';
const { Search } = Input;

const PatientMedicalPage = props => {
  const { location, match, history } = props;
  const { id } = match.params;
  const { patientId } = location.state;
  const [patientDetail, setPatientDetail] = useState([]);
  const [depentData, setDepentData] = useState([]);
  const [dataRecord, setDataRecord] = useState([]);
  const [phone, setPhone] = useState([]);
  const [code, setCode] = useState([]);
  const [showOTP, setShowOTP] = useState(false);
  const [OTP, setOTP] = useState('');
  const [record, setRecord] = useState(false);
  const [subject, setSubject] = useState();
  const [btnRecord, setBtnRecord] = useState(true);

  useEffect(() => {
    initData();
  }, [setPatientDetail, setDepentData, setDataRecord]);

  const initData = async () => {
    try {
      if (patientId === id) {
        const { data } = await getPatientID(id);
        setPatientDetail(data);
        setPhone(data.phone);
        setCode(data?.code);
        setSubject('patient');
        if (data?.code) {
          const param = {
            patientCode: data?.code,
            phone: data?.phone,
          };
          const dataHe = await getHealthRecord(param);
          setDataRecord(dataHe.data.data);
        } else {
        }
      } else {
        const { data } = await getRelativeID(id);
        setDepentData(data);
        setPhone(data?.phone);
        setCode(data?.code);
        setSubject('relative');
        const param = {
          patientCode: data?.code,
          phone: data?.phone,
        };
        const dataHe = await getHealthRecord(param);
        setDataRecord(dataHe.data.data);
      }
    } catch (error) {
      throw error;
    }
  };
  const backPatientDetails = () => {
    history.push(`/admin/patient/detail/${patientId}`);
  };
  const healthRecord = async () => {
    if (patientId === id) await putResetPatientOTP(id);
    else await putResetRelativeOTP(id);
    const param = {
      phone: phone,
      code: code,
      subject: subject,
      patientId: id,
    };
    const { data } = await postHealthRecord(param);
    if (data) {
      setShowOTP(true);
      setOTP('');
    }
  };
  const cancelRecord = () => {
    setShowOTP(false);
  };
  const verifyRecord = async () => {
    try {
      const param = {
        phone: phone,
        code: code,
        subject: subject,
        otp: OTP,
        patientId: id,
      };
      const { data } = await postConfirmOTP(param);
      if (data) {
        message.success('H??? th???ng li??n k???t h??? s?? y t??? th??nh c??ng.', 3);
        setShowOTP(false);
        setRecord(true);
      } else {
        message.error('M?? OTP kh??ng ????ng. Vui l??ng ki???m tra l???i.', 3);
        setRecord(false);
        setOTP('');
      }
    } catch (error) {
      throw error;
    }
  };
  const onSearch = async value => {
    try {
      const param = {
        patientCode: value,
        phone: phone,
      };
      setCode(value);
      const { data } = await getHealthRecord(param);
      if (data?.data?.sodienthoai === phone) {
        setDataRecord(data.data);
        setBtnRecord(false);
      } else
        message.error(
          'M?? kh??ng ph?? h???p v???i h??? s?? li??n k???t. Vui l??ng ki???m tra l???i.',
          3
        );
    } catch (error) {
      message.error(
        'M?? kh??ng ph?? h???p v???i h??? s?? li??n k???t. Vui l??ng ki???m tra l???i.',
        3
      );
    }
  };
  const resSend = async () => {
    const param = {
      phone: phone,
    };
    const data = await clearOTP(param);
    healthRecord();
  };
  const something = event => {
    if (event.keyCode === 13) {
      verifyRecord();
    }
  };
  return (
    <>
      {showOTP === false ? (
        <>
          {patientId === id ? (
            <>
              <div className="record-wrapper">
                <h2>Li??n k???t h??? s?? y t???</h2>
                <Search
                  placeholder={
                    patientDetail?.code
                      ? patientDetail?.code
                      : 'Nh???p m?? ng?????i b???nh l??u tr??n HIS'
                  }
                  onSearch={onSearch}
                  className="search"
                  enterButton
                  disabled={patientDetail?.code || record ? true : false}
                  defaultValue={code ? code : ''}
                />
                <div className="resume">
                  <div className="left-resume">
                    <h3>Th??ng tin h??? s?? ng?????i b???nh</h3>
                    <div>
                      <p>T??n ng?????i b???nh:</p>
                      <span>
                        {patientDetail?.name ? patientDetail?.name : '-'}
                      </span>
                    </div>
                    <div>
                      <p>Gi???i t??nh:</p>
                      <span>
                        {patientDetail?.gender === '1'
                          ? 'Nam'
                          : patientDetail?.gender === '2'
                          ? 'N???'
                          : '-'}
                      </span>
                    </div>
                    <div>
                      <p>Ng??y sinh:</p>
                      <span>
                        {patientDetail?.dateOfBirth
                          ? patientDetail?.dateOfBirth &&
                            moment(patientDetail?.dateOfBirth).format(
                              DATE_FORMAT
                            )
                          : '-'}
                      </span>
                    </div>
                    <div>
                      <p>S??? ??i???n tho???i:</p>
                      <span>
                        {patientDetail?.phone ? patientDetail?.phone : '-'}
                      </span>
                    </div>
                    <div style={{ display: 'flex' }}>
                      <p>?????a ch???:</p>
                      <div style={{ width: '230px' }}>
                        <span>
                          {patientDetail?.address
                            ? patientDetail?.address
                            : '-'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p>CMND/CCCD/H??? chi???u:</p>
                      <span>
                        {patientDetail?.identity
                          ? patientDetail?.identity
                          : '-'}
                      </span>
                    </div>
                  </div>
                  {patientDetail?.code || record ? (
                    <Button
                      style={{
                        width: '10%',
                        boxShadow: '15px 15px 40px #329D9C36',
                      }}
                      onClick={healthRecord}
                      disabled
                    >
                      ???? li??n k???t
                    </Button>
                  ) : (
                    <Button
                      style={{
                        width: '10%',
                        boxShadow: '15px 15px 40px #329D9C36',
                      }}
                      onClick={healthRecord}
                      disabled={btnRecord}
                    >
                      Li??n k???t
                    </Button>
                  )}
                  <div className="right-resume">
                    <h3>Th??ng tin h??? s?? y t???</h3>
                    <div>
                      <p>T??n ng?????i b???nh:</p>
                      <span>
                        {dataRecord?.tenbenhnhan
                          ? dataRecord?.tenbenhnhan
                          : '-'}
                      </span>
                    </div>
                    <div>
                      <p>Gi???i t??nh:</p>
                      <span>
                        {dataRecord?.gioitinh === 1
                          ? 'Nam'
                          : dataRecord?.gioitinh === 2
                          ? 'N???'
                          : '-'}
                      </span>
                    </div>
                    <div>
                      <p>Ng??y sinh:</p>
                      <span>
                        {dataRecord?.ngaysinh
                          ? dataRecord?.ngaysinh &&
                            moment(dataRecord?.ngaysinh).format(DATE_FORMAT)
                          : '-'}
                      </span>
                    </div>
                    <div>
                      <p>S??? ??i???n tho???i:</p>
                      <span>
                        {dataRecord?.sodienthoai
                          ? dataRecord?.sodienthoai
                          : '-'}
                      </span>
                    </div>
                    <div style={{ display: 'flex' }}>
                      <p>?????a ch???:</p>
                      <div style={{ width: '230px' }}>
                        <span>
                          {dataRecord?.diachi ? dataRecord?.diachi : '-'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p>CMND/CCCD/H??? chi???u:</p>
                      <span>-</span>
                    </div>
                  </div>
                </div>
                <Button
                  className="btn-white"
                  style={{
                    margin: '20px 0px',
                    boxShadow: '34px 34px 89px #329D9C36',
                  }}
                  onClick={backPatientDetails}
                >
                  Quay l???i
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="record-wrapper">
                <h2>Li??n k???t h??? s?? y t???</h2>
                <Search
                  placeholder={
                    depentData?.code
                      ? depentData?.code
                      : 'Nh???p m?? ng?????i ph??? thu???c l??u tr??n HIS'
                  }
                  onSearch={onSearch}
                  className="search"
                  enterButton
                  disabled={depentData?.code || record ? true : false}
                  defaultValue={code ? code : ''}
                />
                <div className="resume">
                  <div className="left-resume">
                    <h3>Th??ng tin h??? s?? ng?????i ph??? thu???c</h3>
                    <div>
                      <p>T??n ng?????i ph??? thu???c:</p>
                      <span>{depentData?.name ? depentData?.name : '-'}</span>
                    </div>
                    <div>
                      <p>Gi???i t??nh:</p>
                      <span>
                        {depentData?.gender === '1'
                          ? 'Nam'
                          : depentData?.gender === '2'
                          ? 'N???'
                          : '-'}
                      </span>
                    </div>
                    <div>
                      <p>Ng??y sinh:</p>
                      <span>
                        {depentData?.dateOfBirth
                          ? depentData?.dateOfBirth &&
                            moment(depentData?.dateOfBirth).format(DATE_FORMAT)
                          : '-'}
                      </span>
                    </div>
                    <div>
                      <p>S??? ??i???n tho???i:</p>
                      <span>{depentData?.phone ? depentData?.phone : '-'}</span>
                    </div>
                    <div style={{ display: 'flex' }}>
                      <p>?????a ch???:</p>
                      <div style={{ width: '230px' }}></div>
                      <span>
                        {depentData?.address ? depentData?.address : '-'}
                      </span>
                    </div>
                    <div>
                      <p>CMND/CCCD/H??? chi???u:</p>
                      <span>
                        {depentData?.identity ? depentData?.identity : '-'}
                      </span>
                    </div>
                  </div>
                  {depentData?.code || record ? (
                    <Button
                      style={{
                        width: '10%',
                        boxShadow: '15px 15px 40px #329D9C36',
                      }}
                      onClick={healthRecord}
                      disabled
                    >
                      ???? li??n k???t
                    </Button>
                  ) : (
                    <Button
                      style={{
                        width: '10%',
                        boxShadow: '15px 15px 40px #329D9C36',
                      }}
                      onClick={healthRecord}
                      disabled={btnRecord}
                    >
                      Li??n k???t
                    </Button>
                  )}

                  <div className="right-resume">
                    <h3>Th??ng tin h??? s?? y t???</h3>
                    <div>
                      <p>T??n ng?????i ph??? thu???c:</p>
                      {dataRecord?.tenbenhnhan ? dataRecord?.tenbenhnhan : '-'}
                    </div>
                    <div>
                      <p>Gi???i t??nh:</p>
                      <span>
                        {dataRecord?.gioitinh === 1
                          ? 'Nam'
                          : dataRecord?.gioitinh === 2
                          ? 'N???'
                          : '-'}
                      </span>
                    </div>
                    <div>
                      <p>Ng??y sinh:</p>
                      <span>
                        {dataRecord?.ngaysinh
                          ? dataRecord?.ngaysinh &&
                            moment(dataRecord?.ngaysinh).format(DATE_FORMAT)
                          : '-'}
                      </span>
                    </div>
                    <div>
                      <p>S??? ??i???n tho???i:</p>
                      <span>
                        {dataRecord?.sodienthoai
                          ? dataRecord?.sodienthoai
                          : '-'}
                      </span>
                    </div>
                    <div style={{ display: 'flex' }}>
                      <p>?????a ch???:</p>
                      <div style={{ width: '230px' }}>
                        <span>
                          {dataRecord?.diachi ? dataRecord?.diachi : '-'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p>CMND/CCCD/H??? chi???u:</p>
                      <span>-</span>
                    </div>
                  </div>
                </div>
                <Button
                  className="btn-white"
                  style={{
                    margin: '20px 0px',
                    boxShadow: '34px 34px 89px #329D9C36',
                  }}
                  onClick={backPatientDetails}
                >
                  Quay l???i
                </Button>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="form">
            <div className="form-otp">
              <h2>X??c th???c s??? ??i???n tho???i</h2>
              <div>
                <div>
                  <p>M?? x??c minh c???a b???n s??? ???????c g???i b???ng tin nh???n ?????n</p>
                  <h3>{`   ${phone}  `}</h3>
                </div>
                <div className="otp" onKeyDown={e => something(e)}>
                  <OtpInput
                    value={OTP}
                    onChange={setOTP}
                    autoFocus
                    OTPLength={1}
                    numInputs={6}
                    isInputNum={true}
                    disabled={false}
                    secure
                    separator={<span>-</span>}
                    inputStyle={{
                      width: '3rem',
                      height: '3rem',
                      margin: '20px 5px',
                      // borderColor: '#56c596',
                      // borderRadius: '10px',
                      fontSize: '1.5rem',
                      borderBottom: '1px solid #56c596',
                      borderTop: 'none',
                      borderRight: 'none',
                      borderLeft: 'none',
                    }}
                    focusStyle={{ outline: 'none' }}
                  />
                </div>
                <div className="otp-btn">
                  Ch??a nh???n ???????c m?? x??c th???c
                  <Button
                    type="link"
                    block
                    onClick={resSend}
                    // disabled={hiddenBtn ? true : false}
                  >
                    G???i l???i
                  </Button>
                </div>
                <div style={{ padding: '20px' }}>
                  <Button onClick={cancelRecord}>B??? qua</Button>
                  <Button
                    onClick={verifyRecord}
                    disabled={OTP?.length === 6 ? false : true}
                  >
                    X??c nh???n
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
export default PatientMedicalPage;
