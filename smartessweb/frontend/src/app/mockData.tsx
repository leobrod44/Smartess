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
    units: { unitNumber: string }[];
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
        adminUsers: 1,
        hubUsers: 6,
        pendingTickets: 4,
        units: [
          { unitNumber: "101" },
          { unitNumber: "102" },
          { unitNumber: "103" },
        ],
        users: generateMockUsers(),
        tickets: generateMockTickets(),
        owner: generateMockOwner(),
        alerts: generateMockAlerts(),
      },
      {
        projectId: "a12294",
        address: "750 Rue Peel",
        adminUsers: 2,
        hubUsers: 3,
        pendingTickets: 10,
        units: [
          { unitNumber: "2201" },
          { unitNumber: "2202" },
          { unitNumber: "2203" },
          { unitNumber: "2204" },
          { unitNumber: "2205" },
        ],
        users: generateMockUsers(),
        tickets: generateMockTickets(),
        owner: generateMockOwner(),
        alerts: generateMockAlerts(),
      },
      {
        projectId: "b10294",
        address: "50 Rue Guy",
        adminUsers: 1,
        hubUsers: 1,
        pendingTickets: 3,
        units: [
          { unitNumber: "1A" },
          { unitNumber: "1B" },
          { unitNumber: "1C" },
        ],
        users: generateMockUsers(),
        tickets: generateMockTickets(),
        owner: generateMockOwner(),
        alerts: generateMockAlerts(),
      },
      {
        projectId: "cd10294",
        address: "131 Chemin des Conifere",
        adminUsers: 3,
        hubUsers: 6,
        pendingTickets: 4,
        units: [
          { unitNumber: "101" },
          { unitNumber: "102" },
          { unitNumber: "103" },
        ],
        users: generateMockUsers(),
        tickets: generateMockTickets(),
        owner: generateMockOwner(),
        alerts: generateMockAlerts(),
      },
      // Add more projects as needed...
    ];
  };
  
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

