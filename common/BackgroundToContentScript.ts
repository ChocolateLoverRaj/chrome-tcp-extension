export enum Code { TRUE, FALSE, CONNECTED, CONNECT_ERROR, CLOSE, WROTE, WRITE_ERROR, DATA }
export type Message =
  [Code.TRUE] |
  [Code.FALSE] |
  [Code.CONNECTED, number] |
  [Code.CONNECT_ERROR, number, string] |
  [Code.CLOSE, number] |
  [Code.WROTE, number] |
  [Code.WRITE_ERROR, number, string] |
  [Code.DATA, number, string]
