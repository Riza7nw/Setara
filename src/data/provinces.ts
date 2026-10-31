import { rlsData } from "./rls";

export type Province = {
  name: string;
  capital: string;
  rls: number;
  code: number;
  lon: number;
  lat: number;
};

const capitals: [string, string, number, number][] = [
  ["Aceh", "Banda Aceh", 95.32, 5.55],
  ["Sumatera Utara", "Medan", 98.67, 3.59],
  ["Sumatera Barat", "Padang", 100.36, -0.95],
  ["Riau", "Pekanbaru", 101.45, 0.51],
  ["Kepulauan Riau", "Tanjungpinang", 104.45, 0.92],
  ["Jambi", "Jambi", 103.61, -1.61],
  ["Sumatera Selatan", "Palembang", 104.76, -2.99],
  ["Bengkulu", "Bengkulu", 102.26, -3.8],
  ["Lampung", "Bandar Lampung", 105.27, -5.43],
  ["Kepulauan Bangka Belitung", "Pangkalpinang", 106.12, -2.13],
  ["DKI Jakarta", "Jakarta", 106.85, -6.21],
  ["Banten", "Serang", 106.15, -6.12],
  ["Jawa Barat", "Bandung", 107.62, -6.92],
  ["Jawa Tengah", "Semarang", 110.42, -6.97],
  ["DI Yogyakarta", "Yogyakarta", 110.37, -7.8],
  ["Jawa Timur", "Surabaya", 112.75, -7.25],
  ["Bali", "Denpasar", 115.22, -8.65],
  ["Nusa Tenggara Barat", "Mataram", 116.12, -8.58],
  ["Nusa Tenggara Timur", "Kupang", 123.6, -10.18],
  ["Kalimantan Barat", "Pontianak", 109.34, -0.03],
  ["Kalimantan Tengah", "Palangka Raya", 113.92, -2.21],
  ["Kalimantan Selatan", "Banjarbaru", 114.84, -3.44],
  ["Kalimantan Timur", "Samarinda", 117.15, -0.5],
  ["Kalimantan Utara", "Tanjung Selor", 117.37, 2.84],
  ["Sulawesi Utara", "Manado", 124.84, 1.47],
  ["Gorontalo", "Gorontalo", 123.06, 0.54],
  ["Sulawesi Tengah", "Palu", 119.87, -0.9],
  ["Sulawesi Barat", "Mamuju", 118.89, -2.68],
  ["Sulawesi Selatan", "Makassar", 119.41, -5.15],
  ["Sulawesi Tenggara", "Kendari", 122.52, -3.99],
  ["Maluku", "Ambon", 128.18, -3.7],
  ["Maluku Utara", "Sofifi", 127.58, 0.74],
  ["Papua Barat", "Manokwari", 134.06, -0.86],
  ["Papua Barat Daya", "Sorong", 131.25, -0.88],
  ["Papua", "Jayapura", 140.72, -2.53],
  ["Papua Selatan", "Merauke", 140.4, -8.49],
  ["Papua Tengah", "Nabire", 135.49, -3.36],
  ["Papua Pegunungan", "Wamena", 138.95, -4.1],
];

export const provinces: Province[] = capitals.map(([name, capital, lon, lat], i) => ({
  name,
  capital,
  rls: rlsData.provinces[i].rls,
  code: rlsData.provinces[i].code,
  lon,
  lat,
}));

export const formatRls = (value: number) =>
  value.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
