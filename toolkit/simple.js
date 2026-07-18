// Simple utility functions

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const getRandomElement = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)]
}

export const sleep = (ms) => new Promise(r => setTimeout(r, ms))

export const chunk = (array, size) => {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}
