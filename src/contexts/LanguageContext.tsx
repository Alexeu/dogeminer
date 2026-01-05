import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'es' | 'en';

interface Translations {
  [key: string]: {
    es: string;
    en: string;
  };
}

export const translations: Translations = {
  // Header
  'header.miningBalance': { es: 'Balance de Minado', en: 'Mining Balance' },
  'header.miningBalanceDesc': { es: 'Recompensas de minado, anuncios, etc.', en: 'Mining rewards, ads, etc.' },
  'header.depositBalance': { es: 'Balance de Depósito', en: 'Deposit Balance' },
  'header.depositBalanceDesc': { es: 'Para comprar cajas, anuncios, minería online', en: 'For boxes, ads, online mining' },
  'header.logout': { es: '¡Hasta pronto! Much goodbye!', en: 'See you soon! Much goodbye!' },
  'header.depositAlert': { es: 'Por problemas con la API de FaucetPay, los depósitos no se procesan automáticamente. Envía tu ID de transacción y email a:', en: 'Due to FaucetPay API issues, deposits are not being processed automatically. Send your transaction ID and email to:' },
  
  // Sidebar
  'sidebar.home': { es: 'Inicio', en: 'Home' },
  'sidebar.mysteryBoxes': { es: 'Cajas Misteriosas', en: 'Mystery Boxes' },
  'sidebar.inventory': { es: 'Inventario', en: 'Inventory' },
  'sidebar.collection': { es: 'Colección', en: 'Collection' },
  'sidebar.onlineMining': { es: 'Minería Online', en: 'Online Mining' },
  'sidebar.webMining': { es: 'Minería Web DOGE', en: 'DOGE Web Mining' },
  'sidebar.lottery': { es: 'Lotería', en: 'Lottery' },
  'sidebar.shortlinks': { es: 'Shortlinks', en: 'Shortlinks' },
  'sidebar.ptc': { es: 'Ver Anuncios (PTC)', en: 'View Ads (PTC)' },
  'sidebar.faucetpay': { es: 'Depósito / Retiro', en: 'Deposit / Withdraw' },
  'sidebar.referral': { es: 'Referidos', en: 'Referrals' },
  'sidebar.staking': { es: 'Staking', en: 'Staking' },
  'sidebar.admin': { es: 'Panel Admin', en: 'Admin Panel' },
  
  // Hero
  'hero.badge': { es: '¡Much WOW! ¡Very Mine! 🚀', en: 'Much WOW! Very Mine! 🚀' },
  'hero.title1': { es: 'Mina ', en: 'Mine ' },
  'hero.title2': { es: ' con Tu Colección de ', en: ' with Your ' },
  'hero.title3': { es: '', en: ' Collection' },
  'hero.subtitle': { es: '¡Such earn! ¡Many coins! Colecciona personajes Doge y gana Dogecoin pasivamente. ¡To the moon! 🌙', en: 'Such earn! Many coins! Collect cute Doge characters and earn passive Dogecoin. To the moon! 🌙' },
  'hero.cta1': { es: '¡To The Moon!', en: 'To The Moon!' },
  'hero.cta2': { es: 'Ver Colección', en: 'View Collection' },
  'hero.stat1': { es: 'Much Miners', en: 'Much Miners' },
  'hero.stat2': { es: 'DOGE Minados', en: 'DOGE Mined' },
  'hero.stat3': { es: 'Very Doges', en: 'Very Doges' },
  
  // Auth
  'auth.login': { es: 'Iniciar Sesión', en: 'Login' },
  'auth.signup': { es: 'Crear Cuenta', en: 'Sign Up' },
  'auth.email': { es: 'Email', en: 'Email' },
  'auth.password': { es: 'Contraseña', en: 'Password' },
  'auth.loginPrompt': { es: 'Inicia sesión para continuar', en: 'Login to continue' },
  'auth.signupPrompt': { es: 'Crea tu cuenta y empieza a minar', en: 'Create your account and start mining' },
  'auth.noAccount': { es: '¿No tienes cuenta?', en: "Don't have an account?" },
  'auth.hasAccount': { es: '¿Ya tienes cuenta?', en: 'Already have an account?' },
  'auth.register': { es: 'Regístrate', en: 'Sign up' },
  'auth.loginLink': { es: 'Inicia sesión', en: 'Login' },
  'auth.invitedBy': { es: '¡Invitado por un amigo!', en: 'Invited by a friend!' },
  'auth.code': { es: 'Código', en: 'Code' },
  'auth.accessDenied': { es: 'Acceso denegado', en: 'Access denied' },
  'auth.tempBlocked': { es: 'Cuenta bloqueada temporalmente', en: 'Account temporarily blocked' },
  'auth.wait': { es: 'Espera', en: 'Wait' },
  'auth.seconds': { es: 'segundos', en: 'seconds' },
  'auth.blocked': { es: 'Bloqueado', en: 'Blocked' },
  'auth.protected': { es: 'Protegido con fingerprinting', en: 'Protected with fingerprinting' },
  'auth.welcome': { es: '¡Bienvenido de vuelta!', en: 'Welcome back!' },
  'auth.accountCreated': { es: '¡Cuenta creada! Ya puedes empezar a jugar.', en: 'Account created! You can start playing now.' },
  
  // FaucetPay
  'faucetpay.title': { es: 'Depósitos y Retiros', en: 'Deposits & Withdrawals' },
  'faucetpay.subtitle': { es: 'Deposita y retira tu DOGE de forma segura. Much secure! 🔐', en: 'Deposit and withdraw your DOGE securely. Much secure! 🔐' },
  'faucetpay.dailyLimit': { es: 'Límite diario de retiro', en: 'Daily withdrawal limit' },
  'faucetpay.availableToday': { es: 'Disponible hoy', en: 'Available today' },
  'faucetpay.resetMidnight': { es: 'El límite se reinicia a medianoche UTC', en: 'Limit resets at midnight UTC' },
  'faucetpay.withdraw': { es: 'Retirar DOGE', en: 'Withdraw DOGE' },
  'faucetpay.sendToFaucetpay': { es: 'Envía a tu FaucetPay', en: 'Send to your FaucetPay' },
  'faucetpay.yourBalance': { es: 'Tu balance disponible', en: 'Your available balance' },
  'faucetpay.faucetpayEmail': { es: 'Tu email de FaucetPay', en: 'Your FaucetPay email' },
  'faucetpay.amountToWithdraw': { es: 'Cantidad a retirar', en: 'Amount to withdraw' },
  'faucetpay.processing': { es: 'Procesando...', en: 'Processing...' },
  'faucetpay.withdrawBtn': { es: 'Retirar', en: 'Withdraw' },
  'faucetpay.minWithdraw': { es: 'Mínimo', en: 'Minimum' },
  'faucetpay.maxDaily': { es: 'Máximo diario', en: 'Daily max' },
  'faucetpay.deposit': { es: 'Depositar DOGE', en: 'Deposit DOGE' },
  'faucetpay.sendToAddress': { es: 'Envía DOGE a nuestra dirección', en: 'Send DOGE to our address' },
  'faucetpay.depositAddress': { es: 'Dirección de depósito DOGE', en: 'DOGE deposit address' },
  'faucetpay.reportDeposit': { es: 'Reportar depósito', en: 'Report deposit' },
  'faucetpay.amountSent': { es: 'Cantidad enviada (DOGE)', en: 'Amount sent (DOGE)' },
  'faucetpay.txHash': { es: 'TX Hash de la transacción', en: 'Transaction TX Hash' },
  'faucetpay.reporting': { es: 'Reportando...', en: 'Reporting...' },
  'faucetpay.reportBtn': { es: 'Reportar Depósito', en: 'Report Deposit' },
  'faucetpay.important': { es: 'Importante', en: 'Important' },
  'faucetpay.minDeposit': { es: 'Mínimo de depósito', en: 'Minimum deposit' },
  'faucetpay.onlySendDoge': { es: 'Solo envía DOGE a esta dirección', en: 'Only send DOGE to this address' },
  'faucetpay.reportAfterSend': { es: 'Reporta tu TX hash después de enviar', en: 'Report your TX hash after sending' },
  'faucetpay.creditTime': { es: 'Los depósitos se acreditan en 1-2 minutos', en: 'Deposits are credited in 1-2 minutes' },
  'faucetpay.history': { es: 'Historial de Transacciones', en: 'Transaction History' },
  'faucetpay.depositsWithdrawals': { es: 'Depósitos y retiros', en: 'Deposits and withdrawals' },
  'faucetpay.noTransactions': { es: 'No hay transacciones aún. Such empty! 🐕', en: 'No transactions yet. Such empty! 🐕' },
  'faucetpay.depositLabel': { es: 'Depósito', en: 'Deposit' },
  'faucetpay.withdrawalLabel': { es: 'Retiro', en: 'Withdrawal' },
  'faucetpay.completed': { es: 'Completado', en: 'Completed' },
  'faucetpay.failed': { es: 'Fallido', en: 'Failed' },
  'faucetpay.pending': { es: 'Pendiente', en: 'Pending' },
  'faucetpay.expired': { es: 'Expirado', en: 'Expired' },
  
  // Referral
  'referral.badge': { es: 'Programa de Referidos', en: 'Referral Program' },
  'referral.title': { es: 'Invita Amigos, ', en: 'Invite Friends, ' },
  'referral.titleHighlight': { es: 'Gana DOGE', en: 'Earn DOGE' },
  'referral.subtitle': { es: 'Gana el 5% de todo el DOGE que tus referidos generen por minado pasivo. ¡Sin límites!', en: 'Earn 5% of all DOGE your referrals generate from passive mining. No limits!' },
  'referral.yourLink': { es: 'Tu Link de Referido', en: 'Your Referral Link' },
  'referral.shareWithFriends': { es: 'Compártelo con amigos', en: 'Share it with friends' },
  'referral.referrals': { es: 'Referidos', en: 'Referrals' },
  'referral.totalDoge': { es: 'DOGE Totales', en: 'Total DOGE' },
  'referral.status': { es: 'Estado de Referido', en: 'Referral Status' },
  'referral.yourLink2': { es: 'Tu vinculación actual', en: 'Your current link' },
  'referral.linkedToReferrer': { es: '¡Estás vinculado a un referidor!', en: "You're linked to a referrer!" },
  'referral.noReferrer': { es: 'Sin referidor', en: 'No referrer' },
  'referral.noReferrerDesc': { es: 'Si alguien te invitó, usa su link para registrarte', en: 'If someone invited you, use their link to sign up' },
  'referral.howItWorks': { es: 'Cómo funciona:', en: 'How it works:' },
  'referral.step1': { es: 'Comparte tu link con amigos', en: 'Share your link with friends' },
  'referral.step2': { es: 'Cuando se registren, quedarán vinculados', en: 'When they sign up, they will be linked' },
  'referral.step3': { es: 'Ganas 5% de todo su minado', en: 'You earn 5% of all their mining' },
  'referral.step4': { es: '¡Las comisiones son permanentes!', en: 'Commissions are permanent!' },
  'referral.linkCopied': { es: '¡Link copiado al portapapeles!', en: 'Link copied to clipboard!' },
  'referral.codeApplied': { es: '¡Código de referido aplicado automáticamente!', en: 'Referral code applied automatically!' },
  
  // Mystery Box
  'mysterybox.title': { es: 'Mystery Boxes', en: 'Mystery Boxes' },
  'mysterybox.subtitle': { es: 'Abre cajas para conseguir personajes', en: 'Open boxes to get characters' },
  'mysterybox.common': { es: 'Común', en: 'Common' },
  'mysterybox.rare': { es: 'Rara', en: 'Rare' },
  'mysterybox.legendary': { es: 'Legendaria', en: 'Legendary' },
  'mysterybox.open': { es: 'Abrir', en: 'Open' },
  'mysterybox.badge': { es: '¡Nuevos Personajes!', en: 'New Characters!' },
  'mysterybox.description': { es: 'Abre cajas misteriosas para obtener personajes únicos que minan DOGE automáticamente.', en: 'Open mystery boxes to get unique characters that mine DOGE automatically.' },
  'mysterybox.guaranteed': { es: 'garantizado', en: 'guaranteed' },
  'mysterybox.orBetter': { es: 'o mejor', en: 'or better' },
  
  // Inventory
  'inventory.title': { es: 'Tu Colección', en: 'Your Collection' },
  'inventory.subtitle': { es: 'Tus Doges trabajando duro', en: 'Your Doges working hard' },
  'inventory.empty': { es: 'Aún no tienes personajes. ¡Abre una Mystery Box!', en: "You don't have characters yet. Open a Mystery Box!" },
  'inventory.mine': { es: 'Minar', en: 'Mine' },
  'inventory.mining': { es: 'Minando...', en: 'Mining...' },
  'inventory.claim': { es: 'Reclamar', en: 'Claim' },
  'inventory.levelUp': { es: 'Subir Nivel', en: 'Level Up' },
  'inventory.maxLevel': { es: 'Nivel Máximo', en: 'Max Level' },
  'inventory.level': { es: 'Nivel', en: 'Level' },
  'inventory.badge': { es: 'Tu Inventario', en: 'Your Inventory' },
  'inventory.description': { es: 'Gestiona tus personajes, inicia el minado y reclama tus recompensas.', en: 'Manage your characters, start mining and claim your rewards.' },
  'inventory.perHour': { es: '/hora', en: '/hour' },
  'inventory.quantity': { es: 'Cantidad', en: 'Quantity' },
  
  // Collection
  'collection.title': { es: 'Colección Completa', en: 'Complete Collection' },
  'collection.subtitle': { es: 'Todos los personajes disponibles', en: 'All available characters' },
  'collection.badge': { es: 'Galería de Personajes', en: 'Character Gallery' },
  'collection.progress': { es: 'Progreso', en: 'Progress' },
  'collection.collected': { es: 'Coleccionados', en: 'Collected' },
  'collection.reward': { es: 'Recompensa', en: 'Reward' },
  'collection.claimReward': { es: 'Reclamar Recompensa', en: 'Claim Reward' },
  'collection.rewardClaimed': { es: 'Recompensa Reclamada', en: 'Reward Claimed' },
  'collection.completeToUnlock': { es: 'Completa la colección para desbloquear', en: 'Complete collection to unlock' },
  
  // Online Mining
  'onlineMining.title': { es: 'Minería Online', en: 'Online Mining' },
  'onlineMining.subtitle': { es: 'Invierte DOGE y gana intereses diarios', en: 'Invest DOGE and earn daily interest' },
  'onlineMining.badge': { es: 'Inversiones', en: 'Investments' },
  'onlineMining.dailyReturn': { es: 'Retorno Diario', en: 'Daily Return' },
  'onlineMining.minInvestment': { es: 'Inversión Mínima', en: 'Min Investment' },
  'onlineMining.maxInvestment': { es: 'Inversión Máxima', en: 'Max Investment' },
  'onlineMining.invest': { es: 'Invertir', en: 'Invest' },
  'onlineMining.yourInvestments': { es: 'Tus Inversiones', en: 'Your Investments' },
  'onlineMining.noInvestments': { es: 'No tienes inversiones activas', en: 'No active investments' },
  'onlineMining.invested': { es: 'Invertido', en: 'Invested' },
  'onlineMining.earned': { es: 'Ganado', en: 'Earned' },
  'onlineMining.claimRewards': { es: 'Reclamar Recompensas', en: 'Claim Rewards' },
  
  // Lottery
  'lottery.title': { es: 'Lotería de Personajes', en: 'Character Lottery' },
  'lottery.subtitle': { es: 'Compra tickets y gana personajes exclusivos', en: 'Buy tickets and win exclusive characters' },
  'lottery.badge': { es: 'Sorteos Activos', en: 'Active Draws' },
  'lottery.ticketPrice': { es: 'Precio del Ticket', en: 'Ticket Price' },
  'lottery.soldTickets': { es: 'Tickets Vendidos', en: 'Tickets Sold' },
  'lottery.buyTickets': { es: 'Comprar Tickets', en: 'Buy Tickets' },
  'lottery.yourTickets': { es: 'Tus Tickets', en: 'Your Tickets' },
  'lottery.noActiveLotteries': { es: 'No hay loterías activas', en: 'No active lotteries' },
  'lottery.winner': { es: 'Ganador', en: 'Winner' },
  'lottery.completed': { es: 'Completado', en: 'Completed' },
  
  // Shortlinks
  'shortlinks.title': { es: 'Shortlinks', en: 'Shortlinks' },
  'shortlinks.subtitle': { es: 'Completa enlaces cortos y gana DOGE', en: 'Complete short links and earn DOGE' },
  'shortlinks.badge': { es: 'Gana Fácil', en: 'Easy Earn' },
  'shortlinks.reward': { es: 'Recompensa', en: 'Reward' },
  'shortlinks.complete': { es: 'Completar', en: 'Complete' },
  'shortlinks.completed': { es: 'Completado', en: 'Completed' },
  'shortlinks.available': { es: 'Disponible', en: 'Available' },
  
  // PTC
  'ptc.title': { es: 'Ver Anuncios (PTC)', en: 'View Ads (PTC)' },
  'ptc.subtitle': { es: 'Mira anuncios y gana DOGE', en: 'Watch ads and earn DOGE' },
  'ptc.badge': { es: 'Paid To Click', en: 'Paid To Click' },
  'ptc.viewAd': { es: 'Ver Anuncio', en: 'View Ad' },
  'ptc.noAds': { es: 'No hay anuncios disponibles', en: 'No ads available' },
  'ptc.reward': { es: 'Recompensa', en: 'Reward' },
  'ptc.views': { es: 'Vistas', en: 'Views' },
  'ptc.createAd': { es: 'Crear Anuncio', en: 'Create Ad' },
  'ptc.yourAds': { es: 'Tus Anuncios', en: 'Your Ads' },
  
  // How It Works
  'howItWorks.title': { es: '¿Cómo Funciona?', en: 'How It Works?' },
  'howItWorks.subtitle': { es: 'Es muy fácil empezar a minar DOGE', en: "It's very easy to start mining DOGE" },
  'howItWorks.step1.title': { es: 'Crea tu Cuenta', en: 'Create Account' },
  'howItWorks.step1.desc': { es: 'Regístrate gratis y recibe tu primer personaje', en: 'Sign up for free and get your first character' },
  'howItWorks.step2.title': { es: 'Colecciona Personajes', en: 'Collect Characters' },
  'howItWorks.step2.desc': { es: 'Abre Mystery Boxes para obtener nuevos Doges', en: 'Open Mystery Boxes to get new Doges' },
  'howItWorks.step3.title': { es: 'Mina Automáticamente', en: 'Mine Automatically' },
  'howItWorks.step3.desc': { es: 'Tus personajes minan DOGE las 24 horas', en: 'Your characters mine DOGE 24/7' },
  'howItWorks.step4.title': { es: 'Retira tu DOGE', en: 'Withdraw DOGE' },
  'howItWorks.step4.desc': { es: 'Envía tus ganancias a tu wallet', en: 'Send your earnings to your wallet' },
  
  // Withdrawals
  'withdrawals.title': { es: 'Últimos Retiros', en: 'Latest Withdrawals' },
  'withdrawals.subtitle': { es: 'Usuarios que han retirado recientemente', en: 'Users who withdrew recently' },
  
  // Rarity
  'rarity.title': { es: 'Rareza de Personajes', en: 'Character Rarity' },
  'rarity.subtitle': { es: 'Conoce las probabilidades de cada rareza', en: 'Know the probabilities of each rarity' },
  'rarity.common': { es: 'Común', en: 'Common' },
  'rarity.rare': { es: 'Raro', en: 'Rare' },
  'rarity.epic': { es: 'Épico', en: 'Epic' },
  'rarity.legendary': { es: 'Legendario', en: 'Legendary' },
  'rarity.starter': { es: 'Inicial', en: 'Starter' },
  
  // CTA
  'cta.title': { es: '¿Listo para Empezar?', en: 'Ready to Start?' },
  'cta.subtitle': { es: 'Únete a miles de mineros y comienza a ganar DOGE hoy', en: 'Join thousands of miners and start earning DOGE today' },
  'cta.button': { es: '¡Comenzar Ahora!', en: 'Start Now!' },
  
  // Admin
  'admin.title': { es: 'Panel de Administración', en: 'Admin Panel' },
  'admin.back': { es: 'Volver', en: 'Back' },
  'admin.refresh': { es: 'Actualizar', en: 'Refresh' },
  'admin.users': { es: 'Usuarios', en: 'Users' },
  'admin.deposits': { es: 'Depósitos', en: 'Deposits' },
  'admin.withdrawals': { es: 'Retiros', en: 'Withdrawals' },
  'admin.pendingDeposits': { es: 'Depósitos Pendientes', en: 'Pending Deposits' },
  'admin.noPending': { es: 'No hay depósitos pendientes 🎉', en: 'No pending deposits 🎉' },
  'admin.approve': { es: 'Aprobar', en: 'Approve' },
  'admin.reject': { es: 'Rechazar', en: 'Reject' },
  'admin.user': { es: 'Usuario', en: 'User' },
  'admin.date': { es: 'Fecha', en: 'Date' },
  'admin.amount': { es: 'Cantidad', en: 'Amount' },
  'admin.status': { es: 'Estado', en: 'Status' },
  'admin.actions': { es: 'Acciones', en: 'Actions' },
  'admin.addBalance': { es: 'Agregar Balance', en: 'Add Balance' },
  'admin.searchUser': { es: 'Buscar usuario por email...', en: 'Search user by email...' },
  'admin.balance': { es: 'Balance', en: 'Balance' },
  'admin.totalEarned': { es: 'Total Ganado', en: 'Total Earned' },
  'admin.totalWithdrawn': { es: 'Total Retirado', en: 'Total Withdrawn' },
  'admin.addBalanceToUser': { es: 'Agregar balance al usuario', en: 'Add balance to user' },
  'admin.amountToAdd': { es: 'Cantidad a agregar', en: 'Amount to add' },
  'admin.add': { es: 'Agregar', en: 'Add' },
  'admin.noUsers': { es: 'No se encontraron usuarios', en: 'No users found' },
  'admin.allDeposits': { es: 'Todos los Depósitos', en: 'All Deposits' },
  'admin.allWithdrawals': { es: 'Todos los Retiros', en: 'All Withdrawals' },
  
  // Support
  'support.badge': { es: '¿Necesitas ayuda?', en: 'Need help?' },
  'support.title': { es: 'Soporte', en: 'Support' },
  'support.subtitle': { es: '¿Tienes alguna pregunta o problema? ¡Estamos aquí para ayudarte! 🐕', en: 'Have a question or issue? We are here to help! 🐕' },
  'support.contactUs': { es: 'Contáctanos', en: 'Contact Us' },
  'support.description': { es: 'Envíanos un email y te responderemos lo antes posible. Describe tu problema o pregunta con el mayor detalle posible.', en: 'Send us an email and we will reply as soon as possible. Describe your issue or question in as much detail as possible.' },
  'support.sendEmail': { es: 'Enviar Email', en: 'Send Email' },
  'support.responseTime': { es: 'Tiempo de respuesta: 24-48 horas', en: 'Response time: 24-48 hours' },
  
  // Common
  'common.loading': { es: 'Cargando...', en: 'Loading...' },
  'common.error': { es: 'Error', en: 'Error' },
  'common.success': { es: 'Éxito', en: 'Success' },
  'common.cancel': { es: 'Cancelar', en: 'Cancel' },
  'common.confirm': { es: 'Confirmar', en: 'Confirm' },
  'common.save': { es: 'Guardar', en: 'Save' },
  'common.close': { es: 'Cerrar', en: 'Close' },
  'common.copy': { es: 'Copiar', en: 'Copy' },
  'common.copied': { es: 'Copiado', en: 'Copied' },
  'common.perHour': { es: '/hora', en: '/hour' },
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
