export const SEARCH_CATEGORIES = [
  { id: "anime", label: "Аніме", icon: "MonitorPlay" },
  // { id: "manga", label: "Манґа", icon: "BookOpen" },
  { id: "character", label: "Персонаж", icon: "User" },
  { id: "team", label: "Команда", icon: "Microphone" },
  //  { id: "user", label: "Люди", icon: "UserCircle" },
];

export const INITIAL_RESULTS = {
  anime: [],
  manga: [],
  character: [],
  team: [],
};

export const INITIAL_SEARCHED = {
  anime: false,
  manga: false,
  character: false,
  team: false,
};

export const INITIAL_FILTERS = {
  status: "Байдуже",
  seasons: "Байдуже",
  years: [1990, new Date().getFullYear()],
  score: 0,
  genres: [],
};
