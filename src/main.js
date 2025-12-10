import './style.css'
import { firstNames, middleNames, lastNames } from './data/horseNames.js'

const MAX_LENGTH = 18
const INVENTORY_LIMIT = 6
const STORAGE_KEY = 'super-honse-state'

const BODY_PARTS = [
  { key: 'lfLeg', label: 'Left Front Leg' },
  { key: 'rfLeg', label: 'Right Front Leg' },
  { key: 'lbLeg', label: 'Left Back Leg' },
  { key: 'rbLeg', label: 'Right Back Leg' },
  { key: 'heart', label: 'Heart' },
  { key: 'lungs', label: 'Lungs' }
]

const TEMPERAMENTS = ['Stoic', 'Combative', 'Mercurial', 'Steady', 'Alert', 'Playful']
const COAT_COLORS = [
  'Bay',
  'Chestnut',
  'Dapple Gray',
  'Black',
  'Blue Roan',
  'Palomino',
  'Buckskin',
  'Cremello',
  'Seal Brown',
  'Sooty Bay'
]
const TRACK_TYPES = ['Dirt', 'Turf', 'Synthetic']
const TRACK_GOINGS = ['Fast', 'Firm', 'Good', 'Yielding', 'Soft', 'Sloppy', 'Heavy']
const LEANING_FLAGS = ['Leans Inside Rail', 'Leans Outside Rail', 'Holds Center Line', 'Drifts Late Inside', 'Drifts Late Outside']
const DISEASE_FLAGS = [
  'Clean Bill of Health',
  'Seasonal Cough',
  'Bleeder Watch',
  'Mild Colic Watch',
  'Hoof Thrush Treatment',
  'Respiratory Quarantine'
]
const NATURE_FLAGS = ['Combatative', 'Calculating', 'Eager', 'Relaxed', 'Broody']
const STATUS_CAP = 4

const KNIGHT_ICON = '♞'

const TRACK_DIRECTORY = [
  { name: 'Arcana Cross Course', surface: 'Dirt', region: 'Obsidian Basin Territory', goings: ['Fast', 'Good', 'Muddy'] },
  { name: 'Veilwater Meadows', surface: 'Turf', region: 'Luminous Sound Flats', goings: ['Firm', 'Good', 'Yielding'] },
  { name: 'Mirage Halo Circuit', surface: 'Synthetic', region: 'Sunstep Plateau Range', goings: ['Fast', 'Good', 'Slow'] },
  { name: 'Starwright Downs', surface: 'Dirt', region: 'Astral Prairie Union', goings: ['Fast', 'Sloppy', 'Heavy'] },
  { name: 'Moonfen Fields', surface: 'Turf', region: 'Gossamer Marsh Reach', goings: ['Firm', 'Soft', 'Heavy'] },
  { name: 'Crystal Loom Track', surface: 'Synthetic', region: 'Auric Valley Annex', goings: ['Fast', 'Good', 'Slow'] }
]

const RACE_PROGRAM = [
  { name: "Fool's Gambit Stakes", type: 'Sprint', distance: '6f', grade: 'Grade III', surface: 'Dirt' },
  { name: 'High Priestess Dash', type: 'Sprint', distance: '7f', grade: 'Grade II', surface: 'Turf' },
  { name: 'Chariot Mile', type: 'Mile', distance: '1m', grade: 'Grade I', surface: 'Dirt' },
  { name: 'Lovers Link Mile', type: 'Mile', distance: '1m', grade: 'Grade III', surface: 'Synthetic' },
  { name: 'Wheel of Fortune Classic', type: 'Medium', distance: '1 1/16m', grade: 'Grade II', surface: 'Dirt' },
  { name: 'Hermit Lantern Route', type: 'Medium', distance: '1 1/8m', grade: 'Grade I', surface: 'Turf' },
  { name: 'Tower Vigil Marathon', type: 'Long', distance: '1 1/2m', grade: 'Grade I', surface: 'Turf' },
  { name: 'World Arc Handicap', type: 'Long', distance: '1 3/8m', grade: 'Grade III', surface: 'Synthetic' },
  { name: 'Starseer Cup', type: 'Medium', distance: '1 3/16m', grade: 'Grade II', surface: 'Synthetic' },
  { name: 'Moonlit Arcana Stakes', type: 'Sprint', distance: '5 1/2f', grade: 'Grade III', surface: 'Turf' }
]

const purseFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
})

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const isValidEntry = (entry) =>
  Boolean(
    entry &&
      typeof entry === 'object' &&
      typeof entry.first === 'string' &&
      typeof entry.middle === 'string' &&
      typeof entry.last === 'string' &&
      typeof entry.label === 'string'
  )

const isValidHorse = (horse) =>
  Boolean(
    horse &&
      typeof horse === 'object' &&
      isValidEntry(horse.identity) &&
      horse.stats &&
      Array.isArray(horse.stats.bodyMap) &&
      typeof horse.stats.temperament === 'string'
  )

const pickRandom = (list) => list[Math.floor(Math.random() * list.length)]

const splitToken = (token = '') =>
  token
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

const getLeadingWord = (token) => splitToken(token)[0] ?? token
const getTrailingWord = (token) => {
  const parts = splitToken(token)
  return parts[parts.length - 1] ?? token
}

const pickWeighted = (options) => {
  const total = options.reduce((sum, option) => sum + option.weight, 0)
  let roll = Math.random() * total
  for (const option of options) {
    roll -= option.weight
    if (roll <= 0) {
      return option.value
    }
  }
  return options[options.length - 1].value
}

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randomPercent = (min = 55, max = 99) => randomInt(min, max)
const randomFloat = (min, max, decimals = 1) => Number((Math.random() * (max - min) + min).toFixed(decimals))
const formatPurse = (value = 0) => purseFormatter.format(value)

const createHorseId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `horse-${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

const pickTrackBySurface = (surface) => {
  const options = TRACK_DIRECTORY.filter((track) => track.surface === surface)
  const track = options.length ? pickRandom(options) : pickRandom(TRACK_DIRECTORY)
  const going = pickRandom(track.goings)
  return { ...track, going }
}

const buildRaceAssignment = () => {
  const race = pickRandom(RACE_PROGRAM)
  const track = pickTrackBySurface(race.surface)
  return { race, track }
}

const ensureHorseSchema = (horse) => {
  if (!horse.stats.height) {
    horse.stats.height = `${randomFloat(15, 17.2, 1)} hh`
  }
  if (typeof horse.stats.totalPurse !== 'number') {
    horse.stats.totalPurse = 0
  }
  if (!horse.stats.campaign) {
    horse.stats.campaign = buildRaceAssignment()
  }
  if (!horse.stats.preferredTrack) {
    horse.stats.preferredTrack = horse.stats.campaign?.track.surface ?? pickRandom(TRACK_TYPES)
  }
  if (!horse.stats.preferredGoing) {
    horse.stats.preferredGoing = horse.stats.campaign?.track.going ?? pickRandom(TRACK_GOINGS)
  }
  return horse
}

const buildBodyMap = () =>
  BODY_PARTS.map((part) => ({
    ...part,
    conformation: randomPercent(62, 98),
    strength: randomPercent(55, 100),
    stamina: randomPercent(50, 100)
  }))

const buildStatusPack = (herd) => {
  const statuses = new Set()
  statuses.add(Math.random() < 0.6 ? 'Combatative' : pickRandom(NATURE_FLAGS))
  statuses.add(pickRandom(LEANING_FLAGS))
  if (herd.length) {
    const rival = pickRandom(herd)
    statuses.add(`Rivals ${rival.identity.label}`)
  } else {
    statuses.add('Rivalry Pending')
  }
  statuses.add(pickRandom(DISEASE_FLAGS))
  return Array.from(statuses).slice(0, STATUS_CAP)
}

const buildHorseStats = (herd) => {
  const campaign = buildRaceAssignment()
  return {
    bodyMap: buildBodyMap(),
    temperament: pickRandom(TEMPERAMENTS),
    strideLength: `${randomFloat(22, 28, 1)} ft`,
    width: `${randomFloat(25, 33, 1)} in`,
    height: `${randomFloat(15, 17.2, 1)} hh`,
    age: randomInt(2, 12),
    totalPurse: 0,
    coatColor: pickRandom(COAT_COLORS),
    preferredTrack: campaign.track.surface,
    preferredGoing: campaign.track.going,
    campaign,
    statuses: buildStatusPack(herd)
  }
}

const middleWordPool = (() => {
  const extras = ['Over', 'of', 'from', 'Under', 'by', 'upon']
  const trimmed = middleNames
    .map((entry) => getLeadingWord(entry))
    .filter((word) => word && word.length <= 7)
  const pool = Array.from(new Set([...extras, ...trimmed]))
  return pool.length ? pool : extras
})()

const buildCandidate = () => {
  const structure = pickWeighted([
    { value: 'doubleSpace', weight: 0.4 },
    { value: 'doubleFlush', weight: 0.4 },
    { value: 'triple', weight: 0.2 }
  ])

  if (structure === 'triple') {
    const firstBase = pickRandom(firstNames)
    const lastBase = pickRandom(lastNames)
    const first = getLeadingWord(firstBase)
    const middle = pickRandom(middleWordPool)
    const last = getTrailingWord(lastBase)
    const label = `${first} ${middle} ${last}`.replace(/\s+/g, ' ').trim()
    return { first, middle, last, label }
  }

  const firstBase = pickRandom(firstNames)
  const lastBase = pickRandom(lastNames)
  const first = getLeadingWord(firstBase)
  const last = getTrailingWord(lastBase)

  if (structure === 'doubleFlush') {
    const loweredLast = last.replace(/\s+/g, '').toLowerCase()
    const label = `${first}${loweredLast}`
    return { first, middle: '', last: loweredLast, label }
  }

  const spacedLabel = `${first} ${last}`.replace(/\s+/g, ' ').trim()
  return { first, middle: '', last, label: spacedLabel }
}

const composeName = (previousLabel = '') => {
  for (let attempt = 0; attempt < 400; attempt += 1) {
    const candidate = buildCandidate()
    if (candidate.label.length <= MAX_LENGTH && candidate.label !== previousLabel) {
      return candidate
    }
  }

  const fallbackFirst = getLeadingWord(firstNames[0] ?? 'Atlas')
  const fallbackLast = getTrailingWord(lastNames[0] ?? 'Field')
  const fallbackLabel = `${fallbackFirst} ${fallbackLast}`.trim()
  return { first: fallbackFirst, middle: '', last: fallbackLast, label: fallbackLabel }
}

const composeHorse = (herd, previousLabel = '') =>
  ensureHorseSchema({
    id: createHorseId(),
    identity: composeName(previousLabel),
    stats: buildHorseStats(herd)
  })

const app = document.querySelector('#app')

app.innerHTML = `
  <main class="frame">
    <header class="masthead">
      <p class="eyebrow">Super Honse Registry</p>
      <h1>Stable Command Deck</h1>
      <p class="lede">Mint a horse, then inspect its stats and statuses.</p>
    </header>
    <section class="name-panel">
      <p id="current-name" class="name-display">Press Mint</p>
      <button id="mint-button" class="mint-button" type="button">Mint Horse</button>
      <span class="char-cap">≤${MAX_LENGTH} chars</span>
    </section>
    <section class="horse-vitals" id="horse-vitals">
      <div class="horse-identity">
        <span class="horse-avatar" aria-hidden="true">${KNIGHT_ICON}</span>
        <div>
          <p class="horse-label" id="horse-label">Awaiting Registration</p>
          <p class="horse-meta" id="horse-meta">No stats yet</p>
        </div>
      </div>
      <dl class="vital-grid">
        <div><dt>Temperament</dt><dd id="vital-temperament">—</dd></div>
        <div><dt>Stride Length</dt><dd id="vital-stride">—</dd></div>
        <div><dt>Horse Width</dt><dd id="vital-width">—</dd></div>
        <div><dt>Height</dt><dd id="vital-height">—</dd></div>
        <div><dt>Age</dt><dd id="vital-age">—</dd></div>
        <div><dt>Coat Color</dt><dd id="vital-coat">—</dd></div>
        <div><dt>Track Type</dt><dd id="vital-track">—</dd></div>
        <div><dt>Track Going</dt><dd id="vital-going">—</dd></div>
        <div><dt>Total Purse</dt><dd id="vital-purse">$0</dd></div>
      </dl>
    </section>
    <section class="race-card">
      <div class="section-head">
        <h2>Race Card</h2>
        <p>US Graded Stakes tiers</p>
      </div>
      <dl class="race-grid">
        <div><dt>Race</dt><dd id="race-name">—</dd></div>
        <div><dt>Grade</dt><dd id="race-grade">—</dd></div>
        <div><dt>Type & Distance</dt><dd id="race-distance">—</dd></div>
        <div><dt>Track</dt><dd id="race-track">—</dd></div>
        <div><dt>Surface</dt><dd id="race-surface">—</dd></div>
        <div><dt>Going</dt><dd id="race-going">—</dd></div>
        <div><dt>Region</dt><dd id="race-region">—</dd></div>
      </dl>
    </section>
    <section class="body-metrics">
      <div class="section-head">
        <h2>Body Map</h2>
        <p>Per-limb conformation, strength, stamina</p>
      </div>
      <table class="body-table">
        <thead>
          <tr>
            <th>Part</th>
            <th>Conformation</th>
            <th>Strength</th>
            <th>Stamina</th>
          </tr>
        </thead>
        <tbody id="body-table"></tbody>
      </table>
      <div class="status-block">
        <h3>Status Flags</h3>
        <ul id="status-list" class="status-list"></ul>
      </div>
    </section>
    <section class="inventory">
      <div class="inventory-head">
        <h2>Stable Inventory</h2>
        <p>Tracking last ${INVENTORY_LIMIT}</p>
      </div>
      <ul id="inventory-list" class="inventory-grid"></ul>
    </section>
  </main>
`

const currentNameEl = document.getElementById('current-name')
const mintButton = document.getElementById('mint-button')
const horseLabelEl = document.getElementById('horse-label')
const horseMetaEl = document.getElementById('horse-meta')
const vitalTemperamentEl = document.getElementById('vital-temperament')
const vitalStrideEl = document.getElementById('vital-stride')
const vitalWidthEl = document.getElementById('vital-width')
const vitalHeightEl = document.getElementById('vital-height')
const vitalAgeEl = document.getElementById('vital-age')
const vitalCoatEl = document.getElementById('vital-coat')
const vitalTrackEl = document.getElementById('vital-track')
const vitalGoingEl = document.getElementById('vital-going')
const vitalPurseEl = document.getElementById('vital-purse')
const bodyTableEl = document.getElementById('body-table')
const statusListEl = document.getElementById('status-list')
const inventoryList = document.getElementById('inventory-list')
const raceNameEl = document.getElementById('race-name')
const raceGradeEl = document.getElementById('race-grade')
const raceDistanceEl = document.getElementById('race-distance')
const raceTrackEl = document.getElementById('race-track')
const raceSurfaceEl = document.getElementById('race-surface')
const raceGoingEl = document.getElementById('race-going')
const raceRegionEl = document.getElementById('race-region')

const stable = []
let lastMint = null
let activeHorse = null

const persistState = () => {
  if (!canUseStorage()) {
    return
  }
  const snapshot = {
    stable,
    lastMint
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
}

const hydrateFromStorage = () => {
  if (!canUseStorage()) {
    return false
  }
  const serialized = window.localStorage.getItem(STORAGE_KEY)
  if (!serialized) {
    return false
  }
  try {
    const parsed = JSON.parse(serialized)
    const storedStable = Array.isArray(parsed.stable)
      ? parsed.stable
          .filter((entry) => isValidHorse(entry))
          .slice(0, INVENTORY_LIMIT)
          .map((entry) => ensureHorseSchema(entry))
      : []

    if (!storedStable.length) {
      return false
    }

    stable.length = 0
    stable.push(...storedStable)
    lastMint = isValidEntry(parsed.lastMint) ? parsed.lastMint : stable[0].identity
    activeHorse = stable[0]
    renderHorseDetails(activeHorse)
    renderInventory()
    return true
  } catch (error) {
    console.warn('Failed to hydrate honse state', error)
    return false
  }
}

const renderBodyTable = (horse) => {
  bodyTableEl.innerHTML = ''
  if (!horse) {
    const emptyRow = document.createElement('tr')
    emptyRow.innerHTML = '<td colspan="4" class="body-empty">No anatomy logged. Mint a horse.</td>'
    bodyTableEl.appendChild(emptyRow)
    return
  }
  horse.stats.bodyMap.forEach((part) => {
    const row = document.createElement('tr')
    row.innerHTML = `
      <td>${part.label}</td>
      <td>${part.conformation}%</td>
      <td>${part.strength}%</td>
      <td>${part.stamina}%</td>
    `
    bodyTableEl.appendChild(row)
  })
}

const renderStatuses = (horse) => {
  statusListEl.innerHTML = ''
  if (!horse) {
    const placeholder = document.createElement('li')
    placeholder.className = 'status-empty'
    placeholder.textContent = 'Mint a horse to track statuses.'
    statusListEl.appendChild(placeholder)
    return
  }
  horse.stats.statuses.forEach((status) => {
    const item = document.createElement('li')
    item.textContent = status
    statusListEl.appendChild(item)
  })
}

const renderRaceCard = (horse) => {
  if (!horse || !horse.stats.campaign) {
    raceNameEl.textContent = 'Unassigned'
    raceGradeEl.textContent = '—'
    raceDistanceEl.textContent = '—'
    raceTrackEl.textContent = '—'
    raceSurfaceEl.textContent = '—'
    raceGoingEl.textContent = '—'
    raceRegionEl.textContent = '—'
    return
  }
  const { race, track } = horse.stats.campaign
  raceNameEl.textContent = race.name
  raceGradeEl.textContent = race.grade
  raceDistanceEl.textContent = `${race.type} • ${race.distance}`
  raceTrackEl.textContent = track.name
  raceSurfaceEl.textContent = `${track.surface}`
  raceGoingEl.textContent = track.going
  raceRegionEl.textContent = track.region
}

const renderHorseDetails = (horse) => {
  if (!horse) {
    currentNameEl.textContent = 'Press Mint'
    horseLabelEl.textContent = 'Awaiting Registration'
    horseMetaEl.textContent = 'No stats yet'
    vitalTemperamentEl.textContent = '—'
    vitalStrideEl.textContent = '—'
    vitalWidthEl.textContent = '—'
    vitalHeightEl.textContent = '—'
    vitalAgeEl.textContent = '—'
    vitalCoatEl.textContent = '—'
    vitalTrackEl.textContent = '—'
    vitalGoingEl.textContent = '—'
    vitalPurseEl.textContent = '$0'
    renderBodyTable(null)
    renderStatuses(null)
    renderRaceCard(null)
    return
  }

  currentNameEl.textContent = horse.identity.label
  horseLabelEl.textContent = horse.identity.label
  horseMetaEl.textContent = `${horse.stats.age} yrs • ${horse.stats.coatColor}`
  vitalTemperamentEl.textContent = horse.stats.temperament
  vitalStrideEl.textContent = horse.stats.strideLength
  vitalWidthEl.textContent = horse.stats.width
  vitalHeightEl.textContent = horse.stats.height ?? '—'
  vitalAgeEl.textContent = `${horse.stats.age}`
  vitalCoatEl.textContent = horse.stats.coatColor
  vitalTrackEl.textContent = horse.stats.preferredTrack
  vitalGoingEl.textContent = horse.stats.preferredGoing
  vitalPurseEl.textContent = formatPurse(horse.stats.totalPurse ?? 0)
  renderBodyTable(horse)
  renderStatuses(horse)
  renderRaceCard(horse)
}

const renderInventory = () => {
  inventoryList.innerHTML = ''
  if (!stable.length) {
    const empty = document.createElement('li')
    empty.className = 'inventory-empty'
    empty.textContent = 'Mint a horse to populate the stable.'
    inventoryList.appendChild(empty)
    return
  }

  stable.forEach((horse) => {
    const card = document.createElement('li')
    card.className = 'inventory-card'
    card.innerHTML = `
      <span class="horse-avatar small" aria-hidden="true">${KNIGHT_ICON}</span>
      <div class="inventory-copy">
        <p class="inventory-label">${horse.identity.label}</p>
        <p class="inventory-meta">${horse.stats.age} yrs • ${horse.stats.temperament} • ${
      horse.stats.preferredTrack
    }/${horse.stats.preferredGoing}</p>
        <p class="inventory-meta subtle">${
          horse.stats.campaign
            ? `${horse.stats.campaign.race.grade} • ${horse.stats.campaign.race.name}`
            : 'Race TBD'
        }</p>
        <div class="inventory-status-chips">
          ${horse.stats.statuses
            .slice(0, 3)
            .map((status) => `<span class="chip">${status}</span>`)
            .join('')}
        </div>
      </div>
    `
    card.addEventListener('click', () => {
      activeHorse = horse
      renderHorseDetails(activeHorse)
    })
    inventoryList.appendChild(card)
  })
}

const mintHorse = () => {
  const horse = composeHorse(stable, lastMint?.label ?? '')
  lastMint = horse.identity
  stable.unshift(horse)
  if (stable.length > INVENTORY_LIMIT) {
    stable.pop()
  }
  activeHorse = horse
  renderHorseDetails(activeHorse)
  renderInventory()
  persistState()
}

mintButton.addEventListener('click', () => {
  mintButton.disabled = true
  mintHorse()
  setTimeout(() => {
    mintButton.disabled = false
  }, 200)
})

renderHorseDetails(null)
renderInventory()
const hydrated = hydrateFromStorage()
if (!hydrated) {
  mintHorse()
}
