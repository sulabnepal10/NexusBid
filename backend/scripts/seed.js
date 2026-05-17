const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding DB...');

    const users = Array.from({ length: 500 }).map(() => ({
        name: faker.person.fullName(),
        email: faker.internet.email(),
    }));
    await prisma.user.createMany({ data: users, skipDuplicates: true });

    const auctions = Array.from({ length: 200 }).map(() => {
        const price = parseFloat(faker.commerce.price({ min: 10, max: 500 }));
        return {
            title: faker.commerce.productName(),
            startingPrice: price,
            currentPrice: price,
            status: 'ACTIVE'
        };
    });
    await prisma.auction.createMany({ data: auctions });

    console.log('Seeding complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());