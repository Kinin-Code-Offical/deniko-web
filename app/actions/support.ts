"use server";

import { z } from "zod";
import { sendSupportTicketEmail } from "@/lib/email";
import logger from "@/lib/logger";

const supportSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(5),
  type: z.enum(["general", "bug", "billing", "feature"]),
  message: z.string().min(10),
});

export type SupportState = {
  success?: boolean;
  message?: string;
  ticketId?: string;
  errors?: {
    [K in keyof z.infer<typeof supportSchema>]?: string[];
  };
};

export async function submitSupportTicket(
  prevState: SupportState,
  formData: FormData
): Promise<SupportState> {
  const validatedFields = supportSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    type: formData.get("type"),
    message: formData.get("message"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid fields",
    };
  }

  const { name, email, subject, type, message } = validatedFields.data;

  // Generate Ticket ID: #DNK-{RANDOM_4_HEX}
  const randomHex = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .toUpperCase()
    .padStart(4, "0");
  const ticketId = `#DNK-${randomHex}`;

  try {
    // In a real app, you would save this to a database here.
    // await db.ticket.create({ ... })

    // Send email notification
    await sendSupportTicketEmail({
      ticketId,
      type,
      name,
      email,
      message: `Subject: ${subject}\n\n${message}`, // Include subject in message body since we use a standard subject format
    });

    // Send confirmation to user (optional, but good practice)
    // await transporter.sendMail({ ... })

    logger.info(`Support ticket created: ${ticketId} from ${email}`);

    return {
      success: true,
      ticketId,
      message: "Ticket created successfully",
    };
  } catch (error) {
    logger.error({ err: error }, "Failed to submit support ticket");
    return {
      success: false,
      message: "Failed to submit ticket. Please try again later.",
    };
  }
}
