import type { User, TeacherProfile, StudentProfile, UserSettings } from "@prisma/client";

export type UserWithProfile = User & {
    teacherProfile?: TeacherProfile | null;
    studentProfile?: StudentProfile | null;
    settings?: UserSettings | null;
};
