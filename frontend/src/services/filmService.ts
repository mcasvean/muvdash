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
}

const FILMS_ENDPOINT = 'https://ghibliapi.vercel.app/films'

function isFilm(value: unknown): value is Film {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  const film = value as Record<string, unknown>
  const optionalFields = [
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
    typeof film.id === 'string' &&
    optionalFields.every(
      (field) =>
        film[field] === undefined || film[field] === null || typeof film[field] === 'string',
    )
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
