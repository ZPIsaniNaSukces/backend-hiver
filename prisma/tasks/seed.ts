import {
  PrismaClient,
  TASK_STATUS,
  TASK_TYPE,
} from "../../generated/prisma/tasks-client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TASKS_DATABASE_URL,
    },
  },
});

// ============================================================================
// SHARED USER DATA - Must match users/seed.ts exactly
// ============================================================================
interface UserSeedData {
  id: number;
  name: string;
  surname: string;
  title: string;
  teamName: string;
  bossId: number | null;
}

const SEED_USERS: UserSeedData[] = [
  {
    id: 1,
    name: "Jan",
    surname: "Kowalski",
    title: "CEO",
    teamName: "Development",
    bossId: null,
  },
  {
    id: 2,
    name: "Anna",
    surname: "Nowak",
    title: "Development Team Lead",
    teamName: "Development",
    bossId: 1,
  },
  {
    id: 3,
    name: "Piotr",
    surname: "Wiśniewski",
    title: "Marketing Team Lead",
    teamName: "Marketing",
    bossId: 1,
  },
  {
    id: 4,
    name: "Magdalena",
    surname: "Kamińska",
    title: "HR Team Lead",
    teamName: "HR",
    bossId: 1,
  },
  {
    id: 5,
    name: "Tomasz",
    surname: "Lewandowski",
    title: "Senior Backend Developer",
    teamName: "Development",
    bossId: 2,
  },
  {
    id: 6,
    name: "Katarzyna",
    surname: "Zielińska",
    title: "Frontend Developer",
    teamName: "Development",
    bossId: 2,
  },
  {
    id: 7,
    name: "Michał",
    surname: "Szymański",
    title: "Junior Developer",
    teamName: "Development",
    bossId: 2,
  },
  {
    id: 8,
    name: "Agnieszka",
    surname: "Woźniak",
    title: "DevOps Engineer",
    teamName: "Development",
    bossId: 2,
  },
  {
    id: 9,
    name: "Robert",
    surname: "Dąbrowski",
    title: "Senior Marketing Specialist",
    teamName: "Marketing",
    bossId: 3,
  },
  {
    id: 10,
    name: "Joanna",
    surname: "Kozłowska",
    title: "Content Manager",
    teamName: "Marketing",
    bossId: 3,
  },
  {
    id: 11,
    name: "Krzysztof",
    surname: "Jankowski",
    title: "SEO Specialist",
    teamName: "Marketing",
    bossId: 3,
  },
  {
    id: 12,
    name: "Monika",
    surname: "Mazur",
    title: "Social Media Manager",
    teamName: "Marketing",
    bossId: 3,
  },
  {
    id: 13,
    name: "Paweł",
    surname: "Krawczyk",
    title: "HR Specialist",
    teamName: "HR",
    bossId: 4,
  },
  {
    id: 14,
    name: "Ewa",
    surname: "Piotrowska",
    title: "Recruitment Specialist",
    teamName: "HR",
    bossId: 4,
  },
  {
    id: 15,
    name: "Łukasz",
    surname: "Grabowski",
    title: "Payroll Specialist",
    teamName: "HR",
    bossId: 4,
  },
  {
    id: 16,
    name: "Natalia",
    surname: "Pawlak",
    title: "QA Engineer",
    teamName: "Development",
    bossId: 2,
  },
  {
    id: 17,
    name: "Marcin",
    surname: "Michalski",
    title: "UI/UX Designer",
    teamName: "Marketing",
    bossId: 3,
  },
  {
    id: 18,
    name: "Aleksandra",
    surname: "Adamczyk",
    title: "Office Manager",
    teamName: "HR",
    bossId: 4,
  },
  {
    id: 19,
    name: "Grzegorz",
    surname: "Sikora",
    title: "System Administrator",
    teamName: "Development",
    bossId: 2,
  },
  {
    id: 20,
    name: "Karolina",
    surname: "Baran",
    title: "PR Specialist",
    teamName: "Marketing",
    bossId: 3,
  },
];

const COMPANY_ID = 1;

async function main() {
  console.log("Seeding tasks database...");

  // Clean up existing data
  await prisma.task.deleteMany();
  await prisma.taskUserInfo.deleteMany();

  // Create task user infos for all users
  for (const user of SEED_USERS) {
    await prisma.taskUserInfo.create({
      data: {
        id: user.id,
        bossId: user.bossId,
        companyId: COMPANY_ID,
        name: user.name,
        lastName: user.surname,
        title: user.title,
      },
    });
  }

  console.log(`Created TaskUserInfo for ${SEED_USERS.length} users`);

  // Helper function to create date with specific time
  const createDate = (daysAgo: number, hour = 9, minute = 0) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(hour, minute, 0, 0);
    return date;
  };

  // Create realistic tasks for a tech company with proper createdAt and completedAt dates
  const tasks = [
    // ==================== DEVELOPMENT TEAM TASKS ====================
    // Completed tasks from the past
    {
      title: "Implementacja endpointu autoryzacji OAuth2",
      description:
        "Dodać obsługę logowania przez Google i Microsoft do systemu. Należy zaimplementować flow OAuth2 z refresh tokenami.",
      status: TASK_STATUS.DONE,
      type: TASK_TYPE.FEATURE,
      reporterId: 2, // Anna (Dev Lead)
      assigneeId: 5, // Tomasz (Senior Backend)
      dueDate: new Date("2025-11-20"),
      createdAt: createDate(25, 10, 30), // Created 25 days ago
      completedAt: createDate(7, 16, 45), // Completed 7 days ago
    },
    {
      title: "Optymalizacja zapytań do bazy danych",
      description:
        "Zidentyfikowano wolne zapytania w module raportów. Należy dodać indeksy i zoptymalizować N+1 queries.",
      status: TASK_STATUS.DONE,
      type: TASK_TYPE.IMPROVEMENT,
      reporterId: 5, // Tomasz
      assigneeId: 5, // Tomasz
      dueDate: new Date("2025-11-25"),
      createdAt: createDate(20, 11, 15),
      completedAt: createDate(5, 14, 20),
    },
    {
      title: "Bug: Niepoprawne wyświetlanie dat w strefie czasowej UTC+1",
      description:
        "Użytkownicy zgłaszają, że daty w systemie wyświetlają się z przesunięciem o godzinę. Należy sprawdzić konwersję timezone.",
      status: TASK_STATUS.DONE,
      type: TASK_TYPE.BUG,
      reporterId: 16, // Natalia (QA)
      assigneeId: 6, // Katarzyna (Frontend)
      dueDate: new Date("2025-11-22"),
      createdAt: createDate(18, 9, 0),
      completedAt: createDate(4, 17, 30),
    },
    {
      title: "Konfiguracja CI/CD dla nowego środowiska staging",
      description:
        "Przygotować pipeline CI/CD w GitHub Actions dla nowego środowiska staging z automatycznym deploymentem.",
      status: TASK_STATUS.DONE,
      type: TASK_TYPE.FEATURE,
      reporterId: 2, // Anna
      assigneeId: 8, // Agnieszka (DevOps)
      dueDate: new Date("2025-11-28"),
      createdAt: createDate(15, 8, 45),
      completedAt: createDate(3, 15, 10),
    },
    {
      title: "Przygotowanie materiałów na targi IT",
      description:
        "Stworzyć roll-upy, ulotki i prezentację produktową na targi IT Solutions 2025.",
      status: TASK_STATUS.DONE,
      type: TASK_TYPE.OTHER,
      reporterId: 3, // Piotr (Marketing Lead)
      assigneeId: 17, // Marcin (UI/UX)
      dueDate: new Date("2025-11-15"),
      createdAt: createDate(30, 10, 0),
      completedAt: createDate(10, 13, 45),
    },
    {
      title: "Audyt SEO strony głównej",
      description:
        "Przeprowadzić pełny audyt SEO strony hiver.tech i przygotować raport z rekomendacjami.",
      status: TASK_STATUS.DONE,
      type: TASK_TYPE.RESEARCH,
      reporterId: 3, // Piotr
      assigneeId: 11, // Krzysztof (SEO)
      dueDate: new Date("2025-11-30"),
      createdAt: createDate(22, 9, 30),
      completedAt: createDate(6, 16, 0),
    },
    {
      title: "Badanie satysfakcji pracowników 2025",
      description:
        "Przeprowadzić coroczne badanie satysfakcji pracowników i przygotować raport z wynikami.",
      status: TASK_STATUS.DONE,
      type: TASK_TYPE.RESEARCH,
      reporterId: 4, // Magdalena
      assigneeId: 13, // Paweł
      dueDate: new Date("2025-11-25"),
      createdAt: createDate(28, 11, 0),
      completedAt: createDate(8, 14, 30),
    },

    // Tasks in progress (TODO) - created at various times
    {
      title: "Refaktoryzacja modułu powiadomień",
      description:
        "Moduł powiadomień wymaga refaktoryzacji - zbyt duża złożoność cyklomatyczna, brak testów jednostkowych.",
      status: TASK_STATUS.TODO,
      type: TASK_TYPE.IMPROVEMENT,
      reporterId: 2, // Anna
      assigneeId: 7, // Michał (Junior)
      dueDate: new Date("2025-12-15"),
      createdAt: createDate(12, 10, 30),
      completedAt: null,
    },
    {
      title: "Implementacja WebSocket dla real-time updates",
      description:
        "Dashboard wymaga aktualizacji w czasie rzeczywistym. Zaimplementować WebSocket z fallbackiem na polling.",
      status: TASK_STATUS.TODO,
      type: TASK_TYPE.FEATURE,
      reporterId: 1, // Jan (CEO)
      assigneeId: 5, // Tomasz
      dueDate: new Date("2025-12-20"),
      createdAt: createDate(9, 9, 15),
      completedAt: null,
    },
    {
      title: "Aktualizacja dokumentacji API (Swagger)",
      description:
        "Uzupełnić dokumentację Swagger o nowe endpointy dodane w Q4. Dodać przykłady requestów i responses.",
      status: TASK_STATUS.TODO,
      type: TASK_TYPE.DOCUMENTATION,
      reporterId: 2, // Anna
      assigneeId: 7, // Michał
      dueDate: new Date("2025-12-10"),
      createdAt: createDate(11, 14, 0),
      completedAt: null,
    },
    {
      title: "Bug: Memory leak w serwisie tasks",
      description:
        "Monitoring pokazuje rosnące zużycie pamięci w serwisie tasks. Prawdopodobnie niedomknięte połączenia DB.",
      status: TASK_STATUS.TODO,
      type: TASK_TYPE.BUG,
      reporterId: 19, // Grzegorz (SysAdmin)
      assigneeId: 8, // Agnieszka
      dueDate: new Date("2025-12-08"),
      createdAt: createDate(6, 16, 30),
      completedAt: null,
    },
    {
      title: "Testy E2E dla flow rejestracji użytkownika",
      description:
        "Napisać kompleksowe testy E2E pokrywające pełny flow rejestracji, weryfikacji email i pierwszego logowania.",
      status: TASK_STATUS.TODO,
      type: TASK_TYPE.FEATURE,
      reporterId: 16, // Natalia
      assigneeId: 16, // Natalia
      dueDate: new Date("2025-12-12"),
      createdAt: createDate(8, 10, 0),
      completedAt: null,
    },
    {
      title: "Backup i disaster recovery plan",
      description:
        "Przygotować i przetestować procedury backup oraz plan disaster recovery dla wszystkich serwisów.",
      status: TASK_STATUS.TODO,
      type: TASK_TYPE.DOCUMENTATION,
      reporterId: 1, // Jan
      assigneeId: 19, // Grzegorz
      dueDate: new Date("2025-12-18"),
      createdAt: createDate(10, 11, 30),
      completedAt: null,
    },
    {
      title: "Kampania Google Ads - grudzień",
      description:
        "Przygotować i uruchomić kampanię Google Ads na okres świąteczny. Budżet: 15000 PLN.",
      status: TASK_STATUS.TODO,
      type: TASK_TYPE.FEATURE,
      reporterId: 3, // Piotr
      assigneeId: 9, // Robert (Senior Marketing)
      dueDate: new Date("2025-12-05"),
      createdAt: createDate(14, 9, 0),
      completedAt: null,
    },
    {
      title: "Artykuły blogowe - seria o produktywności",
      description:
        "Napisać 4 artykuły na blog firmowy o tematyce produktywności w pracy hybrydowej.",
      status: TASK_STATUS.TODO,
      type: TASK_TYPE.OTHER,
      reporterId: 3, // Piotr
      assigneeId: 10, // Joanna (Content)
      dueDate: new Date("2025-12-20"),
      createdAt: createDate(13, 10, 15),
      completedAt: null,
    },
    {
      title: "Kalendarz social media - grudzień/styczeń",
      description:
        "Przygotować harmonogram postów na LinkedIn, Facebook i Instagram na okres świąteczno-noworoczny.",
      status: TASK_STATUS.TODO,
      type: TASK_TYPE.OTHER,
      reporterId: 3, // Piotr
      assigneeId: 12, // Monika (Social Media)
      dueDate: new Date("2025-12-01"),
      createdAt: createDate(16, 11, 45),
      completedAt: null,
    },
    {
      title: "Redesign landing page dla nowego produktu",
      description:
        "Zaprojektować nowy landing page dla modułu Presence. Wymagany A/B test z obecną wersją.",
      status: TASK_STATUS.TODO,
      type: TASK_TYPE.FEATURE,
      reporterId: 1, // Jan
      assigneeId: 17, // Marcin
      dueDate: new Date("2025-12-15"),
      createdAt: createDate(7, 13, 20),
      completedAt: null,
    },
    {
      title: "PR: Komunikat prasowy - nowa wersja systemu",
      description:
        "Napisać i rozesłać komunikat prasowy o wydaniu wersji 2.0 systemu Hiver.",
      status: TASK_STATUS.TODO,
      type: TASK_TYPE.OTHER,
      reporterId: 3, // Piotr
      assigneeId: 20, // Karolina (PR)
      dueDate: new Date("2025-12-10"),
      createdAt: createDate(5, 14, 30),
      completedAt: null,
    },
    {
      title: "Onboarding - nowi pracownicy Q1 2026",
      description:
        "Przygotować materiały onboardingowe i harmonogram dla 5 nowych pracowników startujących w styczniu.",
      status: TASK_STATUS.TODO,
      type: TASK_TYPE.OTHER,
      reporterId: 4, // Magdalena (HR Lead)
      assigneeId: 13, // Paweł (HR)
      dueDate: new Date("2025-12-20"),
      createdAt: createDate(4, 9, 45),
      completedAt: null,
    },
    {
      title: "Rekrutacja: Senior DevOps Engineer",
      description:
        "Przeprowadzić pełny proces rekrutacyjny na stanowisko Senior DevOps. Budżet: 18-25k PLN.",
      status: TASK_STATUS.TODO,
      type: TASK_TYPE.OTHER,
      reporterId: 2, // Anna (zapotrzebowanie z Dev)
      assigneeId: 14, // Ewa (Recruitment)
      dueDate: new Date("2025-12-30"),
      createdAt: createDate(17, 10, 0),
      completedAt: null,
    },
    {
      title: "Przegląd i aktualizacja regulaminu pracy",
      description:
        "Zaktualizować regulamin pracy zgodnie z nowymi przepisami o pracy zdalnej obowiązującymi od 2026.",
      status: TASK_STATUS.TODO,
      type: TASK_TYPE.DOCUMENTATION,
      reporterId: 4, // Magdalena
      assigneeId: 13, // Paweł
      dueDate: new Date("2025-12-15"),
      createdAt: createDate(3, 11, 0),
      completedAt: null,
    },
    {
      title: "Raport płacowy Q4 2025",
      description:
        "Przygotować raport płacowy za Q4 2025 z analizą kosztów i porównaniem z budżetem.",
      status: TASK_STATUS.TODO,
      type: TASK_TYPE.OTHER,
      reporterId: 1, // Jan
      assigneeId: 15, // Łukasz (Payroll)
      dueDate: new Date("2025-12-28"),
      createdAt: createDate(2, 15, 20),
      completedAt: null,
    },
    {
      title: "Organizacja spotkania integracyjnego - Wigilia firmowa",
      description:
        "Zaplanować i zorganizować wigilię firmową dla wszystkich pracowników. Termin: 20 grudnia.",
      status: TASK_STATUS.TODO,
      type: TASK_TYPE.MEETING,
      reporterId: 1, // Jan
      assigneeId: 18, // Aleksandra (Office Manager)
      dueDate: new Date("2025-12-18"),
      createdAt: createDate(1, 8, 30),
      completedAt: null,
    },
    {
      title: "Planowanie budżetu IT na 2026",
      description:
        "Przygotować propozycję budżetu IT na rok 2026 uwzględniając rozwój infrastruktury i nowe licencje.",
      status: TASK_STATUS.TODO,
      type: TASK_TYPE.RESEARCH,
      reporterId: 1, // Jan
      assigneeId: 2, // Anna
      dueDate: new Date("2025-12-20"),
      createdAt: createDate(19, 9, 0),
      completedAt: null,
    },
    {
      title: "Spotkanie kwartalne - podsumowanie Q4",
      description:
        "Przygotować prezentację i przeprowadzić spotkanie podsumowujące Q4 2025 dla całej firmy.",
      status: TASK_STATUS.TODO,
      type: TASK_TYPE.MEETING,
      reporterId: 1, // Jan
      assigneeId: 1, // Jan
      dueDate: new Date("2025-12-22"),
      createdAt: createDate(0, 10, 0), // Created today
      completedAt: null,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  console.log(`Created ${tasks.length} tasks`);
  console.log("Tasks database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
