import { seedDefaultStorms } from '../src/lib/storms/mock-data'

async function run() {
  await seedDefaultStorms()
  console.log('Seeded mock storm events.')
}

run().catch((error) => {
  console.error('Failed to seed storm events:', error)
  process.exit(1)
})
