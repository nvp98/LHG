export const convertUsernameToFullname = username => {
  for (let user of users) {
    if (`${user.username} - Quản trị` === username) {
      return user.name;
    }
  }
  return username;
};

const users = [
  {
    username: 'ga115_cntt_phongnv',
    name: 'Phong Nguyễn',
    fullname: 'Nguyễn Vĩnh Phong'
  },
  {
    username: 'ga115_cntt_huydn',
    name: 'Huy Dương',
    fullname: 'Dương Ngọc Huy'
  },
  {
    username: 'ga115_cntt_lamnv',
    name: 'Lâm Nguyễn',
    fullname: 'Nguyễn Văn Lâm'
  },
  {
    username: 'ga115_cntt_lytt',
    name: 'Ly Phạm',
    fullname: 'Phạm Thị Trúc Ly'
  },
  {
    username: 'ga115_cntt_maipv',
    name: 'Mai Phan',
    fullname: 'Phan Văn Mai'
  },
  {
    username: 'ga115_cntt_binhht',
    name: 'Bình Huỳnh',
    fullname: 'Huỳnh Thanh Bình'
  },
  {
    username: 'ga115_kk_lamntk',
    name: 'Lam Nguyễn',
    fullname: 'Nguyễn Thị Kiều Lam'
  },
  {
    username: 'ga115_kk_huyhdq',
    name: 'Huy Huỳnh',
    fullname: 'Huỳnh Đặng Quang Huy'
  },
  {
    username: 'ga115_kk_quiltt',
    name: 'Quí Lê',
    fullname: 'Lê Thị Thanh Quí'
  },
  {
    username: 'ga115_kk_maintx',
    name: 'Mai Nguyễn',
    fullname: 'Nguyễn Thị Xuân Mai'
  },
  {
    username: 'ga115_kk_uyenptn',
    name: 'Uyên Phạm',
    fullname: 'Phạm Thị Nhã Uyên'
  },
  {
    username: 'ga115_tttt_nguyetnguyen',
    name: 'Nguyệt Nguyễn',
    fullname: 'Nguyễn Thị Ánh Nguyệt'
  },
  {
    username: 'ga115_tttt_hanguyen',
    name: 'Hạ Nguyễn',
    fullname: 'Nguyễn Huỳnh Thanh Hạ'
  },
  {
    username: 'ga115_tttt_andoan',
    name: 'An Đoàn',
    fullname: 'Đoàn Trường An'
  },
];
