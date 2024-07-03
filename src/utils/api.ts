import axios from 'axios'

const BASE_URL = 'http://192.168.2.11:5520'
const HEADERS = {
  Authorization: 'f72f85c317'
}

export const api = axios.create({
  baseURL: BASE_URL,
  headers: HEADERS
})

export function completeUrl(url: string) {
  const split = url.split(':')
  if(split.length === 1) {
    return `${url}:5520`
  }else {
    return url
  }
}
