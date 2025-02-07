export interface HubUser {
  tokenId: string;

  firstName: string;

  lastName: string;

  email: string;

  telephone: string;

  role: "admin" | "basic";
}

export interface OrgUser {
  user_id: number;
  org_id: number;
  proj_id: number | null;
  org_user_type: string;
}

export interface CurrentUser {
  userId: string;

  role: "master" | "admin" | "basic";

  address: string[];

  firstName: string;

  lastName: string;
}

export interface TicketsType {
  total: number;

  open: number;

  pending: number;

  closed: number;
}

export interface Owner {
  tokenId: string;

  firstName: string;

  lastName: string;

  telephone: string;

  email: string;
}

export interface Project {
  projectId: string;

  address: string;

  adminUsersCount: number;

  hubUsersCount: number;

  pendingTicketsCount: number;

  units: Unit[];

  projectUsers: Individual[];
}

// New interface for project-specific individuals
export interface Individual {
  individualId: number; // Unique ID for project-specific users

  firstName: string;

  lastName: string;

  role: "admin" | "basic" | "master";
}

export interface Unit {
  projectId: string;

  unit_id: string;

  unitNumber: string;

  hubUsers: HubUser[];

  ticket: Ticket[];

  tickets: TicketsType;

  owner: Owner;

  alerts: Alert[];
}

export interface Alert {
  id: string;

  projectId: string;

  unitNumber: string;

  message:
    | "Smoke Alarm Activated"
    | "Water Leak Detected"
    | "Thermostat > 25°C"
    | "Low Battery In Device"
    | "Sensor Activated"
    | "Door Opened"
    | "Motion Detected"
    | "Door Unlocked"
    | "Light On"
    | "Climate Alert"
    | "Unknown Alert";

  type:
    | "Light"
    | "Sensor"
    | "Climate"
    | "BatteryLow"
    | "Motion"
    | "DoorOpen"
    | "Smoke"
    | "Water"
    | "Temperature"
    | "Unknown";

  timestamp: Date;

  resolved: boolean;
}

export interface Ticket {
  ticket_id: string;

  unit_id: string;

  unit_number: string;

  project_address: string;

  submitted_by_email: string;

  submitted_by_firstName: string;

  submitted_by_lastName: string;

  title: string;

  description: string;

  status: "open" | "pending" | "closed";

  created_at: Date;

  type: "repair" | "bug" | "alert" | "other";

  assigned_employees: Individual[];
}
// Function to generate mock projects

export interface Announcement {
  id: string;

  title: string;

  keyword: string;

  date: Date;

  tag: "Project" | "Organization";

  author: string;

  description: string;

  likes: number;

  files: { name: string; url: string }[];
}

export const generateMockAnnouncements = (): Announcement[] => {
  return [
    {
      id: "1",
      title: "1000 de la guachetiere",
      keyword: "REPAIR",
      date: new Date("2024-11-28"),
      tag: "Project",
      author: "Kendall Roy",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
      likes: 12,
      files: [],
    },

    {
      id: "2",
      title: "Organization",
      keyword: "GENERAL",
      date: new Date("2024-11-28"),
      tag: "Organization",
      author: "Logan Roy",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit.",
      likes: 1,
      files: [
        { name: "Project_Plan.pdf", url: "/files/Project_Plan.pdf" },
        { name: "Budget.xlsx", url: "/files/Budget.xlsx" },
        { name: "Presentation.pptx", url: "/files/Presentation.pptx" },
      ],
    },
    {
      id: "3",
      title: "Organization",
      keyword: "EMERGENCY",
      date: new Date("2024-11-30"),
      tag: "Organization",
      author: "Michael Lengo",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit.",
      likes: 0,
      files: [{ name: "dummy.jpg", url: "https://placehold.co/100" }],
    },
    {
      id: "4",
      title: "150 Rue Peel",
      keyword: "RENOVATION",
      date: new Date("2024-10-30"),
      tag: "Project",
      author: "Kenny Long",
      description:
        " Hello Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit.",
      likes: 6,
      files: [
        {
          name: "wide_image.gif",
          url: "https://placehold.co/1200x400",
        },
      ],
    },
    {
      id: "5",
      title: "150 Rue Peel",
      keyword: "REPAIR",
      date: new Date("2024-10-30"),
      tag: "Project",
      author: "Siobhan Roy",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit.",
      likes: 6,
      files: [
        {
          name: "wide_image.gif",
          url: "https://placehold.co/1200x400",
        },
        {
          name: "wide2_image.gif",
          url: "https://placehold.co/1200x400",
        },
      ],
    },
    {
      id: "6",
      title: "1000 de la guachetiere",
      keyword: "REPAIR",
      date: new Date("2024-12-12"),
      tag: "Project",
      author: "Kiara Lee",
      description:
        "IMPORTANT ANNOUNCEMENT!! PLEASE READ :Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
      likes: 5,
      files: [],
    },
  ];
};
export const generateMockProjects = (): Project[] => {
  return [
    {
      projectId: "a10294",

      address: "1000 De La Gauchetiere",

      adminUsersCount: 1, //all of these numbers shouldnt be harcoded, but be the sum of all of these values within the unit components

      hubUsersCount: 6,

      pendingTicketsCount: 4,

      projectUsers: generateMockProjectUsers(),

      units: generateMockUnits(),
    },

    {
      projectId: "a12294",

      address: "750 Peel Street",

      adminUsersCount: 2,

      hubUsersCount: 3,

      pendingTicketsCount: 10,

      projectUsers: generateMockProjectUsers2(),

      units: generateMockUnits2(),
    },

    {
      projectId: "b10294",

      address: "50 Rue Guy",

      adminUsersCount: 1,

      hubUsersCount: 1,

      pendingTicketsCount: 3,

      projectUsers: generateMockProjectUsers3(),

      units: generateMockUnits(),
    },

    {
      projectId: "cd10294",

      address: "131 Chemin des Coniferes",

      adminUsersCount: 3,

      hubUsersCount: 6,

      pendingTicketsCount: 4,

      projectUsers: generateMockProjectUsers2(),

      units: generateMockUnits2(),
    },

    // Add more projects as needed...
  ];
};

// Function to generate mock units

export const generateMockUnits = (): Unit[] => [
  {
    projectId: "1",
    unit_id: "1",

    unitNumber: "101",

    hubUsers: generateMockUsers(),

    ticket: generateMockTickets2(),

    tickets: generateMockTickets(),

    owner: generateMockOwner(),

    alerts: generateMockAlerts(),
  },

  {
    projectId: "1",
    unit_id: "2",
    unitNumber: "102",

    hubUsers: generateMockUsers(),

    ticket: generateMockTickets2(),

    tickets: generateMockTickets(),

    owner: generateMockOwner(),

    alerts: generateMockAlerts(),
  },

  {
    projectId: "1",
    unit_id: "3",
    unitNumber: "103",

    hubUsers: generateMockUsers(),

    ticket: generateMockTickets2(),

    tickets: generateMockTickets(),

    owner: generateMockOwner(),

    alerts: generateMockAlerts(),
  },

  // Add more units as needed...
];

// Function to generate mock users

const generateMockUsers = (): HubUser[] => [
  {
    tokenId: "2",
    firstName: "Mary",
    lastName: "Johnson",
    email: "maryJ@gmail.com",
    telephone: "5145552343",
    role: "basic",
  },

  {
    tokenId: "3",
    firstName: "Ken",
    lastName: "Long",
    email: "ken.long@gmail.com",
    telephone: "5147735323",
    role: "basic",
  },

  {
    tokenId: "4",
    firstName: "Michalo",
    lastName: "Jam",
    email: "M.jam@gmail.com",
    telephone: "5144385243",
    role: "admin",
  },

  {
    tokenId: "5",
    firstName: "Sierra",
    lastName: "McKnight",
    email: "mcknightS@gmail.com",
    telephone: "4389763424",
    role: "basic",
  },
];

// Function to generate mock tickets

const generateMockTickets = (): TicketsType => ({
  total: 19,

  open: 3,

  pending: 4,

  closed: 12,
});

const generateMockTickets2 = (): Ticket[] => [
  {
    ticket_id: "t1",

    unit_id: "1",

    unit_number: "101",

    project_address: "1000 De La Gauchetiere",

    submitted_by_email: "LarryJ@hotmail.com",

    submitted_by_firstName: "Larry",

    submitted_by_lastName: "Johnson",

    title: "My window is broken",

    description:
      "Some kids playing baseball broke my window. It has been a week that its boarded up with cardboard as i wait for you to send a repairman. It is really cold inside, please come and fix my window immediately",

    status: "pending",

    created_at: new Date("2024-10-31T10:15:00"),

    type: "repair",

    assigned_employees: generateMockProjectUsers2(),
  },
  {
    ticket_id: "t2",

    unit_id: "1",

    unit_number: "101",

    project_address: "1000 De La Gauchetiere",

    submitted_by_email: "KLittle@hotmail.com",

    submitted_by_firstName: "Karen",

    submitted_by_lastName: "Little",

    title: "Parking spot",

    description:
      "My reserved parking spot keeps getting taken! The persons license plate is XXXXXXX.",

    status: "open",

    created_at: new Date("2024-11-11T10:15:00"),

    type: "other",
    assigned_employees: generateMockProjectUsers(),
  },
  {
    ticket_id: "t3",

    unit_id: "3",

    unit_number: "101",

    project_address: "1000 De La Gauchetiere",

    submitted_by_email: "Wendys@hotmail.com",

    submitted_by_firstName: "Wendy",

    submitted_by_lastName: "McDonald",

    title: "Moving day Query",

    description:
      "Im moving out in 2 weeks, i need to reserve the elevator 3 for the movers to be able to come in and out with my items.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dol sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ",

    status: "closed",

    created_at: new Date("2024-10-11T10:15:00"),

    type: "other",

    assigned_employees: generateMockProjectUsers(),
  },
];
// Function to generate mock owner

const generateMockOwner = (): Owner => ({
  tokenId: "1",

  firstName: "LARRY",

  lastName: "JOHNSON",
  telephone: "5143334422",

  email: "larryJ@hotmail.com",
});

// Function to generate mock alerts

const generateMockAlerts = (): Alert[] => [
  {
    id: "1",

    projectId: "a10294",

    unitNumber: "101",

    message: "Smoke Alarm Activated",

    type: "Smoke",

    timestamp: new Date("2024-12-15T14:30:00"),

    resolved: false,
  },

  {
    id: "2",

    projectId: "a10294",

    unitNumber: "102",

    message: "Water Leak Detected",

    type: "Water",

    timestamp: new Date("2024-03-02T11:12:00"),

    resolved: false,
  },

  {
    id: "3",

    projectId: "b10294",

    unitNumber: "103",

    message: "Thermostat > 25°C",

    type: "Temperature",

    timestamp: new Date("2024-04-10T10:49"),

    resolved: true,
  },

  {
    id: "4",

    unitNumber: "101",

    projectId: "b10294",

    message: "Low Battery In Device",

    type: "BatteryLow",

    timestamp: new Date("2024-08-11T10:15:00"),

    resolved: false,
  },
  {
    id: "5",

    unitNumber: "101",

    projectId: "b10294",

    message: "Sensor Activated",

    type: "Sensor",

    timestamp: new Date("2024-08-11T10:15:00"),

    resolved: false,
  },

  {
    id: "6",

    unitNumber: "101",

    projectId: "b10294",

    message: "Door Opened",

    type: "DoorOpen",

    timestamp: new Date("2024-08-11T10:15:00"),

    resolved: false,
  },
  {
    id: "7",

    unitNumber: "101",

    projectId: "b10294",

    message: "Motion Detected",

    type: "Motion",

    timestamp: new Date("2024-08-11T10:15:00"),

    resolved: false,
  },

  {
    id: "8",

    unitNumber: "101",

    projectId: "b10294",

    message: "Climate Alert",

    type: "Climate",

    timestamp: new Date("2024-08-11T10:15:00"),

    resolved: false,
  },

  {
    id: "9",

    unitNumber: "101",

    projectId: "b10294",

    message: "Unknown Alert",

    type: "Unknown",

    timestamp: new Date("2024-08-11T10:15:00"),

    resolved: false,
  },

  {
    id: "10",

    unitNumber: "101",

    projectId: "b10294",

    message: "Light On",

    type: "Light",

    timestamp: new Date("2024-08-11T10:15:00"),

    resolved: false,
  },
];

//extra functions simply tochange the names to test the search bar-----------------------------------

// Function to generate mock units

const generateMockUnits2 = (): Unit[] => [
  {
    projectId: "2",
    unit_id: "1",

    unitNumber: "101",

    hubUsers: generateMockUsers2(),

    ticket: generateMockTickets2(),

    tickets: generateMockTickets(),

    owner: generateMockOwner2(),

    alerts: generateMockAlerts(),
  },

  {
    projectId: "2",
    unit_id: "2",

    unitNumber: "102",

    hubUsers: generateMockUsers(),

    ticket: generateMockTickets2(),

    tickets: generateMockTickets(),

    owner: generateMockOwner2(),

    alerts: generateMockAlerts(),
  },

  {
    projectId: "2",
    unit_id: "3",

    unitNumber: "103",

    hubUsers: generateMockUsers2(),

    ticket: generateMockTickets2(),

    tickets: generateMockTickets(),

    owner: generateMockOwner(),

    alerts: generateMockAlerts(),
  },

  // Add more units as needed...
];

//second one with different names for testing searchbar

const generateMockOwner2 = (): Owner => ({
  tokenId: "10",

  firstName: "KAREN",

  lastName: "FIELDS",

  telephone: "5148886595",

  email: "kfields@gmail.com",
});

// Second Function to generate mock users, simply to test searchbar

const generateMockUsers2 = (): HubUser[] => [
  {
    tokenId: "6",
    firstName: "BILL",
    lastName: "Bong",
    email: "billbong@gmail.com",
    telephone: "6349873562",
    role: "basic",
  },

  {
    tokenId: "7",
    firstName: "Penny",
    lastName: "Wise",
    email: "Pwise@gmail.com",
    telephone: "5129874623",
    role: "basic",
  },

  {
    tokenId: "8",
    firstName: "Michalo",
    lastName: "Jam",
    email: "M.jam@gmail.com",
    telephone: "5144385243",
    role: "admin",
  },

  {
    tokenId: "9",
    firstName: "Sierra",
    lastName: "Mist",
    email: "mcknightS@gmail.com",
    telephone: "4389763424",
    role: "basic",
  },
];

const generateMockProjectUsers = (): Individual[] => [
  {
    individualId: 1,
    firstName: "Alice",
    lastName: "Smith",
    role: "master",
  },
  {
    individualId: 2,
    firstName: "Bob",
    lastName: "Johnson",
    role: "basic",
  },
  {
    individualId: 2,
    firstName: "Karen",
    lastName: "Philipeli",
    role: "basic",
  },
];

// Function to generate mock project users for the second project
const generateMockProjectUsers2 = (): Individual[] => [
  {
    individualId: 3,
    firstName: "Zach",
    lastName: "Brown",
    role: "basic",
  },
  {
    individualId: 4,
    firstName: "Aliana",
    lastName: "Prince",
    role: "admin",
  },
];

const generateMockProjectUsers3 = (): Individual[] => [
  {
    individualId: 5,
    firstName: "Sara",
    lastName: "Johnson",
    role: "master",
  },
  {
    individualId: 6,
    firstName: "Billie",
    lastName: "Eilish",
    role: "admin",
  },
];

export const mockUsersNotAssignedToTicker = (): Individual[] => [
  {
    individualId: 5,
    firstName: "Sara",
    lastName: "Johnson",
    role: "master",
  },
  {
    individualId: 6,
    firstName: "Billie",
    lastName: "Eilish",
    role: "admin",
  },
  {
    individualId: 12,
    firstName: "Mark",
    lastName: "Johns",
    role: "admin",
  },
  {
    individualId: 7,
    firstName: "Kellie",
    lastName: "Bells",
    role: "admin",
  },
  {
    individualId: 8,
    firstName: "Kaitlyn",
    lastName: "Jingle",
    role: "admin",
  },
  {
    individualId: 9,
    firstName: "Timothy",
    lastName: "Brown",
    role: "admin",
  },
  {
    individualId: 10,
    firstName: "Bob",
    lastName: "Blinker",
    role: "admin",
  },
  {
    individualId: 11,
    firstName: "Sarah",
    lastName: "Michaels",
    role: "admin",
  },
];
