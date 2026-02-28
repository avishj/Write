/**
 * Predefined text samples for consistent testing across
 * the analysis engine (counter, readability, statistics, etc.).
 */

export const EMPTY = "";

export const WHITESPACE_ONLY = "   \n\n  \t  ";

export const SINGLE_WORD = "Hello";

export const SIMPLE_SENTENCE = "The quick brown fox jumps over the lazy dog.";

export const TWO_PARAGRAPHS = "First paragraph here.\n\nSecond paragraph here.";

export const MULTIPLE_SENTENCES = "Hello. World. Foo.";

export const HYPHENATED = "well-known fact";

export const UNICODE_TEXT = "Café résumé naïve";

export const TRAILING_WHITESPACE = "hello world  \n\n  ";

export const MULTIPLE_NEWLINES = "a\n\n\n\nb";

export const NUMBERS_IN_TEXT = "I have 3 cats";

export const ABBREVIATIONS = "Dr. Smith went to D.C.";

export const ELLIPSIS = "Wait... what?";

export const MIXED_PUNCTUATION = "Really?! Yes!";

/**
 * ~500 words of real English prose for bulk testing.
 * Structured with multiple paragraphs, varied sentence lengths,
 * and natural vocabulary distribution.
 */
export const LONG_TEXT = `The art of writing is one of the most remarkable achievements of human civilization. From the earliest cave paintings to modern digital text, the desire to record and share ideas has driven countless innovations. Writing allows us to preserve knowledge across generations, communicate complex thoughts with precision, and express the full range of human emotion.

In the ancient world, scribes held positions of great power and prestige. They were the keepers of records, the drafters of laws, and the chroniclers of history. The invention of the alphabet simplified the process dramatically, making literacy accessible to a much broader segment of society. This democratization of writing had profound implications for governance, commerce, and culture.

The printing press, invented by Johannes Gutenberg in the fifteenth century, represented another quantum leap forward. Books that once took months to copy by hand could now be produced in days. Ideas spread faster than ever before, fueling the Renaissance, the Reformation, and the Scientific Revolution. The written word became the primary vehicle for intellectual discourse and social change.

Today we find ourselves in yet another transformation. Digital technology has made writing more accessible than at any point in human history. Anyone with a smartphone can publish their thoughts to a global audience in seconds. Social media platforms have created new forms of writing that blend casual conversation with public broadcasting. The boundaries between author and reader have blurred considerably.

Yet despite these changes, the fundamental challenge of writing remains the same. How do we organize our thoughts clearly? How do we choose the right words to convey our meaning? How do we engage our readers and hold their attention? These questions have occupied writers for thousands of years and will continue to do so for thousands more.

Good writing requires practice, patience, and a willingness to revise. The first draft is rarely the final draft. Professional writers often speak of the importance of editing, of cutting unnecessary words, of tightening prose until every sentence serves a clear purpose. This discipline separates effective communication from mere noise.

The tools we use to write have changed enormously, but the craft itself endures. Whether scratching symbols on clay tablets or typing on glass screens, the act of writing connects us to every generation that came before. It is, perhaps, the most human of all activities.

Counting words and measuring text might seem mundane compared to the grand sweep of literary history. But precision matters. Whether you are writing an essay with a strict word limit, crafting a tweet within character constraints, or editing a manuscript to meet publisher requirements, knowing exactly how many words you have written is essential. A good word counter is a quiet but indispensable tool in every writer's toolkit.`;

/**
 * Simple passage at approximately grade 5 reading level.
 * Short sentences, common words, simple structure.
 */
export const KNOWN_GRADE_5 = `The cat sat on the mat. It was a big brown cat. The cat liked to sit in the sun. Every day the cat would find a warm spot. Then it would curl up and sleep. The cat was very happy. It had food and water and a warm home. Life was good for the little cat.`;

/**
 * Complex passage at approximately grade 12+ reading level.
 * Long sentences, academic vocabulary, complex structure.
 */
export const KNOWN_GRADE_12 = `The epistemological implications of quantum mechanics necessitate a fundamental reconsideration of classical deterministic frameworks. Heisenberg's uncertainty principle demonstrates that simultaneous precise measurement of complementary variables remains inherently impossible, thereby undermining the foundational assumptions of Newtonian physics. Furthermore, the phenomenon of quantum entanglement suggests non-local correlations that challenge conventional notions of spatial causality and temporal sequence. Contemporary theoretical physicists continue to grapple with the philosophical ramifications of these observations, particularly regarding the interpretation of wave function collapse and the measurement problem.`;
