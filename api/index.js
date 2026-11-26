// server.ts
import express from "express";
import path from "path";
import fs from "fs";

// src/db/index.ts
import { neon } from "@neondatabase/serverless";

// src/data/mockData.ts
var initialFoodItems = [
  // --- TORTLAR (CAKES) ---
  {
    id: "cake-red-velvet",
    title: {
      qr: "Q\u0131z\u0131l Velvet (Red Velvet)",
      uz: "Qizil Velvet (Red Velvet)",
      ru: "\u041A\u0440\u0430\u0441\u043D\u044B\u0439 \u0411\u0430\u0440\u0445\u0430\u0442 (Red Velvet)",
      en: "Red Velvet Cake"
    },
    description: {
      qr: "Yumsaq q\u0131z\u0131l biskvit, may\u0131n qaymaql\u0131 pishloq kremi h\xE1m kofe menen ajoyib \xFAylesim.",
      uz: "Yumshoq qizil biskvit, nozik qaymoqli pishloq kremi va mayin shirinlik uyg'unligi.",
      ru: "\u041D\u0435\u0436\u043D\u0435\u0439\u0448\u0438\u0439 \u0431\u0430\u0440\u0445\u0430\u0442\u043D\u044B\u0439 \u0431\u0438\u0441\u043A\u0432\u0438\u0442 \u0441 \u0442\u0430\u044E\u0449\u0438\u043C \u0441\u043B\u0438\u0432\u043E\u0447\u043D\u043E-\u0441\u044B\u0440\u043D\u044B\u043C \u043A\u0440\u0435\u043C\u043E\u043C \u0427\u0438\u0437.",
      en: "Tender red velvet sponge layered with silky cream cheese frosting."
    },
    price: 45e3,
    category: "cakes",
    imageUrl: "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=800&q=80",
    calories: 380,
    prepTime: 5,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: false,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["Kakao", "Qaymaql\u0131 pishloq", "Vanil", "Biskvit qam\u0131r"],
      uz: ["Kakao", "Qaymoqli pishloq", "Vanil", "Biskvit xamiri"],
      ru: ["\u041A\u0430\u043A\u0430\u043E", "\u0421\u043B\u0438\u0432\u043E\u0447\u043D\u044B\u0439 \u0441\u044B\u0440", "\u0412\u0430\u043D\u0438\u043B\u044C", "\u0411\u0438\u0441\u043A\u0432\u0438\u0442"],
      en: ["Cocoa", "Cream Cheese", "Vanilla", "Sponge Flour"]
    },
    allergens: ["gluten", "dairy", "eggs"],
    rating: 5,
    ratingCount: 312,
    reviews: [
      {
        id: "rev-rv1",
        userName: "Madina A.",
        rating: 5,
        comment: "Juda mayin va shirin! Har doim shu yerdan olaman.",
        date: "2026-11-20"
      }
    ],
    nutrition: { protein: 6, fat: 18, carbs: 45 }
  },
  {
    id: "cake-pistachio-cheesecake",
    title: {
      qr: "Pista Cheesecake",
      uz: "Pista Cheesecake",
      ru: "\u0424\u0438\u0441\u0442\u0430\u0448\u043A\u043E\u0432\u044B\u0439 \u0427\u0438\u0437\u043A\u0435\u0439\u043A",
      en: "Pistachio Cheesecake"
    },
    description: {
      qr: "Qars\u0131ldaq pista bolekleri, tabiiy pista pastas\u0131 h\xE1m may\u0131n Filadelfiya pishlog'\u0131.",
      uz: "Qarsildoq pista bo'laklari, tabiiy pista pastasi va nozik Filadelfiya pishlog'i.",
      ru: "\u0418\u0437\u044B\u0441\u043A\u0430\u043D\u043D\u044B\u0439 \u0447\u0438\u0437\u043A\u0435\u0439\u043A \u0441 \u043D\u0430\u0442\u0443\u0440\u0430\u043B\u044C\u043D\u043E\u0439 \u0444\u0438\u0441\u0442\u0430\u0448\u043A\u043E\u0432\u043E\u0439 \u043F\u0430\u0441\u0442\u043E\u0439 \u0438 \u043E\u0442\u0431\u043E\u0440\u043D\u044B\u043C\u0438 \u0444\u0438\u0441\u0442\u0430\u0448\u043A\u0430\u043C\u0438.",
      en: "Creamy cheesecake infused with natural Sicilian pistachio paste and crunchy toppings."
    },
    price: 48e3,
    category: "cakes",
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
      qr: ["Taza pista", "Qaymoq", "Filadelfiya pishloq", "Pechenye qumi"],
      uz: ["Yangi pista", "Qaymoq", "Filadelfiya pishloq", "Pechenye asosi"],
      ru: ["\u0424\u0438\u0441\u0442\u0430\u0448\u043A\u0438", "\u0421\u043B\u0438\u0432\u043A\u0438", "\u0421\u043B\u0438\u0432\u043E\u0447\u043D\u044B\u0439 \u0441\u044B\u0440", "\u041F\u0435\u0441\u043E\u0447\u043D\u0430\u044F \u043E\u0441\u043D\u043E\u0432\u0430"],
      en: ["Pistachios", "Cream", "Cream Cheese", "Cookie Crust"]
    },
    allergens: ["dairy", "nuts", "gluten"],
    rating: 4.9,
    ratingCount: 265,
    reviews: [],
    nutrition: { protein: 8, fat: 24, carbs: 38 }
  },
  {
    id: "cake-san-sebastian",
    title: {
      qr: "San Sebastian Cheesecake",
      uz: "San Sebastian Cheesecake",
      ru: "\u0427\u0438\u0437\u043A\u0435\u0439\u043A \u0421\u0430\u043D-\u0421\u0435\u0431\u0430\u0441\u0442\u044C\u044F\u043D",
      en: "San Sebastian Cheesecake"
    },
    description: {
      qr: "Ispancha kuydirilgan karamel qobiqli, o'rtasi kremdek oqib turuvchi nozik cheesecake.",
      uz: "Ispancha kuydirilgan karamel qobiqli, o'rtasi kremdek oqib turuvchi nozik cheesecake.",
      ru: "\u0418\u0441\u043F\u0430\u043D\u0441\u043A\u0438\u0439 \u0436\u0436\u0451\u043D\u044B\u0439 \u0447\u0438\u0437\u043A\u0435\u0439\u043A \u0441 \u043A\u0430\u0440\u0430\u043C\u0435\u043B\u044C\u043D\u043E\u0439 \u043A\u043E\u0440\u043E\u0447\u043A\u043E\u0439 \u0438 \u043D\u0435\u0436\u043D\u043E\u0439 \u043A\u0440\u0435\u043C\u043E\u0432\u043E\u0439 \u0441\u0435\u0440\u0434\u0446\u0435\u0432\u0438\u043D\u043E\u0439.",
      en: "Famous Basque burnt cheesecake with a caramelized crust and gooey molten center."
    },
    price: 42e3,
    category: "cakes",
    imageUrl: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=800&q=80",
    calories: 390,
    prepTime: 5,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: false,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["Smitana", "Pishloq", "Karamel", "Vanil"],
      uz: ["Smetana", "Pishloq", "Karamel", "Vanil"],
      ru: ["\u0421\u043C\u0435\u0442\u0430\u043D\u0430", "\u0421\u043B\u0438\u0432\u043E\u0447\u043D\u044B\u0439 \u0441\u044B\u0440", "\u041A\u0430\u0440\u0430\u043C\u0435\u043B\u044C", "\u0412\u0430\u043D\u0438\u043B\u044C"],
      en: ["Sour Cream", "Cream Cheese", "Caramel", "Vanilla"]
    },
    allergens: ["dairy", "eggs"],
    rating: 5,
    ratingCount: 198,
    reviews: [],
    nutrition: { protein: 7, fat: 22, carbs: 32 }
  },
  {
    id: "cake-medovik",
    title: {
      qr: "Asall\u0131 Tort (Medovik)",
      uz: "Asalli Tort (Medovik)",
      ru: "\u041C\u0435\u0434\u043E\u0432\u0438\u043A \u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0438\u0439",
      en: "Honey Cake (Medovik)"
    },
    description: {
      qr: "8 qatlamli xushbo'y asal korjlari va yengil smetana-qaymoqli nozik krem.",
      uz: "8 qatlamli xushbo'y asal korjlari va yengil smetana-qaymoqli nozik krem.",
      ru: "\u0412\u043E\u0441\u0435\u043C\u044C \u0442\u043E\u043D\u043A\u0438\u0445 \u043C\u0435\u0434\u043E\u0432\u044B\u0445 \u043A\u043E\u0440\u0436\u0435\u0439 \u0441 \u0432\u043E\u0437\u0434\u0443\u0448\u043D\u044B\u043C \u0441\u043C\u0435\u0442\u0430\u043D\u043D\u043E-\u0437\u0430\u0432\u0430\u0440\u043D\u044B\u043C \u043A\u0440\u0435\u043C\u043E\u043C.",
      en: "Traditional 8-layer golden honey cake layered with light sour cream frosting."
    },
    price: 38e3,
    category: "cakes",
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
    calories: 360,
    prepTime: 5,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: false,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["Tabiiy asal", "Smetana", "Qaymoq", "Un"],
      uz: ["Tabiiy asal", "Smetana", "Qaymoq", "Un"],
      ru: ["\u041D\u0430\u0442\u0443\u0440\u0430\u043B\u044C\u043D\u044B\u0439 \u043C\u0435\u0434", "\u0421\u043C\u0435\u0442\u0430\u043D\u0430", "\u0421\u043B\u0438\u0432\u043A\u0438", "\u041C\u0443\u043A\u0430"],
      en: ["Natural Honey", "Sour Cream", "Fresh Cream", "Flour"]
    },
    allergens: ["gluten", "dairy", "eggs"],
    rating: 4.8,
    ratingCount: 174,
    reviews: [],
    nutrition: { protein: 5, fat: 14, carbs: 54 }
  },
  {
    id: "cake-tiramisu",
    title: {
      qr: "Klassik Tiramisu",
      uz: "Klassik Tiramisu",
      ru: "\u0422\u0438\u0440\u0430\u043C\u0438\u0441\u0443 \u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0438\u0439",
      en: "Classic Tiramisu"
    },
    description: {
      qr: "Savoyardi pechenyelari, espresso qahvasi va haqiqiy Maskarpone italyan kremi.",
      uz: "Savoyardi pechenyelari, espresso qahvasi va haqiqiy Maskarpone italyan kremi.",
      ru: "\u0418\u0442\u0430\u043B\u044C\u044F\u043D\u0441\u043A\u0438\u0439 \u0434\u0435\u0441\u0435\u0440\u0442 \u0441 \u043F\u0435\u0447\u0435\u043D\u044C\u0435\u043C \u0421\u0430\u0432\u043E\u044F\u0440\u0434\u0438, \u043F\u0440\u043E\u043F\u0438\u0442\u0430\u043D\u043D\u044B\u043C \u043A\u0440\u0435\u043F\u043A\u0438\u043C \u043A\u043E\u0444\u0435, \u0438 \u0441\u044B\u0440\u043E\u043C \u041C\u0430\u0441\u043A\u0430\u0440\u043F\u043E\u043D\u0435.",
      en: "Authentic Italian dessert with espresso-dipped ladyfingers and whipped mascarpone cream."
    },
    price: 4e4,
    category: "cakes",
    imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80",
    calories: 340,
    prepTime: 5,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: false,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["Maskarpone", "Espresso", "Savoyardi", "Kakao"],
      uz: ["Maskarpone", "Espresso", "Savoyardi", "Kakao"],
      ru: ["\u041C\u0430\u0441\u043A\u0430\u0440\u043F\u043E\u043D\u0435", "\u042D\u0441\u043F\u0440\u0435\u0441\u0441\u043E", "\u0421\u0430\u0432\u043E\u044F\u0440\u0434\u0438", "\u041A\u0430\u043A\u0430\u043E"],
      en: ["Mascarpone", "Espresso", "Ladyfingers", "Cocoa Powder"]
    },
    allergens: ["dairy", "eggs", "gluten"],
    rating: 4.9,
    ratingCount: 220,
    reviews: [],
    nutrition: { protein: 6, fat: 18, carbs: 36 }
  },
  // --- PISHIRIQLAR & KRUASSANLAR (BAKERY & CROISSANTS) ---
  {
    id: "bakery-chocolate-croissant",
    title: {
      qr: "Shokoladli Kruassan",
      uz: "Shokoladli Kruassan",
      ru: "\u0428\u043E\u043A\u043E\u043B\u0430\u0434\u043D\u044B\u0439 \u041A\u0440\u0443\u0430\u0441\u0441\u0430\u043D",
      en: "Chocolate Croissant"
    },
    description: {
      qr: "Qat-qat qarsildoq fransuz xamiri, ichida qaynoq Belgiya shokoladi.",
      uz: "Qat-qat qarsildoq fransuz xamiri, ichida qaynoq Belgiya shokoladi.",
      ru: "\u0425\u0440\u0443\u0441\u0442\u044F\u0449\u0438\u0439 \u0441\u043B\u043E\u0451\u043D\u044B\u0439 \u043A\u0440\u0443\u0430\u0441\u0441\u0430\u043D \u043F\u043E-\u0444\u0440\u0430\u043D\u0446\u0443\u0437\u0441\u043A\u0438 \u0441 \u043D\u0430\u0447\u0438\u043D\u043A\u043E\u0439 \u0438\u0437 \u0442\u0435\u043C\u043D\u043E\u0433\u043E \u0431\u0435\u043B\u044C\u0433\u0438\u0439\u0441\u043A\u043E\u0433\u043E \u0448\u043E\u043A\u043E\u043B\u0430\u0434\u0430.",
      en: "Flaky, buttery French croissant filled with rich melted Belgian chocolate."
    },
    price: 25e3,
    category: "bakery",
    imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80",
    calories: 320,
    prepTime: 3,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: false,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["Sariyog'", "Belgiya shokoladi", "Un", "Sut"],
      uz: ["Sariyog'", "Belgiya shokoladi", "Un", "Sut"],
      ru: ["\u0421\u043B\u0438\u0432\u043E\u0447\u043D\u043E\u0435 \u043C\u0430\u0441\u043B\u043E", "\u0411\u0435\u043B\u044C\u0433\u0438\u0439\u0441\u043A\u0438\u0439 \u0448\u043E\u043A\u043E\u043B\u0430\u0434", "\u041C\u0443\u043A\u0430", "\u041C\u043E\u043B\u043E\u043A\u043E"],
      en: ["French Butter", "Belgian Chocolate", "Flour", "Milk"]
    },
    allergens: ["gluten", "dairy"],
    rating: 4.9,
    ratingCount: 380,
    reviews: [],
    nutrition: { protein: 6, fat: 16, carbs: 39 }
  },
  {
    id: "bakery-classic-croissant",
    title: {
      qr: "Klassik Kruassan",
      uz: "Klassik Kruassan",
      ru: "\u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u041A\u0440\u0443\u0430\u0441\u0441\u0430\u043D",
      en: "Classic French Croissant"
    },
    description: {
      qr: "82% tabiiy sariyog'dan tayyorlangan, yengil va havodor original fransuz kruassani.",
      uz: "82% tabiiy sariyog'dan tayyorlangan, yengil va havodor original fransuz kruassani.",
      ru: "\u0412\u043E\u0437\u0434\u0443\u0448\u043D\u044B\u0439 \u0441\u043B\u0438\u0432\u043E\u0447\u043D\u044B\u0439 \u043A\u0440\u0443\u0430\u0441\u0441\u0430\u043D \u0438\u0437 \u043D\u0430\u0442\u0443\u0440\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0441\u043B\u0438\u0432\u043E\u0447\u043D\u043E\u0433\u043E \u043C\u0430\u0441\u043B\u0430 82%.",
      en: "Golden, crispy, all-butter croissant baked fresh daily."
    },
    price: 2e4,
    category: "bakery",
    imageUrl: "https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?auto=format&fit=crop&w=800&q=80",
    calories: 270,
    prepTime: 3,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: false,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["Fransuz sariyog'i", "Un", "Sut"],
      uz: ["Fransuz sariyog'i", "Un", "Sut"],
      ru: ["\u0421\u043B\u0438\u0432\u043E\u0447\u043D\u043E\u0435 \u043C\u0430\u0441\u043B\u043E 82%", "\u041C\u0443\u043A\u0430", "\u041C\u043E\u043B\u043E\u043A\u043E"],
      en: ["French Butter", "Flour", "Milk"]
    },
    allergens: ["gluten", "dairy"],
    rating: 4.8,
    ratingCount: 190,
    reviews: [],
    nutrition: { protein: 5, fat: 14, carbs: 31 }
  },
  {
    id: "bakery-cinnabon",
    title: {
      qr: "Sinabon (Dolchinli Pishiriq)",
      uz: "Sinabon (Dolchinli Pishiriq)",
      ru: "\u0421\u0438\u043D\u043D\u0430\u0431\u043E\u043D \u0441 \u043A\u043E\u0440\u0438\u0446\u0435\u0439",
      en: "Cinnamon Roll (Cinnabon)"
    },
    description: {
      qr: "Issiq va xushbo'y seylon dolchini hamda erigan qaymoqli krem bilan yopilgan bulochka.",
      uz: "Issiq va xushbo'y seylon dolchini hamda erigan qaymoqli krem bilan yopilgan bulochka.",
      ru: "\u0410\u0440\u043E\u043C\u0430\u0442\u043D\u0430\u044F \u0431\u0443\u043B\u043E\u0447\u043A\u0430 \u0441 \u0446\u0435\u0439\u043B\u043E\u043D\u0441\u043A\u043E\u0439 \u043A\u043E\u0440\u0438\u0446\u0435\u0439 \u0438 \u0433\u043B\u0430\u0437\u0443\u0440\u044C\u044E \u0438\u0437 \u0441\u043B\u0438\u0432\u043E\u0447\u043D\u043E\u0433\u043E \u0441\u044B\u0440\u0430.",
      en: "Warm cinnamon roll topped with rich signature cream cheese icing."
    },
    price: 28e3,
    category: "bakery",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    calories: 410,
    prepTime: 5,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: false,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["Seylon dolchini", "Qaymoqli glazur", "Sariyog'", "Xamir"],
      uz: ["Seylon dolchini", "Qaymoqli glazur", "Sariyog'", "Xamir"],
      ru: ["\u041A\u043E\u0440\u0438\u0446\u0430", "\u0421\u043B\u0438\u0432\u043E\u0447\u043D\u0430\u044F \u0433\u043B\u0430\u0437\u0443\u0440\u044C", "\u041C\u0430\u0441\u043B\u043E", "\u0421\u0434\u043E\u0431\u043D\u043E\u0435 \u0442\u0435\u0441\u0442\u043E"],
      en: ["Ceylon Cinnamon", "Cream Cheese Glaze", "Butter", "Dough"]
    },
    allergens: ["gluten", "dairy"],
    rating: 4.9,
    ratingCount: 230,
    reviews: [],
    nutrition: { protein: 6, fat: 18, carbs: 56 }
  },
  // --- PIROJNIYLAR (PASTRIES) ---
  {
    id: "pastry-eclair",
    title: {
      qr: "Shokoladli Ekler",
      uz: "Shokoladli Ekler",
      ru: "\u0428\u043E\u043A\u043E\u043B\u0430\u0434\u043D\u044B\u0439 \u042D\u043A\u043B\u0435\u0440",
      en: "Chocolate Eclair"
    },
    description: {
      qr: "Yengil choux xamiri, ichida vanilli nozik zavarnoy krem va qora shokoladli glazur.",
      uz: "Yengil choux xamiri, ichida vanilli nozik zavarnoy krem va qora shokoladli glazur.",
      ru: "\u0424\u0440\u0430\u043D\u0446\u0443\u0437\u0441\u043A\u0438\u0439 \u0437\u0430\u0432\u0430\u0440\u043D\u043E\u0439 \u044D\u043A\u043B\u0435\u0440 \u0441 \u043D\u0435\u0436\u043D\u044B\u043C \u0432\u0430\u043D\u0438\u043B\u044C\u043D\u044B\u043C \u043A\u0440\u0435\u043C\u043E\u043C \u0438 \u0431\u0435\u043B\u044C\u0433\u0438\u0439\u0441\u043A\u0438\u043C \u0448\u043E\u043A\u043E\u043B\u0430\u0434\u043E\u043C.",
      en: "Crisp choux pastry filled with vanilla custard and dipped in chocolate ganache."
    },
    price: 2e4,
    category: "pastries",
    imageUrl: "https://images.unsplash.com/photo-1612203985729-70726954388c?auto=format&fit=crop&w=800&q=80",
    calories: 230,
    prepTime: 3,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: false,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["Zavarnoy xamir", "Zavarnoy krem", "Qora shokolad"],
      uz: ["Zavarnoy xamir", "Zavarnoy krem", "Qora shokolad"],
      ru: ["\u0417\u0430\u0432\u0430\u0440\u043D\u043E\u0435 \u0442\u0435\u0441\u0442\u043E", "\u0417\u0430\u0432\u0430\u0440\u043D\u043E\u0439 \u043A\u0440\u0435\u043C \u041F\u0430\u0442\u0438\u0441\u044C\u0435\u0440", "\u0422\u0435\u043C\u043D\u044B\u0439 \u0448\u043E\u043A\u043E\u043B\u0430\u0434"],
      en: ["Choux Pastry", "Pastry Cream", "Dark Chocolate"]
    },
    allergens: ["gluten", "dairy", "eggs"],
    rating: 4.8,
    ratingCount: 160,
    reviews: [],
    nutrition: { protein: 4, fat: 12, carbs: 28 }
  },
  {
    id: "pastry-strawberry-tart",
    title: {
      qr: "Qulupnayli Tartaletka",
      uz: "Qulupnayli Tartaletka",
      ru: "\u041A\u043B\u0443\u0431\u043D\u0438\u0447\u043D\u0430\u044F \u0422\u0430\u0440\u0442\u0430\u043B\u0435\u0442\u043A\u0430",
      en: "Strawberry Tart"
    },
    description: {
      qr: "Qarsildoq qum xamiri, sitrusli krem Patisser va yangi terilgan shirin qulupnaylar.",
      uz: "Qarsildoq qum xamiri, sitrusli krem Patisser va yangi terilgan shirin qulupnaylar.",
      ru: "\u0425\u0440\u0443\u0441\u0442\u044F\u0449\u0430\u044F \u043F\u0435\u0441\u043E\u0447\u043D\u0430\u044F \u0442\u0430\u0440\u0442\u0430\u043B\u0435\u0442\u043A\u0430 \u0441 \u043A\u0440\u0435\u043C\u043E\u043C \u041F\u0430\u0442\u0438\u0441\u044C\u0435\u0440 \u0438 \u0441\u0432\u0435\u0436\u0435\u0439 \u0441\u043E\u0447\u043D\u043E\u0439 \u043A\u043B\u0443\u0431\u043D\u0438\u043A\u043E\u0439.",
      en: "Crisp shortbread tart crust with silky custard and fresh sweet strawberries."
    },
    price: 28e3,
    category: "pastries",
    imageUrl: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80",
    calories: 260,
    prepTime: 4,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: false,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["Yangi qulupnay", "Krem Patisser", "Qum xamir"],
      uz: ["Yangi qulupnay", "Krem Patisser", "Qum xamir"],
      ru: ["\u0421\u0432\u0435\u0436\u0430\u044F \u043A\u043B\u0443\u0431\u043D\u0438\u043A\u0430", "\u041A\u0440\u0435\u043C \u041F\u0430\u0442\u0438\u0441\u044C\u0435\u0440", "\u041F\u0435\u0441\u043E\u0447\u043D\u043E\u0435 \u0442\u0435\u0441\u0442\u043E"],
      en: ["Fresh Strawberries", "Pastry Cream", "Shortcrust Pastry"]
    },
    allergens: ["gluten", "dairy", "eggs"],
    rating: 4.9,
    ratingCount: 145,
    reviews: [],
    nutrition: { protein: 4, fat: 11, carbs: 35 }
  },
  {
    id: "pastry-macarons-set",
    title: {
      qr: "Fransuz Makaronlari (3 dona)",
      uz: "Fransuz Makaronlari (3 dona)",
      ru: "\u0424\u0440\u0430\u043D\u0446\u0443\u0437\u0441\u043A\u0438\u0435 \u041C\u0430\u043A\u0430\u0440\u0443\u043D\u044B (3 \u0448\u0442)",
      en: "French Macarons (Set of 3)"
    },
    description: {
      qr: "Bodom unidan tayyorlangan 3 xil lazzat: Pista, Malina va Shokolad.",
      uz: "Bodom unidan tayyorlangan 3 xil lazzat: Pista, Malina va Shokolad.",
      ru: "\u041D\u0435\u0436\u043D\u044B\u0435 \u043F\u0438\u0440\u043E\u0436\u043D\u044B\u0435 \u0438\u0437 \u043C\u0438\u043D\u0434\u0430\u043B\u044C\u043D\u043E\u0439 \u043C\u0443\u043A\u0438: \u0444\u0438\u0441\u0442\u0430\u0448\u043A\u0430, \u043C\u0430\u043B\u0438\u043D\u0430 \u0438 \u0448\u043E\u043A\u043E\u043B\u0430\u0434 \u0433\u0430\u043D\u0430\u0448.",
      en: "Delicate almond meringue cookies with pistachio, raspberry, and chocolate fillings."
    },
    price: 3e4,
    category: "pastries",
    imageUrl: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=800&q=80",
    calories: 210,
    prepTime: 2,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: true,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["Bodom uni", "Oqsil", "Shokolad ganash", "Malina"],
      uz: ["Bodom uni", "Oqsil", "Shokolad ganash", "Malina"],
      ru: ["\u041C\u0438\u043D\u0434\u0430\u043B\u044C\u043D\u0430\u044F \u043C\u0443\u043A\u0430", "\u0411\u0435\u043B\u043A\u0438", "\u0413\u0430\u043D\u0430\u0448", "\u041C\u0430\u043B\u0438\u043D\u0430"],
      en: ["Almond Flour", "Egg Whites", "Ganache", "Raspberry"]
    },
    allergens: ["nuts", "dairy", "eggs"],
    rating: 4.9,
    ratingCount: 210,
    reviews: [],
    nutrition: { protein: 4, fat: 9, carbs: 29 }
  },
  // --- QAHVA & ICHIMLIKLAR (COFFEE & BEVERAGES) ---
  {
    id: "coffee-spanish-latte",
    title: {
      qr: "Ispan Latte (Spanish Latte)",
      uz: "Ispan Latte (Spanish Latte)",
      ru: "\u0418\u0441\u043F\u0430\u043D\u0441\u043A\u0438\u0439 \u041B\u0430\u0442\u0442\u0435 \u0441\u043E \u0441\u0433\u0443\u0449\u0435\u043D\u043D\u044B\u043C \u043C\u043E\u043B\u043E\u043A\u043E\u043C",
      en: "Spanish Iced / Hot Latte"
    },
    description: {
      qr: "Arabika espresso, quyiltirilgan sut (sgushonka) va mayin sut ko'pigi bilan xushbo'y qahva.",
      uz: "Arabika espresso, quyiltirilgan sut (sgushonka) va mayin sut ko'pigi bilan xushbo'y qahva.",
      ru: "\u0410\u0440\u043E\u043C\u0430\u0442\u043D\u044B\u0439 \u044D\u0441\u043F\u0440\u0435\u0441\u0441\u043E \u0438\u0437 100% \u0430\u0440\u0430\u0431\u0438\u043A\u0438 \u0441\u043E \u0441\u0433\u0443\u0449\u0435\u043D\u043D\u044B\u043C \u043C\u043E\u043B\u043E\u043A\u043E\u043C \u0438 \u0432\u043E\u0437\u0434\u0443\u0448\u043D\u043E\u0439 \u043C\u043E\u043B\u043E\u0447\u043D\u043E\u0439 \u043F\u0435\u043D\u043A\u043E\u0439.",
      en: "Rich espresso poured over sweet condensed milk and steamed creamy milk."
    },
    price: 28e3,
    category: "coffee",
    imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80",
    calories: 190,
    prepTime: 4,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: true,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["Arabika espresso", "Sut", "Quyiltirilgan sut"],
      uz: ["Arabika espresso", "Sut", "Quyiltirilgan sut"],
      ru: ["\u042D\u0441\u043F\u0440\u0435\u0441\u0441\u043E \u0410\u0440\u0430\u0431\u0438\u043A\u0430", "\u041C\u043E\u043B\u043E\u043A\u043E", "\u0421\u0433\u0443\u0449\u0435\u043D\u043D\u043E\u0435 \u043C\u043E\u043B\u043E\u043A\u043E"],
      en: ["Arabica Espresso", "Fresh Milk", "Condensed Milk"]
    },
    allergens: ["dairy"],
    rating: 5,
    ratingCount: 420,
    reviews: [],
    nutrition: { protein: 6, fat: 5, carbs: 26 }
  },
  {
    id: "coffee-cappuccino",
    title: {
      qr: "Klassik Kapuchino",
      uz: "Klassik Kapuchino",
      ru: "\u041A\u0430\u043F\u0443\u0447\u0438\u043D\u043E \u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0438\u0439",
      en: "Classic Cappuccino"
    },
    description: {
      qr: "Klassik Italiya retsepti bo'yicha boy espresso va qalin ipakdek sut ko'pigi.",
      uz: "Klassik Italiya retsepti bo'yicha boy espresso va qalin ipakdek sut ko'pigi.",
      ru: "\u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0438\u0442\u0430\u043B\u044C\u044F\u043D\u0441\u043A\u0438\u0439 \u043A\u043E\u0444\u0435 \u0441 \u0433\u0443\u0441\u0442\u043E\u0439 \u0431\u0430\u0440\u0445\u0430\u0442\u0438\u0441\u0442\u043E\u0439 \u043F\u0435\u043D\u043A\u043E\u0439.",
      en: "Traditional Italian espresso balanced with silky steamed and frothed milk."
    },
    price: 22e3,
    category: "coffee",
    imageUrl: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80",
    calories: 120,
    prepTime: 3,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: true,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["Espresso", "Sut", "Dolchin"],
      uz: ["Espresso", "Sut", "Dolchin"],
      ru: ["\u042D\u0441\u043F\u0440\u0435\u0441\u0441\u043E", "\u0412\u0437\u0431\u0438\u0442\u043E\u0435 \u043C\u043E\u043B\u043E\u043A\u043E", "\u041A\u043E\u0440\u0438\u0446\u0430"],
      en: ["Espresso", "Steamed Milk", "Cinnamon Dust"]
    },
    allergens: ["dairy"],
    rating: 4.8,
    ratingCount: 310,
    reviews: [],
    nutrition: { protein: 5, fat: 4, carbs: 12 }
  },
  {
    id: "coffee-mojito-fresh",
    title: {
      qr: "Muzdek Moxito (Limon & Yalpiz)",
      uz: "Muzdek Moxito (Limon & Yalpiz)",
      ru: "\u041E\u0441\u0432\u0435\u0436\u0430\u044E\u0449\u0438\u0439 \u041C\u043E\u0445\u0438\u0442\u043E \u0441 \u043C\u044F\u0442\u043E\u0439",
      en: "Fresh Mint & Lime Mojito"
    },
    description: {
      qr: "Yangi yalpiz barglari, laym sharbati, shirin sirop va muzdek gazlangan suv.",
      uz: "Yangi yalpiz barglari, laym sharbati, shirin sirop va muzdek gazlangan suv.",
      ru: "\u041F\u0440\u043E\u0445\u043B\u0430\u0434\u043D\u044B\u0439 \u043B\u0438\u043C\u043E\u043D\u0430\u0434 \u0441\u043E \u0441\u0432\u0435\u0436\u0435\u0439 \u043C\u044F\u0442\u043E\u0439, \u043B\u0430\u0439\u043C\u043E\u043C \u0438 \u043A\u0440\u0438\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u043C \u043B\u044C\u0434\u043E\u043C.",
      en: "Crisp and refreshing cooler with fresh mint leaves, lime juice, and sparkling water."
    },
    price: 24e3,
    category: "coffee",
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
    calories: 85,
    prepTime: 3,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: true,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["Yalpiz", "Laym", "Gazlangan suv", "Muz"],
      uz: ["Yalpiz", "Laym", "Gazlangan suv", "Muz"],
      ru: ["\u041C\u044F\u0442\u0430", "\u041B\u0430\u0439\u043C", "\u0413\u0430\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0430\u044F \u0432\u043E\u0434\u0430", "\u041B\u0435\u0434"],
      en: ["Fresh Mint", "Lime Juice", "Soda", "Ice"]
    },
    allergens: [],
    rating: 4.9,
    ratingCount: 195,
    reviews: [],
    nutrition: { protein: 0, fat: 0, carbs: 21 }
  },
  {
    id: "coffee-berry-tea",
    title: {
      qr: "Mevali Choy (Yalpiz & Qulupnay)",
      uz: "Mevali Choy (Yalpiz & Qulupnay)",
      ru: "\u042F\u0433\u043E\u0434\u043D\u044B\u0439 \u0427\u0430\u0439 \u0441 \u043A\u043B\u0443\u0431\u043D\u0438\u043A\u043E\u0439 \u0438 \u043C\u044F\u0442\u043E\u0439",
      en: "Strawberry & Mint Berry Tea"
    },
    description: {
      qr: "Tabiiy mevalar, qulupnay va yangi yalpiz bilan damlangan iliq choy.",
      uz: "Tabiiy mevalar, qulupnay va yangi yalpiz bilan damlangan iliq choy.",
      ru: "\u0410\u0440\u043E\u043C\u0430\u0442\u043D\u044B\u0439 \u0447\u0430\u0439 \u0441\u043E \u0441\u0432\u0435\u0436\u0435\u0439 \u043A\u043B\u0443\u0431\u043D\u0438\u043A\u043E\u0439, \u044F\u0433\u043E\u0434\u0430\u043C\u0438 \u0438 \u043C\u044F\u0442\u043E\u0439 \u0432 \u0441\u0442\u0435\u043A\u043B\u044F\u043D\u043D\u043E\u043C \u0447\u0430\u0439\u043D\u0438\u0447\u043A\u0435.",
      en: "Warm soothing pot of tea infused with sweet strawberries, berry syrup, and mint."
    },
    price: 2e4,
    category: "coffee",
    imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
    calories: 60,
    prepTime: 4,
    spicyLevel: 0,
    isVegetarian: true,
    isGlutenFree: true,
    isHalal: true,
    isNationalSpecial: false,
    isAvailable: true,
    ingredients: {
      qr: ["Qora/ko'k choy", "Qulupnay", "Yalpiz", "Asal"],
      uz: ["Qora/ko'k choy", "Qulupnay", "Yalpiz", "Asal"],
      ru: ["\u0427\u0435\u0440\u043D\u044B\u0439/\u0437\u0435\u043B\u0435\u043D\u044B\u0439 \u0447\u0430\u0439", "\u041A\u043B\u0443\u0431\u043D\u0438\u043A\u0430", "\u041C\u044F\u0442\u0430", "\u041C\u0435\u0434"],
      en: ["Black/Green Tea", "Strawberries", "Mint", "Honey"]
    },
    allergens: [],
    rating: 4.8,
    ratingCount: 140,
    reviews: [],
    nutrition: { protein: 0, fat: 0, carbs: 15 }
  }
];

// src/db/index.ts
var connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_echtZN2TL3Hz@ep-green-haze-bdwhgt4v-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require";
var sql = neon(connectionString);
var cachedFoods = [...initialFoodItems];
var cachedOrders = [];
var cachedCalls = [];
var cachedTables = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
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
async function getTables() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS cafe_tables (
        table_number TEXT PRIMARY KEY,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    const rows = await sql`
      SELECT table_number 
      FROM cafe_tables 
      ORDER BY sort_order ASC, created_at ASC;
    `;
    if (rows && rows.length > 0) {
      cachedTables = rows.map((r) => String(r.table_number));
    } else {
      const defaults = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
      for (let i = 0; i < defaults.length; i++) {
        await sql`
          INSERT INTO cafe_tables (table_number, sort_order)
          VALUES (${defaults[i]}, ${i + 1})
          ON CONFLICT (table_number) DO NOTHING;
        `;
      }
      cachedTables = defaults;
    }
    return cachedTables;
  } catch (err) {
    console.error("[NEON DB] Failed to fetch tables, using cache:", err);
    return cachedTables;
  }
}
async function addTable(tableNumber) {
  const trimmed = tableNumber.trim();
  if (!trimmed) return cachedTables;
  try {
    const num = parseInt(trimmed);
    const sortOrder = !isNaN(num) ? num : 999;
    await sql`
      INSERT INTO cafe_tables (table_number, sort_order)
      VALUES (${trimmed}, ${sortOrder})
      ON CONFLICT (table_number) DO NOTHING;
    `;
    return await getTables();
  } catch (err) {
    console.error("[NEON DB] Failed to add table:", err);
    if (!cachedTables.includes(trimmed)) {
      cachedTables.push(trimmed);
    }
    return cachedTables;
  }
}
async function deleteTable(tableNumber) {
  const trimmed = tableNumber.trim();
  try {
    await sql`DELETE FROM cafe_tables WHERE table_number = ${trimmed};`;
    cachedTables = cachedTables.filter((t) => t !== trimmed);
    return cachedTables;
  } catch (err) {
    console.error("[NEON DB] Failed to delete table:", err);
    cachedTables = cachedTables.filter((t) => t !== trimmed);
    return cachedTables;
  }
}
async function setTablesBatch(tablesList) {
  const cleaned = Array.from(new Set(tablesList.map((t) => String(t).trim()).filter(Boolean)));
  if (cleaned.length === 0) return cachedTables;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS cafe_tables (
        table_number TEXT PRIMARY KEY,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await sql`DELETE FROM cafe_tables;`;
    for (let i = 0; i < cleaned.length; i++) {
      const tbl = cleaned[i];
      const num = parseInt(tbl);
      const sortOrder = !isNaN(num) ? num : i + 1;
      await sql`
        INSERT INTO cafe_tables (table_number, sort_order)
        VALUES (${tbl}, ${sortOrder})
        ON CONFLICT (table_number) DO NOTHING;
      `;
    }
    cachedTables = cleaned;
    return cachedTables;
  } catch (err) {
    console.error("[NEON DB] Failed to save tables batch:", err);
    cachedTables = cleaned;
    return cachedTables;
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
    const [ordersRows, callsRows, foodsRows, settingsRows, tablesRows] = await Promise.all([
      sql`SELECT data FROM orders ORDER BY created_at DESC;`,
      sql`SELECT data FROM waiter_calls ORDER BY created_at DESC;`,
      sql`SELECT data FROM foods ORDER BY created_at ASC;`,
      sql`SELECT key, value FROM settings;`.catch(() => []),
      sql`SELECT table_number FROM cafe_tables ORDER BY sort_order ASC, created_at ASC;`.catch(() => [])
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
    if (tablesRows && tablesRows.length > 0) {
      cachedTables = tablesRows.map((r) => String(r.table_number));
    }
    cachedOrders = orders;
    cachedCalls = waiterCalls;
    cachedFoods = foods;
    return {
      orders,
      waiterCalls,
      foods,
      settings: cachedSettings,
      tables: cachedTables,
      serverTime: Date.now()
    };
  } catch (err) {
    console.error("[NEON DB] Failed to get sync data, using cache:", err);
    return {
      orders: cachedOrders,
      waiterCalls: cachedCalls,
      foods: cachedFoods,
      settings: cachedSettings,
      tables: cachedTables,
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
app.get("/api/tables", async (req, res) => {
  try {
    const tables = await getTables();
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tables" });
  }
});
app.post("/api/tables", async (req, res) => {
  const { tableNumber } = req.body;
  if (!tableNumber) {
    return res.status(400).json({ error: "tableNumber is required" });
  }
  try {
    const tables = await addTable(String(tableNumber));
    console.log(`[TABLE ADDED TO NEON DB] Stol \u2116${tableNumber}`);
    res.status(201).json({ success: true, tables });
  } catch (err) {
    console.error("Failed to add table:", err);
    res.status(500).json({ error: "Failed to add table" });
  }
});
app.post("/api/tables/batch", async (req, res) => {
  const { tables } = req.body;
  if (!Array.isArray(tables)) {
    return res.status(400).json({ error: "Expected array of table numbers" });
  }
  try {
    const saved = await setTablesBatch(tables);
    console.log(`[TABLES BATCH SAVED IN NEON DB] Count: ${saved.length}`);
    res.json({ success: true, tables: saved });
  } catch (err) {
    console.error("Failed to save tables batch:", err);
    res.status(500).json({ error: "Failed to save tables batch" });
  }
});
app.delete("/api/tables/:tableNumber", async (req, res) => {
  const { tableNumber } = req.params;
  try {
    const tables = await deleteTable(decodeURIComponent(tableNumber));
    console.log(`[TABLE DELETED FROM NEON DB] Stol \u2116${tableNumber}`);
    res.json({ success: true, tables });
  } catch (err) {
    console.error("Failed to delete table:", err);
    res.status(500).json({ error: "Failed to delete table" });
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
