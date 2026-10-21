export interface Film {
  id: string
  title?: string | null
  image?: string | null
  description?: string | null
}

const FILMS_ENDPOINT = 'https://ghibliapi.vercel.app/films'

export async function fetchFilms(): Promise<Film[]> {
  const response = await fetch(FILMS_ENDPOINT)

  if (!response.ok) {
    throw new Error(`Film catalog request failed: ${response.status}`)
  }

  const films: unknown = await response.json()

  if (!Array.isArray(films)) {
    throw new Error('Film catalog response was not an array')
  }

  return films as Film[]
}