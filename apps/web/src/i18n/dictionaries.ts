import type { Locale } from "./config";

export type Messages = {
  hero: {
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    previewTitle: string;
    previewDescription: string;
    previewInputLabel: string;
    previewSubmit: string;
  };
  highlights: {
    referral: string;
    loyalty: string;
    analytics: string;
  };
  admin: {
    title: string;
    description: string;
    rulesCta: string;
    analyticsCta: string;
  };
  nav: {
    catalog: string;
    dashboard: string;
    admin: string;
  };
};

const dictionaries: Record<Locale, Messages> = {
  fr: {
    hero: {
      title: "Marché bio tunisien avec fidélité dynamique",
      subtitle:
        "Vendez miel, huile d'olive et cosmétiques bio avec un moteur de règles en temps réel pour les points, remises et parrainages.",
      primaryCta: "Découvrir les produits",
      secondaryCta: "Voir le tableau de bord",
      previewTitle: "Simulation instantanée",
      previewDescription: "Entrez un panier pour estimer les points attribués avec les règles actives.",
      previewInputLabel: "Montant de la commande",
      previewSubmit: "Calculer mes points",
    },
    highlights: {
      referral:
        "Les clients deviennent affiliés après leur première commande et partagent un code unique avec des récompenses configurables.",
      loyalty:
        "Définissez la valeur des points, les paliers de remises et les bonus saisonniers directement depuis le panneau admin.",
      analytics:
        "Surveillez les ventes, la performance des parrainages et le passif de points grâce à des tableaux de bord visuels.",
    },
    admin: {
      title: "Panneau d'administration",
      description:
        "Composez vos règles métier sans déploiement : ajustez les pourcentages, conditions et calendriers puis publiez en un clic.",
      rulesCta: "Configurer les règles",
      analyticsCta: "Consulter l'analytics",
    },
    nav: {
      catalog: "Catalogue",
      dashboard: "Mon espace",
      admin: "Admin",
    },
  },
  en: {
    hero: {
      title: "Tunisian bio marketplace with live loyalty",
      subtitle:
        "Offer honey, olive oil, and skincare with a runtime rule engine deciding points, discounts, and referral boosts.",
      primaryCta: "Browse catalog",
      secondaryCta: "Open dashboard",
      previewTitle: "Instant preview",
      previewDescription: "Estimate loyalty points for the current campaign before checkout.",
      previewInputLabel: "Order amount",
      previewSubmit: "Preview rewards",
    },
    highlights: {
      referral:
        "Customers become affiliates after the first purchase and share a code that pays both sides based on current rules.",
      loyalty:
        "Tune point values, earning tiers, and redemption caps directly from the admin studio.",
      analytics:
        "Visual dashboards show revenue, referral ladders, and total point liability in real time.",
    },
    admin: {
      title: "Admin studio",
      description:
        "Model, test, and publish business logic without redeploying. All payouts are versioned and auditable.",
      rulesCta: "Manage rules",
      analyticsCta: "View analytics",
    },
    nav: {
      catalog: "Catalog",
      dashboard: "Dashboard",
      admin: "Admin",
    },
  },
  ar: {
    hero: {
      title: "سوق المنتجات البيولوجية التونسية مع ولاء ذكي",
      subtitle:
        "قدّم العسل وزيت الزيتون ومستحضرات التجميل مع محرّك قواعد لحظي يحدد النقاط والخصومات ومكافآت الإحالة.",
      primaryCta: "استكشف المتجر",
      secondaryCta: "لوحة التحكم",
      previewTitle: "محاكاة فورية",
      previewDescription: "أدخل قيمة السلة لمعرفة النقاط المتوقعة حسب القواعد الحالية.",
      previewInputLabel: "قيمة الطلب",
      previewSubmit: "احسب النقاط",
    },
    highlights: {
      referral:
        "يصبح العميل شريكاً بعد أول عملية شراء ويحصل على رمز إحالة بمكافآت قابلة للتخصيص لكلا الطرفين.",
      loyalty:
        "اضبط قيمة النقاط، مستويات العروض وحدود الاستبدال مباشرة من واجهة الإدارة.",
      analytics:
        "تابع المبيعات وسلاسل الإحالة والالتزامات بالنقاط من خلال لوحات معلومات تفاعلية.",
    },
    admin: {
      title: "لوحة الإدارة",
      description:
        "صمّم واختبر وانشر قواعدك التجارية دون نشر جديد، مع تتبع كامل للإصدارات.",
      rulesCta: "إدارة القواعد",
      analyticsCta: "عرض التحليلات",
    },
    nav: {
      catalog: "المنتجات",
      dashboard: "حسابي",
      admin: "إدارة",
    },
  },
};

export async function getDictionary(locale: Locale): Promise<Messages> {
  return dictionaries[locale] ?? dictionaries["fr"];
}
