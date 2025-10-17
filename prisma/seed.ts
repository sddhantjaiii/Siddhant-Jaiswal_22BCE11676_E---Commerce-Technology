import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed process...');

  // Fetch products from Fake Store API
  console.log('📦 Fetching products from Fake Store API...');
  const response = await fetch('https://fakestoreapi.com/products');
  const products = await response.json();

  console.log(`✅ Fetched ${products.length} products`);

  // Seed products
  console.log('💾 Seeding products to database...');
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        title: product.title,
        price: product.price,
        description: product.description,
        category: product.category,
        image: product.image,
        ratingRate: product.rating.rate,
        ratingCount: product.rating.count,
      },
      create: {
        id: product.id,
        title: product.title,
        price: product.price,
        description: product.description,
        category: product.category,
        image: product.image,
        ratingRate: product.rating.rate,
        ratingCount: product.rating.count,
      },
    });
  }

  console.log('✅ Products seeded successfully!');

  // Note: Users will be created through Neon Auth (Stack Auth) during signup
  // They will appear in neon_auth.users_sync table automatically
  
  console.log('🎉 Seed completed successfully!');
  console.log('📝 Note: Users will be created through Neon Auth when they sign up');
  console.log('👉 Visit http://localhost:3000/handler/sign-up to create test users');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
