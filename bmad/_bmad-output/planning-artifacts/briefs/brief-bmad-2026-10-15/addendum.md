# Product and Technical Details

## Confirmed Client Stack

- Vue.js 3
- Vite
- TypeScript
- Pinia
- Vue Router

## Routes and Behavior

- **Home:** Fetch the movie list on mount and show movie cards.
- **Contact:** Route is required.
- **About:** Route is required.
- **Search:** Filter the fetched list on the client by `title`, `release_date`, `producer`, `director`, and `description`.
- **Movie details:** An expand button opens a centered modal showing all fields available for the selected film. A close button dismisses it.

## Movie API

Configure the client to make a GET request to:

`https://ghibliapi.vercel.app/films`

The response is a list of film objects. The selected-film modal presents all available fields defined by the example contract in [`api_structure.md`](../../../api_structure.md).

The card shows `title`, `release_date`, `image`, `description`, and `producer`.

## Deferred Decisions

- Visual style and design direction will be decided during the UX phase.
