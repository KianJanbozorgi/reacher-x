export const DEFAULT_WORKSPACE_USE_CASE_KEY = "customer_prospecting";

export const WORKSPACE_USE_CASE_FIELD_LABEL = "هدف شما";

export const WORKSPACE_USE_CASE_KEYS = [
  "customer_prospecting",
  "recruiting",
  "partnership_outreach",
  "investor_outreach",
  "user_research_recruitment",
  "creator_outreach",
  "community_growth",
  "podcast_speaker_sourcing",
  /** Auto-detect fallback when description doesn't clearly match a use case. */
  "general_outreach",
] as const;

export type WorkspaceUseCaseKey = (typeof WORKSPACE_USE_CASE_KEYS)[number];

export const WORKSPACE_USE_CASE_STAGE_KEYS = [
  "new",
  "contacted",
  "in_progress",
  "converted",
  "archived",
] as const;

export type WorkspaceUseCaseStageKey =
  (typeof WORKSPACE_USE_CASE_STAGE_KEYS)[number];

export const WORKSPACE_USE_CASE_FUNNEL_STAGE_KEYS = [
  "new",
  "contacted",
  "in_progress",
  "converted",
] as const;

export type WorkspaceUseCaseFunnelStageKey =
  (typeof WORKSPACE_USE_CASE_FUNNEL_STAGE_KEYS)[number];

export type WorkspaceUseCaseDefinition = {
  key: WorkspaceUseCaseKey;
  displayName: string;
  shortDescription: string;
  entitySingular: string;
  entityPlural: string;
  successDefinition: string;
  profileLabelPlural: string;
  routeSlugs: {
    entity: string;
    success: string;
  };
  stageLabels: Record<WorkspaceUseCaseStageKey, string>;
  pageLabels: {
    entities: string;
    converts: string;
    archives: string;
    analytics: string;
  };
  promptContext: {
    searchIntent: string;
    qualificationLens: string;
    outreachGoal: string;
    successDefinition: string;
    terminology: {
      entitySingular: string;
      entityPlural: string;
      successLabel: string;
      profileLabelPlural: string;
    };
  };
};

export const workspaceUseCaseRegistry = {
  customer_prospecting: {
    key: "customer_prospecting",
    displayName: "یافتن مشتری",
    shortDescription:
      "افراد و شرکت‌هایی را پیدا کنید که احتمالاً مشتری می‌شوند.",
    entitySingular: "شخص",
    entityPlural: "افراد",
    successDefinition: "فرد به مشتری تبدیل می‌شود.",
    profileLabelPlural: "افراد موردنظر",
    routeSlugs: {
      entity: "prospects",
      success: "converts",
    },
    stageLabels: {
      new: "جدید",
      contacted: "تماس‌گرفته",
      in_progress: "در حال پیگیری",
      converted: "مشتری",
      archived: "بایگانی‌شده",
    },
    pageLabels: {
      entities: "افراد",
      converts: "مشتریان",
      archives: "بایگانی",
      analytics: "تحلیل‌ها",
    },
    promptContext: {
      searchIntent: "purchase intent, problems, and clear need signals",
      qualificationLens:
        "ICP fit, urgency, business pain, and likelihood to buy",
      outreachGoal:
        "start a relevant sales conversation that can lead to a customer",
      successDefinition:
        "a successful outcome is turning the person into a customer",
      terminology: {
        entitySingular: "person",
        entityPlural: "people",
        successLabel: "Customers",
        profileLabelPlural: "افراد موردنظر",
      },
    },
  },
  recruiting: {
    key: "recruiting",
    displayName: "استخدام",
    shortDescription:
      "نامزدهای مناسب برای موقعیت شغلی را پیدا کنید و با آن‌ها ارتباط بگیرید.",
    entitySingular: "نامزد",
    entityPlural: "نامزدها",
    successDefinition: "نامزد استخدام می‌شود.",
    profileLabelPlural: "پروفایل نامزدهای مناسب",
    routeSlugs: {
      entity: "candidates",
      success: "hires",
    },
    stageLabels: {
      new: "یافت‌شده",
      contacted: "تماس‌گرفته",
      in_progress: "در حال مصاحبه",
      converted: "استخدام‌شده",
      archived: "بایگانی‌شده",
    },
    pageLabels: {
      entities: "نامزدها",
      converts: "استخدام‌شدگان",
      archives: "بایگانی",
      analytics: "تحلیل‌ها",
    },
    promptContext: {
      searchIntent:
        "role fit, skill signals, hiring intent, and open-to-work language",
      qualificationLens:
        "role fit, relevant experience, interest level, and interview potential",
      outreachGoal: "start a recruiting conversation that can lead to a hire",
      successDefinition:
        "a successful outcome is moving the candidate to a hire",
      terminology: {
        entitySingular: "candidate",
        entityPlural: "candidates",
        successLabel: "Hires",
        profileLabelPlural: "پروفایل نامزدهای مناسب",
      },
    },
  },
  partnership_outreach: {
    key: "partnership_outreach",
    displayName: "یافتن شریک",
    shortDescription:
      "شرکت‌ها و افرادی را پیدا کنید که می‌توانند شریک راهبردی شوند.",
    entitySingular: "شریک",
    entityPlural: "شریکان",
    successDefinition: "شریک به همکاری فعال می‌رسد.",
    profileLabelPlural: "پروفایل شریکان مناسب",
    routeSlugs: {
      entity: "partners",
      success: "active-partners",
    },
    stageLabels: {
      new: "شناسایی‌شده",
      contacted: "تماس‌گرفته",
      in_progress: "در حال مذاکره",
      converted: "شریک‌شده",
      archived: "بایگانی‌شده",
    },
    pageLabels: {
      entities: "شریکان",
      converts: "شریکان فعال",
      archives: "بایگانی",
      analytics: "تحلیل‌ها",
    },
    promptContext: {
      searchIntent:
        "integration fit, co-marketing potential, reseller fit, and strategic alignment",
      qualificationLens:
        "mutual value, audience overlap, partnership readiness, and execution fit",
      outreachGoal:
        "open a partnership conversation that can lead to an active partner",
      successDefinition:
        "a successful outcome is converting the outreach target into an active partner",
      terminology: {
        entitySingular: "partner",
        entityPlural: "partners",
        successLabel: "Active partners",
        profileLabelPlural: "پروفایل شریکان مناسب",
      },
    },
  },
  investor_outreach: {
    key: "investor_outreach",
    displayName: "یافتن سرمایه‌گذار",
    shortDescription:
      "سرمایه‌گذارانی را پیدا کنید که حوزهٔ فعالیتشان با فرصت شما سازگار است.",
    entitySingular: "سرمایه‌گذار",
    entityPlural: "سرمایه‌گذاران",
    successDefinition: "سرمایه‌گذار برای همکاری متعهد می‌شود.",
    profileLabelPlural: "پروفایل سرمایه‌گذاران مناسب",
    routeSlugs: {
      entity: "investors",
      success: "committed-investors",
    },
    stageLabels: {
      new: "شناسایی‌شده",
      contacted: "تماس‌گرفته",
      in_progress: "در حال گفتگو",
      converted: "متعهد",
      archived: "بایگانی‌شده",
    },
    pageLabels: {
      entities: "سرمایه‌گذاران",
      converts: "سرمایه‌گذاران متعهد",
      archives: "بایگانی",
      analytics: "تحلیل‌ها",
    },
    promptContext: {
      searchIntent:
        "thesis fit, investment activity, portfolio alignment, and investor intent",
      qualificationLens:
        "check size fit, thematic fit, investment recency, and likelihood to engage",
      outreachGoal:
        "start an investor conversation that can lead to a committed investor",
      successDefinition:
        "a successful outcome is converting the outreach target into a committed investor",
      terminology: {
        entitySingular: "investor",
        entityPlural: "investors",
        successLabel: "Committed investors",
        profileLabelPlural: "پروفایل سرمایه‌گذاران مناسب",
      },
    },
  },
  user_research_recruitment: {
    key: "user_research_recruitment",
    displayName: "جذب شرکت‌کنندهٔ پژوهش",
    shortDescription:
      "افرادی را جذب کنید که بازخورد مفید دربارهٔ محصول یا بازار می‌دهند.",
    entitySingular: "شرکت‌کننده",
    entityPlural: "شرکت‌کنندگان",
    successDefinition:
      "شرکت‌کننده حضور خود را تأیید می‌کند.",
    profileLabelPlural: "پروفایل شرکت‌کنندگان مناسب",
    routeSlugs: {
      entity: "participants",
      success: "confirmed-participants",
    },
    stageLabels: {
      new: "یافت‌شده",
      contacted: "تماس‌گرفته",
      in_progress: "علاقه‌مند",
      converted: "تکمیل‌شده",
      archived: "بایگانی‌شده",
    },
    pageLabels: {
      entities: "شرکت‌کنندگان",
      converts: "شرکت‌کنندگان تأییدشده",
      archives: "بایگانی",
      analytics: "تحلیل‌ها",
    },
    promptContext: {
      searchIntent:
        "expressed pain points, willingness to talk, and feedback signals",
      qualificationLens:
        "research relevance, response likelihood, and interview value",
      outreachGoal:
        "start a research conversation that can lead to a confirmed participant",
      successDefinition:
        "a successful outcome is converting the outreach target into a confirmed participant",
      terminology: {
        entitySingular: "participant",
        entityPlural: "participants",
        successLabel: "Confirmed participants",
        profileLabelPlural: "پروفایل شرکت‌کنندگان مناسب",
      },
    },
  },
  creator_outreach: {
    key: "creator_outreach",
    displayName: "همکاری با تولیدکنندهٔ محتوا",
    shortDescription:
      "تولیدکنندگان محتوای مناسب با مخاطب و هدف همکاری را پیدا کنید.",
    entitySingular: "تولیدکنندهٔ محتوا",
    entityPlural: "تولیدکنندگان محتوا",
    successDefinition: "تولیدکنندهٔ محتوا به همکار تبدیل می‌شود.",
    profileLabelPlural: "پروفایل تولیدکنندگان مناسب",
    routeSlugs: {
      entity: "creators",
      success: "collaborators",
    },
    stageLabels: {
      new: "یافت‌شده",
      contacted: "تماس‌گرفته",
      in_progress: "در حال مذاکره",
      converted: "در حال همکاری",
      archived: "بایگانی‌شده",
    },
    pageLabels: {
      entities: "تولیدکنندگان محتوا",
      converts: "همکاران",
      archives: "بایگانی",
      analytics: "تحلیل‌ها",
    },
    promptContext: {
      searchIntent:
        "audience fit, content alignment, and sponsorship or collaboration posture",
      qualificationLens:
        "brand fit, engagement quality, collaboration readiness, and audience overlap",
      outreachGoal:
        "start a creator conversation that can lead to a collaboration",
      successDefinition:
        "a successful outcome is converting the outreach target into a collaborator",
      terminology: {
        entitySingular: "creator",
        entityPlural: "creators",
        successLabel: "Collaborators",
        profileLabelPlural: "پروفایل تولیدکنندگان مناسب",
      },
    },
  },
  community_growth: {
    key: "community_growth",
    displayName: "رشد جامعه",
    shortDescription:
      "افرادی را پیدا کنید که احتمالاً به جامعه می‌پیوندند و مشارکت می‌کنند.",
    entitySingular: "عضو احتمالی",
    entityPlural: "اعضای احتمالی",
    successDefinition: "فرد عضو جامعه می‌شود.",
    profileLabelPlural: "پروفایل اعضای مناسب",
    routeSlugs: {
      entity: "potential-members",
      success: "members",
    },
    stageLabels: {
      new: "یافت‌شده",
      contacted: "تماس‌گرفته",
      in_progress: "علاقه‌مند",
      converted: "فعال",
      archived: "بایگانی‌شده",
    },
    pageLabels: {
      entities: "اعضای احتمالی",
      converts: "اعضا",
      archives: "بایگانی",
      analytics: "تحلیل‌ها",
    },
    promptContext: {
      searchIntent: "interest, participation, discovery, and join signals",
      qualificationLens:
        "community fit, intent to join, and likelihood to become active",
      outreachGoal:
        "start a community conversation that can lead to a new member",
      successDefinition:
        "a successful outcome is converting the outreach target into an active community member",
      terminology: {
        entitySingular: "potential member",
        entityPlural: "potential members",
        successLabel: "Members",
        profileLabelPlural: "پروفایل اعضای مناسب",
      },
    },
  },
  podcast_speaker_sourcing: {
    key: "podcast_speaker_sourcing",
    displayName: "یافتن مهمان پادکست",
    shortDescription:
      "مهمانانی با تخصص و توان روایت مناسب پیدا کنید.",
    entitySingular: "مهمان",
    entityPlural: "مهمانان",
    successDefinition: "حضور مهمان ثبت می‌شود.",
    profileLabelPlural: "پروفایل مهمانان مناسب",
    routeSlugs: {
      entity: "guests",
      success: "booked-guests",
    },
    stageLabels: {
      new: "شناسایی‌شده",
      contacted: "تماس‌گرفته",
      in_progress: "علاقه‌مند",
      converted: "ثبت‌شده",
      archived: "بایگانی‌شده",
    },
    pageLabels: {
      entities: "مهمانان",
      converts: "مهمانان ثبت‌شده",
      archives: "بایگانی",
      analytics: "تحلیل‌ها",
    },
    promptContext: {
      searchIntent:
        "expertise, public speaking signals, thought leadership, and storytelling ability",
      qualificationLens:
        "topic fit, audience value, availability likelihood, and booking potential",
      outreachGoal:
        "start a guest booking conversation that can lead to a booked guest",
      successDefinition:
        "a successful outcome is converting the outreach target into a booked guest",
      terminology: {
        entitySingular: "guest",
        entityPlural: "guests",
        successLabel: "Booked guests",
        profileLabelPlural: "پروفایل مهمانان مناسب",
      },
    },
  },
  general_outreach: {
    key: "general_outreach",
    displayName: "ارتباط هدفمند",
    shortDescription:
      "برای هدف‌های دیگر، افراد مناسب را پیدا کنید و با آن‌ها ارتباط بگیرید.",
    entitySingular: "شخص",
    entityPlural: "افراد",
    successDefinition: "با فرد ارتباط مؤثر برقرار می‌شود.",
    profileLabelPlural: "پروفایل‌های مناسب",
    routeSlugs: {
      entity: "people",
      // Unique from customer_prospecting's "converts".
      success: "connections",
    },
    stageLabels: {
      new: "جدید",
      contacted: "تماس‌گرفته",
      in_progress: "در حال پیگیری",
      converted: "موفق",
      archived: "بایگانی‌شده",
    },
    pageLabels: {
      entities: "افراد",
      converts: "ارتباط‌ها",
      archives: "بایگانی",
      analytics: "تحلیل‌ها",
    },
    promptContext: {
      searchIntent:
        "relevance signals, public activity, and reasons someone is worth reaching",
      qualificationLens:
        "fit to the described audience, signal quality, and outreach potential",
      outreachGoal:
        "start a relevant conversation that can lead to a meaningful connection",
      successDefinition:
        "a successful outcome is converting the outreach into a real connection",
      terminology: {
        entitySingular: "person",
        entityPlural: "people",
        successLabel: "Connections",
        profileLabelPlural: "پروفایل‌های مناسب",
      },
    },
  },
} satisfies Record<WorkspaceUseCaseKey, WorkspaceUseCaseDefinition>;

export const workspaceUseCases = WORKSPACE_USE_CASE_KEYS.map(
  (key) => workspaceUseCaseRegistry[key]
);

export function isWorkspaceUseCaseKey(
  value: unknown
): value is WorkspaceUseCaseKey {
  return (
    typeof value === "string" &&
    WORKSPACE_USE_CASE_KEYS.includes(value as WorkspaceUseCaseKey)
  );
}

// Older workspace rows will not have a persisted useCaseKey until later phases.
export function resolveWorkspaceUseCaseKey(
  value: unknown
): WorkspaceUseCaseKey {
  return isWorkspaceUseCaseKey(value) ? value : DEFAULT_WORKSPACE_USE_CASE_KEY;
}

export function getWorkspaceUseCase(
  value: unknown
): WorkspaceUseCaseDefinition {
  return workspaceUseCaseRegistry[resolveWorkspaceUseCaseKey(value)];
}

export function getWorkspaceStageLabel(
  value: unknown,
  stage: WorkspaceUseCaseStageKey
): string {
  return getWorkspaceUseCase(value).stageLabels[stage];
}

export function getWorkspaceStageActionLabel(
  value: unknown,
  stage: WorkspaceUseCaseStageKey
): string {
  return `علامت‌گذاری به‌عنوان «${getWorkspaceStageLabel(value, stage)}»`;
}

export function getWorkspaceDiscoveryVerb(
  value: unknown
): "finding" | "sourcing" {
  return resolveWorkspaceUseCaseKey(value) === "recruiting"
    ? "sourcing"
    : "finding";
}

/** Keep older API display labels aligned while frontend and backend roll out separately. */
export function resolveWorkspaceEntityPluralLabel(
  entityPlural: string
): string {
  return entityPlural.trim().toLowerCase() === "prospects"
    ? getWorkspaceUseCase(DEFAULT_WORKSPACE_USE_CASE_KEY).entityPlural
    : entityPlural;
}
