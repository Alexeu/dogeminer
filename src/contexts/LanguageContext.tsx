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
  'sidebar.socialTasks': { es: 'Tareas Sociales', en: 'Social Tasks', th: 'งานโซเชียล', ru: 'Соц. задания' },
  'sidebar.admin': { es: 'Panel Admin', en: 'Admin Panel', th: 'แผงผู้ดูแล', ru: 'Панель админа' },
  'sidebar.rpgdoge': { es: '⚔️ RPGDOGE', en: '⚔️ RPGDOGE', th: '⚔️ RPGDOGE', ru: '⚔️ RPGDOGE' },
  
  // Hero
  'hero.badge': { es: '¡Much WOW! ¡Very Mine! 🚀', en: 'Much WOW! Very Mine! 🚀', th: 'สุดยอด! ขุดกัน! 🚀', ru: 'Ого! Майним! 🚀' },
  'hero.title1': { es: 'Gana ', en: 'Earn ', th: 'รับ ', ru: 'Зарабатывай ' },
  'hero.title2': { es: ' Gratis', en: ' Free', th: ' ฟรี', ru: ' Бесплатно' },
  'hero.title3': { es: 'con tu ', en: 'with Your ', th: 'กับ ', ru: 'с твоей ' },
  'hero.title4': { es: 'Colección', en: 'Collection', th: 'คอลเลกชัน', ru: 'Коллекцией' },
  'hero.subtitle': { 
    es: 'Colecciona personajes Doge únicos y gana Dogecoin automáticamente 24/7. ¡Retiros instantáneos a FaucetPay! 🌙', 
    en: 'Collect unique Doge characters and earn Dogecoin automatically 24/7. Instant withdrawals to FaucetPay! 🌙',
    th: 'สะสมตัวละคร Doge ที่ไม่ซ้ำกันและรับ Dogecoin โดยอัตโนมัติ 24/7 ถอนทันทีไปยัง FaucetPay! 🌙',
    ru: 'Собирай уникальных персонажей Doge и зарабатывай Dogecoin автоматически 24/7. Мгновенный вывод на FaucetPay! 🌙'
  },
  'hero.ctaPrimary': { es: '¡Comenzar Gratis!', en: 'Start Free!', th: 'เริ่มต้นฟรี!', ru: 'Начать бесплатно!' },
  'hero.ctaSecondary': { es: 'Ver Colección', en: 'View Collection', th: 'ดูคอลเลกชัน', ru: 'Смотреть коллекцию' },
  'hero.statMiners': { es: 'Mineros', en: 'Miners', th: 'นักขุด', ru: 'Майнеров' },
  'hero.statOnline': { es: 'En Línea', en: 'Online Now', th: 'ออนไลน์', ru: 'Онлайн' },
  'hero.statMined': { es: 'DOGE Minados', en: 'DOGE Mined', th: 'DOGE ที่ขุดได้', ru: 'DOGE добыто' },
  'hero.statDoges': { es: 'Personajes', en: 'Characters', th: 'ตัวละคร', ru: 'Персонажей' },
  'hero.featureFree': { es: '100% Gratis', en: '100% Free', th: 'ฟรี 100%', ru: '100% Бесплатно' },
  'hero.featureMining': { es: 'Minería 24/7', en: '24/7 Mining', th: 'ขุด 24/7', ru: 'Майнинг 24/7' },
  'hero.featureWithdraw': { es: 'Retiros Instantáneos', en: 'Instant Withdrawals', th: 'ถอนทันที', ru: 'Мгновенный вывод' },
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
  'referral.shareOn': { es: 'Comparte en redes sociales:', en: 'Share on social media:', th: 'แชร์บนโซเชียลมีเดีย:', ru: 'Поделиться в соцсетях:' },
  
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
  
  // Support
  'support.badge': { es: '¿Necesitas ayuda?', en: 'Need help?', th: 'ต้องการความช่วยเหลือ?', ru: 'Нужна помощь?' },
  'support.title': { es: 'Soporte', en: 'Support', th: 'ช่วยเหลือ', ru: 'Поддержка' },
  'support.subtitle': { es: '¿Tienes alguna pregunta o problema? ¡Estamos aquí para ayudarte! 🐕', en: 'Have a question or issue? We are here to help! 🐕', th: 'มีคำถามหรือปัญหา? เราพร้อมช่วยเหลือ! 🐕', ru: 'Есть вопрос или проблема? Мы здесь, чтобы помочь! 🐕' },
  'support.contactUs': { es: 'Contáctanos', en: 'Contact Us', th: 'ติดต่อเรา', ru: 'Свяжитесь с нами' },
  'support.description': { es: 'Envíanos un email y te responderemos lo antes posible. Describe tu problema o pregunta con el mayor detalle posible.', en: 'Send us an email and we will reply as soon as possible. Describe your issue or question in as much detail as possible.', th: 'ส่งอีเมลถึงเรา เราจะตอบกลับโดยเร็วที่สุด อธิบายปัญหาหรือคำถามของคุณอย่างละเอียด', ru: 'Отправьте нам email, и мы ответим как можно скорее. Опишите вашу проблему или вопрос как можно подробнее.' },
  'support.sendEmail': { es: 'Enviar Email', en: 'Send Email', th: 'ส่งอีเมล', ru: 'Отправить Email' },
  'support.responseTime': { es: 'Tiempo de respuesta: 24-48 horas', en: 'Response time: 24-48 hours', th: 'เวลาตอบกลับ: 24-48 ชั่วโมง', ru: 'Время ответа: 24-48 часов' },
  
  // DOGE Birds Game
  'sidebar.dogeBirds': { es: 'DOGE Birds Game', en: 'DOGE Birds Game', th: 'เกม DOGE Birds', ru: 'Игра DOGE Birds' },
  'birds.title': { es: 'Cría Pájaros, ', en: 'Raise Birds, ', th: 'เลี้ยงนก, ', ru: 'Разводи птиц, ' },
  'birds.titleHighlight': { es: 'Gana Huevos', en: 'Earn Eggs', th: 'รับไข่', ru: 'Получай яйца' },
  'birds.subtitle': { es: 'Compra pájaros que generan huevos automáticamente. ¡Convierte tus huevos en DOGE! 🐦🥚', en: 'Buy birds that automatically generate eggs. Convert your eggs to DOGE! 🐦🥚', th: 'ซื้อนกที่สร้างไข่อัตโนมัติ แปลงไข่เป็น DOGE! 🐦🥚', ru: 'Покупай птиц, которые автоматически производят яйца. Меняй яйца на DOGE! 🐦🥚' },
  'birds.yellow': { es: 'Pájaro Amarillo', en: 'Yellow Bird', th: 'นกเหลือง', ru: 'Жёлтая птица' },
  'birds.red': { es: 'Pájaro Rojo', en: 'Red Bird', th: 'นกแดง', ru: 'Красная птица' },
  'birds.green': { es: 'Pájaro Verde', en: 'Green Bird', th: 'นกเขียว', ru: 'Зелёная птица' },
  'birds.blue': { es: 'Pájaro Azul', en: 'Blue Bird', th: 'นกน้ำเงิน', ru: 'Синяя птица' },
  'birds.black': { es: 'Pájaro Negro', en: 'Black Bird', th: 'นกดำ', ru: 'Чёрная птица' },
  'birds.storedEggs': { es: 'Huevos Almacenados', en: 'Stored Eggs', th: 'ไข่ที่เก็บไว้', ru: 'Яиц на складе' },
  'birds.pendingEggs': { es: 'Huevos Pendientes', en: 'Pending Eggs', th: 'ไข่รอเก็บ', ru: 'Яиц ожидает' },
  'birds.eggsPerHour': { es: 'Huevos/Hora', en: 'Eggs/Hour', th: 'ไข่/ชั่วโมง', ru: 'Яиц/час' },
  'birds.balance': { es: 'Tu Balance', en: 'Your Balance', th: 'ยอดเงินของคุณ', ru: 'Твой баланс' },
  'birds.barn': { es: 'Granero', en: 'Barn', th: 'ยุ้งฉาง', ru: 'Амбар' },
  'birds.level': { es: 'Nivel', en: 'Level', th: 'ระดับ', ru: 'Уровень' },
  'birds.capacity': { es: 'Capacidad', en: 'Capacity', th: 'ความจุ', ru: 'Вместимость' },
  'birds.collectEggs': { es: 'Recoger Huevos', en: 'Collect Eggs', th: 'เก็บไข่', ru: 'Собрать яйца' },
  'birds.convertToDoge': { es: 'Convertir a DOGE', en: 'Convert to DOGE', th: 'แปลงเป็น DOGE', ru: 'Конвертировать в DOGE' },
  'birds.upgradeBarn': { es: 'Mejorar Granero', en: 'Upgrade Barn', th: 'อัพเกรดยุ้งฉาง', ru: 'Улучшить амбар' },
  'birds.exchangeRate': { es: 'Tasa de cambio', en: 'Exchange rate', th: 'อัตราแลกเปลี่ยน', ru: 'Курс обмена' },
  'birds.buyBirds': { es: 'Comprar Pájaros', en: 'Buy Birds', th: 'ซื้อนก', ru: 'Купить птиц' },
  'birds.hour': { es: 'hora', en: 'hour', th: 'ชั่วโมง', ru: 'час' },
  'birds.buy': { es: 'Comprar', en: 'Buy', th: 'ซื้อ', ru: 'Купить' },
  'birds.howItWorks': { es: '¿Cómo funciona?', en: 'How it works?', th: 'ทำงานอย่างไร?', ru: 'Как это работает?' },
  'birds.info1': { es: 'Compra pájaros con tu balance de depósito', en: 'Buy birds with your deposit balance', th: 'ซื้อนกด้วยยอดเงินฝากของคุณ', ru: 'Покупай птиц за депозитный баланс' },
  'birds.info2': { es: 'Los pájaros generan huevos automáticamente cada hora', en: 'Birds automatically generate eggs every hour', th: 'นกสร้างไข่อัตโนมัติทุกชั่วโมง', ru: 'Птицы автоматически производят яйца каждый час' },
  'birds.info3': { es: 'Almacena los huevos en tu granero (¡mejóralo para más capacidad!)', en: 'Store eggs in your barn (upgrade it for more capacity!)', th: 'เก็บไข่ในยุ้งฉาง (อัพเกรดเพื่อเพิ่มความจุ!)', ru: 'Храни яйца в амбаре (улучши его для большей вместимости!)' },
  'birds.info4': { es: 'Convierte 45,000 huevos en 0.0075 DOGE', en: 'Convert 45,000 eggs into 0.0075 DOGE', th: 'แปลง 45,000 ไข่เป็น 0.0075 DOGE', ru: 'Обменивай 45 000 яиц на 0.0075 DOGE' },
  'birds.insufficientBalance': { es: 'Balance insuficiente', en: 'Insufficient balance', th: 'ยอดเงินไม่เพียงพอ', ru: 'Недостаточно средств' },
  'birds.birdPurchased': { es: '¡Pájaro comprado!', en: 'Bird purchased!', th: 'ซื้อนกแล้ว!', ru: 'Птица куплена!' },
  'birds.purchaseFailed': { es: 'Error al comprar', en: 'Purchase failed', th: 'ซื้อไม่สำเร็จ', ru: 'Ошибка покупки' },
  'birds.eggsCollected': { es: 'Huevos recogidos', en: 'Eggs collected', th: 'เก็บไข่แล้ว', ru: 'Яиц собрано' },
  'birds.collectFailed': { es: 'Error al recoger', en: 'Collection failed', th: 'เก็บไม่สำเร็จ', ru: 'Ошибка сбора' },
  'birds.barnMaxLevel': { es: 'Granero ya en nivel máximo', en: 'Barn already at max level', th: 'ยุ้งฉางเลเวลสูงสุดแล้ว', ru: 'Амбар уже на максимальном уровне' },
  'birds.barnUpgraded': { es: '¡Granero mejorado a nivel', en: 'Barn upgraded to level', th: 'อัพเกรดยุ้งฉางเป็นระดับ', ru: 'Амбар улучшен до уровня' },
  'birds.upgradeFailed': { es: 'Error al mejorar', en: 'Upgrade failed', th: 'อัพเกรดไม่สำเร็จ', ru: 'Ошибка улучшения' },
  'birds.minEggsRequired': { es: 'Mínimo 60,000 huevos requeridos', en: 'Minimum 60,000 eggs required', th: 'ต้องมีไข่อย่างน้อย 60,000', ru: 'Требуется минимум 60 000 яиц' },
  'birds.eggsConverted': { es: 'Huevos convertidos', en: 'Eggs converted', th: 'แปลงไข่แล้ว', ru: 'Яиц конвертировано' },
  'birds.convertFailed': { es: 'Error al convertir', en: 'Conversion failed', th: 'แปลงไม่สำเร็จ', ru: 'Ошибка конвертации' },
  
  // Social Tasks
  'tasks.badge': { es: '¡Gana DOGE Gratis!', en: 'Earn Free DOGE!', th: 'รับ DOGE ฟรี!', ru: 'Получи DOGE бесплатно!' },
  'tasks.title': { es: 'Tareas ', en: 'Social ', th: 'งาน', ru: 'Социальные ' },
  'tasks.titleHighlight': { es: 'Sociales', en: 'Tasks', th: 'โซเชียล', ru: 'задания' },
  'tasks.subtitle': { es: 'Comparte el proyecto en redes sociales y gana 0.25 DOGE por cada tarea completada. ¡Solo puedes completar cada tarea una vez!', en: 'Share the project on social media and earn 0.25 DOGE per completed task. You can only complete each task once!', th: 'แชร์โปรเจกต์บนโซเชียลมีเดียและรับ 0.25 DOGE ต่องานที่ทำเสร็จ ทำได้ครั้งเดียว!', ru: 'Делись проектом в соцсетях и зарабатывай 0.25 DOGE за каждое задание. Каждое задание можно выполнить только один раз!' },
  'tasks.rewardPerTask': { es: '0.25 DOGE por tarea', en: '0.25 DOGE per task', th: '0.25 DOGE ต่องาน', ru: '0.25 DOGE за задание' },
  'tasks.progress': { es: 'Progreso', en: 'Progress', th: 'ความคืบหน้า', ru: 'Прогресс' },
  'tasks.earned': { es: 'Ganado', en: 'Earned', th: 'ได้รับ', ru: 'Заработано' },
  'tasks.done': { es: 'Completado ✓', en: 'Completed ✓', th: 'เสร็จแล้ว ✓', ru: 'Выполнено ✓' },
  'tasks.shareToEarn': { es: 'Comparte y gana 0.25 DOGE', en: 'Share and earn 0.25 DOGE', th: 'แชร์และรับ 0.25 DOGE', ru: 'Поделись и получи 0.25 DOGE' },
  'tasks.loginFirst': { es: 'Inicia sesión', en: 'Login first', th: 'เข้าสู่ระบบก่อน', ru: 'Сначала войди' },
  'tasks.loginRequired': { es: 'Inicia sesión para completar tareas', en: 'Login to complete tasks', th: 'เข้าสู่ระบบเพื่อทำงาน', ru: 'Войди для выполнения заданий' },
  'tasks.loginPrompt': { es: 'Inicia sesión para desbloquear las tareas y ganar recompensas.', en: 'Login to unlock tasks and earn rewards.', th: 'เข้าสู่ระบบเพื่อปลดล็อกงานและรับรางวัล', ru: 'Войди, чтобы разблокировать задания и получить награды.' },
  'tasks.alreadyCompleted': { es: 'Ya completaste esta tarea', en: 'You already completed this task', th: 'คุณทำงานนี้เสร็จแล้ว', ru: 'Ты уже выполнил это задание' },
  'tasks.completed': { es: '¡Tarea completada!', en: 'Task completed!', th: 'ทำงานเสร็จแล้ว!', ru: 'Задание выполнено!' },
  'tasks.error': { es: 'Error al completar la tarea', en: 'Error completing task', th: 'เกิดข้อผิดพลาดในการทำงาน', ru: 'Ошибка при выполнении задания' },

  // RPGDOGE Token Pages
  'rpgdoge.backToKingdom': { es: 'Volver al Reino', en: 'Back to Kingdom', th: 'กลับสู่อาณาจักร', ru: 'Назад в королевство' },
  'rpgdoge.backToLore': { es: 'Volver al Lore', en: 'Back to Lore', th: 'กลับสู่ตำนาน', ru: 'Назад к истории' },
  'rpgdoge.guardian': { es: 'El Guardián del Reino Crypto', en: 'The Guardian of the Crypto Kingdom', th: 'ผู้พิทักษ์อาณาจักรคริปโต', ru: 'Страж Крипто-Королевства' },
  'rpgdoge.legend': { es: '📜 La Leyenda de RPGDOGE', en: '📜 The Legend of RPGDOGE', th: '📜 ตำนานของ RPGDOGE', ru: '📜 Легенда о RPGDOGE' },
  'rpgdoge.chapter': { es: 'Capítulo', en: 'Chapter', th: 'บท', ru: 'Глава' },
  'rpgdoge.previous': { es: '← Anterior', en: '← Previous', th: '← ก่อนหน้า', ru: '← Предыдущий' },
  'rpgdoge.next': { es: 'Siguiente →', en: 'Next →', th: 'ถัดไป →', ru: 'Следующий →' },
  'rpgdoge.tokenomics': { es: '⚔️ Tokenomics del Reino', en: '⚔️ Kingdom Tokenomics', th: '⚔️ โทเคโนมิกส์ของอาณาจักร', ru: '⚔️ Токеномика Королевства' },
  'rpgdoge.roadmap': { es: '🗺️ Roadmap del Reino', en: '🗺️ Kingdom Roadmap', th: '🗺️ โรดแมปของอาณาจักร', ru: '🗺️ Дорожная карта Королевства' },
  'rpgdoge.roadmapSubtitle': { es: 'El camino hacia la conquista del Reino Crypto está marcado por hitos épicos', en: 'The path to conquering the Crypto Kingdom is marked by epic milestones', th: 'เส้นทางสู่การพิชิตอาณาจักรคริปโตเต็มไปด้วยเหตุการณ์สำคัญ', ru: 'Путь к завоеванию Крипто-Королевства отмечен эпическими вехами' },
  'rpgdoge.completed': { es: 'Completado', en: 'Completed', th: 'เสร็จสิ้น', ru: 'Завершено' },
  'rpgdoge.inProgress': { es: 'En Progreso', en: 'In Progress', th: 'กำลังดำเนินการ', ru: 'В процессе' },
  'rpgdoge.comingSoon': { es: 'Próximamente', en: 'Coming Soon', th: 'เร็วๆ นี้', ru: 'Скоро' },
  'rpgdoge.future': { es: 'Futuro', en: 'Future', th: 'อนาคต', ru: 'Будущее' },
  'rpgdoge.phase1': { es: 'Fase 1: Génesis', en: 'Phase 1: Genesis', th: 'เฟส 1: การกำเนิด', ru: 'Фаза 1: Генезис' },
  'rpgdoge.phase2': { es: 'Fase 2: La Preventa', en: 'Phase 2: The Presale', th: 'เฟส 2: พรีเซล', ru: 'Фаза 2: Предпродажа' },
  'rpgdoge.phase3': { es: 'Fase 3: El Lanzamiento', en: 'Phase 3: The Launch', th: 'เฟส 3: เปิดตัว', ru: 'Фаза 3: Запуск' },
  'rpgdoge.phase4': { es: 'Fase 4: El Reino Expandido', en: 'Phase 4: The Expanded Kingdom', th: 'เฟส 4: อาณาจักรขยาย', ru: 'Фаза 4: Расширенное Королевство' },
  'rpgdoge.readyToJoin': { es: '¿Listo para unirte al Reino?', en: 'Ready to join the Kingdom?', th: 'พร้อมที่จะเข้าร่วมอาณาจักรหรือยัง?', ru: 'Готов присоединиться к Королевству?' },
  'rpgdoge.becomeKnight': { es: 'Conviértete en un Caballero Diamante y protege el tesoro de la comunidad', en: 'Become a Diamond Knight and protect the community treasury', th: 'เป็นอัศวินเพชรและปกป้องคลังของชุมชน', ru: 'Стань Бриллиантовым Рыцарем и защити казну сообщества' },
  'rpgdoge.startPresale': { es: 'Comenzar Preventa', en: 'Start Presale', th: 'เริ่มพรีเซล', ru: 'Начать предпродажу' },
  'rpgdoge.footer': { es: '© 2026 RPGDOGE Kingdom • Todos los derechos reservados', en: '© 2026 RPGDOGE Kingdom • All rights reserved', th: '© 2026 RPGDOGE Kingdom • สงวนลิขสิทธิ์', ru: '© 2026 RPGDOGE Kingdom • Все права защищены' },
  'rpgdoge.legendContinues': { es: 'La leyenda continúa...', en: 'The legend continues...', th: 'ตำนานยังคงดำเนินต่อไป...', ru: 'Легенда продолжается...' },
  
  // RPGDOGE Presale Page
  'presale.badge': { es: 'Preventa Activa - Fase 2', en: 'Active Presale - Phase 2', th: 'พรีเซลกำลังดำเนินการ - เฟส 2', ru: 'Активная предпродажа - Фаза 2' },
  'presale.title': { es: 'Preventa RPGDOGE', en: 'RPGDOGE Presale', th: 'พรีเซล RPGDOGE', ru: 'Предпродажа RPGDOGE' },
  'presale.subtitle': { es: 'Únete a la revolución del Reino Crypto. Obtén tokens RDOGE al mejor precio antes del lanzamiento oficial.', en: 'Join the Crypto Kingdom revolution. Get RDOGE tokens at the best price before the official launch.', th: 'เข้าร่วมการปฏิวัติอาณาจักรคริปโต รับโทเค็น RDOGE ในราคาที่ดีที่สุดก่อนเปิดตัวอย่างเป็นทางการ', ru: 'Присоединяйся к революции Крипто-Королевства. Получи токены RDOGE по лучшей цене до официального запуска.' },
  'presale.endsIn': { es: 'La preventa termina en:', en: 'Presale ends in:', th: 'พรีเซลสิ้นสุดใน:', ru: 'Предпродажа заканчивается через:' },
  'presale.days': { es: 'Días', en: 'Days', th: 'วัน', ru: 'Дней' },
  'presale.hours': { es: 'Horas', en: 'Hours', th: 'ชั่วโมง', ru: 'Часов' },
  'presale.minutes': { es: 'Min', en: 'Min', th: 'นาที', ru: 'Мин' },
  'presale.seconds': { es: 'Seg', en: 'Sec', th: 'วิ', ru: 'Сек' },
  'presale.saleProgress': { es: 'Progreso de Venta', en: 'Sale Progress', th: 'ความคืบหน้าการขาย', ru: 'Прогресс продаж' },
  'presale.sold': { es: 'Vendidos', en: 'Sold', th: 'ขายแล้ว', ru: 'Продано' },
  'presale.total': { es: 'Total', en: 'Total', th: 'ทั้งหมด', ru: 'Всего' },
  'presale.buyRdoge': { es: 'Comprar RDOGE', en: 'Buy RDOGE', th: 'ซื้อ RDOGE', ru: 'Купить RDOGE' },
  'presale.currentPrice': { es: 'Precio actual', en: 'Current price', th: 'ราคาปัจจุบัน', ru: 'Текущая цена' },
  'presale.perRdoge': { es: 'DOGE por RDOGE', en: 'DOGE per RDOGE', th: 'DOGE ต่อ RDOGE', ru: 'DOGE за RDOGE' },
  'presale.bonus': { es: 'Bonus', en: 'Bonus', th: 'โบนัส', ru: 'Бонус' },
  'presale.amountToInvest': { es: 'Cantidad a invertir (DOGE)', en: 'Amount to invest (DOGE)', th: 'จำนวนที่จะลงทุน (DOGE)', ru: 'Сумма инвестиций (DOGE)' },
  'presale.baseTokens': { es: 'Tokens base:', en: 'Base tokens:', th: 'โทเค็นพื้นฐาน:', ru: 'Базовые токены:' },
  'presale.totalReceive': { es: 'Total a recibir:', en: 'Total to receive:', th: 'รวมที่จะได้รับ:', ru: 'Всего получите:' },
  'presale.buyWithDoge': { es: 'Comprar con DOGE', en: 'Buy with DOGE', th: 'ซื้อด้วย DOGE', ru: 'Купить за DOGE' },
  'presale.minimum': { es: 'Mínimo', en: 'Minimum', th: 'ขั้นต่ำ', ru: 'Минимум' },
  'presale.maximum': { es: 'Máximo', en: 'Maximum', th: 'สูงสุด', ru: 'Максимум' },
  'presale.paymentVia': { es: 'Pago via FaucetPay', en: 'Payment via FaucetPay', th: 'ชำระเงินผ่าน FaucetPay', ru: 'Оплата через FaucetPay' },
  'presale.clickToBuy': { es: 'Al hacer clic en "Comprar con DOGE" serás redirigido a FaucetPay para completar el pago.', en: 'By clicking "Buy with DOGE" you will be redirected to FaucetPay to complete the payment.', th: 'เมื่อคลิก "ซื้อด้วย DOGE" คุณจะถูกนำไปยัง FaucetPay เพื่อชำระเงิน', ru: 'Нажав "Купить за DOGE", вы будете перенаправлены на FaucetPay для оплаты.' },
  'presale.phases': { es: 'Fases de Preventa', en: 'Presale Phases', th: 'เฟสพรีเซล', ru: 'Фазы предпродажи' },
  'presale.phase1': { es: 'Fase 1 - Early Bird', en: 'Phase 1 - Early Bird', th: 'เฟส 1 - Early Bird', ru: 'Фаза 1 - Early Bird' },
  'presale.phase2': { es: 'Fase 2 - Guerreros', en: 'Phase 2 - Warriors', th: 'เฟส 2 - นักรบ', ru: 'Фаза 2 - Воины' },
  'presale.phase3': { es: 'Fase 3 - Caballeros', en: 'Phase 3 - Knights', th: 'เฟส 3 - อัศวิน', ru: 'Фаза 3 - Рыцари' },
  'presale.phase4': { es: 'Fase 4 - Nobles', en: 'Phase 4 - Nobles', th: 'เฟส 4 - ขุนนาง', ru: 'Фаза 4 - Дворяне' },
  'presale.soldOut': { es: 'Vendido', en: 'Sold Out', th: 'ขายหมดแล้ว', ru: 'Продано' },
  'presale.totalSupply': { es: 'Suministro Total', en: 'Total Supply', th: 'อุปทานทั้งหมด', ru: 'Общее предложение' },
  'presale.holders': { es: 'Holders', en: 'Holders', th: 'ผู้ถือ', ru: 'Держатели' },
  'presale.raised': { es: 'DOGE Recaudados', en: 'DOGE Raised', th: 'DOGE ที่ระดมได้', ru: 'DOGE собрано' },
  'presale.avgBonus': { es: 'Bonus Promedio', en: 'Average Bonus', th: 'โบนัสเฉลี่ย', ru: 'Средний бонус' },
  'presale.whyBuy': { es: '¿Por qué comprar en preventa?', en: 'Why buy in presale?', th: 'ทำไมต้องซื้อในพรีเซล?', ru: 'Почему покупать на предпродаже?' },
  'presale.earlyAccess': { es: 'Acceso Temprano', en: 'Early Access', th: 'เข้าถึงก่อน', ru: 'Ранний доступ' },
  'presale.earlyAccessDesc': { es: 'Sé de los primeros en obtener RDOGE', en: 'Be among the first to get RDOGE', th: 'เป็นคนแรกๆ ที่ได้รับ RDOGE', ru: 'Будь одним из первых обладателей RDOGE' },
  'presale.exclusivePrice': { es: 'Precio Exclusivo', en: 'Exclusive Price', th: 'ราคาพิเศษ', ru: 'Эксклюзивная цена' },
  'presale.exclusivePriceDesc': { es: 'Precio más bajo que en lanzamiento', en: 'Lower price than at launch', th: 'ราคาต่ำกว่าตอนเปิดตัว', ru: 'Цена ниже, чем при запуске' },
  'presale.extraBonus': { es: 'Bonus Extra', en: 'Extra Bonus', th: 'โบนัสพิเศษ', ru: 'Дополнительный бонус' },
  'presale.extraBonusDesc': { es: 'Hasta 50% de tokens adicionales', en: 'Up to 50% additional tokens', th: 'โทเค็นเพิ่มสูงสุด 50%', ru: 'До 50% дополнительных токенов' },
  'presale.vipAccess': { es: 'VIP Access', en: 'VIP Access', th: 'VIP Access', ru: 'VIP доступ' },
  'presale.vipAccessDesc': { es: 'Beneficios exclusivos para holders', en: 'Exclusive benefits for holders', th: 'สิทธิพิเศษสำหรับผู้ถือ', ru: 'Эксклюзивные преимущества для держателей' },
  'presale.tokensDistributed': { es: 'Los tokens se distribuirán después del lanzamiento oficial', en: 'Tokens will be distributed after the official launch', th: 'โทเค็นจะแจกจ่ายหลังเปิดตัวอย่างเป็นทางการ', ru: 'Токены будут распределены после официального запуска' },

  // Lore Chapters
  'lore.chapter1.title': { es: 'El Origen', en: 'The Origin', th: 'ต้นกำเนิด', ru: 'Происхождение' },
  'lore.chapter2.title': { es: 'La Espada del HODL', en: 'The Sword of HODL', th: 'ดาบแห่ง HODL', ru: 'Меч HODL' },
  'lore.chapter3.title': { es: 'El Guardián Renace', en: 'The Guardian Reborn', th: 'ผู้พิทักษ์เกิดใหม่', ru: 'Страж возрождается' },
  'lore.chapter4.title': { es: 'El Reino Actual', en: 'The Current Kingdom', th: 'อาณาจักรปัจจุบัน', ru: 'Нынешнее Королевство' },
  'lore.totalSupply': { es: 'Suministro Total', en: 'Total Supply', th: 'อุปทานทั้งหมด', ru: 'Общее предложение' },
  'lore.community': { es: 'Comunidad', en: 'Community', th: 'ชุมชน', ru: 'Сообщество' },
  'lore.stakingRewards': { es: 'Staking Rewards', en: 'Staking Rewards', th: 'รางวัลสเตกกิ้ง', ru: 'Награды за стейкинг' },
  'lore.epicBurn': { es: 'Quema Épica', en: 'Epic Burn', th: 'การเผาครั้งยิ่งใหญ่', ru: 'Эпическое сжигание' },
  'lore.deflationary': { es: 'Deflacionario', en: 'Deflationary', th: 'ดีเฟลชัน', ru: 'Дефляционный' },

  // Roadmap Items
  'roadmap.tokenCreation': { es: 'Creación del token RDOGE', en: 'RDOGE token creation', th: 'สร้างโทเค็น RDOGE', ru: 'Создание токена RDOGE' },
  'roadmap.communityLaunch': { es: 'Lanzamiento de la comunidad', en: 'Community launch', th: 'เปิดตัวชุมชน', ru: 'Запуск сообщества' },
  'roadmap.loreDev': { es: 'Desarrollo del lore RPGDOGE', en: 'RPGDOGE lore development', th: 'พัฒนาตำนาน RPGDOGE', ru: 'Разработка истории RPGDOGE' },
  'roadmap.website': { es: 'Website y branding oficial', en: 'Official website and branding', th: 'เว็บไซต์และแบรนด์อย่างเป็นทางการ', ru: 'Официальный сайт и брендинг' },
  'roadmap.publicPresale': { es: 'Preventa pública de tokens RDOGE', en: 'Public RDOGE token presale', th: 'พรีเซลโทเค็น RDOGE สาธารณะ', ru: 'Публичная предпродажа токенов RDOGE' },
  'roadmap.bonusSystem': { es: 'Sistema de bonus por fase', en: 'Phase bonus system', th: 'ระบบโบนัสตามเฟส', ru: 'Система бонусов по фазам' },
  'roadmap.audit': { es: 'Auditoría de smart contracts', en: 'Smart contract audit', th: 'ตรวจสอบสัญญาอัจฉริยะ', ru: 'Аудит смарт-контрактов' },
  'roadmap.partnerships': { es: 'Partnerships estratégicos', en: 'Strategic partnerships', th: 'พันธมิตรเชิงกลยุทธ์', ru: 'Стратегические партнёрства' },
  'roadmap.dexListing': { es: 'Listado en DEXs principales', en: 'Listing on major DEXs', th: 'ลิสต์บน DEX หลัก', ru: 'Листинг на основных DEX' },
  'roadmap.stakingLaunch': { es: 'Lanzamiento del staking RDOGE', en: 'RDOGE staking launch', th: 'เปิดตัว staking RDOGE', ru: 'Запуск стейкинга RDOGE' },
  'roadmap.daoGovernance': { es: 'Sistema de gobernanza DAO', en: 'DAO governance system', th: 'ระบบการปกครอง DAO', ru: 'Система управления DAO' },
  'roadmap.marketing': { es: 'Marketing global agresivo', en: 'Aggressive global marketing', th: 'การตลาดทั่วโลกอย่างจริงจัง', ru: 'Агрессивный глобальный маркетинг' },
  'roadmap.cexListing': { es: 'Listado en CEXs tier 1', en: 'Tier 1 CEX listing', th: 'ลิสต์บน CEX ระดับ 1', ru: 'Листинг на CEX уровня 1' },
  'roadmap.p2eGame': { es: 'RPGDOGE Play-to-Earn Game', en: 'RPGDOGE Play-to-Earn Game', th: 'เกม RPGDOGE Play-to-Earn', ru: 'Игра RPGDOGE Play-to-Earn' },
  'roadmap.nftCollection': { es: 'NFT Collection exclusiva', en: 'Exclusive NFT Collection', th: 'คอลเลกชัน NFT พิเศษ', ru: 'Эксклюзивная NFT коллекция' },
  'roadmap.metaverse': { es: 'Metaverso del Reino Crypto', en: 'Crypto Kingdom Metaverse', th: 'Metaverse อาณาจักรคริปโต', ru: 'Метавселенная Крипто-Королевства' },

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
