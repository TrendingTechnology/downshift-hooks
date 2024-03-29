let statusDiv = typeof document === 'undefined'
  ? null
  : document.getElementById('downshift-a11y-status-message')

let cleanupTimerID

function getAriaLiveMessageContainer() {
  if (statusDiv) {
    return statusDiv
  }
  statusDiv = document.createElement('div')
  statusDiv.setAttribute('id', 'a11y-status-message')
  statusDiv.setAttribute('role', 'status')
  statusDiv.setAttribute('aria-live', 'polite')
  statusDiv.setAttribute('aria-relevant', 'additions text')
  Object.assign(statusDiv.style, {
    border: '0',
    clip: 'rect(0 0 0 0)',
    height: '1px',
    margin: '-1px',
    overflow: 'hidden',
    padding: '0',
    position: 'absolute',
    width: '1px',
  })
  document.body.appendChild(statusDiv)
  return statusDiv
}

function setAriaLiveMessage(message) {
  const div = getAriaLiveMessageContainer()
  if (!message) {
    return
  }
  if (cleanupTimerID) {
    clearTimeout(cleanupTimerID)
    cleanupTimerID = null
  }

  div.textContent = message

  cleanupTimerID = setTimeout(() => {
    div.textContent = ''
    cleanupTimerID = null
  }, 500)
}

export default setAriaLiveMessage
