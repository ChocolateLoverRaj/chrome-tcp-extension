export enum Code { REQUEST_PERMISSION, CONNECT, DESTROY, WRITE }
export type Message =
  [Code.REQUEST_PERMISSION] |
  [code: Code.CONNECT, connectionId: number, host: string, port: number] |
  [Code.DESTROY, number] |
  [Code.WRITE, number, string]
