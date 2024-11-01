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
export interface Alert {
  id: string; 
  projectId:string;
  unitNumber: string; 
  message: 'Smoke Alarm Activated'| 'Water Leak Detected'|'Thermostat > 25°C'|'No Battery In Device'|'Carbon Monoxide Detected'|'Window Opened'|'Door Unlocked'; 
  timestamp: Date; 
  resolved: boolean; 
  icon: string; 
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
      units: generateMockUnits2(),
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
      units: generateMockUnits2(),
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
const generateMockAlerts = (): Alert[] => [
  {
    id: "1",
    projectId:"a10294",
    unitNumber: "101",
    message: "Smoke Alarm Activated",
    timestamp: new Date("2024-10-31T10:15:00"),
    resolved: false,
    icon: "smoke-alarm-icon-url", // Replace with actual icon URL or class
  },
  {
    id: "2",
    projectId:"a10294",
    unitNumber: "102",
    message: "Water Leak Detected",
    timestamp: new Date("2024-10-31T11:00:00"),
    resolved: false,
    icon: "water-leak-icon-url", // Replace with actual icon URL or class
  },
  {
    id: "3",
    projectId: "b10294",
    unitNumber: "103",
    message: "Thermostat > 25°C",
    timestamp: new Date("2024-10-31T12:30:00"),
    resolved: true,
    icon: "thermostat-icon-url", // Replace with actual icon URL or class
  },
  {
    id: "4",
    unitNumber: "101",
    projectId: "b10294",
    message: "No Battery In Device",
    timestamp: new Date("2024-10-31T09:45:00"),
    resolved: false,
    icon: "battery-icon-url", // Replace with actual icon URL or class
  },
  // Add more alerts as needed...
];


//extra functions simply tochange the names to test the search bar-----------------------------------
// Function to generate mock units
const generateMockUnits2 = (): Unit[] => [
  {
    unitNumber: "101",
    users: generateMockUsers2(),
    tickets: generateMockTickets(),
    owner: generateMockOwner2(),
    alerts: generateMockAlerts(),
  },
  {
    unitNumber: "102",
    users: generateMockUsers(),
    tickets: generateMockTickets(),
    owner: generateMockOwner2(),
    alerts: generateMockAlerts(),
  },
  {
    unitNumber: "103",
    users: generateMockUsers2(),
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
  email: "kfields@gmail.com",
});
// Second Function to generate mock users, simply to test searchbar 
const generateMockUsers2 = (): User[] => [
  { tokenId: "6", firstName: "BILL", lastName: "Bong", role: "basic" },
  { tokenId: "7", firstName: "Penny", lastName: "Wise", role: "basic" },
  { tokenId: "8", firstName: "Michalo", lastName: "Jam", role: "admin" },
  { tokenId: "9", firstName: "Sierra", lastName: "Mist", role: "basic" },
];
