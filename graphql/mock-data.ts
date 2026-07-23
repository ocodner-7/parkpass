import { Pass } from "@/types/graphql";

export const mockLocations = [
    {
        id: "location-1",
        nickname: "home sweet home",
        addressLine1: "15 Oak Avenue",
        addressLine2: null,
        city: "London",
        postcode: "E5 9RB",
        householdId: "household-1",
        councilId: "council-1"
    },
    {
        id: "location-2",
        nickname: "Kari's house",
        addressLine1: "42 Blaine Road",
        addressLine2: null,
        city: "London",
        postcode: "E7 9HN",
        householdId: "household-2",
        councilId: "council-2"
    },
    {
        id: "location-3",
        nickname: "Aunty Jenny's",
        addressLine1: "78 Portnall Close",
        addressLine2: null,
        city: "London",
        postcode: "NW10 5DX",
        householdId: "household-3",
        councilId: "council-3"
    },
    {
        id: "location-4",
        nickname: "Yasmin's house",
        addressLine1: "5 Jubilee Way",
        addressLine2: null,
        city: "London",
        postcode: "SE23 3TH",
        householdId: "household-1",
        councilId: "council-4"
    }
];
 
export const mockPasses: Pass[] = [
    {
        id: "pass-1",
        startTime: "2026-07-01T08:00:00Z",
        endTime: "2026-07-01T18:00:00Z",
        registration: "AB12 CDE",
        locationId: "location-1",
        householdId: "household-1",
        issuedBy: "user-1",
        status: "ACTIVE"
    },
    {
        id: "pass-2",
        startTime: "2026-06-15T09:30:00Z",
        endTime: "2026-06-15T17:30:00Z",
        registration: "XY23 FGH",
        locationId: "location-2",
        householdId: "household-2",
        issuedBy: "user-2",
        status: "EXPIRED"
    },
    {
        id: "pass-3",
        startTime: "2026-07-03T10:00:00Z",
        endTime: "2026-07-03T20:00:00Z",
        registration: "LM24 JKL",
        locationId: "location-3",
        householdId: "household-3",
        issuedBy: "user-3",
        status: "CANCELLED"
    },
    {
        id: "pass-4",
        startTime: "2026-07-07T07:00:00Z",
        endTime: "2026-07-07T19:00:00Z",
        registration: "CD25 MNO",
        locationId: "location-4",
        householdId: "household-1",
        issuedBy: "user-1",
        status: "ACTIVE"
    }
];

export const mockCouncils = [
    {
        id: "council-1",
        name: "London Borough of Hackney",
        monthlyQuotaHours: 20,
        hoursRollOver: true,
        pricePerHour: 220,
        requiresVehicleReg: true,
        maxHoursPerPass: 12,
        availableDurations: [1, 2, 4, 8, 12],
        operatingHoursStart: 8,
        operatingHoursEnd: 18
    },
    {
        id: "council-2",
        name: "London Borough of Newham",
        monthlyQuotaHours: 15,
        hoursRollOver: false,
        pricePerHour: 189,
        requiresVehicleReg: true,
        maxHoursPerPass: 10,
        availableDurations: [1, 2, 6, 10],
        operatingHoursStart: 9,
        operatingHoursEnd: 17
    },
    {
        id: "council-3",
        name: "London Borough of Brent",
        monthlyQuotaHours: 25,
        hoursRollOver: true,
        pricePerHour: 150,
        requiresVehicleReg: false,
        maxHoursPerPass: 24,
        availableDurations: [2, 4, 8, 12, 24],
        operatingHoursStart: null,
        operatingHoursEnd: null
    },
    {
        id: "council-4",
        name: "London Borough of Lewisham",
        monthlyQuotaHours: 18,
        hoursRollOver: false,
        pricePerHour: 210,
        requiresVehicleReg: true,
        maxHoursPerPass: 8,
        availableDurations: [1, 2, 4, 8],
        operatingHoursStart: 8,
        operatingHoursEnd: 20
    }
];

export const mockUsers = [
    {
        id: "user-1",
        firstName: "Daniel",
        lastName: "Williams",
        email: "daniel.williams@example.com",
        householdId: "household-1",
        role: "OWNER"
    },
    {
        id: "user-2",
        firstName: "Kari",
        lastName: "Johnson",
        email: "kari.johnson@example.com",
        householdId: "household-2",
        role: "OWNER"
    },
    {
        id: "user-3",
        firstName: "Jenny",
        lastName: "Brown",
        email: "jenny.brown@example.com",
        householdId: "household-3",
        role: "OWNER"
    },
    {
        id: "user-4",
        firstName: "Michael",
        lastName: "Williams",
        email: "michael.williams@example.com",
        householdId: "household-1",
        role: "MEMBER"
    },
    {
        id: "user-5",
        firstName: "Sarah",
        lastName: "Taylor",
        email: "sarah.taylor@example.com",
        householdId: "household-2",
        role: "MEMBER"
    }
];

export const mockHouseholds = [
    {
        id: "household-1",
        members: ["user-1", "user-4"],
        hoursBalance: 14.5,
        monthlyQuota: 20,
        quotaUsedThisMonth: 5
    },
    {
        id: "household-2",
        members: ["user-2", "user-5"],
        hoursBalance: 8,
        monthlyQuota: 15,
        quotaUsedThisMonth: 7
    },
    {
        id: "household-3",
        members: ["user-3"],
        hoursBalance: 22,
        monthlyQuota: 25,
        quotaUsedThisMonth: 3
    }
];

export const mockVehicles = [
    {
        id: "vehicle-1",
        nickname: "Dad's car",
        registration: "AB12 CDE",
        userId: "user-1",
        householdId: "household-1"
    },
    {
        id: "vehicle-2",
        nickname: "Kari's Golf",
        registration: "XY23 FGH",
        userId: "user-2",
        householdId: "household-2"
    },
    {
        id: "vehicle-3",
        nickname: "Jenny's Fiesta",
        registration: "LM24 JKL",
        userId: "user-3",
        householdId: "household-3"
    },
    {
        id: "vehicle-4",
        nickname: null,
        registration: "CD25 MNO",
        userId: "user-4",
        householdId: "household-1"
    },
    {
        id: "vehicle-5",
        nickname: "Sarah's Polo",
        registration: "EF26 PQR",
        userId: "user-5",
        householdId: "household-2"
    }
];