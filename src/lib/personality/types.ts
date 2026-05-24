/**
 * Personality Assessment — 16 Type Result Cards
 *
 * Keyed by type code (e.g. 'INTJ').
 * type_name is NOT stored in the database — it is always derived here at display time.
 * This prevents type_code / type_name drift bugs.
 */

export type TypeCode =
  | 'ISTJ' | 'ISFJ' | 'INFJ' | 'INTJ'
  | 'ISTP' | 'ISFP' | 'INFP' | 'INTP'
  | 'ESTP' | 'ESFP' | 'ENFP' | 'ENTP'
  | 'ESTJ' | 'ESFJ' | 'ENFJ' | 'ENTJ'

export type PersonalityTypeCard = {
  code: TypeCode
  name: string
  description: string   // 3 sentences, workplace-focused
  strengths: string[]   // 4–6 items
  watchOuts: string[]   // 2–3 items
}

export const PERSONALITY_TYPES: Record<TypeCode, PersonalityTypeCard> = {

  INTJ: {
    code: 'INTJ',
    name: 'The Strategist',
    description:
      'INTJs are independent, forward-thinking, and quietly driven — they enter any role with a clear sense of how things could work better and set about making it happen. ' +
      'They are most at home solving complex, long-horizon problems that reward depth of thinking over speed of consensus. ' +
      'They communicate efficiently and expect the same in return, making them well-suited to roles where precision and independent judgment matter more than group alignment.',
    strengths: [
      'Connects the dots others miss — strong strategic and long-range thinking',
      'High personal standards with strong follow-through',
      'Works well independently with minimal supervision needed',
      'Direct, efficient communicator — no filler',
      'Quickly identifies what is not working and why',
      'Confident in their analysis even when it goes against the grain',
    ],
    watchOuts: [
      'Can come across as dismissive of ideas they have already decided are flawed',
      'May not communicate the reasoning behind their conclusions in ways others can easily follow',
      'Impatience with process, consensus-building, or meetings can create friction with teams that need more collaboration',
    ],
  },

  INTP: {
    code: 'INTP',
    name: 'The Analyst',
    description:
      'INTPs are precise, curious, and intellectually restless — they are at their best when given a complex problem and the space to work through it thoroughly. ' +
      'They tend to hold conclusions loosely until they are confident the logic is fully sound, which makes them rigorous but sometimes slow to commit. ' +
      'In collaborative settings they contribute most as the person who asks the question no one else thought to ask.',
    strengths: [
      'Deep analytical thinking and strong precision',
      'Genuinely curious — invests in understanding things fully before acting',
      'Spots logical inconsistencies others overlook',
      'Calm and objective under pressure',
      'Generates novel solutions by approaching problems from first principles',
    ],
    watchOuts: [
      'Can over-analyse before acting, which slows delivery',
      'May appear detached or disengaged in highly people-oriented environments',
      'Written and verbal communication can be dense — may need prompting to simplify for non-specialist audiences',
    ],
  },

  ENTJ: {
    code: 'ENTJ',
    name: 'The Director',
    description:
      'ENTJs are decisive, results-driven, and natural leaders — they move quickly from problem to plan to action and expect others to keep up. ' +
      'They are most energised in roles with clear accountability, measurable goals, and the authority to drive change. ' +
      'They bring urgency and clarity to teams, though their pace and directness can occasionally feel like pressure rather than support.',
    strengths: [
      'Takes charge naturally in ambiguous situations',
      'Strategic thinker who also executes — not just vision, but delivery',
      'Direct, efficient communicator who gives people clear direction',
      'High energy — sets a strong pace and drives momentum',
      'Comfortable making difficult decisions when the logic is clear',
      'Builds high-performing teams around well-defined goals',
    ],
    watchOuts: [
      'Can be perceived as domineering or impatient with input that slows things down',
      'Moves quickly — may not bring everyone along at the same pace',
      'Low tolerance for what they see as inefficiency or unnecessary deliberation',
    ],
  },

  ENTP: {
    code: 'ENTP',
    name: 'The Innovator',
    description:
      'ENTPs are fast-thinking, challenge-loving, and relentlessly curious — they thrive when generating ideas, questioning assumptions, and finding better ways to do things. ' +
      'They are most engaged in roles that involve complexity, variety, and intellectual stretch. ' +
      'They bring energy and creative thinking to teams but are more naturally wired for the beginning of a project than the finish.',
    strengths: [
      'Sharp, quick mind — generates ideas rapidly and across domains',
      'Comfortable challenging the status quo and questioning accepted thinking',
      'Persuasive and confident communicator',
      'Energises others with their enthusiasm',
      'Sees connections between ideas that others miss',
    ],
    watchOuts: [
      'Loses interest once the interesting parts are solved — follow-through on execution can be inconsistent',
      'Debate-oriented style can come across as argumentative even when not intended',
      'Tends to start more things than they finish',
    ],
  },

  INFJ: {
    code: 'INFJ',
    name: 'The Counsellor',
    description:
      'INFJs are thoughtful, principled, and quietly perceptive — they have an unusual ability to understand what drives people and use that insight to bring out the best in those around them. ' +
      'They are most effective in roles that connect to a clear sense of purpose and allow them to positively influence others. ' +
      'They hold their values firmly, which makes them consistent and trustworthy, though they can find it hard to stay detached from outcomes they care deeply about.',
    strengths: [
      'Deeply empathetic — reads people and situations with accuracy',
      'Strong values that drive consistent, principled behaviour',
      'Skilled at helping others clarify their thinking and make decisions',
      'Long-term oriented — keeps the bigger picture in view',
      'Builds trust naturally and quickly',
    ],
    watchOuts: [
      'Sets very high personal standards — can be hard on themselves when things fall short',
      'May internalise conflict rather than surface it directly',
      'Can become over-invested in outcomes that involve causes or people they care about',
    ],
  },

  INFP: {
    code: 'INFP',
    name: 'The Idealist',
    description:
      'INFPs are imaginative, values-driven, and quietly committed — they bring a depth of care to their work that is rare, and they are most effective when their role feels genuinely meaningful and aligned with who they are. ' +
      'They are thoughtful collaborators who tend to notice and support what others overlook. ' +
      'In highly structured or routine-heavy environments, they can struggle unless they feel a real connection to the purpose behind the work.',
    strengths: [
      'Strong personal values that inform everything they do',
      'Creative and original thinker — finds angles others do not consider',
      'Genuinely caring and supportive of colleagues',
      'Excellent listener — makes people feel understood',
      'Commits deeply to work they believe in',
    ],
    watchOuts: [
      'Repetitive or process-heavy roles may drain motivation over time',
      'May avoid necessary conflict, leaving issues unaddressed',
      'Can be self-critical when their own standard of work is not met',
    ],
  },

  ENFJ: {
    code: 'ENFJ',
    name: 'The Mentor',
    description:
      'ENFJs are warm, people-focused, and naturally motivating — they are energised by helping others grow and are skilled at bringing out the best in teams. ' +
      'They tend to take on responsibility beyond their own remit, which makes them excellent collaborators but occasionally overextended. ' +
      'They are most effective in roles where strong relationships and clear communication with others are central to success.',
    strengths: [
      'Inspires and motivates those around them',
      'Strong communicator who adapts their style to the person',
      'High emotional intelligence — reads the room accurately',
      'Takes ownership and follows through on commitments to others',
      'Builds strong, trusting relationships quickly',
      'Brings people together toward a shared goal',
    ],
    watchOuts: [
      'Takes on too much — finds it difficult to say no when others need support',
      'Can prioritise team harmony at the expense of difficult but necessary conversations',
      'Sensitive to criticism or friction with people they are close to',
    ],
  },

  ENFP: {
    code: 'ENFP',
    name: 'The Champion',
    description:
      'ENFPs are enthusiastic, creative, and people-focused — they bring energy and warmth to every environment they enter and have a natural ability to connect ideas with people. ' +
      'They are most engaged when their work involves variety, collaboration, and the opportunity to have a genuine impact. ' +
      'They are strong starters and relationship builders, though they benefit from support and structure through the more routine parts of delivery.',
    strengths: [
      'Warm, charismatic, and genuinely easy to work with',
      'Creative thinker who generates fresh ideas with ease',
      'Connects quickly with a wide range of people',
      'Brings enthusiasm that lifts team energy',
      'Strong intuition about people and future possibilities',
    ],
    watchOuts: [
      'Consistency and follow-through on routine tasks can be a challenge',
      'Enthusiasm can lead to overcommitting — more is taken on than capacity allows',
      'May disengage in roles that are repetitive or heavily process-driven',
    ],
  },

  ISTJ: {
    code: 'ISTJ',
    name: 'The Dependable',
    description:
      'ISTJs are reliable, thorough, and quietly competent — they deliver what they commit to, maintain high standards without needing recognition, and bring order to every environment they work in. ' +
      'They are most effective where clear expectations and established processes are valued, and where accuracy and consistency matter. ' +
      'They are the people a team leans on when something simply must be done correctly.',
    strengths: [
      'Extremely reliable — delivers what they said they would, when they said they would',
      'High attention to detail and accuracy',
      'Strong work ethic and personal accountability',
      'Organised and consistent — brings structure naturally',
      'Trustworthy with sensitive or confidential information',
      'Respects process and upholds agreed standards',
    ],
    watchOuts: [
      'Can be resistant to change, particularly when a new approach has not yet been proven',
      'Prefers clear frameworks — may find highly ambiguous or undefined roles frustrating',
      'Directness can occasionally come across as blunt without that being the intent',
    ],
  },

  ISFJ: {
    code: 'ISFJ',
    name: 'The Supporter',
    description:
      'ISFJs are dependable, considerate, and quietly dedicated — they are attentive to the needs of those around them and take real pride in their work and in supporting others to do well. ' +
      'They operate best in stable, structured environments where their consistency and care are valued. ' +
      'They rarely seek the spotlight, but are often the person a team could not function without.',
    strengths: [
      'Warm and genuinely attentive to the needs of others',
      'Reliable and consistent — follows through on every commitment',
      'Strong memory for detail, especially where people are involved',
      'Patient and steady in demanding or pressured situations',
      'Creates a stable, organised environment for the people around them',
    ],
    watchOuts: [
      'Finds it difficult to say no, which can lead to taking on too much',
      'May avoid expressing disagreement even when they have important concerns to raise',
      'Not naturally comfortable with ambiguity or rapidly shifting priorities',
    ],
  },

  ESTJ: {
    code: 'ESTJ',
    name: 'The Organiser',
    description:
      'ESTJs are structured, action-oriented, and direct — they bring order and momentum to teams and have a strong instinct for identifying what needs to happen and making sure it does. ' +
      'They are most effective in roles with clear authority, measurable outputs, and processes that can be built and maintained. ' +
      'They bring accountability and clarity to every environment they lead.',
    strengths: [
      'Strong organiser — creates structure and keeps things moving',
      'Clear, direct communicator — people know exactly where they stand',
      'Holds themselves and others to commitments',
      'Decisive and action-oriented — does not wait for permission to move',
      'Dependable under pressure — stays focused and delivers',
    ],
    watchOuts: [
      'Can come across as inflexible when a situation calls for adapting the plan',
      'May prioritise process and outcome over people\'s experience in high-pressure moments',
      'Strong views — can be difficult to persuade once a position is firmly held',
    ],
  },

  ESFJ: {
    code: 'ESFJ',
    name: 'The Connector',
    description:
      'ESFJs are warm, organised, and team-focused — they are energised by working with people and take real satisfaction in making things run smoothly and ensuring others feel valued. ' +
      'They are most effective in roles where relationships, coordination, and a clear sense of shared purpose are central. ' +
      'They bring both structure and warmth, which makes them effective in people-facing and team-supporting roles alike.',
    strengths: [
      'Highly attuned to team morale and the needs of those around them',
      'Warm and approachable — builds genuine relationships quickly',
      'Organised and reliable where expectations are clear',
      'Strong communicator with a collaborative style',
      'Takes their responsibilities and commitments seriously',
    ],
    watchOuts: [
      'Conflict-averse — may smooth over issues rather than address them directly',
      'Heavily influenced by the opinions of people they respect, which can limit independent judgment',
      'High-ambiguity or rapidly changing environments can be draining',
    ],
  },

  ISTP: {
    code: 'ISTP',
    name: 'The Problem-Solver',
    description:
      'ISTPs are calm, observant, and practically minded — they are at their best diagnosing and resolving real problems, often finding solutions others overlooked. ' +
      'They prefer to act rather than deliberate, which makes them effective in hands-on or technical environments and less naturally suited to roles where influence and relationship management are the primary tools. ' +
      'They bring quiet competence and work well without close supervision.',
    strengths: [
      'Calm and composed under pressure — does not escalate',
      'Excellent practical problem-solver with strong situational awareness',
      'Highly observant — notices things others miss',
      'Independent and self-directed — requires minimal oversight',
      'Adaptable and resourceful in unexpected or ambiguous situations',
    ],
    watchOuts: [
      'Can appear detached or hard to read — team members may not know where they stand',
      'Less comfortable with long-term planning or structured reporting requirements',
      'Communication in leadership or collaborative settings may require deliberate effort',
    ],
  },

  ISFP: {
    code: 'ISFP',
    name: 'The Craftsperson',
    description:
      'ISFPs are gentle, grounded, and genuinely committed to doing good work — they bring care and a strong eye for quality to everything they touch. ' +
      'They are most effective in roles that offer some independence, a clear practical purpose, and the chance to produce something they feel proud of. ' +
      'They are not natural self-promoters, but the quality of their work is evident when they are given the space to do it.',
    strengths: [
      'Warm and considerate — treats people around them with genuine care',
      'Strong quality sensibility — takes pride in doing things well',
      'Flexible and adaptable in day-to-day work',
      'Deeply committed to work they find meaningful',
      'Good listener — attuned to the needs of others',
    ],
    watchOuts: [
      'Avoids conflict even when raising an issue is necessary, which can leave problems unresolved',
      'May struggle to advocate for themselves or their own contributions',
      'Highly structured or process-heavy environments can feel restrictive over time',
    ],
  },

  ESTP: {
    code: 'ESTP',
    name: 'The Doer',
    description:
      'ESTPs are energetic, perceptive, and results-focused — they are most effective in fast-moving environments where quick decisions and direct action matter more than long deliberation. ' +
      'They read situations quickly, adapt on the fly, and have a natural persuasiveness that makes them effective in negotiations, client-facing roles, and hands-on problem solving. ' +
      'They are energised by action and can find planning-heavy or administrative roles frustrating.',
    strengths: [
      'Quick thinking and decisive — especially effective under pressure',
      'Strong practical problem-solver — prefers doing to discussing',
      'Persuasive, direct communicator',
      'Highly adaptable — thrives in fast-changing environments',
      'Reads what is actually happening in a situation with accuracy',
      'Natural influencer and negotiator',
    ],
    watchOuts: [
      'Long-term planning and structured reporting are not natural strengths',
      'Comfortable with risk at a level others may find too high',
      'Directness can occasionally come across as abrasive',
    ],
  },

  ESFP: {
    code: 'ESFP',
    name: 'The Energiser',
    description:
      'ESFPs are enthusiastic, people-focused, and action-oriented — they bring energy, warmth, and responsiveness to any team and are naturally skilled at reading and engaging the people around them. ' +
      'They are most effective in environments that involve human interaction, variety, and the opportunity to respond in the moment. ' +
      'In highly structured, analytical, or detail-heavy roles, they may find it harder to stay engaged over the long term.',
    strengths: [
      'Warm, charismatic, and easy to work alongside',
      'Brings genuine enthusiasm and positivity to the team',
      'Practical and responsive — prefers action to lengthy planning',
      'Strong people skills — connects easily across personality types',
      'Flexible and calm in fast-changing or unplanned situations',
    ],
    watchOuts: [
      'Long-range planning and follow-through on detailed tasks can be a challenge',
      'May find highly structured or rule-heavy environments restrictive',
      'Decision-making can be more reactive than deliberate in high-pressure moments',
    ],
  },

}

/** Returns the type card for a given code. Throws if code is invalid. */
export function getTypeCard(code: string): PersonalityTypeCard {
  const card = PERSONALITY_TYPES[code as TypeCode]
  if (!card) throw new Error(`Invalid type code: ${code}`)
  return card
}

/** All 16 valid type codes. */
export const ALL_TYPE_CODES: TypeCode[] = Object.keys(PERSONALITY_TYPES) as TypeCode[]
