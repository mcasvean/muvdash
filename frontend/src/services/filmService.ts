export interface Film {
  id: string
  title?: string | null
  image?: string | null
  movie_banner?: string | null
  release_date?: string | null
  producer?: string | null
  director?: string | null
  description?: string | null
  running_time?: string | null
  rt_score?: string | null
  people?: unknown
  species?: unknown
  locations?: unknown
  vehicles?: unknown
}

export type RelatedCategory = 'people' | 'species' | 'locations' | 'vehicles'

export interface RelatedField {
  label: string
  value: string
}

export interface RelatedEntity {
  name?: string
  fields: RelatedField[]
}

export type RelatedFilmData = Record<RelatedCategory, RelatedEntity[]>

const FILMS_ENDPOINT = 'https://ghibliapi.vercel.app/films'
const GHIBLI_API_ORIGIN = 'https://ghibliapi.vercel.app'

const RELATED_CATEGORIES: RelatedCategory[] = ['people', 'species', 'locations', 'vehicles']

const RELATED_DISPLAY_FIELDS: Record<RelatedCategory, Array<{ key: string; label: string }>> = {
  people: [
    { key: 'name', label: 'Name' },
    { key: 'gender', label: 'Gender' },
    { key: 'age', label: 'Age' },
    { key: 'eye_color', label: 'Eye color' },
    { key: 'hair_color', label: 'Hair color' },
  ],
  species: [
    { key: 'name', label: 'Name' },
    { key: 'classification', label: 'Classification' },
    { key: 'eye_color', label: 'Eye color' },
    { key: 'hair_color', label: 'Hair color' },
  ],
  locations: [
    { key: 'name', label: 'Name' },
    { key: 'climate', label: 'Climate' },
    { key: 'terrain', label: 'Terrain' },
    { key: 'surface_water', label: 'Surface water' },
  ],
  vehicles: [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'vehicle_class', label: 'Vehicle class' },
    { key: 'length', label: 'Length' },
  ],
}

function isFilmField(value: unknown): value is string | null | undefined {
  return value === undefined || value === null || typeof value === 'string'
}

function isDisplayableText(value: unknown): value is string {
  if (typeof value !== 'string') return false

  const text = value.trim()
  return (
    text.length > 0 &&
    !/^(?:https?|ftp):\/\//i.test(text) &&
    !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(text)
  )
}

function isFilm(value: unknown): value is Film {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  const film = value as Record<string, unknown>
  const optionalStringFields = [
    'title',
    'image',
    'movie_banner',
    'release_date',
    'producer',
    'director',
    'description',
    'running_time',
    'rt_score',
  ]

  return (
    typeof film.id === 'string' && optionalStringFields.every((field) => isFilmField(film[field]))
  )
}

function isFilmArray(value: unknown): value is Film[] {
  if (!Array.isArray(value)) {
    return false
  }

  const ids = new Set<string>()

  for (const film of value) {
    if (!isFilm(film) || film.id.trim() === '' || ids.has(film.id)) {
      return false
    }

    ids.add(film.id)
  }

  return true
}

export async function fetchFilms(): Promise<Film[]> {
  const response = await fetch(FILMS_ENDPOINT)

  if (!response.ok) {
    throw new Error(`Film catalog request failed: ${response.status}`)
  }

  const films: unknown = await response.json()

  if (!isFilmArray(films)) {
    throw new Error('Film catalog response contained invalid film records')
  }

  return films
}

function getRelatedResourceUrls(value: unknown, category: RelatedCategory): string[] {
  if (!Array.isArray(value)) return []

  const urls = value.filter((reference): reference is string => {
    if (typeof reference !== 'string') return false

    try {
      const url = new URL(reference)
      const pathSegments = url.pathname.split('/').filter(Boolean)

      return (
        url.origin === GHIBLI_API_ORIGIN &&
        url.protocol === 'https:' &&
        !url.username &&
        !url.password &&
        !url.search &&
        !url.hash &&
        pathSegments.length === 2 &&
        pathSegments[0] === category &&
        /^[\da-z_-]+$/i.test(pathSegments[1] ?? '')
      )
    } catch {
      return false
    }
  })

  return [...new Set(urls)]
}

async function fetchRelatedResource(url: string): Promise<unknown> {
  const response = await fetch(url, { redirect: 'error' })

  if (!response.ok) {
    throw new Error(`Related film resource request failed: ${response.status}`)
  }

  return (await response.json()) as unknown
}

function normalizeRelatedEntity(value: unknown, category: RelatedCategory): RelatedEntity | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null

  const resource = value as Record<string, unknown>
  let name: string | undefined
  const fields: RelatedField[] = []

  for (const { key, label } of RELATED_DISPLAY_FIELDS[category]) {
    const rawValue = resource[key]
    const displayValue =
      typeof rawValue === 'number' && Number.isFinite(rawValue)
        ? String(rawValue)
        : isDisplayableText(rawValue)
          ? rawValue.trim()
          : undefined

    if (!displayValue) continue
    if (key === 'name') {
      name = displayValue
    } else {
      fields.push({ label, value: displayValue })
    }
  }

  return name || fields.length ? { name, fields } : null
}

export async function fetchRelatedFilmData(film: Film): Promise<RelatedFilmData> {
  const relatedData: RelatedFilmData = {
    people: [],
    species: [],
    locations: [],
    vehicles: [],
  }
  const resources = RELATED_CATEGORIES.flatMap((category) =>
    getRelatedResourceUrls(film[category], category).map((url) => ({ category, url })),
  )
  const requests = new Map<string, Promise<unknown>>()

  const resolvedResources = await Promise.all(
    resources.map(async ({ category, url }) => {
      let request = requests.get(url)
      if (!request) {
        request = fetchRelatedResource(url)
        requests.set(url, request)
      }

      return { category, value: await request }
    }),
  )

  for (const { category, value } of resolvedResources) {
    const entity = normalizeRelatedEntity(value, category)
    if (entity) relatedData[category].push(entity)
  }

  return relatedData
}
