import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const modelKey = "google/gemini-3-flash-preview";

function getGateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

const EmailInput = z.object({
  purpose: z.string().min(1),
  recipient: z.string().min(1),
  tone: z.string().min(1),
  keyPoints: z.string().min(1),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const model = gateway(modelKey);
    const { text } = await generateText({
      model,
      system:
        "You are a professional email writing assistant. Write clear, concise, and effective emails. Always include appropriate greeting and closing. Do not include placeholder text like [Name] — write natural, complete emails.",
      prompt: `Write a professional email with the following details:\nPurpose: ${data.purpose}\nRecipient: ${data.recipient}\nTone: ${data.tone}\nKey points to include: ${data.keyPoints}`,
    });
    return { text };
  });

const MeetingInput = z.object({
  notes: z.string().min(1),
  format: z.string().min(1),
});

export const summarizeMeetingNotes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => MeetingInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const model = gateway(modelKey);
    const { text } = await generateText({
      model,
      system:
        "You are a meeting notes summarization assistant. Summarize raw meeting notes into clear, structured summaries. Identify action items, decisions, and key discussion points.",
      prompt: `Summarize these meeting notes in the following format: ${data.format}\n\nRaw meeting notes:\n${data.notes}`,
    });
    return { text };
  });

const TaskInput = z.object({
  goal: z.string().min(1),
  context: z.string().min(1),
  constraints: z.string().optional(),
});

export const generateTaskPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TaskInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const model = gateway(modelKey);
    const { text } = await generateText({
      model,
      system:
        "You are a task planning assistant. Create detailed, actionable task plans with clear steps, priorities, and timelines. Use markdown formatting for readability.",
      prompt: `Create a detailed task plan for: ${data.goal}\n\nContext: ${data.context}${data.constraints ? `\nConstraints: ${data.constraints}` : ""}`,
    });
    return { text };
  });

const ResearchInput = z.object({
  topic: z.string().min(1),
  depth: z.string().min(1),
});

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResearchInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const model = gateway(modelKey);
    const { text } = await generateText({
      model,
      system:
        "You are a research assistant. Provide comprehensive, well-structured research summaries on the given topic. Include key findings, relevant concepts, and practical takeaways. Use markdown formatting.",
      prompt: `Research the following topic at ${data.depth} depth:\n${data.topic}\n\nProvide a structured summary with key findings and takeaways.`,
    });
    return { text };
  });
