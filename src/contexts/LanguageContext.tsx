import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'es' | 'en' | 'th' | 'ru';

interface Translations {
  [key: string]: {
    es: string;
    en: string;
    th: string;
    ru: string;
  };
}

export const translations: Translations = {
  // Header
  'header.miningBalance': { 
    es: 'Balance de Minado', 
    en: 'Mining Balance',
    th: 'ยอดขุด',
    ru: 'Баланс майнинга'
  },
  'header.miningBalanceDesc': { 
    es: 'Recompensas de minado, anuncios, etc.', 
    en: 'Mining rewards, ads, etc.',
    th: 'รางวัลการขุด, โฆษณา ฯลฯ',
    ru: 'Награды за майнинг, реклама и т.д.'
  },
  'header.depositBalance': { 
    es: 'Balance de Depósito', 
    en: 'Deposit Balance',
    th: 'ยอดเงินฝาก',
    ru: 'Баланс депозита'
  },
  'header.depositBalanceDesc': { 
    es: 'Para comprar cajas, anuncios, minería online', 
    en: 'For boxes, ads, online mining',
    th: 'สำหรับกล่อง, โฆษณา, การขุดออนไลน์',
    ru: 'Для покупки коробок, рекламы, онлайн-майнинга'
  },
  'header.logout': { 
    es: '¡Hasta pronto! Much goodbye!', 
    en: 'See you soon! Much goodbye!',
    th: 'แล้วพบกันใหม่! ลาก่อน!',
    ru: 'До скорой встречи! Пока!'
  },
  'header.depositAlert': { 
    es: 'Por problemas con la API de FaucetPay, los depósitos no se procesan automáticamente. Envía tu ID de transacción y email a:', 
    en: 'Due to FaucetPay API issues, deposits are not being processed automatically. Send your transaction ID and email to:',
    th: 'เนื่องจากปัญหา FaucetPay API การฝากเงินไม่ได้ดำเนินการโดยอัตโนมัติ ส่ง ID ธุรกรรมและอีเมลไปที่:',
    ru: 'Из-за проблем с API FaucetPay депозиты не обрабатываются автоматически. Отправьте ID транзакции и email на:'
  },
  
  // Sidebar
  'sidebar.home': { es: 'Inicio', en: 'Home', th: 'หน้าแรก', ru: 'Главная' },
  'sidebar.mysteryBoxes': { es: 'Cajas Misteriosas', en: 'Mystery Boxes', th: 'กล่องปริศนา', ru: 'Загадочные коробки' },
  'sidebar.inventory': { es: 'Inventario', en: 'Inventory', th: 'คลัง', ru: 'Инвентарь' },
  'sidebar.collection': { es: 'Colección', en: 'Collection', th: 'คอลเลกชัน', ru: 'Коллекция' },
  'sidebar.onlineMining': { es: 'Minería Online', en: 'Online Mining', th: 'ขุดออนไลน์', ru: 'Онлайн-майнинг' },
  'sidebar.webMining': { es: 'Minería Web DOGE', en: 'DOGE Web Mining', th: 'ขุดเว็บ DOGE', ru: 'Веб-майнинг DOGE' },
  'sidebar.lottery': { es: 'Lotería', en: 'Lottery', th: 'ลอตเตอรี่', ru: 'Лотерея' },
  'sidebar.shortlinks': { es: 'Shortlinks', en: 'Shortlinks', th: 'ลิงก์สั้น', ru: 'Короткие ссылки' },
  'sidebar.ptc': { es: 'Ver Anuncios (PTC)', en: 'View Ads (PTC)', th: 'ดูโฆษณา (PTC)', ru: 'Смотреть рекламу (PTC)' },
  'sidebar.faucetpay': { es: 'Depósito / Retiro', en: 'Deposit / Withdraw', th: 'ฝาก / ถอน', ru: 'Депозит / Вывод' },
  'sidebar.referral': { es: 'Referidos', en: 'Referrals', th: 'แนะนำเพื่อน', ru: 'Рефералы' },
  'sidebar.staking': { es: 'Staking', en: 'Staking', th: 'สเตกกิ้ง', ru: 'Стейкинг' },
  'sidebar.admin': { es: 'Panel Admin', en: 'Admin Panel', th: 'แผงผู้ดูแล', ru: 'Панель админа' },
  
  // Hero
  'hero.badge': { es: '¡Much WOW! ¡Very Mine! 🚀', en: 'Much WOW! Very Mine! 🚀', th: 'สุดยอด! ขุดกัน! 🚀', ru: 'Ого! Майним! 🚀' },
  'hero.title1': { es: 'Mina ', en: 'Mine ', th: 'ขุด ', ru: 'Майни ' },
  'hero.title2': { es: ' con Tu Colección de ', en: ' with Your ', th: ' กับคอลเลกชัน ', ru: ' с твоей коллекцией ' },
  'hero.title3': { es: '', en: ' Collection', th: ' ของคุณ', ru: '' },
  'hero.subtitle': { 
    es: '¡Such earn! ¡Many coins! Colecciona personajes Doge y gana Dogecoin pasivamente. ¡To the moon! 🌙', 
    en: 'Such earn! Many coins! Collect cute Doge characters and earn passive Dogecoin. To the moon! 🌙',
    th: 'รับรางวัล! หลายเหรียญ! สะสมตัวละคร Doge และรับ Dogecoin แบบพาสซีฟ To the moon! 🌙',
    ru: 'Зарабатывай! Много монет! Собирай персонажей Doge и получай Dogecoin пассивно. На Луну! 🌙'
  },
  'hero.cta1': { es: '¡To The Moon!', en: 'To The Moon!', th: 'ไปดวงจันทร์!', ru: 'На Луну!' },
  'hero.cta2': { es: 'Ver Colección', en: 'View Collection', th: 'ดูคอลเลกชัน', ru: 'Смотреть коллекцию' },
  'hero.stat1': { es: 'Much Miners', en: 'Much Miners', th: 'นักขุด', ru: 'Майнеров' },
  'hero.stat2': { es: 'DOGE Minados', en: 'DOGE Mined', th: 'DOGE ที่ขุดได้', ru: 'DOGE добыто' },
  'hero.stat3': { es: 'Very Doges', en: 'Very Doges', th: 'Doge ทั้งหมด', ru: 'Всего Doge' },
  
  // Auth
  'auth.login': { es: 'Iniciar Sesión', en: 'Login', th: 'เข้าสู่ระบบ', ru: 'Войти' },
  'auth.signup': { es: 'Crear Cuenta', en: 'Sign Up', th: 'สมัครสมาชิก', ru: 'Регистрация' },
  'auth.email': { es: 'Email', en: 'Email', th: 'อีเมล', ru: 'Email' },
  'auth.password': { es: 'Contraseña', en: 'Password', th: 'รหัสผ่าน', ru: 'Пароль' },
  'auth.loginPrompt': { es: 'Inicia sesión para continuar', en: 'Login to continue', th: 'เข้าสู่ระบบเพื่อดำเนินการต่อ', ru: 'Войдите для продолжения' },
  'auth.signupPrompt': { es: 'Crea tu cuenta y empieza a minar', en: 'Create your account and start mining', th: 'สร้างบัญชีและเริ่มขุด', ru: 'Создай аккаунт и начни майнить' },
  'auth.noAccount': { es: '¿No tienes cuenta?', en: "Don't have an account?", th: 'ยังไม่มีบัญชี?', ru: 'Нет аккаунта?' },
  'auth.hasAccount': { es: '¿Ya tienes cuenta?', en: 'Already have an account?', th: 'มีบัญชีแล้ว?', ru: 'Уже есть аккаунт?' },
  'auth.register': { es: 'Regístrate', en: 'Sign up', th: 'สมัคร', ru: 'Зарегистрироваться' },
  'auth.loginLink': { es: 'Inicia sesión', en: 'Login', th: 'เข้าสู่ระบบ', ru: 'Войти' },
  'auth.invitedBy': { es: '¡Invitado por un amigo!', en: 'Invited by a friend!', th: 'ได้รับเชิญจากเพื่อน!', ru: 'Приглашён другом!' },
  'auth.code': { es: 'Código', en: 'Code', th: 'รหัส', ru: 'Код' },
  'auth.accessDenied': { es: 'Acceso denegado', en: 'Access denied', th: 'การเข้าถึงถูกปฏิเสธ', ru: 'Доступ запрещён' },
  'auth.tempBlocked': { es: 'Cuenta bloqueada temporalmente', en: 'Account temporarily blocked', th: 'บัญชีถูกบล็อกชั่วคราว', ru: 'Аккаунт временно заблокирован' },
  'auth.wait': { es: 'Espera', en: 'Wait', th: 'รอ', ru: 'Подожди' },
  'auth.seconds': { es: 'segundos', en: 'seconds', th: 'วินาที', ru: 'секунд' },
  'auth.blocked': { es: 'Bloqueado', en: 'Blocked', th: 'ถูกบล็อก', ru: 'Заблокирован' },
  'auth.protected': { es: 'Protegido con fingerprinting', en: 'Protected with fingerprinting', th: 'ป้องกันด้วย fingerprinting', ru: 'Защищено отпечатком' },
  'auth.welcome': { es: '¡Bienvenido de vuelta!', en: 'Welcome back!', th: 'ยินดีต้อนรับกลับ!', ru: 'С возвращением!' },
  'auth.accountCreated': { es: '¡Cuenta creada! Ya puedes empezar a jugar.', en: 'Account created! You can start playing now.', th: 'สร้างบัญชีแล้ว! คุณสามารถเริ่มเล่นได้เลย', ru: 'Аккаунт создан! Можешь начинать играть.' },
  
  // FaucetPay
  'faucetpay.title': { es: 'Depósitos y Retiros', en: 'Deposits & Withdrawals', th: 'ฝากและถอน', ru: 'Депозиты и выводы' },
  'faucetpay.subtitle': { es: 'Deposita y retira tu DOGE de forma segura. Much secure! 🔐', en: 'Deposit and withdraw your DOGE securely. Much secure! 🔐', th: 'ฝากและถอน DOGE อย่างปลอดภัย 🔐', ru: 'Пополняй и выводи DOGE безопасно 🔐' },
  'faucetpay.dailyLimit': { es: 'Límite diario de retiro', en: 'Daily withdrawal limit', th: 'ลิมิตถอนรายวัน', ru: 'Дневной лимит вывода' },
  'faucetpay.availableToday': { es: 'Disponible hoy', en: 'Available today', th: 'ใช้ได้วันนี้', ru: 'Доступно сегодня' },
  'faucetpay.resetMidnight': { es: 'El límite se reinicia a medianoche UTC', en: 'Limit resets at midnight UTC', th: 'ลิมิตรีเซ็ตเที่ยงคืน UTC', ru: 'Лимит сбрасывается в полночь UTC' },
  'faucetpay.withdraw': { es: 'Retirar DOGE', en: 'Withdraw DOGE', th: 'ถอน DOGE', ru: 'Вывести DOGE' },
  'faucetpay.sendToFaucetpay': { es: 'Envía a tu FaucetPay', en: 'Send to your FaucetPay', th: 'ส่งไปยัง FaucetPay', ru: 'Отправить на FaucetPay' },
  'faucetpay.yourBalance': { es: 'Tu balance disponible', en: 'Your available balance', th: 'ยอดคงเหลือของคุณ', ru: 'Ваш доступный баланс' },
  'faucetpay.faucetpayEmail': { es: 'Tu email de FaucetPay', en: 'Your FaucetPay email', th: 'อีเมล FaucetPay ของคุณ', ru: 'Ваш email FaucetPay' },
  'faucetpay.amountToWithdraw': { es: 'Cantidad a retirar', en: 'Amount to withdraw', th: 'จำนวนที่จะถอน', ru: 'Сумма для вывода' },
  'faucetpay.processing': { es: 'Procesando...', en: 'Processing...', th: 'กำลังดำเนินการ...', ru: 'Обработка...' },
  'faucetpay.withdrawBtn': { es: 'Retirar', en: 'Withdraw', th: 'ถอน', ru: 'Вывести' },
  'faucetpay.minWithdraw': { es: 'Mínimo', en: 'Minimum', th: 'ขั้นต่ำ', ru: 'Минимум' },
  'faucetpay.maxDaily': { es: 'Máximo diario', en: 'Daily max', th: 'สูงสุดต่อวัน', ru: 'Макс. в день' },
  'faucetpay.deposit': { es: 'Depositar DOGE', en: 'Deposit DOGE', th: 'ฝาก DOGE', ru: 'Пополнить DOGE' },
  'faucetpay.sendToAddress': { es: 'Envía DOGE a nuestra dirección', en: 'Send DOGE to our address', th: 'ส่ง DOGE ไปยังที่อยู่ของเรา', ru: 'Отправьте DOGE на наш адрес' },
  'faucetpay.depositAddress': { es: 'Dirección de depósito DOGE', en: 'DOGE deposit address', th: 'ที่อยู่ฝาก DOGE', ru: 'Адрес для депозита DOGE' },
  'faucetpay.reportDeposit': { es: 'Reportar depósito', en: 'Report deposit', th: 'รายงานการฝาก', ru: 'Сообщить о депозите' },
  'faucetpay.amountSent': { es: 'Cantidad enviada (DOGE)', en: 'Amount sent (DOGE)', th: 'จำนวนที่ส่ง (DOGE)', ru: 'Отправленная сумма (DOGE)' },
  'faucetpay.txHash': { es: 'TX Hash de la transacción', en: 'Transaction TX Hash', th: 'TX Hash ธุรกรรม', ru: 'TX Hash транзакции' },
  'faucetpay.reporting': { es: 'Reportando...', en: 'Reporting...', th: 'กำลังรายงาน...', ru: 'Отправка...' },
  'faucetpay.reportBtn': { es: 'Reportar Depósito', en: 'Report Deposit', th: 'รายงานการฝาก', ru: 'Сообщить о депозите' },
  'faucetpay.important': { es: 'Importante', en: 'Important', th: 'สำคัญ', ru: 'Важно' },
  'faucetpay.minDeposit': { es: 'Mínimo de depósito', en: 'Minimum deposit', th: 'ฝากขั้นต่ำ', ru: 'Мин. депозит' },
  'faucetpay.onlySendDoge': { es: 'Solo envía DOGE a esta dirección', en: 'Only send DOGE to this address', th: 'ส่งเฉพาะ DOGE ไปยังที่อยู่นี้', ru: 'Отправляйте только DOGE на этот адрес' },
  'faucetpay.reportAfterSend': { es: 'Reporta tu TX hash después de enviar', en: 'Report your TX hash after sending', th: 'รายงาน TX hash หลังจากส่ง', ru: 'Сообщите TX hash после отправки' },
  'faucetpay.creditTime': { es: 'Los depósitos se acreditan en 1-2 minutos', en: 'Deposits are credited in 1-2 minutes', th: 'การฝากจะเครดิตใน 1-2 นาที', ru: 'Депозиты зачисляются за 1-2 минуты' },
  'faucetpay.history': { es: 'Historial de Transacciones', en: 'Transaction History', th: 'ประวัติธุรกรรม', ru: 'История транзакций' },
  'faucetpay.depositsWithdrawals': { es: 'Depósitos y retiros', en: 'Deposits and withdrawals', th: 'ฝากและถอน', ru: 'Депозиты и выводы' },
  'faucetpay.noTransactions': { es: 'No hay transacciones aún. Such empty! 🐕', en: 'No transactions yet. Such empty! 🐕', th: 'ยังไม่มีธุรกรรม 🐕', ru: 'Пока нет транзакций 🐕' },
  'faucetpay.depositLabel': { es: 'Depósito', en: 'Deposit', th: 'ฝาก', ru: 'Депозит' },
  'faucetpay.withdrawalLabel': { es: 'Retiro', en: 'Withdrawal', th: 'ถอน', ru: 'Вывод' },
  'faucetpay.completed': { es: 'Completado', en: 'Completed', th: 'สำเร็จ', ru: 'Завершено' },
  'faucetpay.failed': { es: 'Fallido', en: 'Failed', th: 'ล้มเหลว', ru: 'Ошибка' },
  'faucetpay.pending': { es: 'Pendiente', en: 'Pending', th: 'รอดำเนินการ', ru: 'Ожидание' },
  'faucetpay.expired': { es: 'Expirado', en: 'Expired', th: 'หมดอายุ', ru: 'Истёк' },
  
  // Referral
  'referral.badge': { es: 'Programa de Referidos', en: 'Referral Program', th: 'โปรแกรมแนะนำ', ru: 'Реферальная программа' },
  'referral.title': { es: 'Invita Amigos, ', en: 'Invite Friends, ', th: 'เชิญเพื่อน, ', ru: 'Пригласи друзей, ' },
  'referral.titleHighlight': { es: 'Gana DOGE', en: 'Earn DOGE', th: 'รับ DOGE', ru: 'Получи DOGE' },
  'referral.subtitle': { es: 'Gana el 5% de todo el DOGE que tus referidos generen por minado pasivo. ¡Sin límites!', en: 'Earn 5% of all DOGE your referrals generate from passive mining. No limits!', th: 'รับ 5% จาก DOGE ทั้งหมดที่ผู้แนะนำของคุณขุดได้ ไม่จำกัด!', ru: 'Получай 5% от всего DOGE, который заработают твои рефералы. Без лимитов!' },
  'referral.yourLink': { es: 'Tu Link de Referido', en: 'Your Referral Link', th: 'ลิงก์แนะนำของคุณ', ru: 'Ваша реферальная ссылка' },
  'referral.shareWithFriends': { es: 'Compártelo con amigos', en: 'Share it with friends', th: 'แชร์ให้เพื่อน', ru: 'Поделись с друзьями' },
  'referral.referrals': { es: 'Referidos', en: 'Referrals', th: 'ผู้แนะนำ', ru: 'Рефералы' },
  'referral.totalDoge': { es: 'DOGE Totales', en: 'Total DOGE', th: 'DOGE ทั้งหมด', ru: 'Всего DOGE' },
  'referral.status': { es: 'Estado de Referido', en: 'Referral Status', th: 'สถานะการแนะนำ', ru: 'Статус реферала' },
  'referral.yourLink2': { es: 'Tu vinculación actual', en: 'Your current link', th: 'ลิงก์ปัจจุบันของคุณ', ru: 'Ваша текущая связь' },
  'referral.linkedToReferrer': { es: '¡Estás vinculado a un referidor!', en: "You're linked to a referrer!", th: 'คุณเชื่อมต่อกับผู้แนะนำแล้ว!', ru: 'Вы привязаны к рефереру!' },
  'referral.noReferrer': { es: 'Sin referidor', en: 'No referrer', th: 'ไม่มีผู้แนะนำ', ru: 'Нет реферера' },
  'referral.noReferrerDesc': { es: 'Si alguien te invitó, usa su link para registrarte', en: 'If someone invited you, use their link to sign up', th: 'หากมีคนเชิญคุณ ใช้ลิงก์ของเขาในการสมัคร', ru: 'Если вас пригласили, используйте ссылку при регистрации' },
  'referral.howItWorks': { es: 'Cómo funciona:', en: 'How it works:', th: 'วิธีการทำงาน:', ru: 'Как это работает:' },
  'referral.step1': { es: 'Comparte tu link con amigos', en: 'Share your link with friends', th: 'แชร์ลิงก์ให้เพื่อน', ru: 'Поделись ссылкой с друзьями' },
  'referral.step2': { es: 'Cuando se registren, quedarán vinculados', en: 'When they sign up, they will be linked', th: 'เมื่อพวกเขาสมัคร พวกเขาจะเชื่อมต่อ', ru: 'Когда они зарегистрируются, будут привязаны' },
  'referral.step3': { es: 'Ganas 5% de todo su minado', en: 'You earn 5% of all their mining', th: 'คุณได้รับ 5% จากการขุดทั้งหมดของพวกเขา', ru: 'Получаешь 5% от их майнинга' },
  'referral.step4': { es: '¡Las comisiones son permanentes!', en: 'Commissions are permanent!', th: 'ค่าคอมมิชชั่นถาวร!', ru: 'Комиссии постоянные!' },
  'referral.linkCopied': { es: '¡Link copiado al portapapeles!', en: 'Link copied to clipboard!', th: 'คัดลอกลิงก์แล้ว!', ru: 'Ссылка скопирована!' },
  'referral.codeApplied': { es: '¡Código de referido aplicado automáticamente!', en: 'Referral code applied automatically!', th: 'ใช้รหัสแนะนำอัตโนมัติแล้ว!', ru: 'Реферальный код применён автоматически!' },
  
  // Mystery Box
  'mysterybox.title': { es: 'Mystery Boxes', en: 'Mystery Boxes', th: 'กล่องปริศนา', ru: 'Загадочные коробки' },
  'mysterybox.subtitle': { es: 'Abre cajas para conseguir personajes', en: 'Open boxes to get characters', th: 'เปิดกล่องเพื่อรับตัวละคร', ru: 'Открывай коробки для получения персонажей' },
  'mysterybox.common': { es: 'Común', en: 'Common', th: 'ธรรมดา', ru: 'Обычная' },
  'mysterybox.rare': { es: 'Rara', en: 'Rare', th: 'หายาก', ru: 'Редкая' },
  'mysterybox.legendary': { es: 'Legendaria', en: 'Legendary', th: 'ตำนาน', ru: 'Легендарная' },
  'mysterybox.open': { es: 'Abrir', en: 'Open', th: 'เปิด', ru: 'Открыть' },
  'mysterybox.badge': { es: '¡Nuevos Personajes!', en: 'New Characters!', th: 'ตัวละครใหม่!', ru: 'Новые персонажи!' },
  'mysterybox.description': { es: 'Abre cajas misteriosas para obtener personajes únicos que minan DOGE automáticamente.', en: 'Open mystery boxes to get unique characters that mine DOGE automatically.', th: 'เปิดกล่องปริศนาเพื่อรับตัวละครที่ขุด DOGE อัตโนมัติ', ru: 'Открывай коробки для получения уникальных персонажей, которые майнят DOGE автоматически.' },
  'mysterybox.guaranteed': { es: 'garantizado', en: 'guaranteed', th: 'รับประกัน', ru: 'гарантировано' },
  'mysterybox.orBetter': { es: 'o mejor', en: 'or better', th: 'หรือดีกว่า', ru: 'или лучше' },
  
  // Inventory
  'inventory.title': { es: 'Tu Colección', en: 'Your Collection', th: 'คอลเลกชันของคุณ', ru: 'Твоя коллекция' },
  'inventory.subtitle': { es: 'Tus Doges trabajando duro', en: 'Your Doges working hard', th: 'Doge ของคุณทำงานหนัก', ru: 'Твои Doge усердно работают' },
  'inventory.empty': { es: 'Aún no tienes personajes. ¡Abre una Mystery Box!', en: "You don't have characters yet. Open a Mystery Box!", th: 'คุณยังไม่มีตัวละคร เปิดกล่องปริศนา!', ru: 'У тебя ещё нет персонажей. Открой Mystery Box!' },
  'inventory.mine': { es: 'Minar', en: 'Mine', th: 'ขุด', ru: 'Майнить' },
  'inventory.mining': { es: 'Minando...', en: 'Mining...', th: 'กำลังขุด...', ru: 'Майнинг...' },
  'inventory.claim': { es: 'Reclamar', en: 'Claim', th: 'เก็บ', ru: 'Забрать' },
  'inventory.levelUp': { es: 'Subir Nivel', en: 'Level Up', th: 'อัพเลเวล', ru: 'Повысить уровень' },
  'inventory.maxLevel': { es: 'Nivel Máximo', en: 'Max Level', th: 'เลเวลสูงสุด', ru: 'Макс. уровень' },
  'inventory.level': { es: 'Nivel', en: 'Level', th: 'เลเวล', ru: 'Уровень' },
  'inventory.badge': { es: 'Tu Inventario', en: 'Your Inventory', th: 'คลังของคุณ', ru: 'Твой инвентарь' },
  'inventory.description': { es: 'Gestiona tus personajes, inicia el minado y reclama tus recompensas.', en: 'Manage your characters, start mining and claim your rewards.', th: 'จัดการตัวละคร เริ่มขุด และเก็บรางวัล', ru: 'Управляй персонажами, начинай майнинг и забирай награды.' },
  'inventory.perHour': { es: '/hora', en: '/hour', th: '/ชั่วโมง', ru: '/час' },
  'inventory.quantity': { es: 'Cantidad', en: 'Quantity', th: 'จำนวน', ru: 'Количество' },
  
  // Collection
  'collection.title': { es: 'Colección Completa', en: 'Complete Collection', th: 'คอลเลกชันทั้งหมด', ru: 'Полная коллекция' },
  'collection.subtitle': { es: 'Todos los personajes disponibles', en: 'All available characters', th: 'ตัวละครทั้งหมดที่มี', ru: 'Все доступные персонажи' },
  'collection.badge': { es: 'Galería de Personajes', en: 'Character Gallery', th: 'แกลเลอรีตัวละคร', ru: 'Галерея персонажей' },
  'collection.progress': { es: 'Progreso', en: 'Progress', th: 'ความคืบหน้า', ru: 'Прогресс' },
  'collection.collected': { es: 'Coleccionados', en: 'Collected', th: 'สะสมแล้ว', ru: 'Собрано' },
  'collection.reward': { es: 'Recompensa', en: 'Reward', th: 'รางวัล', ru: 'Награда' },
  'collection.claimReward': { es: 'Reclamar Recompensa', en: 'Claim Reward', th: 'รับรางวัล', ru: 'Забрать награду' },
  'collection.rewardClaimed': { es: 'Recompensa Reclamada', en: 'Reward Claimed', th: 'รับรางวัลแล้ว', ru: 'Награда получена' },
  'collection.completeToUnlock': { es: 'Completa la colección para desbloquear', en: 'Complete collection to unlock', th: 'สะสมให้ครบเพื่อปลดล็อก', ru: 'Соберите коллекцию для разблокировки' },
  
  // Online Mining
  'onlineMining.title': { es: 'Minería Online', en: 'Online Mining', th: 'ขุดออนไลน์', ru: 'Онлайн-майнинг' },
  'onlineMining.subtitle': { es: 'Invierte DOGE y gana intereses diarios', en: 'Invest DOGE and earn daily interest', th: 'ลงทุน DOGE และรับดอกเบี้ยรายวัน', ru: 'Инвестируй DOGE и получай ежедневный процент' },
  'onlineMining.badge': { es: 'Inversiones', en: 'Investments', th: 'การลงทุน', ru: 'Инвестиции' },
  'onlineMining.dailyReturn': { es: 'Retorno Diario', en: 'Daily Return', th: 'ผลตอบแทนรายวัน', ru: 'Дневной доход' },
  'onlineMining.minInvestment': { es: 'Inversión Mínima', en: 'Min Investment', th: 'ลงทุนขั้นต่ำ', ru: 'Мин. инвестиция' },
  'onlineMining.maxInvestment': { es: 'Inversión Máxima', en: 'Max Investment', th: 'ลงทุนสูงสุด', ru: 'Макс. инвестиция' },
  'onlineMining.invest': { es: 'Invertir', en: 'Invest', th: 'ลงทุน', ru: 'Инвестировать' },
  'onlineMining.yourInvestments': { es: 'Tus Inversiones', en: 'Your Investments', th: 'การลงทุนของคุณ', ru: 'Твои инвестиции' },
  'onlineMining.noInvestments': { es: 'No tienes inversiones activas', en: 'No active investments', th: 'ไม่มีการลงทุนที่ใช้งานอยู่', ru: 'Нет активных инвестиций' },
  'onlineMining.invested': { es: 'Invertido', en: 'Invested', th: 'ลงทุนแล้ว', ru: 'Инвестировано' },
  'onlineMining.earned': { es: 'Ganado', en: 'Earned', th: 'ได้รับ', ru: 'Заработано' },
  'onlineMining.claimRewards': { es: 'Reclamar Recompensas', en: 'Claim Rewards', th: 'รับรางวัล', ru: 'Забрать награды' },
  
  // Lottery
  'lottery.title': { es: 'Lotería de Personajes', en: 'Character Lottery', th: 'ลอตเตอรี่ตัวละคร', ru: 'Лотерея персонажей' },
  'lottery.subtitle': { es: 'Compra tickets y gana personajes exclusivos', en: 'Buy tickets and win exclusive characters', th: 'ซื้อตั๋วและลุ้นตัวละครพิเศษ', ru: 'Покупай билеты и выигрывай эксклюзивных персонажей' },
  'lottery.badge': { es: 'Sorteos Activos', en: 'Active Draws', th: 'การจับรางวัลที่ใช้งานอยู่', ru: 'Активные розыгрыши' },
  'lottery.ticketPrice': { es: 'Precio del Ticket', en: 'Ticket Price', th: 'ราคาตั๋ว', ru: 'Цена билета' },
  'lottery.soldTickets': { es: 'Tickets Vendidos', en: 'Tickets Sold', th: 'ตั๋วที่ขายแล้ว', ru: 'Продано билетов' },
  'lottery.buyTickets': { es: 'Comprar Tickets', en: 'Buy Tickets', th: 'ซื้อตั๋ว', ru: 'Купить билеты' },
  'lottery.yourTickets': { es: 'Tus Tickets', en: 'Your Tickets', th: 'ตั๋วของคุณ', ru: 'Твои билеты' },
  'lottery.noActiveLotteries': { es: 'No hay loterías activas', en: 'No active lotteries', th: 'ไม่มีลอตเตอรี่ที่ใช้งานอยู่', ru: 'Нет активных лотерей' },
  'lottery.winner': { es: 'Ganador', en: 'Winner', th: 'ผู้ชนะ', ru: 'Победитель' },
  'lottery.completed': { es: 'Completado', en: 'Completed', th: 'เสร็จสิ้น', ru: 'Завершено' },
  
  // Shortlinks
  'shortlinks.title': { es: 'Shortlinks', en: 'Shortlinks', th: 'ลิงก์สั้น', ru: 'Короткие ссылки' },
  'shortlinks.subtitle': { es: 'Completa enlaces cortos y gana DOGE', en: 'Complete short links and earn DOGE', th: 'ทำลิงก์สั้นและรับ DOGE', ru: 'Проходи короткие ссылки и зарабатывай DOGE' },
  'shortlinks.badge': { es: 'Gana Fácil', en: 'Easy Earn', th: 'รับง่าย', ru: 'Лёгкий заработок' },
  'shortlinks.reward': { es: 'Recompensa', en: 'Reward', th: 'รางวัล', ru: 'Награда' },
  'shortlinks.complete': { es: 'Completar', en: 'Complete', th: 'ทำเสร็จ', ru: 'Пройти' },
  'shortlinks.completed': { es: 'Completado', en: 'Completed', th: 'เสร็จแล้ว', ru: 'Пройдено' },
  'shortlinks.available': { es: 'Disponible', en: 'Available', th: 'พร้อมใช้งาน', ru: 'Доступно' },
  
  // PTC
  'ptc.title': { es: 'Ver Anuncios (PTC)', en: 'View Ads (PTC)', th: 'ดูโฆษณา (PTC)', ru: 'Смотреть рекламу (PTC)' },
  'ptc.subtitle': { es: 'Mira anuncios y gana DOGE', en: 'Watch ads and earn DOGE', th: 'ดูโฆษณาและรับ DOGE', ru: 'Смотри рекламу и зарабатывай DOGE' },
  'ptc.badge': { es: 'Paid To Click', en: 'Paid To Click', th: 'Paid To Click', ru: 'Paid To Click' },
  'ptc.viewAd': { es: 'Ver Anuncio', en: 'View Ad', th: 'ดูโฆษณา', ru: 'Смотреть рекламу' },
  'ptc.noAds': { es: 'No hay anuncios disponibles', en: 'No ads available', th: 'ไม่มีโฆษณาที่ใช้ได้', ru: 'Нет доступной рекламы' },
  'ptc.reward': { es: 'Recompensa', en: 'Reward', th: 'รางวัล', ru: 'Награда' },
  'ptc.views': { es: 'Vistas', en: 'Views', th: 'ยอดดู', ru: 'Просмотры' },
  'ptc.createAd': { es: 'Crear Anuncio', en: 'Create Ad', th: 'สร้างโฆษณา', ru: 'Создать рекламу' },
  'ptc.yourAds': { es: 'Tus Anuncios', en: 'Your Ads', th: 'โฆษณาของคุณ', ru: 'Твоя реклама' },
  
  // How It Works
  'howItWorks.title': { es: '¿Cómo Funciona?', en: 'How It Works?', th: 'ทำงานอย่างไร?', ru: 'Как это работает?' },
  'howItWorks.subtitle': { es: 'Es muy fácil empezar a minar DOGE', en: "It's very easy to start mining DOGE", th: 'เริ่มขุด DOGE ง่ายมาก', ru: 'Начать майнить DOGE очень просто' },
  'howItWorks.step1.title': { es: 'Crea tu Cuenta', en: 'Create Account', th: 'สร้างบัญชี', ru: 'Создай аккаунт' },
  'howItWorks.step1.desc': { es: 'Regístrate gratis y recibe tu primer personaje', en: 'Sign up for free and get your first character', th: 'สมัครฟรีและรับตัวละครแรก', ru: 'Зарегистрируйся бесплатно и получи первого персонажа' },
  'howItWorks.step2.title': { es: 'Colecciona Personajes', en: 'Collect Characters', th: 'สะสมตัวละคร', ru: 'Собирай персонажей' },
  'howItWorks.step2.desc': { es: 'Abre Mystery Boxes para obtener nuevos Doges', en: 'Open Mystery Boxes to get new Doges', th: 'เปิดกล่องปริศนาเพื่อรับ Doge ใหม่', ru: 'Открывай Mystery Box для получения новых Doge' },
  'howItWorks.step3.title': { es: 'Mina Automáticamente', en: 'Mine Automatically', th: 'ขุดอัตโนมัติ', ru: 'Майни автоматически' },
  'howItWorks.step3.desc': { es: 'Tus personajes minan DOGE las 24 horas', en: 'Your characters mine DOGE 24/7', th: 'ตัวละครของคุณขุด DOGE 24/7', ru: 'Твои персонажи майнят DOGE 24/7' },
  'howItWorks.step4.title': { es: 'Retira tu DOGE', en: 'Withdraw DOGE', th: 'ถอน DOGE', ru: 'Выводи DOGE' },
  'howItWorks.step4.desc': { es: 'Envía tus ganancias a tu wallet', en: 'Send your earnings to your wallet', th: 'ส่งรายได้ไปยังกระเป๋าของคุณ', ru: 'Отправляй заработок на свой кошелёк' },
  
  // Withdrawals
  'withdrawals.title': { es: 'Últimos Retiros', en: 'Latest Withdrawals', th: 'การถอนล่าสุด', ru: 'Последние выводы' },
  'withdrawals.subtitle': { es: 'Usuarios que han retirado recientemente', en: 'Users who withdrew recently', th: 'ผู้ใช้ที่ถอนเมื่อเร็วๆ นี้', ru: 'Пользователи, которые недавно выводили' },
  
  // Rarity
  'rarity.title': { es: 'Rareza de Personajes', en: 'Character Rarity', th: 'ความหายากของตัวละคร', ru: 'Редкость персонажей' },
  'rarity.subtitle': { es: 'Conoce las probabilidades de cada rareza', en: 'Know the probabilities of each rarity', th: 'รู้โอกาสของแต่ละความหายาก', ru: 'Узнай вероятности каждой редкости' },
  'rarity.common': { es: 'Común', en: 'Common', th: 'ธรรมดา', ru: 'Обычный' },
  'rarity.rare': { es: 'Raro', en: 'Rare', th: 'หายาก', ru: 'Редкий' },
  'rarity.epic': { es: 'Épico', en: 'Epic', th: 'มหากาพย์', ru: 'Эпический' },
  'rarity.legendary': { es: 'Legendario', en: 'Legendary', th: 'ตำนาน', ru: 'Легендарный' },
  'rarity.starter': { es: 'Inicial', en: 'Starter', th: 'เริ่มต้น', ru: 'Начальный' },
  
  // CTA
  'cta.title': { es: '¿Listo para Empezar?', en: 'Ready to Start?', th: 'พร้อมเริ่มต้นหรือยัง?', ru: 'Готов начать?' },
  'cta.subtitle': { es: 'Únete a miles de mineros y comienza a ganar DOGE hoy', en: 'Join thousands of miners and start earning DOGE today', th: 'เข้าร่วมกับนักขุดนับพันและเริ่มรับ DOGE วันนี้', ru: 'Присоединяйся к тысячам майнеров и начни зарабатывать DOGE сегодня' },
  'cta.button': { es: '¡Comenzar Ahora!', en: 'Start Now!', th: 'เริ่มเลย!', ru: 'Начать сейчас!' },
  
  // Admin
  'admin.title': { es: 'Panel de Administración', en: 'Admin Panel', th: 'แผงผู้ดูแล', ru: 'Панель администратора' },
  'admin.back': { es: 'Volver', en: 'Back', th: 'กลับ', ru: 'Назад' },
  'admin.refresh': { es: 'Actualizar', en: 'Refresh', th: 'รีเฟรช', ru: 'Обновить' },
  'admin.users': { es: 'Usuarios', en: 'Users', th: 'ผู้ใช้', ru: 'Пользователи' },
  'admin.deposits': { es: 'Depósitos', en: 'Deposits', th: 'ฝาก', ru: 'Депозиты' },
  'admin.withdrawals': { es: 'Retiros', en: 'Withdrawals', th: 'ถอน', ru: 'Выводы' },
  'admin.pendingDeposits': { es: 'Depósitos Pendientes', en: 'Pending Deposits', th: 'รอฝาก', ru: 'Ожидающие депозиты' },
  'admin.noPending': { es: 'No hay depósitos pendientes 🎉', en: 'No pending deposits 🎉', th: 'ไม่มีการฝากที่รอดำเนินการ 🎉', ru: 'Нет ожидающих депозитов 🎉' },
  'admin.approve': { es: 'Aprobar', en: 'Approve', th: 'อนุมัติ', ru: 'Одобрить' },
  'admin.reject': { es: 'Rechazar', en: 'Reject', th: 'ปฏิเสธ', ru: 'Отклонить' },
  'admin.user': { es: 'Usuario', en: 'User', th: 'ผู้ใช้', ru: 'Пользователь' },
  'admin.date': { es: 'Fecha', en: 'Date', th: 'วันที่', ru: 'Дата' },
  'admin.amount': { es: 'Cantidad', en: 'Amount', th: 'จำนวน', ru: 'Сумма' },
  'admin.status': { es: 'Estado', en: 'Status', th: 'สถานะ', ru: 'Статус' },
  'admin.actions': { es: 'Acciones', en: 'Actions', th: 'การดำเนินการ', ru: 'Действия' },
  'admin.addBalance': { es: 'Agregar Balance', en: 'Add Balance', th: 'เพิ่มยอด', ru: 'Добавить баланс' },
  'admin.searchUser': { es: 'Buscar usuario por email...', en: 'Search user by email...', th: 'ค้นหาผู้ใช้ด้วยอีเมล...', ru: 'Поиск пользователя по email...' },
  'admin.balance': { es: 'Balance', en: 'Balance', th: 'ยอดคงเหลือ', ru: 'Баланс' },
  'admin.totalEarned': { es: 'Total Ganado', en: 'Total Earned', th: 'รายได้ทั้งหมด', ru: 'Всего заработано' },
  'admin.totalWithdrawn': { es: 'Total Retirado', en: 'Total Withdrawn', th: 'ถอนทั้งหมด', ru: 'Всего выведено' },
  'admin.addBalanceToUser': { es: 'Agregar balance al usuario', en: 'Add balance to user', th: 'เพิ่มยอดให้ผู้ใช้', ru: 'Добавить баланс пользователю' },
  'admin.amountToAdd': { es: 'Cantidad a agregar', en: 'Amount to add', th: 'จำนวนที่จะเพิ่ม', ru: 'Сумма для добавления' },
  'admin.add': { es: 'Agregar', en: 'Add', th: 'เพิ่ม', ru: 'Добавить' },
  'admin.noUsers': { es: 'No se encontraron usuarios', en: 'No users found', th: 'ไม่พบผู้ใช้', ru: 'Пользователи не найдены' },
  'admin.allDeposits': { es: 'Todos los Depósitos', en: 'All Deposits', th: 'การฝากทั้งหมด', ru: 'Все депозиты' },
  'admin.allWithdrawals': { es: 'Todos los Retiros', en: 'All Withdrawals', th: 'การถอนทั้งหมด', ru: 'Все выводы' },
  
  // Offerwalls
  'offerwalls.title': { es: 'Offerwalls', en: 'Offerwalls', th: 'Offerwalls', ru: 'Offerwalls' },
  'offerwalls.subtitle': { es: 'Completa tareas y ofertas para ganar DOGE. ¡Cuantas más completes, más ganas! 🎯', en: 'Complete tasks and offers to earn DOGE. The more you complete, the more you earn! 🎯', th: 'ทำภารกิจและข้อเสนอเพื่อรับ DOGE ยิ่งทำมากยิ่งได้มาก! 🎯', ru: 'Выполняй задания и офферы, чтобы заработать DOGE. Чем больше выполнишь, тем больше заработаешь! 🎯' },
  'offerwalls.timewallDesc': { es: 'Completa encuestas, instala apps y realiza tareas para ganar DOGE al instante.', en: 'Complete surveys, install apps and do tasks to earn DOGE instantly.', th: 'ทำแบบสำรวจ ติดตั้งแอป และทำภารกิจเพื่อรับ DOGE ทันที', ru: 'Проходи опросы, устанавливай приложения и выполняй задания, чтобы получить DOGE мгновенно.' },
  'offerwalls.bitcotaskDesc': { es: 'Descubre ofertas exclusivas con las mejores recompensas en DOGE.', en: 'Discover exclusive offers with the best DOGE rewards.', th: 'ค้นพบข้อเสนอพิเศษที่ให้รางวัล DOGE ดีที่สุด', ru: 'Открой эксклюзивные офферы с лучшими наградами в DOGE.' },
  'offerwalls.hot': { es: '¡Popular!', en: 'Hot!', th: 'ยอดนิยม!', ru: 'Популярно!' },
  'offerwalls.instant': { es: 'Pago instantáneo', en: 'Instant payout', th: 'จ่ายทันที', ru: 'Мгновенная выплата' },
  'offerwalls.openButton': { es: 'Abrir Offerwall', en: 'Open Offerwall', th: 'เปิด Offerwall', ru: 'Открыть Offerwall' },
  'offerwalls.tipsTitle': { es: 'Consejos para ganar más', en: 'Tips to earn more', th: 'เคล็ดลับเพื่อรับมากขึ้น', ru: 'Советы для большего заработка' },
  'offerwalls.tip1': { es: 'Completa tu perfil para recibir ofertas mejor adaptadas a ti', en: 'Complete your profile to receive better tailored offers', th: 'กรอกโปรไฟล์ของคุณเพื่อรับข้อเสนอที่เหมาะกับคุณมากขึ้น', ru: 'Заполни профиль, чтобы получать подходящие офферы' },
  'offerwalls.tip2': { es: 'Las encuestas y descargas de apps suelen dar más recompensas', en: 'Surveys and app downloads usually give higher rewards', th: 'แบบสำรวจและการดาวน์โหลดแอปมักให้รางวัลมากกว่า', ru: 'Опросы и загрузка приложений обычно дают больше наград' },
  'offerwalls.tip3': { es: 'Revisa las offerwalls diariamente para nuevas ofertas', en: 'Check offerwalls daily for new offers', th: 'ตรวจสอบ offerwall ทุกวันเพื่อดูข้อเสนอใหม่', ru: 'Проверяй offerwalls ежедневно для новых офферов' },
  'sidebar.offerwalls': { es: 'Offerwalls', en: 'Offerwalls', th: 'Offerwalls', ru: 'Offerwalls' },
  
  // Support
  'support.badge': { es: '¿Necesitas ayuda?', en: 'Need help?', th: 'ต้องการความช่วยเหลือ?', ru: 'Нужна помощь?' },
  'support.title': { es: 'Soporte', en: 'Support', th: 'ช่วยเหลือ', ru: 'Поддержка' },
  'support.subtitle': { es: '¿Tienes alguna pregunta o problema? ¡Estamos aquí para ayudarte! 🐕', en: 'Have a question or issue? We are here to help! 🐕', th: 'มีคำถามหรือปัญหา? เราพร้อมช่วยเหลือ! 🐕', ru: 'Есть вопрос или проблема? Мы здесь, чтобы помочь! 🐕' },
  'support.contactUs': { es: 'Contáctanos', en: 'Contact Us', th: 'ติดต่อเรา', ru: 'Свяжитесь с нами' },
  'support.description': { es: 'Envíanos un email y te responderemos lo antes posible. Describe tu problema o pregunta con el mayor detalle posible.', en: 'Send us an email and we will reply as soon as possible. Describe your issue or question in as much detail as possible.', th: 'ส่งอีเมลถึงเรา เราจะตอบกลับโดยเร็วที่สุด อธิบายปัญหาหรือคำถามของคุณอย่างละเอียด', ru: 'Отправьте нам email, и мы ответим как можно скорее. Опишите вашу проблему или вопрос как можно подробнее.' },
  'support.sendEmail': { es: 'Enviar Email', en: 'Send Email', th: 'ส่งอีเมล', ru: 'Отправить Email' },
  'support.responseTime': { es: 'Tiempo de respuesta: 24-48 horas', en: 'Response time: 24-48 hours', th: 'เวลาตอบกลับ: 24-48 ชั่วโมง', ru: 'Время ответа: 24-48 часов' },
  
  // Common
  'common.loading': { es: 'Cargando...', en: 'Loading...', th: 'กำลังโหลด...', ru: 'Загрузка...' },
  'common.error': { es: 'Error', en: 'Error', th: 'ข้อผิดพลาด', ru: 'Ошибка' },
  'common.success': { es: 'Éxito', en: 'Success', th: 'สำเร็จ', ru: 'Успех' },
  'common.cancel': { es: 'Cancelar', en: 'Cancel', th: 'ยกเลิก', ru: 'Отмена' },
  'common.confirm': { es: 'Confirmar', en: 'Confirm', th: 'ยืนยัน', ru: 'Подтвердить' },
  'common.save': { es: 'Guardar', en: 'Save', th: 'บันทึก', ru: 'Сохранить' },
  'common.close': { es: 'Cerrar', en: 'Close', th: 'ปิด', ru: 'Закрыть' },
  'common.copy': { es: 'Copiar', en: 'Copy', th: 'คัดลอก', ru: 'Копировать' },
  'common.copied': { es: 'Copiado', en: 'Copied', th: 'คัดลอกแล้ว', ru: 'Скопировано' },
  'common.perHour': { es: '/hora', en: '/hour', th: '/ชั่วโมง', ru: '/час' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('rpg-doge-language');
    return (saved as Language) || 'es';
  });

  useEffect(() => {
    localStorage.setItem('rpg-doge-language', language);
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
