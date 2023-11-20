export const generateRandomString = (length: number) => {
  const strings = "abcdefghiklmnopqrstuvwxyz0123456789~@#$%^&():><?/";
  let result = "";
  while (length > 0) {
    const randomIndex = Math.floor(Math.random() * strings.length);
    result += strings[randomIndex];
    length -= 1;
  }
  return result;
};
