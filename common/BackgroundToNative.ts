export enum Code { CONNECT, DESTROY, WRITE }
export type Message =
  [Code.CONNECT, string, string, number] |
  [Code.DESTROY, string] |
  [Code.WRITE, string, string]
