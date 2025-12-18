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
  'header.miningRate': { es: '/s', en: '/s' },
  'header.logout': { es: '¡Hasta pronto!', en: 'See you soon!' },
  
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
  
  // FaucetPay
  'faucetpay.title': { es: 'Depósitos y Retiros', en: 'Deposits & Withdrawals' },
  'faucetpay.subtitle': { es: 'Conecta tu cuenta de FaucetPay para depositar y retirar tu DOGE. Much secure! 🔐', en: 'Connect your FaucetPay account to deposit and withdraw your DOGE. Much secure! 🔐' },
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
  
  // Mystery Box
  'mysterybox.title': { es: 'Mystery Boxes', en: 'Mystery Boxes' },
  'mysterybox.subtitle': { es: 'Abre cajas para conseguir personajes', en: 'Open boxes to get characters' },
  'mysterybox.common': { es: 'Común', en: 'Common' },
  'mysterybox.rare': { es: 'Rara', en: 'Rare' },
  'mysterybox.legendary': { es: 'Legendaria', en: 'Legendary' },
  'mysterybox.open': { es: 'Abrir', en: 'Open' },
  
  // Common
  'common.loading': { es: 'Cargando...', en: 'Loading...' },
  'common.error': { es: 'Error', en: 'Error' },
  'common.success': { es: 'Éxito', en: 'Success' },
  'common.cancel': { es: 'Cancelar', en: 'Cancel' },
  'common.confirm': { es: 'Confirmar', en: 'Confirm' },
  'common.save': { es: 'Guardar', en: 'Save' },
  'common.close': { es: 'Cerrar', en: 'Close' },
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
