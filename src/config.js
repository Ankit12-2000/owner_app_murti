const API_BASE = import.meta.env.VITE_API_URL || '/api'
const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_URL || ''
const SHOP_BASE = import.meta.env.VITE_SHOP_URL || 'https://murtishop.ank440851.workers.dev'

// Build the public shop URL from a shop object, e.g.
// https://murtishop.ank440851.workers.dev/shop/e1072b2665/guru-marble-art
const slugify = (str) =>
  (str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const publicShopUrl = (shop = {}) => {
  const code = shop.shop_code || shop.id
  if (!code) return ''
  const slug = shop.slug || slugify(shop.name)
  return `${SHOP_BASE}/shop/${code}${slug ? `/${slug}` : ''}`
}

export { API_BASE, UPLOADS_BASE, SHOP_BASE, slugify, publicShopUrl }
