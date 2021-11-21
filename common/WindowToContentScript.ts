export enum Code { REQUEST_PERMISSION, CONNECT, DESTROY, WRITE }
export type Message =
  [Code.REQUEST_PERMISSION] |
  [Code.CONNECT, string, number] |
  [Code.DESTROY, number] |
  [Code.WRITE, number, string]
