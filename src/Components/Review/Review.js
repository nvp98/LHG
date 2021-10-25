import React from 'react';
import { Row, Col } from 'antd';
import moment from 'moment';
import { DATE_FORMAT } from 'GlobalConstants/dateFormat';
import VoteStar from 'Components/VoteStar/VoteStar';

const Review = ({ comment }) => {
  return (
    <>
      <Row style={{ width: '100%', marginBottom: '1rem' }}>
        Nhận xét & đánh giá:
      </Row>
      <Row style={{ width: '95%' }}>
        <Col>
          <VoteStar vote={comment?.vote} />
        </Col>
        <Col style={{ margin: 'auto 0px auto auto' }}>
          {moment(comment?.createdDate).format(`HH:mm ${DATE_FORMAT}`)}
        </Col>
      </Row>
      <Row
        style={{ width: '95%', marginBottom: '3rem', overflowWrap: 'anywhere' }}
      >
        {comment?.comments}
      </Row>
    </>
  );
};

export default Review;
