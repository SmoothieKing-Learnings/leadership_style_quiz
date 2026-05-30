// Centralized theme colors for the 4 styles to allow easy editing during development
export const STYLE_COLORS = {
  teacher: '#F4A261',     // Warm Honey
  roleModel: '#E76F51',   // Burnt Sienna
  coach: '#2A9D8F',       // Deep Teal
  supporter: '#E9C46A'    // Soft Gold
};

// The 4 Leadership Styles
export const STYLES = [
  {
    id: 'teacher',
    name: 'The Teacher',
    subtitle: 'Situational Leadership',
    focus: 'Building Technical Confidence',
    summary: 'You lead with structure. Prep lists are accurate, instructions are clear, and new hires get up to speed faster because you walk them through every step. Your team trusts that the process won\'t drift on your shift.',
    strengths: [
      {
        title: 'The standards guardian',
        description: 'Your prep lists are flawless and your standards show in the product every single shift.'
      },
      {
        title: 'Fast-tracked new hires',
        description: 'Team members get up to speed faster under your leadership because your instructions leave no room for guesswork.'
      },
      {
        title: 'The menu expert',
        description: 'When a guest has a complicated custom or an allergen question, your team looks to you and you never let them down.'
      }
    ],
    blindSpots: [
      {
        title: 'The robot vibe',
        description: 'When the focus locks onto checkboxes, team members can start to feel like components rather than people.'
      },
      {
        title: 'Telling over showing',
        description: 'If your words aren\'t translating into speed during a rush, get behind the counter. The standard has to be felt, not just explained.'
      },
      {
        title: 'Frustration with slow learners',
        description: 'A sharp tone makes people hide mistakes rather than ask for help.'
      }
    ],
    howToGrow: [
      {
        title: 'Connect before you correct',
        description: 'Before checking tasks at the start of a shift, ask: “What’s your battery level today on a scale of 1 to 10?” It takes ten seconds and changes the whole dynamic.'
      },
      {
        title: 'Get out of the back office',
        description: 'Walk them through the physical rhythm, show them what speed looks like, and praise the effort. See One, Do One, Lead One works. Lectures don\'t.'
      },
      {
        title: 'Reframe slow learning',
        description: 'When a team member forgets a build for the third time, breathe. Say: “It’s okay, it’s a learning thing. Let’s build this next one together.”'
      }
    ],
    color: STYLE_COLORS.teacher
  },
  {
    id: 'role_model',
    name: 'The Role Model',
    subtitle: 'Modeling Leadership',
    focus: 'Integrity Through Action',
    summary: 'You lead by example. You take the toughest station first, wipe the counters before asking anyone else, and your team adopts whatever standard they watch you hold. Integrity is the message — your actions are the lesson.',
    strengths: [
      {
        title: 'The pace setter',
        description: 'Your personal hustle raises the energy of everyone around you without a word being said.'
      },
      {
        title: 'The store blueprint',
        description: 'Your store is consistently the sharpest because you live the standard rather than just describing it.'
      },
      {
        title: 'The guest experience anchor',
        description: 'The culture you model stays on the floor even when you step into the back office.'
      }
    ],
    blindSpots: [
      {
        title: 'The “I’ll just do it myself” trap',
        description: 'Grabbing the blender to save thirty seconds robs a team member of the chance to learn.'
      },
      {
        title: 'Burnout',
        description: 'If the store falls apart every time you take a day off, you\'ve built a dependency, not a team.'
      },
      {
        title: 'Silent expectations',
        description: 'Your team can\'t read your mind, and resentment builds when they can\'t see what you see.'
      }
    ],
    howToGrow: [
      {
        title: 'Keep your hands off their blender bowls',
        description: 'Anchor next to them instead, handle their lids, and talk them through the pressure. That builds confidence. Taking over destroys it.'
      },
      {
        title: 'Speak your expectations out loud',
        description: 'Instead of silently cleaning a counter, say: “The lobby is clear, let’s use this stretch to get these counters wiped down.” Clear is caring.'
      },
      {
        title: 'Schedule a real day off',
        description: 'Delegate a Saturday rush to a team captain, step away, and let them solve problems without you. If it falls apart, that\'s information. If it doesn\'t, that\'s growth.'
      }
    ],
    color: STYLE_COLORS.roleModel
  },
  {
    id: 'coach',
    name: 'The Coach',
    subtitle: 'Transformational Leadership',
    focus: 'Asking Over Telling',
    summary: 'You lead with questions. Instead of solving every problem yourself, you ask team members what they would do and help them think it through. Your team grows because you give them room to make and own the call.',
    strengths: [
      {
        title: 'The talent spotter',
        description: 'You see potential before anyone else does and you know how to ask the question that builds critical thinking rather than just handing someone the answer.'
      },
      {
        title: 'The career builder',
        description: 'Your team members start thinking like leaders because you treated them like ones before they had the title.'
      },
      {
        title: 'The loyalty creator',
        description: 'People genuinely love showing up for your shifts because they feel like they\'re growing, not just making smoothies.'
      }
    ],
    blindSpots: [
      {
        title: 'Analysis paralysis',
        description: 'When tickets are backing up, the floor needs a commander not a counselor.'
      },
      {
        title: 'Overlooking low performers',
        description: 'Coaching only works when it\'s balanced with direct accountability.'
      },
      {
        title: 'Overthinking the small stuff',
        description: 'Not every mistake needs a debrief.'
      }
    ],
    howToGrow: [
      {
        title: 'Read the operational clock',
        description: 'When blenders are screaming, drop the questions and step in with direct calls: “I’m on powders, you take the register.” Save the windshield view for after the rush.'
      },
      {
        title: 'Protect the standards',
        description: 'If someone violates the phone policy, don\'t ask how they feel about it. Say: “Our standard is no phones on the floor because it pulls focus from guests. Drop it in the locker.”'
      },
      {
        title: 'Keep small fixes small',
        description: 'If a lid wasn\'t secure and a smoothie spills, just say: “Make sure that lid is secure before you hit start,” help clean it up, and move on.'
      }
    ],
    color: STYLE_COLORS.coach
  },
  {
    id: 'supporter',
    name: 'The Supporter',
    subtitle: 'Servant/Secure Base Leadership',
    focus: 'Emotional and Operational Safety',
    summary: 'You lead with care. You stay calm when the shift is unraveling, notice when a team member is wearing thin, and people show up for you because you have shown up for them. The team holds together because you make it safe to.',
    strengths: [
      {
        title: 'The calm in the chaos',
        description: 'Your team never panics when things go sideways because they know you won\'t snap at them for a mistake.'
      },
      {
        title: 'The early warning system',
        description: 'You notice when someone\'s battery is hitting empty before they have to tell you and you act on it before it becomes a problem.'
      },
      {
        title: 'The loyalty builder',
        description: 'Your team will cover a shift for you on their day off. That loyalty isn\'t bought. It\'s built one “I’ve got you” at a time.'
      }
    ],
    blindSpots: [
      {
        title: 'The friend versus manager blur',
        description: 'Letting small standards slide to protect the vibe isn\'t kindness, it\'s avoidance.'
      },
      {
        title: 'Being walked over',
        description: 'Empathy without boundaries eventually gets taken advantage of.'
      },
      {
        title: 'Avoiding hard conversations',
        description: 'When you let a low performer slide, the rest of the team carries the weight.'
      }
    ],
    howToGrow: [
      {
        title: 'Remember that clear is caring',
        description: 'Avoiding tough talks about tardiness or the dress code forces your reliable team members to work twice as hard. Holding people accountable is the most caring thing you can do.'
      },
      {
        title: 'Lean on shared standards',
        description: 'Instead of asking for a favor, say: “Our team rule is that everyone helps with the close. I need you on dishes.” The standard isn\'t personal. It\'s just the standard.'
      },
      {
        title: 'Stop putting off hard conversations',
        description: 'Schedule it for your next shift. Pull them aside, lead with clarity, listen with empathy, and align on what needs to change. The Giving Planned Feedback lesson gives you the structure to do it well.'
      }
    ],
    color: STYLE_COLORS.supporter
  }
];
