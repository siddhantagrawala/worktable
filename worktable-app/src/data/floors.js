// WORK TABLE — Floor & Seat Data
// Based on FAQ document: 9 floors, ~80 seats/floor, 816 total capacity

export const SEAT_TYPES = {
  OPEN: 'open',
  CABIN: 'cabin',
  MANAGER: 'manager',
  MEETING: 'meeting',
  CONFERENCE: 'conference',
};

export const SEAT_TYPE_INFO = {
  [SEAT_TYPES.OPEN]: {
    label: 'Open Seat',
    description: 'Flexible hot desk in shared workspace',
    capacity: '1 person',
    pricePerMonth: 8000,
    pricePerDay: 500,
    icon: 'Monitor',
    color: '#4ADE80',
  },
  [SEAT_TYPES.CABIN]: {
    label: 'Cabin',
    description: '4-seater private cabin with manager desk',
    capacity: '4 persons',
    pricePerMonth: 35000,
    pricePerDay: 2000,
    icon: 'DoorOpen',
    color: '#60A5FA',
  },
  [SEAT_TYPES.MANAGER]: {
    label: 'Manager Cabin',
    description: 'Premium private office for leadership',
    capacity: '1 person',
    pricePerMonth: 15000,
    pricePerDay: 1000,
    icon: 'Crown',
    color: '#C07A5A',
  },
  [SEAT_TYPES.MEETING]: {
    label: 'Meeting Room',
    description: 'Dedicated meeting space (4 hrs/month included)',
    capacity: '8 persons',
    pricePerHour: 1500,
    includedHours: 4,
    icon: 'Users',
    color: '#A78BFA',
  },
  [SEAT_TYPES.CONFERENCE]: {
    label: 'Conference Room',
    description: 'Large conference facility (6 hrs/month included)',
    capacity: '16 persons',
    pricePerHour: 3000,
    includedHours: 6,
    icon: 'Presentation',
    color: '#F472B6',
  },
};

// Generate seats for a floor
function generateSeats(floorId) {
  const seats = [];
  
  // 20 Open Seats
  for (let i = 1; i <= 20; i++) {
    seats.push({
      id: `F${floorId}-OS-${i}`,
      type: SEAT_TYPES.OPEN,
      label: `OS-${i}`,
      cluster: `L-${Math.floor((i - 1) / 3)}`,
      status: Math.random() > 0.4 ? 'available' : 'booked',
      position: { x: 80 + ((i - 1) % 5) * 70, y: 100 + Math.floor((i - 1) / 5) * 60 },
    });
  }
  
  // 7 Cabins (C-1 to C-7)
  const cabinPositions = [
    { x: 100, y: 320 }, { x: 220, y: 320 }, { x: 340, y: 320 },
    { x: 460, y: 320 }, { x: 580, y: 320 }, { x: 700, y: 320 },
    { x: 820, y: 320 },
  ];
  for (let i = 1; i <= 7; i++) {
    seats.push({
      id: `F${floorId}-CB-${i}`,
      type: SEAT_TYPES.CABIN,
      label: `C-${i}`,
      status: Math.random() > 0.5 ? 'available' : 'booked',
      position: cabinPositions[i - 1],
    });
  }
  
  // 6 Manager Cabins
  for (let i = 1; i <= 6; i++) {
    seats.push({
      id: `F${floorId}-MG-${i}`,
      type: SEAT_TYPES.MANAGER,
      label: `MG-${i}`,
      status: Math.random() > 0.6 ? 'available' : 'booked',
      position: { x: 100 + (i - 1) * 140, y: 440 },
    });
  }
  
  // 1 Meeting Room
  seats.push({
    id: `F${floorId}-MR-1`,
    type: SEAT_TYPES.MEETING,
    label: 'Meeting Room',
    status: Math.random() > 0.5 ? 'available' : 'booked',
    position: { x: 750, y: 100 },
  });
  
  // 2 Conference Rooms
  seats.push({
    id: `F${floorId}-CR-A`,
    type: SEAT_TYPES.CONFERENCE,
    label: 'Conference A',
    status: Math.random() > 0.5 ? 'available' : 'booked',
    position: { x: 750, y: 200 },
  });
  seats.push({
    id: `F${floorId}-CR-B`,
    type: SEAT_TYPES.CONFERENCE,
    label: 'Conference B',
    status: 'available',
    position: { x: 900, y: 200 },
  });
  
  return seats;
}

export const floors = [
  {
    id: 1,
    name: 'Floor 1',
    subtitle: 'Ground Level — Reception & Open Workspace',
    totalSeats: 80,
    openSeats: 20,
    cabins: 7,
    managerCabins: 6,
    meetingRooms: 1,
    conferenceRooms: 2,
    amenities: ['Reception', 'Pantry', 'Lounge', 'High-Speed WiFi'],
    seats: generateSeats(1),
  },
  {
    id: 2,
    name: 'Floor 2',
    subtitle: 'Creative Hub — Collaborative Spaces',
    totalSeats: 80,
    openSeats: 20,
    cabins: 7,
    managerCabins: 6,
    meetingRooms: 1,
    conferenceRooms: 2,
    amenities: ['Breakout Area', 'Whiteboard Walls', 'Pantry', 'High-Speed WiFi'],
    seats: generateSeats(2),
  },
  {
    id: 3,
    name: 'Floor 3',
    subtitle: 'Focus Zone — Quiet Workspace',
    totalSeats: 80,
    openSeats: 20,
    cabins: 7,
    managerCabins: 6,
    meetingRooms: 1,
    conferenceRooms: 2,
    amenities: ['Silent Zone', 'Phone Booths', 'Pantry', 'High-Speed WiFi'],
    seats: generateSeats(3),
  },
  {
    id: 4,
    name: 'Floor 4',
    subtitle: 'Enterprise Suite — Premium Offices',
    totalSeats: 80,
    openSeats: 20,
    cabins: 7,
    managerCabins: 6,
    meetingRooms: 1,
    conferenceRooms: 2,
    amenities: ['Executive Lounge', 'Concierge', 'Pantry', 'High-Speed WiFi'],
    seats: generateSeats(4),
  },
  {
    id: 5,
    name: 'Floor 5',
    subtitle: 'Innovation Lab — Startup Ecosystem',
    totalSeats: 80,
    openSeats: 20,
    cabins: 7,
    managerCabins: 6,
    meetingRooms: 1,
    conferenceRooms: 2,
    amenities: ['Event Space', 'Pitch Room', 'Pantry', 'High-Speed WiFi'],
    seats: generateSeats(5),
  },
  {
    id: 6,
    name: 'Floor 6',
    subtitle: 'Skyline Level — Panoramic Views',
    totalSeats: 80,
    openSeats: 20,
    cabins: 7,
    managerCabins: 6,
    meetingRooms: 1,
    conferenceRooms: 2,
    amenities: ['Terrace Access', 'Sky Lounge', 'Pantry', 'High-Speed WiFi'],
    seats: generateSeats(6),
  },
];

export function getFloorById(id) {
  return floors.find(f => f.id === parseInt(id));
}

export function getFloorStats(floor) {
  const available = floor.seats.filter(s => s.status === 'available').length;
  const booked = floor.seats.filter(s => s.status === 'booked').length;
  const occupancy = Math.round((booked / floor.seats.length) * 100);
  return { available, booked, total: floor.seats.length, occupancy };
}

export function getSeatById(floorId, seatId) {
  const floor = getFloorById(floorId);
  if (!floor) return null;
  return floor.seats.find(s => s.id === seatId);
}

// Sample bookings for dashboard
export const sampleBookings = [
  {
    id: 'BK-001',
    seatId: 'F1-OS-3',
    seatLabel: 'Open Seat 3',
    floor: 'Floor 1',
    type: SEAT_TYPES.OPEN,
    date: '2026-02-12',
    startTime: '09:00',
    endTime: '18:00',
    status: 'confirmed',
    amount: 500,
  },
  {
    id: 'BK-002',
    seatId: 'F3-CR-A',
    seatLabel: 'Conference Room A',
    floor: 'Floor 3',
    type: SEAT_TYPES.CONFERENCE,
    date: '2026-02-13',
    startTime: '14:00',
    endTime: '16:00',
    status: 'upcoming',
    amount: 6000,
  },
  {
    id: 'BK-003',
    seatId: 'F2-CB-4',
    seatLabel: 'Cabin C-4',
    floor: 'Floor 2',
    type: SEAT_TYPES.CABIN,
    date: '2026-02-10',
    startTime: '09:00',
    endTime: '18:00',
    status: 'completed',
    amount: 2000,
  },
];
