require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const Category = require('./models/Category');
const Food = require('./models/Food');

const foodsData = [
  { name: "Greek salad", price: 12, description: "Fresh greens, olives, feta, and a bright house dressing.", category: "Salad" },
  { name: "Veg salad", price: 18, description: "Crunchy vegetables tossed with herbs and lemon vinaigrette.", category: "Salad" },
  { name: "Clover Salad", price: 16, description: "Garden greens with seeds, sprouts, and a creamy dressing.", category: "Salad" },
  { name: "Chicken Salad", price: 24, description: "Grilled chicken with crisp lettuce and seasonal vegetables.", category: "Salad" },
  { name: "Lasagna Rolls", price: 14, description: "Soft rolls filled with rich lasagna-style vegetables.", category: "Rolls" },
  { name: "Peri Peri Rolls", price: 12, description: "Spicy peri peri stuffing wrapped in a warm roll.", category: "Rolls" },
  { name: "Chicken Rolls", price: 20, description: "Tender chicken, sauces, and salad wrapped together.", category: "Rolls" },
  { name: "Veg Rolls", price: 15, description: "Vegetable filling with tangy chutney in a soft roll.", category: "Rolls" },
  { name: "Ripple Ice Cream", price: 14, description: "Creamy ice cream with sweet ripple swirls.", category: "Deserts" },
  { name: "Fruit Ice Cream", price: 22, description: "Fruit-forward ice cream with a refreshing finish.", category: "Deserts" },
  { name: "Jar Ice Cream", price: 10, description: "Layered ice cream served in a compact jar.", category: "Deserts" },
  { name: "Vanilla Ice Cream", price: 12, description: "Classic vanilla ice cream with a smooth texture.", category: "Deserts" },
  { name: "Chicken Sandwich", price: 12, description: "Chicken sandwich with crisp vegetables and sauce.", category: "Sandwich" },
  { name: "Vegan Sandwich", price: 18, description: "Plant-based sandwich with fresh vegetables and spread.", category: "Sandwich" },
  { name: "Grilled Sandwich", price: 16, description: "Golden grilled sandwich with a cheesy filling.", category: "Sandwich" },
  { name: "Bread Sandwich", price: 24, description: "Soft bread sandwich with a hearty filling.", category: "Sandwich" },
  { name: "Cup Cake", price: 14, description: "Soft cupcake with a sweet creamy top.", category: "Cake" },
  { name: "Vegan Cake", price: 12, description: "Moist vegan cake made with simple ingredients.", category: "Cake" },
  { name: "Butterscotch Cake", price: 20, description: "Butterscotch cake with caramel notes.", category: "Cake" },
  { name: "Sliced Cake", price: 15, description: "A ready-to-enjoy slice of soft cake.", category: "Cake" },
  { name: "Garlic Mushroom", price: 14, description: "Mushrooms tossed with garlic and herbs.", category: "Pure Veg" },
  { name: "Fried Cauliflower", price: 22, description: "Crispy cauliflower bites with house seasoning.", category: "Pure Veg" },
  { name: "Mix Veg Pulao", price: 10, description: "Fragrant rice with mixed vegetables.", category: "Pure Veg" },
  { name: "Rice Zucchini", price: 12, description: "Comforting rice bowl with zucchini and mild spices.", category: "Pure Veg" },
  { name: "Cheese Pasta", price: 12, description: "Creamy pasta finished with melted cheese.", category: "Pasta" },
  { name: "Tomato Pasta", price: 18, description: "Pasta tossed in a bright tomato sauce.", category: "Pasta" },
  { name: "Creamy Pasta", price: 16, description: "Smooth cream sauce pasta with herbs.", category: "Pasta" },
  { name: "Chicken Pasta", price: 24, description: "Chicken pasta in a rich savory sauce.", category: "Pasta" },
  { name: "Butter Noodles", price: 14, description: "Warm noodles tossed with butter and spices.", category: "Noodles" },
  { name: "Veg Noodles", price: 12, description: "Vegetable noodles with a light stir-fry sauce.", category: "Noodles" },
  { name: "Somen Noodles", price: 20, description: "Fine noodles with a balanced savory flavor.", category: "Noodles" },
  { name: "Cooked Noodles", price: 15, description: "Classic cooked noodles with a homestyle finish.", category: "Noodles" },
  { name: "Avocado Crunch Salad", price: 19, description: "Avocado, greens, seeds, and citrus dressing for a light power meal.", category: "Salad" },
  { name: "Tandoori Paneer Roll", price: 17, description: "Smoky paneer cubes with mint chutney and onion slaw.", category: "Rolls" },
  { name: "Chocolate Lava Cake", price: 18, description: "Warm chocolate cake with a molten center.", category: "Cake" },
  { name: "Korean Veg Noodles", price: 21, description: "Stir-fried noodles with vegetables and a sweet-spicy glaze.", category: "Noodles" },
  { name: "Pesto Pasta Bowl", price: 20, description: "Pasta tossed in basil pesto with cherry tomatoes.", category: "Pasta" },
  { name: "Loaded Club Sandwich", price: 22, description: "Triple-layer sandwich with veggies, cheese, and house sauce.", category: "Sandwich" },
  { name: "Mango Cream Jar", price: 13, description: "Mango cream dessert layered in a chilled jar.", category: "Deserts" },
  { name: "Paneer Veg Platter", price: 26, description: "Paneer, roasted vegetables, rice, and a tangy dip.", category: "Pure Veg" }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Clear existing foods and categories
        await Food.deleteMany({});
        await Category.deleteMany({});
        await Restaurant.deleteMany({});

        // Ensure at least one restaurant exists
        let owner = await User.findOne({ email: 'restaurant@tomato.app' });
        if (!owner) {
            owner = await User.create({
                name: 'Tomato Restaurant',
                email: 'restaurant@tomato.app',
                password: 'password123',
                role: 'RESTAURANT_OWNER'
            });
        }

        const restaurant = await Restaurant.create({
            owner: owner._id,
            restaurantName: 'Tomato Central',
            description: 'The best food in town',
            cuisine: ['Global'],
            isApproved: true
        });

        const categoriesMap = {};

        for (const food of foodsData) {
            if (!categoriesMap[food.category]) {
                const newCat = await Category.create({ name: food.category, description: food.category });
                categoriesMap[food.category] = newCat._id;
            }

            await Food.create({
                restaurant: restaurant._id,
                category: categoriesMap[food.category],
                name: food.name,
                description: food.description,
                price: food.price,
                images: [], // Images handled by frontend mapping
                isAvailable: true
            });
        }

        console.log("Database seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
};

seedDatabase();
