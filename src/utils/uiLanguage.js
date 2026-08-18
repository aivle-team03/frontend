import { useEffect, useState } from 'react'
import { enFlat } from '../i18n/resources/en.js'

const STORAGE_KEY = 'boss-user-preferences'

export function getUiLanguage() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}').language || 'ko' } catch { return 'ko' }
}

export function translateUi(value, language = getUiLanguage()) {
  if (language !== 'en') return value
  return enFlat[value] || value
}

const translatedTextNodes = new WeakMap()

function translateStaticQuantity(value) {
  if (/^총\s+\d+건$/.test(value)) return value.replace('총', 'Total').replace('건', ' items')
  if (/^\d+건$/.test(value)) return value.replace('건', ' items')
  if (/^\d+개 항목$/.test(value)) return value.replace('개 항목', ' items')
  if (/^\d+(\.\d+)?점$/.test(value)) return value.replace('점', ' pts')
  if (/^\d+회$/.test(value)) return value.replace('회', ' times')
  return null
}

export function synchronizeStaticUiLanguage(language) {
  if (typeof document === 'undefined') return () => {}

  const translateNode = (node) => {
    if (node.nodeType !== Node.TEXT_NODE || !node.nodeValue?.trim()) return
    const original = translatedTextNodes.get(node) ?? node.nodeValue
    if (language === 'en') {
      const translated = enFlat[original.trim()] ?? translateStaticQuantity(original.trim())
      if (!translated) return
      translatedTextNodes.set(node, original)
      node.nodeValue = original.replace(original.trim(), translated)
      return
    }
    if (translatedTextNodes.has(node)) {
      node.nodeValue = original
      translatedTextNodes.delete(node)
    }
  }

  const walk = (root) => {
    if (root.nodeType === Node.TEXT_NODE) return translateNode(root)
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    let node = walker.nextNode()
    while (node) { translateNode(node); node = walker.nextNode() }
  }

  walk(document.body)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'characterData') translateNode(mutation.target)
      mutation.addedNodes.forEach(walk)
    })
  })
  observer.observe(document.body, { childList: true, characterData: true, subtree: true })
  return () => observer.disconnect()
}

export function useUiLanguage() {
  const [language, setLanguage] = useState(getUiLanguage)
  useEffect(() => {
    const onChange = (event) => setLanguage(event.detail || getUiLanguage())
    window.addEventListener('boss-language-change', onChange)
    return () => window.removeEventListener('boss-language-change', onChange)
  }, [])
  return { language, t: (value) => translateUi(value, language) }
}
