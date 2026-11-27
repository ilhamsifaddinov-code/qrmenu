import * as db from '../db';

export const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN || '9138109226:AAHxZbqtWDlc8jrcT9VxJ7a6Wpl4IvpKaEE';
export const WEB_APP_URL =
  process.env.WEB_APP_URL || 'https://qrmenu-sigma-gold.vercel.app';

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
  const webAppUrl = `${cleanBase}/`;

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

  console.log(`[Telegram Setup] Setting Bot Commands`);
  const setCommandsRes = await callTelegramApi('setMyCommands', {
    commands: [
      { command: 'start', description: 'Botni ishga tushirish / Start' },
      { command: 'help', description: 'Yordam va qo\'llanma / Help' },
      { command: 'lang', description: 'Tilni tanlash / Til saylaw / Language' },
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
function getReplyKeyboard(lang: string = 'uz') {
  const webAppTarget = `${WEB_APP_URL}/?lang=${lang}`;

  let openMenuLabel = '🍰 Menyuni ochish';
  let sendPhoneLabel = '📱 Raqamni yuborish';
  let selectLangLabel = '🌐 Tilni tanlash';
  let helpLabel = 'ℹ️ Yordam';

  if (lang === 'qr') {
    openMenuLabel = '🍰 Menyudi ashıw';
    sendPhoneLabel = '📱 Nomerdi jiberiw';
    selectLangLabel = '🌐 Tildi saylaw';
    helpLabel = 'ℹ️ Járdem';
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

function getInlineKeyboard(lang: string = 'uz') {
  const webAppTarget = `${WEB_APP_URL}/?lang=${lang}`;

  let openMenuLabel = '🍰 Menyuni ochish (Web App)';
  let selectLangLabel = '🌐 Tilni tanlash';
  let helpLabel = 'ℹ️ Yordam';

  if (lang === 'qr') {
    openMenuLabel = '🍰 Menyudi ashıw (Web App)';
    selectLangLabel = '🌐 Tildi saylaw';
    helpLabel = 'ℹ️ Járdem';
  } else if (lang === 'ru') {
    openMenuLabel = '🍰 Открыть меню (Web App)';
    selectLangLabel = '🌐 Сменить язык';
    helpLabel = 'ℹ️ Помощь';
  } else if (lang === 'en') {
    openMenuLabel = '🍰 Open Menu (Web App)';
    selectLangLabel = '🌐 Select Language';
    helpLabel = 'ℹ️ Help';
  }

  return {
    inline_keyboard: [
      [{ text: openMenuLabel, web_app: { url: webAppTarget } }],
      [
        { text: selectLangLabel, callback_data: 'open_lang_select' },
        { text: helpLabel, callback_data: 'open_help' },
      ],
    ],
  };
}

function getLangSelectInlineKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "🇺🇿 O'zbekcha", callback_data: 'set_lang_uz' },
        { text: '🇰🇿 Qaraqalpaqsha', callback_data: 'set_lang_qr' },
      ],
      [
        { text: '🇷🇺 Русский', callback_data: 'set_lang_ru' },
        { text: '🇬🇧 English', callback_data: 'set_lang_en' },
      ],
    ],
  };
}

// Localization Messages
function getStartMessage(userName: string, lang: string = 'uz') {
  if (lang === 'qr') {
    return (
      `Sálem <b>${userName}</b>, siz Cake Bumer telegram botına xosh keldińiz! 🍰\n\n` +
      `Bul jerde siz mazalı shiyrinliklerimiz, eksklyuziv tortlarımız hám ishimliklerimiz menyusi menen tanısa alasız hám buyırtpa bere alasız.\n\n` +
      `👇 Menyudi kóriw ushın tómendegi <b>"🍰 Menyudi ashıw"</b> túymesin basıń:`
    );
  } else if (lang === 'ru') {
    return (
      `Здравствуйте, <b>${userName}</b>! Вы добро пожаловать в телеграм бот Cake Bumer! 🍰\n\n` +
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

  // Default Uzbek
  return (
    `Salom <b>${userName}</b>, siz Cake Bumer telegram botiga xush kelibsiz! 🍰\n\n` +
    `Bu yerda siz mazali shirinliklarimiz, eksklyuziv tortlarimiz va ichimliklarimiz menyusi bilan tanishishingiz hamda buyurtma berishingiz mumkin.\n\n` +
    `👇 Menyuni ko'rish uchun pastdagi <b>"🍰 Menyuni ochish"</b> tugmasini bosing:`
  );
}

function getHelpMessage(lang: string = 'uz') {
  if (lang === 'qr') {
    return (
      `ℹ️ <b>Cake Bumer botı boyınsha járdem:</b>\n\n` +
      `🍰 <b>Menyudi ashıw</b> — tómendegi túymeni basıń hám barlıq shiyrinlikler, tortlar hám kofelerimizdi saylap buyırtpa beriń.\n` +
      `📱 <b>Nomerdi jiberiw</b> — telefon nomerińizdi jiberiw arqalı buyırtpańızdı tez tastıyıqlań.\n` +
      `🌐 <b>Tildi saylaw</b> — bot hám menyu tilin ózgertiw.\n\n` +
      `📍 Mánzilimiz: Nókis qalası, Cake Bumer Dessert Café.`
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

  // Default Uzbek
  return (
    `ℹ️ <b>Cake Bumer boti bo'yicha yordam:</b>\n\n` +
    `🍰 <b>Menyuni ochish</b> — pastdagi tugmani bosing va barcha shirinliklar, tortlar va qahvalarni ko'rib buyurtma bering.\n` +
    `📱 <b>Raqamni yuborish</b> — telefon raqamingizni botga yuborish orqali buyurtmangizni tezroq rasmiylashtiring.\n` +
    `🌐 <b>Tilni tanlash</b> — bot va menyu tilini o'zingizga qulay qilib o'zgartiring.\n\n` +
    `📍 Bizning manzil: Nukus shahri, Cake Bumer Dessert Café.`
  );
}

function getContactSuccessMessage(userName: string, phone: string, lang: string = 'uz') {
  if (lang === 'qr') {
    return (
      `✅ Raxmet <b>${userName}</b>, telefon nomerińiz tabıslı saqlandı: <b>${phone}</b> 📱\n\n` +
      `Endi tómendegi túyme arqalı menyudi ashıp, sevimli shiyrinliklerińizge buyırtpa bere alasız!`
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

  // Default Uzbek
  return (
    `✅ Rahmat <b>${userName}</b>, telefon raqamingiz muvaffaqiyatli saqlandi: <b>${phone}</b> 📱\n\n` +
    `Endi bemalol quyidagi tugma orqali menyuni ochib, sevimli shirinliklaringizga buyurtma berishingiz mumkin!`
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
        : [from.first_name, from.last_name].filter(Boolean).join(' ') || 'Mijoz';
      // Escape HTML special characters for safety
      const safeName = rawName
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Retrieve or fallback user lang
      const existingUser = await db.getTelegramUser(userId);
      let userLang = existingUser?.lang || 'uz';

      // If user has language_code in Telegram
      if (!existingUser && from.language_code) {
        const lc = from.language_code.toLowerCase();
        if (lc.startsWith('ru')) userLang = 'ru';
        else if (lc.startsWith('en')) userLang = 'en';
      }

      // Handle Contact Shared
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

        const replyText = getContactSuccessMessage(safeName, phone, userLang);
        await sendTelegramMessage(chatId, replyText, {
          reply_markup: getInlineKeyboard(userLang),
        });
        return;
      }

      const text = (msg.text || '').trim();

      // Handle /start
      if (text.startsWith('/start')) {
        await db.saveTelegramUser({
          id: userId,
          first_name: from.first_name,
          last_name: from.last_name,
          username: from.username,
          lang: userLang,
        });

        const welcomeText = getStartMessage(safeName, userLang);

        // Send persistent Reply Keyboard with WebApp, Phone and Language buttons
        await sendTelegramMessage(chatId, welcomeText, {
          reply_markup: getReplyKeyboard(userLang),
        });

        // Also send inline button for immediate 1-tap open
        await sendTelegramMessage(
          chatId,
          `👇 <b>${userLang === 'qr' ? 'Menyudi ashıw:' : userLang === 'ru' ? 'Открыть меню:' : userLang === 'en' ? 'Open menu:' : 'Menyuni ochish:'}</b>`,
          {
            reply_markup: getInlineKeyboard(userLang),
          }
        );
        return;
      }

      // Handle /help or 'Yordam' / 'Помощь' / 'Járdem' / 'Help'
      if (
        text.startsWith('/help') ||
        text.includes('Yordam') ||
        text.includes('Járdem') ||
        text.includes('Помощь') ||
        text.includes('Help')
      ) {
        const helpText = getHelpMessage(userLang);
        await sendTelegramMessage(chatId, helpText, {
          reply_markup: getInlineKeyboard(userLang),
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
          `🌐 <b>Tilni tanlang / Tildi saylań / Выберите язык / Select language:</b>`,
          {
            reply_markup: getLangSelectInlineKeyboard(),
          }
        );
        return;
      }

      // Any other text message -> Friendly fallback prompt with Menu button
      const fallbackPrompt =
        userLang === 'qr'
          ? `Sálem <b>${safeName}</b>! Cake Bumer shiyrinlikler menyusin kóriw ushın tómendegi túymeni basıń:`
          : userLang === 'ru'
          ? `Здравствуйте, <b>${safeName}</b>! Чтобы посмотреть десерты Cake Bumer, нажмите кнопку ниже:`
          : userLang === 'en'
          ? `Hello <b>${safeName}</b>! To browse Cake Bumer desserts, tap the button below:`
          : `Salom <b>${safeName}</b>! Cake Bumer shirinliklar menyusini ko'rish uchun quyidagi tugmani bosing:`;

      await sendTelegramMessage(chatId, fallbackPrompt, {
        reply_markup: getInlineKeyboard(userLang),
      });
      return;
    }

    // 2. Process Callback Queries (Inline buttons)
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
        : [from.first_name, from.last_name].filter(Boolean).join(' ') || 'Mijoz';
      const safeName = rawName
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Language selection triggers
      if (data === 'open_lang_select') {
        await answerCallbackQuery(cbId);
        await sendTelegramMessage(
          chatId,
          `🌐 <b>Tilni tanlang / Tildi saylań / Выберите язык / Select language:</b>`,
          {
            reply_markup: getLangSelectInlineKeyboard(),
          }
        );
        return;
      }

      if (data === 'open_help') {
        await answerCallbackQuery(cbId);
        const existingUser = await db.getTelegramUser(from.id);
        const lang = existingUser?.lang || 'uz';
        await sendTelegramMessage(chatId, getHelpMessage(lang), {
          reply_markup: getInlineKeyboard(lang),
        });
        return;
      }

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

        let ack = "Til muvaffaqiyatli o'zgartirildi!";
        if (newLang === 'qr') ack = 'Til tabıslı ózgertildi!';
        else if (newLang === 'ru') ack = 'Язык успешно изменен!';
        else if (newLang === 'en') ack = 'Language changed successfully!';

        await answerCallbackQuery(cbId, ack, false);

        // Update persistent reply keyboard to new language
        await sendTelegramMessage(chatId, `✅ ${ack}`, {
          reply_markup: getReplyKeyboard(newLang),
        });

        // Send localized start message with WebApp button
        const startMsg = getStartMessage(safeName, newLang);
        await sendTelegramMessage(chatId, startMsg, {
          reply_markup: getInlineKeyboard(newLang),
        });
        return;
      }

      await answerCallbackQuery(cbId);
    }
  } catch (err) {
    console.error('[Telegram Update Processing Error]:', err);
  }
}
