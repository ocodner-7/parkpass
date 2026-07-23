export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  householdId: string
  role: 'OWNER' | 'MEMBER'
}

export interface Location {
  id: string
  nickname: string | null
  addressLine1: string
  addressLine2: string | null
  city: string
  postcode: string
  householdId: string
  councilId: string
  activePassCount: number
}

export interface Council {
  id: string
  name: string
  monthlyQuotaHours: number
  hoursRollOver: boolean
  pricePerHour: number
  requiresVehicleReg: boolean
  maxHoursPerPass: number
  availableDurations: number[]
  operatingHoursStart: number | null
  operatingHoursEnd: number | null
}

export interface Vehicle {
  id: string
  nickname: string | null
  registration: string
  userId: string
  householdId: string
}

export interface Pass {
  id: string
  startTime: string
  endTime: string
  registration: string
  locationId: string
  householdId: string
  issuedBy: string
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
}

export interface Household {
  id: string
  members: User[]
  hoursBalance: number
  monthlyQuota: number
  quotaUsedThisMonth: number
}

// Response types for each query
export interface LocationsResponse {
  locations: Location[]
}

export interface LocationResponse {
  location: Location | null
}

export interface PassesResponse {
  passes: Pass[]
}

export interface ActivePassesResponse {
  activePasses: Pass[]
}

export interface HouseholdResponse {
  household: Household
}

export interface VehiclesResponse {
  vehicles: Vehicle[]
}

export interface CouncilsResponse {
  councils: Council[]
}

export interface CouncilResponse {
  council:  Council
}