export const COUNTRIES = [
  {
    code: "BD",
    name: "Bangladesh",
    flag: "🇧🇩",
    currency: "BDT",
    currencySymbol: "৳",
    drivingSide: "left",
    emergencyPolice: "999",
    emergencyAmbulance: "999",
    emergencyFire: "999",
    lawsCount: 320,
    languages: ["Bengali", "English"],
    usdRate: 0.0091,
  },
  {
    code: "BT",
    name: "Bhutan",
    flag: "🇧🇹",
    currency: "BTN",
    currencySymbol: "Nu.",
    drivingSide: "left",
    emergencyPolice: "113",
    emergencyAmbulance: "112",
    emergencyFire: "110",
    lawsCount: 180,
    languages: ["Dzongkha", "English"],
    usdRate: 0.012,
  },
  {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    currency: "INR",
    currencySymbol: "₹",
    drivingSide: "left",
    emergencyPolice: "100",
    emergencyAmbulance: "108",
    emergencyFire: "101",
    lawsCount: 580,
    languages: ["Hindi", "English", "Tamil", "Telugu", "Bengali"],
    usdRate: 0.012,
  },
  {
    code: "MM",
    name: "Myanmar",
    flag: "🇲🇲",
    currency: "MMK",
    currencySymbol: "K",
    drivingSide: "right",
    emergencyPolice: "199",
    emergencyAmbulance: "192",
    emergencyFire: "191",
    lawsCount: 290,
    languages: ["Burmese", "English"],
    usdRate: 0.00048,
  },
  {
    code: "NP",
    name: "Nepal",
    flag: "🇳🇵",
    currency: "NPR",
    currencySymbol: "रू",
    drivingSide: "left",
    emergencyPolice: "100",
    emergencyAmbulance: "102",
    emergencyFire: "101",
    lawsCount: 340,
    languages: ["Nepali", "English"],
    usdRate: 0.0075,
  },
  {
    code: "LK",
    name: "Sri Lanka",
    flag: "🇱🇰",
    currency: "LKR",
    currencySymbol: "Rs",
    drivingSide: "left",
    emergencyPolice: "119",
    emergencyAmbulance: "110",
    emergencyFire: "111",
    lawsCount: 360,
    languages: ["Sinhala", "Tamil", "English"],
    usdRate: 0.0034,
  },
  {
    code: "TH",
    name: "Thailand",
    flag: "🇹🇭",
    currency: "THB",
    currencySymbol: "฿",
    drivingSide: "left",
    emergencyPolice: "191",
    emergencyAmbulance: "1669",
    emergencyFire: "199",
    lawsCount: 430,
    languages: ["Thai", "English"],
    usdRate: 0.028,
  },
];

export const TRAFFIC_LAWS: Array<{
  id: number;
  country: string;
  category: string;
  title: string;
  description: string;
  act: string;
  section: string;
  penalty: number | null;
  penaltyCurrency: string;
  penaltyUsd: number | null;
  severity: string;
}> = [
  // Bangladesh
  { id: 1, country: "BD", category: "Speed", title: "Urban Speed Limit", description: "Maximum speed in urban areas is 60 km/h for passenger vehicles.", act: "Road Transport Act 2018", section: "Section 45", penalty: 500, penaltyCurrency: "BDT", penaltyUsd: 4.55, severity: "medium" },
  { id: 2, country: "BD", category: "Helmet", title: "Helmet Mandatory for Motorcyclists", description: "All motorcycle riders and passengers must wear ISI-marked helmets at all times.", act: "Road Transport Act 2018", section: "Section 58", penalty: 300, penaltyCurrency: "BDT", penaltyUsd: 2.73, severity: "high" },
  { id: 3, country: "BD", category: "DUI", title: "Drunk Driving Prohibition", description: "Blood alcohol concentration (BAC) limit is 0.05% for private vehicles.", act: "Road Transport Act 2018", section: "Section 62", penalty: 25000, penaltyCurrency: "BDT", penaltyUsd: 227.5, severity: "critical" },
  { id: 4, country: "BD", category: "Seatbelt", title: "Seatbelt Requirement", description: "All occupants in front seats must wear seatbelts; rear seatbelts mandatory where fitted.", act: "Road Transport Act 2018", section: "Section 55", penalty: 500, penaltyCurrency: "BDT", penaltyUsd: 4.55, severity: "medium" },
  { id: 5, country: "BD", category: "Phone", title: "Mobile Phone Use While Driving", description: "Use of handheld mobile devices while driving is strictly prohibited.", act: "Road Transport Act 2018", section: "Section 63", penalty: 1000, penaltyCurrency: "BDT", penaltyUsd: 9.1, severity: "high" },

  // Bhutan
  { id: 6, country: "BT", category: "Speed", title: "National Highway Speed Limit", description: "Speed limit on national highways is 80 km/h; 40 km/h in towns.", act: "Road Safety and Transport Act 1999", section: "Section 32", penalty: 1000, penaltyCurrency: "BTN", penaltyUsd: 12, severity: "medium" },
  { id: 7, country: "BT", category: "Helmet", title: "Helmet Law", description: "Helmets are compulsory for motorcycle riders and pillion riders.", act: "Road Safety and Transport Act 1999", section: "Section 40", penalty: 500, penaltyCurrency: "BTN", penaltyUsd: 6, severity: "high" },
  { id: 8, country: "BT", category: "DUI", title: "Alcohol and Driving", description: "Zero tolerance policy — any detectable alcohol while driving is an offence.", act: "Road Safety and Transport Act 1999", section: "Section 55", penalty: 5000, penaltyCurrency: "BTN", penaltyUsd: 60, severity: "critical" },
  { id: 9, country: "BT", category: "Seatbelt", title: "Seatbelt Mandate", description: "Seatbelts are mandatory for all occupants of motor vehicles.", act: "Road Safety and Transport Act 1999", section: "Section 38", penalty: 500, penaltyCurrency: "BTN", penaltyUsd: 6, severity: "medium" },

  // India
  { id: 10, country: "IN", category: "Speed", title: "Urban Speed Limit", description: "Speed limit is 50 km/h in urban areas and 100 km/h on expressways.", act: "Motor Vehicles Act 1988 (Amendment 2019)", section: "Section 183", penalty: 2000, penaltyCurrency: "INR", penaltyUsd: 24, severity: "medium" },
  { id: 11, country: "IN", category: "Helmet", title: "Helmet Mandatory", description: "Two-wheeler riders and pillion riders must wear ISI helmets. Fine for non-compliance: ₹1,000.", act: "Motor Vehicles Act 1988 (Amendment 2019)", section: "Section 129", penalty: 1000, penaltyCurrency: "INR", penaltyUsd: 12, severity: "high" },
  { id: 12, country: "IN", category: "DUI", title: "Drunk Driving", description: "BAC limit of 30 mg per 100 ml of blood. First offence: ₹10,000 or 6 months imprisonment.", act: "Motor Vehicles Act 1988 (Amendment 2019)", section: "Section 185", penalty: 10000, penaltyCurrency: "INR", penaltyUsd: 120, severity: "critical" },
  { id: 13, country: "IN", category: "Seatbelt", title: "Seatbelt Law", description: "All vehicle occupants must wear seatbelts. Fine: ₹1,000.", act: "Motor Vehicles Act 1988 (Amendment 2019)", section: "Section 194B", penalty: 1000, penaltyCurrency: "INR", penaltyUsd: 12, severity: "medium" },
  { id: 14, country: "IN", category: "Phone", title: "Mobile Phone Prohibition", description: "Use of handheld devices while driving: ₹5,000 fine.", act: "Motor Vehicles Act 1988 (Amendment 2019)", section: "Section 184", penalty: 5000, penaltyCurrency: "INR", penaltyUsd: 60, severity: "high" },
  { id: 15, country: "IN", category: "Documents", title: "Driving Without Licence", description: "Driving without a valid licence: ₹5,000 fine.", act: "Motor Vehicles Act 1988 (Amendment 2019)", section: "Section 181", penalty: 5000, penaltyCurrency: "INR", penaltyUsd: 60, severity: "high" },

  // Myanmar
  { id: 16, country: "MM", category: "Speed", title: "Speed Limits", description: "Urban roads: 40 km/h. Highways: 80 km/h. Expressways: 100 km/h.", act: "Motor Vehicle Law 2011", section: "Section 28", penalty: 50000, penaltyCurrency: "MMK", penaltyUsd: 24, severity: "medium" },
  { id: 17, country: "MM", category: "DUI", title: "Drunk Driving", description: "BAC limit is 0.08%. Penalties include license suspension and imprisonment.", act: "Motor Vehicle Law 2011", section: "Section 42", penalty: 100000, penaltyCurrency: "MMK", penaltyUsd: 48, severity: "critical" },
  { id: 18, country: "MM", category: "Driving Side", title: "Right-Hand Traffic", description: "Myanmar drives on the RIGHT side of the road — opposite to neighboring India/Thailand.", act: "Motor Vehicle Law 2011", section: "Section 12", penalty: null, penaltyCurrency: "MMK", penaltyUsd: null, severity: "info" },
  { id: 19, country: "MM", category: "Helmet", title: "Motorcycle Helmet Law", description: "Helmets are mandatory for motorcycle riders on designated roads.", act: "Motor Vehicle Law 2011", section: "Section 35", penalty: 30000, penaltyCurrency: "MMK", penaltyUsd: 14.4, severity: "high" },

  // Nepal
  { id: 20, country: "NP", category: "Helmet", title: "Helmet Law", description: "Helmets mandatory for all motorcyclists. Fine: NPR 500.", act: "Motor Vehicles and Transport Management Act 1992", section: "Section 146", penalty: 500, penaltyCurrency: "NPR", penaltyUsd: 3.75, severity: "high" },
  { id: 21, country: "NP", category: "Speed", title: "Speed Limits", description: "Urban: 40 km/h. Highway: 80 km/h. Kathmandu Valley: 50 km/h max.", act: "Motor Vehicles and Transport Management Act 1992", section: "Section 120", penalty: 1000, penaltyCurrency: "NPR", penaltyUsd: 7.5, severity: "medium" },
  { id: 22, country: "NP", category: "DUI", title: "Drunk Driving", description: "BAC limit: 0.03%. Strict enforcement — any alcohol detectable can lead to arrest.", act: "Motor Vehicles and Transport Management Act 1992", section: "Section 135", penalty: 10000, penaltyCurrency: "NPR", penaltyUsd: 75, severity: "critical" },
  { id: 23, country: "NP", category: "Seatbelt", title: "Seatbelt Requirement", description: "Front seat occupants must wear seatbelts.", act: "Motor Vehicles and Transport Management Act 1992", section: "Section 142", penalty: 500, penaltyCurrency: "NPR", penaltyUsd: 3.75, severity: "medium" },

  // Sri Lanka
  { id: 24, country: "LK", category: "Speed", title: "General Speed Limits", description: "Urban areas: 50 km/h. Highways: 100 km/h. Expressways: 110 km/h.", act: "Motor Traffic Act (Chapter 203)", section: "Section 119", penalty: 3000, penaltyCurrency: "LKR", penaltyUsd: 10.2, severity: "medium" },
  { id: 25, country: "LK", category: "Helmet", title: "Helmet Compulsory", description: "All motorcycle riders must wear helmets. Fine: LKR 2,500.", act: "Motor Traffic Act (Chapter 203)", section: "Section 128", penalty: 2500, penaltyCurrency: "LKR", penaltyUsd: 8.5, severity: "high" },
  { id: 26, country: "LK", category: "DUI", title: "Drunk Driving", description: "BAC limit: 0.08%. Penalties include fines up to LKR 25,000 and suspension.", act: "Motor Traffic Act (Chapter 203)", section: "Section 180", penalty: 25000, penaltyCurrency: "LKR", penaltyUsd: 85, severity: "critical" },
  { id: 27, country: "LK", category: "Seatbelt", title: "Seatbelt Law", description: "Mandatory for all occupants in motor vehicles.", act: "Motor Traffic Act (Chapter 203)", section: "Section 122", penalty: 1500, penaltyCurrency: "LKR", penaltyUsd: 5.1, severity: "medium" },

  // Thailand
  { id: 28, country: "TH", category: "Speed", title: "Speed Limits", description: "Urban roads: 80 km/h. Rural roads: 90 km/h. Motorways: 120 km/h.", act: "Land Traffic Act B.E. 2522 (1979)", section: "Section 67", penalty: 500, penaltyCurrency: "THB", penaltyUsd: 14, severity: "medium" },
  { id: 29, country: "TH", category: "Helmet", title: "Helmet Law", description: "Helmets mandatory for motorcycle riders and passengers. Fine: THB 500.", act: "Land Traffic Act B.E. 2522 (1979)", section: "Section 122", penalty: 500, penaltyCurrency: "THB", penaltyUsd: 14, severity: "high" },
  { id: 30, country: "TH", category: "DUI", title: "Drunk Driving", description: "BAC limit: 0.05% (0.02% for professional drivers). Fine: THB 15,000–30,000.", act: "Land Traffic Act B.E. 2522 (1979)", section: "Section 43(2)", penalty: 15000, penaltyCurrency: "THB", penaltyUsd: 420, severity: "critical" },
  { id: 31, country: "TH", category: "Seatbelt", title: "Seatbelt Requirement", description: "All occupants must wear seatbelts on all roads.", act: "Land Traffic Act B.E. 2522 (1979)", section: "Section 123", penalty: 500, penaltyCurrency: "THB", penaltyUsd: 14, severity: "medium" },
  { id: 32, country: "TH", category: "Phone", title: "Mobile Phone While Driving", description: "Using a handheld phone while driving is banned. Fine: THB 400.", act: "Land Traffic Act B.E. 2522 (1979)", section: "Section 43(10)", penalty: 400, penaltyCurrency: "THB", penaltyUsd: 11.2, severity: "high" },
];

export const VIOLATIONS: Array<{
  id: string;
  name: string;
  category: string;
  country: string;
  baseFineMap: Record<string, number>;
  surchargeRate: number;
  courtFee: number;
  legalSection: string;
  paymentMethods: string[];
  severity: string;
}> = [
  // India
  { id: "IN_SPEED", name: "Speeding", category: "Speed", country: "IN", baseFineMap: { two_wheeler: 2000, car: 2000, heavy_vehicle: 4000 }, surchargeRate: 0.1, courtFee: 500, legalSection: "Section 183, Motor Vehicles Act 2019", paymentMethods: ["Online - Parivahan Portal", "Challan Counter", "Traffic Police App"], severity: "medium" },
  { id: "IN_HELMET", name: "No Helmet", category: "Helmet", country: "IN", baseFineMap: { two_wheeler: 1000, car: 0, heavy_vehicle: 0 }, surchargeRate: 0.1, courtFee: 0, legalSection: "Section 129, Motor Vehicles Act 2019", paymentMethods: ["Online - Parivahan Portal", "On-spot Payment"], severity: "high" },
  { id: "IN_DUI", name: "Drunk Driving (DUI)", category: "DUI", country: "IN", baseFineMap: { two_wheeler: 10000, car: 10000, heavy_vehicle: 15000 }, surchargeRate: 0.2, courtFee: 1000, legalSection: "Section 185, Motor Vehicles Act 2019", paymentMethods: ["Court Payment", "Bank Challan"], severity: "critical" },
  { id: "IN_SEATBELT", name: "No Seatbelt", category: "Seatbelt", country: "IN", baseFineMap: { two_wheeler: 0, car: 1000, heavy_vehicle: 1000 }, surchargeRate: 0.1, courtFee: 0, legalSection: "Section 194B, Motor Vehicles Act 2019", paymentMethods: ["Online - Parivahan Portal", "On-spot Payment"], severity: "medium" },
  { id: "IN_PHONE", name: "Mobile Phone While Driving", category: "Phone", country: "IN", baseFineMap: { two_wheeler: 5000, car: 5000, heavy_vehicle: 5000 }, surchargeRate: 0.1, courtFee: 0, legalSection: "Section 184, Motor Vehicles Act 2019", paymentMethods: ["Online - Parivahan Portal", "Challan Counter"], severity: "high" },
  { id: "IN_NO_LICENSE", name: "Driving Without Licence", category: "Documents", country: "IN", baseFineMap: { two_wheeler: 5000, car: 5000, heavy_vehicle: 10000 }, surchargeRate: 0.1, courtFee: 500, legalSection: "Section 181, Motor Vehicles Act 2019", paymentMethods: ["Court Payment"], severity: "high" },

  // Nepal
  { id: "NP_HELMET", name: "No Helmet", category: "Helmet", country: "NP", baseFineMap: { two_wheeler: 500, car: 0, heavy_vehicle: 0 }, surchargeRate: 0.15, courtFee: 100, legalSection: "Section 146, Motor Vehicles Act 1992", paymentMethods: ["Traffic Police Office", "Bank Deposit", "Online Portal"], severity: "high" },
  { id: "NP_SPEED", name: "Speeding", category: "Speed", country: "NP", baseFineMap: { two_wheeler: 1000, car: 1000, heavy_vehicle: 2000 }, surchargeRate: 0.15, courtFee: 200, legalSection: "Section 120, Motor Vehicles Act 1992", paymentMethods: ["Traffic Police Office", "Bank Deposit"], severity: "medium" },
  { id: "NP_DUI", name: "Drunk Driving", category: "DUI", country: "NP", baseFineMap: { two_wheeler: 10000, car: 10000, heavy_vehicle: 15000 }, surchargeRate: 0.2, courtFee: 1000, legalSection: "Section 135, Motor Vehicles Act 1992", paymentMethods: ["Court Payment", "Bank Deposit"], severity: "critical" },

  // Bangladesh
  { id: "BD_SPEED", name: "Speeding", category: "Speed", country: "BD", baseFineMap: { two_wheeler: 500, car: 500, heavy_vehicle: 1000 }, surchargeRate: 0.1, courtFee: 100, legalSection: "Section 45, Road Transport Act 2018", paymentMethods: ["BRTA Office", "Online Payment", "Bank"], severity: "medium" },
  { id: "BD_HELMET", name: "No Helmet", category: "Helmet", country: "BD", baseFineMap: { two_wheeler: 300, car: 0, heavy_vehicle: 0 }, surchargeRate: 0.1, courtFee: 0, legalSection: "Section 58, Road Transport Act 2018", paymentMethods: ["On-spot Payment", "BRTA Office"], severity: "high" },
  { id: "BD_DUI", name: "Drunk Driving", category: "DUI", country: "BD", baseFineMap: { two_wheeler: 25000, car: 25000, heavy_vehicle: 50000 }, surchargeRate: 0.2, courtFee: 2000, legalSection: "Section 62, Road Transport Act 2018", paymentMethods: ["Court Payment"], severity: "critical" },

  // Thailand
  { id: "TH_SPEED", name: "Speeding", category: "Speed", country: "TH", baseFineMap: { two_wheeler: 500, car: 500, heavy_vehicle: 1000 }, surchargeRate: 0.1, courtFee: 100, legalSection: "Section 67, Land Traffic Act 1979", paymentMethods: ["Online - ePayment", "Police Station", "Thailand Post"], severity: "medium" },
  { id: "TH_HELMET", name: "No Helmet", category: "Helmet", country: "TH", baseFineMap: { two_wheeler: 500, car: 0, heavy_vehicle: 0 }, surchargeRate: 0.1, courtFee: 0, legalSection: "Section 122, Land Traffic Act 1979", paymentMethods: ["On-spot Payment", "Police Station"], severity: "high" },
  { id: "TH_DUI", name: "Drunk Driving", category: "DUI", country: "TH", baseFineMap: { two_wheeler: 15000, car: 15000, heavy_vehicle: 30000 }, surchargeRate: 0.2, courtFee: 1000, legalSection: "Section 43(2), Land Traffic Act 1979", paymentMethods: ["Court Payment", "Police Station"], severity: "critical" },
  { id: "TH_PHONE", name: "Mobile Phone While Driving", category: "Phone", country: "TH", baseFineMap: { two_wheeler: 400, car: 400, heavy_vehicle: 400 }, surchargeRate: 0.1, courtFee: 0, legalSection: "Section 43(10), Land Traffic Act 1979", paymentMethods: ["On-spot Payment", "Police Station"], severity: "high" },

  // Sri Lanka
  { id: "LK_SPEED", name: "Speeding", category: "Speed", country: "LK", baseFineMap: { two_wheeler: 3000, car: 3000, heavy_vehicle: 5000 }, surchargeRate: 0.1, courtFee: 500, legalSection: "Section 119, Motor Traffic Act", paymentMethods: ["Police Station", "Bank Payment", "Online"], severity: "medium" },
  { id: "LK_HELMET", name: "No Helmet", category: "Helmet", country: "LK", baseFineMap: { two_wheeler: 2500, car: 0, heavy_vehicle: 0 }, surchargeRate: 0.1, courtFee: 0, legalSection: "Section 128, Motor Traffic Act", paymentMethods: ["Police Station", "On-spot"], severity: "high" },
  { id: "LK_DUI", name: "Drunk Driving", category: "DUI", country: "LK", baseFineMap: { two_wheeler: 25000, car: 25000, heavy_vehicle: 50000 }, surchargeRate: 0.15, courtFee: 2000, legalSection: "Section 180, Motor Traffic Act", paymentMethods: ["Court Payment", "Bank"], severity: "critical" },

  // Bhutan
  { id: "BT_SPEED", name: "Speeding", category: "Speed", country: "BT", baseFineMap: { two_wheeler: 1000, car: 1000, heavy_vehicle: 2000 }, surchargeRate: 0.1, courtFee: 200, legalSection: "Section 32, Road Safety and Transport Act 1999", paymentMethods: ["RSTA Office", "Bank Deposit"], severity: "medium" },
  { id: "BT_HELMET", name: "No Helmet", category: "Helmet", country: "BT", baseFineMap: { two_wheeler: 500, car: 0, heavy_vehicle: 0 }, surchargeRate: 0.1, courtFee: 0, legalSection: "Section 40, Road Safety and Transport Act 1999", paymentMethods: ["RSTA Office", "On-spot"], severity: "high" },
  { id: "BT_DUI", name: "Drunk Driving", category: "DUI", country: "BT", baseFineMap: { two_wheeler: 5000, car: 5000, heavy_vehicle: 10000 }, surchargeRate: 0.2, courtFee: 500, legalSection: "Section 55, Road Safety and Transport Act 1999", paymentMethods: ["Court Payment", "RSTA Office"], severity: "critical" },

  // Myanmar
  { id: "MM_SPEED", name: "Speeding", category: "Speed", country: "MM", baseFineMap: { two_wheeler: 50000, car: 50000, heavy_vehicle: 100000 }, surchargeRate: 0.1, courtFee: 5000, legalSection: "Section 28, Motor Vehicle Law 2011", paymentMethods: ["Police Station", "Bank Counter"], severity: "medium" },
  { id: "MM_HELMET", name: "No Helmet", category: "Helmet", country: "MM", baseFineMap: { two_wheeler: 30000, car: 0, heavy_vehicle: 0 }, surchargeRate: 0.1, courtFee: 0, legalSection: "Section 35, Motor Vehicle Law 2011", paymentMethods: ["On-spot Payment", "Police Station"], severity: "high" },
  { id: "MM_DUI", name: "Drunk Driving", category: "DUI", country: "MM", baseFineMap: { two_wheeler: 100000, car: 100000, heavy_vehicle: 200000 }, surchargeRate: 0.2, courtFee: 10000, legalSection: "Section 42, Motor Vehicle Law 2011", paymentMethods: ["Court Payment"], severity: "critical" },
];

export const EMERGENCY_DATA: Record<string, {
  police: string;
  ambulance: string;
  fire: string;
  trafficPolice: string | null;
  coastGuard: string | null;
  firChecklist: string[];
  insuranceTips: string[];
}> = {
  BD: {
    police: "999",
    ambulance: "999",
    fire: "999",
    trafficPolice: "999",
    coastGuard: "01713-000212",
    firChecklist: [
      "Call 999 immediately and report the accident location",
      "Note the date, time, and exact location of the accident",
      "Collect names and contact info of all parties involved",
      "Take photos of all vehicles, damage, and the scene",
      "Collect witness names and contact numbers",
      "Note the registration numbers of all vehicles",
      "Do not move vehicles unless causing obstruction",
      "Obtain a copy of the FIR from the police station",
    ],
    insuranceTips: [
      "Notify your insurance company within 24 hours",
      "Provide the FIR copy to your insurance agent",
      "Collect all repair estimates in writing",
      "Keep all medical receipts for injury claims",
      "Contact IDRA (Insurance Development & Regulatory Authority) for disputes",
    ],
  },
  BT: {
    police: "113",
    ambulance: "112",
    fire: "110",
    trafficPolice: "113",
    coastGuard: null,
    firChecklist: [
      "Call 113 (Police) immediately",
      "Stay at the scene until police arrive",
      "Note location, time, and weather conditions",
      "Exchange details with other drivers (name, licence, insurance)",
      "Photograph all damage and vehicle positions",
      "Report to nearest police station within 24 hours",
      "Obtain a copy of the accident report from police",
    ],
    insuranceTips: [
      "Contact Royal Insurance Corporation of Bhutan (RICB)",
      "File claim within 7 days of the accident",
      "Provide accident report, photos, and repair estimates",
      "Third-party insurance is mandatory in Bhutan",
    ],
  },
  IN: {
    police: "100",
    ambulance: "108",
    fire: "101",
    trafficPolice: "103",
    coastGuard: "1554",
    firChecklist: [
      "Call 100 (Police) or 108 (Ambulance) immediately",
      "Note the FIR number when reporting to police",
      "Collect name, address, and DL number of other driver",
      "Note vehicle registration numbers and insurance details",
      "Take photographs of the accident scene",
      "Get contact details from witnesses",
      "Report to nearest police station and file FIR",
      "Obtain a copy of FIR — required for insurance claim",
      "For hit-and-run: report immediately — MACT compensation available",
    ],
    insuranceTips: [
      "Inform your insurer immediately (within 24-48 hours)",
      "File for Cashless Repair at network garages",
      "Motor Accident Claims Tribunal (MACT) for injury compensation",
      "Solatium Scheme for hit-and-run victims",
      "Contact IRDAI (1800-4254-732) for insurance complaints",
    ],
  },
  MM: {
    police: "199",
    ambulance: "192",
    fire: "191",
    trafficPolice: "199",
    coastGuard: null,
    firChecklist: [
      "Call 199 (Police) or 192 (Ambulance)",
      "Do not move injured persons unless in immediate danger",
      "Note the accident location with landmarks",
      "Collect details of all vehicles and drivers involved",
      "Wait for police to arrive and file an official report",
      "Note: Myanmar drives on the RIGHT — alert if crossing from left-drive country",
    ],
    insuranceTips: [
      "Vehicle insurance is mandatory under Motor Vehicle Law",
      "Contact Myanma Insurance for claims",
      "File claim with supporting police report and photos",
      "Foreign tourists: contact your travel insurance provider",
    ],
  },
  NP: {
    police: "100",
    ambulance: "102",
    fire: "101",
    trafficPolice: "103",
    coastGuard: null,
    firChecklist: [
      "Call 100 (Police) or 102 (Ambulance) immediately",
      "Secure the scene and provide first aid if trained",
      "Note the accident time, date, and location precisely",
      "Collect names, addresses, and licence numbers",
      "Take photos of all vehicles and damages",
      "Get witness statements and contact details",
      "Report to nearest police post within 24 hours",
      "Obtain a certified copy of the accident report",
    ],
    insuranceTips: [
      "Notify insurance company within 24 hours",
      "File claim with accident report and police FIR",
      "Beinsure (Beema Samiti) regulates insurance in Nepal",
      "Third-party liability insurance is mandatory",
      "Contact Beema Samiti (01-4229113) for disputes",
    ],
  },
  LK: {
    police: "119",
    ambulance: "110",
    fire: "111",
    trafficPolice: "011-2691444",
    coastGuard: "011-2423710",
    firChecklist: [
      "Call 119 (Police) or 110 (Ambulance) immediately",
      "Attend to the injured — Sri Lanka has Good Samaritan protections",
      "Note date, time, road, and direction of travel",
      "Collect details of all parties: name, NIC, licence, insurance",
      "Take photos of vehicles, damage, and road markings",
      "Obtain witness information",
      "Report to nearest police station and obtain B report",
      "B Report is essential for insurance claims in Sri Lanka",
    ],
    insuranceTips: [
      "All vehicles must have valid insurance under Motor Traffic Act",
      "Contact your insurer within 24 hours",
      "Obtain B Report from police for claim processing",
      "Insurance Ombudsman Sri Lanka for disputes",
      "IBSL (Insurance Board of Sri Lanka): 011-2396000",
    ],
  },
  TH: {
    police: "191",
    ambulance: "1669",
    fire: "199",
    trafficPolice: "1197",
    coastGuard: "1196",
    firChecklist: [
      "Call 191 (Police) or 1669 (Ambulance) immediately",
      "Do not move vehicles — Thai law requires scene preservation",
      "Exchange name, address, and vehicle details with other driver",
      "Take photos of vehicles, positions, and damage",
      "Collect witness details",
      "Obtain police accident report (Por Ror Bor)",
      "Report must be filed for insurance claims",
      "Tourists: TAT hotline 1672 available in multiple languages",
    ],
    insuranceTips: [
      "Compulsory Motor Insurance (CMI/Por Ror Bor) covers basic injury",
      "Voluntary insurance covers property damage",
      "File claim with police accident report",
      "OIC (Office of Insurance Commission) handles disputes: 1186",
      "For tourist accidents: contact Tourism Authority of Thailand 1672",
    ],
  },
};
