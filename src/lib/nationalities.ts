export interface Nationality {
  value: string; // English country name stored in DB
  en: string;    // flag + English display
  ar: string;    // flag + Arabic display
  tr: string;    // flag + Turkish display
}

// Priority countries at top, then A–Z
export const NATIONALITIES: Nationality[] = [
  // ── Priority ──────────────────────────────────────────────────────────────
  { value: "Turkey",               en: "🇹🇷 Turkey",               ar: "🇹🇷 تركيا",                        tr: "🇹🇷 Türkiye" },
  { value: "Libya",                en: "🇱🇾 Libya",                ar: "🇱🇾 ليبيا",                        tr: "🇱🇾 Libya" },
  { value: "Saudi Arabia",         en: "🇸🇦 Saudi Arabia",         ar: "🇸🇦 المملكة العربية السعودية",      tr: "🇸🇦 Suudi Arabistan" },
  { value: "UAE",                  en: "🇦🇪 UAE",                  ar: "🇦🇪 الإمارات العربية المتحدة",      tr: "🇦🇪 Birleşik Arap Emirlikleri" },
  { value: "Egypt",                en: "🇪🇬 Egypt",                ar: "🇪🇬 مصر",                          tr: "🇪🇬 Mısır" },
  { value: "Jordan",               en: "🇯🇴 Jordan",               ar: "🇯🇴 الأردن",                       tr: "🇯🇴 Ürdün" },
  { value: "Syria",                en: "🇸🇾 Syria",                ar: "🇸🇾 سوريا",                        tr: "🇸🇾 Suriye" },
  { value: "Iraq",                 en: "🇮🇶 Iraq",                 ar: "🇮🇶 العراق",                       tr: "🇮🇶 Irak" },
  { value: "Morocco",              en: "🇲🇦 Morocco",              ar: "🇲🇦 المغرب",                       tr: "🇲🇦 Fas" },
  { value: "Algeria",              en: "🇩🇿 Algeria",              ar: "🇩🇿 الجزائر",                      tr: "🇩🇿 Cezayir" },
  { value: "Tunisia",              en: "🇹🇳 Tunisia",              ar: "🇹🇳 تونس",                         tr: "🇹🇳 Tunus" },
  { value: "Sudan",                en: "🇸🇩 Sudan",                ar: "🇸🇩 السودان",                      tr: "🇸🇩 Sudan" },
  { value: "Yemen",                en: "🇾🇪 Yemen",                ar: "🇾🇪 اليمن",                        tr: "🇾🇪 Yemen" },
  { value: "Qatar",                en: "🇶🇦 Qatar",                ar: "🇶🇦 قطر",                          tr: "🇶🇦 Katar" },
  { value: "Kuwait",               en: "🇰🇼 Kuwait",               ar: "🇰🇼 الكويت",                       tr: "🇰🇼 Kuveyt" },
  { value: "Bahrain",              en: "🇧🇭 Bahrain",              ar: "🇧🇭 البحرين",                      tr: "🇧🇭 Bahreyn" },
  { value: "Oman",                 en: "🇴🇲 Oman",                 ar: "🇴🇲 عُمان",                        tr: "🇴🇲 Umman" },
  { value: "Germany",              en: "🇩🇪 Germany",              ar: "🇩🇪 ألمانيا",                      tr: "🇩🇪 Almanya" },
  { value: "United Kingdom",       en: "🇬🇧 United Kingdom",       ar: "🇬🇧 المملكة المتحدة",               tr: "🇬🇧 Birleşik Krallık" },
  { value: "France",               en: "🇫🇷 France",               ar: "🇫🇷 فرنسا",                        tr: "🇫🇷 Fransa" },
  { value: "United States",        en: "🇺🇸 United States",        ar: "🇺🇸 الولايات المتحدة الأمريكية",   tr: "🇺🇸 Amerika Birleşik Devletleri" },
  { value: "Russia",               en: "🇷🇺 Russia",               ar: "🇷🇺 روسيا",                        tr: "🇷🇺 Rusya" },
  { value: "China",                en: "🇨🇳 China",                ar: "🇨🇳 الصين",                        tr: "🇨🇳 Çin" },
  { value: "India",                en: "🇮🇳 India",                ar: "🇮🇳 الهند",                        tr: "🇮🇳 Hindistan" },
  { value: "Pakistan",             en: "🇵🇰 Pakistan",             ar: "🇵🇰 باكستان",                      tr: "🇵🇰 Pakistan" },
  { value: "Bangladesh",           en: "🇧🇩 Bangladesh",           ar: "🇧🇩 بنغلاديش",                     tr: "🇧🇩 Bangladeş" },
  { value: "Nigeria",              en: "🇳🇬 Nigeria",              ar: "🇳🇬 نيجيريا",                      tr: "🇳🇬 Nijerya" },
  { value: "Poland",               en: "🇵🇱 Poland",               ar: "🇵🇱 بولندا",                       tr: "🇵🇱 Polonya" },
  { value: "Netherlands",          en: "🇳🇱 Netherlands",          ar: "🇳🇱 هولندا",                       tr: "🇳🇱 Hollanda" },
  { value: "Belgium",              en: "🇧🇪 Belgium",              ar: "🇧🇪 بلجيكا",                       tr: "🇧🇪 Belçika" },
  { value: "Switzerland",          en: "🇨🇭 Switzerland",          ar: "🇨🇭 سويسرا",                       tr: "🇨🇭 İsviçre" },
  { value: "Austria",              en: "🇦🇹 Austria",              ar: "🇦🇹 النمسا",                       tr: "🇦🇹 Avusturya" },
  { value: "Sweden",               en: "🇸🇪 Sweden",               ar: "🇸🇪 السويد",                       tr: "🇸🇪 İsveç" },
  { value: "Norway",               en: "🇳🇴 Norway",               ar: "🇳🇴 النرويج",                      tr: "🇳🇴 Norveç" },
  { value: "Denmark",              en: "🇩🇰 Denmark",              ar: "🇩🇰 الدنمارك",                     tr: "🇩🇰 Danimarka" },
  { value: "Finland",              en: "🇫🇮 Finland",              ar: "🇫🇮 فنلندا",                       tr: "🇫🇮 Finlandiya" },
  { value: "Portugal",             en: "🇵🇹 Portugal",             ar: "🇵🇹 البرتغال",                     tr: "🇵🇹 Portekiz" },
  { value: "Spain",                en: "🇪🇸 Spain",                ar: "🇪🇸 إسبانيا",                      tr: "🇪🇸 İspanya" },
  { value: "Italy",                en: "🇮🇹 Italy",                ar: "🇮🇹 إيطاليا",                      tr: "🇮🇹 İtalya" },
  { value: "Greece",               en: "🇬🇷 Greece",               ar: "🇬🇷 اليونان",                      tr: "🇬🇷 Yunanistan" },

  // ── A ─────────────────────────────────────────────────────────────────────
  { value: "Afghanistan",          en: "🇦🇫 Afghanistan",          ar: "🇦🇫 أفغانستان",                    tr: "🇦🇫 Afganistan" },
  { value: "Albania",              en: "🇦🇱 Albania",              ar: "🇦🇱 ألبانيا",                      tr: "🇦🇱 Arnavutluk" },
  { value: "Andorra",              en: "🇦🇩 Andorra",              ar: "🇦🇩 أندورا",                       tr: "🇦🇩 Andorra" },
  { value: "Angola",               en: "🇦🇴 Angola",               ar: "🇦🇴 أنغولا",                       tr: "🇦🇴 Angola" },
  { value: "Argentina",            en: "🇦🇷 Argentina",            ar: "🇦🇷 الأرجنتين",                    tr: "🇦🇷 Arjantin" },
  { value: "Armenia",              en: "🇦🇲 Armenia",              ar: "🇦🇲 أرمينيا",                      tr: "🇦🇲 Ermenistan" },
  { value: "Australia",            en: "🇦🇺 Australia",            ar: "🇦🇺 أستراليا",                     tr: "🇦🇺 Avustralya" },
  { value: "Azerbaijan",           en: "🇦🇿 Azerbaijan",           ar: "🇦🇿 أذربيجان",                     tr: "🇦🇿 Azerbaycan" },

  // ── B ─────────────────────────────────────────────────────────────────────
  { value: "Barbados",             en: "🇧🇧 Barbados",             ar: "🇧🇧 باربادوس",                     tr: "🇧🇧 Barbados" },
  { value: "Belarus",              en: "🇧🇾 Belarus",              ar: "🇧🇾 بيلاروسيا",                    tr: "🇧🇾 Belarus" },
  { value: "Belize",               en: "🇧🇿 Belize",               ar: "🇧🇿 بليز",                         tr: "🇧🇿 Belize" },
  { value: "Benin",                en: "🇧🇯 Benin",                ar: "🇧🇯 بنين",                         tr: "🇧🇯 Benin" },
  { value: "Bhutan",               en: "🇧🇹 Bhutan",               ar: "🇧🇹 بوتان",                        tr: "🇧🇹 Butan" },
  { value: "Bolivia",              en: "🇧🇴 Bolivia",              ar: "🇧🇴 بوليفيا",                      tr: "🇧🇴 Bolivya" },
  { value: "Bosnia and Herzegovina", en: "🇧🇦 Bosnia and Herzegovina", ar: "🇧🇦 البوسنة والهرسك",          tr: "🇧🇦 Bosna-Hersek" },
  { value: "Botswana",             en: "🇧🇼 Botswana",             ar: "🇧🇼 بوتسوانا",                     tr: "🇧🇼 Botsvana" },
  { value: "Brazil",               en: "🇧🇷 Brazil",               ar: "🇧🇷 البرازيل",                     tr: "🇧🇷 Brezilya" },
  { value: "Brunei",               en: "🇧🇳 Brunei",               ar: "🇧🇳 بروناي",                       tr: "🇧🇳 Brunei" },
  { value: "Bulgaria",             en: "🇧🇬 Bulgaria",             ar: "🇧🇬 بلغاريا",                      tr: "🇧🇬 Bulgaristan" },
  { value: "Burkina Faso",         en: "🇧🇫 Burkina Faso",         ar: "🇧🇫 بوركينا فاسو",                 tr: "🇧🇫 Burkina Faso" },
  { value: "Burundi",              en: "🇧🇮 Burundi",              ar: "🇧🇮 بوروندي",                      tr: "🇧🇮 Burundi" },

  // ── C ─────────────────────────────────────────────────────────────────────
  { value: "Cambodia",             en: "🇰🇭 Cambodia",             ar: "🇰🇭 كمبوديا",                      tr: "🇰🇭 Kamboçya" },
  { value: "Cameroon",             en: "🇨🇲 Cameroon",             ar: "🇨🇲 الكاميرون",                    tr: "🇨🇲 Kamerun" },
  { value: "Canada",               en: "🇨🇦 Canada",               ar: "🇨🇦 كندا",                         tr: "🇨🇦 Kanada" },
  { value: "Cape Verde",           en: "🇨🇻 Cape Verde",           ar: "🇨🇻 الرأس الأخضر",                 tr: "🇨🇻 Yeşil Burun Adaları" },
  { value: "Central African Republic", en: "🇨🇫 Central African Republic", ar: "🇨🇫 جمهورية أفريقيا الوسطى", tr: "🇨🇫 Orta Afrika Cumhuriyeti" },
  { value: "Chad",                 en: "🇹🇩 Chad",                 ar: "🇹🇩 تشاد",                         tr: "🇹🇩 Çad" },
  { value: "Chile",                en: "🇨🇱 Chile",                ar: "🇨🇱 تشيلي",                        tr: "🇨🇱 Şili" },
  { value: "Colombia",             en: "🇨🇴 Colombia",             ar: "🇨🇴 كولومبيا",                     tr: "🇨🇴 Kolombiya" },
  { value: "Comoros",              en: "🇰🇲 Comoros",              ar: "🇰🇲 جزر القمر",                    tr: "🇰🇲 Komorlar" },
  { value: "Congo",                en: "🇨🇬 Congo",                ar: "🇨🇬 الكونغو",                      tr: "🇨🇬 Kongo" },
  { value: "Costa Rica",           en: "🇨🇷 Costa Rica",           ar: "🇨🇷 كوستاريكا",                    tr: "🇨🇷 Kosta Rika" },
  { value: "Croatia",              en: "🇭🇷 Croatia",              ar: "🇭🇷 كرواتيا",                      tr: "🇭🇷 Hırvatistan" },
  { value: "Cuba",                 en: "🇨🇺 Cuba",                 ar: "🇨🇺 كوبا",                         tr: "🇨🇺 Küba" },
  { value: "Cyprus",               en: "🇨🇾 Cyprus",               ar: "🇨🇾 قبرص",                         tr: "🇨🇾 Kıbrıs" },
  { value: "Czech Republic",       en: "🇨🇿 Czech Republic",       ar: "🇨🇿 جمهورية التشيك",               tr: "🇨🇿 Çekya" },

  // ── D ─────────────────────────────────────────────────────────────────────
  { value: "Djibouti",             en: "🇩🇯 Djibouti",             ar: "🇩🇯 جيبوتي",                       tr: "🇩🇯 Cibuti" },
  { value: "Dominican Republic",   en: "🇩🇴 Dominican Republic",   ar: "🇩🇴 جمهورية الدومينيكان",          tr: "🇩🇴 Dominik Cumhuriyeti" },

  // ── E ─────────────────────────────────────────────────────────────────────
  { value: "East Timor",           en: "🇹🇱 East Timor",           ar: "🇹🇱 تيمور الشرقية",                tr: "🇹🇱 Doğu Timor" },
  { value: "Ecuador",              en: "🇪🇨 Ecuador",              ar: "🇪🇨 الإكوادور",                    tr: "🇪🇨 Ekvador" },
  { value: "Equatorial Guinea",    en: "🇬🇶 Equatorial Guinea",    ar: "🇬🇶 غينيا الاستوائية",             tr: "🇬🇶 Ekvator Ginesi" },
  { value: "Eritrea",              en: "🇪🇷 Eritrea",              ar: "🇪🇷 إريتريا",                      tr: "🇪🇷 Eritre" },
  { value: "Estonia",              en: "🇪🇪 Estonia",              ar: "🇪🇪 إستونيا",                      tr: "🇪🇪 Estonya" },
  { value: "Ethiopia",             en: "🇪🇹 Ethiopia",             ar: "🇪🇹 إثيوبيا",                      tr: "🇪🇹 Etiyopya" },

  // ── F ─────────────────────────────────────────────────────────────────────
  { value: "Fiji",                 en: "🇫🇯 Fiji",                 ar: "🇫🇯 فيجي",                         tr: "🇫🇯 Fiji" },

  // ── G ─────────────────────────────────────────────────────────────────────
  { value: "Gabon",                en: "🇬🇦 Gabon",                ar: "🇬🇦 الغابون",                      tr: "🇬🇦 Gabon" },
  { value: "Gambia",               en: "🇬🇲 Gambia",               ar: "🇬🇲 غامبيا",                       tr: "🇬🇲 Gambiya" },
  { value: "Georgia",              en: "🇬🇪 Georgia",              ar: "🇬🇪 جورجيا",                       tr: "🇬🇪 Gürcistan" },
  { value: "Ghana",                en: "🇬🇭 Ghana",                ar: "🇬🇭 غانا",                         tr: "🇬🇭 Gana" },
  { value: "Grenada",              en: "🇬🇩 Grenada",              ar: "🇬🇩 غرينادا",                      tr: "🇬🇩 Grenada" },
  { value: "Guatemala",            en: "🇬🇹 Guatemala",            ar: "🇬🇹 غواتيمالا",                    tr: "🇬🇹 Guatemala" },
  { value: "Guinea",               en: "🇬🇳 Guinea",               ar: "🇬🇳 غينيا",                        tr: "🇬🇳 Gine" },
  { value: "Guyana",               en: "🇬🇾 Guyana",               ar: "🇬🇾 غيانا",                        tr: "🇬🇾 Guyana" },

  // ── H ─────────────────────────────────────────────────────────────────────
  { value: "Haiti",                en: "🇭🇹 Haiti",                ar: "🇭🇹 هايتي",                        tr: "🇭🇹 Haiti" },
  { value: "Honduras",             en: "🇭🇳 Honduras",             ar: "🇭🇳 هندوراس",                      tr: "🇭🇳 Honduras" },
  { value: "Hungary",              en: "🇭🇺 Hungary",              ar: "🇭🇺 المجر",                        tr: "🇭🇺 Macaristan" },

  // ── I ─────────────────────────────────────────────────────────────────────
  { value: "Iceland",              en: "🇮🇸 Iceland",              ar: "🇮🇸 آيسلندا",                      tr: "🇮🇸 İzlanda" },
  { value: "Indonesia",            en: "🇮🇩 Indonesia",            ar: "🇮🇩 إندونيسيا",                    tr: "🇮🇩 Endonezya" },
  { value: "Iran",                 en: "🇮🇷 Iran",                 ar: "🇮🇷 إيران",                        tr: "🇮🇷 İran" },
  { value: "Ireland",              en: "🇮🇪 Ireland",              ar: "🇮🇪 أيرلندا",                      tr: "🇮🇪 İrlanda" },
  { value: "Israel",               en: "🇮🇱 Israel",               ar: "🇮🇱 إسرائيل",                      tr: "🇮🇱 İsrail" },
  { value: "Ivory Coast",          en: "🇨🇮 Ivory Coast",          ar: "🇨🇮 ساحل العاج",                   tr: "🇨🇮 Fildişi Sahili" },

  // ── J ─────────────────────────────────────────────────────────────────────
  { value: "Jamaica",              en: "🇯🇲 Jamaica",              ar: "🇯🇲 جامايكا",                      tr: "🇯🇲 Jamaika" },
  { value: "Japan",                en: "🇯🇵 Japan",                ar: "🇯🇵 اليابان",                      tr: "🇯🇵 Japonya" },

  // ── K ─────────────────────────────────────────────────────────────────────
  { value: "Kazakhstan",           en: "🇰🇿 Kazakhstan",           ar: "🇰🇿 كازاخستان",                    tr: "🇰🇿 Kazakistan" },
  { value: "Kenya",                en: "🇰🇪 Kenya",                ar: "🇰🇪 كينيا",                        tr: "🇰🇪 Kenya" },
  { value: "Kyrgyzstan",           en: "🇰🇬 Kyrgyzstan",           ar: "🇰🇬 قيرغيزستان",                   tr: "🇰🇬 Kırgızistan" },

  // ── L ─────────────────────────────────────────────────────────────────────
  { value: "Laos",                 en: "🇱🇦 Laos",                 ar: "🇱🇦 لاوس",                         tr: "🇱🇦 Laos" },
  { value: "Latvia",               en: "🇱🇻 Latvia",               ar: "🇱🇻 لاتفيا",                       tr: "🇱🇻 Letonya" },
  { value: "Lebanon",              en: "🇱🇧 Lebanon",              ar: "🇱🇧 لبنان",                        tr: "🇱🇧 Lübnan" },
  { value: "Lesotho",              en: "🇱🇸 Lesotho",              ar: "🇱🇸 ليسوتو",                       tr: "🇱🇸 Lesoto" },
  { value: "Liberia",              en: "🇱🇷 Liberia",              ar: "🇱🇷 ليبيريا",                      tr: "🇱🇷 Liberya" },
  { value: "Lithuania",            en: "🇱🇹 Lithuania",            ar: "🇱🇹 ليتوانيا",                     tr: "🇱🇹 Litvanya" },
  { value: "Luxembourg",           en: "🇱🇺 Luxembourg",           ar: "🇱🇺 لوكسمبورغ",                    tr: "🇱🇺 Lüksemburg" },

  // ── M ─────────────────────────────────────────────────────────────────────
  { value: "Madagascar",           en: "🇲🇬 Madagascar",           ar: "🇲🇬 مدغشقر",                       tr: "🇲🇬 Madagaskar" },
  { value: "Malawi",               en: "🇲🇼 Malawi",               ar: "🇲🇼 مالاوي",                       tr: "🇲🇼 Malavi" },
  { value: "Malaysia",             en: "🇲🇾 Malaysia",             ar: "🇲🇾 ماليزيا",                      tr: "🇲🇾 Malezya" },
  { value: "Maldives",             en: "🇲🇻 Maldives",             ar: "🇲🇻 جزر المالديف",                 tr: "🇲🇻 Maldivler" },
  { value: "Mali",                 en: "🇲🇱 Mali",                 ar: "🇲🇱 مالي",                         tr: "🇲🇱 Mali" },
  { value: "Malta",                en: "🇲🇹 Malta",                ar: "🇲🇹 مالطا",                        tr: "🇲🇹 Malta" },
  { value: "Mauritania",           en: "🇲🇷 Mauritania",           ar: "🇲🇷 موريتانيا",                    tr: "🇲🇷 Moritanya" },
  { value: "Mauritius",            en: "🇲🇺 Mauritius",            ar: "🇲🇺 موريشيوس",                     tr: "🇲🇺 Mauritius" },
  { value: "Mexico",               en: "🇲🇽 Mexico",               ar: "🇲🇽 المكسيك",                      tr: "🇲🇽 Meksika" },
  { value: "Moldova",              en: "🇲🇩 Moldova",              ar: "🇲🇩 مولدوفا",                      tr: "🇲🇩 Moldova" },
  { value: "Mongolia",             en: "🇲🇳 Mongolia",             ar: "🇲🇳 منغوليا",                      tr: "🇲🇳 Moğolistan" },
  { value: "Montenegro",           en: "🇲🇪 Montenegro",           ar: "🇲🇪 الجبل الأسود",                 tr: "🇲🇪 Karadağ" },
  { value: "Mozambique",           en: "🇲🇿 Mozambique",           ar: "🇲🇿 موزمبيق",                      tr: "🇲🇿 Mozambik" },
  { value: "Myanmar",              en: "🇲🇲 Myanmar",              ar: "🇲🇲 ميانمار",                      tr: "🇲🇲 Myanmar" },

  // ── N ─────────────────────────────────────────────────────────────────────
  { value: "Namibia",              en: "🇳🇦 Namibia",              ar: "🇳🇦 ناميبيا",                      tr: "🇳🇦 Namibya" },
  { value: "Nepal",                en: "🇳🇵 Nepal",                ar: "🇳🇵 نيبال",                        tr: "🇳🇵 Nepal" },
  { value: "New Zealand",          en: "🇳🇿 New Zealand",          ar: "🇳🇿 نيوزيلندا",                    tr: "🇳🇿 Yeni Zelanda" },
  { value: "Nicaragua",            en: "🇳🇮 Nicaragua",            ar: "🇳🇮 نيكاراغوا",                    tr: "🇳🇮 Nikaragua" },
  { value: "Niger",                en: "🇳🇪 Niger",                ar: "🇳🇪 النيجر",                       tr: "🇳🇪 Nijer" },
  { value: "North Macedonia",      en: "🇲🇰 North Macedonia",      ar: "🇲🇰 مقدونيا الشمالية",             tr: "🇲🇰 Kuzey Makedonya" },

  // ── P ─────────────────────────────────────────────────────────────────────
  { value: "Palestine",            en: "🇵🇸 Palestine",            ar: "🇵🇸 فلسطين",                       tr: "🇵🇸 Filistin" },
  { value: "Panama",               en: "🇵🇦 Panama",               ar: "🇵🇦 بنما",                         tr: "🇵🇦 Panama" },
  { value: "Paraguay",             en: "🇵🇾 Paraguay",             ar: "🇵🇾 باراغواي",                     tr: "🇵🇾 Paraguay" },
  { value: "Peru",                 en: "🇵🇪 Peru",                 ar: "🇵🇪 بيرو",                         tr: "🇵🇪 Peru" },
  { value: "Philippines",          en: "🇵🇭 Philippines",          ar: "🇵🇭 الفلبين",                      tr: "🇵🇭 Filipinler" },

  // ── R ─────────────────────────────────────────────────────────────────────
  { value: "Romania",              en: "🇷🇴 Romania",              ar: "🇷🇴 رومانيا",                      tr: "🇷🇴 Romanya" },
  { value: "Rwanda",               en: "🇷🇼 Rwanda",               ar: "🇷🇼 رواندا",                       tr: "🇷🇼 Ruanda" },

  // ── S ─────────────────────────────────────────────────────────────────────
  { value: "Samoa",                en: "🇼🇸 Samoa",                ar: "🇼🇸 ساموا",                        tr: "🇼🇸 Samoa" },
  { value: "Senegal",              en: "🇸🇳 Senegal",              ar: "🇸🇳 السنغال",                      tr: "🇸🇳 Senegal" },
  { value: "Serbia",               en: "🇷🇸 Serbia",               ar: "🇷🇸 صربيا",                        tr: "🇷🇸 Sırbistan" },
  { value: "Sierra Leone",         en: "🇸🇱 Sierra Leone",         ar: "🇸🇱 سيراليون",                     tr: "🇸🇱 Sierra Leone" },
  { value: "Singapore",            en: "🇸🇬 Singapore",            ar: "🇸🇬 سنغافورة",                     tr: "🇸🇬 Singapur" },
  { value: "Slovakia",             en: "🇸🇰 Slovakia",             ar: "🇸🇰 سلوفاكيا",                     tr: "🇸🇰 Slovakya" },
  { value: "Slovenia",             en: "🇸🇮 Slovenia",             ar: "🇸🇮 سلوفينيا",                     tr: "🇸🇮 Slovenya" },
  { value: "Somalia",              en: "🇸🇴 Somalia",              ar: "🇸🇴 الصومال",                      tr: "🇸🇴 Somali" },
  { value: "South Africa",         en: "🇿🇦 South Africa",         ar: "🇿🇦 جنوب أفريقيا",                 tr: "🇿🇦 Güney Afrika" },
  { value: "South Korea",          en: "🇰🇷 South Korea",          ar: "🇰🇷 كوريا الجنوبية",               tr: "🇰🇷 Güney Kore" },
  { value: "South Sudan",          en: "🇸🇸 South Sudan",          ar: "🇸🇸 جنوب السودان",                 tr: "🇸🇸 Güney Sudan" },
  { value: "Sri Lanka",            en: "🇱🇰 Sri Lanka",            ar: "🇱🇰 سريلانكا",                     tr: "🇱🇰 Sri Lanka" },

  // ── T ─────────────────────────────────────────────────────────────────────
  { value: "Taiwan",               en: "🇹🇼 Taiwan",               ar: "🇹🇼 تايوان",                       tr: "🇹🇼 Tayvan" },
  { value: "Tajikistan",           en: "🇹🇯 Tajikistan",           ar: "🇹🇯 طاجيكستان",                    tr: "🇹🇯 Tacikistan" },
  { value: "Tanzania",             en: "🇹🇿 Tanzania",             ar: "🇹🇿 تنزانيا",                      tr: "🇹🇿 Tanzanya" },
  { value: "Thailand",             en: "🇹🇭 Thailand",             ar: "🇹🇭 تايلاند",                      tr: "🇹🇭 Tayland" },
  { value: "Togo",                 en: "🇹🇬 Togo",                 ar: "🇹🇬 توغو",                         tr: "🇹🇬 Togo" },
  { value: "Trinidad and Tobago",  en: "🇹🇹 Trinidad and Tobago",  ar: "🇹🇹 ترينيداد وتوباغو",             tr: "🇹🇹 Trinidad ve Tobago" },
  { value: "Turkmenistan",         en: "🇹🇲 Turkmenistan",         ar: "🇹🇲 تركمانستان",                   tr: "🇹🇲 Türkmenistan" },

  // ── U ─────────────────────────────────────────────────────────────────────
  { value: "Uganda",               en: "🇺🇬 Uganda",               ar: "🇺🇬 أوغندا",                       tr: "🇺🇬 Uganda" },
  { value: "Ukraine",              en: "🇺🇦 Ukraine",              ar: "🇺🇦 أوكرانيا",                     tr: "🇺🇦 Ukrayna" },
  { value: "Uruguay",              en: "🇺🇾 Uruguay",              ar: "🇺🇾 أوروغواي",                     tr: "🇺🇾 Uruguay" },
  { value: "Uzbekistan",           en: "🇺🇿 Uzbekistan",           ar: "🇺🇿 أوزبكستان",                    tr: "🇺🇿 Özbekistan" },

  // ── V ─────────────────────────────────────────────────────────────────────
  { value: "Venezuela",            en: "🇻🇪 Venezuela",            ar: "🇻🇪 فنزويلا",                      tr: "🇻🇪 Venezuela" },
  { value: "Vietnam",              en: "🇻🇳 Vietnam",              ar: "🇻🇳 فيتنام",                       tr: "🇻🇳 Vietnam" },

  // ── Z ─────────────────────────────────────────────────────────────────────
  { value: "Zambia",               en: "🇿🇲 Zambia",               ar: "🇿🇲 زامبيا",                       tr: "🇿🇲 Zambiya" },
  { value: "Zimbabwe",             en: "🇿🇼 Zimbabwe",             ar: "🇿🇼 زيمبابوي",                     tr: "🇿🇼 Zimbabve" },
];
