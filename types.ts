
export enum Category {
  Travel = 'Travel',
  Accommodation = 'Accommodation',
  DailyAllowance = 'Daily Allowance',
  FoodAllowance = 'Food Allowance',
  CarMaintenance = 'Car Maintenance',
  BikeMaintenance = 'Bike Maintenance',
  Repair = 'Repair',
  WarehouseOperation = 'Warehouse Operation',
  Consumables = 'Consumables',
  AdvancePayment = 'Advance Payment',
  ClientEngagement = 'Client Engagement',
  TicketBooking = 'Ticket Booking',
  Other = 'Other'
}

export enum Role {
  User = 'USER',
  Admin = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  password?: string;
  isActive: boolean;
}

export interface Expense {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  category: Category;
  date: string;
  description: string;
  project: string;
  docNumber: string;
  receiptImage?: string;
  note?: string;

  // Specific Metadata Fields
  travelMode?: 'Bus' | 'Car' | 'Bike' | 'Flight';
  fromLocation?: string;
  toLocation?: string;
  approxKm?: number;
  carType?: 'Own Car' | 'Company Car';
  purpose?: string;
  stayLocation?: string;
  clientName?: string;
  personCount?: number;
  personList?: string;
  hotelName?: string;
  advanceRecipient?: string;

  // Food Allowance Specific
  isBreakfast?: boolean;
  isLunch?: boolean;
  isDinner?: boolean;
}

export interface MonthlyStats {
  month: string;
  total: number;
  byCategory: Record<Category, number>;
}
