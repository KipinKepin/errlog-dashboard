// --- OVERSEAS BRANCH DEFINITIONS ---
export const OVERSEAS_BRANCHES = [
  {
    id: "Singapura",
    name: "Singapura",
    shortName: "Singapura",
    city: "Singapura",
    country: "Singapura",
    code: "SGP",
    timezone: "SGT (UTC+8)",
    lat: 1.3521,
    lng: 103.8198,
    regionKey: "singapura",
  },
  {
    id: "Hong Kong",
    name: "Hong Kong",
    shortName: "Hong Kong",
    city: "Hong Kong",
    country: "Hong Kong",
    code: "HKG",
    timezone: "HKT (UTC+8)",
    lat: 22.3193,
    lng: 114.1694,
    regionKey: "hongkong",
  },
  {
    id: "Tokyo - Jepang",
    name: "Tokyo - Jepang",
    shortName: "Tokyo",
    city: "Tokyo",
    country: "Jepang",
    code: "TYO",
    timezone: "JST (UTC+9)",
    lat: 35.6762,
    lng: 139.6503,
    regionKey: "tokyo",
  },
  {
    id: "Osaka - Jepang",
    name: "Osaka - Jepang",
    shortName: "Osaka",
    city: "Osaka",
    country: "Jepang",
    code: "OSA",
    timezone: "JST (UTC+9)",
    lat: 34.6937,
    lng: 135.5023,
    regionKey: "osaka",
  },
  {
    id: "New York - Amerika Serikat",
    name: "New York - Amerika Serikat",
    shortName: "New York",
    city: "New York",
    country: "Amerika Serikat",
    code: "NYC",
    timezone: "EDT (UTC-4)",
    lat: 40.7128,
    lng: -74.006,
    regionKey: "newyork",
  },
  {
    id: "Seoul - Korea Selatan",
    name: "Seoul - Korea Selatan",
    shortName: "Seoul",
    city: "Seoul",
    country: "Korea Selatan",
    code: "SEL",
    timezone: "KST (UTC+9)",
    lat: 37.5665,
    lng: 126.978,
    regionKey: "seoul",
  },
  {
    id: "London - Inggris",
    name: "London - Inggris",
    shortName: "London",
    city: "London",
    country: "Inggris",
    code: "LON",
    timezone: "BST (UTC+1)",
    lat: 51.5072,
    lng: -0.1276,
    regionKey: "london",
  },
];

export const BRANCH_FILTER_OPTIONS = [
  { value: "All", label: "Semua Cabang Luar Negeri" },
  { value: "Singapura", label: "Singapura" },
  { value: "Hong Kong", label: "Hong Kong" },
  { value: "Tokyo dan Osaka - Jepang", label: "Tokyo dan Osaka - Jepang" },
  { value: "Tokyo - Jepang", label: "Tokyo - Jepang" },
  { value: "Osaka - Jepang", label: "Osaka - Jepang" },
  { value: "New York - Amerika Serikat", label: "New York - Amerika Serikat" },
  { value: "Seoul - Korea Selatan", label: "Seoul - Korea Selatan" },
  { value: "London - Inggris", label: "London - Inggris" },
];

export const matchesBranchFilter = (recordBranch, selectedBranch) => {
  if (!selectedBranch || selectedBranch === "All") return true;
  if (selectedBranch === "Tokyo dan Osaka - Jepang") {
    return (
      recordBranch === "Tokyo - Jepang" || recordBranch === "Osaka - Jepang"
    );
  }
  return recordBranch === selectedBranch;
};
