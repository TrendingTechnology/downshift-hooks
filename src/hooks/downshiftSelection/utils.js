export default function getA11yStatusMessage({
  isOpen,
  selectedItem,
  items,
  itemToString,
}) {
  if (selectedItem) {
    return `${itemToString(selectedItem)} has been selected.`
  }
  if (!items) {
    return ''
  }
  const resultCount = items.length
  if (isOpen) {
    if (resultCount === 0) {
      return 'No results are available'
    }
    return `${resultCount} result${resultCount === 1
      ? ' is'
      : 's are'}
       available, use up and down arrow keys to navigate. Press Enter key to select.`
  }
  return ''
}
