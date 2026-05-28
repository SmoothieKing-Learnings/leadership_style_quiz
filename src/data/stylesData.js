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
        title: 'Reliable Execution',
        description: 'Your prep lists are accurate and your team knows the steps, so quality and consistency stay high.'
      },
      {
        title: 'Faster Onboarding',
        description: 'New hires reach the line or register sooner because your instructions are clear and structured.'
      },
      {
        title: 'Product Knowledge',
        description: 'You know the menu well and pass that knowledge to your team through notes and practice.'
      }
    ],
    blindSpots: [
      {
        title: 'Process Over People',
        description: 'Focusing on the steps can leave team members feeling like tools instead of people.'
      },
      {
        title: 'Verbal-Only Teaching',
        description: 'Some team members learn better by watching or doing. Telling alone can leave them stuck.'
      },
      {
        title: 'Impatience with Repetition',
        description: 'Losing patience when someone needs another pass can make them feel disrespected.'
      }
    ],
    color: STYLE_COLORS.teacher
  },
  {
    id: 'role_model',
    name: 'The Role Model',
    subtitle: 'Modeling Leadership',
    focus: 'Integrity through Action',
    summary: 'You lead by example. You take the toughest station first, wipe the counters before asking anyone else, and your team adopts whatever standard they watch you hold. Integrity is the message — your actions are the lesson.',
    strengths: [
      {
        title: 'Setting the Pace',
        description: 'You take the toughest station during a rush, and the team picks up the rhythm by watching you.'
      },
      {
        title: 'Cleanliness Standards',
        description: 'You wipe counters first, so the team holds the same standard whether you are on shift or not.'
      },
      {
        title: 'Guest Tone',
        description: 'You greet guests the same way every time, and your team adopts that tone.'
      }
    ],
    blindSpots: [
      {
        title: 'Taking Over',
        description: 'Stepping in to do it yourself is faster but stops your team from learning under pressure.'
      },
      {
        title: 'Burnout',
        description: 'Leading by outworking everyone is hard to sustain, and the pace can drop when you are off shift.'
      },
      {
        title: 'Unspoken Standards',
        description: 'You see what needs to happen. Your team often will not until you say it out loud.'
      }
    ],
    color: STYLE_COLORS.roleModel
  },
  {
    id: 'coach',
    name: 'The Coach',
    subtitle: 'Transformational Leadership',
    focus: 'Asking over Telling',
    summary: 'You lead with questions. Instead of solving every problem yourself, you ask team members what they would do and help them think it through. Your team grows because you give them room to make and own the call.',
    strengths: [
      {
        title: 'Developing Shift Leads',
        description: 'You ask team members what they would do in a situation, which builds the judgment they need to lead.'
      },
      {
        title: 'Recovery Learning',
        description: 'You let team members handle hard moments first, then debrief, so they learn from the experience.'
      },
      {
        title: 'Retention',
        description: 'Team members stay because they feel like they are growing, not just working a shift.'
      }
    ],
    blindSpots: [
      {
        title: 'Slow in Crises',
        description: 'Some moments need a direct instruction, not a question. Asking during a rush can slow the team down.'
      },
      {
        title: 'Missing Quiet Underperformers',
        description: 'Focusing on top performers can leave the person quietly falling behind unseen.'
      },
      {
        title: 'Overcoaching Small Mistakes',
        description: 'Not everything needs a conversation. Sometimes a clear correction is more useful than a question.'
      }
    ],
    color: STYLE_COLORS.coach
  },
  {
    id: 'supporter',
    name: 'The Supporter',
    subtitle: 'Servant/Secure Base Leadership',
    focus: 'Emotional Safety',
    summary: 'You lead with care. You stay calm when the shift is unraveling, notice when a team member is wearing thin, and people show up for you because you have shown up for them. The team holds together because you make it safe to.',
    strengths: [
      {
        title: 'Steady Under Pressure',
        description: 'You stay calm during a rush, so the team does not panic when something goes wrong.'
      },
      {
        title: 'Reading Energy',
        description: 'You notice when someone is wearing down and give them a short reset before it shows.'
      },
      {
        title: 'Team Loyalty',
        description: 'People show up for you on tough shifts because you have shown up for them.'
      }
    ],
    blindSpots: [
      {
        title: 'Friend vs. Manager',
        description: 'Holding people to rules can feel like hurting the relationship, so accountability slips.'
      },
      {
        title: 'Taken Advantage Of',
        description: 'Too much empathy can become a habit the team relies on. Care and clear limits both matter.'
      },
      {
        title: 'Delayed Hard Talks',
        description: 'Postponing feedback or a needed exit shifts the weight onto the rest of the team.'
      }
    ],
    color: STYLE_COLORS.supporter
  }
];
