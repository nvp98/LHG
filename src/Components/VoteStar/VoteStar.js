import React from 'react';
import {
  star0,
  star1,
  star2,
  star3,
  star4,
  star5,
  star6,
  star7,
  star8,
  star9,
  star10,
} from '../../Assets/Images';

const VoteStar = props => {
  const { vote, w, h } = props;
  let arr = [0, 0, 0, 0, 0];

  const star = value => {
    switch (value) {
      case 0:
        return star0;
      case 1:
        return star1;
      case 2:
        return star2;
      case 3:
        return star3;
      case 4:
        return star4;
      case 5:
        return star5;
      case 6:
        return star6;
      case 7:
        return star7;
      case 8:
        return star8;
      case 9:
        return star9;
      case 10:
        return star10;
      default:
        break;
    }
  };

  const renderStar = vote => {
    const n = vote.split('.');
    arr.map((item, index) => {
      if (index < +n[0]) return (arr[index] = 10);
      else if (index === +n[0] && +n[1]) return (arr[index] = +n[1]);
    });
    return arr.map((item, index) => {
      return (
        <img
          src={star(item)}
          style={{ width: w ? w : '25px', height: h ? h : '25px' }}
        />
      );
    });
  };

  return <div>{renderStar(String(vote))}</div>;
};

export default VoteStar;
