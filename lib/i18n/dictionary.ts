import type { Locale } from './locales'

/**
 * UI copy.
 *
 * Two rules carry through every string here. Javanese terms are never
 * replaced with English approximations, in either locale. And nothing is
 * ever phrased as a statement about the reader — this release computes
 * dates and does not interpret them (PRD §4).
 */
/** The six destinations. Named once, so nav labels and blurbs cannot drift. */
export type NavKey = 'ubah' | 'kalender' | 'kurup' | 'mangsa' | 'selapanan' | 'sumber'

export type Dictionary = {
  readonly nav: Record<NavKey, string>
  readonly site: {
    readonly title: string
    readonly tagline: string
    readonly wordmarkNote: string
    readonly description: string
    readonly disclaimer: string
    readonly sourceCode: string
    readonly computed: string
    readonly computedNote: string
    readonly tradition: string
    readonly traditionNote: string
    readonly unverified: string
    readonly unverifiedNote: string
    readonly legend: string
  }
  readonly common: {
    readonly date: string
    readonly today: string
    readonly previousDay: string
    readonly nextDay: string
    readonly previousMonth: string
    readonly nextMonth: string
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
    readonly skipToContent: string
    readonly options: string
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
    readonly todayLabel: string
    readonly todayHint: string
    readonly openTrace: string
    readonly whatTitle: string
    readonly whatBody: ReadonlyArray<string>
    readonly cyclesTitle: string
    readonly cyclesIntro: string
    readonly cycleHead: {
      readonly cycle: string
      readonly length: string
      readonly elements: string
    }
    readonly browseTitle: string
    readonly whatItDoesTitle: string
    readonly whatItDoes: ReadonlyArray<string>
    readonly separationTitle: string
    readonly separation: string
    readonly start: string
  }
  readonly navBlurb: Record<NavKey, string>
  readonly ubah: {
    readonly title: string
    readonly intro: string
    readonly groupDay: string
    readonly groupYear: string
    readonly groupReference: string
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
    wordmarkNote: 'Kalender Jawa · weton',
    description:
      'Empat siklus yang berjalan bersamaan, aritmetika yang bisa diperiksa dengan tangan, kurup yang benar sepanjang sejarah, dan batas tegas antara yang dihitung dan yang diwariskan.',
    disclaimer:
      'Proyek pribadi, bukan otoritas. Tradisi pananggalan berbeda antar-daerah, dan aplikasi ini tidak dimaksudkan membantah perhitungan yang dipakai keluarga atau komunitas mana pun.',
    sourceCode: 'Kode sumber',
    computed: 'Nilai terhitung',
    computedNote: 'Aritmetika. Bisa dibuka dan diperiksa ulang dengan tangan.',
    tradition: 'Bahan tradisi',
    traditionNote: 'Warna ini disediakan untuk primbon dan belum dipakai — lapisan itu belum dirilis.',
    unverified: 'Belum terverifikasi',
    unverifiedNote: 'Bersandar pada satu sumber, atau di luar rentang yang berlaku.',
    legend: 'Arti warna',
  },
  common: {
    date: 'Tanggal',
    today: 'Hari ini',
    previousDay: 'Sehari sebelumnya',
    nextDay: 'Sehari sesudahnya',
    previousMonth: 'Bulan sebelumnya',
    nextMonth: 'Bulan sesudahnya',
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
    skipToContent: 'Langsung ke isi',
    options: 'Pilihan',
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
    lede: 'Masukkan sebuah tanggal — hari lahir, hari ini, tanggal mana pun — dan lihat weton, tanggal Jawa, wuku, serta mangsa-nya, lengkap dengan cara menghitungnya.',
    todayLabel: 'Hari ini',
    todayHint: 'Dihitung di peramban Anda, dari tanggal di perangkat ini.',
    openTrace: 'Buka hitungan hari ini',
    whatTitle: 'Apa itu weton?',
    whatBody: [
      'Weton adalah pasangan dua hari: nama hari dalam pekan tujuh hari (Ahad sampai Setu) dan nama hari pasaran dalam pekan lima hari (Legi, Pahing, Pon, Wage, Kliwon). Digabungkan, hasilnya seperti “Jemuwah Kliwon”.',
      'Karena lima dan tujuh baru bertemu kembali setelah 35 hari, pasangan yang sama berulang tiap 35 hari sekali. Putaran 35 hari itulah yang disebut selapan — dan dari situ nama aplikasi ini diambil.',
      'Di atas keduanya masih berjalan dua siklus lain: wuku yang berulang tiap 210 hari, dan tahun Jawa lunar yang dimulai Sultan Agung pada 1633 M. Empat siklus, berjalan bersamaan, masing-masing dengan panjangnya sendiri.',
    ],
    cyclesTitle: 'Empat siklus yang berjalan bersamaan',
    cyclesIntro:
      'Setiap tanggal berada di posisi tertentu pada keempatnya sekaligus. Itulah sebabnya perhitungan Jawa tidak bisa disederhanakan menjadi satu tabel.',
    cycleHead: { cycle: 'Siklus', length: 'Panjang', elements: 'Isinya' },
    browseTitle: 'Yang bisa dibuka di sini',
    whatItDoesTitle: 'Bedanya dengan situs weton lain',
    whatItDoes: [
      'Menghitung pasaran, dina, weton, neptu, dan wuku untuk tanggal mana pun, tanpa batas ke belakang maupun ke depan.',
      'Menghitung tanggal Jawa lunar sejak 1633 M, lengkap dengan windu, tahun, dan kurup yang berlaku — dan menolak menghitung sebelum tahun itu, bukan menebak.',
      'Menyandingkan Aboge dan Asapon di tempat keduanya berselisih, beserta sebab mekanismenya.',
      'Memperlihatkan derivasi setiap angka: titik acuan, selisih hari, modulus, hasil, dan kutipan sumbernya.',
    ],
    separationTitle: 'Yang dihitung dan yang diwariskan',
    separation:
      'Yang dihitung dan yang ditafsirkan dipisah tegas, di kode maupun di warna. Nila untuk nilai terhitung; merah rubrik disediakan untuk bahan primbon dan tidak dipakai untuk hal lain. Lapisan tafsir belum dirilis: ia menunggu peninjau yang paham praktik pananggalan Jawa.',
    start: 'Hitung sebuah tanggal',
  },
  navBlurb: {
    ubah: 'Satu tanggal, perhitungan Jawa selengkapnya: weton, neptu, wuku, tanggal lunar, dan asal-usul tiap angkanya.',
    kalender: 'Sebulan penuh dalam susunan kalender dinding — tanggal Masehi besar, pasaran dan tanggal Jawa di bawahnya.',
    selapanan: 'Tanggal selapanan berikutnya dari sebuah weton, dan hitungan hari slametan. Tanggal saja, tanpa tafsir.',
    mangsa: 'Kalender musim untuk pertanian: dua belas mangsa dengan pertandanya. Surya, jadi lepas dari semua siklus lain.',
    kurup: 'Mengapa hitungan Aboge dan Asapon bisa berbeda sehari, dan bagaimana selisih itu muncul.',
    sumber: 'Setiap titik acuan dan tabel yang dipakai, sumbernya, dan daftar terbuka apa yang belum terverifikasi.',
  },
  ubah: {
    title: 'Ubah tanggal',
    intro:
      'Masukkan tanggal Masehi, dapatkan perhitungan Jawa selengkapnya. Setiap nilai bisa dibuka untuk melihat asal-usulnya.',
    groupDay: 'Hari dan siklusnya',
    groupYear: 'Tahun Jawa',
    groupReference: 'Rujukan',
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
    wordmarkNote: 'Javanese calendar · weton',
    description:
      'Four cycles running at once, arithmetic you can redo by hand, the kurup handled correctly across history, and a hard line between what is computed and what is inherited.',
    disclaimer:
      'A personal project, not an authority. Calendrical practice varies by region, and this is not meant to contradict the reckoning any family or community uses.',
    sourceCode: 'Source code',
    computed: 'Computed value',
    computedNote: 'Arithmetic. Opens up, and can be redone by hand.',
    tradition: 'Traditional material',
    traditionNote: 'Reserved for primbon and unused so far — that layer has not been released.',
    unverified: 'Unverified',
    unverifiedNote: 'Resting on a single source, or outside the range that applies.',
    legend: 'What the colours mean',
  },
  common: {
    date: 'Date',
    today: 'Today',
    previousDay: 'Previous day',
    nextDay: 'Next day',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
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
    skipToContent: 'Skip to content',
    options: 'Options',
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
    lede: 'Give it a date — a birthday, today, any date at all — and see its weton, Javanese date, wuku, and mangsa, along with the arithmetic that produced them.',
    todayLabel: 'Today',
    todayHint: 'Computed in your browser, from the date on this device.',
    openTrace: 'Open the working for today',
    whatTitle: 'What is a weton?',
    whatBody: [
      'A weton is a pair of day names: the day of the seven-day week (Ahad through Setu) and the day of the five-day pasaran week (Legi, Pahing, Pon, Wage, Kliwon). Together they give something like “Jemuwah Kliwon”.',
      'Because five and seven only meet again after 35 days, the same pair recurs every 35 days. That 35-day turn is the selapan — and it is where this site gets its name.',
      'Two further cycles run above those: the wuku, which repeats every 210 days, and the Javanese lunar year that Sultan Agung began in 1633 CE. Four cycles, running at once, each with its own length.',
    ],
    cyclesTitle: 'Four cycles, running at once',
    cyclesIntro:
      'Every date sits at a position on all four simultaneously. That is why the Javanese reckoning cannot be collapsed into a single table.',
    cycleHead: { cycle: 'Cycle', length: 'Length', elements: 'Elements' },
    browseTitle: 'What you can open here',
    whatItDoesTitle: 'How this differs from other weton sites',
    whatItDoes: [
      'Computes pasaran, dina, weton, neptu, and wuku for any date, unbounded in both directions.',
      'Computes the Javanese lunar date from 1633 CE, with its windu, year, and the kurup that applies — and refuses to compute before that, rather than guessing.',
      'Puts Aboge and Asapon side by side where they diverge, with the mechanism that separates them.',
      'Shows the derivation of every figure: anchor, day offset, modulus, result, and the citation behind it.',
    ],
    separationTitle: 'What is computed, and what is inherited',
    separation:
      'Computation and interpretation are kept apart, in the code and in the palette. Indigo is for computed values; rubric red is reserved for primbon material and used for nothing else. The interpretive layer is not released: it is waiting on a reviewer familiar with Javanese calendrical practice.',
    start: 'Convert a date',
  },
  navBlurb: {
    ubah: 'One date, the full Javanese reckoning: weton, neptu, wuku, lunar date, and where every figure came from.',
    kalender: 'A whole month in the wall-calendar layout — the Gregorian day large, pasaran and Javanese date beneath.',
    selapanan: 'The coming selapanan dates from a weton, and slametan reckoning. Dates only, with nothing read into them.',
    mangsa: 'The agricultural season calendar: twelve mangsa with their markers. Solar, so independent of everything else.',
    kurup: 'Why the Aboge and Asapon reckonings can differ by a day, and how that difference arises.',
    sumber: 'Every anchor and table the app uses, its source, and an open list of what is still unverified.',
  },
  ubah: {
    title: 'Convert a date',
    intro:
      'Give a Gregorian date, get the full Javanese reckoning. Every value opens to show where it came from.',
    groupDay: 'The day and its cycles',
    groupYear: 'The Javanese year',
    groupReference: 'Reference',
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
