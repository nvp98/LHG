import moment from 'moment';
import { DATE_FORMAT } from './dateFormat';
export const FILTER_DOCTOR = [
  {
    type: 'input',
    label: 'Mã nhân viên',
    name: 'staffCode',
    placeholder: '',
  },
  {
    type: 'input',
    label: 'Tên nhân viên',
    name: 'name',
    placeholder: '',
  },
  {
    type: 'select',
    label: 'Chuyên khoa',
    name: 'specialists',
    placeholder: '',
    mode: 'multiple',
    optionFilterProp: 'children',
    options: [],
  },
  {
    type: 'select',
    label: 'Tình trạng',
    name: 'status',
    placeholder: 'Chọn lựa',
    defaultValue: 0,
    options: [
      { key: 0, name: 'Tất cả' },
      { key: 'active', name: 'Hoạt động' },
      { key: 'inactive', name: 'Khóa' },
    ],
  },
];
export const FILTER_TIMESLOT = [
  // {
  //   type: 'datePicker',
  //   label: 'Tháng cần tìm',
  //   name: 'day',
  //   placeholder: '',
  //   picker: 'month',
  //   defaultValue: moment(),
  //   format: 'MM/YYYY',
  //   allowClear: false,
  // },
  {
    label: 'Thời gian',
    type: 'rangePicker',
    name: ['startDateTime', 'endDateTime'],
    format: DATE_FORMAT,
    placeholder: ['Từ ngày', 'Đến ngày'],
    defaultValue: [moment().startOf('day'), moment().endOf('day')],
  },
  {
    type: 'select',
    label: 'Chuyên khoa',
    name: 'specialists',
    placeholder: '',
    defaultValue: 0,
    options: [{ key: 0, name: 'Tất cả' }],
    allowClear: true,
  },
  {
    type: 'select',
    label: 'Trạng thái',
    name: 'isActive',
    placeholder: 'Tất cả',
    defaultValue: 0,
    options: [
      { key: 0, name: 'Tất cả' },
      { key: 'false', name: 'Khóa' },
      { key: 'true', name: 'Hoạt động' },
    ],
  },
];
export const FILTER_PATIENT = [
  {
    type: 'input',
    label: 'Tên người bệnh',
    name: 'name',
    placeholder: '',
  },
  {
    type: 'inputNumber',
    label: 'Số điện thoại',
    name: 'phone',
    placeholder: '',
  },
  {
    type: 'select',
    label: 'Trạng thái',
    name: 'isActive',
    placeholder: 'Tất cả',
    defaultValue: 0,
    options: [
      { key: 0, name: 'Tất cả' },
      { key: 'true', name: 'Hoạt động' },
      { key: 'false', name: 'Khóa' },
    ],
  },
  {
    type: 'input',
    label: 'Tìm kiếm HSYT',
    name: 'code',
  },
  {
    label: 'Thời gian tạo',
    type: 'rangePicker',
    name: ['from', 'to'],
    format: DATE_FORMAT,
    placeholder: ['Từ ngày', 'Đến ngày'],
  },
  {
    type: 'select',
    label: 'Hồ sơ y tế',
    name: 'isConnect',
    placeholder: 'Tất cả',
    defaultValue: 0,
    options: [
      { key: 0, name: 'Tất cả' },
      { key: 'true', name: 'Đã liên kết' },
      { key: 'false', name: 'Chưa liên kết' },
    ],
  },
];
export const FILTER_APPOINTMENT = [
  {
    type: 'input',
    label: 'Mã đặt hẹn',
    name: 'code',
    placeholder: '',
  },
  {
    type: 'input',
    label: 'Tên người bệnh',
    name: 'name',
    placeholder: '',
  },
  {
    type: 'inputNumber',
    label: 'Số điện thoại',
    name: 'phone',
  },
  {
    type: 'select',
    label: 'Trạng thái',
    name: 'status',
    placeholder: 'Tất cả',
    defaultValue: 0,
    options: [
      { key: 0, name: 'Tất cả' },
      { key: 'waiting', name: 'Đang chờ' },
      { key: 'received', name: 'Tiếp nhận' },
      { key: 'cancelled', name: 'Đã hủy' },
      { key: 'done', name: 'Đã xong' },
      { key: 'late', name: 'Quá hạn' },
    ],
  },
  // {
  //   type: 'datePicker',
  //   label: 'Từ ngày',
  //   name: 'fromDate',
  //   defaultValue: moment(),
  //   format: 'DD/MM/YYYY',
  //   allowClear: false,
  // },
  // {
  //   type: 'datePicker',
  //   label: 'Đến ngày',
  //   name: 'toDate',
  //   defaultValue: moment(),
  //   format: 'DD/MM/YYYY',
  //   allowClear: false,
  // },
  {
    label: 'Thời gian',
    type: 'rangePicker',
    name: ['from', 'to'],
    format: DATE_FORMAT,
    placeholder: ['Từ ngày', 'Đến ngày'],
    defaultValue: [moment().startOf('day'), moment().endOf('day')],
  },
  {
    type: 'select',
    label: 'Lịch hẹn',
    name: 'hasTimeslot',
    placeholder: 'Tất cả',
    defaultValue: 0,
    options: [
      { key: 0, name: 'Tất cả' },
      { key: 'true', name: 'Có khung giờ' },
      { key: 'false', name: 'Không có khung giờ' },
    ],
  },
];

export const FILTER_PACKAGE = [
  {
    type: 'input',
    label: 'Tiêu đề',
    name: 'title',
    placeholder: 'Nhập tên chương trình khuyến mãi',
  },
  {
    type: 'select',
    label: 'Bệnh viện',
    name: 'hospitalId',
    placeholder: '',
    defaultValue: 0,
    options: [{ key: 0, name: 'Tất cả' }],
  },
  {
    type: 'select',
    label: 'Trạng thái',
    name: 'active',
    placeholder: 'Chọn lựa',
    defaultValue: 0,
    options: [
      { key: 0, name: 'Tất cả' },
      { key: 'true', name: 'Hoạt động' },
      { key: 'false', name: 'Khóa' },
    ],
  },
  {
    type: 'checkbox',
    label: 'Ưu tiên',
    name: 'priority',
    defaultValue: false,
  },
];
export const FILTER_CONTENT = [
  {
    type: 'input',
    label: 'Nội dung',
    name: 'content',
    placeholder: 'Nhập nội dung',
  },
  {
    type: 'select',
    label: 'Ngôn ngữ',
    name: 'languageId',
    placeholder: 'Chọn ngôn ngữ',
    defaultValue: 0,
    options: [
      { key: 0, name: 'Tất cả' },
      { key: 'vi', name: 'Tiếng Việt' },
      { key: 'en', name: 'Tiếng Anh' },
    ],
  },
  {
    type: 'select',
    label: 'Phrase_Key',
    name: 'key',
    showSearch: 'showSearch',
    placeholder: '',
    defaultValue: 0,
    options: [{ key: 0, name: 'Tất cả' }],
  },
];
