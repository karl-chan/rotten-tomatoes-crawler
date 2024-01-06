import { stringify } from 'csv'
import fs from 'fs/promises'
import { MODES, RottenTomatoes, type Movie } from './RottenTomatoes'

async function main (): Promise<void> {
  const rt = new RottenTomatoes()
  for (const mode of MODES) {
    const allMovies = await rt.get(mode)
    const csvContents: string = await toCsv(allMovies)
    const outfile = `${mode}.csv`
    await fs.writeFile(outfile, csvContents)
    console.log(`Wrote file to ${outfile}`)
  }
}

async function toCsv (allMovies: Movie[]): Promise<string> {
  return await new Promise((resolve, reject) => {
    stringify(allMovies, { header: true }, (err, data) => {
      err !== undefined ? reject(err) : resolve(data)
    })
  })
}

void main()
