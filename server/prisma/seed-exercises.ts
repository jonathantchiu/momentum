import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const exercises = [
  // Strength - Chest
  { name: 'Bench Press', category: 'strength', muscleGroups: ['chest', 'triceps', 'shoulders'], equipment: 'barbell' },
  { name: 'Incline Bench Press', category: 'strength', muscleGroups: ['upper chest', 'shoulders', 'triceps'], equipment: 'barbell' },
  { name: 'Dumbbell Fly', category: 'strength', muscleGroups: ['chest'], equipment: 'dumbbell' },
  { name: 'Push-Up', category: 'strength', muscleGroups: ['chest', 'triceps', 'shoulders'], equipment: 'bodyweight' },
  // Strength - Back
  { name: 'Deadlift', category: 'strength', muscleGroups: ['back', 'glutes', 'hamstrings'], equipment: 'barbell' },
  { name: 'Pull-Up', category: 'strength', muscleGroups: ['back', 'biceps'], equipment: 'bodyweight' },
  { name: 'Barbell Row', category: 'strength', muscleGroups: ['back', 'biceps'], equipment: 'barbell' },
  { name: 'Lat Pulldown', category: 'strength', muscleGroups: ['back', 'biceps'], equipment: 'machine' },
  // Strength - Legs
  { name: 'Squat', category: 'strength', muscleGroups: ['quads', 'glutes', 'hamstrings'], equipment: 'barbell' },
  { name: 'Romanian Deadlift', category: 'strength', muscleGroups: ['hamstrings', 'glutes'], equipment: 'barbell' },
  { name: 'Leg Press', category: 'strength', muscleGroups: ['quads', 'glutes'], equipment: 'machine' },
  { name: 'Lunge', category: 'strength', muscleGroups: ['quads', 'glutes', 'hamstrings'], equipment: 'bodyweight' },
  // Strength - Shoulders
  { name: 'Overhead Press', category: 'strength', muscleGroups: ['shoulders', 'triceps'], equipment: 'barbell' },
  { name: 'Lateral Raise', category: 'strength', muscleGroups: ['shoulders'], equipment: 'dumbbell' },
  // Strength - Arms
  { name: 'Barbell Curl', category: 'strength', muscleGroups: ['biceps'], equipment: 'barbell' },
  { name: 'Tricep Pushdown', category: 'strength', muscleGroups: ['triceps'], equipment: 'machine' },
  { name: 'Hammer Curl', category: 'strength', muscleGroups: ['biceps', 'forearms'], equipment: 'dumbbell' },
  // Cardio
  { name: 'Running', category: 'cardio', muscleGroups: ['legs', 'core'], equipment: 'bodyweight' },
  { name: 'Cycling', category: 'cardio', muscleGroups: ['legs'], equipment: 'machine' },
  { name: 'Rowing Machine', category: 'cardio', muscleGroups: ['back', 'legs', 'core'], equipment: 'machine' },
  { name: 'Jump Rope', category: 'cardio', muscleGroups: ['legs', 'shoulders'], equipment: 'bodyweight' },
  { name: 'Swimming', category: 'cardio', muscleGroups: ['full body'], equipment: 'bodyweight' },
  // Flexibility
  { name: 'Yoga Flow', category: 'flexibility', muscleGroups: ['full body'], equipment: 'bodyweight' },
  { name: 'Hip Flexor Stretch', category: 'flexibility', muscleGroups: ['hip flexors'], equipment: 'bodyweight' },
  { name: 'Hamstring Stretch', category: 'flexibility', muscleGroups: ['hamstrings'], equipment: 'bodyweight' },
];

async function main() {
  console.log('Seeding exercises...');
  for (const ex of exercises) {
    await prisma.exercise.upsert({
      where: { name: ex.name },
      update: {},
      create: ex,
    });
  }
  console.log(`Seeded ${exercises.length} exercises.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
