// server.ts
import express from "express";
import path from "path";
import fs from "fs";

// src/db/index.ts
import { neon } from "@neondatabase/serverless";

// src/data/mockData.ts
var initialFoodItems = [
  // --- FAST FOOD & CAFE ITEMS ---
  {
    id: "food-lavash-beef",
    title: {
      qr: "S\u0131y\u0131r go'shli Lavash (Syrmen)",
      uz: "Mol go'shtli Lavash (Pishloqli)",
      ru: "\u0421\u043E\u0447\u043D\u044B\u0439 \u041B\u0430\u0432\u0430\u0448 \u0441 \u0433\u043E\u0432\u044F\u0434\u0438\u043D\u043E\u0439 \u0438 \u0441\u044B\u0440\u043E\u043C",
      en: "Juicy Beef & Cheese Lavash"
    },
    description: {
      qr: "Taza s\u0131y\u0131r go'shi, erigen pishloq, q\u0131yar, pomidor h\xE1m xosh boyl\u0131 firmenn\u0131y sous penen oralan\u01F5an \u0131ss\u0131 lavash.",
      uz: "Qovurilgan mol go'shti, erigan pishloq, bodring, pomidor va maxsus sous bilan oralgan issiq lavash.",
      ru: "\u0421\u043E\u0447\u043D\u0430\u044F \u043E\u0431\u0436\u0430\u0440\u0435\u043D\u043D\u0430\u044F \u0433\u043E\u0432\u044F\u0434\u0438\u043D\u0430, \u0441\u044B\u0440 \u041C\u043E\u0446\u0430\u0440\u0435\u043B\u043B\u0430, \u0441\u0432\u0435\u0436\u0438\u0435 \u043E\u0433\u0443\u0440\u0446\u044B, \u0442\u043E\u043C\u0430\u0442\u044B \u0438 \u0444\u0438\u0440\u043C\u0435\u043D\u043D\u044B\u0439 \u0441\u043E\u0443\u0441 \u0432 \u0442\u043E\u043D\u043A\u043E\u043C \u043B\u0430\u0432\u0430\u0448\u0435.",
      en: "Sizzling grilled beef, melted mozzarella, crisp cucumber, tomatoes, and house sauce wrapped in warm lavash."
    },
    price: 32e3,
    category: "fastfood",
    imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
    calories: 540,
    prepTime: 12,
    spicyLevel: 0,
    isVegetarian: false,
    isGlutenFree: false,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["S\u0131y\u0131r go'shi", "Lavash qam\u0131r", "Mozzarella pishloq", "Pomidor", "Q\u0131yar", "Soba sous"],
      uz: ["Mol go'shti", "Lavash xamiri", "Pishloq", "Pomidor", "Bodring", "Maxsus sous"],
      ru: ["\u0413\u043E\u0432\u044F\u0434\u0438\u043D\u0430", "\u041B\u0430\u0432\u0430\u0448", "\u0421\u044B\u0440 \u041C\u043E\u0446\u0430\u0440\u0435\u043B\u043B\u0430", "\u041F\u043E\u043C\u0438\u0434\u043E\u0440\u044B", "\u041E\u0433\u0443\u0440\u0446\u044B", "\u0421\u043E\u0443\u0441"],
      en: ["Beef", "Lavash Bread", "Mozzarella Cheese", "Tomatoes", "Cucumbers", "Special Sauce"]
    },
    allergens: ["gluten", "dairy"],
    rating: 4.9,
    ratingCount: 240,
    reviews: [
      {
        id: "rev-l1",
        userName: "Aydos K.",
        rating: 5,
        comment: "Lavash juda sotsnyy h\xE1m iri eken, r\xE0xmet!",
        date: "2026-07-27"
      }
    ],
    nutrition: {
      protein: 28,
      fat: 22,
      carbs: 48
    }
  },
  {
    id: "food-lavash-chicken",
    title: {
      qr: "Taw\u0131q go'shli Lavash (Kartoshka Fri menen)",
      uz: "Tovuqli Lavash (Fri bilan)",
      ru: "\u041B\u0430\u0432\u0430\u0448 \u0441 \u043A\u0443\u0440\u0438\u0446\u0435\u0439 \u0438 \u043A\u0430\u0440\u0442\u043E\u0444\u0435\u043B\u0435\u043C \u0444\u0440\u0438",
      en: "Crispy Chicken & Fries Lavash"
    },
    description: {
      qr: "Jumsaq taw\u0131q filest\u0131, ketti qow\u0131r\u0131l\u01F5an fri, sar\u0131msoql\u0131 sous h\xE1m tazalangan sabzavotlar.",
      uz: "Tovuq filesi, oltinrang kartoshka fri, sarimsoqli sous va yangi sabzavotlar.",
      ru: "\u041D\u0435\u0436\u043D\u043E\u0435 \u043A\u0443\u0440\u0438\u043D\u043E\u0435 \u0444\u0438\u043B\u0435, \u0445\u0440\u0443\u0441\u0442\u044F\u0449\u0438\u0439 \u043A\u0430\u0440\u0442\u043E\u0444\u0435\u043B\u044C \u0444\u0440\u0438, \u0447\u0435\u0441\u043D\u043E\u0447\u043D\u044B\u0439 \u0441\u043E\u0443\u0441 \u0438 \u0441\u0432\u0435\u0436\u0438\u0435 \u043E\u0432\u043E\u0449\u0438.",
      en: "Tender chicken fillet, golden french fries, garlic aioli, and crunchy fresh vegetables."
    },
    price: 28e3,
    category: "fastfood",
    imageUrl: "https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=800&q=80",
    calories: 490,
    prepTime: 10,
    spicyLevel: 0,
    isVegetarian: false,
    isGlutenFree: false,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["Taw\u0131q go'shi", "Kartoshka fri", "Lavash qam\u0131r", "Sar\u0131msoql\u0131 sous", "Q\u0131yar"],
      uz: ["Tovuq go'shti", "Kartoshka fri", "Lavash", "Sarimsoqli sous", "Bodring"],
      ru: ["\u041A\u0443\u0440\u0438\u043D\u043E\u0435 \u0444\u0438\u043B\u0435", "\u041A\u0430\u0440\u0442\u043E\u0444\u0435\u043B\u044C \u0444\u0440\u0438", "\u041B\u0430\u0432\u0430\u0448", "\u0427\u0435\u0441\u043D\u043E\u0447\u043D\u044B\u0439 \u0441\u043E\u0443\u0441", "\u041E\u0433\u0443\u0440\u0446\u044B"],
      en: ["Chicken Fillet", "French Fries", "Lavash", "Garlic Sauce", "Cucumbers"]
    },
    allergens: ["gluten", "dairy"],
    rating: 4.8,
    ratingCount: 195,
    reviews: [],
    nutrition: {
      protein: 26,
      fat: 18,
      carbs: 52
    }
  },
  {
    id: "food-burger-set",
    title: {
      qr: "Double Cheeseburger Set (Fri + Ketchup)",
      uz: "Chizburger Set (Fri va Ketchup)",
      ru: "\u0414\u0432\u043E\u0439\u043D\u043E\u0439 \u0427\u0438\u0437\u0431\u0443\u0440\u0433\u0435\u0440 \u0421\u0435\u0442 \u0441 \u041A\u0430\u0440\u0442\u043E\u0444\u0435\u043B\u0435\u043C \u0424\u0440\u0438",
      en: "Double Cheeseburger Combo with Fries"
    },
    description: {
      qr: "Eki qabat sotsnyy s\u0131y\u0131r go'shi kotleti, Cheddar pishlo\u01F5\u0131, marinadlangan q\u0131yar h\xE1m ketti qow\u0131r\u0131l\u01F5an fri.",
      uz: "Ikki qavat mol go'shti kotleti, Cheddar pishloq, bodring va fri.",
      ru: "\u0421\u043E\u0447\u043D\u044B\u0435 \u0434\u0432\u0435 \u0433\u043E\u0432\u044F\u0436\u044C\u0438 \u043A\u043E\u0442\u043B\u0435\u0442\u044B, \u043F\u043B\u0430\u0432\u043B\u0435\u043D\u043E-\u0442\u044F\u0433\u0443\u0447\u0438\u0439 \u0441\u044B\u0440 \u0427\u0435\u0434\u0434\u0435\u0440, \u0441\u043E\u043B\u0435\u043D\u044B\u0435 \u043E\u0433\u0443\u0440\u0447\u0438\u043A\u0438 \u0438 \u0437\u043E\u043B\u043E\u0442\u0438\u0441\u0442\u044B\u0439 \u043A\u0430\u0440\u0442\u043E\u0444\u0435\u043B\u044C \u0444\u0440\u0438.",
      en: "Two flame-grilled beef patties, doubled Cheddar cheese, pickles, and crispy golden french fries."
    },
    price: 45e3,
    category: "fastfood",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    calories: 780,
    prepTime: 15,
    spicyLevel: 1,
    isVegetarian: false,
    isGlutenFree: false,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["S\u0131y\u0131r go'shi kotlet", "Cheddar pishloq", "Bulochka", "Marinad q\u0131yar", "Fri"],
      uz: ["Mol go'shti kotlet", "Cheddar pishloq", "Bulochka", "Tuzlangan bodring", "Fri"],
      ru: ["\u0413\u043E\u0432\u044F\u0436\u044C\u0438 \u043A\u043E\u0442\u043B\u0435\u0442\u044B", "\u0421\u044B\u0440 \u0427\u0435\u0434\u0434\u0435\u0440", "\u0411\u0443\u043B\u043E\u0447\u043A\u0430 \u0441 \u043A\u0443\u043D\u0436\u0443\u0442\u043E\u043C", "\u0421\u043E\u043B\u0435\u043D\u044B\u0435 \u043E\u0433\u0443\u0440\u0446\u044B", "\u0424\u0440\u0438"],
      en: ["Beef Patties", "Cheddar Cheese", "Sesame Bun", "Pickles", "French Fries"]
    },
    allergens: ["gluten", "dairy", "sesame"],
    rating: 4.9,
    ratingCount: 310,
    reviews: [
      {
        id: "rev-b1",
        userName: "Sardorbek T.",
        rating: 5,
        comment: "Nukusdag\u0131 e\u0144 lezzetli burger seti!",
        date: "2026-07-26"
      }
    ],
    nutrition: {
      protein: 38,
      fat: 34,
      carbs: 64
    }
  },
  {
    id: "food-pizza-pepperoni",
    title: {
      qr: "Pepperoni Pizza (30 cm - Mozzarella)",
      uz: "Pepperoni Pitssa (30 sm)",
      ru: "\u041F\u0438\u0446\u0446\u0430 \u041F\u0435\u043F\u043F\u0435\u0440\u043E\u043D\u0438 (30 \u0441\u043C)",
      en: "Classic Pepperoni Pizza (30cm)"
    },
    description: {
      qr: "Mozzarella pishlo\u01F5\u0131, otl\u0131 pepperoni kolbasas\u0131 h\xE1m pomidor sous\u0131 sol\u0131n\u01F5an \u0131ss\u0131 pizza.",
      uz: "Motsarella pishlog'i va pepperoni kolbasasi bilan yopilgan xushbo'y pitssa.",
      ru: "\u0418\u0442\u0430\u043B\u044C\u044F\u043D\u0441\u043A\u0430\u044F \u043F\u0438\u0446\u0446\u0430 \u0441 \u0441\u043E\u0443\u0441\u043E\u043C \u0438\u0437 \u0442\u043E\u043C\u0430\u0442\u043E\u0432, \u0441\u044B\u0440\u043E\u043C \u041C\u043E\u0446\u0430\u0440\u0435\u043B\u043B\u0430 \u0438 \u043F\u0438\u043A\u0430\u043D\u0442\u043D\u044B\u043C\u0438 \u043A\u043E\u043B\u0431\u0430\u0441\u043A\u0430\u043C\u0438 \u041F\u0435\u043F\u043F\u0435\u0440\u043E\u043D\u0438.",
      en: "Crispy dough baked with rich tomato sauce, mozzarella, and spicy pepperoni slices."
    },
    price: 65e3,
    category: "fastfood",
    imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80",
    calories: 840,
    prepTime: 20,
    spicyLevel: 1,
    isVegetarian: false,
    isGlutenFree: false,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["Pepperoni kolbasa", "Mozzarella pishloq", "Pomidor sous", "Pizza qam\u0131r"],
      uz: ["Pepperoni kolbasa", "Mozzarella pishloq", "Pomidor sous", "Xamir"],
      ru: ["\u041A\u043E\u043B\u0431\u0430\u0441\u043A\u0438 \u041F\u0435\u043F\u043F\u0435\u0440\u043E\u043D\u0438", "\u0421\u044B\u0440 \u041C\u043E\u0446\u0430\u0440\u0435\u043B\u043B\u0430", "\u0422\u043E\u043C\u0430\u0442\u043D\u044B\u0439 \u0441\u043E\u0443\u0441", "\u0422\u0435\u0441\u0442\u043E"],
      en: ["Pepperoni Slices", "Mozzarella Cheese", "Tomato Sauce", "Pizza Dough"]
    },
    allergens: ["gluten", "dairy"],
    rating: 4.85,
    ratingCount: 180,
    reviews: [],
    nutrition: {
      protein: 32,
      fat: 36,
      carbs: 80
    }
  },
  {
    id: "food-french-fries",
    title: {
      qr: "Kartoshka Fri (Ketchup & Mayonez)",
      uz: "Kartoshka Fri (Sous bilan)",
      ru: "\u041A\u0430\u0440\u0442\u043E\u0444\u0435\u043B\u044C \u0424\u0440\u0438 \u0441 \u0421\u043E\u0443\u0441\u043E\u043C",
      en: "Crispy French Fries with Dip"
    },
    description: {
      qr: "Alt\u0131n re\u0144li ketti qow\u0131r\u0131l\u01F5an fri kartoshkas\u0131, firmenn\u0131y ketchup h\xE1m sar\u0131msoql\u0131 mayonez menen.",
      uz: "Oltinrang qirsillama kartoshka fri va souslar.",
      ru: "\u0425\u0440\u0443\u0441\u0442\u044F\u0449\u0438\u0439 \u0437\u043E\u043B\u043E\u0442\u0438\u0441\u0442\u044B\u0439 \u043A\u0430\u0440\u0442\u043E\u0444\u0435\u043B\u044C \u0444\u0440\u0438 \u0441\u043E \u0441\u043F\u0435\u0446\u0438\u044F\u043C\u0438, \u043A\u0435\u0442\u0447\u0443\u043F\u043E\u043C \u0438 \u0441\u043E\u0443\u0441\u043E\u043C.",
      en: "Golden crispy french fries lightly salted and served with tomato ketchup and garlic mayo."
    },
    price: 18e3,
    category: "fastfood",
    imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
    calories: 340,
    prepTime: 8,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: true,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["Kartoshka", "Moy", "Tuz", "Ketchup"],
      uz: ["Kartoshka", "Yog'", "Tuz", "Ketchup"],
      ru: ["\u041A\u0430\u0440\u0442\u043E\u0444\u0435\u043B\u044C", "\u0420\u0430\u0441\u0442\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u043C\u0430\u0441\u043B\u043E", "\u0421\u043E\u043B\u044C", "\u041A\u0435\u0442\u0447\u0443\u043F"],
      en: ["Potatoes", "Vegetable Oil", "Salt", "Ketchup"]
    },
    allergens: [],
    rating: 4.75,
    ratingCount: 140,
    reviews: [],
    nutrition: {
      protein: 4,
      fat: 16,
      carbs: 42
    }
  },
  // --- COCA-COLA, FANTA, ICE TEA & DRINKS ---
  {
    id: "food-cola-05",
    title: {
      qr: "Coca-Cola Classic (0.5 Litr / Muzday)",
      uz: "Coca-Cola Classic (0.5L)",
      ru: "Coca-Cola Classic (0.5 \u043B)",
      en: "Coca-Cola Classic (0.5L)"
    },
    description: {
      qr: "Salq\u0131n, muzday gazlan\u01F5an klassikal\u0131q Coca-Cola ishimligi.",
      uz: "Muzdek tetiklashtiruvchi Coca-Cola ichimligi.",
      ru: "\u041E\u0441\u0432\u0435\u0436\u0430\u044E\u0449\u0438\u0439 \u043E\u0445\u043B\u0430\u0436\u0434\u0435\u043D\u043D\u044B\u0439 \u0433\u0430\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043D\u0430\u043F\u0438\u0442\u043E\u043A Coca-Cola.",
      en: "Chilled classic refreshing carbonated Coca-Cola beverage."
    },
    price: 1e4,
    category: "drinks",
    imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
    calories: 140,
    prepTime: 2,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: true,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["Gazlan\u01F5an suw", "Shedre", "Kofeina", "Aromatizatorlar"],
      uz: ["Gazlangan suv", "Shakar", "Kofein", "Aromatizator"],
      ru: ["\u0413\u0430\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0430\u044F \u0432\u043E\u0434\u0430", "\u0421\u0430\u0445\u0430\u0440", "\u041A\u043E\u0444\u0435\u0438\u043D", "\u0410\u0440\u043E\u043C\u0430\u0442\u0438\u0437\u0430\u0442\u043E\u0440\u044B"],
      en: ["Carbonated Water", "Sugar", "Caffeine", "Natural Flavors"]
    },
    allergens: [],
    rating: 5,
    ratingCount: 420,
    reviews: [
      {
        id: "rev-c1",
        userName: "Temur A.",
        rating: 5,
        comment: "Muzday h\xE1m sotsnyy cola!",
        date: "2026-07-28"
      }
    ],
    nutrition: {
      protein: 0,
      fat: 0,
      carbs: 35
    }
  },
  {
    id: "food-fanta-05",
    title: {
      qr: "Fanta Orange (0.5 Litr / Muzday)",
      uz: "Fanta Apelsin (0.5L)",
      ru: "Fanta \u0410\u043F\u0435\u043B\u044C\u0441\u0438\u043D (0.5 \u043B)",
      en: "Fanta Orange (0.5L)"
    },
    description: {
      qr: "Apelsin lezzetli muzday gazlan\u01F5an ishimlik.",
      uz: "Apelsin ta'mli muzdek Fanta ichimligi.",
      ru: "\u042F\u0440\u043A\u0438\u0439 \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D\u043E\u0432\u044B\u0439 \u043E\u0445\u043B\u0430\u0436\u0434\u0435\u043D\u043D\u044B\u0439 \u0433\u0430\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043D\u0430\u043F\u0438\u0442\u043E\u043A.",
      en: "Chilled citrus orange soda beverage with bright fruit flavors."
    },
    price: 1e4,
    category: "drinks",
    imageUrl: "https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&w=800&q=80",
    calories: 150,
    prepTime: 2,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: true,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["Gazlan\u01F5an suw", "Apelsin sok\u0131", "Shedre"],
      uz: ["Gazlangan suv", "Apelsin sharbati", "Shakar"],
      ru: ["\u0413\u0430\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0430\u044F \u0432\u043E\u0434\u0430", "\u0410\u043F\u0435\u043B\u044C\u0441\u0438\u043D\u043E\u0432\u044B\u0439 \u0441\u043E\u043A", "\u0421\u0430\u0445\u0430\u0440"],
      en: ["Carbonated Water", "Orange Juice Concentrate", "Sugar"]
    },
    allergens: [],
    rating: 4.8,
    ratingCount: 210,
    reviews: [],
    nutrition: {
      protein: 0,
      fat: 0,
      carbs: 37
    }
  },
  {
    id: "food-ice-tea",
    title: {
      qr: "Ice Tea Fuse Tea (Limon / Shaftal\u0131 0.5L)",
      uz: "Ice Tea (Limon yoki Shaftoli 0.5L)",
      ru: "\u0425\u043E\u043B\u043E\u0434\u043D\u044B\u0439 \u0427\u0430\u0439 Ice Tea (\u041B\u0438\u043C\u043E\u043D / \u041F\u0435\u0440\u0441\u0438\u043A)",
      en: "Ice Tea Lemon or Peach (0.5L)"
    },
    description: {
      qr: "Muzday, sar\u01F5ay\u01F5an limon yamasa shaftal\u0131 re\u0144li tetikleshtiriwshi muzli shoy.",
      uz: "Muzdek limon va shaftoli ta'mli salqin shirin chay.",
      ru: "\u041E\u0441\u0432\u0435\u0436\u0430\u044E\u0449\u0438\u0439 \u0445\u043E\u043B\u043E\u0434\u043D\u044B\u0439 \u0447\u0430\u0439 \u0441\u043E \u0432\u043A\u0443\u0441\u043E\u043C \u0441\u043E\u0447\u043D\u043E\u0433\u043E \u043B\u0438\u043C\u043E\u043D\u0430 \u0438\u043B\u0438 \u0441\u043F\u0435\u043B\u043E\u0433\u043E \u043F\u0435\u0440\u0441\u0438\u043A\u0430.",
      en: "Refreshing chilled iced tea with natural lemon or sweet peach flavors."
    },
    price: 11e3,
    category: "drinks",
    imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80",
    calories: 90,
    prepTime: 2,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: true,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["Muz", "Shoy ekstrakt\u0131", "Limon/Shaftal\u0131 sok\u0131"],
      uz: ["Muz", "Choy ekstrakti", "Limon/Shaftoli sharbati"],
      ru: ["\u041B\u0435\u0434", "\u042D\u043A\u0441\u0442\u0440\u0430\u043A\u0442 \u0447\u0430\u044F", "\u0421\u043E\u043A \u043B\u0438\u043C\u043E\u043D\u0430/\u043F\u0435\u0440\u0441\u0438\u043A\u0430"],
      en: ["Ice", "Tea Extract", "Lemon/Peach Juice"]
    },
    allergens: [],
    rating: 4.9,
    ratingCount: 165,
    reviews: [],
    nutrition: {
      protein: 0,
      fat: 0,
      carbs: 22
    }
  },
  {
    id: "food-mojito",
    title: {
      qr: "Mojito Fresh (Limon-Jalp\u0131z & Muz)",
      uz: "Moxito Fresh (Limon-Yalpiz)",
      ru: "\u0411\u0435\u0437\u0430\u043B\u043A\u043E\u0433\u043E\u043B\u044C\u043D\u044B\u0439 \u041C\u043E\u0445\u0438\u0442\u043E (\u041B\u0438\u043C\u043E\u043D \u0438 \u041C\u044F\u0442\u0430)",
      en: "Fresh Citrus Mint Virgin Mojito"
    },
    description: {
      qr: "Taza jalp\u0131z xosh iyisi, laym, muz h\xE1m Sprite aralashpas\u0131 menen tayarlan\u01F5an muzday kokteyl.",
      uz: "Yalpiz, laym, muz va Sprite bilan tayyorlangan salqin ichimlik.",
      ru: "\u041E\u0441\u0432\u0435\u0436\u0430\u044E\u0449\u0438\u0439 \u0431\u0435\u0437\u0430\u043B\u043A\u043E\u0433\u043E\u043B\u044C\u043D\u044B\u0439 \u043A\u043E\u043A\u0442\u0435\u0439\u043B\u044C \u0441\u043E \u0441\u0432\u0435\u0436\u0435\u0439 \u043C\u044F\u0442\u043E\u0439, \u043B\u0430\u0439\u043C\u043E\u043C, \u0434\u0440\u043E\u0431\u043B\u0435\u043D\u044B\u043C \u043B\u044C\u0434\u043E\u043C \u0438 \u0441\u043F\u0440\u0430\u0439\u0442\u043E\u043C.",
      en: "Crisp mocktail with crushed ice, fresh mint leaves, zesty lime, and sparkling soda."
    },
    price: 18e3,
    category: "drinks",
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
    calories: 110,
    prepTime: 5,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: true,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["Laym", "Taza jalp\u0131z", "Muz", "Sprite"],
      uz: ["Laym", "Yangi yalpiz", "Muz", "Sprite"],
      ru: ["\u041B\u0430\u0439\u043C", "\u0421\u0432\u0435\u0436\u0430\u044F \u043C\u044F\u0442\u0430", "\u041B\u0435\u0434", "\u0421\u043F\u0440\u0430\u0439\u0442"],
      en: ["Lime", "Fresh Mint", "Crushed Ice", "Sprite"]
    },
    allergens: [],
    rating: 4.95,
    ratingCount: 230,
    reviews: [],
    nutrition: {
      protein: 0,
      fat: 0,
      carbs: 26
    }
  },
  {
    id: "food-coffee-cappuccino",
    title: {
      qr: "Cappuccino / Americano (Arabica Kofe)",
      uz: "Kappuchino / Amerikano Kofe",
      ru: "\u041A\u043E\u0444\u0435 \u041A\u0430\u043F\u0443\u0447\u0438\u043D\u043E / \u0410\u043C\u0435\u0440\u0438\u043A\u0430\u043D\u043E (\u0410\u0440\u0430\u0431\u0438\u043A\u0430)",
      en: "Fresh Brewed Cappuccino / Americano"
    },
    description: {
      qr: "Taza t\xFAtilgen Arabica kofe d\xE1nlerinen tayarlan\u01F5an h\xE1m quyat s\xFAt ko'pigi menen.",
      uz: "Yangi tortilgan Arabika kofesi va yumshoq sut ko'pigi.",
      ru: "\u0410\u0440\u043E\u043C\u0430\u0442\u043D\u044B\u0439 \u043A\u043E\u0444\u0435 \u0438\u0437 \u0441\u0432\u0435\u0436\u0435\u043E\u0431\u0436\u0430\u0440\u0435\u043D\u043D\u044B\u0445 \u0437\u0435\u0440\u0435\u043D \u0410\u0440\u0430\u0431\u0438\u043A\u0438 \u0441 \u043D\u0435\u0436\u043D\u043E\u0439 \u043C\u043E\u043B\u043E\u0447\u043D\u043E\u0439 \u043F\u0435\u043D\u043A\u043E\u0439.",
      en: "Rich aromatic espresso made from 100% Arabica beans topped with silky steamed milk foam."
    },
    price: 16e3,
    category: "drinks",
    imageUrl: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80",
    calories: 85,
    prepTime: 5,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: true,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["Arabica kofe", "Taza s\xFAt", "Sheker"],
      uz: ["Arabika kofe", "Sut", "Shakar"],
      ru: ["\u041A\u043E\u0444\u0435 \u0410\u0440\u0430\u0431\u0438\u043A\u0430", "\u041C\u043E\u043B\u043E\u043A\u043E", "\u0421\u0430\u0445\u0430\u0440"],
      en: ["Arabica Coffee Beans", "Fresh Milk", "Sugar"]
    },
    allergens: ["dairy"],
    rating: 4.9,
    ratingCount: 175,
    reviews: [],
    nutrition: {
      protein: 4,
      fat: 3,
      carbs: 9
    }
  },
  // --- CAKEBUMER CAKES & DESSERTS ---
  {
    id: "food-cakebumer-redvelvet",
    title: {
      qr: "Cakebumer Red Velvet \u0422\u043E\u0440\u0442 (Krasnyy Barkhat)",
      uz: "Cakebumer Red Velvet Torti",
      ru: "\u0422\u043E\u0440\u0442 \u041A\u0440\u0430\u0441\u043D\u044B\u0439 \u0411\u0430\u0440\u0445\u0430\u0442 (Red Velvet Cakebumer)",
      en: "Cakebumer Red Velvet Cream Cheese Cake"
    },
    description: {
      qr: "Nukus Cakebumer brendining e\u0144 ataqli q\u0131z\u0131l velvet tort\u0131, krem-chiz h\xE1m valinli naq\u0131slar menen.",
      uz: "Nukus Cakebumer'ning krem-chizli mashhur qizil velvet torti.",
      ru: "\u041D\u0435\u0436\u043D\u0435\u0439\u0448\u0438\u0439 \u0444\u0438\u0440\u043C\u0435\u043D\u043D\u044B\u0439 \u0442\u043E\u0440\u0442 \u041D\u0443\u043A\u0443\u0441\u0430 \u0441 \u0441\u043E\u0447\u043D\u044B\u043C\u0438 \u0431\u0438\u0441\u043A\u0432\u0438\u0442\u043D\u044B\u043C\u0438 \u043A\u043E\u0440\u0436\u0430\u043C\u0438 \u0438 \u043A\u0440\u0435\u043C\u043E\u043C \u0438\u0437 \u0441\u043B\u0438\u0432\u043E\u0447\u043D\u043E\u0433\u043E \u0441\u044B\u0440\u0430.",
      en: "Nukus Cakebumer signature red velvet sponge cake layered with silky cream cheese frosting."
    },
    price: 28e3,
    category: "desserts",
    imageUrl: "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=800&q=80",
    calories: 390,
    prepTime: 5,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: false,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["Velvet biskvit", "Krem-chiz pishloq", "S\xFAt qayma\u01F5\u0131", "Vanil"],
      uz: ["Velvet biskvit", "Krem-chiz", "Sut qaymog'i", "Vanil"],
      ru: ["\u0411\u0430\u0440\u0445\u0430\u0442\u043D\u044B\u0439 \u0431\u0438\u0441\u043A\u0432\u0438\u0442", "\u0421\u043B\u0438\u0432\u043E\u0447\u043D\u044B\u0439 \u0441\u044B\u0440 Cream Cheese", "\u0421\u043B\u0438\u0432\u043A\u0438", "\u0412\u0430\u043D\u0438\u043B\u044C"],
      en: ["Velvet Sponge", "Cream Cheese", "Whipped Cream", "Vanilla"]
    },
    allergens: ["gluten", "dairy", "eggs"],
    rating: 4.95,
    ratingCount: 380,
    reviews: [
      {
        id: "rev-rv1",
        userName: "Kamila N.",
        rating: 5,
        comment: "Cakebumer Red Velvet neshshe j\u0131ldan berli e\u0144 jaqs\u0131 ko'rgen tort\u0131m!",
        date: "2026-07-25"
      }
    ],
    nutrition: {
      protein: 6,
      fat: 18,
      carbs: 52
    }
  },
  {
    id: "food-san-sebastian",
    title: {
      qr: "San Sebastian Cheesecake (Shokolad menen)",
      uz: "San Sebastian Chizkeyk (Issiq shokoladli)",
      ru: "\u0427\u0438\u0437\u043A\u0435\u0439\u043A \u0421\u0430\u043D-\u0421\u0435\u0431\u0430\u0441\u0442\u044C\u044F\u043D \u0441 \u0433\u043E\u0440\u044F\u0447\u0438\u043C \u0448\u043E\u043A\u043E\u043B\u0430\u0434\u043E\u043C",
      en: "San Sebastian Burnt Cheesecake with Chocolate"
    },
    description: {
      qr: "Ishin jumsaq, \xFAsti q\u0131zargan ispan chizkeyki, \u0131ss\u0131 belgiya shokolad\u0131 tusl\u0131\u01F5\u0131 menen us\u0131n\u0131lad\u0131.",
      uz: "Issiq shokoladli sous bilan tortiladigan mashhur chizkeyk.",
      ru: "\u0417\u043D\u0430\u043C\u0435\u043D\u0438\u0442\u044B\u0439 \u0431\u0430\u0441\u043A\u0441\u043A\u0438\u0439 \u043E\u0431\u043E\u0436\u0436\u0435\u043D\u043D\u044B\u0439 \u0447\u0438\u0437\u043A\u0435\u0439\u043A \u0441 \u043D\u0435\u0436\u043D\u043E\u0439 \u0442\u0435\u043A\u0441\u0442\u0443\u0440\u043E\u0439 \u0438 \u0433\u043E\u0440\u044F\u0447\u0438\u043C \u0431\u0435\u043B\u044C\u0433\u0438\u0439\u0441\u043A\u0438\u043C \u0448\u043E\u043A\u043E\u043B\u0430\u0434\u043E\u043C.",
      en: "Rich creamy Basque burnt cheesecake drizzled with warm Belgian chocolate sauce."
    },
    price: 34e3,
    category: "desserts",
    imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80",
    calories: 420,
    prepTime: 5,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: false,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["S\xFAt pishlo\u01F5\u0131", "Shokolad", "Jumurtqa", "S\xFAt qayma\u01F5\u0131"],
      uz: ["Pishloq", "Shokolad", "Tuxum", "Sut qaymog'i"],
      ru: ["\u0422\u0432\u043E\u0440\u043E\u0436\u043D\u044B\u0439 \u0441\u044B\u0440", "\u0411\u0435\u043B\u044C\u0433\u0438\u0439\u0441\u043A\u0438\u0439 \u0448\u043E\u043A\u043E\u043B\u0430\u0434", "\u042F\u0439\u0446\u0430", "\u0421\u043B\u0438\u0432\u043A\u0438"],
      en: ["Cream Cheese", "Belgian Chocolate", "Eggs", "Cream"]
    },
    allergens: ["dairy", "eggs"],
    rating: 4.9,
    ratingCount: 220,
    reviews: [],
    nutrition: {
      protein: 8,
      fat: 26,
      carbs: 38
    }
  },
  {
    id: "food-cakebumer-honey",
    title: {
      qr: "Cakebumer Special Bal \u0422\u043E\u0440\u0442 (Medovik)",
      uz: "Cakebumer Asalli Tort (Medovik)",
      ru: "\u0424\u0438\u0440\u043C\u0435\u043D\u043D\u044B\u0439 \u041C\u0435\u0434\u043E\u0432\u0438\u043A Cakebumer",
      en: "Cakebumer Signature Honey Cake"
    },
    description: {
      qr: "Bal qam\u0131r qatlamlar\u0131, t\u0259biy s\xFAt qayma\u01F5\u0131 h\xE1m jan\u01F5aq boylar\u0131 menen juqa tayarlan\u01F5an shirinlik.",
      uz: "Sut qaymog'i va ionalar bilan tayyorlangan mayin asalli tort.",
      ru: "\u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043C\u0435\u0434\u043E\u0432\u0438\u043A \u043D\u0430 \u043D\u0430\u0442\u0443\u0440\u0430\u043B\u044C\u043D\u043E\u043C \u043C\u0435\u0434\u0435 \u0441\u043E \u0432\u0437\u0431\u0438\u0442\u044B\u043C\u0438 \u0441\u043B\u0438\u0432\u043A\u0430\u043C\u0438 \u0438 \u0433\u0440\u0435\u0446\u043A\u0438\u043C\u0438 \u043E\u0440\u0435\u0445\u0430\u043C\u0438.",
      en: "Layers of wildflower honey biscuits separated by light whipped cream and crushed walnuts."
    },
    price: 3e4,
    category: "desserts",
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
    calories: 410,
    prepTime: 5,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: false,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["T\xE1biy bal", "S\xFAt qayma\u01F5\u0131", "Jan\u01F5aq", "Un", "Sar\u0131 moy"],
      uz: ["Asal", "Sut qaymog'i", "Yong'oq", "Un", "Sari yog'"],
      ru: ["\u041C\u0435\u0434", "\u0421\u043B\u0438\u0432\u043A\u0438", "\u0413\u0440\u0435\u0446\u043A\u0438\u0435 \u043E\u0440\u0435\u0445\u0438", "\u041C\u0443\u043A\u0430", "\u0421\u043B\u0438\u0432\u043E\u0447\u043D\u043E\u0435 \u043C\u0430\u0441\u043B\u043E"],
      en: ["Honey", "Fresh Cream", "Walnuts", "Flour", "Butter"]
    },
    allergens: ["gluten", "dairy", "nuts"],
    rating: 4.95,
    ratingCount: 310,
    reviews: [],
    nutrition: {
      protein: 7,
      fat: 22,
      carbs: 58
    }
  },
  // --- NATIONAL KARAKALPAK SPECIALTIES ---
  {
    id: "food-1",
    title: {
      qr: "Qaraqalpaqsha Tughrama",
      uz: "Qoraqalpoqcha Tug'rama",
      ru: "\u041A\u0430\u0440\u0430\u043A\u0430\u043B\u043F\u0430\u043A\u0441\u043A\u0430\u044F \u0422\u0443\u0433\u0440\u0430\u043C\u0430",
      en: "Karakalpak Tughrama"
    },
    description: {
      qr: "D\xE1st\xFArli qaraqalpaq milliy ta\u01F5am\u0131. Maydalangan semiz s\u0131y\u0131r h\xE1m j\u0131lq\u0131 go'shi, qatlama qam\u0131r h\xE1m xosh boyl\u0131 sorpa menen us\u0131n\u0131lad\u0131.",
      uz: "An'anaviy qoraqalpoq milliy taomi. Maydalangan semiz mol va ot go'shti, qatlama xamir va xushbo'y sho'rva bilan tortiladi.",
      ru: "\u0422\u0440\u0430\u0434\u0438\u0446\u0438\u043E\u043D\u043D\u043E\u0435 \u043A\u0430\u0440\u0430\u043A\u0430\u043B\u043F\u0430\u043A\u0441\u043A\u043E\u0435 \u0431\u043B\u044E\u0434\u043E. \u041C\u0435\u043B\u043A\u043E \u0440\u0443\u0431\u043B\u0435\u043D\u0430\u044F \u0433\u043E\u0432\u044F\u0434\u0438\u043D\u0430 \u0438 \u043A\u043E\u043D\u0438\u043D\u0430 \u0441 \u0434\u043E\u043C\u0430\u0448\u043D\u0435\u0439 \u043B\u0430\u043F\u0448\u043E\u0439 \u0438 \u0430\u0440\u043E\u043C\u0430\u0442\u043D\u044B\u043C \u0431\u0443\u043B\u044C\u043E\u043D\u043E\u043C.",
      en: "Authentic Karakalpak delicacy. Finely chopped tender beef and horsemeat served with handmade dough strips and rich broth."
    },
    price: 48e3,
    category: "national",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    calories: 620,
    prepTime: 25,
    spicyLevel: 0,
    isVegetarian: false,
    isGlutenFree: false,
    isHalal: true,
    isNationalSpecial: true,
    isAvailable: true,
    ingredients: {
      qr: ["S\u0131y\u0131r go'shi", "J\u0131lq\u0131 go'shi", "Un", "Moy", "Piyaz", "Qara bur\u0131sh", "Zira"],
      uz: ["Mol go'shti", "Ot go'shti", "Un", "Yog'", "Piyoz", "Murch", "Zira"],
      ru: ["\u0413\u043E\u0432\u044F\u0434\u0438\u043D\u0430", "\u041A\u043E\u043D\u0438\u043D\u0430", "\u041C\u0443\u043A\u0430", "\u041C\u0430\u0441\u043B\u043E", "\u041B\u0443\u043A", "\u0427\u0435\u0440\u043D\u044B\u0439 \u043F\u0435\u0440\u0435\u0446", "\u0417\u0438\u0440\u0430"],
      en: ["Beef", "Horsemeat", "Flour", "Butter", "Onion", "Black Pepper", "Cumin"]
    },
    allergens: ["gluten"],
    rating: 4.9,
    ratingCount: 128,
    reviews: [
      {
        id: "rev-1",
        userName: "Aydos Qabulov",
        rating: 5,
        comment: "Tuwr\u0131 Nukus milliy lezzeti! Tughrama l\u0259zzetli h\xE1m sorpas\u0131 xosh boyl\u0131.",
        date: "2026-07-20"
      }
    ],
    nutrition: {
      protein: 42,
      fat: 28,
      carbs: 45
    }
  },
  {
    id: "food-2",
    title: {
      qr: "Juwery Gurtuk (J\xFAweri Gurtik)",
      uz: "Javdari Gurtuk",
      ru: "\u0414\u0436\u0443\u0432\u0435\u0440\u0438 \u0413\u0443\u0440\u0442\u0443\u043A (\u041F\u0435\u043B\u044C\u043C\u0435\u043D\u0438 \u0438\u0437 \u0441\u043E\u0440\u0433\u043E)",
      en: "Sorghum Dumplings (Juwery Gurtuk)"
    },
    description: {
      qr: "Qaraqalpaq xalq\u0131n\u0131\u0144 \xE1yyemgi d\xE1st\xFArli j\xFAweri un\u0131nan tayarlan\u01F5an gurtikleri h\xE1m qaynat\u0131l\u01F5an sirke go'shi.",
      uz: "Qoraqalpoq xalqining qadimiy taomi, makkajo'xori va javdari unidan tayyorlangan gurtuk va go'sht.",
      ru: "\u0423\u043D\u0438\u043A\u0430\u043B\u044C\u043D\u043E\u0435 \u0441\u0442\u0430\u0440\u0438\u043D\u043D\u043E\u0435 \u0431\u043B\u044E\u0434\u043E \u041A\u0430\u0440\u0430\u043A\u0430\u043B\u043F\u0430\u043A\u0441\u0442\u0430\u043D\u0430 \u0438\u0437 \u0441\u043E\u0440\u0433\u043E\u0432\u043E\u0439 \u043C\u0443\u043A\u0438 \u0441 \u043E\u0442\u0432\u0430\u0440\u043D\u043E\u0439 \u0433\u043E\u0432\u044F\u0434\u0438\u043D\u043E\u0439.",
      en: "Ancient Karakalpak specialty made with sorghum flour dumplings and tender boiled beef."
    },
    price: 42e3,
    category: "national",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    calories: 510,
    prepTime: 30,
    spicyLevel: 0,
    isVegetarian: false,
    isGlutenFree: true,
    isHalal: true,
    isNationalSpecial: true,
    isAvailable: true,
    ingredients: {
      qr: ["J\xFAweri un\u0131", "S\u0131y\u0131r go'shi", "Qat\u0131q", "Sar\u0131 moy", "Sar\u0131msoq"],
      uz: ["Javdari un", "Mol go'shti", "Qatiq", "Sari yog'", "Sar\u0131msaq"],
      ru: ["\u0421\u043E\u0440\u0433\u043E\u0432\u0430\u044F \u043C\u0443\u043A\u0430", "\u0413\u043E\u0432\u044F\u0434\u0438\u043D\u0430", "\u041A\u0430\u0442\u044B\u043A", "\u0421\u043B\u0438\u0432\u043E\u0447\u043D\u043E\u0435 \u043C\u0430\u0441\u043B\u043E", "\u0427\u0435\u0441\u043D\u043E\u043A"],
      en: ["Sorghum Flour", "Beef", "Kefir/Qatiq", "Butter", "Garlic"]
    },
    allergens: ["dairy"],
    rating: 4.8,
    ratingCount: 94,
    reviews: [],
    nutrition: {
      protein: 35,
      fat: 18,
      carbs: 52
    }
  },
  {
    id: "food-3",
    title: {
      qr: "Qaraqalpaqsha Beshbaarmak (Qaz\u0131 menen)",
      uz: "Qoraqalpoqcha Beshbarmoq",
      ru: "\u0411\u0435\u0448\u0431\u0430\u0440\u043C\u0430\u043A \u043F\u043E-\u043A\u0430\u0440\u0430\u043A\u0430\u043B\u043F\u0430\u043A\u0441\u043A\u0438 \u0441 \u041A\u0430\u0437\u044B",
      en: "Karakalpak Beshbarmak with Qazy"
    },
    description: {
      qr: "S\u0131y\u0131r h\xE1m j\u0131lq\u0131 go'shinen jasal\u01F5an qaz\u0131-qarta, juqa jaz\u0131l\u01F5an qam\u0131r h\xE1m xosh boyl\u0131 sorpa tusl\u0131\u01F5\u0131.",
      uz: "Mol va ot go'shti, qazi-qarta, yupqa xamir va totli sho'rva.",
      ru: "\u041F\u0440\u0430\u0437\u0434\u043D\u0438\u0447\u043D\u043E\u0435 \u0431\u043B\u044E\u0434\u043E \u0438\u0437 \u043D\u0435\u0436\u043D\u043E\u0433\u043E \u043C\u044F\u0441\u0430, \u0434\u0435\u043B\u0438\u043A\u0430\u0442\u0435\u0441\u043D\u043E\u0433\u043E \u043A\u0430\u0437\u044B \u0438 \u0434\u043E\u043C\u0430\u0448\u043D\u0435\u0439 \u0441\u043E\u0447\u043D\u043E\u0439 \u043B\u0430\u043F\u0448\u0438.",
      en: "Feast dish featuring tender beef, gourmet horsemeat qazy sausages, thin pasta ribbons, and onion broth."
    },
    price: 65e3,
    category: "national",
    imageUrl: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80",
    calories: 780,
    prepTime: 35,
    spicyLevel: 0,
    isVegetarian: false,
    isGlutenFree: false,
    isHalal: true,
    isNationalSpecial: true,
    isAvailable: true,
    ingredients: {
      qr: ["Qaz\u0131-qarta", "J\u0131lq\u0131 go'shi", "Un", "Piyaz tusl\u0131\u01F5\u0131", "Gazi boylar"],
      uz: ["Qazi", "Ot go'shti", "Un", "Piyozli sous", "Ziravorlar"],
      ru: ["\u041A\u0430\u0437\u044B", "\u041A\u043E\u043D\u0438\u043D\u0430", "\u041C\u0443\u043A\u0430", "\u041B\u0443\u043A\u043E\u0432\u044B\u0439 \u0442\u0443\u0437\u043B\u0443\u043A", "\u0421\u043F\u0435\u0446\u0438\u0438"],
      en: ["Qazy Sausage", "Horsemeat", "Wheat Flour", "Onion Sauce", "Spices"]
    },
    allergens: ["gluten"],
    rating: 5,
    ratingCount: 210,
    reviews: [],
    nutrition: {
      protein: 54,
      fat: 36,
      carbs: 60
    }
  },
  // --- MEATS & KEBABS ---
  {
    id: "food-tandir-kebap",
    title: {
      qr: "Tandir Kebap (Qoy go'shinen)",
      uz: "Tandir Kebab (Qo'y go'shtidan)",
      ru: "\u0422\u0430\u043D\u0434\u044B\u0440 \u041A\u0435\u0431\u0430\u0431 \u0438\u0437 \u0431\u0430\u0440\u0430\u043D\u0438\u043D\u044B",
      en: "Tandoor Lamb Kebap"
    },
    description: {
      qr: "D\xE1st\xFArli \u0131lay tand\u0131rda arsha tut\u0131n\u0131nda 2 saat pisirilgen jumsaq qoy go'shi h\xE1m piyaz.",
      uz: "Tandirda pishirilgan yumshoq qo'y go'shti.",
      ru: "\u041D\u0435\u0436\u043D\u0430\u044F \u0431\u0430\u0440\u0430\u043D\u0438\u043D\u0430, \u0437\u0430\u043F\u0435\u0447\u0435\u043D\u043D\u0430\u044F \u0432 \u0433\u043B\u0438\u043D\u044F\u043D\u043E\u043C \u0442\u0430\u043D\u0434\u044B\u0440\u0435 \u043D\u0430 \u0432\u0435\u0442\u043A\u0430\u0445 \u043C\u043E\u0436\u0436\u0435\u0432\u0435\u043B\u044C\u043D\u0438\u043A\u0430.",
      en: "Succulent lamb slow-baked in a clay tandoor oven infused with juniper herbs."
    },
    price: 58e3,
    category: "meats",
    imageUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80",
    calories: 690,
    prepTime: 25,
    spicyLevel: 1,
    isVegetarian: false,
    isGlutenFree: true,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["Qoy go'shi", "Tand\u0131r piyaz\u0131", "Zira", "Kashnich", "Tuz"],
      uz: ["Qo'y go'shti", "Piyoz", "Zira", "Kashnich", "Tuz"],
      ru: ["\u0411\u0430\u0440\u0430\u043D\u0438\u043D\u0430", "\u041B\u0443\u043A", "\u0417\u0438\u0440\u0430", "\u041A\u043E\u0440\u0438\u0430\u043D\u0434\u0440", "\u0421\u043E\u043B\u044C"],
      en: ["Lamb", "Onions", "Cumin", "Coriander", "Salt"]
    },
    allergens: [],
    rating: 4.9,
    ratingCount: 150,
    reviews: [],
    nutrition: {
      protein: 48,
      fat: 38,
      carbs: 4
    }
  },
  {
    id: "food-somsa",
    title: {
      qr: "Tandir Somsa (Go'shli h\xE1m Piyazl\u0131)",
      uz: "Tandir Somsa",
      ru: "\u0422\u0430\u043D\u0434\u044B\u0440\u043D\u0430\u044F \u0421\u0430\u043C\u0441\u0430 \u0441 \u043C\u044F\u0441\u043E\u043C",
      en: "Crispy Tandoor Somsa"
    },
    description: {
      qr: "Qatlama juqa qam\u0131r h\xE1m sochli s\u0131y\u0131r go'shi tolt\u0131r\u0131l\u01F5an d\xE1st\xFArli tand\u0131r somsa.",
      uz: "Yupqa qatlama xamir va mol go'shti solingan tandir somsa.",
      ru: "\u0425\u0440\u0443\u0441\u0442\u044F\u0449\u0430\u044F \u0441\u043B\u043E\u0435\u043D\u0430\u044F \u0441\u0430\u043C\u0441\u0430 \u0441 \u0441\u043E\u0447\u043D\u043E\u0439 \u0433\u043E\u0432\u044F\u0434\u0438\u043D\u043E\u0439 \u0438 \u043B\u0443\u043A\u043E\u043C \u0438\u0437 \u0442\u0430\u043D\u0434\u044B\u0440\u0430.",
      en: "Golden layered pastry filled with spiced diced beef and sweet onions."
    },
    price: 12e3,
    category: "meats",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    calories: 320,
    prepTime: 15,
    spicyLevel: 0,
    isVegetarian: false,
    isGlutenFree: false,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["S\u0131y\u0131r go'shi", "Un", "Sar\u0131 moy", "Piyaz", "Zira"],
      uz: ["Mol go'shti", "Un", "Sari yog'", "Piyoz", "Zira"],
      ru: ["\u0413\u043E\u0432\u044F\u0434\u0438\u043D\u0430", "\u041C\u0443\u043A\u0430", "\u041C\u0430\u0441\u043B\u043E", "\u041B\u0443\u043A", "\u0417\u0438\u0440\u0430"],
      en: ["Beef", "Flour", "Butter", "Onions", "Cumin"]
    },
    allergens: ["gluten"],
    rating: 4.8,
    ratingCount: 180,
    reviews: [],
    nutrition: {
      protein: 16,
      fat: 18,
      carbs: 28
    }
  },
  // --- TRADITIONAL DAIRY DRINKS ---
  {
    id: "food-qimiz",
    title: {
      qr: "Taza Sh\u0131pal\u0131 Q\u0131m\u0131z (1 Litr)",
      uz: "Shifobaxsh Qimiz (1 Litr)",
      ru: "\u041B\u0435\u0447\u0435\u0431\u043D\u044B\u0439 \u041A\u0443\u043C\u044B\u0441 \u0438\u0437 \u043A\u043E\u0431\u044B\u043B\u044C\u0435\u0433\u043E \u043C\u043E\u043B\u043E\u043A\u0430 (1 \u041B)",
      en: "Fresh Fermented Kumis Mare Milk (1L)"
    },
    description: {
      qr: "Qaraqalpaqstan dalalar\u0131nan keshken taza beye sutinen tayarlan\u01F5an, densawl\u0131qqa paydal\u0131 shiftal\u0131 milliy ishimlik.",
      uz: "Tabiiy biya sutidan tayyorlangan shifobaxsh milliy ichimlik.",
      ru: "\u0422\u0440\u0430\u0434\u0438\u0446\u0438\u043E\u043D\u043D\u044B\u0439 \u043E\u0441\u0432\u0435\u0436\u0430\u044E\u0449\u0438\u0439 \u0444\u0435\u0440\u043C\u0435\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043D\u0430\u043F\u0438\u0442\u043E\u043A \u0438\u0437 \u0447\u0438\u0441\u0442\u043E\u0433\u043E \u043A\u043E\u0431\u044B\u043B\u044C\u0435\u0433\u043E \u043C\u043E\u043B\u043E\u043A\u0430.",
      en: "Healthy traditional fermented mare's milk rich in natural vitamins."
    },
    price: 22e3,
    category: "drinks",
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80",
    calories: 180,
    prepTime: 5,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: true,
    isHalal: true,
    isNationalSpecial: true,
    isAvailable: true,
    ingredients: {
      qr: ["Beye s\xFCt\u0131", "Ach\u0131tq\u0131"],
      uz: ["Biya suti", "Achitqi"],
      ru: ["\u041A\u043E\u0431\u044B\u043B\u044C\u0435 \u043C\u043E\u043B\u043E\u043A\u043E", "\u0417\u0430\u043A\u0432\u0430\u0441\u043A\u0430"],
      en: ["Mare's Milk", "Natural Starter Culture"]
    },
    allergens: ["dairy"],
    rating: 4.9,
    ratingCount: 88,
    reviews: [],
    nutrition: {
      protein: 8,
      fat: 6,
      carbs: 12
    }
  },
  {
    id: "food-shubat",
    title: {
      qr: "Qaraqalpaq Shubat (T\xFAye S\xFAt\u0131 - 1 Litr)",
      uz: "Qoraqalpoq Shubat (Tuya suti - 1 Litr)",
      ru: "\u0428\u0443\u0431\u0430\u0442 \u0438\u0437 \u0432\u0435\u0440\u0431\u043B\u044E\u0436\u044C\u0435\u0433\u043E \u043C\u043E\u043B\u043E\u043A\u0430 (1 \u041B)",
      en: "Shubat Fermented Camel Milk (1L)"
    },
    description: {
      qr: "Q\u0131z\u0131lqum dalalar\u0131nda ba\u01F5\u0131l\u01F5an t\xFAyeler s\xFCtinen a\u015F\u0131t\u0131l\u01F5an milliy delikates ishimlik.",
      uz: "Qizilqum tuya sutidan tayyorlangan shifobaxsh ichimlik.",
      ru: "\u0413\u0443\u0441\u0442\u043E\u0439 \u043B\u0435\u0447\u0435\u0431\u043D\u044B\u0439 \u043D\u0430\u043F\u0438\u0442\u043E\u043A \u0438\u0437 \u043F\u0430\u0440\u043D\u043E\u0433\u043E \u0432\u0435\u0440\u0431\u043B\u044E\u0436\u044C\u0435\u0433\u043E \u043C\u043E\u043B\u043E\u043A\u0430 \u043F\u0443\u0441\u0442\u044B\u043D\u0438 \u041A\u044B\u0437\u044B\u043B\u043A\u0443\u043C.",
      en: "Rich creamy fermented camel milk directly from Kyzylkum desert farms."
    },
    price: 28e3,
    category: "drinks",
    imageUrl: "https://images.unsplash.com/photo-1528498033373-3c6c08e93d79?auto=format&fit=crop&w=800&q=80",
    calories: 220,
    prepTime: 5,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: true,
    isHalal: true,
    isNationalSpecial: true,
    isAvailable: true,
    ingredients: {
      qr: ["T\xFAye s\xFCt\u0131", "Tabiiy ach\u0131tq\u0131"],
      uz: ["Tuya suti", "Achitqi"],
      ru: ["\u0412\u0435\u0440\u0431\u043B\u044E\u0436\u044C\u0435 \u043C\u043E\u043B\u043E\u043A\u043E", "\u0417\u0430\u043A\u0432\u0430\u0441\u043A\u0430"],
      en: ["Camel Milk", "Natural Culture"]
    },
    allergens: ["dairy"],
    rating: 5,
    ratingCount: 72,
    reviews: [],
    nutrition: {
      protein: 10,
      fat: 11,
      carbs: 14
    }
  }
];

// src/db/index.ts
var connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_echtZN2TL3Hz@ep-green-haze-bdwhgt4v-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require";
var sql = neon(connectionString);
var cachedFoods = [...initialFoodItems];
var cachedOrders = [];
var cachedCalls = [];
var cachedSettings = {
  telegramUsername: "sifaddinov",
  instagramUsername: "sifaddinovv"
};
async function getFoods() {
  try {
    const rows = await sql`SELECT data FROM foods ORDER BY created_at ASC;`;
    if (rows && rows.length > 0) {
      cachedFoods = rows.map((r) => r.data);
    }
    return cachedFoods;
  } catch (err) {
    console.error("[NEON DB] Failed to fetch foods, using cache:", err);
    return cachedFoods;
  }
}
async function addFood(item) {
  try {
    await sql`
      INSERT INTO foods (id, category, price, data)
      VALUES (${item.id}, ${item.category || "other"}, ${item.price || 0}, ${JSON.stringify(item)})
      ON CONFLICT (id) DO UPDATE SET
        category = EXCLUDED.category,
        price = EXCLUDED.price,
        data = EXCLUDED.data,
        updated_at = NOW();
    `;
    cachedFoods = [item, ...cachedFoods.filter((f) => f.id !== item.id)];
    return item;
  } catch (err) {
    console.error("[NEON DB] Failed to add food:", err);
    throw err;
  }
}
async function updateFood(id, updated) {
  try {
    const existing = await sql`SELECT data FROM foods WHERE id = ${id} LIMIT 1;`;
    let currentData = existing && existing.length > 0 ? existing[0].data : cachedFoods.find((f) => f.id === id) || initialFoodItems.find((f) => f.id === id);
    const merged = {
      ...currentData || initialFoodItems[0],
      ...updated,
      id
    };
    await sql`
      INSERT INTO foods (id, category, price, data)
      VALUES (${id}, ${merged.category || "other"}, ${merged.price || 0}, ${JSON.stringify(merged)})
      ON CONFLICT (id) DO UPDATE SET
        category = EXCLUDED.category,
        price = EXCLUDED.price,
        data = EXCLUDED.data,
        updated_at = NOW();
    `;
    cachedFoods = cachedFoods.map((f) => f.id === id ? merged : f);
    if (!cachedFoods.some((f) => f.id === id)) {
      cachedFoods.push(merged);
    }
    return merged;
  } catch (err) {
    console.error("[NEON DB] Failed to update food:", err);
    throw err;
  }
}
async function deleteFood(id) {
  try {
    await sql`DELETE FROM foods WHERE id = ${id};`;
    cachedFoods = cachedFoods.filter((f) => f.id !== id);
    return true;
  } catch (err) {
    console.error("[NEON DB] Failed to delete food:", err);
    throw err;
  }
}
async function getOrders() {
  try {
    const rows = await sql`SELECT data FROM orders ORDER BY created_at DESC;`;
    if (rows) {
      cachedOrders = rows.map((r) => r.data);
    }
    return cachedOrders;
  } catch (err) {
    console.error("[NEON DB] Failed to fetch orders, using cache:", err);
    return cachedOrders;
  }
}
async function createOrder(order) {
  try {
    const existing = await sql`SELECT data FROM orders WHERE id = ${order.id} LIMIT 1;`;
    if (existing && existing.length > 0) {
      return existing[0].data;
    }
    await sql`
      INSERT INTO orders (id, table_number, total_amount, status, data)
      VALUES (
        ${order.id},
        ${String(order.tableNumber)},
        ${Number(order.totalAmount || 0)},
        ${order.status || "preparing"},
        ${JSON.stringify(order)}
      )
      ON CONFLICT (id) DO NOTHING;
    `;
    cachedOrders = [order, ...cachedOrders.filter((o) => o.id !== order.id)];
    return order;
  } catch (err) {
    console.error("[NEON DB] Failed to create order:", err);
    throw err;
  }
}
async function updateOrderStatus(id, status) {
  try {
    const existing = await sql`SELECT data FROM orders WHERE id = ${id} LIMIT 1;`;
    if (!existing || existing.length === 0) return null;
    const currentOrder = existing[0].data;
    currentOrder.status = status;
    await sql`
      UPDATE orders
      SET status = ${status},
          data = ${JSON.stringify(currentOrder)},
          updated_at = NOW()
      WHERE id = ${id};
    `;
    cachedOrders = cachedOrders.map((o) => o.id === id ? currentOrder : o);
    return currentOrder;
  } catch (err) {
    console.error("[NEON DB] Failed to update order status:", err);
    throw err;
  }
}
async function deleteOrder(id) {
  try {
    await sql`DELETE FROM orders WHERE id = ${id};`;
    cachedOrders = cachedOrders.filter((o) => o.id !== id);
    return true;
  } catch (err) {
    console.error("[NEON DB] Failed to delete order:", err);
    throw err;
  }
}
async function getWaiterCalls() {
  try {
    const rows = await sql`SELECT data FROM waiter_calls ORDER BY created_at DESC;`;
    if (rows) {
      cachedCalls = rows.map((r) => r.data);
    }
    return cachedCalls;
  } catch (err) {
    console.error("[NEON DB] Failed to fetch waiter calls, using cache:", err);
    return cachedCalls;
  }
}
async function createWaiterCall(call) {
  try {
    await sql`
      INSERT INTO waiter_calls (id, table_number, type, status, timestamp, data)
      VALUES (
        ${call.id},
        ${String(call.tableNumber)},
        ${call.type || "waiter"},
        ${call.status || "active"},
        ${call.timestamp || "12:00"},
        ${JSON.stringify(call)}
      )
      ON CONFLICT (id) DO NOTHING;
    `;
    cachedCalls = [call, ...cachedCalls.filter((c) => c.id !== call.id)];
    return call;
  } catch (err) {
    console.error("[NEON DB] Failed to create waiter call:", err);
    throw err;
  }
}
async function resolveWaiterCall(id) {
  try {
    const existing = await sql`SELECT data FROM waiter_calls WHERE id = ${id} LIMIT 1;`;
    if (!existing || existing.length === 0) return null;
    const currentCall = existing[0].data;
    currentCall.status = "resolved";
    await sql`
      UPDATE waiter_calls
      SET status = 'resolved',
          data = ${JSON.stringify(currentCall)},
          updated_at = NOW()
      WHERE id = ${id};
    `;
    cachedCalls = cachedCalls.map((c) => c.id === id ? currentCall : c);
    return currentCall;
  } catch (err) {
    console.error("[NEON DB] Failed to resolve waiter call:", err);
    throw err;
  }
}
async function deleteWaiterCall(id) {
  try {
    await sql`DELETE FROM waiter_calls WHERE id = ${id};`;
    cachedCalls = cachedCalls.filter((c) => c.id !== id);
    return true;
  } catch (err) {
    console.error("[NEON DB] Failed to delete waiter call:", err);
    throw err;
  }
}
async function getSettings() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `;
    const rows = await sql`SELECT key, value FROM settings;`;
    if (rows && rows.length > 0) {
      const res = { ...cachedSettings };
      rows.forEach((r) => {
        if (r.key === "telegram_username") res.telegramUsername = r.value;
        if (r.key === "instagram_username") res.instagramUsername = r.value;
      });
      cachedSettings = res;
    }
    return cachedSettings;
  } catch (err) {
    console.error("[NEON DB] Failed to fetch settings, using cache:", err);
    return cachedSettings;
  }
}
async function updateSettings(settings) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `;
    if (settings.telegramUsername !== void 0) {
      const cleanTg = settings.telegramUsername.replace(/^https?:\/\/(www\.)?t\.me\//i, "").replace(/^https?:\/\/(www\.)?telegram\.me\//i, "").replace(/^t\.me\//i, "").replace(/^@/, "").replace(/\/$/, "").trim();
      await sql`
        INSERT INTO settings (key, value)
        VALUES ('telegram_username', ${cleanTg})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
      `;
      cachedSettings.telegramUsername = cleanTg;
    }
    if (settings.instagramUsername !== void 0) {
      const cleanInsta = settings.instagramUsername.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/^instagram\.com\//i, "").replace(/^@/, "").replace(/\/$/, "").trim();
      await sql`
        INSERT INTO settings (key, value)
        VALUES ('instagram_username', ${cleanInsta})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
      `;
      cachedSettings.instagramUsername = cleanInsta;
    }
    return cachedSettings;
  } catch (err) {
    console.error("[NEON DB] Failed to update settings:", err);
    throw err;
  }
}
async function getSyncData() {
  try {
    const [ordersRows, callsRows, foodsRows, settingsRows] = await Promise.all([
      sql`SELECT data FROM orders ORDER BY created_at DESC;`,
      sql`SELECT data FROM waiter_calls ORDER BY created_at DESC;`,
      sql`SELECT data FROM foods ORDER BY created_at ASC;`,
      sql`SELECT key, value FROM settings;`.catch(() => [])
    ]);
    const orders = ordersRows.map((r) => r.data);
    const waiterCalls = callsRows.map((r) => r.data);
    const foods = foodsRows.length > 0 ? foodsRows.map((r) => r.data) : initialFoodItems;
    if (settingsRows && settingsRows.length > 0) {
      settingsRows.forEach((r) => {
        if (r.key === "telegram_username") cachedSettings.telegramUsername = r.value;
        if (r.key === "instagram_username") cachedSettings.instagramUsername = r.value;
      });
    }
    cachedOrders = orders;
    cachedCalls = waiterCalls;
    cachedFoods = foods;
    return {
      orders,
      waiterCalls,
      foods,
      settings: cachedSettings,
      serverTime: Date.now()
    };
  } catch (err) {
    console.error("[NEON DB] Failed to get sync data, using cache:", err);
    return {
      orders: cachedOrders,
      waiterCalls: cachedCalls,
      foods: cachedFoods,
      settings: cachedSettings,
      serverTime: Date.now()
    };
  }
}
async function saveImage(id, mimeType, base64Data) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS images (
        id TEXT PRIMARY KEY,
        mime_type TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await sql`
      INSERT INTO images (id, mime_type, data)
      VALUES (${id}, ${mimeType}, ${base64Data})
      ON CONFLICT (id) DO UPDATE SET
        mime_type = EXCLUDED.mime_type,
        data = EXCLUDED.data,
        created_at = NOW();
    `;
    return `/api/images/${id}`;
  } catch (err) {
    console.error("[NEON DB] Failed to save image:", err);
    throw err;
  }
}
async function getImage(id) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS images (
        id TEXT PRIMARY KEY,
        mime_type TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    const rows = await sql`SELECT mime_type, data FROM images WHERE id = ${id} LIMIT 1;`;
    if (rows && rows.length > 0) {
      return {
        mimeType: rows[0].mime_type,
        data: rows[0].data
      };
    }
    return null;
  } catch (err) {
    console.error("[NEON DB] Failed to get image:", err);
    return null;
  }
}

// server.ts
var app = express();
var PORT = Number(process.env.PORT) || 3e3;
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
var UPLOADS_DIR = process.env.VERCEL ? path.join("/tmp", "uploads") : path.join(process.cwd(), "public", "uploads");
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (e) {
  console.warn("Could not create uploads dir:", e);
}
app.use("/uploads", express.static(UPLOADS_DIR));
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: "Neon PostgreSQL",
    time: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/sync", async (req, res) => {
  try {
    const data = await getSyncData();
    res.json(data);
  } catch (err) {
    console.error("Error in /api/sync:", err);
    res.status(500).json({ error: "Sync failed", details: err?.message });
  }
});
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await getOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});
app.post("/api/orders", async (req, res) => {
  const newOrder = req.body;
  if (!newOrder || !newOrder.tableNumber) {
    return res.status(400).json({ error: "Invalid order data" });
  }
  const order = {
    ...newOrder,
    id: newOrder.id || `ORD-${Math.floor(1e5 + Math.random() * 9e5)}`,
    createdAt: newOrder.createdAt || (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    status: newOrder.status || "preparing",
    timestamp: Date.now()
  };
  try {
    const saved = await createOrder(order);
    console.log(`[ORDER CREATED IN NEON] Table ${saved.tableNumber} - Order ID: ${saved.id} - Total: ${saved.totalAmount} UZS`);
    res.status(201).json(saved);
  } catch (err) {
    console.error("Failed to create order:", err);
    res.status(500).json({ error: "Failed to save order in database" });
  }
});
app.patch("/api/orders/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updated = await updateOrderStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(updated);
  } catch (err) {
    console.error("Failed to update order status:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});
app.delete("/api/orders/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteOrder(id);
    res.json({ success: true, message: "Order removed from Neon" });
  } catch (err) {
    console.error("Failed to delete order:", err);
    res.status(500).json({ error: "Failed to delete order" });
  }
});
app.get("/api/waiter-calls", async (req, res) => {
  try {
    const calls = await getWaiterCalls();
    res.json(calls);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch waiter calls" });
  }
});
app.post("/api/waiter-calls", async (req, res) => {
  const { tableNumber, type } = req.body;
  if (!tableNumber) {
    return res.status(400).json({ error: "tableNumber is required" });
  }
  const call = {
    id: `call-${Date.now()}`,
    tableNumber: String(tableNumber),
    timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    type: type || "waiter",
    status: "active"
  };
  try {
    const saved = await createWaiterCall(call);
    console.log(`[WAITER CALL IN NEON] Table ${saved.tableNumber} - Type: ${saved.type}`);
    res.status(201).json(saved);
  } catch (err) {
    console.error("Failed to create waiter call:", err);
    res.status(500).json({ error: "Failed to save waiter call" });
  }
});
app.patch("/api/waiter-calls/:id/resolve", async (req, res) => {
  const { id } = req.params;
  try {
    const call = await resolveWaiterCall(id);
    res.json({ success: true, call });
  } catch (err) {
    res.status(500).json({ error: "Failed to resolve waiter call" });
  }
});
app.delete("/api/waiter-calls/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteWaiterCall(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete waiter call" });
  }
});
app.post("/api/upload", async (req, res) => {
  try {
    const { filename, data } = req.body;
    if (!data) {
      return res.status(400).json({ error: "No image data provided" });
    }
    let mimeType = "image/jpeg";
    let ext = "jpg";
    let rawBase64 = data;
    const match = data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (match) {
      mimeType = match[1];
      rawBase64 = match[2];
      ext = mimeType.split("/")[1] === "jpeg" ? "jpg" : mimeType.split("/")[1] || "jpg";
    } else if (filename && filename.includes(".")) {
      ext = filename.split(".").pop() || "jpg";
      mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    }
    const uniqueId = `food-${Date.now()}-${Math.floor(Math.random() * 1e4)}.${ext}`;
    await saveImage(uniqueId, mimeType, rawBase64);
    try {
      const targetFile = path.join(UPLOADS_DIR, uniqueId);
      fs.writeFileSync(targetFile, Buffer.from(rawBase64, "base64"));
    } catch (e) {
    }
    console.log(`[LAPTOP IMAGE SAVED IN NEON DB] /api/images/${uniqueId}`);
    res.json({ success: true, url: `/api/images/${uniqueId}` });
  } catch (err) {
    console.error("Failed to save uploaded image:", err);
    res.status(500).json({ error: "Failed to save image", details: err?.message });
  }
});
app.get("/api/images/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const img = await getImage(id);
    if (!img) {
      const localFile = path.join(UPLOADS_DIR, id);
      if (fs.existsSync(localFile)) {
        return res.sendFile(localFile);
      }
      return res.status(404).send("Image not found");
    }
    const buffer = Buffer.from(img.data, "base64");
    res.setHeader("Content-Type", img.mimeType || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.send(buffer);
  } catch (err) {
    console.error("Failed to serve image:", err);
    res.status(500).send("Error serving image");
  }
});
app.get("/uploads/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const img = await getImage(id);
    if (img) {
      const buffer = Buffer.from(img.data, "base64");
      res.setHeader("Content-Type", img.mimeType || "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return res.send(buffer);
    }
    const localFile = path.join(UPLOADS_DIR, id);
    if (fs.existsSync(localFile)) {
      return res.sendFile(localFile);
    }
    res.status(404).send("Image not found");
  } catch (err) {
    res.status(404).send("Not found");
  }
});
app.get("/api/foods", async (req, res) => {
  try {
    const foods = await getFoods();
    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch foods" });
  }
});
app.post("/api/foods", async (req, res) => {
  const item = req.body;
  if (!item || !item.id) {
    return res.status(400).json({ error: "Invalid food item data" });
  }
  try {
    const saved = await addFood(item);
    console.log(`[FOOD ADDED IN NEON] ${item.title?.qr || item.title?.uz || item.id}`);
    res.status(201).json(saved);
  } catch (err) {
    console.error("Failed to add food:", err);
    res.status(500).json({ error: "Failed to save food" });
  }
});
app.put("/api/foods/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await updateFood(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Food item not found" });
    }
    console.log(`[FOOD UPDATED IN NEON] ${id}`);
    res.json(updated);
  } catch (err) {
    console.error("Failed to update food:", err);
    res.status(500).json({ error: "Failed to update food" });
  }
});
app.delete("/api/foods/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteFood(id);
    console.log(`[FOOD DELETED IN NEON] ${id}`);
    res.json({ success: true, id });
  } catch (err) {
    console.error("Failed to delete food:", err);
    res.status(500).json({ error: "Failed to delete food" });
  }
});
app.post("/api/foods/sync-all", async (req, res) => {
  const foods = req.body;
  if (Array.isArray(foods)) {
    try {
      for (const food of foods) {
        if (food && food.id) {
          await addFood(food);
        }
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to sync foods" });
    }
  } else {
    res.status(400).json({ error: "Expected array of foods" });
  }
});
app.get("/api/settings", async (req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});
app.put("/api/settings", async (req, res) => {
  try {
    const settings = await updateSettings(req.body);
    console.log(`[SETTINGS UPDATED IN NEON]`, settings);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "Failed to update settings" });
  }
});
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith("/api/")) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`
\u{1F680} Qaraqalpaq Menu Server (Neon PostgreSQL) muvaffaqiyatli ishga tushdi:`);
    console.log(`   \u279C Local:    http://localhost:${PORT}/`);
    console.log(`   \u279C Local IP: http://127.0.0.1:${PORT}/`);
    console.log(`   \u279C Tarmoq:   http://0.0.0.0:${PORT}/
`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\u26A0\uFE0F Diqqat: Port ${PORT} band! Boshqa port berish uchun PORT=3001 kabi ishga tushiring.`);
    } else {
      console.error("Serverda xatolik yuz berdi:", err);
    }
  });
}
if (process.env.VERCEL !== "1") {
  start().catch((err) => {
    console.error("Failed to start server:", err);
  });
}
var server_default = app;
export {
  server_default as default
};
