const generateColor = () => {
  return (
    "#" +
    "0123456789abcdef"
      .split("")
      .map((v, i, a) => {
        return i > 5 ? null : a[Math.floor(Math.random() * 16)];
      })
      .join("")
  );
};

module.exports = generateColor;
