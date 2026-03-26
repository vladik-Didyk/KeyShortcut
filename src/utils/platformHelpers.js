/**
 * Pure functions that derive lookups from loaded platform data.
 */

export function buildPlatformLookups(apps) {
  if (!apps) return { appMap: {}, categoryGroups: [], totalShortcuts: 0, appCount: 0 }

  const appMap = {}
  const catMap = {}
  let totalShortcuts = 0

  for (const app of apps) {
    appMap[app.slug] = app
    totalShortcuts += app.shortcutCount
    const cat = app.category || 'Other'
    if (!catMap[cat]) catMap[cat] = []
    catMap[cat].push(app)
  }

  const categoryGroups = Object.entries(catMap).map(([name, catApps]) => ({ name, apps: catApps }))

  return { appMap, categoryGroups, totalShortcuts, appCount: apps.length }
}

export function getPopularApps(apps, count = 8) {
  if (!apps) return []
  return [...apps]
    .sort((a, b) => b.shortcutCount - a.shortcutCount)
    .slice(0, count)
}

/** Split a shortcut's modifiers + key into individual keycap parts.
 *  Handles combined keys like "Tab+Q" → ["Tab","Q"] while keeping
 *  literal "+" and "Num+"/"Num +" intact. */
export function parseKeyParts(modifiers, key) {
  const parts = [...modifiers]
  if (key === '+' || key.startsWith('Num')) {
    parts.push(key)
  } else if (key.includes('+')) {
    parts.push(...key.split('+'))
  } else {
    parts.push(key)
  }
  return parts
}

export function groupByCategories(apps, categoryOrder) {
  if (!apps) return []

  const groups = {}
  for (const app of apps) {
    const cat = app.category || 'Other'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(app)
  }

  return categoryOrder
    .filter(cat => groups[cat]?.length)
    .map(cat => ({ name: cat, apps: groups[cat] }))
}
