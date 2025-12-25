import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type QuizContent = {
  question?: string;
  options?: string[];
  answer?: string;
  hint?: string;
  image?: string;
  // For questions from bank
  questions?: Array<{
    id: string;
    question: string;
    options: string[];
    answer: string;
    skill: string;
    points: number;
  }>;
  fromBank?: boolean;
};

export type DragDropPair = {
  id: string;
  label: string;
  image?: string;
  target: string;
  targetImage?: string;
};

export type DragDropContent = {
  prompt: string;
  instructions?: string;
  pairs: DragDropPair[];
};

export type OrderingContent = {
  prompt: string;
  items: Array<{
    id: string;
    text: string;
    order: number;
  }>;
};

export type FillBlankContent = {
  prompt: string;
  items: Array<{
    id: string;
    text: string;
    blank: string;
    answer: string;
  }>;
};

export type ActivityContent = QuizContent | DragDropContent | OrderingContent | FillBlankContent;

export type Activity = {
  id: string;
  title: string;
  description: string;
  duration: string;
  skill: string;
  targetLevel?: "متقدمة" | "متوسطة" | "تحتاج دعم";
  outcomeLesson?: string;
  type?: "quiz" | "drag-drop" | "ordering" | "fill-blank";
  content?: ActivityContent;
  image?: string;
};

const activitiesFile = path.join(process.cwd(), "src", "data", "activities.json");

async function readActivitiesFile(): Promise<Activity[]> {
  const file = await fs.readFile(activitiesFile, "utf-8");
  return JSON.parse(file) as Activity[];
}

async function writeActivitiesFile(data: Activity[]) {
  await fs.writeFile(activitiesFile, JSON.stringify(data, null, 2), "utf-8");
}

export async function getActivities(): Promise<Activity[]> {
  return readActivitiesFile();
}

type NewActivityInput = Omit<Activity, "id">;

export async function addActivity(input: NewActivityInput): Promise<Activity> {
  const activities = await readActivitiesFile();
  const newActivity: Activity = { id: randomUUID(), ...input };
  activities.push(newActivity);
  await writeActivitiesFile(activities);
  return newActivity;
}



