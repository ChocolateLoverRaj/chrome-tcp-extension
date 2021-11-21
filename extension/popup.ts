import { Code as CodeFromBackground } from '../common/BackgroundToPopup'
import { Code as CodeToBackground } from '../common/PopupToBackground'

const requesting = document.getElementById('requesting') as HTMLSpanElement
const allow = document.getElementById('allow') as HTMLButtonElement
const deny = document.getElementById('deny') as HTMLButtonElement

const port = chrome.runtime.connect()
port.onMessage.addListener((message: CodeFromBackground) => {
  switch (message) {
    case CodeFromBackground.REQUEST_PERMISSION:
      setRequesting()
      break
    case CodeFromBackground.ALLOWED:
      setAllowed()
      break
    case CodeFromBackground.DENIED:
      setDenied()
  }
})

allow.disabled = false
deny.disabled = false
allow.addEventListener('click', () => {
  port.postMessage(CodeToBackground.ALLOW)
  setAllowed()
})
deny.addEventListener('click', () => {
  port.postMessage(CodeToBackground.DENY)
  setDenied()
})

function setDenied (): void {
  allow.style.display = 'none'
  deny.style.display = 'none'
  requesting.innerText = "You aren't letting this page use TCP"
}

function setAllowed (): void {
  allow.style.display = 'none'
  deny.style.display = 'none'
  requesting.innerText = 'This page has permission to use TCP'
}

function setRequesting (): void {
  requesting.innerText = 'This page is requesting access to TCP'
}
