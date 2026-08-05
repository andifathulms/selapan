import type { Locale } from './locales'

/**
 * UI copy.
 *
 * Two rules carry through every string here. Javanese terms are never
 * replaced with English approximations, in either locale. And nothing is
 * ever phrased as a statement about the reader — this release computes
 * dates and does not interpret them (PRD §4).
 */
export type Dictionary = {
  readonly nav: {
    readonly ubah: string
    readonly kalender: string
    readonly kurup: string
    readonly mangsa: string
    readonly selapanan: string
    readonly sumber: string
  }
  readonly site: {
    readonly title: string
    readonly tagline: string
    readonly description: string
    readonly disclaimer: string
    readonly computed: string
    readonly tradition: string
    readonly unverified: string
  }
  readonly common: {
    readonly date: string
    readonly today: string
    readonly previousDay: string
    readonly nextDay: string
    readonly showWorking: string
    readonly hideWorking: string
    readonly anchor: string
    readonly offset: string
    readonly modulus: string
    readonly result: string
    readonly source: string
    readonly crossCheck: string
    readonly refused: string
    readonly reckoning: string
    readonly dayBoundary: string
    readonly midnight: string
    readonly sunset: string
    readonly hour: string
    readonly days: string
    readonly notAvailable: string
    readonly copyLink: string
    readonly copied: string
  }
  readonly labels: {
    readonly dina: string
    readonly pasaran: string
    readonly weton: string
    readonly neptu: string
    readonly wuku: string
    readonly dayInWuku: string
    readonly lunar: string
    readonly tahun: string
    readonly windu: string
    readonly kurup: string
    readonly jdn: string
    readonly gregorian: string
    readonly mangsa: string
  }
  readonly home: {
    readonly lede: string
    readonly whatItDoes: ReadonlyArray<string>
    readonly separation: string
    readonly start: string
  }
  readonly ubah: {
    readonly title: string
    readonly intro: string
    readonly wheelsCaption: string
    readonly reverse: string
    readonly reverseIntro: string
    readonly year: string
    readonly month: string
    readonly day: string
    readonly convert: string
  }
  readonly kalender: {
    readonly title: string
    readonly intro: string
    readonly legend: string
  }
  readonly kurup: {
    readonly title: string
    readonly intro: string
    readonly mechanism: string
    readonly divergenceHere: string
    readonly agreeHere: string
    readonly table: string
    readonly bothValid: string
  }
  readonly mangsa: {
    readonly title: string
    readonly intro: string
    readonly current: string
    readonly marker: string
  }
  readonly selapanan: {
    readonly title: string
    readonly intro: string
    readonly from: string
    readonly upcoming: string
    readonly slametan: string
    readonly slametanIntro: string
    readonly countingRule: string
    readonly plainly: string
  }
  readonly sumber: {
    readonly title: string
    readonly intro: string
    readonly anchors: string
    readonly kurups: string
    readonly tables: string
    readonly gaps: string
    readonly gapsIntro: string
  }
}

const id: Dictionary = {
  nav: {
    ubah: 'Ubah',
    kalender: 'Kalender',
    kurup: 'Kurup',
    mangsa: 'Mangsa',
    selapanan: 'Selapanan',
    sumber: 'Sumber',
  },
  site: {
    title: 'Selapan',
    tagline: 'Kalender Jawa, dengan hitungannya diperlihatkan.',
    description:
      'Empat siklus yang berjalan bersamaan, aritmetika yang bisa diperiksa dengan tangan, kurup yang benar sepanjang sejarah, dan batas tegas antara yang dihitung dan yang diwariskan.',
    disclaimer:
      'Proyek pribadi, bukan otoritas. Tradisi pananggalan berbeda antar-daerah, dan aplikasi ini tidak dimaksudkan membantah perhitungan yang dipakai keluarga atau komunitas mana pun.',
    computed: 'Nilai terhitung',
    tradition: 'Bahan tradisi',
    unverified: 'Belum terverifikasi',
  },
  common: {
    date: 'Tanggal',
    today: 'Hari ini',
    previousDay: 'Sehari sebelumnya',
    nextDay: 'Sehari sesudahnya',
    showWorking: 'Lihat hitungannya',
    hideWorking: 'Tutup hitungan',
    anchor: 'Titik acuan',
    offset: 'Selisih hari',
    modulus: 'Modulus',
    result: 'Hasil',
    source: 'Sumber',
    crossCheck: 'Uji silang',
    refused: 'Tidak dihitung',
    reckoning: 'Perhitungan',
    dayBoundary: 'Pergantian hari',
    midnight: 'Tengah malam',
    sunset: 'Maghrib',
    hour: 'Jam',
    days: 'hari',
    notAvailable: 'tidak tersedia',
    copyLink: 'Salin tautan',
    copied: 'Tersalin',
  },
  labels: {
    dina: 'Dina',
    pasaran: 'Pasaran',
    weton: 'Weton',
    neptu: 'Neptu',
    wuku: 'Wuku',
    dayInWuku: 'Hari ke- dalam wuku',
    lunar: 'Tanggal Jawa',
    tahun: 'Tahun',
    windu: 'Windu',
    kurup: 'Kurup',
    jdn: 'JDN',
    gregorian: 'Masehi',
    mangsa: 'Mangsa',
  },
  home: {
    lede: 'Weton tampak seperti tabel yang tinggal dilihat. Sebenarnya ia empat siklus yang berjalan bersamaan, ditambah sistem koreksi sejarah di atasnya.',
    whatItDoes: [
      'Menghitung pasaran, dina, weton, neptu, dan wuku untuk tanggal mana pun, tanpa batas ke belakang maupun ke depan.',
      'Menghitung tanggal Jawa lunar sejak 1633 M, lengkap dengan windu, tahun, dan kurup yang berlaku — dan menolak menghitung sebelum tahun itu, bukan menebak.',
      'Menyandingkan Aboge dan Asapon di tempat keduanya berselisih, beserta sebab mekanismenya.',
      'Memperlihatkan derivasi setiap angka: titik acuan, selisih hari, modulus, hasil, dan kutipan sumbernya.',
    ],
    separation:
      'Yang dihitung dan yang ditafsirkan dipisah tegas, di kode maupun di warna. Nila untuk nilai terhitung; merah rubrik disediakan untuk bahan primbon dan tidak dipakai untuk hal lain. Lapisan tafsir belum dirilis: ia menunggu peninjau yang paham praktik pananggalan Jawa.',
    start: 'Mulai dari sebuah tanggal',
  },
  ubah: {
    title: 'Ubah tanggal',
    intro:
      'Masukkan tanggal Masehi, dapatkan perhitungan Jawa selengkapnya. Setiap nilai bisa dibuka untuk melihat asal-usulnya.',
    wheelsCaption:
      'Tiga cincin berputar bersama. Mereka kembali sejajar setiap 35 hari — itulah selapan — dan sejajar lagi setelah 210 hari.',
    reverse: 'Dari tanggal Jawa',
    reverseIntro: 'Masukkan tanggal Jawa lunar, dapatkan tanggal Masehinya.',
    year: 'Tahun (AJ)',
    month: 'Bulan',
    day: 'Tanggal',
    convert: 'Hitung',
  },
  kalender: {
    title: 'Kalender bulanan',
    intro:
      'Susunan kalender dinding: tanggal Masehi besar, tanggal Jawa dan pasaran kecil di bawahnya. Bedanya, tiap angka di sini bisa ditelusuri sampai titik acuannya.',
    legend: 'Baris kecil di bawah tanggal: pasaran, tanggal Jawa, dan wuku.',
  },
  kurup: {
    title: 'Kurup dan perselisihannya',
    intro:
      'Pola panjang tahun dalam windu berjalan sedikit lebih cepat daripada bulan sebenarnya. Kurup adalah koreksinya: satu hari dibuang tiap 120 tahun. Di sinilah kebanyakan penerapan salah, dan di sinilah komunitas benar-benar berbeda.',
    mechanism:
      'Setiap kurup dinamai dari weton awal tahun Alip. Aboge: Alip Rebo Wage. Asapon: Alip Selasa Pon. Ketika koreksi 1867 AJ diterapkan, satu hari dibuang dari Besar tahun terakhir. Komunitas yang tetap memakai Aboge tidak menerapkan koreksi itu, sehingga hitungan mereka maju sehari — dan karena itu Idul Fitri di desa Aboge kadang jatuh sehari setelah penetapan nasional.',
    divergenceHere: 'Pada tanggal ini kedua perhitungan berselisih.',
    agreeHere: 'Pada tanggal ini kedua perhitungan sama.',
    table: 'Seluruh kurup',
    bothValid:
      'Tidak ada yang disebut benar dan yang lain ketinggalan zaman. Keduanya ditampilkan dengan mekanismenya, dan pembaca memakai yang dipakai komunitasnya.',
  },
  mangsa: {
    title: 'Pranata mangsa',
    intro:
      'Kalender surya untuk pertanian: dua belas mangsa dengan panjang tak sama, terikat tahun tropis. Karena surya, ia sama sekali lepas dari semua siklus di atas — dan itu sendiri layak diperlihatkan.',
    current: 'Mangsa pada tanggal ini',
    marker: 'Pertanda',
  },
  selapanan: {
    title: 'Selapanan dan slametan',
    intro:
      'Selapanan berulang tiap 35 hari sejak sebuah weton. Slametan dihitung dari hari wafat. Keduanya perhitungan tanggal, dan hanya itu.',
    from: 'Dihitung dari',
    upcoming: 'Selapanan berikutnya',
    slametan: 'Hitungan slametan',
    slametanIntro: 'Masukkan tanggal wafat.',
    countingRule:
      'Aturan hitung: hari wafat dihitung sebagai hari pertama. Nelung dina berarti hari ketiga, bukan tiga hari sesudahnya. Cara menghitung berbeda antar-daerah; yang dipakai di sini dinyatakan terbuka agar bisa diperiksa.',
    plainly:
      'Halaman ini hanya menyajikan tanggal. Tidak ada tafsir yang dilekatkan padanya.',
  },
  sumber: {
    title: 'Sumber',
    intro:
      'Setiap titik acuan, definisi kurup, dan tabel yang dipakai aplikasi ini, beserta sumber dan statusnya. Yang belum terverifikasi ditandai demikian, bukan disembunyikan.',
    anchors: 'Titik acuan',
    kurups: 'Kurup',
    tables: 'Tabel',
    gaps: 'Yang belum selesai',
    gapsIntro:
      'Daftar terbuka hal-hal yang belum terverifikasi atau belum diterapkan. Menerbitkan daftar ini adalah bagian dari maksud proyek.',
  },
}

const en: Dictionary = {
  nav: {
    ubah: 'Convert',
    kalender: 'Calendar',
    kurup: 'Kurup',
    mangsa: 'Mangsa',
    selapanan: 'Selapanan',
    sumber: 'Sources',
  },
  site: {
    title: 'Selapan',
    tagline: 'The Javanese calendar, with the arithmetic shown.',
    description:
      'Four cycles running at once, arithmetic you can redo by hand, the kurup handled correctly across history, and a hard line between what is computed and what is inherited.',
    disclaimer:
      'A personal project, not an authority. Calendrical practice varies by region, and this is not meant to contradict the reckoning any family or community uses.',
    computed: 'Computed value',
    tradition: 'Traditional material',
    unverified: 'Unverified',
  },
  common: {
    date: 'Date',
    today: 'Today',
    previousDay: 'Previous day',
    nextDay: 'Next day',
    showWorking: 'Show the working',
    hideWorking: 'Hide the working',
    anchor: 'Anchor',
    offset: 'Day offset',
    modulus: 'Modulus',
    result: 'Result',
    source: 'Source',
    crossCheck: 'Cross-check',
    refused: 'Not computed',
    reckoning: 'Reckoning',
    dayBoundary: 'Day begins at',
    midnight: 'Midnight',
    sunset: 'Sunset',
    hour: 'Hour',
    days: 'days',
    notAvailable: 'not available',
    copyLink: 'Copy link',
    copied: 'Copied',
  },
  labels: {
    dina: 'Dina',
    pasaran: 'Pasaran',
    weton: 'Weton',
    neptu: 'Neptu',
    wuku: 'Wuku',
    dayInWuku: 'Day within the wuku',
    lunar: 'Javanese date',
    tahun: 'Year',
    windu: 'Windu',
    kurup: 'Kurup',
    jdn: 'JDN',
    gregorian: 'Gregorian',
    mangsa: 'Mangsa',
  },
  home: {
    lede: 'Weton looks like a lookup. It is four cycles running simultaneously, with a historical correction system layered on top.',
    whatItDoes: [
      'Computes pasaran, dina, weton, neptu, and wuku for any date, unbounded in both directions.',
      'Computes the Javanese lunar date from 1633 CE, with its windu, year, and the kurup that applies — and refuses to compute before that, rather than guessing.',
      'Puts Aboge and Asapon side by side where they diverge, with the mechanism that separates them.',
      'Shows the derivation of every figure: anchor, day offset, modulus, result, and the citation behind it.',
    ],
    separation:
      'Computation and interpretation are kept apart, in the code and in the palette. Indigo is for computed values; rubric red is reserved for primbon material and used for nothing else. The interpretive layer is not released: it is waiting on a reviewer familiar with Javanese calendrical practice.',
    start: 'Start from a date',
  },
  ubah: {
    title: 'Convert a date',
    intro:
      'Give a Gregorian date, get the full Javanese reckoning. Every value opens to show where it came from.',
    wheelsCaption:
      'Three rings turning together. They realign every 35 days — that is the selapan — and again after 210.',
    reverse: 'From a Javanese date',
    reverseIntro: 'Give a Javanese lunar date, get the Gregorian one.',
    year: 'Year (AJ)',
    month: 'Month',
    day: 'Day',
    convert: 'Convert',
  },
  kalender: {
    title: 'Month grid',
    intro:
      'The wall-calendar layout: the Gregorian day large, the Javanese date and pasaran small beneath it. The difference is that every figure here traces back to its anchor.',
    legend: 'The small line under each day: pasaran, Javanese date, and wuku.',
  },
  kurup: {
    title: 'The kurup, and where it divides',
    intro:
      'The windu pattern of year lengths runs slightly fast against the true lunar month. The kurup is the correction: one day dropped every 120 years. This is where implementations fail, and where communities genuinely differ.',
    mechanism:
      'Each kurup is named for the weton on which the year Alip begins. Aboge: Alip, Rebo, Wage. Asapon: Alip, Selasa, Pon. When the 1867 AJ correction was applied, a day was dropped from the Besar of the final year. Communities keeping Aboge did not apply it, so their reckoning runs a day ahead — which is why Idul Fitri in Aboge villages sometimes falls a day after the national determination.',
    divergenceHere: 'On this date the two reckonings differ.',
    agreeHere: 'On this date the two reckonings agree.',
    table: 'Every kurup',
    bothValid:
      'Neither is the correct one with the other left behind. Both are shown with their mechanism, and a reader uses the one their community uses.',
  },
  mangsa: {
    title: 'Pranata mangsa',
    intro:
      'The agricultural solar calendar: twelve mangsa of unequal length, tied to the tropical year. Being solar, it is wholly independent of every cycle above — which is itself worth showing.',
    current: 'The mangsa on this date',
    marker: 'Marker',
  },
  selapanan: {
    title: 'Selapanan and slametan',
    intro:
      'Selapanan recurs every 35 days from a weton. Slametan dates are counted from the day of death. Both are date calculation, and nothing more.',
    from: 'Counted from',
    upcoming: 'Coming selapanan',
    slametan: 'Slametan reckoning',
    slametanIntro: 'Give the date of death.',
    countingRule:
      'The counting rule: the day of death counts as the first day. Nelung dina means the third day, not three days later. Counting practice varies by region; the rule used here is stated openly so it can be checked.',
    plainly:
      'This page presents dates only. No interpretation is attached to them.',
  },
  sumber: {
    title: 'Sources',
    intro:
      'Every anchor, kurup definition, and table this app uses, with its source and its status. What is unverified is marked as such rather than hidden.',
    anchors: 'Anchors',
    kurups: 'Kurup',
    tables: 'Tables',
    gaps: 'What is unfinished',
    gapsIntro:
      'An open list of what is unverified or unimplemented. Publishing it is part of the point.',
  },
}

const DICTIONARIES: Record<Locale, Dictionary> = { id, en }

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale]
}
