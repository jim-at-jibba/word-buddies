export interface HomophoneWord {
  word: string;
  contextSentence: string;
  definition?: string;
}

export interface HomophonePair {
  id: string;
  words: HomophoneWord[];
  difficulty: number; // 1-5
  yearLevel: number; // 3 for Year 3
}

export const HOMOPHONE_PAIRS: HomophonePair[] = [
  {
    id: 'accept_except',
    difficulty: 3,
    yearLevel: 3,
    words: [
      {
        word: 'accept',
        contextSentence: 'I will accept your invitation to the party.',
        definition: 'to take or receive willingly'
      },
      {
        word: 'except',
        contextSentence: 'Everyone came to the party except Sarah.',
        definition: 'not including; but not'
      }
    ]
  },
  {
    id: 'affect_effect',
    difficulty: 4,
    yearLevel: 3,
    words: [
      {
        word: 'affect',
        contextSentence: 'The rain will affect our picnic plans.',
        definition: 'to make a change to something'
      },
      {
        word: 'effect',
        contextSentence: 'The effect of the rain was a cancelled picnic.',
        definition: 'a result or consequence'
      }
    ]
  },
  {
    id: 'ball_bawl',
    difficulty: 2,
    yearLevel: 3,
    words: [
      {
        word: 'ball',
        contextSentence: 'The children played with a red ball.',
        definition: 'a round object used in games'
      },
      {
        word: 'bawl',
        contextSentence: 'The baby began to bawl loudly.',
        definition: 'to cry very loudly'
      }
    ]
  },
  {
    id: 'berry_bury',
    difficulty: 2,
    yearLevel: 3,
    words: [
      {
        word: 'berry',
        contextSentence: 'She picked a sweet berry from the bush.',
        definition: 'a small round fruit'
      },
      {
        word: 'bury',
        contextSentence: 'The dog will bury the bone in the yard.',
        definition: 'to put something under the ground'
      }
    ]
  },
  {
    id: 'brake_break',
    difficulty: 2,
    yearLevel: 3,
    words: [
      {
        word: 'brake',
        contextSentence: 'Press the brake to stop the bike.',
        definition: 'a device that stops movement'
      },
      {
        word: 'break',
        contextSentence: 'Please don\'t break my favourite cup.',
        definition: 'to damage or split apart'
      }
    ]
  },
  {
    id: 'fair_fare',
    difficulty: 3,
    yearLevel: 3,
    words: [
      {
        word: 'fair',
        contextSentence: 'The teacher gave everyone a fair chance.',
        definition: 'treating people equally'
      },
      {
        word: 'fare',
        contextSentence: 'The bus fare costs two dollars.',
        definition: 'the cost of a journey'
      }
    ]
  },
  {
    id: 'grate_great',
    difficulty: 2,
    yearLevel: 3,
    words: [
      {
        word: 'grate',
        contextSentence: 'Mum will grate the cheese for dinner.',
        definition: 'to shred food into small pieces'
      },
      {
        word: 'great',
        contextSentence: 'We had a great time at the zoo.',
        definition: 'very good or excellent'
      }
    ]
  },
  {
    id: 'groan_grown',
    difficulty: 3,
    yearLevel: 3,
    words: [
      {
        word: 'groan',
        contextSentence: 'Dad let out a groan when he saw the mess.',
        definition: 'a low sound showing pain or annoyance'
      },
      {
        word: 'grown',
        contextSentence: 'The puppy has grown so much this year.',
        definition: 'became bigger or older'
      }
    ]
  },
  {
    id: 'here_hear',
    difficulty: 2,
    yearLevel: 3,
    words: [
      {
        word: 'here',
        contextSentence: 'Come here and sit with me.',
        definition: 'in this place'
      },
      {
        word: 'hear',
        contextSentence: 'Can you hear the birds singing?',
        definition: 'to perceive sounds with your ears'
      }
    ]
  },
  {
    id: 'heel_heal_hell',
    difficulty: 4,
    yearLevel: 3,
    words: [
      {
        word: 'heel',
        contextSentence: 'There\'s a blister on my heel.',
        definition: 'the back part of your foot'
      },
      {
        word: 'heal',
        contextSentence: 'The cut on my hand will heal quickly.',
        definition: 'to get better or recover'
      },
      {
        word: 'he\'ll',
        contextSentence: 'He\'ll be here at three o\'clock.',
        definition: 'he will (shortened form)'
      }
    ]
  },
  {
    id: 'knot_not',
    difficulty: 2,
    yearLevel: 3,
    words: [
      {
        word: 'knot',
        contextSentence: 'Tie a knot in the rope.',
        definition: 'a tight loop in string or rope'
      },
      {
        word: 'not',
        contextSentence: 'I am not going to the shops today.',
        definition: 'used to make a negative statement'
      }
    ]
  },
  {
    id: 'mail_male',
    difficulty: 2,
    yearLevel: 3,
    words: [
      {
        word: 'mail',
        contextSentence: 'The postman delivered our mail.',
        definition: 'letters and packages sent by post'
      },
      {
        word: 'male',
        contextSentence: 'The male lion has a big mane.',
        definition: 'of the masculine gender'
      }
    ]
  },
  {
    id: 'main_mane',
    difficulty: 2,
    yearLevel: 3,
    words: [
      {
        word: 'main',
        contextSentence: 'The main door is at the front.',
        definition: 'the most important'
      },
      {
        word: 'mane',
        contextSentence: 'The horse\'s mane blew in the wind.',
        definition: 'long hair on an animal\'s neck'
      }
    ]
  },
  {
    id: 'meat_meet',
    difficulty: 2,
    yearLevel: 3,
    words: [
      {
        word: 'meat',
        contextSentence: 'We had chicken meat for dinner.',
        definition: 'flesh from animals used as food'
      },
      {
        word: 'meet',
        contextSentence: 'Let\'s meet at the playground.',
        definition: 'to come together with someone'
      }
    ]
  },
  {
    id: 'medal_meddle',
    difficulty: 3,
    yearLevel: 3,
    words: [
      {
        word: 'medal',
        contextSentence: 'She won a gold medal at sports day.',
        definition: 'an award for achievement'
      },
      {
        word: 'meddle',
        contextSentence: 'Don\'t meddle with things that aren\'t yours.',
        definition: 'to interfere with something'
      }
    ]
  },
  {
    id: 'missed_mist',
    difficulty: 2,
    yearLevel: 3,
    words: [
      {
        word: 'missed',
        contextSentence: 'I missed the bus this morning.',
        definition: 'failed to catch or hit something'
      },
      {
        word: 'mist',
        contextSentence: 'The morning mist covered the hills.',
        definition: 'tiny water droplets in the air'
      }
    ]
  },
  {
    id: 'peace_piece',
    difficulty: 2,
    yearLevel: 3,
    words: [
      {
        word: 'peace',
        contextSentence: 'We want peace between all countries.',
        definition: 'a time without fighting or war'
      },
      {
        word: 'piece',
        contextSentence: 'Can I have a piece of chocolate?',
        definition: 'a part or portion of something'
      }
    ]
  },
  {
    id: 'plain_plane',
    difficulty: 2,
    yearLevel: 3,
    words: [
      {
        word: 'plain',
        contextSentence: 'She wore a plain white dress.',
        definition: 'simple, without decoration'
      },
      {
        word: 'plane',
        contextSentence: 'The plane flew high in the sky.',
        definition: 'an aircraft that flies'
      }
    ]
  },
  {
    id: 'rain_rein_reign',
    difficulty: 4,
    yearLevel: 3,
    words: [
      {
        word: 'rain',
        contextSentence: 'The rain made the flowers grow.',
        definition: 'water falling from clouds'
      },
      {
        word: 'rein',
        contextSentence: 'Hold the horse\'s rein tightly.',
        definition: 'a strap used to control a horse'
      },
      {
        word: 'reign',
        contextSentence: 'The queen will reign for many years.',
        definition: 'to rule as a monarch'
      }
    ]
  },
  {
    id: 'scene_seen',
    difficulty: 3,
    yearLevel: 3,
    words: [
      {
        word: 'scene',
        contextSentence: 'The first scene in the play was funny.',
        definition: 'a part of a play or movie'
      },
      {
        word: 'seen',
        contextSentence: 'Have you seen my library book?',
        definition: 'past tense of see'
      }
    ]
  },
  {
    id: 'weather_whether',
    difficulty: 4,
    yearLevel: 3,
    words: [
      {
        word: 'weather',
        contextSentence: 'The weather is sunny today.',
        definition: 'conditions outside like rain or sun'
      },
      {
        word: 'whether',
        contextSentence: 'I don\'t know whether to go or stay.',
        definition: 'if; expressing doubt between choices'
      }
    ]
  },
  {
    id: 'whose_whos',
    difficulty: 3,
    yearLevel: 3,
    words: [
      {
        word: 'whose',
        contextSentence: 'Whose pencil is this on the floor?',
        definition: 'belonging to whom'
      },
      {
        word: 'who\'s',
        contextSentence: 'Who\'s coming to the party tonight?',
        definition: 'who is (shortened form)'
      }
    ]
  }
];

export function getRandomHomophonePair(yearLevel: number): HomophonePair | null {
  const availablePairs = HOMOPHONE_PAIRS.filter(pair => pair.yearLevel <= yearLevel);
  
  if (availablePairs.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * availablePairs.length);
  return availablePairs[randomIndex];
}

export function getHomophonePairById(id: string): HomophonePair | null {
  return HOMOPHONE_PAIRS.find(pair => pair.id === id) || null;
}

export function getAllHomophonePairs(yearLevel?: number): HomophonePair[] {
  if (yearLevel) {
    return HOMOPHONE_PAIRS.filter(pair => pair.yearLevel <= yearLevel);
  }
  return HOMOPHONE_PAIRS;
}