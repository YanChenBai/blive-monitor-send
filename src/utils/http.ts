import { CapacitorHttp, HttpResponse } from "@capacitor/core";

interface Response<T> extends HttpResponse {
  data: T;
}

const BASE_URL = "http://192.168.3.67:5520";
const HEADERS = {
  authorization: "225c9b3704",
};

export async function httpGet<T = any>(path: string, params = {}) {
  const options = {
    url: BASE_URL + path,
    headers: { ...HEADERS },
    params,
  };

  const response: Response<T> = await CapacitorHttp.get(options);

  return response;
}

export async function httpPost<T = any>(path: string, data = {}) {
  const options = {
    url: BASE_URL + path,
    headers: { ...HEADERS },
    data,
  };

  const response: Response<T> = await CapacitorHttp.post(options);

  return response;
}
