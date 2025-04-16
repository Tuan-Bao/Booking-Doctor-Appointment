const validateDate = (req, res, next) => {
  const { appointment_datetime } = req.body;

  // Kiểm tra ngày có tồn tại không
  const date = new Date(appointment_datetime);

  // Kiểm tra xem ngày có hợp lệ hay không (sử dụng giá trị ngày hợp lệ của JavaScript)
  if (isNaN(date.getTime())) {
    return res.status(400).json({
      message: "Invalid date format. Please use YYYY-MM-DDTHH:mm:ss.",
    });
  }

  // Nếu ngày hợp lệ, tiếp tục
  next();
};

export default validateDate;
