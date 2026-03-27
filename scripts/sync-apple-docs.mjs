/**
 * Bulk sync of Apple app shortcuts from official Apple documentation.
 * Creates new apps and updates existing ones in Supabase.
 *
 * Usage: node scripts/sync-apple-docs.mjs
 * Safe to run multiple times (idempotent).
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ── Helpers ─────────────────────────────────────────────────

function generateActionKey(slug, action) {
  const camel = action
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('')
  return `shortcuts.${slug}.${camel}`
}

async function ensureTranslation(actionKey, value) {
  const { data } = await supabase.from('translations').select('id, value').eq('key', actionKey).eq('language', 'en')
  if (data?.length) {
    if (data[0].value !== value) await supabase.from('translations').update({ value }).eq('id', data[0].id)
  } else {
    await supabase.from('translations').insert({ key: actionKey, language: 'en', value })
  }
}

async function ensureShortcut(sectionId, slug, modifiers, key, action, sortOrder) {
  const actionKey = generateActionKey(slug, action)
  await ensureTranslation(actionKey, action)
  const modsFilter = `{${modifiers.join(',')}}`
  const { data } = await supabase.from('shortcuts').select('id').eq('section_id', sectionId).eq('key', key).eq('modifiers', modsFilter)
  if (data?.length) {
    await supabase.from('shortcuts').update({ action_key: actionKey }).eq('id', data[0].id)
    return 'updated'
  }
  const { error } = await supabase.from('shortcuts').insert({ section_id: sectionId, modifiers, key, action_key: actionKey, sort_order: sortOrder })
  if (error) { console.error(`  ERR: ${modifiers.join('+')}+${key}:`, error.message); return 'error' }
  return 'created'
}

async function getOrCreateSection(appId, platformId, name, sortOrder) {
  const { data } = await supabase.from('sections').select('id').eq('app_id', appId).eq('platform_id', platformId).eq('name', name)
  if (data?.length) return data[0].id
  const { data: created, error } = await supabase.from('sections').insert({ app_id: appId, platform_id: platformId, name, sort_order: sortOrder }).select('id')
  if (error) throw new Error(`Section "${name}": ${error.message}`)
  return created[0].id
}

async function getOrCreateApp(slug, displayName, categoryId) {
  const { data } = await supabase.from('apps').select('id').eq('slug', slug)
  if (data?.length) {
    await supabase.from('app_platforms').upsert({ app_id: data[0].id, platform_id: 'macos' }, { onConflict: 'app_id,platform_id' })
    return data[0].id
  }
  const { data: apps } = await supabase.from('apps').select('sort_order').order('sort_order', { ascending: false }).limit(1)
  const nextSort = (apps?.[0]?.sort_order || 0) + 1
  const { data: created, error } = await supabase.from('apps').insert({ slug, display_name: displayName, category_id: categoryId, sort_order: nextSort }).select('id')
  if (error) throw new Error(`App "${slug}": ${error.message}`)
  await supabase.from('app_platforms').insert({ app_id: created[0].id, platform_id: 'macos' })
  return created[0].id
}

async function processApp(slug, displayName, categoryId, docsUrl, sections) {
  console.log(`\n=== ${displayName} (${slug}) ===`)
  const appId = await getOrCreateApp(slug, displayName, categoryId)
  if (docsUrl) await supabase.from('apps').update({ docs_url: docsUrl }).eq('id', appId)
  let totalCreated = 0, totalUpdated = 0
  for (let si = 0; si < sections.length; si++) {
    const section = sections[si]
    const sectionId = await getOrCreateSection(appId, 'macos', section.name, si)
    console.log(`  ${section.name} (${section.shortcuts.length})`)
    for (let i = 0; i < section.shortcuts.length; i++) {
      const { modifiers: m, key: k, action: a } = section.shortcuts[i]
      const r = await ensureShortcut(sectionId, slug, m, k, a, i)
      if (r === 'created') totalCreated++
      else if (r === 'updated') totalUpdated++
    }
  }
  console.log(`  -> ${totalCreated} created, ${totalUpdated} updated`)
  return { created: totalCreated, updated: totalUpdated }
}

// ── Shorthand ───────────────────────────────────────────────
const s = (modifiers, key, action) => ({ modifiers, key, action })

// ── APP DATA ────────────────────────────────────────────────

const IMOVIE = [
  { name: 'General', shortcuts: [
    s(['shift','command'], '?', 'Open the iMovie Help menu'),
    s(['command'], 'I', 'Import media'),
    s(['command'], 'N', 'Create a new movie project'),
    s(['command'], 'Delete', 'Move to Trash'),
    s(['command'], ',', 'Open settings'),
  ]},
  { name: 'Playback', shortcuts: [
    s([], 'Space', 'Play or pause video'),
    s([], '/', 'Play the selection'),
    s([], '\\', 'Play from the beginning'),
    s([], 'Right', 'Move playhead one frame forward'),
    s([], 'Left', 'Move playhead one frame backward'),
    s([], 'Down', 'Jump forward to the next clip'),
    s([], 'Up', 'Jump to the beginning of the current clip'),
    s(['shift','command'], 'F', 'Play the selected item full screen'),
    s([], 'Escape', 'Exit full-screen view'),
    s(['command'], 'L', 'Loop playback'),
    s(['control'], 'Y', 'Show or hide clip info when skimming'),
  ]},
  { name: 'Editing', shortcuts: [
    s(['command'], 'A', 'Select all clips'),
    s([], 'X', 'Select an entire clip'),
    s(['shift','command'], 'A', 'Deselect all clips'),
    s([], 'E', 'Add the selection to the movie'),
    s([], 'Q', 'Connect the selection at the playhead'),
    s([], 'W', 'Insert the selection at the playhead'),
    s(['shift','command'], 'E', 'Auto improve video and audio quality'),
    s(['command'], 'X', 'Cut the selected frames'),
    s(['command'], 'C', 'Copy the selected frames'),
    s(['command'], 'B', 'Divide a clip at the playhead'),
    s(['option','shift'], 'R', 'Reset speed adjustments'),
    s(['option','command'], 'V', 'Paste all adjustments'),
    s(['option','command'], 'C', 'Paste color correction adjustments'),
    s(['option','command'], 'R', 'Paste crop adjustments'),
    s(['option','command'], 'A', 'Paste volume adjustments'),
    s(['option','command'], 'L', 'Paste the video effect'),
    s(['option','command'], 'O', 'Paste the audio effect'),
    s(['option','command'], 'S', 'Paste speed adjustments'),
    s(['option','command'], 'U', 'Paste video overlay settings'),
    s(['option','command'], 'M', 'Paste the map style'),
    s([], 'F', 'Rate the selection as favorite'),
    s([], 'U', 'Unmark selected frames'),
    s([], 'Delete', 'Rate as rejected or delete from timeline'),
    s(['command'], '\\', 'Open or close the clip trimmer'),
    s(['option','command'], 'F', 'Show the Cinematic Editor'),
  ]},
  { name: 'Audio', shortcuts: [
    s([], 'V', 'Open voiceover controls'),
    s(['shift'], 'S', 'Toggle audio while skimming'),
    s(['shift','command'], 'M', 'Mute audio in a clip'),
    s(['option','command'], 'B', 'Detach audio from a clip'),
    s(['command'], 'Z', 'Undo the last action'),
    s(['shift','command'], 'Z', 'Redo the last action'),
  ]},
  { name: 'Window', shortcuts: [
    s(['command'], 'M', 'Minimize the iMovie window'),
    s([], '1', 'Go to Library view'),
    s([], '2', 'Go to Projects view'),
    s(['shift','command'], '1', 'Show or hide the Libraries list'),
    s(['command'], '1', 'Show my media in the browser'),
    s(['command'], '2', 'Show audio in the browser'),
    s(['command'], '3', 'Show titles in the browser'),
    s(['command'], '4', 'Show maps and backgrounds'),
    s(['command'], '5', 'Show sound effects'),
    s(['command'], '6', 'Show transitions'),
  ]},
]

const KEYNOTE = [
  { name: 'General', shortcuts: [
    s(['command'], 'N', 'Open the theme chooser'),
    s(['option','command'], 'N', 'Open theme chooser with Language menu'),
    s([], 'Escape', 'Close the theme chooser'),
    s(['command'], 'O', 'Open an existing presentation'),
    s(['command'], 'S', 'Save a presentation'),
    s(['option','shift','command'], 'S', 'Save as'),
    s(['shift','command'], 'S', 'Duplicate a presentation'),
    s(['command'], 'P', 'Print a presentation'),
    s(['shift','command'], '?', 'Open the Keynote User Guide'),
    s(['command'], 'W', 'Close a window'),
    s(['option','command'], 'W', 'Close all windows'),
    s(['command'], 'M', 'Minimize a window'),
    s(['option','command'], 'M', 'Minimize all windows'),
    s(['control','command'], 'F', 'Enter full-screen view'),
    s(['shift','command'], '>', 'Zoom in'),
    s(['shift','command'], '<', 'Zoom out'),
    s(['command'], ',', 'Show the Settings window'),
    s(['shift','command'], '0', 'Zoom to selection'),
    s(['option','command'], '0', 'Fit slide in the window'),
    s(['command'], '0', 'Return to actual size'),
    s(['command'], 'R', 'Show the presentation rulers'),
    s(['shift','command'], 'V', 'Choose a file to insert'),
    s(['shift','command'], 'C', 'Show the Colors window'),
    s(['option','command'], 'T', 'Hide or show the toolbar'),
    s(['option','command'], 'I', 'Hide or show inspector sidebars'),
    s(['shift','command'], 'L', 'Show or hide the object list'),
    s(['shift','command'], 'E', 'Enter or exit Edit Slide Layouts view'),
    s(['command'], 'H', 'Hide Keynote'),
    s(['option','command'], 'H', 'Hide other windows'),
    s(['command'], 'Z', 'Undo the last action'),
    s(['shift','command'], 'Z', 'Redo the last action'),
    s(['command'], 'Q', 'Quit Keynote'),
    s(['option','command'], 'Q', 'Quit Keynote and keep windows open'),
  ]},
  { name: 'Text Formatting', shortcuts: [
    s(['command'], 'T', 'Show the Fonts window'),
    s(['command'], 'B', 'Apply boldface to selected text'),
    s(['command'], 'I', 'Apply italic to selected text'),
    s(['command'], 'U', 'Apply underline to selected text'),
    s([], 'Delete', 'Delete the previous character or selection'),
    s(['option'], 'Delete', 'Delete the word before insertion point'),
    s(['control'], 'K', 'Delete text to end of paragraph'),
    s(['command'], '+', 'Make the font size bigger'),
    s(['command'], '-', 'Make the font size smaller'),
    s(['option','command'], '[', 'Decrease space between characters'),
    s(['option','command'], ']', 'Increase space between characters'),
    s(['control','command'], '+', 'Make the text superscript'),
    s(['control','command'], '-', 'Make the text subscript'),
    s(['command'], '{', 'Align the text flush left'),
    s(['command'], '|', 'Center the text'),
    s(['command'], '}', 'Align the text flush right'),
    s(['option','command'], '|', 'Justify text'),
    s(['command'], '[', 'Decrease the indent level'),
    s(['command'], ']', 'Increase the indent level'),
    s(['command'], 'K', 'Turn text into a link'),
    s(['command'], 'X', 'Cut the selection'),
    s(['command'], 'C', 'Copy the selection'),
    s(['option','command'], 'C', 'Copy the paragraph style'),
    s(['command'], 'V', 'Paste the selection'),
    s(['option','command'], 'V', 'Paste the paragraph style'),
    s(['option','shift','command'], 'V', 'Paste and match style'),
    s(['control','command'], 'Space', 'Enter special characters'),
  ]},
  { name: 'Find', shortcuts: [
    s(['command'], 'F', 'Find'),
    s(['command'], 'G', 'Find next'),
    s(['shift','command'], 'G', 'Find previous'),
    s(['command'], 'E', 'Place selected text in Find field'),
    s(['control','command'], 'D', 'Look up the word at insertion point'),
    s(['command'], ';', 'Check spelling and grammar'),
    s(['shift','command'], ':', 'Show Spelling and Grammar window'),
    s(['shift','command'], 'K', 'Open a new comment'),
    s(['option','command'], 'K', 'Show the next comment'),
    s(['option','shift','command'], 'K', 'Show the previous comment'),
  ]},
  { name: 'Objects', shortcuts: [
    s(['command'], 'A', 'Select all objects'),
    s(['shift','command'], 'A', 'Deselect all objects'),
    s([], 'Tab', 'Select the next object on the slide'),
    s(['shift'], 'Tab', 'Select the previous object on the slide'),
    s(['shift','command'], 'B', 'Send object to the back'),
    s(['option','shift','command'], 'B', 'Send object one layer back'),
    s(['shift','command'], 'F', 'Bring object to the front'),
    s(['option','shift','command'], 'F', 'Bring object one layer forward'),
    s(['option','command'], 'G', 'Group selected objects'),
    s(['option','shift','command'], 'G', 'Ungroup selected objects'),
    s(['command'], 'L', 'Lock selected objects'),
    s(['option','command'], 'L', 'Unlock selected objects'),
    s(['command'], 'D', 'Duplicate the object'),
    s(['shift','command'], 'M', 'Mask or unmask the object'),
  ]},
  { name: 'Tables', shortcuts: [
    s(['option','command'], 'E', 'Insert an equation'),
    s(['option'], 'Up', 'Add a row above'),
    s(['option'], 'Down', 'Add a row below'),
    s(['option'], 'Right', 'Add a column to the right'),
    s(['option'], 'Left', 'Add a column to the left'),
    s(['option','command'], 'Enter', 'Select all rows that intersect'),
    s(['control','command'], 'Enter', 'Select all columns that intersect'),
    s(['option','command'], 'Delete', 'Delete selected rows'),
    s(['control','command'], 'Delete', 'Delete selected columns'),
    s(['option','command'], 'U', 'Auto-align cell content'),
    s(['control','command'], 'M', 'Merge selected cells'),
    s(['control','shift','command'], 'M', 'Unmerge selected cells'),
    s(['command'], '\\', 'Turn on autofill mode'),
  ]},
  { name: 'Slide Navigator', shortcuts: [
    s([], 'Enter', 'Create a new slide'),
    s(['shift','command'], 'N', 'Add a new slide'),
    s([], 'Tab', 'Indent selected slides to the right'),
    s(['shift'], 'Tab', 'Move indented slides to the left'),
    s(['command'], 'D', 'Duplicate a slide'),
    s([], 'Delete', 'Delete selected slides'),
    s([], 'Down', 'Move to the next slide'),
    s([], 'Up', 'Move to the previous slide'),
    s([], 'Right', 'Expand a slide group'),
    s([], 'Left', 'Collapse a slide group'),
    s(['shift','command'], 'H', 'Skip or unskip a slide'),
  ]},
  { name: 'Presenting', shortcuts: [
    s(['option','command'], 'P', 'Play a presentation'),
    s([], 'Right', 'Advance to the next slide or build'),
    s([], 'Left', 'Go to previous slide'),
    s(['shift'], 'Right', 'Advance without animation'),
    s(['shift'], 'Down', 'Advance to next slide without builds'),
    s(['shift','command'], 'P', 'Show or hide presenter notes'),
    s(['shift'], 'Left', 'Go back to previous build'),
    s([], 'Z', 'Go back through previously viewed slides'),
    s([], 'F', 'Pause the presentation'),
    s([], 'B', 'Show a black screen'),
    s([], 'W', 'Show a white screen'),
    s([], 'C', 'Show or hide the pointer'),
    s([], 'S', 'Display the slide number'),
    s([], 'X', 'Switch primary and presenter displays'),
    s([], 'R', 'Reset timer'),
    s([], 'U', 'Scroll presenter notes up'),
    s([], 'D', 'Scroll presenter notes down'),
    s(['command'], '+', 'Increase note font size'),
    s(['command'], '-', 'Decrease note font size'),
    s([], 'Escape', 'Quit presentation mode'),
    s([], 'H', 'Hide presentation and switch to last app'),
    s([], '?', 'Show or hide keyboard shortcuts'),
  ]},
]

const MAIL = [
  { name: 'Compose', shortcuts: [
    s(['command'], 'N', 'Start a new email'),
    s(['option','command'], 'N', 'Open a new Mail viewer window'),
    s(['option','shift','command'], 'N', 'Open a new tab in Mail viewer'),
    s(['shift','command'], 'A', 'Attach files to your email'),
    s(['shift','command'], 'V', 'Paste text as a quotation'),
    s(['option','command'], 'I', 'Append selected emails to your email'),
    s(['option','command'], 'B', 'Show the Bcc address field'),
    s(['option','command'], 'R', 'Show the Reply-To address field'),
    s(['shift','command'], 'D', 'Send emails'),
    s(['command'], 'Z', 'Unsend email'),
  ]},
  { name: 'Reading', shortcuts: [
    s(['command'], 'R', 'Reply to the selected email'),
    s(['shift','command'], 'R', 'Reply All to the selected email'),
    s(['shift','command'], 'F', 'Forward the selected email'),
    s(['shift','command'], 'E', 'Redirect the selected email'),
    s(['shift','command'], 'U', 'Mark emails as read or unread'),
    s(['shift','command'], 'J', 'Move selected emails to Junk'),
    s(['control','command'], 'A', 'Archive emails'),
    s(['control','command'], 'M', 'Move emails to predicted mailbox'),
    s(['control','command'], 'L', 'Apply active Mail rules'),
    s(['shift','command'], 'T', 'Format as Plain Text or Rich Format'),
  ]},
  { name: 'General', shortcuts: [
    s(['shift','command'], 'N', 'Get new emails'),
    s(['option','command'], 'J', 'Erase junk mail'),
    s(['control','command'], 'S', 'Hide or show the Mail sidebar'),
    s(['command'], 'L', 'Enable or disable the message filter'),
    s(['command'], '0', 'Show the Mail viewer window'),
    s(['control','command'], '0', 'Show the Mail Activity window'),
    s(['option','command'], 'W', 'Close all Mail windows'),
  ]},
]

const MAPS = [
  { name: 'General', shortcuts: [
    s(['command'], 'L', 'Show your current location'),
    s(['shift','command'], 'Up', 'Return to north-facing orientation'),
    s(['command'], '+', 'Zoom in'),
    s(['command'], '-', 'Zoom out'),
    s(['command'], '1', 'Switch to explore view'),
    s(['command'], '2', 'Switch to driving view'),
    s(['command'], '3', 'Switch to transit view'),
    s(['command'], '4', 'Switch to satellite view'),
    s(['command'], 'D', 'Show or hide the 3D map'),
    s(['command'], 'K', 'Show or hide Look Around'),
    s(['command'], 'R', 'Show or hide directions'),
    s(['shift','command'], 'D', 'Drop a pin in the middle of the map'),
    s(['control','command'], 'S', 'Show or hide the sidebar'),
    s(['option'], 'Left', 'Rotate map counterclockwise'),
    s(['option'], 'Right', 'Rotate map clockwise'),
  ]},
]

const MESSAGES = [
  { name: 'General', shortcuts: [
    s(['command'], ',', 'Open Messages settings'),
    s(['command'], 'H', 'Hide Messages'),
    s(['option','command'], 'H', 'Hide everything except Messages'),
    s(['command'], 'Q', 'Quit Messages'),
    s(['command'], 'N', 'Start a new message'),
    s(['command'], '0', 'Open the Messages window'),
    s(['command'], 'W', 'Close the Messages window'),
    s(['command'], 'P', 'Print the conversation'),
    s(['control','command'], '1', 'Show all conversations'),
    s(['control','command'], '2', 'Show conversations from known senders'),
    s(['control','command'], '3', 'Show conversations from unknown senders'),
    s(['control','command'], '4', 'Show conversations with unread messages'),
    s(['control','command'], '5', 'Show recently deleted messages'),
    s(['command'], 'F', 'Search all conversations'),
    s(['option','command'], '1', 'Go to the first unpinned conversation'),
    s(['control','command'], 'Space', 'Open the Emoji and Symbols window'),
    s(['command'], 'M', 'Minimize a window'),
    s(['control','command'], 'F', 'Enter full-screen view'),
  ]},
  { name: 'Conversations', shortcuts: [
    s(['command'], '+', 'Make the text bigger'),
    s(['command'], '-', 'Make the text smaller'),
    s(['command'], 'E', 'Edit a sent message'),
    s(['command'], 'C', 'Copy the selected text'),
    s(['command'], 'V', 'Paste copied text'),
    s(['shift','command'], ':', 'Open the Spelling and Grammar window'),
    s(['command'], ';', 'Check for spelling and grammar issues'),
    s(['command'], 'R', 'Reply to the last incoming message'),
    s(['command'], 'T', 'Add a Tapback to the last message'),
    s(['control'], 'Tab', 'Select the next conversation'),
    s(['control','shift'], 'Tab', 'Select the previous conversation'),
    s(['option','command'], 'I', 'Open the conversation Info view'),
    s(['option','command'], 'M', 'Hide or unhide alerts for a conversation'),
    s(['shift','command'], 'U', 'Mark a conversation as unread or read'),
    s(['option','command'], 'B', 'Open the Contact card'),
    s(['option','command'], 'E', 'Send an email to a selected person'),
    s(['shift','command'], 'E', 'Show video effects'),
    s([], 'Space', 'Show selected image in Quick Look'),
    s([], 'Delete', 'Delete a single message'),
  ]},
]

const MUSIC = [
  { name: 'Playback', shortcuts: [
    s([], 'Space', 'Start playing or pause the selected song'),
    s([], 'Enter', 'Play the selected song from the beginning'),
    s(['option','command'], 'Right', 'Move forward within a song'),
    s(['option','command'], 'Left', 'Move backward within a song'),
    s(['command'], '.', 'Stop playing the selected song'),
    s([], 'Right', 'Play the next song in a list'),
    s([], 'Left', 'Play the previous song in a list'),
    s(['command'], 'L', 'Show the currently playing song'),
    s(['option','command'], 'U', 'Show the queue'),
    s(['option'], 'Right', 'Play the next album'),
    s(['option'], 'Left', 'Play the previous album'),
    s(['command'], 'Up', 'Increase the volume'),
    s(['command'], 'Down', 'Decrease the volume'),
    s(['option','command'], 'E', 'Open the equalizer'),
    s(['shift','command'], 'Right', 'Go to the next chapter'),
    s(['shift','command'], 'Left', 'Go to the previous chapter'),
    s(['command'], 'U', 'Stream audio file at a specific URL'),
  ]},
  { name: 'Playlists', shortcuts: [
    s(['command'], 'N', 'Create a new playlist'),
    s(['shift','command'], 'N', 'Create a playlist from a selection'),
    s(['option','command'], 'N', 'Create a new Smart Playlist'),
    s(['option'], 'Space', 'Start Genius Shuffle'),
    s(['command'], 'R', 'Refresh a Genius Playlist'),
    s([], 'Delete', 'Delete the selected song from playlist'),
    s(['command'], 'Delete', 'Delete without confirming'),
    s(['option'], 'Delete', 'Delete from library and all playlists'),
  ]},
  { name: 'Library', shortcuts: [
    s(['command'], 'O', 'Add a file to your library'),
    s(['shift','command'], 'R', 'Show where a song file is located'),
    s(['command'], 'F', 'Select the search field'),
    s(['command'], 'Z', 'Undo last typing change'),
    s(['command'], 'X', 'Cut song information or artwork'),
    s(['command'], 'C', 'Copy song information or artwork'),
    s(['command'], 'V', 'Paste song information or artwork'),
    s(['command'], 'A', 'Select all songs in the list'),
    s(['command'], 'B', 'Show or hide the column browser'),
    s(['shift','command'], 'A', 'Deselect all songs'),
  ]},
  { name: 'View', shortcuts: [
    s(['option','command'], 'M', 'Open or close MiniPlayer'),
    s(['shift','command'], 'F', 'Open or close Full Screen Player'),
    s(['command'], '/', 'Show or hide the status bar'),
    s(['command'], 'I', 'Open the Info window'),
    s(['command'], '[', 'Info window: show previous song'),
    s(['command'], ']', 'Info window: show next song'),
    s(['command'], 'J', 'Open the View Options window'),
    s(['command'], 'T', 'Turn the visualizer on or off'),
    s(['command'], '0', 'Open the Music window'),
    s(['command'], 'W', 'Close the Music window'),
    s(['command'], 'H', 'Hide the Music window'),
    s(['option','command'], 'H', 'Hide all other applications'),
  ]},
  { name: 'Other', shortcuts: [
    s(['command'], ',', 'Open Music settings'),
    s(['command'], 'Q', 'Quit Music'),
    s(['command'], 'E', 'Eject a CD'),
    s(['command'], '?', 'Open Music Help menu'),
  ]},
]

const NEWS = [
  { name: 'Windows and Tabs', shortcuts: [
    s(['command'], 'N', 'Open a News window'),
    s(['control','command'], 'S', 'Show or hide the sidebar'),
    s(['command'], 'W', 'Close a News window'),
    s(['option','command'], 'W', 'Close all News windows'),
    s(['command'], 'T', 'Open a tab'),
    s(['shift','command'], '\\', 'Show all tabs'),
    s(['control'], 'Tab', 'Show the next tab'),
    s(['control','shift'], 'Tab', 'Show the previous tab'),
    s(['command'], 'Right', 'Move to the next story'),
    s(['command'], 'Left', 'Move to the previous story'),
  ]},
  { name: 'Stories', shortcuts: [
    s(['shift','command'], 'L', 'Follow or unfollow channel or topic'),
    s(['shift','command'], 'D', 'Block the current channel or topic'),
    s(['command'], 'L', 'Suggest more stories like this one'),
    s(['command'], 'D', 'Suggest fewer stories like this one'),
    s(['command'], 'S', 'Save or unsave a story'),
    s(['option','command'], 'C', 'Copy the link for the current story'),
    s(['command'], 'Up', 'Move to the top of a feed or story'),
    s(['command'], 'Down', 'Move to the bottom of a feed or story'),
    s(['command'], 'R', 'Refresh a feed'),
    s(['command'], '[', 'Close story and return to the feed'),
  ]},
  { name: 'View', shortcuts: [
    s(['command'], '+', 'Zoom in'),
    s(['command'], '-', 'Zoom out'),
    s(['option','command'], '+', 'Make the text bigger'),
    s(['option','command'], '-', 'Make the text smaller'),
    s(['shift','command'], '0', 'Return content to actual size'),
    s(['command'], 'Q', 'Quit News'),
  ]},
]

const NOTES = [
  { name: 'General', shortcuts: [
    s(['command'], 'N', 'Create a new note'),
    s(['fn'], 'Q', 'Create a Quick Note'),
    s(['command'], 'D', 'Duplicate a note'),
    s(['shift','command'], 'N', 'Create a new folder'),
    s(['command'], '0', 'Show the main Notes window'),
    s(['command'], '1', 'Show notes in a list'),
    s(['command'], '2', 'Show notes in gallery view'),
    s(['command'], '3', 'Show attachments'),
    s(['option','command'], 'F', 'Search all notes'),
    s(['command'], 'P', 'Print a note'),
    s(['control','command'], 'I', 'Show or hide highlights in shared note'),
    s(['control','command'], 'K', 'Show or hide activity list in shared note'),
    s(['option','command'], ']', 'Go forward to a linked note'),
    s(['option','command'], '[', 'Return to the note containing the linked note'),
  ]},
  { name: 'Editing', shortcuts: [
    s(['shift','command'], 'A', 'Attach a file'),
    s(['command'], 'K', 'Create a link to a webpage'),
    s(['option','command'], 'T', 'Insert a table'),
    s(['shift','command'], 'T', 'Apply Title format'),
    s(['shift','command'], 'H', 'Apply Heading format'),
    s(['shift','command'], 'J', 'Apply Subheading format'),
    s(['shift','command'], 'B', 'Apply Body format'),
    s(['shift','command'], 'M', 'Apply Monostyled format'),
    s(['shift','command'], '7', 'Apply Bulleted List format'),
    s(['shift','command'], '8', 'Apply Dashed List format'),
    s(['shift','command'], '9', 'Apply Numbered List format'),
    s(['shift','command'], 'L', 'Apply Checklist format'),
    s(['command'], "'", 'Apply Block Quote format'),
    s(['command'], '+', 'Increase font size'),
    s(['command'], '-', 'Decrease font size'),
    s(['command'], ']', 'Increase list level'),
    s(['command'], '[', 'Decrease list level'),
    s(['shift','command'], 'U', 'Mark or unmark a checklist item'),
    s(['control','command'], 'Up', 'Move list item up'),
    s(['control','command'], 'Down', 'Move list item down'),
    s(['shift','command'], '.', 'Zoom in on note contents'),
    s(['shift','command'], ',', 'Zoom out on note contents'),
    s(['shift','command'], '0', 'Default zoom'),
  ]},
  { name: 'Tables', shortcuts: [
    s([], 'Enter', 'Move down one row or add row at bottom'),
    s(['shift'], 'Enter', 'Move up one row'),
    s(['option'], 'Enter', 'Add a new paragraph in a cell'),
    s(['option','command'], 'Up', 'Add a new row above'),
    s(['option','command'], 'Down', 'Add a new row below'),
    s(['option','command'], 'Right', 'Add a column to the right'),
    s(['option','command'], 'Left', 'Add a column to the left'),
    s([], 'Tab', 'Move to the next cell to the right'),
    s(['shift'], 'Tab', 'Move to the next cell to the left'),
    s(['command'], 'A', 'Select the content of the current cell'),
  ]},
]

const NUMBERS = [
  { name: 'General', shortcuts: [
    s(['command'], 'N', 'Open the template chooser'),
    s(['option','command'], 'N', 'Open template chooser with Language menu'),
    s([], 'Escape', 'Close the template chooser'),
    s(['command'], 'O', 'Open an existing spreadsheet'),
    s(['command'], 'S', 'Save a spreadsheet'),
    s(['option','shift','command'], 'S', 'Save as'),
    s(['shift','command'], 'S', 'Duplicate a spreadsheet'),
    s(['command'], 'P', 'Print a spreadsheet'),
    s(['shift','command'], 'N', 'Add a new sheet'),
    s(['shift','command'], '{', 'Switch to the previous sheet'),
    s(['shift','command'], '}', 'Switch to the next sheet'),
    s(['shift','command'], '?', 'Open the Numbers User Guide'),
    s(['command'], 'W', 'Close a window'),
    s(['option','command'], 'W', 'Close all windows'),
    s(['command'], 'M', 'Minimize a window'),
    s(['option','command'], 'M', 'Minimize all windows'),
    s(['control','command'], 'F', 'Enter full-screen view'),
    s(['shift','command'], '>', 'Zoom in'),
    s(['shift','command'], '<', 'Zoom out'),
    s(['command'], ',', 'Show the Settings window'),
    s(['shift','command'], '0', 'Zoom to selection'),
    s(['command'], '0', 'Return to actual size'),
    s(['command'], 'R', 'Show the spreadsheet rulers'),
    s(['shift','command'], 'C', 'Show the Colors window'),
    s(['option','command'], 'T', 'Hide or show the toolbar'),
    s(['option','command'], 'I', 'Hide or show the sidebar'),
    s(['command'], 'H', 'Hide Numbers'),
    s(['option','command'], 'H', 'Hide other windows'),
    s(['command'], 'Z', 'Undo the last action'),
    s(['shift','command'], 'Z', 'Redo the last action'),
    s(['command'], 'Q', 'Quit Numbers'),
    s(['option','command'], 'Q', 'Quit Numbers and keep windows open'),
  ]},
  { name: 'Text Formatting', shortcuts: [
    s(['command'], 'T', 'Show the Fonts window'),
    s(['command'], 'B', 'Apply boldface to selected text'),
    s(['command'], 'I', 'Apply italic to selected text'),
    s(['command'], 'U', 'Apply underline to selected text'),
    s([], 'Delete', 'Delete the previous character'),
    s(['option'], 'Delete', 'Delete the word before insertion point'),
    s(['control'], 'K', 'Delete text to end of paragraph'),
    s(['command'], '+', 'Make the font size bigger'),
    s(['command'], '-', 'Make the font size smaller'),
    s(['option','command'], '[', 'Decrease space between characters'),
    s(['option','command'], ']', 'Increase space between characters'),
    s(['control','command'], '+', 'Make the text superscript'),
    s(['control','command'], '-', 'Make the text subscript'),
    s(['command'], '[', 'Decrease the indent level'),
    s(['command'], ']', 'Increase the indent level'),
    s(['command'], 'K', 'Turn text into a link'),
    s(['command'], 'X', 'Cut the selection'),
    s(['command'], 'C', 'Copy the selection'),
    s(['option','command'], 'C', 'Copy the paragraph style'),
    s(['command'], 'V', 'Paste the selection'),
    s(['option','command'], 'V', 'Paste the paragraph style'),
    s(['option','shift','command'], 'V', 'Paste and match style'),
    s(['control','command'], 'Space', 'Enter special characters'),
    s(['control','shift','command'], 'T', 'Insert the current time'),
    s(['control','shift','command'], 'D', 'Insert the current date'),
  ]},
  { name: 'Find', shortcuts: [
    s(['command'], 'F', 'Find'),
    s(['command'], 'G', 'Find next'),
    s(['shift','command'], 'G', 'Find previous'),
    s(['command'], 'E', 'Place selected text in Find field'),
    s(['control','command'], 'D', 'Look up the word at insertion point'),
    s(['command'], ';', 'Check spelling and grammar'),
    s(['shift','command'], ':', 'Show Spelling and Grammar window'),
    s(['shift','command'], 'K', 'Open a new comment'),
    s(['option','command'], 'K', 'Show the next comment'),
    s(['option','shift','command'], 'K', 'Show the previous comment'),
  ]},
  { name: 'Objects', shortcuts: [
    s(['command'], 'A', 'Select all objects'),
    s(['shift','command'], 'A', 'Deselect all objects'),
    s([], 'Tab', 'Select the next object'),
    s(['shift'], 'Tab', 'Select the previous object'),
    s(['shift','command'], 'B', 'Send object to the back'),
    s(['option','shift','command'], 'B', 'Send object one layer back'),
    s(['shift','command'], 'F', 'Bring object to the front'),
    s(['option','shift','command'], 'F', 'Bring object one layer forward'),
    s(['option','command'], 'G', 'Group selected objects'),
    s(['option','shift','command'], 'G', 'Ungroup selected objects'),
    s(['command'], 'L', 'Lock selected objects'),
    s(['option','command'], 'L', 'Unlock selected objects'),
    s(['command'], 'D', 'Duplicate the object'),
    s(['shift','command'], 'M', 'Mask or unmask the object'),
  ]},
  { name: 'Tables', shortcuts: [
    s(['option','command'], 'E', 'Insert an equation'),
    s(['option'], 'Up', 'Add a row above'),
    s(['option'], 'Down', 'Add a row below'),
    s(['option'], 'Right', 'Add a column to the right'),
    s(['option'], 'Left', 'Add a column to the left'),
    s(['option','command'], 'Delete', 'Delete selected rows'),
    s(['control','command'], 'Delete', 'Delete selected columns'),
    s(['option','command'], 'Enter', 'Select all rows that intersect'),
    s(['control','command'], 'Enter', 'Select all columns that intersect'),
    s(['option','command'], 'U', 'Auto-align cell content'),
    s(['control','command'], 'M', 'Merge selected cells'),
    s(['control','shift','command'], 'M', 'Unmerge selected cells'),
    s(['command'], '\\', 'Turn on autofill mode'),
    s(['control','command'], '\\', 'Autofill from the column before'),
    s(['option','command'], '\\', 'Autofill from the row above'),
    s(['option','command'], 'F', 'Turn Filters on or off'),
    s(['shift','command'], 'R', 'Apply sorting rules'),
    s(['command'], '8', 'Collapse selected category groups'),
    s(['command'], '9', 'Expand selected category groups'),
    s(['shift','command'], 'V', 'Paste formula results'),
    s([], 'Space', 'Open a pop-up menu in a selected cell'),
  ]},
  { name: 'Charts', shortcuts: [
    s(['shift','command'], 'D', 'Edit chart data references'),
  ]},
]

const PAGES = [
  { name: 'General', shortcuts: [
    s(['command'], 'N', 'Create a new document'),
    s(['option','command'], 'N', 'Open template chooser with Language menu'),
    s([], 'Escape', 'Close the template chooser'),
    s(['command'], 'O', 'Open an existing document'),
    s(['command'], 'S', 'Save a document'),
    s(['option','shift','command'], 'S', 'Save As'),
    s(['shift','command'], 'S', 'Duplicate a document'),
    s(['command'], 'P', 'Print a document'),
    s(['shift','command'], '?', 'Open the Pages User Guide'),
    s(['command'], 'W', 'Close a window'),
    s(['option','command'], 'W', 'Close all windows'),
    s(['command'], 'M', 'Minimize a window'),
    s(['option','command'], 'M', 'Minimize all windows'),
    s(['control','command'], 'F', 'Enter full-screen view'),
    s(['command'], '+', 'Increase text size'),
    s(['command'], '-', 'Decrease text size'),
    s(['shift','command'], '>', 'Zoom in'),
    s(['shift','command'], '<', 'Zoom out'),
    s(['shift','command'], '0', 'Zoom to selection'),
    s(['command'], '0', 'Return to actual size'),
    s(['command'], 'R', 'Show or hide the ruler'),
    s(['shift','command'], 'P', 'Open the Page Setup window'),
    s(['shift','command'], 'L', 'Show formatting boundaries'),
    s(['shift','command'], 'I', 'Show formatting characters'),
    s(['shift','command'], 'V', 'Choose a file to insert'),
    s(['shift','command'], 'C', 'Show the Colors window'),
    s(['option','command'], 'T', 'Hide or show the toolbar'),
    s(['option','command'], 'I', 'Hide or show sidebars'),
    s(['command'], 'H', 'Hide Pages'),
    s(['option','command'], 'H', 'Hide other windows'),
    s(['command'], 'Z', 'Undo the last action'),
    s(['shift','command'], 'Z', 'Redo the last action'),
    s(['command'], ',', 'Open Pages settings'),
    s(['command'], 'Q', 'Quit Pages'),
    s(['option','command'], 'Q', 'Quit Pages and keep windows open'),
    s(['control','command'], 'G', 'Go to a specific page'),
    s(['shift','command'], 'E', 'Enter or exit Edit Page Template view'),
  ]},
  { name: 'Text Formatting', shortcuts: [
    s(['command'], 'T', 'Show the Fonts window'),
    s(['command'], 'B', 'Apply boldface'),
    s(['command'], 'I', 'Apply italic'),
    s(['command'], 'U', 'Apply underline'),
    s([], 'Delete', 'Delete the previous character'),
    s(['option'], 'Delete', 'Delete the word before insertion point'),
    s(['control'], 'K', 'Delete text to end of paragraph'),
    s(['command'], '+', 'Make the font size bigger'),
    s(['command'], '-', 'Make the font size smaller'),
    s(['option','command'], '[', 'Decrease space between characters'),
    s(['option','command'], ']', 'Increase space between characters'),
    s(['control','command'], '+', 'Make the text superscript'),
    s(['control','command'], '-', 'Make the text subscript'),
    s(['command'], '{', 'Align the text flush left'),
    s(['command'], '|', 'Center the text'),
    s(['command'], '}', 'Align the text flush right'),
    s(['option','command'], '|', 'Justify text'),
    s(['command'], '[', 'Decrease the indent level'),
    s(['command'], ']', 'Increase the indent level'),
    s(['command'], 'K', 'Turn text into a link'),
    s(['option','command'], 'B', 'Add a bookmark'),
    s(['command'], 'X', 'Cut the selection'),
    s(['command'], 'C', 'Copy the selection'),
    s(['option','command'], 'C', 'Copy the paragraph style'),
    s(['command'], 'V', 'Paste the selection'),
    s(['option','command'], 'V', 'Paste the paragraph style'),
    s(['option','shift','command'], 'V', 'Paste and match style'),
    s(['control','command'], 'Space', 'Enter special characters'),
  ]},
  { name: 'Find', shortcuts: [
    s(['command'], 'F', 'Find'),
    s(['command'], 'G', 'Find next'),
    s(['shift','command'], 'G', 'Find previous'),
    s(['command'], 'E', 'Place selected text in Find field'),
    s(['control','command'], 'D', 'Look up the word at insertion point'),
    s(['command'], ';', 'Check spelling and grammar'),
    s(['shift','command'], ':', 'Show Spelling and Grammar window'),
    s(['shift','command'], 'H', 'Highlight text'),
    s(['shift','command'], 'K', 'Open a new comment'),
    s(['option','command'], 'K', 'Show the next comment'),
    s(['option','shift','command'], 'K', 'Show previous comment'),
    s(['option','command'], 'A', 'Accept a change'),
    s(['option','command'], 'R', 'Reject a change'),
    s(['shift','command'], 'W', 'Show or hide word count'),
  ]},
  { name: 'Objects', shortcuts: [
    s(['command'], 'A', 'Select all objects'),
    s(['shift','command'], 'A', 'Deselect all objects'),
    s(['shift'], 'Tab', 'Select the previous object'),
    s(['shift','command'], 'B', 'Send object to the back'),
    s(['option','shift','command'], 'B', 'Send object one layer back'),
    s(['shift','command'], 'F', 'Bring object to the front'),
    s(['option','shift','command'], 'F', 'Bring object one layer forward'),
    s(['option','command'], 'G', 'Group selected objects'),
    s(['option','shift','command'], 'G', 'Ungroup selected objects'),
    s(['command'], 'L', 'Lock selected objects'),
    s(['option','command'], 'L', 'Unlock selected objects'),
    s(['shift','command'], 'M', 'Mask or unmask the image'),
  ]},
  { name: 'Tables', shortcuts: [
    s(['option'], 'Up', 'Add a row above'),
    s(['option'], 'Down', 'Add a row below'),
    s(['option'], 'Right', 'Add a column to the right'),
    s(['option'], 'Left', 'Add a column to the left'),
    s(['option','command'], 'Delete', 'Delete selected rows'),
    s(['control','command'], 'Delete', 'Delete selected columns'),
    s(['option','command'], 'Enter', 'Select all rows that intersect'),
    s(['control','command'], 'Enter', 'Select all columns that intersect'),
    s(['option','command'], 'U', 'Auto-align cell content'),
    s(['control','command'], 'M', 'Merge selected cells'),
    s(['control','shift','command'], 'M', 'Unmerge selected cells'),
    s(['command'], '\\', 'Turn on autofill mode'),
    s(['control','command'], '\\', 'Autofill from the column before'),
    s(['option','command'], '\\', 'Autofill from the row above'),
    s(['shift','command'], 'V', 'Paste formula results'),
  ]},
  { name: 'Charts', shortcuts: [
    s(['option','command'], 'E', 'Insert an equation'),
    s(['shift','command'], 'D', 'Show or hide Chart Data editor'),
  ]},
]

const PHOTOS = [
  { name: 'Viewing', shortcuts: [
    s(['command'], '1', 'Years view'),
    s(['command'], '2', 'Months view'),
    s(['command'], '3', 'All Photos view'),
    s([], 'Space', 'Open or close an individual photo'),
    s(['command'], 'Up', 'Stop viewing a photo'),
    s(['option'], 'Space', 'Start or stop playing a video'),
    s(['option'], 'S', 'Show or hide thumbnails'),
    s(['command'], 'F', 'Find photos'),
  ]},
  { name: 'Editing', shortcuts: [
    s([], 'Enter', 'Open or close editing view'),
    s([], 'A', 'Adjust a photo'),
    s([], 'F', 'Apply a filter'),
    s([], 'S', 'Apply a style'),
    s([], 'C', 'Crop a photo'),
    s([], 'R', 'Clean up a photo'),
    s(['option','command'], 'R', 'Rotate a photo clockwise'),
    s(['command'], 'R', 'Rotate a photo counterclockwise'),
    s(['command'], 'E', 'Automatically enhance a photo'),
    s([], 'Right', 'Go to the next photo'),
    s([], 'Left', 'Go to the previous photo'),
    s([], 'Delete', 'Delete selected photos'),
    s(['command'], 'Delete', 'Delete without confirming'),
    s([], 'Z', 'Toggle between current zoom and 100 percent'),
    s(['command'], '+', 'Zoom in'),
    s(['command'], '-', 'Zoom out'),
    s(['command'], 'L', 'Hide a selected photo'),
    s(['command'], 'Z', 'Undo the last action'),
    s(['shift','command'], 'Z', 'Redo the last action'),
    s(['control'], 'M', 'Show unadjusted photo without edits'),
  ]},
  { name: 'Selection', shortcuts: [
    s(['command'], 'A', 'Select all photos'),
    s(['shift','command'], 'A', 'Deselect all photos'),
  ]},
  { name: 'Organization', shortcuts: [
    s(['command'], 'N', 'Create a new album'),
    s(['shift','command'], 'K', 'Set photo as key photo for album'),
    s(['option','command'], 'N', 'Create a Smart Album'),
    s(['shift','command'], 'N', 'Create a folder'),
    s(['control','command'], 'F', 'Enter or leave full-screen view'),
    s(['shift','command'], 'T', 'Show or hide titles'),
    s(['command'], 'I', 'Show or hide photo information'),
    s(['command'], 'D', 'Duplicate a photo'),
    s(['command'], 'X', 'Cut a photo'),
    s(['command'], 'C', 'Copy a photo'),
    s(['command'], 'V', 'Paste a photo'),
    s([], '.', 'Make a photo a favorite'),
    s(['command'], 'K', 'Show or hide the Keyword Manager'),
    s(['command'], 'Delete', 'Delete a photo from the library'),
    s([], 'Delete', 'Remove a photo from an album'),
  ]},
  { name: 'Import and Export', shortcuts: [
    s(['shift','command'], 'I', 'Import photos'),
    s(['shift','command'], 'E', 'Export photos'),
  ]},
  { name: 'General', shortcuts: [
    s(['command'], ',', 'Open settings'),
    s(['command'], 'W', 'Close a window and quit Photos'),
    s(['command'], 'M', 'Minimize the Photos window'),
    s(['command'], 'H', 'Hide the Photos app'),
    s(['command'], 'Q', 'Quit Photos'),
    s(['command'], 'P', 'Print'),
  ]},
]

const PODCASTS = [
  { name: 'General', shortcuts: [
    s(['command'], ',', 'Open Podcasts settings'),
    s(['command'], 'H', 'Hide Podcasts'),
    s(['option','command'], 'H', 'Hide everything except Podcasts'),
    s(['command'], 'Q', 'Quit Podcasts'),
    s(['command'], 'N', 'Create a new station'),
    s(['command'], 'W', 'Close the Podcasts window'),
    s(['fn'], 'F', 'Enter or exit full-screen view'),
    s(['command'], 'M', 'Minimize a window'),
    s(['command'], 'R', 'Refresh feed updates'),
    s(['command'], 'F', 'Search your library or all podcasts'),
    s(['command'], 'L', 'Go to the Show page'),
  ]},
  { name: 'Playback', shortcuts: [
    s([], 'Space', 'Start playing or pause'),
    s(['shift','command'], 'Right', 'Skip forward'),
    s(['shift','command'], 'Left', 'Skip backward'),
    s(['command'], 'Up', 'Increase the volume'),
    s(['command'], 'Down', 'Decrease the volume'),
    s(['option','command'], 'Up', 'Increase the playback speed'),
    s(['option','command'], 'Down', 'Decrease the playback speed'),
  ]},
]

const REMINDERS = [
  { name: 'General', shortcuts: [
    s(['command'], 'N', 'New Reminder'),
    s(['shift','command'], 'N', 'New List'),
    s(['option','command'], 'N', 'New Section'),
    s(['control','command'], 'N', 'New Section with Selection'),
    s(['command'], ']', 'Indent reminder'),
    s(['command'], '[', 'Outdent reminder'),
    s(['command'], 'E', 'Show all subtasks'),
    s(['shift','command'], 'E', 'Hide all subtasks'),
    s(['shift','command'], 'F', 'Flag or unflag reminder'),
    s(['command'], 'P', 'Print reminder list'),
    s(['option','command'], 'S', 'Hide or show sidebar'),
    s(['shift','command'], 'C', 'Mark reminder completed or incomplete'),
    s(['shift','command'], 'H', 'Show or hide completed reminders'),
    s([], 'Delete', 'Delete tag'),
    s(['command'], 'T', 'Set reminder as due today'),
    s(['option','command'], 'T', 'Set reminder as due tomorrow'),
    s(['control','command'], 'T', 'Set all overdue reminders as due today'),
    s(['command'], 'K', 'Set reminder as due this weekend'),
    s(['option','command'], 'K', 'Set reminder as due next week'),
    s(['control','command'], 'F', 'Enter or exit full screen'),
    s(['command'], 'W', 'Close and quit'),
    s(['command'], 'Q', 'Quit Reminders'),
  ]},
]

const PREVIEW = [
  { name: 'General', shortcuts: [
    s(['command'], 'S', 'Save a file'),
    s(['control'], 'Tab', 'Go to next tab'),
    s(['shift','control'], 'Tab', 'Go to previous tab'),
    s(['control','command'], 'F', 'Enter full screen'),
    s(['command'], 'P', 'Print'),
    s(['command'], 'C', 'Copy the selected text or area'),
    s(['command'], 'X', 'Cut the selected item'),
    s(['command'], 'V', 'Paste'),
    s([], 'Down', 'Scroll down a line'),
    s([], 'Up', 'Scroll up a line'),
    s([], 'Page Down', 'Scroll down one screen'),
    s([], 'Page Up', 'Scroll up one screen'),
    s(['option'], 'Page Down', 'Move to next document in window'),
    s(['option'], 'Page Up', 'Move to previous document in window'),
    s(['option'], 'Down', 'Move to next page'),
    s(['option'], 'Up', 'Move to previous page'),
    s(['option','command'], '0', 'Zoom all images to actual size'),
    s(['option','command'], '9', 'Zoom all images to fit'),
    s(['option','command'], '+', 'Zoom all images in'),
    s(['option','command'], '-', 'Zoom all images out'),
    s(['shift','command'], 'K', 'Remove the background'),
  ]},
]

const SAFARI = [
  { name: 'Scroll', shortcuts: [
    s([], 'Page Down', 'Scroll down a screen'),
    s([], 'Space', 'Scroll down a screen'),
    s([], 'Page Up', 'Scroll up a screen'),
    s(['shift'], 'Space', 'Scroll up a screen'),
    s(['command'], 'Up', 'Scroll to the top of the webpage'),
    s(['command'], 'Down', 'Scroll to the bottom of the webpage'),
  ]},
  { name: 'Current Webpage', shortcuts: [
    s(['command'], 'F', 'Search the current webpage'),
    s([], 'Tab', 'Highlight the next field or pop-up menu'),
    s(['option'], 'Tab', 'Highlight next clickable item'),
    s([], 'Escape', 'Restore the current webpage address'),
    s(['command'], 'L', 'Select the Smart Search field'),
    s(['command'], 'P', 'Print the current webpage'),
    s(['command'], 'C', 'Copy the selected item'),
    s(['command'], 'V', 'Paste the most recently copied item'),
  ]},
  { name: 'Tabs', shortcuts: [
    s(['shift','command'], '\\', 'Show tab overview'),
    s(['control'], 'Tab', 'Go to the next tab'),
    s(['control','shift'], 'Tab', 'Go to the previous tab'),
    s(['shift','command'], ']', 'Go to the next tab'),
    s(['shift','command'], '[', 'Go to the previous tab'),
    s(['command'], '9', 'Select your last tab'),
    s(['command'], 'W', 'Close the active tab'),
    s(['shift','command'], 'T', 'Reopen the last tab you closed'),
  ]},
  { name: 'Settings', shortcuts: [
    s(['shift','command'], 'H', 'Go to your homepage'),
    s(['command'], ',', 'Change Safari settings'),
  ]},
  { name: 'History', shortcuts: [
    s(['command'], '[', 'Go back to the previous webpage'),
    s(['command'], ']', 'Go forward to the next webpage'),
  ]},
  { name: 'Zoom', shortcuts: [
    s([], 'Escape', 'Exit full-screen view'),
    s(['command'], '+', 'Zoom website content in'),
    s(['command'], '-', 'Zoom website content out'),
  ]},
  { name: 'Window', shortcuts: [
    s(['command'], '`', 'Switch to another Safari window'),
    s(['shift','command'], 'T', 'Reopen the last window you closed'),
  ]},
  { name: 'Reading List', shortcuts: [
    s(['control','command'], '2', 'Show or Hide Reading List sidebar'),
    s(['shift','command'], 'D', 'Add the current webpage'),
    s(['shift','command'], 'R', 'Open Reader'),
    s([], 'Escape', 'Close Reader'),
  ]},
  { name: 'Bookmarks', shortcuts: [
    s(['control','command'], '1', 'Show or Hide Bookmarks sidebar'),
  ]},
]

const TERMINAL = [
  { name: 'Windows and Tabs', shortcuts: [
    s(['command'], 'N', 'New window'),
    s(['control','command'], 'N', 'New window with same command'),
    s(['command'], 'T', 'New tab'),
    s(['control','command'], 'T', 'New tab with same command'),
    s(['shift','command'], 'T', 'Show or hide tab bar'),
    s(['shift','command'], '\\', 'Show all tabs or exit tab overview'),
    s(['shift','command'], 'N', 'New command'),
    s(['shift','command'], 'K', 'New remote connection'),
    s(['command'], 'I', 'Show or hide Inspector'),
    s(['shift','command'], 'I', 'Edit title'),
    s(['option','command'], 'I', 'Edit background color'),
    s(['command'], '+', 'Make fonts bigger'),
    s(['command'], '-', 'Make fonts smaller'),
    s(['command'], '`', 'Next window'),
    s(['shift','command'], '~', 'Previous window'),
    s(['control'], 'Tab', 'Next Tab'),
    s(['control','shift'], 'Tab', 'Previous Tab'),
    s(['command'], 'D', 'Split window into two panes'),
    s(['shift','command'], 'D', 'Close split pane'),
    s(['command'], 'W', 'Close tab'),
    s(['shift','command'], 'W', 'Close window'),
    s(['option','command'], 'W', 'Close other tabs'),
    s(['option','shift','command'], 'W', 'Close all'),
    s(['command'], 'Home', 'Scroll to top'),
    s(['command'], 'End', 'Scroll to bottom'),
    s(['command'], 'Page Up', 'Page up'),
    s(['command'], 'Page Down', 'Page down'),
    s(['option','command'], 'Page Up', 'Line up'),
    s(['option','command'], 'Page Down', 'Line down'),
  ]},
  { name: 'Command Line', shortcuts: [
    s(['control'], 'A', 'Move insertion point to beginning of line'),
    s(['control'], 'E', 'Move insertion point to end of line'),
    s([], 'Right', 'Move forward one character'),
    s([], 'Left', 'Move backward one character'),
    s(['option'], 'Right', 'Move forward one word'),
    s(['option'], 'Left', 'Move backward one word'),
    s(['control'], 'U', 'Delete the line'),
    s(['control'], 'K', 'Delete to the end of the line'),
    s(['option'], 'D', 'Delete forward to end of word'),
    s(['control'], 'W', 'Delete backward to beginning of word'),
    s([], 'Delete', 'Delete one character'),
    s(['control'], 'T', 'Transpose two characters'),
  ]},
  { name: 'Select and Find', shortcuts: [
    s(['command'], 'X', 'Cut'),
    s(['command'], 'C', 'Copy'),
    s(['control','shift','command'], 'C', 'Copy without background color'),
    s(['option','shift','command'], 'C', 'Copy plain text'),
    s(['command'], 'V', 'Paste'),
    s(['shift','command'], 'V', 'Paste the selection'),
    s(['control','command'], 'V', 'Paste escaped text'),
    s(['control','shift','command'], 'V', 'Paste escaped selection'),
    s(['command'], 'F', 'Find'),
    s(['command'], 'G', 'Find next'),
    s(['shift','command'], 'G', 'Find previous'),
    s(['command'], 'E', 'Find using the selected text'),
    s(['command'], 'J', 'Jump to the selected text'),
    s(['command'], 'A', 'Select all'),
    s(['control','command'], 'Space', 'Open the character viewer'),
  ]},
  { name: 'Marks and Bookmarks', shortcuts: [
    s(['command'], 'U', 'Mark'),
    s(['option','command'], 'U', 'Mark as bookmark'),
    s(['shift','command'], 'U', 'Unmark'),
    s(['command'], 'Enter', 'Mark line and send return'),
    s(['shift','command'], 'Enter', 'Send return without marking'),
    s(['shift','command'], 'M', 'Insert bookmark'),
    s(['option','shift','command'], 'M', 'Insert bookmark with name'),
    s(['command'], 'Up', 'Jump to previous mark'),
    s(['command'], 'Down', 'Jump to next mark'),
    s(['option','command'], 'Up', 'Jump to previous bookmark'),
    s(['option','command'], 'Down', 'Jump to next bookmark'),
    s(['command'], 'L', 'Clear to previous mark'),
    s(['option','command'], 'L', 'Clear to previous bookmark'),
    s(['command'], 'K', 'Clear to start'),
    s(['shift','command'], 'A', 'Select between marks'),
  ]},
  { name: 'Other', shortcuts: [
    s(['control','command'], 'F', 'Enter or exit full screen'),
    s(['shift','command'], 'C', 'Show or hide colors'),
    s(['command'], ',', 'Open Terminal settings'),
    s(['command'], '.', 'Break (equivalent to Control-C)'),
    s(['command'], 'P', 'Print'),
    s(['option','command'], 'R', 'Soft reset terminal emulator'),
    s(['control','option','command'], 'R', 'Hard reset terminal emulator'),
    s(['command'], 'S', 'Export text as'),
    s(['shift','command'], 'S', 'Export selected text as'),
    s(['control'], 'R', 'Reverse search command history'),
    s(['command'], 'R', 'Toggle Allow Mouse Reporting'),
    s(['command'], 'O', 'Toggle Use Option as Meta Key'),
    s(['shift','command'], 'Down', 'Show alternate screen'),
    s(['shift','command'], 'Up', 'Hide alternate screen'),
  ]},
]

const SPOTLIGHT = [
  { name: 'General', shortcuts: [
    s(['command'], 'Space', 'Open or close the Spotlight window'),
    s([], 'Space', 'Open a search result in Quick Look'),
    s([], 'Down', 'Move to the next result'),
    s([], 'Up', 'Move to the previous result'),
    s([], 'Enter', 'Open a result'),
    s(['command'], 'R', 'See a file in an app or the Finder'),
    s(['option','command'], 'Space', 'Open Finder with search field selected'),
  ]},
  { name: 'Filters', shortcuts: [
    s(['command'], '1', 'Search Applications'),
    s(['command'], '2', 'Search Files'),
    s(['command'], '3', 'Search Actions'),
    s(['command'], '4', 'Search Clipboard'),
  ]},
]

const VOICE_MEMOS = [
  { name: 'General', shortcuts: [
    s(['command'], 'N', 'Create a recording'),
    s([], 'Space', 'Play or pause a recording'),
    s(['command'], 'D', 'Duplicate a recording'),
    s(['shift','command'], 'E', 'Enhance a recording'),
    s(['shift','command'], 'X', 'Skip silence in a recording'),
    s(['command'], 'T', 'Trim a recording'),
    s([], 'Delete', 'Delete a recording'),
    s(['command'], 'S', 'Save a recording'),
    s(['command'], 'Left', 'Jump backward 15 seconds'),
    s(['command'], 'Right', 'Jump forward 15 seconds'),
    s(['command'], 'Z', 'Undo'),
    s(['shift','command'], 'Z', 'Redo'),
    s(['command'], ',', 'Open Voice Memos settings'),
    s(['control','command'], 'S', 'Show or hide the sidebar'),
    s(['command'], 'M', 'Minimize the window'),
    s(['command'], 'H', 'Hide Voice Memos'),
    s(['option','command'], 'H', 'Hide everything except Voice Memos'),
    s(['control','command'], 'F', 'Enter full-screen view'),
    s([], 'Escape', 'Exit full-screen view'),
    s(['command'], 'Q', 'Quit Voice Memos'),
  ]},
]

// ── URLs ────────────────────────────────────────────────────

const DOCS_URLS = {
  'imovie': 'https://support.apple.com/en-ca/guide/imovie/movd9d8f91e8/mac',
  'keynote': 'https://support.apple.com/en-ca/guide/keynote/tanfde4a3e6d/mac',
  'mail': 'https://support.apple.com/en-ca/guide/mail/mlhlb94f262b/mac',
  'maps': 'https://support.apple.com/en-ca/guide/maps/mps36380d1ed/mac',
  'messages': 'https://support.apple.com/en-ca/guide/messages/ichtc78b3bff/mac',
  'music': 'https://support.apple.com/en-ca/guide/music/mus1019/mac',
  'news': 'https://support.apple.com/en-ca/guide/news/iphc13bdbe67/mac',
  'notes': 'https://support.apple.com/en-ca/guide/notes/apd46c25187e/mac',
  'numbers': 'https://support.apple.com/en-ca/guide/numbers/tana45192591/mac',
  'pages': 'https://support.apple.com/en-ca/guide/pages/tanc0ffef022/mac',
  'photos': 'https://support.apple.com/en-ca/guide/photos/pht9b4411b24/mac',
  'podcasts': 'https://support.apple.com/en-ca/guide/podcasts/podcd31cff4/mac',
  'reminders': 'https://support.apple.com/en-ca/guide/reminders/remn19b3424c/mac',
  'preview': 'https://support.apple.com/en-ca/guide/preview/cpprvw0003/mac',
  'safari': 'https://support.apple.com/en-ca/guide/safari/cpsh003/mac',
  'spotlight': 'https://support.apple.com/en-ca/guide/mac-help/mh26783/mac',
  'terminal': 'https://support.apple.com/en-ca/guide/terminal/trmlshtcts/mac',
  'voice-memos': 'https://support.apple.com/en-ca/guide/voice-memos/vm5b49792b0d/mac',
}

// ── Main ────────────────────────────────────────────────────

async function main() {
  console.log('Starting Apple docs sync...\n')
  let grandCreated = 0, grandUpdated = 0

  const apps = [
    // New apps
    { slug: 'imovie', name: 'iMovie', cat: 'apple-apps', sections: IMOVIE },
    { slug: 'maps', name: 'Maps', cat: 'apple-apps', sections: MAPS },
    { slug: 'news', name: 'News', cat: 'apple-apps', sections: NEWS },
    { slug: 'podcasts', name: 'Podcasts', cat: 'apple-apps', sections: PODCASTS },
    { slug: 'voice-memos', name: 'Voice Memos', cat: 'apple-apps', sections: VOICE_MEMOS },
    { slug: 'spotlight', name: 'Spotlight', cat: 'macos-system', sections: SPOTLIGHT },
    // Existing apps to update
    { slug: 'keynote', name: 'Keynote', cat: 'apple-apps', sections: KEYNOTE },
    { slug: 'mail', name: 'Mail', cat: 'apple-apps', sections: MAIL },
    { slug: 'messages', name: 'Messages', cat: 'apple-apps', sections: MESSAGES },
    { slug: 'music', name: 'Music', cat: 'apple-apps', sections: MUSIC },
    { slug: 'notes', name: 'Notes', cat: 'apple-apps', sections: NOTES },
    { slug: 'numbers', name: 'Numbers', cat: 'apple-apps', sections: NUMBERS },
    { slug: 'pages', name: 'Pages', cat: 'apple-apps', sections: PAGES },
    { slug: 'photos', name: 'Photos', cat: 'apple-apps', sections: PHOTOS },
    { slug: 'podcasts', name: 'Podcasts', cat: 'apple-apps', sections: PODCASTS },
    { slug: 'reminders', name: 'Reminders', cat: 'apple-apps', sections: REMINDERS },
    { slug: 'preview', name: 'Preview', cat: 'apple-apps', sections: PREVIEW },
    { slug: 'safari', name: 'Safari', cat: 'apple-apps', sections: SAFARI },
    { slug: 'terminal', name: 'Terminal', cat: 'apple-apps', sections: TERMINAL },
  ]

  // Deduplicate by slug (podcasts appears twice above)
  const seen = new Set()
  const uniqueApps = apps.filter(a => {
    if (seen.has(a.slug)) return false
    seen.add(a.slug)
    return true
  })

  for (const app of uniqueApps) {
    const { created, updated } = await processApp(
      app.slug, app.name, app.cat, DOCS_URLS[app.slug], app.sections
    )
    grandCreated += created
    grandUpdated += updated
  }

  console.log(`\n${'='.repeat(50)}`)
  console.log(`TOTAL: ${grandCreated} shortcuts created, ${grandUpdated} updated`)
  console.log(`Apps processed: ${uniqueApps.length}`)
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
