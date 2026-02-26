import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const sports = [
        { name: 'Running', slug: 'running', category: 'Endurance' },
        { name: 'Cycling', slug: 'cycling', category: 'Endurance' },
        { name: 'Swimming', slug: 'swimming', category: 'Endurance' },
        { name: 'Triathlon', slug: 'triathlon', category: 'Endurance' },
        { name: 'Functional Training', slug: 'functional', category: 'Strength' },
        { name: 'Football', slug: 'football', category: 'Team Sport' },
    ]

    console.log('Seeding sports...')
    for (const sport of sports) {
        await prisma.sport.upsert({
            where: { slug: sport.slug },
            update: {},
            create: sport,
        })
    }
    console.log('Seeding sports completed.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
