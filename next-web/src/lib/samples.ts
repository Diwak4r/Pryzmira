export interface WritingSamplePreset {
    id: string;
    label: string;
    description: string;
    sampleText: string;
    suggestedTask: string;
    suggestedInstructions: string;
}

/**
 * Original sample writing used by the "Use a sample" shortcut. They exist so
 * someone can feel the product in ten seconds without hunting for a message to
 * paste. Each one has a deliberately different rhythm.
 */
export const WRITING_SAMPLE_PRESETS: WritingSamplePreset[] = [
    {
        id: 'group-chat',
        label: 'Group chat',
        description: 'Loose, lowercase, lots of contractions',
        sampleText:
            "ok so the plan for saturday is we meet at the usual spot around 10, grab coffee first because i'm not doing a hike on an empty stomach. bring the good camera if you have it. also someone please remind me to charge my power bank, i always forget and then my phone dies halfway up the trail. if it rains we bail and do the museum instead. no stress either way, i just want to get out of the house for a few hours.",
        suggestedTask: 'Write a message to the group asking to push the plan back by an hour.',
        suggestedInstructions: 'Keep it casual and short. No exclamation marks.',
    },
    {
        id: 'work-email',
        label: 'Work email',
        description: 'Measured, structured, lightly formal',
        sampleText:
            "Thanks for the detailed write-up on the migration plan. I read through it twice and the sequencing makes sense, particularly the decision to move the billing service last. Two concerns before we commit: the rollback window looks optimistic given last month's incident, and we have not confirmed who owns the on-call rotation during the cutover. I would like those resolved before the Thursday review. If it helps, I can draft the rollback checklist and circulate it by Wednesday afternoon.",
        suggestedTask: 'Write a follow-up email summarising the two open concerns and proposing next steps.',
        suggestedInstructions: 'Professional but not stiff. Under 150 words.',
    },
    {
        id: 'study-notes',
        label: 'Study notes',
        description: 'Clipped fragments, lists, no filler',
        sampleText:
            "Chapter 4 - memory. Working memory is not storage, it is the active workspace. Capacity around four chunks, not seven like the old textbooks claimed. Rehearsal keeps things alive but does not move them to long-term. Encoding depth matters more than repetition count. Elaborative rehearsal beats maintenance rehearsal every time. Exam angle: contrast the two rehearsal types with an example. Also remember the Baddeley model, phonological loop plus visuospatial sketchpad.",
        suggestedTask: 'Write a short summary of these notes for a classmate who missed the lecture.',
        suggestedInstructions: 'Keep the clipped note style. No long paragraphs.',
    },
];
