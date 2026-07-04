/**
 * WORD LISTS — Themed destinations for auto-generated crossword puzzles
 * Each destination has a word list + clues fed into the crossword generator.
 *
 * Structure:
 *  packs[] → pack { id, name, emoji, gradient, destinations[] }
 *  destination { id, name, flag, words: { WORD: 'clue text', ... } }
 */

export const PACKS = [
  {
    id: 'mediterranean',
    name: 'Mediterranean',
    emoji: '🌊',
    gradient: 'linear-gradient(135deg, hsl(200,70%,35%), hsl(175,60%,40%))',
    destinations: [
      {
        id: 'paris',
        name: 'Paris, France',
        flag: '🇫🇷',
        words: {
          EIFFEL:      'Iconic iron tower built in 1889',
          LOUVRE:      'World\'s largest art museum',
          CROISSANT:   'Flaky crescent-shaped pastry',
          BERET:       'Classic French flat-topped hat',
          SEINE:       'River flowing through the city',
          CAFE:        'French coffeehouse tradition',
          WINE:        'France\'s famous fermented grape drink',
          BAGUETTE:    'Long thin French bread',
          ART:         'What the Louvre is famous for',
          PARIS:       'City of Light',
        }
      },
      {
        id: 'rome',
        name: 'Rome, Italy',
        flag: '🇮🇹',
        words: {
          COLOSSEUM:   'Ancient amphitheater of gladiators',
          PIZZA:       'Italy\'s most exported food invention',
          TIBER:       'River that runs through Rome',
          FORUM:       'Ancient Roman marketplace',
          PASTA:       'Staple Italian wheat dish',
          CAESAR:      'Famous Roman ruler',
          GLADIATOR:   'Arena fighter of ancient Rome',
          GELATO:      'Creamy Italian frozen dessert',
          POPE:        'Leader of the Catholic Church',
          ROME:        'The Eternal City',
        }
      },
      {
        id: 'barcelona',
        name: 'Barcelona, Spain',
        flag: '🇪🇸',
        words: {
          GAUDI:       'Visionary architect of Sagrada Familia',
          TAPAS:       'Small Spanish sharing dishes',
          FLAMENCO:    'Passionate Spanish dance',
          SANGRIA:     'Spanish wine and fruit punch',
          PLAZA:       'Spanish public square',
          CATALAN:     'Language of the Barcelona region',
          PAELLA:      'Spanish saffron rice dish',
          GOTHIC:      'Historic quarter of Barcelona',
          BEACH:       'Barcelona\'s famous coastal strip',
          SIESTA:      'Spanish afternoon rest tradition',
        }
      },
      {
        id: 'santorini',
        name: 'Santorini, Greece',
        flag: '🇬🇷',
        words: {
          CALDERA:     'Volcanic crater filled with sea',
          OLIVES:      'Greek culinary staple',
          ZEUS:        'King of the Greek gods',
          AEGEAN:      'Sea surrounding the Greek islands',
          FETA:        'Greek white brined cheese',
          ACROPOLIS:   'Ancient hilltop citadel',
          ORACLE:      'Ancient Greek prophet',
          ODYSSEY:     'Epic journey of Greek myth',
          MYTH:        'Traditional Greek story',
          SUNSET:      'Oia is world-famous for this',
        }
      },
      {
        id: 'istanbul',
        name: 'Istanbul, Türkiye',
        flag: '🇹🇷',
        words: {
          BOSPHORUS:   'Strait dividing Europe and Asia',
          BAZAAR:      'Traditional Turkish marketplace',
          MOSQUE:      'Islamic place of worship',
          OTTOMAN:     'Great Turkish empire',
          KEBAB:       'Turkish grilled meat dish',
          HAMMAM:      'Traditional Turkish bath',
          TULIP:       'Symbol of Ottoman culture',
          CARPET:      'Famous Turkish handwoven export',
          SPICE:       'What the grand bazaar sells',
          BRIDGE:      'Istanbul spans two continents via these',
        }
      },
    ]
  },
  {
    id: 'asia',
    name: 'Asia Pacific',
    emoji: '🌏',
    gradient: 'linear-gradient(135deg, hsl(10,70%,35%), hsl(35,65%,40%))',
    destinations: [
      {
        id: 'tokyo',
        name: 'Tokyo, Japan',
        flag: '🇯🇵',
        words: {
          SUSHI:       'Japanese rice and seafood dish',
          FUJI:        'Japan\'s iconic sacred volcano',
          SAMURAI:     'Ancient Japanese warrior class',
          RAMEN:       'Japanese noodle soup',
          KIMONO:      'Traditional Japanese garment',
          SAKURA:      'Japanese cherry blossom',
          SHOGUN:      'Feudal Japanese military ruler',
          TORII:       'Traditional Japanese gate',
          ANIME:       'Japan\'s distinctive animation style',
          NINJA:       'Japanese covert agent',
        }
      },
      {
        id: 'bali',
        name: 'Bali, Indonesia',
        flag: '🇮🇩',
        words: {
          TEMPLE:      'Sacred Hindu place of worship',
          RICE:        'Bali\'s terraced crop landscape',
          SURFING:     'Popular sport on Bali\'s beaches',
          BATIK:       'Traditional Indonesian wax fabric art',
          MONKEY:      'Sacred animal found in Ubud forest',
          LOTUS:       'Sacred flower in Balinese culture',
          VOLCANO:     'Mount Agung towers over the island',
          YOGA:        'Ubud is a global center for this',
          KUTA:        'Famous beach and resort area',
          INCENSE:     'Used in Balinese daily offerings',
        }
      },
      {
        id: 'beijing',
        name: 'Beijing, China',
        flag: '🇨🇳',
        words: {
          PANDA:       'China\'s beloved national animal',
          DRAGON:      'Symbol of Chinese power and luck',
          DYNASTY:     'Period of rule by one family',
          TEMPLE:      'Place of Chinese worship',
          KUNG:        'Chinese martial art prefix',
          JADE:        'Precious green stone in Chinese culture',
          SILK:        'China\'s famous ancient export',
          LANTERN:     'Used in the Chinese New Year festival',
          WALL:        'Great barrier built across northern China',
          TEA:         'China\'s most beloved beverage',
        }
      },
      {
        id: 'mumbai',
        name: 'Mumbai, India',
        flag: '🇮🇳',
        words: {
          BOLLYWOOD:   'India\'s famous film industry',
          CURRY:       'Spiced Indian dish',
          SARI:        'Traditional Indian women\'s garment',
          SPICES:      'India is the world\'s leading producer',
          MONSOON:     'Annual heavy rainfall season',
          YOGA:        'Ancient Indian mind-body practice',
          GANGES:      'India\'s sacred river',
          DIWALI:      'Festival of Lights',
          CHAI:        'Indian spiced tea',
          GATEWAY:     'Famous Mumbai arch by the sea',
        }
      },
      {
        id: 'seoul',
        name: 'Seoul, South Korea',
        flag: '🇰🇷',
        words: {
          KIMCHI:      'Fermented Korean cabbage dish',
          KPOP:        'South Korea\'s global music genre',
          PALACE:      'Gyeongbokgung is Seoul\'s most famous',
          TAEKWONDO:   'Korean martial art',
          BIBIMBAP:    'Korean mixed rice bowl dish',
          LANTERN:     'Floated on rivers during festivals',
          HANBOK:      'Traditional Korean formal clothing',
          TECH:        'Seoul is a global technology hub',
          NOODLES:     'Key ingredient of Korean soups',
          DYNASTY:     'Joseon era ruled for 500 years',
        }
      },
      {
        id: 'lahore',
        name: 'Lahore, Pakistan',
        flag: '🇵🇰',
        words: {
          SHALIMAR:    'Famous Mughal gardens in Lahore',
          FORT:        'Royal citadel built in the Mughal era',
          BIRYANI:     'Traditional spiced rice dish',
          KULFI:       'Traditional frozen dairy dessert',
          MOSQUE:      'Badshahi landmark in Lahore',
          KAMEEZ:      'Long shirt of Pakistan\'s national dress',
          SHALWAR:     'Loose trousers worn with a kameez',
          SITAR:       'Classical stringed musical instrument',
          CHAI:        'Traditional spiced tea beverage',
          MINAR:       'Monument marking the independence resolution',
        }
      },
    ]
  },
  {
    id: 'americas',
    name: 'The Americas',
    emoji: '🌎',
    gradient: 'linear-gradient(135deg, hsl(145,55%,28%), hsl(90,55%,32%))',
    destinations: [
      {
        id: 'newyork',
        name: 'New York, USA',
        flag: '🇺🇸',
        words: {
          BROADWAY:    'Famous NYC theater district',
          LIBERTY:     'Iconic statue in New York harbor',
          MANHATTAN:   'Core island borough of NYC',
          BAGEL:       'NYC breakfast bread staple',
          SUBWAY:      'NYC underground transport system',
          JAZZ:        'Music genre born in America',
          SKYLINE:     'NYC is famous for this city silhouette',
          BROOKLYN:    'Borough known for its bridge',
          PIZZA:       'NYC style is thin and foldable',
          EMPIRE:      'Famous Art Deco skyscraper',
        }
      },
      {
        id: 'rio',
        name: 'Rio de Janeiro, Brazil',
        flag: '🇧🇷',
        words: {
          CARNIVAL:    'World\'s largest festival held in Rio',
          SAMBA:       'Brazilian dance and music style',
          CHRIST:      'Famous statue on Corcovado mountain',
          COPACABANA:  'World-famous Rio beach',
          AMAZON:      'Massive river and rainforest',
          FOOTBALL:    'Brazil\'s most beloved sport',
          SUGARLOAF:   'Iconic rock formation in the bay',
          CAIPIRINHA:  'Brazil\'s national cocktail',
          JUNGLE:      'Amazon forest surrounds Brazil',
          BEACH:       'Rio\'s coastline is world-renowned',
        }
      },
      {
        id: 'mexico',
        name: 'Mexico City, Mexico',
        flag: '🇲🇽',
        words: {
          TACO:        'Folded tortilla street food',
          AZTEC:       'Ancient Mexican civilization',
          MARIACHI:    'Traditional Mexican musical group',
          PYRAMID:     'Ancient Mexican stepped structure',
          CACTUS:      'Symbol of the Mexican landscape',
          SALSA:       'Spicy Mexican tomato sauce or dance',
          JAGUAR:      'Sacred animal of Mesoamerica',
          MURAL:       'Diego Rivera made these famous',
          AVOCADO:     'Mexico is the world\'s top producer',
          FIESTA:      'Mexican festival or party',
        }
      },
      {
        id: 'machu',
        name: 'Machu Picchu, Peru',
        flag: '🇵🇪',
        words: {
          INCA:        'Ancient South American civilization',
          LLAMA:       'Andean pack animal',
          ANDES:       'South American mountain range',
          QUECHUA:     'Indigenous Andean language',
          CONDOR:      'Giant Andean sacred bird',
          ALPACA:      'Andean wool-producing animal',
          RUINS:       'What Machu Picchu\'s structures are',
          CLOUD:       'Machu Picchu is a cloud-forest city',
          TEMPLE:      'Inca place of worship',
          TREK:        'Famous Inca trail activity',
        }
      },
    ]
  },
  {
    id: 'africa',
    name: 'Africa',
    emoji: '🌍',
    gradient: 'linear-gradient(135deg, hsl(25,75%,35%), hsl(50,70%,38%))',
    destinations: [
      {
        id: 'cairo',
        name: 'Cairo, Egypt',
        flag: '🇪🇬',
        words: {
          PYRAMID:     'Ancient Egyptian royal tomb',
          PHARAOH:     'Ruler of ancient Egypt',
          SPHINX:      'Limestone statue near Giza',
          NILE:        'World\'s longest river',
          MUMMY:       'Preserved ancient Egyptian body',
          HIEROGLYPH:  'Ancient Egyptian picture writing',
          CLEOPATRA:   'Famous Egyptian queen',
          SCARAB:      'Sacred Egyptian beetle symbol',
          PAPYRUS:     'Ancient Egyptian paper plant',
          ANKH:        'Egyptian symbol of life',
        }
      },
      {
        id: 'safari',
        name: 'Serengeti, Tanzania',
        flag: '🇹🇿',
        words: {
          SAFARI:      'Wildlife observation trip in Africa',
          ELEPHANT:    'World\'s largest land mammal',
          LION:        'King of the African savanna',
          WILDEBEEST:  'Great migration animal',
          SAVANNA:     'African tropical grassland',
          CHEETAH:     'World\'s fastest land animal',
          GIRAFFE:     'Tallest living terrestrial animal',
          ACACIA:      'Tree iconic to African plains',
          ZEBRA:       'African striped horse relative',
          MIGRATION:   'Annual wildebeest spectacle',
        }
      },
      {
        id: 'cape',
        name: 'Cape Town, South Africa',
        flag: '🇿🇦',
        words: {
          MANDELA:     'South Africa\'s iconic freedom leader',
          VINEYARD:    'Cape winelands famous landmark',
          PENGUIN:     'Found on Boulders Beach near Cape Town',
          MOUNTAIN:    'Table Mountain overlooks the city',
          SHARK:       'Great whites circle these waters',
          CAPE:        'Southernmost tip of Africa',
          RAINBOW:     'South Africa\'s "Rainbow Nation" identity',
          UBUNTU:      'African philosophy of community',
          DIAMOND:     'South Africa\'s historic export',
          BRAAI:       'South African barbecue tradition',
        }
      },
    ]
  },
  {
    id: 'europe',
    name: 'Europe',
    emoji: '🏰',
    gradient: 'linear-gradient(135deg, hsl(240,45%,32%), hsl(270,40%,38%))',
    destinations: [
      {
        id: 'london',
        name: 'London, UK',
        flag: '🇬🇧',
        words: {
          BIG:         'London\'s famous clock tower nickname',
          THAMES:      'River flowing through London',
          QUEEN:       'British royal female monarch',
          PARLIAMENT:  'UK law-making institution',
          DOUBLE:      'London\'s iconic red bus type',
          SHAKESPEARE: 'England\'s most famous playwright',
          TOWER:       'Historic London castle and prison',
          SOCCER:      'Football was invented in England',
          PUB:         'Traditional English drinking establishment',
          TUBE:        'London\'s underground railway nickname',
        }
      },
      {
        id: 'amsterdam',
        name: 'Amsterdam, Netherlands',
        flag: '🇳🇱',
        words: {
          TULIP:       'Netherlands\' iconic flower export',
          CANAL:       'Amsterdam\'s famous waterways',
          WINDMILL:    'Dutch engineering icon',
          BICYCLE:     'Amsterdam\'s primary transport mode',
          CHEESE:      'Gouda and Edam are Dutch varieties',
          REMBRANDT:   'Master Dutch Golden Age painter',
          CLOGS:       'Traditional Dutch wooden shoes',
          ANNE:        'Famous diarist who hid in Amsterdam',
          DUTCH:       'Language of the Netherlands',
          DAM:         'Central square of Amsterdam',
        }
      },
      {
        id: 'prague',
        name: 'Prague, Czech Republic',
        flag: '🇨🇿',
        words: {
          CASTLE:      'Prague Castle dominates the skyline',
          BOHEMIA:     'Historic Czech region',
          BEER:        'Czech Republic leads world consumption per capita',
          GOTHIC:      'Prague\'s Old Town architectural style',
          BRIDGE:      'Charles Bridge spans the Vltava',
          CLOCK:       'Astronomical clock on Old Town Square',
          BAROQUE:     'Ornate European architectural style',
          VLTAVA:      'River running through Prague',
          PUPPET:      'Traditional Czech theatrical art',
          COBBLESTONE: 'Material paving Prague\'s old streets',
        }
      },
    ]
  },
  {
    id: 'oceania',
    name: 'Oceania',
    emoji: '🦘',
    gradient: 'linear-gradient(135deg, hsl(185,60%,28%), hsl(160,55%,32%))',
    destinations: [
      {
        id: 'sydney',
        name: 'Sydney, Australia',
        flag: '🇦🇺',
        words: {
          OPERA:       'Sydney\'s iconic waterfront venue',
          HARBOUR:     'Sydney\'s famous natural port',
          KANGAROO:    'Australia\'s marsupial symbol',
          KOALA:       'Australian eucalyptus-eating marsupial',
          SURFING:     'Bondi Beach sport',
          OUTBACK:     'Australia\'s remote inland region',
          BOOMERANG:   'Aboriginal returning hunting tool',
          VEGEMITE:    'Iconic Australian yeast spread',
          REEF:        'Great Barrier Reef off Australia\'s coast',
          DINGO:       'Australian wild dog',
        }
      },
      {
        id: 'newzealand',
        name: 'New Zealand',
        flag: '🇳🇿',
        words: {
          HOBBIT:      'Fantasy character from NZ films',
          MAORI:       'Indigenous people of New Zealand',
          KIWI:        'New Zealand\'s national bird and nickname',
          FJORD:       'Milford Sound is the most famous',
          RUGBY:       'New Zealand\'s national sport',
          GEYSER:      'Rotorua\'s geothermal attraction',
          BUNGEE:      'Extreme sport invented in New Zealand',
          HAKA:        'Maori war dance',
          SHEEP:       'NZ has far more sheep than people',
          GLACIER:     'Franz Josef is a famous example',
        }
      },
      {
        id: 'hawaii',
        name: 'Hawaii, USA',
        flag: '🌺',
        words: {
          ALOHA:       'Hawaiian greeting and farewell',
          HULA:        'Traditional Hawaiian dance',
          VOLCANO:     'Kilauea is one of the world\'s most active',
          LUAU:        'Hawaiian feast and celebration',
          SURF:        'Hawaii is the birthplace of surfing',
          PINEAPPLE:   'Hawaii\'s iconic tropical fruit',
          UKULELE:     'Small Hawaiian string instrument',
          MAHALO:      'Hawaiian word for thank you',
          CORAL:       'Found in Hawaiian reef ecosystems',
          LAVA:        'Rock formed from volcanic eruptions',
        }
      },
    ]
  }
];

/**
 * Get all destinations as a flat array
 */
export function getAllDestinations() {
  return PACKS.flatMap(pack =>
    pack.destinations.map(dest => ({ ...dest, packId: pack.id, packName: pack.name }))
  );
}

/**
 * Get a destination by id
 */
export function getDestination(id) {
  return getAllDestinations().find(d => d.id === id);
}

/**
 * Get a pack by id
 */
export function getPack(id) {
  return PACKS.find(p => p.id === id);
}
