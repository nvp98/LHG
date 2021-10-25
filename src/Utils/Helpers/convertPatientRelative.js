import { RELATIVELIST } from 'GlobalConstants';
export const convertPatientRelative = relative => {
  switch (relative) {
    case RELATIVELIST.CON:
      return '(Con)';
    case RELATIVELIST.VO:
      return '(Vợ)';
    case RELATIVELIST.CHONG:
      return '(Chồng)';
    case RELATIVELIST.BO:
      return '(Bố)';
    case RELATIVELIST.ME:
      return '(Mẹ)';
    case RELATIVELIST.KHAC:
      return '(Khác)';
    default:
      break;
  }
};
