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
  // Bangladesh (Expanded)
  { id: 1, country: "BD", category: "Speed", title: "Urban Speed Limit", description: "Maximum speed in urban areas is 60 km/h for passenger vehicles.", act: "Road Transport Act 2018", section: "Section 45", penalty: 500, penaltyCurrency: "BDT", penaltyUsd: 4.55, severity: "medium" },
  { id: 2, country: "BD", category: "Helmet", title: "Helmet Mandatory", description: "All motorcycle riders and passengers must wear ISI-marked helmets.", act: "Road Transport Act 2018", section: "Section 58", penalty: 300, penaltyCurrency: "BDT", penaltyUsd: 2.73, severity: "high" },
  { id: 3, country: "BD", category: "DUI", title: "Drunk Driving", description: "BAC limit is 0.05% for private vehicles. Jail and fine applicable.", act: "Road Transport Act 2018", section: "Section 62", penalty: 25000, penaltyCurrency: "BDT", penaltyUsd: 227.5, severity: "critical" },
  { id: 4, country: "BD", category: "Documents", title: "Unregistered Vehicle", description: "Driving a vehicle without registration is a major offense.", act: "Road Transport Act 2018", section: "Section 35", penalty: 50000, penaltyCurrency: "BDT", penaltyUsd: 455, severity: "critical" },
  { id: 5, country: "BD", category: "Phone", title: "Mobile Phone Use", description: "Handheld mobile devices prohibited while driving.", act: "Road Transport Act 2018", section: "Section 63", penalty: 1000, penaltyCurrency: "BDT", penaltyUsd: 9.1, severity: "high" },

  // Bhutan (Expanded)
  { id: 6, country: "BT", category: "Speed", title: "Highway Speed Limit", description: "Speed limit on highways is 80 km/h; 40 km/h in urban zones.", act: "RSTA Act 1999", section: "Section 32", penalty: 1000, penaltyCurrency: "BTN", penaltyUsd: 12, severity: "medium" },
  { id: 7, country: "BT", category: "Helmet", title: "Helmet Law", description: "Helmets mandatory for motorcycle riders and pillion riders.", act: "RSTA Act 1999", section: "Section 40", penalty: 500, penaltyCurrency: "BTN", penaltyUsd: 6, severity: "high" },
  { id: 8, country: "BT", category: "DUI", title: "Alcohol Prohibition", description: "Zero tolerance policy — any alcohol is a violation.", act: "RSTA Act 1999", section: "Section 55", penalty: 5000, penaltyCurrency: "BTN", penaltyUsd: 60, severity: "critical" },
  { id: 9, country: "BT", category: "Environment", title: "Anti-Littering", description: "Throwing trash out of a vehicle window is strictly prohibited in Bhutan.", act: "Environmental Act", section: "Section 12", penalty: 2000, penaltyCurrency: "BTN", penaltyUsd: 24, severity: "medium" },

  // India (Expanded)
  { id: 10, country: "IN", category: "Speed", title: "Speeding Fine", description: "Speed limit violation in urban/highway zones.", act: "Motor Vehicles Act 2019", section: "Section 183", penalty: 2000, penaltyCurrency: "INR", penaltyUsd: 24, severity: "medium" },
  { id: 11, country: "IN", category: "Helmet", title: "Helmet Mandatory", description: "Riders and pillion must wear ISI helmets. Fine: ₹1,000.", act: "Motor Vehicles Act 2019", section: "Section 129", penalty: 1000, penaltyCurrency: "INR", penaltyUsd: 12, severity: "high" },
  { id: 12, country: "IN", category: "DUI", title: "Drunk Driving", description: "BAC > 30mg/100ml. Jail up to 6 months and/or fine.", act: "Motor Vehicles Act 2019", section: "Section 185", penalty: 10000, penaltyCurrency: "INR", penaltyUsd: 120, severity: "critical" },
  { id: 13, country: "IN", category: "Seatbelt", title: "Seatbelt Law", description: "All occupants must wear seatbelts. Fine: ₹1,000.", act: "Motor Vehicles Act 2019", section: "Section 194B", penalty: 1000, penaltyCurrency: "INR", penaltyUsd: 12, severity: "medium" },
  { id: 14, country: "IN", category: "Phone", title: "Mobile Phone Use", description: "Handheld phone use: ₹5,000 fine.", act: "Motor Vehicles Act 2019", section: "Section 184", penalty: 5000, penaltyCurrency: "INR", penaltyUsd: 60, severity: "high" },
  { id: 15, country: "IN", category: "Emergency", title: "Emergency Vehicle Block", description: "Not giving way to Ambulance/Fire: ₹10,000 fine.", act: "Motor Vehicles Act 2019", section: "Section 194E", penalty: 10000, penaltyCurrency: "INR", penaltyUsd: 120, severity: "critical" },
  { id: 16, country: "IN", category: "Documents", title: "Driving without License", description: "Unlicensed driving: ₹5,000 fine.", act: "Motor Vehicles Act 2019", section: "Section 181", penalty: 5000, penaltyCurrency: "INR", penaltyUsd: 60, severity: "high" },
  { id: 17, country: "IN", category: "Safety", title: "Triple Riding", description: "Three people on a motorcycle is prohibited. Fine: ₹1,000.", act: "Motor Vehicles Act 2019", section: "Section 128", penalty: 1000, penaltyCurrency: "INR", penaltyUsd: 12, severity: "high" },
  { id: 18, country: "IN", category: "Safety", title: "Juvenile Offense", description: "Minor driving: Guardian responsible. Fine: ₹25,000 + Jail.", act: "Motor Vehicles Act 2019", section: "Section 199A", penalty: 25000, penaltyCurrency: "INR", penaltyUsd: 300, severity: "critical" },

  // Myanmar (Expanded)
  { id: 19, country: "MM", category: "Driving Side", title: "Right-Hand Traffic", description: "Myanmar drives on the RIGHT side. Use extreme caution.", act: "Motor Vehicle Law 2011", section: "Section 12", penalty: null, penaltyCurrency: "MMK", penaltyUsd: null, severity: "info" },
  { id: 20, country: "MM", category: "DUI", title: "Drunk Driving", description: "BAC limit is 0.08%. Heavy fines and jail.", act: "Motor Vehicle Law 2011", section: "Section 42", penalty: 100000, penaltyCurrency: "MMK", penaltyUsd: 48, severity: "critical" },
  { id: 21, country: "MM", category: "Speed", title: "Expressway Speed", description: "Speed limit on Yangon-Mandalay Expressway is 100 km/h.", act: "Motor Vehicle Law 2011", section: "Section 28", penalty: 50000, penaltyCurrency: "MMK", penaltyUsd: 24, severity: "medium" },

  // Nepal (Expanded)
  { id: 22, country: "NP", category: "DUI", title: "MAPASE (Drunk Driving)", description: "Nepal has a zero-tolerance 'MAPASE' rule. Even small alcohol leads to fine/jail.", act: "MVTM Act 1992", section: "Section 135", penalty: 10000, penaltyCurrency: "NPR", penaltyUsd: 75, severity: "critical" },
  { id: 23, country: "NP", category: "Helmet", title: "Helmet Mandatory", description: "Motorcycle helmet mandatory for rider. Pillion must also wear.", act: "MVTM Act 1992", section: "Section 146", penalty: 500, penaltyCurrency: "NPR", penaltyUsd: 3.75, severity: "high" },
  { id: 24, country: "NP", category: "Pollution", title: "No Horn Zone", description: "Honking in 'No Horn' zones (like Kathmandu) is a violation.", act: "MVTM Act 1992", section: "Section 112", penalty: 500, penaltyCurrency: "NPR", penaltyUsd: 3.75, severity: "medium" },

  // Sri Lanka (Expanded)
  { id: 25, country: "LK", category: "Speed", title: "Expressway Speed", description: "Speed limit on Southern Expressway is 110 km/h.", act: "Motor Traffic Act", section: "Section 119", penalty: 3000, penaltyCurrency: "LKR", penaltyUsd: 10.2, severity: "medium" },
  { id: 26, country: "LK", category: "DUI", title: "Drunk Driving", description: "Heavy fines and immediate license suspension for DUI.", act: "Motor Traffic Act", section: "Section 180", penalty: 25000, penaltyCurrency: "LKR", penaltyUsd: 85, severity: "critical" },

  // Thailand (Expanded)
  { id: 27, country: "TH", category: "Speed", title: "Motorway Speed", description: "Max speed on motorways is 120 km/h.", act: "Land Traffic Act 1979", section: "Section 67", penalty: 500, penaltyCurrency: "THB", penaltyUsd: 14, severity: "medium" },
  { id: 28, country: "TH", category: "Helmet", title: "Helmet Mandatory", description: "Helmet mandatory for both rider and passenger.", act: "Land Traffic Act 1979", section: "Section 122", penalty: 500, penaltyCurrency: "THB", penaltyUsd: 14, severity: "high" },
  { id: 29, country: "TH", category: "DUI", title: "Drunk Driving", description: "BAC limit 0.05%. Professional drivers limit 0.02%.", act: "Land Traffic Act 1979", section: "Section 43(2)", penalty: 15000, penaltyCurrency: "THB", penaltyUsd: 420, severity: "critical" },
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
  // India (Detailed)
  { id: "IN_SPEED", name: "Speeding", category: "Speed", country: "IN", baseFineMap: { two_wheeler: 2000, car: 2000, heavy_vehicle: 4000 }, surchargeRate: 0.1, courtFee: 500, legalSection: "Section 183, MVA 2019", paymentMethods: ["Online Portal", "Challan Counter"], severity: "medium" },
  { id: "IN_HELMET", name: "No Helmet", category: "Helmet", country: "IN", baseFineMap: { two_wheeler: 1000, car: 0, heavy_vehicle: 0 }, surchargeRate: 0.1, courtFee: 0, legalSection: "Section 129, MVA 2019", paymentMethods: ["Online Portal", "On-spot"], severity: "high" },
  { id: "IN_DUI", name: "Drunk Driving", category: "DUI", country: "IN", baseFineMap: { two_wheeler: 10000, car: 10000, heavy_vehicle: 15000 }, surchargeRate: 0.2, courtFee: 1000, legalSection: "Section 185, MVA 2019", paymentMethods: ["Court Only"], severity: "critical" },
  { id: "IN_EMERGENCY", name: "Blocking Ambulance", category: "Emergency", country: "IN", baseFineMap: { two_wheeler: 10000, car: 10000, heavy_vehicle: 10000 }, surchargeRate: 0.1, courtFee: 1000, legalSection: "Section 194E, MVA 2019", paymentMethods: ["Online Portal"], severity: "critical" },
  { id: "IN_JUVENILE", name: "Juvenile Driving", category: "Safety", country: "IN", baseFineMap: { two_wheeler: 25000, car: 25000, heavy_vehicle: 25000 }, surchargeRate: 0.5, courtFee: 5000, legalSection: "Section 199A, MVA 2019", paymentMethods: ["Court Only"], severity: "critical" },
  { id: "IN_SEATBELT", name: "No Seatbelt", category: "Seatbelt", country: "IN", baseFineMap: { two_wheeler: 0, car: 1000, heavy_vehicle: 1000 }, surchargeRate: 0.1, courtFee: 0, legalSection: "Section 194B, MVA 2019", paymentMethods: ["Online Portal"], severity: "medium" },
  { id: "IN_LICENSE", name: "No License", category: "Documents", country: "IN", baseFineMap: { two_wheeler: 5000, car: 5000, heavy_vehicle: 10000 }, surchargeRate: 0.1, courtFee: 500, legalSection: "Section 181, MVA 2019", paymentMethods: ["Court Portal"], severity: "high" },

  // Nepal (Detailed)
  { id: "NP_DUI", name: "Drunk Driving (MAPASE)", category: "DUI", country: "NP", baseFineMap: { two_wheeler: 10000, car: 10000, heavy_vehicle: 15000 }, surchargeRate: 0.2, courtFee: 1000, legalSection: "Section 135, MVTM 1992", paymentMethods: ["Bank Deposit", "Traffic Office"], severity: "critical" },
  { id: "NP_HELMET", name: "No Helmet", category: "Helmet", country: "NP", baseFineMap: { two_wheeler: 500, car: 0, heavy_vehicle: 0 }, surchargeRate: 0.1, courtFee: 0, legalSection: "Section 146, MVTM 1992", paymentMethods: ["Traffic Office"], severity: "high" },
  { id: "NP_HORN", name: "No Horn Zone Violation", category: "Pollution", country: "NP", baseFineMap: { two_wheeler: 500, car: 500, heavy_vehicle: 1000 }, surchargeRate: 0.1, courtFee: 0, legalSection: "Section 112, MVTM 1992", paymentMethods: ["Bank Deposit"], severity: "medium" },

  // Bangladesh (Detailed)
  { id: "BD_DUI", name: "Drunk Driving", category: "DUI", country: "BD", baseFineMap: { two_wheeler: 25000, car: 25000, heavy_vehicle: 50000 }, surchargeRate: 0.2, courtFee: 2000, legalSection: "Section 62, RTA 2018", paymentMethods: ["Court"], severity: "critical" },
  { id: "BD_REGISTRATION", name: "Unregistered Vehicle", category: "Documents", country: "BD", baseFineMap: { two_wheeler: 50000, car: 50000, heavy_vehicle: 100000 }, surchargeRate: 0.3, courtFee: 5000, legalSection: "Section 35, RTA 2018", paymentMethods: ["Bank"], severity: "critical" },

  // Thailand (Detailed)
  { id: "TH_DUI", name: "Drunk Driving", category: "DUI", country: "TH", baseFineMap: { two_wheeler: 15000, car: 15000, heavy_vehicle: 30000 }, surchargeRate: 0.2, courtFee: 1000, legalSection: "Section 43, LTA 1979", paymentMethods: ["Police Station", "ePayment"], severity: "critical" },
  { id: "TH_HELMET", name: "No Helmet", category: "Helmet", country: "TH", baseFineMap: { two_wheeler: 500, car: 0, heavy_vehicle: 0 }, surchargeRate: 0.1, courtFee: 0, legalSection: "Section 122, LTA 1979", paymentMethods: ["On-spot", "Police Station"], severity: "high" },
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
