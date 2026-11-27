import * as db from '../db';

export const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN || '9138109226:AAHxZbqtWDlc8jrcT9VxJ7a6Wpl4IvpKaEE';
export const WEB_APP_URL =
  process.env.WEB_APP_URL || 'https://qrmenu-sigma-gold.vercel.app';
export const ADMIN_ID = '5888097104';

const TG_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Send API request to Telegram
export async function callTelegramApi(method: string, body: Record<string, any>) {
  try {
    const res = await fetch(`${TG_API}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.ok) {
      console.error(`[Telegram API Error] ${method}:`, data);
    }
    return data;
  } catch (err) {
    console.error(`[Telegram API Network Error] ${method}:`, err);
    return null;
  }
}

// Helpers
export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  options: {
    reply_markup?: any;
    parse_mode?: string;
  } = {}
) {
  return callTelegramApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: options.parse_mode || 'HTML',
    reply_markup: options.reply_markup,
    disable_web_page_preview: true,
  });
}

export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string,
  showAlert: boolean = false
) {
  return callTelegramApi('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
    show_alert: showAlert,
  });
}

// Setup Webhook & Menu Button
export async function setupTelegramWebhook(baseUrl: string) {
  const cleanBase = baseUrl.replace(/\/$/, '');
  const webhookUrl = `${cleanBase}/api/telegram-webhook`;
  const webAppUrl = `${cleanBase}/?lang=qr`;

  console.log(`[Telegram Setup] Setting webhook to: ${webhookUrl}`);
  const setHookRes = await callTelegramApi('setWebhook', {
    url: webhookUrl,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: false,
  });

  console.log(`[Telegram Setup] Setting Chat Menu Button with Web App: ${webAppUrl}`);
  const setMenuRes = await callTelegramApi('setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: 'Menyu 🍰',
      web_app: { url: webAppUrl },
    },
  });

  // Only public user-facing commands; /admin is hidden from command list!
  console.log(`[Telegram Setup] Setting Bot Commands`);
  const setCommandsRes = await callTelegramApi('setMyCommands', {
    commands: [
      { command: 'start', description: 'Botni ishga tushirish / Start' },
      { command: 'help', description: 'Yordam va qo\'llanma / Help' },
      { command: 'lang', description: 'Tilni tanlash / Tildi saylaw / Language' },
    ],
  });

  return {
    webhook: setHookRes,
    menuButton: setMenuRes,
    commands: setCommandsRes,
    webhookUrl,
    webAppUrl,
  };
}

// Keyboards Generator
function getReplyKeyboard(lang: string = 'qr') {
  const webAppTarget = `${WEB_APP_URL}/?lang=${lang}`;

  let openMenuLabel = '🍰 Menyudi ashıw';
  let sendPhoneLabel = '📱 Nomerdi jiberiw';
  let selectLangLabel = '🌐 Tildi saylaw';
  let helpLabel = 'ℹ️ Járdem';

  if (lang === 'uz') {
    openMenuLabel = '🍰 Menyuni ochish';
    sendPhoneLabel = '📱 Raqamni yuborish';
    selectLangLabel = '🌐 Tilni tanlash';
    helpLabel = 'ℹ️ Yordam';
  } else if (lang === 'ru') {
    openMenuLabel = '🍰 Открыть меню';
    sendPhoneLabel = '📱 Отправить номер';
    selectLangLabel = '🌐 Сменить язык';
    helpLabel = 'ℹ️ Помощь';
  } else if (lang === 'en') {
    openMenuLabel = '🍰 Open Menu';
    sendPhoneLabel = '📱 Send Phone';
    selectLangLabel = '🌐 Select Language';
    helpLabel = 'ℹ️ Help';
  }

  return {
    keyboard: [
      [{ text: openMenuLabel, web_app: { url: webAppTarget } }],
      [
        { text: sendPhoneLabel, request_contact: true },
        { text: selectLangLabel },
      ],
      [{ text: helpLabel }],
    ],
    resize_keyboard: true,
    is_persistent: true,
  };
}

// Language selector keyboard WITHOUT flags
function getLangSelectInlineKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: 'Qaraqalpaqsha', callback_data: 'set_lang_qr' },
        { text: "O'zbekcha", callback_data: 'set_lang_uz' },
      ],
      [
        { text: 'Русский', callback_data: 'set_lang_ru' },
        { text: 'English', callback_data: 'set_lang_en' },
      ],
    ],
  };
}

// Inline button for single-action responses
function getInlineMenuButton(lang: string = 'qr') {
  const webAppTarget = `${WEB_APP_URL}/?lang=${lang}`;
  let openMenuLabel = '🍰 Menyudi ashıw (Web App)';
  if (lang === 'uz') openMenuLabel = '🍰 Menyuni ochish (Web App)';
  else if (lang === 'ru') openMenuLabel = '🍰 Открыть меню (Web App)';
  else if (lang === 'en') openMenuLabel = '🍰 Open Menu (Web App)';

  return {
    inline_keyboard: [[{ text: openMenuLabel, web_app: { url: webAppTarget } }]],
  };
}

// Localization Messages
function getStartMessage(userName: string, lang: string = 'qr') {
  if (lang === 'uz') {
    return (
      `Salom <b>${userName}</b>, siz Cake Bumer telegram botiga xush kelibsiz! 🍰\n\n` +
      `Bu yerda siz mazali shirinliklarimiz, eksklyuziv tortlarimiz va ichimliklarimiz menyusi bilan tanishishingiz hamda buyurtma berishingiz mumkin.\n\n` +
      `👇 Menyuni ko'rish uchun pastdagi <b>"🍰 Menyuni ochish"</b> tugmasini bosing:`
    );
  } else if (lang === 'ru') {
    return (
      `Здравствуйте <b>${userName}</b>, вы добро пожаловать в телеграм бот Cake Bumer! 🍰\n\n` +
      `Здесь вы можете ознакомиться с нашим меню десертов, фирменных тортов и напитков, а также оформить заказ.\n\n` +
      `👇 Нажмите кнопку <b>"🍰 Открыть меню"</b> ниже, чтобы открыть онлайн меню:`
    );
  } else if (lang === 'en') {
    return (
      `Hello <b>${userName}</b>, welcome to Cake Bumer telegram bot! 🍰\n\n` +
      `Here you can explore our menu of delicious desserts, premium cakes, and coffee, and place your order.\n\n` +
      `👇 Tap the <b>"🍰 Open Menu"</b> button below to open the online menu:`
    );
  }

  // Default: Karakalpak (Qaraqalpaqsha)
  return (
    `Sálem <b>${userName}</b>, siz Cake Bumer telegram botına xosh keldińiz! 🍰\n\n` +
    `Bul jerde siz mazalı shiyrinliklerimiz, eksklyuziv tortlarımız hám ishimliklerimiz menyusi menen tanısa alasız hám buyırtpa bere alasız.\n\n` +
    `👇 Menyudi kóriw ushın tómendegi <b>"🍰 Menyudi ashıw"</b> túymesin basıń:`
  );
}

function getHelpMessage(lang: string = 'qr') {
  if (lang === 'uz') {
    return (
      `ℹ️ <b>Cake Bumer boti bo'yicha yordam:</b>\n\n` +
      `🍰 <b>Menyuni ochish</b> — pastdagi tugmani bosing va barcha shirinliklar, tortlar va qahvalarni ko'rib buyurtma bering.\n` +
      `📱 <b>Raqamni yuborish</b> — telefon raqamingizni botga yuborish orqali buyurtmangizni tezroq rasmiylashtiring.\n` +
      `🌐 <b>Tilni tanlash</b> — bot va menyu tilini o'zingizga qulay qilib o'zgartiring.\n\n` +
      `📍 Bizning manzil: Nukus shahri, Cake Bumer Dessert Café.`
    );
  } else if (lang === 'ru') {
    return (
      `ℹ️ <b>Помощь по боту Cake Bumer:</b>\n\n` +
      `🍰 <b>Открыть меню</b> — нажмите кнопку ниже, чтобы открыть интерактивное меню и заказать десерты.\n` +
      `📱 <b>Отправить номер</b> — отправьте номер телефона для быстрой связи и подтверждения заказа.\n` +
      `🌐 <b>Сменить язык</b> — выбор языка бота и меню.\n\n` +
      `📍 Наш адрес: г. Нукус, Cake Bumer Dessert Café.`
    );
  } else if (lang === 'en') {
    return (
      `ℹ️ <b>Cake Bumer Bot Help:</b>\n\n` +
      `🍰 <b>Open Menu</b> — click the button below to browse our desserts and place orders.\n` +
      `📱 <b>Send Phone</b> — share your phone number for quick checkout and order updates.\n` +
      `🌐 <b>Select Language</b> — change language of the bot and menu.\n\n` +
      `📍 Location: Nukus city, Cake Bumer Dessert Café.`
    );
  }

  // Default: Karakalpak
  return (
    `ℹ️ <b>Cake Bumer botı boyınsha járdem:</b>\n\n` +
    `🍰 <b>Menyudi ashıw</b> — tómendegi túymeni basıń hám barlıq shiyrinlikler, tortlar hám kofelerimizdi saylap buyırtpa beriń.\n` +
    `📱 <b>Nomerdi jiberiw</b> — telefon nomerińizdi jiberiw arqalı buyırtpańızdı tez tastıyıqlań.\n` +
    `🌐 <b>Tildi saylaw</b> — bot hám menyu tilin ózgertiw.\n\n` +
    `📍 Mánzilimiz: Nókis qalası, Cake Bumer Dessert Café.`
  );
}

function getContactSuccessMessage(userName: string, phone: string, lang: string = 'qr') {
  if (lang === 'uz') {
    return (
      `✅ Rahmat <b>${userName}</b>, telefon raqamingiz muvaffaqiyatli saqlandi: <b>${phone}</b> 📱\n\n` +
      `Endi bemalol quyidagi tugma orqali menyuni ochib, sevimli shirinliklaringizga buyurtma berishingiz mumkin!`
    );
  } else if (lang === 'ru') {
    return (
      `✅ Спасибо <b>${userName}</b>, ваш номер телефона успешно сохранен: <b>${phone}</b> 📱\n\n` +
      `Теперь вы можете нажать кнопку ниже, открыть меню и сделать заказ!`
    );
  } else if (lang === 'en') {
    return (
      `✅ Thank you <b>${userName}</b>, your phone number has been saved: <b>${phone}</b> 📱\n\n` +
      `Now you can tap the button below to open the menu and place your order!`
    );
  }

  // Default: Karakalpak
  return (
    `✅ Raxmet <b>${userName}</b>, telefon nomerińiz tabıslı saqlandı: <b>${phone}</b> 📱\n\n` +
    `Endi tómendegi túyme arqalı menyudi ashıp, jaqsı kórgen shiyrinliklerińizge buyırtpa bere alasız!`
  );
}

// MAIN UPDATE HANDLER
export async function handleTelegramUpdate(update: any) {
  if (!update) return;

  try {
    // 1. Process Messages
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat?.id;
      const from = msg.from;
      if (!chatId || !from) return;

      const userId = from.id;
      const rawName = from.username
        ? `@${from.username}`
        : [from.first_name, from.last_name].filter(Boolean).join(' ') || 'Miyhman';

      // Escape HTML special characters for safe bold display
      const safeName = rawName
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Retrieve user lang (Default to Karakalpak 'qr' on first visit)
      const existingUser = await db.getTelegramUser(userId);
      let userLang = existingUser?.lang || 'qr';

      // Handle Contact Shared (Phone number)
      if (msg.contact && msg.contact.phone_number) {
        let phone = msg.contact.phone_number;
        if (!phone.startsWith('+')) phone = `+${phone}`;

        await db.saveTelegramUser({
          id: userId,
          first_name: from.first_name,
          last_name: from.last_name,
          username: from.username,
          phone_number: phone,
          lang: userLang,
        });

        // Send strictly 1 message with updated keyboard
        const replyText = getContactSuccessMessage(safeName, phone, userLang);
        await sendTelegramMessage(chatId, replyText, {
          reply_markup: getReplyKeyboard(userLang),
        });
        return;
      }

      const text = (msg.text || '').trim();

      // Handle /admin Command
      if (text === '/admin' || text.startsWith('/admin ')) {
        // Only allow if ID matches 5888097104
        if (String(userId) === ADMIN_ID) {
          const adminUrl = `${WEB_APP_URL}/?admin=true&admin_id=${ADMIN_ID}&lang=${userLang}`;
          const adminText =
            userLang === 'qr'
              ? `👑 <b>Admin Paneli — Cake Bumer</b>\n\n` +
                `Sálem <b>${safeName}</b>! Siz sistem administratorısız.\n` +
                `Tómendegi túyme arqalı Admin Panelge kirip, barlıq buyırtpalar, ofitsiant shaqırıwları, stollar QR-kodları, statistika hám menyudi basqara alasız.\n\n` +
                `👇 Admin paneldi ashıw ushın tómendegi túymeni basıń:`
              : userLang === 'ru'
              ? `👑 <b>Панель администратора — Cake Bumer</b>\n\n` +
                `Здравствуйте, <b>${safeName}</b>! Вы являетесь администратором системы.\n` +
                `По кнопке ниже вы можете перейти в панель управления и управлять заказами, вызовами официанта, столами, статистикой и меню десертов.\n\n` +
                `👇 Нажмите кнопку ниже, чтобы открыть панель администратора:`
              : userLang === 'en'
              ? `👑 <b>Admin Panel — Cake Bumer</b>\n\n` +
                `Hello <b>${safeName}</b>! You are a system administrator.\n` +
                `Tap below to open the Admin Panel and manage orders, waiter calls, tables, statistics, and menu items.\n\n` +
                `👇 Tap below to open Admin Panel:`
              : `👑 <b>Admin Paneli — Cake Bumer</b>\n\n` +
                `Salom <b>${safeName}</b>! Siz tizim administratorisiz.\n` +
                `Quyidagi tugma orqali Admin Panelga kirib, barcha buyurtmalar, ofitsiant chaqiruvlari, stollar QR-kodlari, statistika va menyuni boshqarishingiz mumkin.\n\n` +
                `👇 Admin panelni ochish uchun quyidagi tugmani bosing:`;

          // Send strictly 1 message with WebApp Admin Panel button
          await sendTelegramMessage(chatId, adminText, {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text:
                      userLang === 'qr'
                        ? '👑 Admin Paneldi ashıw'
                        : userLang === 'ru'
                        ? '👑 Открыть админ-панель'
                        : userLang === 'en'
                        ? '👑 Open Admin Panel'
                        : '👑 Admin Panelni ochish',
                    web_app: { url: adminUrl },
                  },
                ],
              ],
            },
          });
          return;
        }

        // If NOT admin ID: "agar admin id unga tegishli bolmasa bot unga start buyrugin qabul qilsin"
        // Seamlessly fall through to /start behavior!
      }

      // Handle /start (or non-admin fallback for /admin)
      if (text.startsWith('/start') || text.startsWith('/admin')) {
        await db.saveTelegramUser({
          id: userId,
          first_name: from.first_name,
          last_name: from.last_name,
          username: from.username,
          lang: userLang,
        });

        const welcomeText = getStartMessage(safeName, userLang);

        // Send strictly ONE single message with reply keyboard containing the WebApp button
        await sendTelegramMessage(chatId, welcomeText, {
          reply_markup: getReplyKeyboard(userLang),
        });
        return;
      }

      // Handle /help or 'Yordam' / 'Járdem' / 'Помощь' / 'Help'
      if (
        text.startsWith('/help') ||
        text.includes('Yordam') ||
        text.includes('Járdem') ||
        text.includes('Помощь') ||
        text.includes('Help')
      ) {
        const helpText = getHelpMessage(userLang);
        await sendTelegramMessage(chatId, helpText, {
          reply_markup: getReplyKeyboard(userLang),
        });
        return;
      }

      // Handle /lang or 'Tilni tanlash' / 'Tildi saylaw' / 'Сменить язык' / 'Select Language'
      if (
        text.startsWith('/lang') ||
        text.includes('Tilni tanlash') ||
        text.includes('Tildi saylaw') ||
        text.includes('Сменить язык') ||
        text.includes('Select Language') ||
        text.includes('Til')
      ) {
        await sendTelegramMessage(
          chatId,
          `🌐 <b>Tildi saylań / Tilni tanlang / Выберите язык / Select language:</b>`,
          {
            reply_markup: getLangSelectInlineKeyboard(),
          }
        );
        return;
      }

      // Any other text message -> Send strictly 1 message with Reply Keyboard
      const fallbackPrompt = getStartMessage(safeName, userLang);
      await sendTelegramMessage(chatId, fallbackPrompt, {
        reply_markup: getReplyKeyboard(userLang),
      });
      return;
    }

    // 2. Process Callback Queries (Language selection)
    if (update.callback_query) {
      const cb = update.callback_query;
      const cbId = cb.id;
      const data = cb.data;
      const chatId = cb.message?.chat?.id;
      const from = cb.from;

      if (!chatId || !from) {
        await answerCallbackQuery(cbId);
        return;
      }

      const rawName = from.username
        ? `@${from.username}`
        : [from.first_name, from.last_name].filter(Boolean).join(' ') || 'Miyhman';
      const safeName = rawName
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Set specific language
      if (data.startsWith('set_lang_')) {
        const newLang = data.replace('set_lang_', '');
        await db.saveTelegramUser({
          id: from.id,
          first_name: from.first_name,
          last_name: from.last_name,
          username: from.username,
          lang: newLang,
        });

        let ack = 'Til tabıslı ózgertildi!';
        if (newLang === 'uz') ack = "Til muvaffaqiyatli o'zgartirildi!";
        else if (newLang === 'ru') ack = 'Язык успешно изменен!';
        else if (newLang === 'en') ack = 'Language changed successfully!';

        await answerCallbackQuery(cbId, ack, false);

        // Send strictly ONE single message confirming language and updating the keyboard
        const startMsg = getStartMessage(safeName, newLang);
        await sendTelegramMessage(chatId, `✅ ${ack}\n\n${startMsg}`, {
          reply_markup: getReplyKeyboard(newLang),
        });
        return;
      }

      await answerCallbackQuery(cbId);
    }
  } catch (err) {
    console.error('[Telegram Update Processing Error]:', err);
  }
}
