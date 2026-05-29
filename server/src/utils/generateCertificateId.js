const generateCertificateId = (type) => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
  return `GP-${type.toUpperCase()}-${year}-${randomNum}`;
};

const generateApplicationNumber = (type) => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${type.toUpperCase()}-${dateStr}-${randomNum}`;
};

module.exports = {
  generateCertificateId,
  generateApplicationNumber,
};
