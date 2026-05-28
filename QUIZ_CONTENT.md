# Leadership Style Quiz — Questions & Answers

A reference list of every question and answer option used in the Leadership Style Quiz, with each option labeled by the leadership style it maps to.

Source of truth: [src/data/questionsData.js](src/data/questionsData.js). If you edit either this file or the source, update both so they stay in sync.

---

## The 4 Leadership Styles

| Style | Approach | Focus |
|---|---|---|
| **The Teacher** | Situational Leadership — direct instruction, technical / procedural approach | Building Technical Confidence |
| **The Role Model** | Modeling Leadership — leads by example, demonstrates the standard | Integrity through Action |
| **The Coach** | Transformational Leadership — asks questions, empowers the team to think and solve | Asking over Telling |
| **The Supporter** | Servant / Secure Base Leadership — emotional check-in, relational, people-first | Emotional Safety |

Each question presents one option per style. Option order is shuffled at runtime; the order below reflects the raw definition order in the source data.

---

## Questions

### Question 1
**A new food item launches today. How do you prepare your team before the morning rush hits?**

- **The Teacher** — I pull each person aside at the start of their shift to review recipe chits and make sure they know the steps and macros.
- **The Role Model** — I jump on the line first and build the initial few orders perfectly so the team can watch how I do it.
- **The Coach** — I gather the team and ask: "What do you think is going to be the trickiest part of this build during the rush?"
- **The Supporter** — I check in to see who feels anxious about the new launch and offer to take the first few orders with them.

### Question 2
**It's 12:15 PM on a Friday. The lobby is packed, the drive-thru is wrapped, and tickets are backing up. What do you do?**

- **The Teacher** — I stand at the hand-off station to check every single lid and consistency to make sure our standards don't slip under pressure.
- **The Role Model** — I immediately jump on the heaviest station, grab a scoop, and set a fast, high-energy pace for everyone to match.
- **The Coach** — I step back to see where the line is clogging up, then ask the team captain: "We're bottlenecking at the register. How should we shift positions?"
- **The Supporter** — I quickly look at everyone's energy levels, give everyone a quick "We've got this," and jump in wherever someone looks most overwhelmed.

### Question 3
**You notice a team member consistently stands around on their phone during down-time. How do you handle it?**

- **The Teacher** — I grab the daily cleaning checklist, and walk them back through the technical standard and the "why" behind sanitation.
- **The Role Model** — I start wiping the messy counter myself so they see the exact standard in action.
- **The Coach** — I pull them aside and ask: "What gets in the way of using down-time more productively? How can we make staying engaged part of your shift rhythm?"
- **The Supporter** — I keep it respectful and say, "Hey, I know it's been a long shift, but can you do me a huge favor and help keep this area clear so the next team doesn't get buried?"

### Question 4
**A team member tells you they want to step up and become a Team Captain. How do you help them get there?**

- **The Teacher** — I write out a clear, step-by-step roadmap of the exact tasks and milestones they need to hit to be ready.
- **The Role Model** — I have them shadow me for three shifts so they can see exactly how I handle the store.
- **The Coach** — I give them a real project, like running the daily prep list, and say, "Show me your game plan for this, and let's tweak it together."
- **The Supporter** — I sit down and ask about their long-term goals, then let them know I'm here to support their growth.

### Question 5
**A guest is visibly stressed because they're in a massive hurry, and they're complaining their smoothie taste is off. What do you do?**

- **The Teacher** — I quickly double check the prep date on the fruit and the blender settings to make sure everything is working correctly.
- **The Role Model** — I step in right away, own the mistake with a genuine apology, and remake the drink while my team watches how I handle it.
- **The Coach** — I let the team member handle the remake, then use the windshield view afterward to ask, "How do you think that went? What would you try differently next time?"
- **The Supporter** — I make sure my team member is okay first, help handle the guest's frustration, and we remake the drink together as a team.

### Question 6
**Your team is exhausted and morale is slipping. How do you show them you care?**

- **The Teacher** — I keep everyone focused on the task so we can hit our operational must-dos and get out of the store on time.
- **The Role Model** — I lead from the front, work the longest and hardest, and show them by example that we don't drop our standards just because we're tired.
- **The Coach** — I gather the team for a quick 30-second huddle and ask, "Alright, we're stretched thin. What is one non-essential task we can temporarily stop doing right now to make this shift easier?"
- **The Supporter** — I blend up a custom off-menu smoothie, split it into sample cups for the whole line, and say, "Everyone, I know this shift is tough. Thank you so much for having my back right now."

### Question 7
**The afternoon shift is falling apart because two team members are running 15 minutes late. How do you manage the floor?**

- **The Teacher** — I quickly adjust the staffing plan, assigning the remaining team members to double up on specific high-priority tasks.
- **The Role Model** — I don't panic or complain; I calmly pick up a blender and match the speed of the rush until backup arrives.
- **The Coach** — I look at the team captain handing off the floor and ask: "We're short-handed for the next 15 minutes. Where do you need me to anchor so the hand-off goes smoothly?"
- **The Supporter** — I tell the morning team members who are scheduled to clock out: "I know your shift is over, but I really need your help for ten more minutes. I'll make sure you get paid the extra time."

---

## Scoring

- Each question contributes exactly **1 point** to whichever style the chosen option maps to.
- A user's total possible per style is the number of questions (currently **7**).
- The percentage shown on the results screen is `score / totalQuestions × 100`, rounded to the nearest integer.
- Ties are handled explicitly — if two or more styles share the top score, the user is shown as a "Hybrid Leader" and both/all top styles are described.

Scoring logic lives in [src/skills/calculateResults.js](src/skills/calculateResults.js).
