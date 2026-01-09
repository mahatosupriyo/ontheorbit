// "use server";

// import { db } from "@/server/db/index";
// import { conversations, messages, blocks } from "@/server/db/schema/social";
// import { auth } from "@/auth";
// import { eq, and, or } from "drizzle-orm";
// import { revalidatePath } from "next/cache";

// // --- 1. SEND MESSAGE (The "Note" Logic) ---
// export async function sendMessage(receiverId: string, content: string) {
//     const session = await auth();
//     if (!session?.user) return { error: "Unauthorized" };
//     const senderId = session.user.id;

//     // A. Check for Blocks (Privacy Standard)
//     const isBlocked = await db.query.blocks.findFirst({
//         where: or(
//             and(eq(blocks.blockerId, receiverId), eq(blocks.blockedId, senderId)), // They blocked you
//             and(eq(blocks.blockerId, senderId), eq(blocks.blockedId, receiverId))  // You blocked them
//         )
//     });

//     if (isBlocked) return { error: "You cannot message this user." };

//     // B. Check for Existing Conversation
//     let conversation = await db.query.conversations.findFirst({
//         where: or(
//             and(eq(conversations.initiatorId, senderId), eq(conversations.receiverId, receiverId)),
//             and(eq(conversations.initiatorId, receiverId), eq(conversations.receiverId, senderId))
//         )
//     });

//     // C. Create Conversation if None Exists (Status: REQUESTED)
//     if (!conversation) {
//         const [newConvo] = await db.insert(conversations).values({
//             initiatorId: senderId,
//             receiverId,
//             status: "REQUESTED", // <--- Key Instagram Feature: It's a request, not a chat yet
//         }).returning();
//         conversation = newConvo;
//     }

//     // D. Send the Message
//     await db.insert(messages).values({
//         conversationId: conversation.id,
//         senderId,
//         content,
//     });

//     // Update "last message" timestamp for sorting
//     await db.update(conversations)
//         .set({ lastMessageAt: new Date() })
//         .where(eq(conversations.id, conversation.id));

//     revalidatePath("/messages");
//     return { success: true };
// }

// // --- 2. ACCEPT MESSAGE REQUEST ---
// export async function acceptMessageRequest(conversationId: string) {
//     const session = await auth();

//     // Update status to ACTIVE
//     await db.update(conversations)
//         .set({ status: "ACTIVE" })
//         .where(and(
//             eq(conversations.id, conversationId),
//             eq(conversations.receiverId, session?.user?.id!) // Only receiver can accept
//         ));

//     revalidatePath("/messages");
// }