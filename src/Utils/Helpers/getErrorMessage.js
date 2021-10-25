export const getErrorMessage = (
  error,
  message = 'Đã có lỗi vui lòng kiểm tra lại!'
) => {
  try {
    const result =
      error &&
      error.data &&
      error.data.message &&
      typeof error.data.message === 'string'
        ? error.data.message
        : message;
    return result;
  } catch (e) {
    return message;
  }
};
