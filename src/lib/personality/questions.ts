/**
 * Personality Assessment — Hardcoded Question Bank
 *
 * 100 questions across 4 dimensions (25 each):
 *   EI — Extraversion (E) ↔ Introversion (I)   — index 0–24
 *   SN — Sensing (S)      ↔ Intuition (N)        — index 25–49
 *   TF — Thinking (T)     ↔ Feeling (F)           — index 50–74
 *   JP — Judging (J)      ↔ Perceiving (P)        — index 75–99
 *
 * Question types:
 *   F (Forward)    — left pole = first pole, right pole = second pole
 *   R (Reversed)   — left pole = second pole, right pole = first pole (score inverted at scoring time)
 *   S (Situational)— scenario prompt with Option A / Option B (scored same direction as F)
 *
 * Scoring direction (high dimension score = second pole):
 *   EI → high = I    SN → high = N    TF → high = F    JP → high = P
 *
 * IMPORTANT: question_index is permanent and canonical.
 * Never reorder or remove questions after launch — historical answers are keyed to index.
 */

export type QuestionType = 'F' | 'R' | 'S'
export type Dimension = 'EI' | 'SN' | 'TF' | 'JP'

export type PersonalityQuestion = {
  index: number
  dimension: Dimension
  type: QuestionType
  leftPole: string
  rightPole: string
  scenario?: string // Only present for S-type questions
}

export const PERSONALITY_QUESTIONS: PersonalityQuestion[] = [

  // ─── DIMENSION: EI — Extraversion ↔ Introversion (index 0–24) ───────────────
  // F questions: left = E, right = I
  // R questions: left = I, right = E

  {
    index: 0, dimension: 'EI', type: 'F',
    leftPole:  'When starting a new project, tends to share ideas with others early',
    rightPole: 'Keeps ideas to self until they are more fully formed',
  },
  {
    index: 1, dimension: 'EI', type: 'F',
    leftPole:  'Recharges by spending time with people',
    rightPole: 'Recharges by spending time alone',
  },
  {
    index: 2, dimension: 'EI', type: 'R',
    leftPole:  'Works well independently with minimal interaction',
    rightPole: 'Draws energy from working alongside others',
  },
  {
    index: 3, dimension: 'EI', type: 'F',
    leftPole:  'Comfortable being the visible spokesperson for a group',
    rightPole: 'Prefers someone else to take the public-facing role',
  },
  {
    index: 4, dimension: 'EI', type: 'F',
    leftPole:  'Tends to have a wide circle of acquaintances',
    rightPole: 'Tends to have a smaller circle of closer relationships',
  },
  {
    index: 5, dimension: 'EI', type: 'F',
    leftPole:  'Finds it easy to make conversation with strangers',
    rightPole: 'Finds small talk draining and prefers deeper conversation',
  },
  {
    index: 6, dimension: 'EI', type: 'S',
    scenario:  'After an unusually busy social week, you feel…',
    leftPole:  'Energised and ready for more',
    rightPole: 'Relieved to have some quiet time',
  },
  {
    index: 7, dimension: 'EI', type: 'F',
    leftPole:  'Talks through problems with others to work them out',
    rightPole: 'Thinks problems through internally before sharing conclusions',
  },
  {
    index: 8, dimension: 'EI', type: 'F',
    leftPole:  'When something is bothering them at work, tends to raise it quickly',
    rightPole: 'Tends to sit with it for a while before deciding whether to bring it up',
  },
  {
    index: 9, dimension: 'EI', type: 'F',
    leftPole:  'Gets restless with too much time alone',
    rightPole: 'Gets restless with too much time in group settings',
  },
  {
    index: 10, dimension: 'EI', type: 'F',
    leftPole:  'Tends to process feedback by discussing it immediately',
    rightPole: 'Tends to process feedback privately before responding',
  },
  {
    index: 11, dimension: 'EI', type: 'S',
    scenario:  'You have a free Saturday with nothing planned. Your first instinct is to…',
    leftPole:  'Reach out and make plans with someone',
    rightPole: 'Welcome the unstructured time to yourself',
  },
  {
    index: 12, dimension: 'EI', type: 'F',
    leftPole:  'Generally expressive and easy to read in conversation',
    rightPole: 'Generally reserved — shares selectively',
  },
  {
    index: 13, dimension: 'EI', type: 'R',
    leftPole:  'Prefers written communication (email, messages) over verbal',
    rightPole: 'Prefers calls and in-person conversations over written communication',
  },
  {
    index: 14, dimension: 'EI', type: 'F',
    leftPole:  'Comfortable meeting a room full of strangers at a social event',
    rightPole: 'Finds meeting many new people at once draining',
  },
  {
    index: 15, dimension: 'EI', type: 'S',
    scenario:  'Your manager asks you to present your team\'s work to senior leadership with a day\'s notice. You feel…',
    leftPole:  'Excited by the opportunity',
    rightPole: 'Uncomfortable — you would prefer more preparation time',
  },
  {
    index: 16, dimension: 'EI', type: 'F',
    leftPole:  'Maintains many connections across different groups and contexts',
    rightPole: 'Invests more deeply in a smaller number of relationships',
  },
  {
    index: 17, dimension: 'EI', type: 'F',
    leftPole:  'Often brings energy to a room or team',
    rightPole: 'Tends to observe and listen more than drive the energy',
  },
  {
    index: 18, dimension: 'EI', type: 'R',
    leftPole:  'Works well with background noise or activity around them',
    rightPole: 'Works best in quiet environments with fewer interruptions',
  },
  {
    index: 19, dimension: 'EI', type: 'F',
    leftPole:  'Comfortable being visible and recognised for their contributions',
    rightPole: 'Prefers to do strong work without needing the spotlight',
  },
  {
    index: 20, dimension: 'EI', type: 'S',
    scenario:  'You walk into a work event where you know almost no one. You tend to…',
    leftPole:  'Look for someone to introduce yourself to',
    rightPole: 'Find a quieter spot and wait for someone to approach',
  },
  {
    index: 21, dimension: 'EI', type: 'F',
    leftPole:  'Prefers large group discussions to one-on-one conversations',
    rightPole: 'Prefers one-on-one or small group conversations to large group settings',
  },
  {
    index: 22, dimension: 'EI', type: 'R',
    leftPole:  'Tends to listen and consider before contributing to a discussion',
    rightPole: 'Often jumps into conversations and speaks up quickly',
  },
  {
    index: 23, dimension: 'EI', type: 'F',
    leftPole:  'Prefers to collaborate in real time alongside others',
    rightPole: 'Prefers to work through their part independently and share results',
  },
  {
    index: 24, dimension: 'EI', type: 'S',
    scenario:  'At a networking event, you tend to…',
    leftPole:  'Move around and speak to as many people as possible',
    rightPole: 'Have a few longer conversations with fewer people',
  },

  // ─── DIMENSION: SN — Sensing ↔ Intuition (index 25–49) ──────────────────────
  // F questions: left = S, right = N
  // R questions: left = N, right = S

  {
    index: 25, dimension: 'SN', type: 'F',
    leftPole:  'When planning ahead, focuses on near-term steps that need to happen',
    rightPole: 'Focuses on the long-term vision and where things could lead',
  },
  {
    index: 26, dimension: 'SN', type: 'F',
    leftPole:  'Prefers step-by-step instructions when learning something new',
    rightPole: 'Prefers to understand the overall concept first, then work out the steps',
  },
  {
    index: 27, dimension: 'SN', type: 'R',
    leftPole:  'Pays more attention to overall patterns and impressions',
    rightPole: 'Pays close attention to specific details in their environment',
  },
  {
    index: 28, dimension: 'SN', type: 'F',
    leftPole:  'After reading a report, more likely to remember specific figures and examples',
    rightPole: 'More likely to remember the overall argument and what it implies',
  },
  {
    index: 29, dimension: 'SN', type: 'F',
    leftPole:  'When solving a problem, starts by gathering all the relevant facts',
    rightPole: 'Starts by imagining different scenarios and possibilities',
  },
  {
    index: 30, dimension: 'SN', type: 'S',
    scenario:  'You are briefed on a new project. You most want to know…',
    leftPole:  'The exact steps, timeline, and deliverables',
    rightPole: 'The overall purpose and where it could lead',
  },
  {
    index: 31, dimension: 'SN', type: 'F',
    leftPole:  'Trusts methods that have been proven to work',
    rightPole: 'Drawn to new approaches, even if they are unproven',
  },
  {
    index: 32, dimension: 'SN', type: 'R',
    leftPole:  'Easily bored by repetition and actively looks for variety',
    rightPole: 'Comfortable with routine and consistent workflows',
  },
  {
    index: 33, dimension: 'SN', type: 'F',
    leftPole:  'Tends to communicate in literal, precise terms',
    rightPole: 'Tends to use analogies, metaphors, and stories when communicating',
  },
  {
    index: 34, dimension: 'SN', type: 'S',
    scenario:  'When explaining something complex to a colleague, you tend to…',
    leftPole:  'Walk them through the specific steps and facts',
    rightPole: 'Give the big picture first and let the details follow',
  },
  {
    index: 35, dimension: 'SN', type: 'F',
    leftPole:  'When reading about a work topic, drawn to real-world examples and case studies',
    rightPole: 'Drawn to frameworks, theories, and underlying principles',
  },
  {
    index: 36, dimension: 'SN', type: 'F',
    leftPole:  'More energised by refining and improving what already exists',
    rightPole: 'More energised by imagining and building something entirely new',
  },
  {
    index: 37, dimension: 'SN', type: 'R',
    leftPole:  'Drawn to open-ended questions without obvious answers',
    rightPole: 'Prefers problems that have clear, definite answers',
  },
  {
    index: 38, dimension: 'SN', type: 'F',
    leftPole:  'Most engaged by practical, applied conversations',
    rightPole: 'Most engaged by theoretical or future-focused conversations',
  },
  {
    index: 39, dimension: 'SN', type: 'S',
    scenario:  'A colleague gives you a vague brief with minimal detail. You feel…',
    leftPole:  'Uncomfortable — you would prefer more specifics before starting',
    rightPole: 'Fine — you will figure it out as you go',
  },
  {
    index: 40, dimension: 'SN', type: 'F',
    leftPole:  'Recalls and works with specific facts and data',
    rightPole: 'Sees underlying patterns and reads between the lines',
  },
  {
    index: 41, dimension: 'SN', type: 'R',
    leftPole:  'Often works across several ideas at once, even when they feel disconnected',
    rightPole: 'Works through tasks in a sequential, step-by-step way',
  },
  {
    index: 42, dimension: 'SN', type: 'F',
    leftPole:  'Most comfortable working with what exists and is known',
    rightPole: 'Most comfortable exploring what has not happened yet but could',
  },
  {
    index: 43, dimension: 'SN', type: 'S',
    scenario:  'You have an unexpected free hour at work. You most likely…',
    leftPole:  'Use it to make progress on outstanding tasks',
    rightPole: 'Spend it exploring an idea or topic you have been curious about',
  },
  {
    index: 44, dimension: 'SN', type: 'R',
    leftPole:  'Often mentally elsewhere — thinking about ideas, connections, and possibilities',
    rightPole: 'Pays close attention to what is physically present and observable',
  },
  {
    index: 45, dimension: 'SN', type: 'F',
    leftPole:  'Describes their work in terms of specific outputs and results',
    rightPole: 'Describes their work in terms of ideas, impact, or meaning',
  },
  {
    index: 46, dimension: 'SN', type: 'F',
    leftPole:  'Most comfortable when tasks are well-defined and concrete',
    rightPole: 'Most comfortable when there is room for interpretation and creativity',
  },
  {
    index: 47, dimension: 'SN', type: 'F',
    leftPole:  'Tends to set goals based on what is practical and achievable',
    rightPole: 'Tends to set goals based on what they believe should be possible, even if uncertain',
  },
  {
    index: 48, dimension: 'SN', type: 'F',
    leftPole:  'When learning something new, most interested in how it works in practice',
    rightPole: 'Most interested in what it means conceptually',
  },
  {
    index: 49, dimension: 'SN', type: 'S',
    scenario:  'You visit a new office for a meeting. Afterwards, you could most easily describe…',
    leftPole:  'Specific details — the layout, décor, and setup',
    rightPole: 'The overall feel and atmosphere of the space',
  },

  // ─── DIMENSION: TF — Thinking ↔ Feeling (index 50–74) ───────────────────────
  // F questions: left = T, right = F
  // R questions: left = F, right = T

  {
    index: 50, dimension: 'TF', type: 'F',
    leftPole:  'Makes decisions based on logic and objective analysis',
    rightPole: 'Makes decisions based on personal values and what feels right',
  },
  {
    index: 51, dimension: 'TF', type: 'F',
    leftPole:  'Believes consistent rules should apply to everyone equally',
    rightPole: 'Believes context and individual circumstances should shape how rules are applied',
  },
  {
    index: 52, dimension: 'TF', type: 'F',
    leftPole:  'When challenged on a decision, first instinct is to defend the logic of their position',
    rightPole: 'First instinct is to understand the other person\'s concern',
  },
  {
    index: 53, dimension: 'TF', type: 'S',
    scenario:  'You are reviewing work from a junior colleague that has a significant error. You…',
    leftPole:  'Tell them clearly what needs to be fixed and why',
    rightPole: 'Frame the feedback carefully to keep them motivated while still addressing the issue',
  },
  {
    index: 54, dimension: 'TF', type: 'S',
    scenario:  'You notice a team decision was reached incorrectly. You…',
    leftPole:  'Point out the flaw directly',
    rightPole: 'Think about how to raise it without disrupting the team dynamic',
  },
  {
    index: 55, dimension: 'TF', type: 'F',
    leftPole:  'Drawn to work that challenges their thinking and builds expertise',
    rightPole: 'Drawn to work that makes a meaningful difference to the people around them',
  },
  {
    index: 56, dimension: 'TF', type: 'F',
    leftPole:  'Tends to stay calm and analytical during conflict',
    rightPole: 'Tends to feel affected by conflict and takes time to process it emotionally',
  },
  {
    index: 57, dimension: 'TF', type: 'R',
    leftPole:  'Naturally notices what is strong and worth building on in a plan',
    rightPole: 'Naturally notices what is wrong or missing in a plan',
  },
  {
    index: 58, dimension: 'TF', type: 'F',
    leftPole:  'Being known for expertise and high standards matters more',
    rightPole: 'Being known for care, empathy, and support matters more',
  },
  {
    index: 59, dimension: 'TF', type: 'S',
    scenario:  'A colleague is visibly upset after a difficult meeting. You…',
    leftPole:  'Help them think through what went wrong and what to do next',
    rightPole: 'Let them talk about how they are feeling first',
  },
  {
    index: 60, dimension: 'TF', type: 'F',
    leftPole:  'When meeting someone new professionally, more curious about what they have accomplished',
    rightPole: 'More curious about who they are as a person',
  },
  {
    index: 61, dimension: 'TF', type: 'F',
    leftPole:  'Prefers a manager who sets clear expectations and holds people to them',
    rightPole: 'Prefers a manager who understands them as an individual and adjusts accordingly',
  },
  {
    index: 62, dimension: 'TF', type: 'R',
    leftPole:  'Finds it hard to separate how they feel about something from the decision',
    rightPole: 'Can set personal feelings aside when a decision needs to be made',
  },
  {
    index: 63, dimension: 'TF', type: 'F',
    leftPole:  'When evaluating a proposal, first asks "Is this logical and defensible?"',
    rightPole: 'First asks "Does this feel right, and is it fair to everyone involved?"',
  },
  {
    index: 64, dimension: 'TF', type: 'S',
    scenario:  'You are asked to make a call that benefits most people but will significantly disappoint one person. You…',
    leftPole:  'Make the call — in your view, the fairest outcome is the one that helps the most people',
    rightPole: 'Look hard for a solution that avoids any single person bearing the full cost',
  },
  {
    index: 65, dimension: 'TF', type: 'F',
    leftPole:  'In a team, naturally gravitates to keeping the group focused and accountable',
    rightPole: 'Naturally gravitates to making sure everyone feels included and supported',
  },
  {
    index: 66, dimension: 'TF', type: 'R',
    leftPole:  'Would rather preserve the relationship than prove a point',
    rightPole: 'Would rather have the facts right than smooth things over',
  },
  {
    index: 67, dimension: 'TF', type: 'F',
    leftPole:  'Comfortable challenging someone\'s reasoning if the logic does not hold up',
    rightPole: 'Hesitant to challenge a position if it risks upsetting the person',
  },
  {
    index: 68, dimension: 'TF', type: 'S',
    scenario:  'A team member gets a strong result but bent a company rule to get there. You feel…',
    leftPole:  'Concerned — the precedent matters, regardless of the outcome',
    rightPole: 'Relatively comfortable — the outcome matters more than perfect rule adherence',
  },
  {
    index: 69, dimension: 'TF', type: 'F',
    leftPole:  'In a close working relationship, more important that the other person respects their thinking',
    rightPole: 'More important that the other person understands them as a person',
  },
  {
    index: 70, dimension: 'TF', type: 'R',
    leftPole:  'Believes being kind is more important than being blunt',
    rightPole: 'Believes honesty is more important than protecting someone\'s feelings',
  },
  {
    index: 71, dimension: 'TF', type: 'F',
    leftPole:  'Naturally keeps emotion separate from professional discussions',
    rightPole: 'Naturally brings warmth and personal connection into professional discussions',
  },
  {
    index: 72, dimension: 'TF', type: 'S',
    scenario:  'You walk into a situation that feels tense. Your first instinct is to understand…',
    leftPole:  'What the problem is',
    rightPole: 'How the people involved are feeling',
  },
  {
    index: 73, dimension: 'TF', type: 'F',
    leftPole:  'After a difficult decision at work, moves on fairly quickly',
    rightPole: 'Tends to reflect on whether the decision was fair to everyone involved',
  },
  {
    index: 74, dimension: 'TF', type: 'R',
    leftPole:  'Measures success by whether the people involved felt good about the process',
    rightPole: 'Measures success primarily by the quality of the result',
  },

  // ─── DIMENSION: JP — Judging ↔ Perceiving (index 75–99) ─────────────────────
  // F questions: left = J, right = P
  // R questions: left = P, right = J

  {
    index: 75, dimension: 'JP', type: 'F',
    leftPole:  'Prefers to make decisions early and have a clear plan',
    rightPole: 'Prefers to keep options open as long as possible',
  },
  {
    index: 76, dimension: 'JP', type: 'F',
    leftPole:  'Feels better when work is completed ahead of the deadline',
    rightPole: 'Tends to produce their best work when working to an imminent deadline',
  },
  {
    index: 77, dimension: 'JP', type: 'R',
    leftPole:  'Prefers to leave the day flexible and respond to what comes up',
    rightPole: 'Prefers to plan the day in advance',
  },
  {
    index: 78, dimension: 'JP', type: 'F',
    leftPole:  'Tends to finish one task fully before moving to the next',
    rightPole: 'Tends to juggle multiple tasks at different stages of completion',
  },
  {
    index: 79, dimension: 'JP', type: 'S',
    scenario:  'A project scope changes significantly after work has already begun. You feel…',
    leftPole:  'Frustrated — the change disrupts a plan that was working',
    rightPole: 'Interested — the change opens up new possibilities',
  },
  {
    index: 80, dimension: 'JP', type: 'F',
    leftPole:  'Prefers a structured work environment with clear processes',
    rightPole: 'Prefers a flexible work environment where they can adapt as needed',
  },
  {
    index: 81, dimension: 'JP', type: 'F',
    leftPole:  'Tends to keep their workspace tidy and organised',
    rightPole: 'Comfortable working in a busier, less organised space',
  },
  {
    index: 82, dimension: 'JP', type: 'R',
    leftPole:  'Prefers to start and figure things out as they go',
    rightPole: 'Prefers to have a full plan in place before starting',
  },
  {
    index: 83, dimension: 'JP', type: 'F',
    leftPole:  'More satisfaction comes from finishing a project than from starting one',
    rightPole: 'More satisfaction comes from starting a new project than from completing one',
  },
  {
    index: 84, dimension: 'JP', type: 'S',
    scenario:  'You have a free block of time in your calendar with no meetings. You most likely…',
    leftPole:  'Use it to work through your task list',
    rightPole: 'Use it for thinking, exploring, or whatever feels most valuable in the moment',
  },
  {
    index: 85, dimension: 'JP', type: 'F',
    leftPole:  'Prefers a workday with a predictable structure',
    rightPole: 'Energised by a workday that takes unexpected turns',
  },
  {
    index: 86, dimension: 'JP', type: 'R',
    leftPole:  'Prefers to gather more information and consider more options before deciding',
    rightPole: 'Makes decisions quickly once there is enough information to act',
  },
  {
    index: 87, dimension: 'JP', type: 'F',
    leftPole:  'Prefers to follow a clear system rather than figure things out each time',
    rightPole: 'Prefers to assess each situation individually rather than follow a fixed system',
  },
  {
    index: 88, dimension: 'JP', type: 'F',
    leftPole:  'Most comfortable when the to-do list is clear and prioritised',
    rightPole: 'Comfortable keeping tasks loosely tracked rather than strictly listed',
  },
  {
    index: 89, dimension: 'JP', type: 'S',
    scenario:  'A colleague consistently misses agreed deadlines. You feel…',
    leftPole:  'This needs to be addressed — agreements and commitments matter',
    rightPole: 'It depends on the reason — context matters more than the rule',
  },
  {
    index: 90, dimension: 'JP', type: 'F',
    leftPole:  'Prefers a tightly scheduled calendar with clear blocks of time',
    rightPole: 'Prefers plenty of open white space in the calendar',
  },
  {
    index: 91, dimension: 'JP', type: 'R',
    leftPole:  'Tends to plan at the last minute, or skip formal planning altogether',
    rightPole: 'Tends to plan ahead and prepare more than strictly necessary',
  },
  {
    index: 92, dimension: 'JP', type: 'F',
    leftPole:  'Administrative tasks feel satisfying to complete and keep current',
    rightPole: 'Administrative tasks tend to slip as other priorities feel more pressing',
  },
  {
    index: 93, dimension: 'JP', type: 'S',
    scenario:  'You are halfway through a task when a more interesting opportunity comes up. You…',
    leftPole:  'Finish what you started before switching',
    rightPole: 'Switch to the more interesting thing and come back to the first later',
  },
  {
    index: 94, dimension: 'JP', type: 'F',
    leftPole:  'Prefers to agree on an agenda before a meeting starts',
    rightPole: 'Prefers to go into a meeting open and see where the conversation leads',
  },
  {
    index: 95, dimension: 'JP', type: 'S',
    scenario:  'You realise a work rule no longer makes sense in the current context. You…',
    leftPole:  'Follow it until it is officially updated — working within the rules matters',
    rightPole: 'Apply judgment and do what makes more sense in the current context',
  },
  {
    index: 96, dimension: 'JP', type: 'F',
    leftPole:  'Feels most productive when working toward a specific goal with a defined end point',
    rightPole: 'Feels most productive when working freely without a fixed goal driving them',
  },
  {
    index: 97, dimension: 'JP', type: 'F',
    leftPole:  'Prefers projects with a defined scope and clear completion criteria',
    rightPole: 'Prefers projects that can evolve and develop organically over time',
  },
  {
    index: 98, dimension: 'JP', type: 'F',
    leftPole:  'When a project wraps up, feels a sense of closure and readiness to move on',
    rightPole: 'When a project wraps up, is already thinking about what comes next',
  },
  {
    index: 99, dimension: 'JP', type: 'S',
    scenario:  'You are asked to plan a team event. You…',
    leftPole:  'Immediately start organising the timeline, responsibilities, and logistics',
    rightPole: 'Prefer to let things come together more organically as the date approaches',
  },
]

// ─── Lookup helpers used by scoring engine and API routes ────────────────────

/** Returns the question at a given canonical index. Throws if index is invalid. */
export function getQuestion(index: number): PersonalityQuestion {
  const q = PERSONALITY_QUESTIONS[index]
  if (!q || q.index !== index) {
    throw new Error(`Invalid question index: ${index}`)
  }
  return q
}

/** Returns all 25 questions for a given dimension, in canonical order. */
export function getQuestionsByDimension(dimension: Dimension): PersonalityQuestion[] {
  return PERSONALITY_QUESTIONS.filter(q => q.dimension === dimension)
}
