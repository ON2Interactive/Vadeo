import { BookOpen, Clapperboard, Layers3, Sparkles, Wand2 } from 'lucide-react';

export interface GuideArticleSection {
    title: string;
    body: string;
}

export interface GuideArticle {
    slug: string;
    icon: any;
    title: string;
    cardBody: string;
    intro: string;
    sections: GuideArticleSection[];
}

export const guideArticles: GuideArticle[] = [
    {
        slug: 'build-a-video-ad-scene',
        icon: Layers3,
        title: 'How to Build a Video Ad Scene',
        cardBody: 'Learn how to place visuals on the canvas, structure a scene, add copy, and shape a polished ad layout before export.',
        intro: 'Build ad scenes by combining visuals, copy, and layout decisions on the canvas so every placement feels deliberate before you export.',
        sections: [
            {
                title: 'Start with the right canvas',
                body: 'Create a new project and choose the aspect ratio that matches the placement you are designing for. Vertical works best for reels and stories, square works for feeds, and widescreen works for websites and campaign placements.',
            },
            {
                title: 'Place your visual anchor first',
                body: 'Upload the main product image, video, or background asset first. This gives you the base composition to build around before adding supporting text or shapes.',
            },
            {
                title: 'Add headline, support copy, and CTA',
                body: 'Use text layers to establish hierarchy. Lead with the strongest headline, support it with one concise detail line, and finish with a clear CTA that tells the viewer what to do next.',
            },
            {
                title: 'Refine before export',
                body: 'Move, resize, and align elements until the scene reads clearly at a glance. Keep spacing clean, avoid crowding the frame, and preview the design before exporting.',
            },
        ],
    },
    {
        slug: 'use-motion',
        icon: Clapperboard,
        title: 'How to Use Motion',
        cardBody: 'Upload images or video, set timing, preview movement, and turn one scene into a polished motion-driven ad draft.',
        intro: 'Motion turns uploaded images or video into a sequenced ad scene that you can still adjust directly on the canvas before export.',
        sections: [
            {
                title: 'Upload your source assets',
                body: 'Open Motion, upload the images or clips you want to sequence, choose the aspect ratio, and set the duration that best fits the placement.',
            },
            {
                title: 'Control pacing and preview playback',
                body: 'Use the Motion inputs to shape pacing, then preview the result from the right-side Motion preview control. This keeps the Motion workflow separate from standard generation tools.',
            },
            {
                title: 'Edit the scene on canvas',
                body: 'Once the draft is generated, you can still move visuals, remove overlays, adjust title placement, and refine CTA copy directly in the editor.',
            },
            {
                title: 'Export for the final placement',
                body: 'When the scene feels right, export it in the resolution allowed by your plan. Motion remains useful even when you want a more manual workflow than Motion AI.',
            },
        ],
    },
    {
        slug: 'generate-with-ai',
        icon: Sparkles,
        title: 'How to Generate with AI',
        cardBody: 'Use Vadeo generation tools to create ad-ready video from visuals, prompts, and branded direction in 1080p or 4K.',
        intro: 'Vadeo AI generation is built for advertisers and creative teams who want to move from prompt and reference to ad-ready motion quickly.',
        sections: [
            {
                title: 'Choose the right generation mode',
                body: 'Use Generate when you want prompt-led video generation, Frames to Video when you have clear start and end frames, and Ref-Video when you want references to guide the look and continuity.',
            },
            {
                title: 'Write prompts for ad structure',
                body: 'Prompt for product focus, movement, camera behavior, pacing, brand tone, and the intended placement. The clearer the ad direction, the stronger the result.',
            },
            {
                title: 'Use plan-aware resolution',
                body: 'Standard users generate in 1080p, while Premium users generate in 4K. Keep that in mind when planning campaign outputs and client deliverables.',
            },
            {
                title: 'Bring the result back into the editor',
                body: 'After generation, use the editor to add overlays, CTA text, or supporting graphics so the clip feels like a finished ad rather than just raw footage.',
            },
        ],
    },
    {
        slug: 'use-motion-ai',
        icon: Wand2,
        title: 'How to Use Motion AI',
        cardBody: 'Generate an 8-second AI motion scene from an image or frame pair, then refine it with overlays, CTA copy, and export settings.',
        intro: 'Motion AI is the fastest way to create an AI-generated scene inside Vadeo and then polish it like a real ad.',
        sections: [
            {
                title: 'Choose image-to-video or frames-to-video',
                body: 'Use one image when you want Motion AI to generate a single scene from a still. Use two images when you want frames-to-video behavior with a clearer starting and ending visual state.',
            },
            {
                title: 'Keep the brief focused',
                body: 'Motion AI works best when the prompt stays concise and visually specific. Describe the product, movement, tone, and desired ad feel without overloading the request.',
            },
            {
                title: 'Refine on the canvas after generation',
                body: 'Once Motion AI returns the scene, adjust overlays, title, supporting copy, and CTA on the canvas. The generated motion clip becomes the foundation, not the final step.',
            },
            {
                title: 'Use Motion AI strategically',
                body: 'Motion AI is best for hero scenes, product moments, and fast ad concepts. You can combine those scenes with standard editor workflows or other Motion scenes later.',
            },
        ],
    },
    {
        slug: 'export-for-different-placements',
        icon: BookOpen,
        title: 'How to Export for Different Placements',
        cardBody: 'Prepare scenes for vertical, square, and widescreen placements so you can deliver social ads, website videos, and campaign assets faster.',
        intro: 'Export is where scene prep becomes campaign output, so placements and resolution should be considered before the final render.',
        sections: [
            {
                title: 'Match the canvas to the placement',
                body: 'Choose the aspect ratio early so the scene is composed correctly from the start. This avoids last-minute reframing before export.',
            },
            {
                title: 'Use the right length for the job',
                body: 'Shorter durations usually work better for paid social and hooks, while longer durations support websites, product storytelling, and fuller campaign sequences.',
            },
            {
                title: 'Respect plan limits',
                body: 'Standard supports 1080p while Premium supports 4K. Exports should align with both the campaign need and the plan the account is on.',
            },
            {
                title: 'Review before final delivery',
                body: 'Preview the exported file and confirm text readability, pacing, and scene timing before sending it to a client, campaign manager, or publishing workflow.',
            },
        ],
    },
];

export const guideFaqs = [
    {
        question: 'How do I start building a video ad in Vadeo?',
        answer: 'Start by creating a new project, choosing the right aspect ratio, and uploading your product images or footage. From there you can build a scene manually on the canvas or move into Motion or Motion AI depending on the type of output you need.',
    },
    {
        question: 'When should I use Motion instead of Motion AI?',
        answer: 'Use Motion when you want to sequence uploaded images or video yourself and control the structure of the scene directly. Use Motion AI when you want Vadeo to generate a motion scene from an image or frame pair and then refine it with overlays and CTA copy.',
    },
    {
        question: 'How do aspect ratios work in Vadeo?',
        answer: 'Aspect ratios define the canvas size for the scene you are building. Choose vertical for reels and stories, square for feeds, and widescreen for websites, paid placements, or landscape campaign videos.',
    },
    {
        question: 'How do I add branding and offer copy?',
        answer: 'Use text, overlays, and supporting elements on the canvas to add headlines, offer copy, CTA messaging, and brand structure. These layers remain editable so you can reposition, refine, or remove them before export.',
    },
    {
        question: 'How do exports work for different plans?',
        answer: 'Your plan determines generation access and resolution. Standard supports 1080p generation, while Premium supports 4K. Motion and the editor remain available for broader scene-building, while generation tools follow the limits of your plan.',
    },
    {
        question: 'How do I keep work from getting lost?',
        answer: 'Vadeo autosaves projects to your account so you can come back to them later. Once a project has been saved, refreshing or returning to the editor should restore the latest saved state instead of starting you from a blank document.',
    },
];

export const getGuideArticle = (slug: string) => guideArticles.find((guide) => guide.slug === slug) || null;
