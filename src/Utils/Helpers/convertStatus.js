import { CANCEL, DONE, RECEIVED, EXPIRE, WAITING } from 'GlobalConstants';

export const convertStatus = status => {
  switch (status) {
    case WAITING:
      return 'Đang chờ';
    case RECEIVED:
      return 'Tiếp nhận';
    case DONE:
      return 'Đã xong';
    case CANCEL:
      return 'Đã hủy';
    case EXPIRE:
      return 'Quá hạn';
    default:
      break;
  }
};

export const convertColor = status => {
  switch (status) {
    case WAITING:
      return '#205072';
    case RECEIVED:
      return '#00D4C0';
    case DONE:
      return '#00D4C0';
    case CANCEL:
      return '#FF0000';
    case EXPIRE:
      return '#FF0000';
    default:
      break;
  }
};

export const convertBufferBase64 = (data, cb) => {
  const arrayBufferView = new Uint8Array(data);
  const blob = new Blob([arrayBufferView], { type: 'image/png' });
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onloadend = function () {
    cb(reader.result);
  };
  reader.onerror = function (error) {
    console.log('Error: ', error);
  };
};

export const getBase64 = (file, cb) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    cb(reader.result);
  };
  reader.onerror = error => {
    console.log('Error: ', error);
  };

  return false;
};

export const getBinaryString = (file, cb) => {
  const reader = new FileReader();
  reader.onload = () => {
    cb(reader.result);
  };
  reader.onerror = error => {
    console.log('Error: ', error);
  };
  reader.readAsBinaryString(file);

  return false;
};
