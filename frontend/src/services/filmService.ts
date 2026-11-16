export interface Film {
  id: string
  title?: string | null
  image?: string | null
  description?: string | null
}

const FILMS_ENDPOINT = 'https://ghibliapi.vercel.app/films'

function isFilm(value: unknown): value is Film {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  const film = value as Record<string, unknown>
  const optionalFields = ['title', 'image', 'description']

  return (
    typeof film.id === 'string' &&
    optionalFields.every(
      (field) =>
        film[field] === undefined || film[field] === null || typeof film[field] === 'string',
    )
  )
}

function isFilmArray(value: unknown): value is Film[] {
  return Array.isArray(value) && value.every(isFilm)
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