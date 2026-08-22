import { z } from "zod";

export const mongodbObjectId = z.string().min(1, { message: "Invalid ID" });

export const similarQuestionValidation = z.object({
    _id: mongodbObjectId,
    title: z.string().min(6, {message: "Titel mustbe atleast 6 charecters"}),
    level: z.string().max(6, {message: "Level consist maximum 6 charecters"})
})