import { Category } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'animals',
    name: 'Animals',
    description: 'Test your knowledge on creatures from the wild savannah to the deep oceans.',
    icon: 'PawPrint',
    items: [
      {
        id: 'a1',
        name: 'Lion',
        imageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=600&auto=format&fit=crop&q=80',
        clue: 'Often dubbed the "King of the Jungle," this majestic big cat is known for its loud roar and impressive mane.',
        choices: ['Lion', 'Tiger', 'Leopard', 'Panther']
      },
      {
        id: 'a2',
        name: 'Elephant',
        imageUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=600&auto=format&fit=crop&q=80',
        clue: 'The largest living land mammal, possessing a highly versatile muscular trunk, large fan-like ears, and solid tusks.',
        choices: ['Rhino', 'Hippo', 'Elephant', 'Giraffe']
      },
      {
        id: 'a3',
        name: 'Panda',
        imageUrl: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600&auto=format&fit=crop&q=80',
        clue: 'A beloved black-and-white bear native to mountain forests of China that feeds almost exclusively on bamboo stems.',
        choices: ['Koala', 'Panda', 'Grizzly Bear', 'Sloth']
      },
      {
        id: 'a4',
        name: 'Penguin',
        imageUrl: 'https://images.unsplash.com/photo-1517783999520-f068d7431a60?w=600&auto=format&fit=crop&q=80',
        clue: 'A flightless, aquatic bird with tuxedo-patterned feathers, mostly native to the bitter cold environments of the Southern Hemisphere.',
        choices: ['Penguin', 'Puffin', 'Albatross', 'Seagull']
      },
      {
        id: 'a5',
        name: 'Owl',
        imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=600&auto=format&fit=crop&q=80',
        clue: 'An incredibly sharp-sighted nocturnal bird of prey with large forward-facing eyes, a curved beak, and silent flight feathers.',
        choices: ['Hawk', 'Eagle', 'Falcon', 'Owl']
      },
      {
        id: 'a6',
        name: 'Koala',
        imageUrl: 'https://images.unsplash.com/photo-1579712261944-a15d0cc7b9ff?w=600&auto=format&fit=crop&q=80',
        clue: 'An Australian tree-dwelling herbivorous marsupial that spends its life sleeping and eating fibrous eucalyptus leaves.',
        choices: ['Wombat', 'Koala', 'Kangaroo', 'Opossum']
      },
      {
        id: 'a7',
        name: 'Dolphin',
        imageUrl: 'https://images.unsplash.com/photo-1518887570146-0612132dd618?w=600&auto=format&fit=crop&q=80',
        clue: 'An exceptionally social and intelligent marine mammal, famous for its playful acrobatics, clicking sounds, and curved snout.',
        choices: ['Dolphin', 'Shark', 'Orca', 'Seal']
      },
      {
        id: 'a8',
        name: 'Red Panda',
        imageUrl: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=600&auto=format&fit=crop&q=80',
        clue: 'A small, rust-colored carnivoran mammal native to the eastern Himalayas, with a bushy ringed tail and cat-like white whiskers.',
        choices: ['Raccoon', 'Red Panda', 'Fox', 'Red Squirrel']
      }
    ]
  },
  {
    id: 'landmarks',
    name: 'Landmarks',
    description: 'Explore breathtaking architectural marvels and historic wonders from across the globe.',
    icon: 'MapPin',
    items: [
      {
        id: 'l1',
        name: 'Eiffel Tower',
        imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80',
        clue: 'A world-famous nineteenth-century wrought-iron lattice tower soaring high on the Champ de Mars of Paris, France.',
        choices: ['Eiffel Tower', 'Empire State Building', 'Big Ben', 'Tokyo Tower']
      },
      {
        id: 'l2',
        name: 'Taj Mahal',
        imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&auto=format&fit=crop&q=80',
        clue: 'An immense, symmetrical ivory-white marble mausoleum commissioned on the Yamuna riverbank in Agra, India, by a grieving emperor.',
        choices: ['Lotus Temple', 'Taj Mahal', 'Angkor Wat', 'Golden Temple']
      },
      {
        id: 'l3',
        name: 'Colosseum',
        imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&auto=format&fit=crop&q=80',
        clue: 'An oval stone amphitheater located right in the center of Rome, Italy, famous for hosting ancient gladiatorial battles.',
        choices: ['Parthenon', 'Colosseum', 'Pantheon', 'Acropolis']
      },
      {
        id: 'l4',
        name: 'Statue of Liberty',
        imageUrl: 'https://images.unsplash.com/photo-1505245669107-11ca1a1b0294?w=600&auto=format&fit=crop&q=80',
        clue: 'A colossal neoclassical copper sculpture greeting ships in New York Harbor, gifted to the United States by France as a symbol of freedom.',
        choices: ['Statue of Liberty', 'Christ the Redeemer', 'Golden Gate Bridge', 'Washington Monument']
      },
      {
        id: 'l5',
        name: 'Machu Picchu',
        imageUrl: 'https://images.unsplash.com/photo-1508919801845-fc2ae1bc2a28?w=600&auto=format&fit=crop&q=80',
        clue: 'An extraordinary 15th-century Inca citadel built high up on a tropical mountain ridge in the Cusco region of Peru.',
        choices: ['Chichen Itza', 'Machu Picchu', 'Petra', 'Tikal']
      },
      {
        id: 'l6',
        name: 'Great Wall of China',
        imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80',
        clue: 'An ancient protective defensive network serpentining across mountains to guard the historical northern imperial border.',
        choices: ['Hadrian’s Wall', 'Great Wall of China', 'Berlin Wall', 'Stonewall']
      }
    ]
  },
  {
    id: 'fruits',
    name: 'Fruits & Food',
    description: 'Identify mouthwatering fresh fruits and delicious foods from around the world.',
    icon: 'Apple',
    items: [
      {
        id: 'f1',
        name: 'Dragon Fruit',
        imageUrl: 'https://images.unsplash.com/photo-1527324688151-0e627063f2b1?w=600&auto=format&fit=crop&q=80',
        clue: 'A striking tropical fruit with scaly pink skin, white/pink internal flesh peppered with tiny black crunchy seeds.',
        choices: ['Dragon Fruit', 'Kiwi', 'Rambutan', 'Passion Fruit']
      },
      {
        id: 'f2',
        name: 'Strawberry',
        imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80',
        clue: 'A classic bright red heart-shaped aggregate fruit covered with tiny exterior seeds, loved in desserts.',
        choices: ['Raspberry', 'Cherry', 'Strawberry', 'Cranberry']
      },
      {
        id: 'f3',
        name: 'Pineapple',
        imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop&q=80',
        clue: 'A sweet, highly acidic tropical multiple-fruit characterized by a tough spiky rind and a crown of leaves.',
        choices: ['Coconut', 'Pineapple', 'Jackfruit', 'Durian']
      },
      {
        id: 'f4',
        name: 'Pomegranate',
        imageUrl: 'https://images.unsplash.com/photo-1582284540020-8acae03f417a?w=600&auto=format&fit=crop&q=80',
        clue: 'A spherical red fruit with a leathery husk containing clusters of jewel-like seed pods called arils.',
        choices: ['Fig', 'Guava', 'Pomegranate', 'Plum']
      },
      {
        id: 'f5',
        name: 'Avocado',
        imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop&q=80',
        clue: 'A buttery, smooth green-fleshed fruit with a single giant core stone, highly popular in Mexican cuisine.',
        choices: ['Mango', 'Pear', 'Avocado', 'Papaya']
      },
      {
        id: 'f6',
        name: 'Watermelon',
        imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
        clue: 'A massive oval summer gourd with a dark green striped vine skin and a cooling, sweet, juice-filled red flesh.',
        choices: ['Cantaloupe', 'Watermelon', 'Honey Melon', 'Pumpkin']
      }
    ]
  },
  {
    id: 'space',
    name: 'Cosmic Wonders',
    description: 'Venture beyond our atmosphere to identify amazing objects in our vast universe.',
    icon: 'Orbit',
    items: [
      {
        id: 's1',
        name: 'Saturn',
        imageUrl: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=600&auto=format&fit=crop&q=80',
        clue: 'The sixth world from our Sun, famous for its highly visible, magnificent rings composed mainly of dust and orbital ice particles.',
        choices: ['Jupiter', 'Saturn', 'Uranus', 'Neptune']
      },
      {
        id: 's2',
        name: 'Astronaut',
        imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&auto=format&fit=crop&q=80',
        clue: 'A heavily trained space explorer suited up in pressurized gear to brave the weightless, freezing voids of space.',
        choices: ['Cosmonaut', 'Astronaut', 'Scuba Diver', 'Pilot']
      },
      {
        id: 's3',
        name: 'Rocket',
        imageUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=600&auto=format&fit=crop&q=80',
        clue: 'A powerful, sleek missile-like spaceship that uses chemical combustion thrust to punch safely through our atmosphere.',
        choices: ['Rocket', 'Jetplane', 'Satellite', 'Space Station']
      },
      {
        id: 's4',
        name: 'Telescope',
        imageUrl: 'https://images.unsplash.com/photo-1433832597046-4f10e10ac764?w=600&auto=format&fit=crop&q=80',
        clue: 'An optical or magnifying explorer instrument focused on gathering starlight to view massive galactic details far away.',
        choices: ['Microscope', 'Binoculars', 'Telescope', 'Camera']
      },
      {
        id: 's5',
        name: 'Moon',
        imageUrl: 'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?w=600&auto=format&fit=crop&q=80',
        clue: 'The tidally-locked, dusty, craters-carred natural satellite that shines bright in the night sky and drives planetary ocean tides.',
        choices: ['Moon', 'Sun', 'Asteroid', 'Phobos']
      },
      {
        id: 's6',
        name: 'Nebula',
        imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&auto=format&fit=crop&q=80',
        clue: 'An interstellar cloud of space dust and energetic gases (helium/hydrogen) often serving as an massive nursery for star formation.',
        choices: ['Nebula', 'Black Hole', 'Andromeda', 'Supernova']
      }
    ]
  }
];
