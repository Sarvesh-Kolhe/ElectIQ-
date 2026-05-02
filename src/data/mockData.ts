export interface Candidate {
  id: string;
  name: string;
  party: string;
  partySymbol: string;
  role: string;
  avatar: string;
  vision: string;
  state: string;
}

export const INDIAN_STATES = [
  'Maharashtra', 'Uttar Pradesh', 'West Bengal', 'Karnataka', 'Tamil Nadu', 
  'Delhi', 'Gujarat', 'Rajasthan', 'Kerala', 'Punjab'
];

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: '1',
    name: 'Anjali Sharma',
    party: 'Bharatiya Janata Party (BJP)',
    partySymbol: '🪷',
    role: 'Member of Parliament',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali',
    vision: 'Advancing digital infrastructure and renewable energy initiatives in Maharashtra.',
    state: 'Maharashtra'
  },
  {
    id: '2',
    name: 'Rahul Deshmukh',
    party: 'Indian National Congress (INC)',
    partySymbol: '✋',
    role: 'Legislative Assembly Member',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
    vision: 'Strengthening rural education systems and healthcare accessibility in Karnataka.',
    state: 'Karnataka'
  },
  {
    id: '3',
    name: 'Priya Verma',
    party: 'Aam Aadmi Party (AAP)',
    partySymbol: '🧹',
    role: 'Mayor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    vision: 'Modernizing urban transport and ensuring transparent governance in Delhi.',
    state: 'Delhi'
  }
];

export interface PollingStation {
  id: string;
  name: string;
  address: string;
  hours: string;
  distance: string;
  state: string;
  lat: number;
  lng: number;
}

export const MOCK_STATIONS: PollingStation[] = [
  {
    id: 's1',
    name: 'St. Xavier School',
    address: 'Andheri West, Mumbai',
    hours: '7:00 AM - 6:00 PM',
    distance: '1.2 km',
    state: 'Maharashtra',
    lat: 19.1136,
    lng: 72.8697
  },
  {
    id: 's2',
    name: 'Civic Center Hall',
    address: 'Saket, New Delhi',
    hours: '7:00 AM - 6:00 PM',
    distance: '0.5 km',
    state: 'Delhi',
    lat: 28.5244,
    lng: 77.2167
  },
  {
    id: 's3',
    name: 'Government ITI',
    address: 'Indira Nagar, Bengaluru',
    hours: '7:00 AM - 6:00 PM',
    distance: '2.1 km',
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946
  },
  {
    id: 's4',
    name: 'Vidhan Bhavan',
    address: 'Nariman Point, Mumbai',
    hours: '7:00 AM - 6:00 PM',
    distance: '0.2 km',
    state: 'Maharashtra',
    lat: 18.9269,
    lng: 72.8231
  },
  {
    id: 's5',
    name: 'Town Hall',
    address: 'Jaipur, Rajasthan',
    hours: '7:00 AM - 6:00 PM',
    distance: '1.5 km',
    state: 'Rajasthan',
    lat: 26.9124,
    lng: 75.7873
  },
  {
    id: 's6',
    name: 'Public Library',
    address: 'Ahmedabad, Gujarat',
    hours: '7:00 AM - 6:00 PM',
    distance: '0.8 km',
    state: 'Gujarat',
    lat: 23.0225,
    lng: 72.5714
  }
];

export const STATE_COORDINATES: Record<string, [number, number]> = {
  'Maharashtra': [19.7507, 75.7139],
  'Delhi': [28.6139, 77.2090],
  'Karnataka': [15.3173, 75.7139],
  'Uttar Pradesh': [26.8467, 80.9462],
  'West Bengal': [22.9868, 87.8550],
  'Tamil Nadu': [11.1271, 78.6569],
  'Gujarat': [22.2587, 71.1924],
  'Rajasthan': [27.0238, 74.2179],
  'Kerala': [10.8505, 76.2711],
  'Punjab': [31.1471, 75.3412]
};

export interface ElectionSchedule {
  state: string;
  phase: string;
  date: string;
  label: string;
  status: 'upcoming' | 'completed' | 'ongoing';
}

export const ELECTION_SCHEDULES: ElectionSchedule[] = [
  { state: 'Maharashtra', phase: 'Phase 1', date: 'Oct 15, 2026', label: 'Vidhan Sabha Elections', status: 'upcoming' },
  { state: 'Uttar Pradesh', phase: 'Phase 4', date: 'Feb 10, 2027', label: 'General Assembly', status: 'upcoming' },
  { state: 'Delhi', phase: 'Single Phase', date: 'Jan 20, 2025', label: 'State Assembly', status: 'upcoming' },
  { state: 'Karnataka', phase: 'Phase 2', date: 'May 05, 2026', label: 'Lok Sabha Phase', status: 'upcoming' }
];

export const ECI_RESOURCES = [
  { title: 'NVSP Portal', link: 'https://www.nvsp.in/', desc: 'National Voter Service Portal for registration and corrections.' },
  { title: 'Voter Helpline App', link: 'https://eci.gov.in/voter-helpline/', desc: 'Official ECI app for voters.' },
  { title: 'Know Your Candidate (KYC)', link: 'https://eci.gov.in/kyc/', desc: 'Access criminal antecedents and assets of candidates.' }
];
