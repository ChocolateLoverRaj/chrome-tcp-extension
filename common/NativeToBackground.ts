export enum Code { CONNECTED, CONNECT_ERROR, CLOSE, MESSAGE, WROTE, WRITE_ERROR }
export type Message =
  [string, Code.CONNECTED] |
  [string, Code.CONNECT_ERROR, string] |
  [string, Code.CLOSE] |
  [string, Code.MESSAGE, string] |
  [string, Code.WROTE] |
  [string, Code.WRITE_ERROR, string]
