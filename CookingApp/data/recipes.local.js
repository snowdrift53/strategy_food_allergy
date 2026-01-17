const recipes = [
    {
        id: 1,
        title: "Classic Spaghetti Carbonara",
        description: "A traditional Italian pasta dish with eggs, cheese, pancetta, and black pepper.",
        photo: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop",
        illustration: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=800&h=600&fit=crop",
        imageType: "photo",
        time: "30 min",
        servings: 4,
        difficulty: "Medium",
        fullDescription: "Spaghetti Carbonara is a classic Roman pasta dish that's creamy, rich, and incredibly satisfying. This authentic recipe uses eggs, Pecorino Romano cheese, guanciale (or pancetta), and black pepper to create a silky sauce that clings to every strand of pasta.",
        ingredients: [
            "400g spaghetti",
            "200g guanciale or pancetta, diced",
            "4 large eggs",
            "100g Pecorino Romano cheese, grated",
            "Black pepper, freshly ground",
            "Salt"
        ],
        steps: [
            "Bring a large pot of salted water to a boil and cook the spaghetti according to package instructions until al dente.",
            "While the pasta cooks, heat a large pan over medium heat and cook the guanciale until crispy and golden, about 5-7 minutes.",
            "In a bowl, whisk together the eggs, grated Pecorino Romano, and a generous amount of black pepper.",
            "Drain the pasta, reserving about 1 cup of pasta water. Add the hot pasta to the pan with guanciale.",
            "Remove the pan from heat and quickly toss the pasta with the egg mixture, using the residual heat to cook the eggs without scrambling them.",
            "Add a splash of reserved pasta water if needed to create a creamy sauce. Serve immediately with extra cheese and pepper."
        ]
    },
    {
        id: 2,
        title: "Chicken Tikka Masala",
        description: "Creamy and flavorful Indian curry with tender chicken pieces in a rich tomato-based sauce.",
        photo: "https://images.unsplash.com/photo-1562967914-608f82629710?w=800&h=600&fit=crop",
        illustration: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop",
        imageType: "illustration",
        time: "45 min",
        servings: 4,
        difficulty: "Medium",
        fullDescription: "Chicken Tikka Masala is a beloved dish that combines marinated chicken pieces with a creamy, spiced tomato sauce. This recipe brings together the best of Indian flavors with a touch of creaminess that makes it irresistible.",
        ingredients: [
            "500g chicken breast, cut into chunks",
            "200ml heavy cream",
            "400g canned tomatoes",
            "1 large onion, diced",
            "3 cloves garlic, minced",
            "1 inch ginger, grated",
            "2 tbsp garam masala",
            "1 tbsp paprika",
            "1 tsp turmeric",
            "1 tsp cumin",
            "1 tsp coriander",
            "Salt and pepper",
            "Fresh cilantro for garnish"
        ],
        steps: [
            "Marinate the chicken with yogurt, garam masala, paprika, and salt for at least 30 minutes.",
            "Heat oil in a large pan and cook the marinated chicken until golden, then set aside.",
            "In the same pan, sauté onions until soft, then add garlic and ginger, cooking for 2 minutes.",
            "Add all the spices and cook for 1 minute until fragrant.",
            "Add the canned tomatoes and simmer for 10 minutes until the sauce thickens.",
            "Blend the sauce until smooth, then return to the pan.",
            "Add the cooked chicken and cream, simmer for 5 minutes. Garnish with cilantro and serve with rice or naan."
        ]
    },
    {
        id: 3,
        title: "Chocolate Chip Cookies",
        description: "Soft, chewy cookies loaded with chocolate chips - the perfect homemade treat.",
        photo: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&fit=crop",
        illustration: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&h=600&fit=crop",
        imageType: "photo",
        time: "25 min",
        servings: 24,
        difficulty: "Easy",
        fullDescription: "These classic chocolate chip cookies are soft, chewy, and loaded with chocolate chips. They're the perfect comfort food and a favorite for all ages. The secret is in the brown sugar and slightly underbaking them for that perfect chewy texture.",
        ingredients: [
            "225g butter, softened",
            "150g brown sugar",
            "100g white sugar",
            "2 large eggs",
            "1 tsp vanilla extract",
            "280g all-purpose flour",
            "1 tsp baking soda",
            "1 tsp salt",
            "300g chocolate chips"
        ],
        steps: [
            "Preheat oven to 375°F (190°C) and line baking sheets with parchment paper.",
            "In a large bowl, cream together the butter and both sugars until light and fluffy.",
            "Beat in the eggs one at a time, then stir in the vanilla extract.",
            "In a separate bowl, combine flour, baking soda, and salt. Gradually mix into the butter mixture.",
            "Fold in the chocolate chips until evenly distributed.",
            "Drop rounded tablespoons of dough onto the prepared baking sheets, spacing them 2 inches apart.",
            "Bake for 9-11 minutes until edges are golden but centers are still soft. Cool on baking sheet for 5 minutes before transferring to wire rack."
        ]
    },
    {
        id: 4,
        title: "Beef Stir-Fry",
        description: "Quick and healthy stir-fry with tender beef, fresh vegetables, and a savory sauce.",
        photo: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop",
        illustration: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop",
        imageType: "illustration",
        time: "20 min",
        servings: 4,
        difficulty: "Easy",
        fullDescription: "This beef stir-fry is a quick and healthy meal that's perfect for busy weeknights. Tender strips of beef are cooked with colorful vegetables in a savory sauce that's both flavorful and satisfying.",
        ingredients: [
            "500g beef sirloin, sliced thin",
            "2 bell peppers, sliced",
            "1 large onion, sliced",
            "2 carrots, julienned",
            "200g broccoli florets",
            "3 cloves garlic, minced",
            "2 tbsp soy sauce",
            "1 tbsp oyster sauce",
            "1 tsp sesame oil",
            "1 tbsp cornstarch",
            "2 tbsp vegetable oil"
        ],
        steps: [
            "Slice the beef into thin strips and marinate with soy sauce and cornstarch for 10 minutes.",
            "Heat a large wok or pan over high heat and add 1 tablespoon of oil.",
            "Cook the beef in batches until browned, about 2-3 minutes per batch. Remove and set aside.",
            "Add remaining oil to the pan and stir-fry the vegetables, starting with onions and carrots, then adding peppers and broccoli.",
            "Add garlic and cook for 30 seconds until fragrant.",
            "Return the beef to the pan and add soy sauce, oyster sauce, and sesame oil.",
            "Toss everything together and cook for 2 more minutes. Serve hot over rice."
        ]
    },
    {
        id: 5,
        title: "Caesar Salad",
        description: "Crisp romaine lettuce with homemade Caesar dressing, croutons, and parmesan cheese.",
        photo: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&fit=crop",
        illustration: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
        imageType: "photo",
        time: "15 min",
        servings: 4,
        difficulty: "Easy",
        fullDescription: "A classic Caesar salad with crisp romaine lettuce, homemade creamy dressing, crunchy croutons, and shaved parmesan. This timeless recipe never goes out of style and makes a perfect side dish or light meal.",
        ingredients: [
            "2 heads romaine lettuce, chopped",
            "1/2 cup parmesan cheese, grated",
            "1 cup croutons",
            "2 cloves garlic, minced",
            "2 anchovy fillets, minced",
            "1/4 cup lemon juice",
            "1/2 cup olive oil",
            "1 egg yolk",
            "1 tsp Dijon mustard",
            "Salt and pepper"
        ],
        steps: [
            "Wash and dry the romaine lettuce, then chop into bite-sized pieces.",
            "To make the dressing, whisk together the egg yolk, lemon juice, Dijon mustard, and minced garlic in a bowl.",
            "Slowly drizzle in the olive oil while whisking continuously until the dressing is emulsified.",
            "Add the minced anchovies and grated parmesan to the dressing. Season with salt and pepper.",
            "In a large bowl, toss the lettuce with the dressing until well coated.",
            "Add the croutons and additional parmesan cheese on top. Serve immediately."
        ]
    },
    {
        id: 6,
        title: "Beef Tacos",
        description: "Flavorful ground beef tacos with fresh toppings and warm tortillas.",
        photo: "https://images.unsplash.com/photo-1565299585323-38174c0b0b0a?w=800&h=600&fit=crop",
        illustration: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop",
        imageType: "illustration",
        time: "30 min",
        servings: 6,
        difficulty: "Easy",
        fullDescription: "These delicious beef tacos are packed with flavor and perfect for a family dinner or gathering. Seasoned ground beef is served in warm tortillas with fresh toppings like lettuce, tomatoes, cheese, and sour cream.",
        ingredients: [
            "500g ground beef",
            "12 taco shells or soft tortillas",
            "1 packet taco seasoning",
            "1 cup shredded lettuce",
            "2 tomatoes, diced",
            "1 cup shredded cheese",
            "1/2 cup sour cream",
            "1/2 cup salsa",
            "1 onion, diced",
            "2 cloves garlic, minced"
        ],
        steps: [
            "Heat a large skillet over medium-high heat and cook the ground beef until browned, breaking it up as it cooks.",
            "Add the diced onion and garlic, cooking until softened, about 3-4 minutes.",
            "Drain excess fat, then add the taco seasoning and a splash of water. Simmer for 5 minutes.",
            "Warm the taco shells or tortillas according to package instructions.",
            "Fill each taco shell with the seasoned beef mixture.",
            "Top with shredded lettuce, diced tomatoes, cheese, sour cream, and salsa. Serve immediately."
        ]
    }
];
