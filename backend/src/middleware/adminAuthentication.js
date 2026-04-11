const adminAuthentication = (req, res, next) => {
  const foundedUser = req?.user;
  
  if (foundedUser?.userType !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access Denied. Administrator privileges required.",
    });
  }
  
  next();
};

export default adminAuthentication;
