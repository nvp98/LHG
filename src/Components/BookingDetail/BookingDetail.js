import { Col, Row } from 'antd';
import BookingStatus from 'Components/BookingStatus/BookingStatus';
import { CANCEL, DATE_FORMAT } from 'GlobalConstants';
import moment from 'moment';
import React from 'react';

const BookingDetail = ({ bookDetail, hospital }) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <Row>
        <Col xl={6} md={6} sm={13} style={{ display: 'flex' }}>
          <p style={{ width: '100px' }}> Mã hẹn khám:</p>
          <span style={{ fontWeight: 600, paddingLeft: '1rem' }}>
            {bookDetail?.code}
          </span>
        </Col>

        <Col xl={6} md={6} sm={13} style={{ display: 'flex' }}>
          <p style={{ width: '100px' }}>Bệnh viện:</p>
          <span style={{ fontWeight: 600, paddingLeft: '1rem' }}>
            {hospital?.name}
          </span>
        </Col>

        <Col span={8}>
          <BookingStatus status={bookDetail?.status} />
        </Col>
      </Row>
      <Row>
        <Col xl={6} md={6} sm={13} style={{ display: 'flex' }}>
          <p style={{ width: '100px' }}>Người đặt hẹn:</p>
          <span style={{ fontWeight: 600, paddingLeft: '1rem' }}>
            {bookDetail?.createdBy}
          </span>
        </Col>
        <Col xl={6} md={6} sm={13} style={{ display: 'flex' }}>
          <p style={{ width: '100px' }}>Ngày đặt hẹn:</p>
          <span style={{ fontWeight: 600, paddingLeft: '1rem' }}>
            {moment(bookDetail?.createdDate).format(`HH:mm ${DATE_FORMAT}`)}
          </span>
        </Col>
      </Row>
      {bookDetail?.status === CANCEL && (
        <>
          <Row>
            <Col xl={6} md={6} sm={13} style={{ display: 'flex' }}>
              <p style={{ width: '100px' }}>Người hủy hẹn:</p>
              <span style={{ fontWeight: 600, paddingLeft: '1rem' }}>
                {bookDetail?.cancelledBy}
              </span>
            </Col>
            <Col xl={6} md={6} sm={13} style={{ display: 'flex' }}>
              <p style={{ width: '100px' }}>Ngày hủy hẹn:</p>
              <span style={{ fontWeight: 600, paddingLeft: '1rem' }}>
                {moment(bookDetail?.cancelledDate).format(
                  `HH:mm ${DATE_FORMAT}`
                )}
              </span>
            </Col>
          </Row>
          <Row>
            <Col>
              <p style={{ width: '100px' }}>Lý do hủy hẹn:</p>
              <span style={{ fontWeight: 600, paddingLeft: '1rem' }}>
                {bookDetail?.cancelledNote}
              </span>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default BookingDetail;
