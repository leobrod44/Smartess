export interface User {
  tokenId: string;
  firstName: string;
  lastName: string;
  role: "admin" | "basic";
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
  email: string;
}

export interface Project {
  projectId: string;
  address: string;
  adminUsers: number;
  hubUsers: number;
  pendingTickets: number;
  units: Unit[];
}

export interface Unit {
  unitNumber: string;
  users: User[];
  tickets: TicketsType;
  owner: Owner;
  alerts: { message: string }[];
}

// Function to generate mock projects
export const generateMockProjects = (): Project[] => {
  return [
    {
      projectId: "a10294",
      address: "1000 De La Gauchetiere",
      adminUsers: 1, //all of these numbers shouldnt be harcoded, but be the sum of all of these values within the unit components
      hubUsers: 6,
      pendingTickets: 4,
      units: generateMockUnits(),
    },
    {
      projectId: "a12294",
      address: "750 Rue Peel",
      adminUsers: 2,
      hubUsers: 3,
      pendingTickets: 10,
      units: generateMockUnits(),
    },
    {
      projectId: "b10294",
      address: "50 Rue Guy",
      adminUsers: 1,
      hubUsers: 1,
      pendingTickets: 3,
      units: generateMockUnits(),
    },
    {
      projectId: "cd10294",
      address: "131 Chemin des Conifere",
      adminUsers: 3,
      hubUsers: 6,
      pendingTickets: 4,
      units: generateMockUnits(),
    },
    // Add more projects as needed...
  ];
};
// Function to generate mock units
const generateMockUnits = (): Unit[] => [
  {
    unitNumber: "101",
    users: generateMockUsers(),
    tickets: generateMockTickets(),
    owner: generateMockOwner(),
    alerts: generateMockAlerts(),
  },
  {
    unitNumber: "102",
    users: generateMockUsers(),
    tickets: generateMockTickets(),
    owner: generateMockOwner(),
    alerts: generateMockAlerts(),
  },
  {
    unitNumber: "103",
    users: generateMockUsers(),
    tickets: generateMockTickets(),
    owner: generateMockOwner(),
    alerts: generateMockAlerts(),
  },
  // Add more units as needed...
];

// Function to generate mock users
const generateMockUsers = (): User[] => [
  { tokenId: "2", firstName: "Mary", lastName: "Johnson", role: "basic" },
  { tokenId: "3", firstName: "Ken", lastName: "Long", role: "basic" },
  { tokenId: "4", firstName: "Michalo", lastName: "Jam", role: "admin" },
  { tokenId: "5", firstName: "Sierra", lastName: "McKnight", role: "basic" },
];

// Function to generate mock tickets
const generateMockTickets = (): TicketsType => ({
  total: 19,
  open: 3,
  pending: 4,
  closed: 12,
});

// Function to generate mock owner
const generateMockOwner = (): Owner => ({
  tokenId: "1",
  firstName: "LARRY",
  lastName: "JOHNSON",
  email: "larryJ@hotmail.com",
});

// Function to generate mock alerts
const generateMockAlerts = () => [
  { message: "SMOKE ALARM ACTIVATED" },
  { message: "WATER leak DETECTED" },
  { message: "WATER LEAKSSS DETECTED" },
];
