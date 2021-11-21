import {
  Code as CodeFromContentScript,
  Message as MessageFromContentScript
} from '../common/ContentScriptToBackground'
import {
  Code as CodeToContentScript,
  Message as MessageToContentScript
} from '../common/BackgroundToContentScript'
import { Code as CodeToPopup } from '../common/BackgroundToPopup'
import { Code as CodeFromPopup } from '../common/PopupToBackground'
import {
  Code as CodeToNative,
  Message as MessageToNative
} from '../common/BackgroundToNative'
import {
  Code as CodeFromNative,
  Message as MessageFromNative
} from '../common/NativeToBackground'

// https://developer.chrome.com/docs/extensions/reference/tabs/#get-the-current-tab
async function getCurrentTab (): Promise<chrome.tabs.Tab> {
  const queryOptions = { active: true }
  const [tab] = await chrome.tabs.query(queryOptions)
  return tab
}

// Key: tabId
// Value:
// {
//   port,
//   status:
//      0: None
//      1: Requesting
//      2: Allowed
//      3: Denied
// }

let _nativePort: chrome.runtime.Port | undefined
function getNativePort (): chrome.runtime.Port {
  return _nativePort ?? (_nativePort = chrome.runtime.connectNative('com.chocolateloverraj.tcp'))
}

enum TabStatus { INITIAL, REQUESTING, GRANTED, DENIED }
interface Tab {
  port: chrome.runtime.Port
  status: TabStatus
  connections: number
}
const tabs = new Map<number, Tab>()
let popupPort: chrome.runtime.Port

chrome.webNavigation.onCompleted.addListener(({ tabId }) => {
  const tabPort = chrome.tabs.connect(tabId)
  const tab: Tab = { port: tabPort, status: TabStatus.INITIAL, connections: 0 }
  tabs.set(tabId, tab)
  tabPort.onMessage.addListener(([code, ...data]: MessageFromContentScript) => {
    if (code === CodeFromContentScript.REQUEST_PERMISSION) {
      if (tab.status === TabStatus.INITIAL) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        chrome.action.setBadgeText({ tabId, text: '!' })
        // If the popup is open, post message
        // If it isn't, post the message when it is opened
        popupPort?.postMessage(CodeToPopup.REQUEST_PERMISSION)
        tab.status = TabStatus.REQUESTING
      }
    } else if (code === CodeFromContentScript.CONNECT) {
      const [connectionId, host, port] = data as [number, string, number]
      const nativePort = getNativePort()
      const id = getId(tabId, connectionId)
      const listener = ([currentId, code, ...data]: MessageFromNative): void => {
        if (currentId !== id) return
        if (code === CodeFromNative.CONNECTED) {
          console.log('Connected')
          const message: MessageToContentScript = [CodeToContentScript.CONNECTED, connectionId]
          tabPort.postMessage(message)
        } else if (code === CodeFromNative.CONNECT_ERROR) {
          const [error] = data as [any]
          console.error('Error connecting', error)
          tab.connections--
          checkDisconnectNative()
          const message: MessageToContentScript =
            [CodeToContentScript.CONNECT_ERROR, connectionId, error]
          tabPort.postMessage(message)
          nativePort.onMessage.removeListener(listener)
          tabPort.onDisconnect.removeListener(disconnectListener)
        } else if (code === CodeFromNative.CLOSE) {
          console.log('Connection closed')
          tab.connections--
          checkDisconnectNative()
          const message: MessageToContentScript = [CodeToContentScript.CLOSE, connectionId]
          tabPort.postMessage(message)
          nativePort.onMessage.removeListener(listener)
          tabPort.onDisconnect.removeListener(disconnectListener)
        } else if (code === CodeFromNative.WROTE) {
          const message: MessageToContentScript = [CodeToContentScript.WROTE, connectionId]
          tabPort.postMessage(message)
        } else if (code === CodeFromNative.WRITE_ERROR) {
          const [err] = data as [string]
          const message: MessageToContentScript =
            [CodeToContentScript.WRITE_ERROR, connectionId, err]
          tabPort.postMessage(message)
        } else if (code === CodeFromNative.MESSAGE) {
          const [base64Data] = data as [string]
          const message: MessageToContentScript =
            [CodeToContentScript.DATA, connectionId, base64Data]
          tabPort.postMessage(message)
        }
      }
      nativePort.onMessage.addListener(listener)
      const message: MessageToNative = [CodeToNative.CONNECT, id, host, port]
      nativePort.postMessage(message)
      tab.connections++
      const disconnectListener = (): void => {
        tabPort.onDisconnect.removeListener(disconnectListener)
        ;(_nativePort as chrome.runtime.Port).postMessage([1, id])
      }
      tabPort.onDisconnect.addListener(disconnectListener)
    } else if (code === CodeFromContentScript.DESTROY) {
      const [connectionId] = data as [number]
      const id = getId(tabId, connectionId)
      const message: MessageToNative = [CodeToNative.DESTROY, id]
      ;(_nativePort as chrome.runtime.Port).postMessage(message)
    } else if (code === CodeFromContentScript.WRITE) {
      const [connectionId, base64Data] = data as [number, string]
      const id = getId(tabId, connectionId)
      const message: MessageToNative = [CodeToNative.WRITE, id, base64Data]
      ;(_nativePort as chrome.runtime.Port).postMessage(message)
      console.log('Writing data', base64Data)
    }
  })
})

chrome.runtime.onConnect.addListener(port => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  (async () => {
    const tabId = (await getCurrentTab()).id as number
    port.onMessage.addListener((code: CodeFromPopup) => {
      const isAllowed = code === CodeFromPopup.ALLOW
      const tab = tabs.get(tabId) as Tab
      tab.status = isAllowed ? 2 : 3
      tab.port.postMessage([isAllowed ? 0 : 1])
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      chrome.action.setBadgeText({ tabId, text: isAllowed ? '\u{2714}' : '\u{274C}' })
    })
    popupPort = port
    const translateCode: Partial<Record<TabStatus, CodeToPopup>> = {
      [TabStatus.REQUESTING]: CodeToPopup.REQUEST_PERMISSION,
      [TabStatus.GRANTED]: CodeToPopup.ALLOWED,
      [TabStatus.DENIED]: CodeToPopup.DENIED
    }
    const tab = tabs.get(tabId)
    const message = tab !== undefined ? translateCode[tab.status] : undefined
    if (message !== undefined) port.postMessage(message)
  })()
})

function getId (tabId: number, connectionId: number): string {
  return `${tabId}-${connectionId}`
}

function checkDisconnectNative (): void {
  if (!([...tabs.values()].some(({ connections }) => connections > 0))) {
    ;(_nativePort as chrome.runtime.Port).disconnect()
    _nativePort = undefined
    console.trace('disconnected native port')
  } else {
    console.trace('native port still has open sockets', tabs)
  }
}
