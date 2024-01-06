interface RottenTomatoesPageResponse {
  grid: {
    id: string
    list: Array<{
      audienceScore: {
        score: number
      }
      criticsScore: {
        score: number
      }
      title: string
      releaseDateText: string
      type: string
    }>
  }
  pageInfo: {
    endCursor: string
    hasNextPage: boolean
    hasPreviousPage: boolean
    startCursor: string
  }
}

export class RottenTomatoes {
  async get (mode: Mode): Promise<Movie[]> {
    const allMovies: Movie[] = []
    let pageCount = 0
    for (let nextPageToken; ;) {
      pageCount++
      const response = await this.getPage(mode, nextPageToken)
      console.log(`Received page ${pageCount} for ${mode}`)
      const movies = response.grid.list.map(e => {
        return {
          name: e.title,
          date: e.releaseDateText.replace(/^\S+ /, ''),
          audienceScore: e.audienceScore.score,
          criticsScore: e.criticsScore.score
        }
      })
      allMovies.push(...movies)
      if (response.pageInfo.hasNextPage) {
        nextPageToken = response.pageInfo.endCursor
        continue
      }
      break
    }
    return allMovies
  }

  private async getPage (mode: Mode, after?: string): Promise<RottenTomatoesPageResponse> {
    const url = after === undefined
      ? `https://www.rottentomatoes.com/napi/browse/${mode}/`
      : `https://www.rottentomatoes.com/napi/browse/${mode}/?after=${after}`
    for (let retryCount = 5; ; retryCount--) {
      try {
        const response = await fetch(url)
        const json = await response.json()
        return json
      } catch (err) {
        if (retryCount === 0) {
          throw err
        }
        console.warn(`${retryCount} retries remaining!`)
        await this.sleep(5)
      }
    }
  }

  private async sleep (seconds: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, seconds * 1000))
  }
}

export interface Movie {
  name: string
  date: string
  audienceScore: number
  criticsScore: number
}

export const MODES = [
  'movies_in_theaters', 'movies_at_home'
] as const
type Mode = (typeof MODES)[number]
