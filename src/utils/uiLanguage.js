import { useEffect, useState } from 'react'
import { enFlat } from './en.js'

const STORAGE_KEY = 'boss-user-preferences'
const LANGUAGE_STORAGE_KEY = 'boss-ui-language'

export function getUiLanguage() {
  const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (storedLanguage === 'en' || storedLanguage === 'ko') return storedLanguage
  try {
    const preferenceLanguage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}').language
    return preferenceLanguage === 'en' ? 'en' : 'ko'
  } catch {
    return 'ko'
  }
}

export function setUiLanguage(language) {
  const nextLanguage = language === 'en' ? 'en' : 'ko'
  let preferences
  try { preferences = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { preferences = {} }
  localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage)
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...preferences, language: nextLanguage }))
  document.documentElement.lang = nextLanguage
  window.dispatchEvent(new CustomEvent('boss-language-change', { detail: nextLanguage }))
}

export function translateUi(value, language = getUiLanguage()) {
  if (language !== 'en') return value
  return enFlat[value] || value
}

const translatedTextNodes = new WeakMap()
const translatedAttributes = new WeakMap()
const TRANSLATABLE_ATTRIBUTES = ['aria-label', 'placeholder', 'title', 'alt']

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

  const translateAttributes = (element) => {
    if (!(element instanceof Element)) return
    const originals = translatedAttributes.get(element) ?? new Map()

    TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
      const value = element.getAttribute(attribute)
      if (!value) return
      const original = originals.get(attribute) ?? value

      if (language === 'en') {
        const translated = enFlat[original.trim()]
        if (!translated) return
        originals.set(attribute, original)
        element.setAttribute(attribute, original.replace(original.trim(), translated))
      } else if (originals.has(attribute)) {
        element.setAttribute(attribute, original)
        originals.delete(attribute)
      }
    })

    if (originals.size) translatedAttributes.set(element, originals)
    else translatedAttributes.delete(element)
  }

  const walkElement = (root) => {
    if (!(root instanceof Element)) return
    translateAttributes(root)
    root.querySelectorAll('*').forEach(translateAttributes)
  }

  walk(document.body)
  walkElement(document.body)

  // Modals and popovers are mounted after the language button is pressed.  Process
  // only newly-added DOM nodes so dynamic UI is translated without re-walking React's
  // entire tree on every render.
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        walk(node)
        walkElement(node)
      })
    })
  })
  observer.observe(document.body, { childList: true, subtree: true })
  return () => observer.disconnect()
}

export function useUiLanguage() {
  const [language, setLanguage] = useState(getUiLanguage)
  useEffect(() => {
    const onChange = (event) => setLanguage(event.detail || getUiLanguage())
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY || event.key === LANGUAGE_STORAGE_KEY) setLanguage(getUiLanguage())
    }
    window.addEventListener('boss-language-change', onChange)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('boss-language-change', onChange)
      window.removeEventListener('storage', onStorage)
    }
  }, [])
  return { language, t: (value) => translateUi(value, language) }
}
