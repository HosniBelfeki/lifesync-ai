// Enhanced translation system with comprehensive coverage
// Supports English (default), French, and Arabic with RTL support

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

// Supported languages
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
];

// Comprehensive translation dictionaries
const translations: Record<string, Record<string, string>> = {
  // French translations
  fr: {
    // Navigation & Core
    'Overview': 'Aperçu',
    'Modules': 'Modules',
    'Tasks': 'Tâches',
    'Health': 'Santé',
    'Finance': 'Finance',
    'Relationships': 'Relations',
    'Learning': 'Apprentissage',
    'Wellness': 'Bien-être',
    'AI Assistant': 'Assistant IA',
    'Settings': 'Paramètres',
    'Sign Out': 'Déconnexion',
    'Your AI-powered life companion': 'Votre compagnon de vie alimenté par l\'IA',

    // Dashboard
    'Welcome back! 👋': 'Bon retour ! 👋',
    'Here\'s what\'s happening with your life today.': 'Voici ce qui se passe dans votre vie aujourd\'hui.',
    'Tasks Completed': 'Tâches Terminées',
    'Health Score': 'Score de Santé',
    'Monthly Savings': 'Épargne Mensuelle',
    'Mood Average': 'Humeur Moyenne',
    'Quick Actions': 'Actions Rapides',
    'Add Task': 'Ajouter Tâche',
    'Log Health': 'Enregistrer Santé',
    'Record New Expense': 'Enregistrer Nouvelle Dépense',
    'Set Goal': 'Définir Objectif',
    'Ask AI': 'Demander à l\'IA',

    // Modules
    'Your Dashboard': 'Votre Tableau de Bord',
    'Customize your modules and track your progress': 'Personnalisez vos modules et suivez vos progrès',
    'Add Module': 'Ajouter Module',
    'Health Monitor': 'Moniteur de Santé',
    'Finance Tracker': 'Suivi Financier',
    'Productivity Tools': 'Outils de Productivité',
    'Relationship Manager': 'Gestionnaire de Relations',
    'Learning Assistant': 'Assistant d\'Apprentissage',
    'Crisis Prevention': 'Prévention de Crise',

    // Health Module
    'Paths': 'Parcours',
    'Due Cards': 'Cartes Dues',
    'This Week': 'Cette Semaine',
    'Good': 'Bon',
    'Water': 'Eau',
    'Tech': 'Tech',
    'Language': 'Langue',
    'Create Learning Path': 'Créer Parcours d\'Apprentissage',
    'Mood': 'Humeur',
    'Steps': 'Pas',
    'Sleep': 'Sommeil',
    'Log Health Data': 'Enregistrer Données Santé',
    '7-Day Trend': 'Tendance 7 Jours',

    // Finance Module
    'This Month': 'Ce Mois',
    'Category Breakdown': 'Répartition par Catégorie',
    'No expenses this month': 'Aucune dépense ce mois',
    'Transactions': 'Transactions',
    'Top Category': 'Catégorie Principale',
    'Food': 'Nourriture',
    'Transport': 'Transport',
    'Finance Record New Expense': 'Enregistrer Nouvelle Dépense Financière',

    // Productivity Module
    'Done': 'Terminé',
    'Pending': 'En attente',
    'Overdue': 'En retard',
    'Recent Tasks': 'Tâches Récentes',
    'No tasks yet': 'Aucune tâche encore',
    'Goal Progress': 'Progression des Objectifs',
    'Emails': 'E-mails',
    'Meeting': 'Réunion',

    // Relationship Module
    'Contacts': 'Contacts',
    'Need Attention': 'Besoin d\'Attention',
    'Upcoming Birthdays': 'Anniversaires à Venir',
    'Recent Activity': 'Activité Récente',
    'No recent interactions': 'Aucune interaction récente',
    'Add Contact': 'Ajouter Contact',

    // Crisis Module
    'High Risk': 'Risque Élevé',
    'Medium Risk': 'Risque Moyen',
    'Low Risk': 'Risque Faible',
    'No Data': 'Aucune Donnée',
    'Burnout Risk': 'Risque d\'Épuisement',
    'Quick Check-in': 'Contrôle Rapide',
    'Stressed': 'Stressé',
    'Emergency Contacts': 'Contacts d\'Urgence',
    'Crisis Resources': 'Ressources de Crise',
    'Crisis Hotline: 988': 'Ligne de Crise: 988',
    'Breathing Exercise': 'Exercice de Respiration',
    'Crisis Settings': 'Paramètres de Crise',

    // Auth
    'Email Address': 'Adresse Email',
    'Password': 'Mot de Passe',
    'Full Name': 'Nom Complet',
    'Create Account': 'Créer un Compte',
    'Sign In': 'Se Connecter',
    'Sign up with Google': 'S\'inscrire avec Google',
    'Sign in with Google': 'Se connecter avec Google',
    'Try Demo Account': 'Essayer le Compte Démo',
    'Already have an account? Sign in': 'Vous avez déjà un compte? Connectez-vous',
    'Don\'t have an account? Sign up': 'Vous n\'avez pas de compte? Inscrivez-vous',
    'or': 'ou',
    'Processing...': 'Traitement...',

    // Common Actions
    'Add': 'Ajouter',
    'Edit': 'Modifier',
    'Delete': 'Supprimer',
    'Save': 'Enregistrer',
    'Cancel': 'Annuler',
    'Close': 'Fermer',
    'Search': 'Rechercher',
    'Filter': 'Filtrer',
    'All': 'Tout',
    'Active': 'Actif',
    'Completed': 'Terminé',
    'Loading...': 'Chargement...',
    'Progress': 'Progrès',
  },

  // Arabic translations
  ar: {
    // Navigation & Core
    'Overview': 'نظرة عامة',
    'Modules': 'الوحدات',
    'Tasks': 'المهام',
    'Health': 'الصحة',
    'Finance': 'المالية',
    'Relationships': 'العلاقات',
    'Learning': 'التعلم',
    'Wellness': 'العافية',
    'AI Assistant': 'المساعد الذكي',
    'Settings': 'الإعدادات',
    'Sign Out': 'تسجيل الخروج',
    'Your AI-powered life companion': 'رفيقك الذكي لإدارة الحياة',

    // Dashboard
    'Welcome back! 👋': 'مرحباً بعودتك! 👋',
    'Here\'s what\'s happening with your life today.': 'إليك ما يحدث في حياتك اليوم.',
    'Tasks Completed': 'المهام المكتملة',
    'Health Score': 'نقاط الصحة',
    'Monthly Savings': 'المدخرات الشهرية',
    'Mood Average': 'متوسط المزاج',
    'Quick Actions': 'الإجراءات السريعة',
    'Add Task': 'إضافة مهمة',
    'Log Health': 'تسجيل الصحة',
    'Record New Expense': 'تسجيل مصروف جديد',
    'Set Goal': 'تحديد هدف',
    'Ask AI': 'اسأل الذكي',

    // Modules
    'Your Dashboard': 'لوحة التحكم الخاصة بك',
    'Customize your modules and track your progress': 'خصص وحداتك وتتبع تقدمك',
    'Add Module': 'إضافة وحدة',
    'Health Monitor': 'مراقب الصحة',
    'Finance Tracker': 'متتبع المالية',
    'Productivity Tools': 'أدوات الإنتاجية',
    'Relationship Manager': 'مدير العلاقات',
    'Learning Assistant': 'مساعد التعلم',
    'Crisis Prevention': 'منع الأزمات',

    // Health Module
    'Paths': 'المسارات',
    'Due Cards': 'البطاقات المستحقة',
    'This Week': 'هذا الأسبوع',
    'Good': 'جيد',
    'Water': 'الماء',
    'Tech': 'التقنية',
    'Language': 'اللغة',
    'Create Learning Path': 'إنشاء مسار تعلم',
    'Mood': 'المزاج',
    'Steps': 'الخطوات',
    'Sleep': 'النوم',
    'Log Health Data': 'تسجيل بيانات الصحة',
    '7-Day Trend': 'اتجاه 7 أيام',

    // Finance Module
    'This Month': 'هذا الشهر',
    'Category Breakdown': 'تفصيل الفئات',
    'No expenses this month': 'لا توجد مصروفات هذا الشهر',
    'Transactions': 'المعاملات',
    'Top Category': 'الفئة الأولى',
    'Food': 'الطعام',
    'Transport': 'النقل',
    'Finance Record New Expense': 'تسجيل مصروف مالي جديد',

    // Productivity Module
    'Done': 'منجز',
    'Pending': 'معلق',
    'Overdue': 'متأخر',
    'Recent Tasks': 'المهام الحديثة',
    'No tasks yet': 'لا توجد مهام بعد',
    'Goal Progress': 'تقدم الأهداف',
    'Emails': 'الرسائل الإلكترونية',
    'Meeting': 'اجتماع',

    // Relationship Module
    'Contacts': 'جهات الاتصال',
    'Need Attention': 'تحتاج انتباه',
    'Upcoming Birthdays': 'أعياد الميلاد القادمة',
    'Recent Activity': 'النشاط الحديث',
    'No recent interactions': 'لا توجد تفاعلات حديثة',
    'Add Contact': 'إضافة جهة اتصال',

    // Crisis Module
    'High Risk': 'خطر عالي',
    'Medium Risk': 'خطر متوسط',
    'Low Risk': 'خطر منخفض',
    'No Data': 'لا توجد بيانات',
    'Burnout Risk': 'خطر الإرهاق',
    'Quick Check-in': 'فحص سريع',
    'Stressed': 'متوتر',
    'Emergency Contacts': 'جهات اتصال الطوارئ',
    'Crisis Resources': 'موارد الأزمات',
    'Crisis Hotline: 988': 'خط الأزمات: 988',
    'Breathing Exercise': 'تمرين التنفس',
    'Crisis Settings': 'إعدادات الأزمات',

    // Auth
    'Email Address': 'البريد الإلكتروني',
    'Password': 'كلمة المرور',
    'Full Name': 'الاسم الكامل',
    'Create Account': 'إنشاء حساب',
    'Sign In': 'تسجيل الدخول',
    'Sign up with Google': 'التسجيل باستخدام جوجل',
    'Sign in with Google': 'تسجيل الدخول باستخدام جوجل',
    'Try Demo Account': 'تجربة حساب تجريبي',
    'Already have an account? Sign in': 'لديك حساب بالفعل؟ تسجيل الدخول',
    'Don\'t have an account? Sign up': 'ليس لديك حساب؟ اشترك الآن',
    'or': 'أو',
    'Processing...': 'جاري المعالجة...',

    // Common Actions
    'Add': 'إضافة',
    'Edit': 'تعديل',
    'Delete': 'حذف',
    'Save': 'حفظ',
    'Cancel': 'إلغاء',
    'Close': 'إغلاق',
    'Search': 'بحث',
    'Filter': 'تصفية',
    'All': 'الكل',
    'Active': 'نشط',
    'Completed': 'مكتمل',
    'Loading...': 'جاري التحميل...',
    'Progress': 'التقدم',
  },
};

class SimpleTranslationService {
  private currentLanguage = 'en';

  translateText(text: string, targetLanguage?: string): string {
    const target = targetLanguage || this.currentLanguage;
    
    // Return original text if target is English or text is empty
    if (target === 'en' || !text || !text.trim()) {
      return text;
    }

    // Get translation from dictionary
    const languageDict = translations[target];
    if (!languageDict) {
      return text;
    }

    // Return translated text or original if not found
    return languageDict[text] || text;
  }

  setCurrentLanguage(language: string) {
    this.currentLanguage = language;
    
    // Apply RTL for Arabic
    const isRTL = language === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Add RTL class to body for additional styling
    if (isRTL) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  getSupportedLanguages(): SupportedLanguage[] {
    return SUPPORTED_LANGUAGES;
  }
}

export const translationService = new SimpleTranslationService();

// Save language preference to localStorage
export async function saveLanguagePreference(language: string) {
  try {
    localStorage.setItem('preferred_language', language);
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
}

// Load language preference from localStorage
export async function loadLanguagePreference(): Promise<string> {
  try {
    const saved = localStorage.getItem('preferred_language');
    return saved || 'en';
  } catch (error) {
    console.error('Error loading language preference:', error);
    return 'en';
  }
}