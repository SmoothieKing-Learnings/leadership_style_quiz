// The Smoothie King Leadership Style Quiz
// styleId mapping:
//   teacher    → A answers: direct instruction, technical/procedural approach
//   role_model → B answers: leads by example, demonstrates the standard
//   coach      → C answers: asks questions, empowers team to think/solve
//   supporter  → D answers: emotional check-in, relational/people-first support

export const QUESTIONS = [
  {
    id: 'q1',
    text: 'A new food item launches today. How do you prepare your team before the morning rush hits?',
    options: [
      { id: 'q1-teacher', text: 'I pull each person aside at the start of their shift to review recipe chits and make sure they know the steps and nutritional information.', styleId: 'teacher' },
      { id: 'q1-role_model', text: 'I jump on the line first and build the initial few orders perfectly so the team can watch how I do it.', styleId: 'role_model' },
      { id: 'q1-coach', text: 'I gather the team and ask: "What do you think is going to be the trickiest part of this during the rush?"', styleId: 'coach' },
      { id: 'q1-supporter', text: 'I check in to see who feels anxious about the new launch and offer to take the first few orders with them.', styleId: 'supporter' }
    ]
  },
  {
    id: 'q2',
    text: 'It\'s 12:15 PM on a Friday. The lobby is packed, the team is struggling with speed of service, and tickets are backing up. What do you do?',
    options: [
      { id: 'q2-teacher', text: 'I stand at the hand-off counter to check every single lid and consistency to make sure our standards don\'t slip under pressure.', styleId: 'teacher' },
      { id: 'q2-role_model', text: 'I immediately jump on the toughest position, grab a scoop, and set a fast, high-energy pace for everyone to match.', styleId: 'role_model' },
      { id: 'q2-coach', text: 'I step back to see where the line is clogging up, then ask the team captain: "We\'re bottlenecking at the register. How should we shift positions?"', styleId: 'coach' },
      { id: 'q2-supporter', text: 'I quickly look at everyone\'s energy levels, give everyone a quick "We\'ve got this," and jump in wherever someone looks most overwhelmed.', styleId: 'supporter' }
    ]
  },
  {
    id: 'q3',
    text: 'You notice a team member consistently stands around on their phone during down-time instead of preparing for the next rush. How do you handle it?',
    options: [
      { id: 'q3-teacher', text: 'I grab the daily cleaning checklist, and walk them back through the technical standard and the ‘why’ behind sanitation.', styleId: 'teacher' },
      { id: 'q3-role_model', text: 'I start wiping the messy counter myself so they see the exact standard in action.', styleId: 'role_model' },
      { id: 'q3-coach', text: 'I pull them aside and ask: "What gets in the way of using down-time more productively? How can we make staying engaged part of your shift rhythm?"', styleId: 'coach' },
      { id: 'q3-supporter', text: 'I keep it respectful and say, “Hey, I know it’s been a long shift, but can you do me a huge favor and help keep this area clear so the next team doesn’t get buried?”', styleId: 'supporter' }
    ]
  },
  {
    id: 'q4',
    text: 'A team member tells you they want to step up and become a Team Captain. How do you help them get there?',
    options: [
      { id: 'q4-teacher', text: 'I write out a clear, step-by-step roadmap of the exact tasks and milestones they need to hit to be ready.', styleId: 'teacher' },
      { id: 'q4-role_model', text: 'I have them shadow me for three shifts so they can see exactly how I handle the store.', styleId: 'role_model' },
      { id: 'q4-coach', text: 'I give them a real project, like running the daily prep list, and say, “Show me your game plan for this, and let’s tweak it together.”', styleId: 'coach' },
      { id: 'q4-supporter', text: 'I sit down and ask about their long-term goals, then let them know I\'m here to support their growth.', styleId: 'supporter' }
    ]
  },
  {
    id: 'q5',
    text: 'A guest is visibly stressed because they\'re in a massive hurry, and they\'re complaining their smoothie taste is off. What do you do?',
    options: [
      { id: 'q5-teacher', text: 'I quickly double check the prep date on the fruit and the blender settings to make sure everything is working correctly.', styleId: 'teacher' },
      { id: 'q5-role_model', text: 'I step in right away, own the mistake with a genuine apology, and remake the smoothie while my team watches how I handle it.', styleId: 'role_model' },
      { id: 'q5-coach', text: 'I let the team member handle the remake, then use the windshield view afterward to ask, “How do you think that went? What would you try differently next time?”', styleId: 'coach' },
      { id: 'q5-supporter', text: 'I make sure my team member is okay first, help handle the guest\'s frustration, and we remake the smoothie together as a team.', styleId: 'supporter' }
    ]
  },
  {
    id: 'q6',
    text: 'Your team is exhausted and morale is slipping. How do you show them you care?',
    options: [
      { id: 'q6-teacher', text: 'I keep everyone focused on the task so we can hit our operational must-dos and get out of the store on time.', styleId: 'teacher' },
      { id: 'q6-role_model', text: 'I lead from the front, work the longest and hardest, and show them by example that we don\'t drop our standards just because we\'re tired.', styleId: 'role_model' },
      { id: 'q6-coach', text: 'I gather the team for a quick 30-second huddle and ask, "Alright, we\'re stretched thin. What is one non-essential task we can temporarily stop doing right now to make this shift easier?"', styleId: 'coach' },
      { id: 'q6-supporter', text: 'I blend up a custom off-menu smoothie, split it into sample cups for the whole line, and say, “Everyone, I know this shift is tough. Thank you so much for having my back right now.”', styleId: 'supporter' }
    ]
  },
  {
    id: 'q7',
    text: 'The afternoon shift is falling apart because two team members are running 15 minutes late. How do you manage the floor?',
    options: [
      { id: 'q7-teacher', text: 'I quickly adjust the staffing plan, assigning the remaining team members to double up on specific high-priority tasks.', styleId: 'teacher' },
      { id: 'q7-role_model', text: 'I don\'t panic or complain; I calmly pick up a blender and match the speed of the rush until backup arrives.', styleId: 'role_model' },
      { id: 'q7-coach', text: 'I look at the team captain handing off the floor and ask: "We\'re short-handed for the next 15 minutes. Where do you need me to anchor so the hand-off goes smoothly?"', styleId: 'coach' },
      { id: 'q7-supporter', text: 'I tell the morning team members who are scheduled to clock out: “I know your shift is over, but I really need your help for ten more minutes. I’ll make sure you get paid the extra time.”', styleId: 'supporter' }
    ]
  },

];
