// data/default-tree.js
//
// The starting dataset for the tree editor. This is the Okrut & Karpenko
// family tree, converted from the static diagram into the editable data
// model the app uses. You can freely edit, delete, or add to this from
// inside the app itself - this file only matters as the tree you see the
// very first time you open the app (or after you clear local storage).
//
// PERSON shape:
//   { id, firstName, middleName, lastName, notes: [line, line, ...],
//     x, y, category, isPlaceholder, locked }
//
// UNION shape (a set of 1-2 partners and their shared children):
//   { id, partnerIds: [id] | [id, id], childIds: [id, ...],
//     connector: { dropY, parentAnchorX, childAnchors: { childId: x } },
//     customRoutes: { childId: [[x,y], [x,y], ...] } }
//
// customRoutes overrides the automatic bar-and-stub rendering for a
// specific child's connection with a hand-drawn polyline, when present.

export const defaultPeople = [
  { id: "klim-sr", firstName: "Klim", lastName: "Okrut", notes: ["b. c. 1848?", "d. c. 1954? \u00b7 wife Malanya died young"], x: 260, y: 90, category: "paternal" },
  { id: "malanya", firstName: "Malanya", lastName: "", notes: ["Klim's wife; died young"], x: 400, y: 90, category: "paternal" },
  { id: "yakov", firstName: "Yakov", lastName: "Beloushko", notes: ["Russo-Japanese War 1905 \u00b7 St. George Cross"], x: 800, y: 90, category: "paternal" },
  { id: "marylya", firstName: "Marylya", lastName: "Migas", notes: ["kept Orthodox faith through Soviet era"], x: 940, y: 90, category: "paternal" },

  { id: "prokop", firstName: "Prokop", lastName: "Okrut", notes: ["did not fight in WWII"], x: 90, y: 330, category: "paternal" },
  { id: "avdotya", firstName: "Avdotya", lastName: "", notes: ["wife of Prokop"], x: 210, y: 330, category: "paternal" },
  { id: "klim-jr", firstName: "Klim", lastName: "Okrut Jr.", notes: ["remembered from a family visit"], x: 330, y: 330, category: "paternal" },
  { id: "agapa", firstName: "Agapa", lastName: "Prokopchik", notes: ["wife of Klim Jr."], x: 450, y: 330, category: "paternal" },
  { id: "yustin", firstName: "Yustin (Ustin)", lastName: "Okrut", notes: ["b. 1902", "d. 5/2/1945 \u00b7 tailor"], x: 570, y: 330, category: "paternal" },
  { id: "tekla", firstName: "Tekla", lastName: "Beloushko", notes: ["\"Fekla\""], x: 690, y: 330, category: "paternal" },
  { id: "vasyl", firstName: "Vasyl", lastName: "Beloushko", notes: ["mobilized 1941 \u00b7 killed in WWII"], x: 810, y: 330, category: "paternal" },
  { id: "stepan", firstName: "Stepan", lastName: "Beloushko", notes: ["mobilized 1944 \u00b7 killed in WWII"], x: 930, y: 330, category: "paternal" },
  { id: "andrey-b", firstName: "Andrey", lastName: "Beloushko", notes: ["mobilized 1944 \u00b7 killed in WWII"], x: 1050, y: 330, category: "paternal" },
  { id: "vera", firstName: "Vera", lastName: "", notes: ["b. 1913 \u00b7 ~Volga region"], x: 1250, y: 330, category: "paternal" },
  { id: "musa", firstName: "Musa", lastName: "", notes: ["~Azerbaijan"], x: 1370, y: 330, category: "paternal" },
  { id: "dmitri", firstName: "Dmitri", lastName: "Smirnov", notes: ["father of Nina"], x: 1570, y: 330, category: "paternal" },
  { id: "unnamed-farafmom", firstName: "", lastName: "", notes: ["name unknown"], x: 1770, y: 330, category: "paternal", isPlaceholder: true },
  { id: "mikhail-f", firstName: "Mikhail", lastName: "Farafonov", notes: [], x: 1890, y: 330, category: "paternal" },
  { id: "maria-izo", firstName: "Maria", lastName: "Izosimovna", notes: ["~Volga region"], x: 2150, y: 330, category: "maternal" },
  { id: "alexander-y", firstName: "Alexander", lastName: "Yakovlev", notes: [], x: 2270, y: 330, category: "maternal" },
  { id: "anna-t", firstName: "Anna", lastName: "Tarasovich", notes: [], x: 2390, y: 330, category: "maternal" },
  { id: "grigory-t", firstName: "Grigory", lastName: "Tarasovich", notes: [], x: 2510, y: 330, category: "maternal" },
  { id: "maria-k", firstName: "Maria", lastName: "Karpenko", notes: [], x: 2750, y: 330, category: "maternal" },
  { id: "fedosey-k", firstName: "Fedosey", lastName: "Karpenko", notes: [], x: 2870, y: 330, category: "maternal" },

  { id: "ivan-o", firstName: "Ivan", lastName: "Okrut", notes: ["Semezhevo, Belarus", "WWII memory: \"Simonovichi, June 27\""], x: 630, y: 570, category: "paternal" },
  { id: "maria-u", firstName: "Maria", lastName: "Okrut (Ustinovna)", notes: ["b. 1937", "d. 11/5/2014"], x: 800, y: 570, category: "paternal" },
  { id: "ivan-o2", firstName: "Ivan", lastName: "Okrut", notes: ["distant relative \u00b7 d. 2016"], x: 920, y: 570, category: "collateral" },
  { id: "tanya", firstName: "Tanya", lastName: "", notes: ["remembered from a family stay"], x: 1040, y: 570, category: "paternal" },
  { id: "andrey-z", firstName: "Andrey", lastName: "Zlobich", notes: ["Tanya's husband"], x: 1160, y: 570, category: "collateral" },
  { id: "sona", firstName: "Sona", lastName: "Okrut", notes: ["Baku, Azerbaijan", "n\u00e9e Guseynova"], x: 1310, y: 570, category: "paternal" },
  { id: "nina", firstName: "Nina", lastName: "Farafonova", notes: ["6/26/1928", "d. 2/23/1979 \u00b7 n\u00e9e Smirnova"], x: 1570, y: 570, category: "paternal" },
  { id: "constantin", firstName: "Constantin", lastName: "Farafonov", notes: ["b. 1923 \u00b7 ~Russian Far East", "d. 4/30/1979"], x: 1830, y: 570, category: "paternal" },
  { id: "anastasia", firstName: "Anastasia", lastName: "Galochkina", notes: ["~Volga region"], x: 2210, y: 570, category: "maternal" },
  { id: "vladimir", firstName: "Vladimir", lastName: "Kovalev", notes: [], x: 2330, y: 570, category: "maternal" },
  { id: "valentina", firstName: "Valentina", lastName: "Karpenko", notes: ["n\u00e9e Selezneva"], x: 2505, y: 570, category: "maternal" },
  { id: "grigory-k", firstName: "Grigory", lastName: "Karpenko", notes: ["\"Grisha\" \u00b7 military service"], x: 2625, y: 570, category: "maternal" },

  { id: "alena", firstName: "Alena", lastName: "", notes: ["adopted daughter"], x: 860, y: 810, category: "collateral" },
  { id: "sergey", firstName: "Sergey", lastName: "Okrut", notes: ["11/15/1956"], x: 970, y: 810, category: "paternal" },
  { id: "natalya-f", firstName: "Natalya", lastName: "Farafonova", notes: ["12/29/1961", "\"Natasha\""], x: 1700, y: 810, category: "paternal" },
  { id: "evgeny", firstName: "Evgeny", lastName: "Pereverzev", notes: [], x: 2050, y: 810, category: "maternal" },
  { id: "tamara", firstName: "Tamara", lastName: "Galochkina", notes: [], x: 2200, y: 810, category: "maternal" },
  { id: "tatiana", firstName: "Tatiana", lastName: "Galochkina", notes: ["3/21/1954"], x: 2340, y: 810, category: "maternal" },
  { id: "yuri", firstName: "Yuri", lastName: "Karpenko", notes: ["4/24/1954"], x: 2490, y: 810, category: "maternal" },
  { id: "ludmila", firstName: "Ludmila", lastName: "Karpenko", notes: ["married name Papakhin"], x: 2640, y: 810, category: "maternal" },

  { id: "maria-o", firstName: "Maria", lastName: "Okrut", notes: ["Anton's sister"], x: 1035, y: 1050, category: "paternal" },
  { id: "anton", firstName: "Anton", lastName: "Okrut", notes: ["9/14/1984 \u00b7 Kharkiv, Ukraine"], x: 1635, y: 1050, category: "paternal" },
  { id: "ilona", firstName: "Ilona", lastName: "Karpenko", notes: ["1/23/1983 \u00b7 Kyiv or Berdyansk"], x: 1835, y: 1050, category: "merge" },
  { id: "oleg", firstName: "Oleg", lastName: "Karpenko", notes: [], x: 2035, y: 1050, category: "maternal" },
  { id: "ekaterina", firstName: "Ekaterina", lastName: "Zabiyakina", notes: ["\"Katya\" \u00b7 family lives in Russia"], x: 2235, y: 1050, category: "maternal" },
  { id: "vasily-perev", firstName: "Vasily", lastName: "Pereverzev", notes: [], x: 2450, y: 1050, category: "maternal" },
  { id: "polina-perev", firstName: "Polina", lastName: "Pereverzeva", notes: [], x: 2600, y: 1050, category: "maternal" },
  { id: "aleksey-pap", firstName: "Aleksey", lastName: "Papakhin", notes: [], x: 2820, y: 1050, category: "maternal" },
  { id: "natalya-pap", firstName: "Natalya", lastName: "Papakhina", notes: [], x: 2970, y: 1050, category: "maternal" },
  { id: "vasily-vesel", firstName: "Vasily", lastName: "Veselovsky", notes: [], x: 3120, y: 1050, category: "maternal" },

  { id: "michael", firstName: "Michael", lastName: "Okrut", notes: ["1/6/2011 \u00b7 Bellevue, WA"], x: 1645, y: 1290, category: "merge" },
  { id: "oliver", firstName: "Oliver", lastName: "Okrut", notes: [], x: 1825, y: 1290, category: "merge" },
  { id: "egor", firstName: "Egor", lastName: "Karpenko", notes: ["lives in Russia"], x: 2135, y: 1290, category: "maternal" },
  { id: "viktoria", firstName: "Viktoria", lastName: "Papakhin", notes: [], x: 2820, y: 1290, category: "maternal" },
  { id: "alexandr", firstName: "Alexandr", lastName: "Veselovsky", notes: [], x: 3045, y: 1290, category: "maternal" }
];

// Each union's connector.dropY/parentAnchorX/childAnchors default to sane
// positions derived from the people above; see model.js#deriveConnector
// for how these get computed the first time a union is created in-app.
// Here we hand-place them to match the original diagram exactly.
export const defaultUnions = [
  { id: "u1", partnerIds: ["klim-sr", "malanya"], childIds: ["prokop", "klim-jr", "yustin"], connector: { dropY: 195, parentAnchorX: 330, childAnchors: { "prokop": 90, "klim-jr": 330, "yustin": 570 } } },
  { id: "u2", partnerIds: ["yakov", "marylya"], childIds: ["tekla", "vasyl", "stepan", "andrey-b"], connector: { dropY: 195, parentAnchorX: 870, childAnchors: { "tekla": 690, "vasyl": 810, "stepan": 930, "andrey-b": 1050 } } },
  { id: "u3", partnerIds: ["vera", "musa"], childIds: ["sona"], connector: { dropY: 450, parentAnchorX: 1310, childAnchors: { "sona": 1310 } } },
  { id: "u4", partnerIds: ["unnamed-farafmom", "mikhail-f"], childIds: ["constantin"], connector: { dropY: 450, parentAnchorX: 1830, childAnchors: { "constantin": 1830 } } },
  { id: "u5", partnerIds: ["dmitri"], childIds: ["nina"], connector: { dropY: 450, parentAnchorX: 1570, childAnchors: { "nina": 1570 } } },
  { id: "u6", partnerIds: ["maria-izo", "alexander-y"], childIds: ["anastasia"], connector: { dropY: 450, parentAnchorX: 2210, childAnchors: { "anastasia": 2210 } } },
  { id: "u7", partnerIds: ["anna-t", "grigory-t"], childIds: ["vladimir"], connector: { dropY: 450, parentAnchorX: 2450, childAnchors: { "vladimir": 2330 } } },
  { id: "u8", partnerIds: ["maria-k", "fedosey-k"], childIds: ["grigory-k"], connector: { dropY: 450, parentAnchorX: 2810, childAnchors: { "grigory-k": 2625 } } },
  { id: "u9", partnerIds: ["yustin", "tekla"], childIds: ["ivan-o", "maria-u", "tanya"], connector: { dropY: 435, parentAnchorX: 630, childAnchors: { "ivan-o": 630, "maria-u": 800, "tanya": 1040 } } },
  { id: "u10", partnerIds: ["maria-u", "ivan-o2"], childIds: ["alena"], connector: { dropY: 690, parentAnchorX: 860, childAnchors: { "alena": 860 } } },
  { id: "u11", partnerIds: ["tanya", "andrey-z"], childIds: [], connector: { dropY: 690, parentAnchorX: 1100, childAnchors: {} } },
  { id: "u12", partnerIds: ["ivan-o", "sona"], childIds: ["sergey"], connector: { dropY: 690, parentAnchorX: 970, childAnchors: { "sergey": 970 } } },
  { id: "u13", partnerIds: ["nina", "constantin"], childIds: ["natalya-f"], connector: { dropY: 690, parentAnchorX: 1700, childAnchors: { "natalya-f": 1700 } } },
  { id: "u14", partnerIds: ["anastasia", "vladimir"], childIds: ["tatiana", "tamara"], connector: { dropY: 610, parentAnchorX: 2270, childAnchors: { "tatiana": 2340, "tamara": 2200 } } },
  { id: "u15", partnerIds: ["valentina", "grigory-k"], childIds: ["yuri", "ludmila"], connector: { dropY: 610, parentAnchorX: 2565, childAnchors: { "yuri": 2490, "ludmila": 2640 } } },
  { id: "u16", partnerIds: ["sergey", "natalya-f"], childIds: ["maria-o", "anton"], connector: { dropY: 900, parentAnchorX: 1335, childAnchors: { "maria-o": 1035, "anton": 1635 } } },
  { id: "u17", partnerIds: ["tatiana", "yuri"], childIds: ["ilona", "oleg"], connector: { dropY: 870, parentAnchorX: 2415, childAnchors: { "ilona": 1835, "oleg": 2035 } } },
  { id: "u18", partnerIds: ["evgeny", "tamara"], childIds: ["vasily-perev", "polina-perev"], connector: { dropY: 900, parentAnchorX: 2200, childAnchors: { "vasily-perev": 2450, "polina-perev": 2600 } } },
  { id: "u19", partnerIds: ["ludmila"], childIds: ["aleksey-pap", "natalya-pap"], connector: { dropY: 900, parentAnchorX: 2895, childAnchors: { "aleksey-pap": 2820, "natalya-pap": 2970 } } },
  { id: "u20", partnerIds: ["natalya-pap", "vasily-vesel"], childIds: ["alexandr"], connector: { dropY: 1155, parentAnchorX: 3045, childAnchors: { "alexandr": 3045 } } },
  { id: "u21", partnerIds: ["aleksey-pap"], childIds: ["viktoria"], connector: { dropY: 1155, parentAnchorX: 2820, childAnchors: { "viktoria": 2820 } } },
  { id: "u22", partnerIds: ["anton", "ilona"], childIds: ["michael", "oliver"], connector: { dropY: 1155, parentAnchorX: 1735, childAnchors: { "michael": 1645, "oliver": 1825 } } },
  { id: "u23", partnerIds: ["oleg", "ekaterina"], childIds: ["egor"], connector: { dropY: 1155, parentAnchorX: 2135, childAnchors: { "egor": 2135 } } }
];
