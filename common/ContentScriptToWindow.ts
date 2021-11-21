export enum Code { TRUE, FALSE, CONNECTED, CONNECT_ERROR, CLOSED, DATA, WROTE, WRITE_ERROR }
export type Message =
  [Code.TRUE] |
  [Code.FALSE] |
  [Code.CONNECTED, number] |
  [Code.CONNECT_ERROR, number, string] |
  [Code.CLOSED, number] |
  [Code.DATA, number, string] |
  [Code.WROTE, number] |
  [Code.WRITE_ERROR, number, string]
