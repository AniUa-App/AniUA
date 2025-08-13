import { HikkaApi } from "./hikka";

type Genres = string[];

type Statuses = {
  Припинено: "discontinued";
  Онґоінґ: "ongoing";
  Зупинено: "paused";
  Анонс: "announced";
  Завершено: "finished";
};

type Seasons = {
  Зима: "winter";
  Весна: "spring";
  Осінь: "fall";
  Літо: "summer";
};

type isUkrainianised = "only_translated=true" | "only_translated=false";

type Sort = {
  "Загальна оцінка": "score";
  "Дата релізу": "start_date";
  Тип: "media_type";
};

type Rating = {
  G: "g";
  PG: "pg";
  "PG-13": "pg_13";
  R: "r";
  "R+": "r_plus";
  RX: "rx";
};

type Years = [number, number]; // 1965, new Date().getFullYear()

export default interface CustomSet {
  genres: Genres;
  statuses: Statuses;
  seasons: Seasons;
  isUkrainianised: isUkrainianised;
  sort: Sort;
  rating: Rating;
  years: Years;
}
