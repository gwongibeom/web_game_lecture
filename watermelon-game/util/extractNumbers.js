export const extractNumbers = (str) => {
  return str.match(/\d+/g).join('')
}
