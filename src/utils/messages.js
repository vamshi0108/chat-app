const generateMessage = (text, userName) => {
  return { text, userName, createdAt: new Date() };
};

module.exports = { generateMessage };
