import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown, FadeInUp, SlideInRight } from "react-native-reanimated";
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G, Line } from "react-native-svg";
import Colors from "@/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BODY_WIDTH = Math.min(SCREEN_WIDTH - 80, 260);
const BODY_HEIGHT = BODY_WIDTH * 2.2;

interface MuscleZone {
  id: string;
  name: string;
  shortName: string;
  view: "front" | "back";
  fatigue: number;
  recovery: number;
  lastWorked: string;
  lastWorkout: string;
  recommendedRest: string;
  setsThisWeek: number;
  exercises: string[];
  path: string;
  labelX: number;
  labelY: number;
}

const FRONT_MUSCLES: MuscleZone[] = [
  {
    id: "shoulders_f", name: "DELTOIDS", shortName: "DELTS", view: "front",
    fatigue: 20, recovery: 92, lastWorked: "3 days ago", lastWorkout: "Upper Push",
    recommendedRest: "Recovered", setsThisWeek: 12, exercises: ["OHP", "Lateral Raises", "Front Raises"],
    path: "M60,84 C54,86 48,90 42,96 C36,102 32,110 30,118 C28,124 30,128 34,130 C38,130 42,126 46,120 C50,114 54,106 58,98 C60,94 62,90 62,86 C62,84 60,84 60,84 Z M170,84 C176,86 182,90 188,96 C194,102 198,110 200,118 C202,124 200,128 196,130 C192,130 188,126 184,120 C180,114 176,106 172,98 C170,94 168,90 168,86 C168,84 170,84 170,84 Z",
    labelX: 0.08, labelY: 0.16,
  },
  {
    id: "chest", name: "PECTORALS", shortName: "CHEST", view: "front",
    fatigue: 45, recovery: 72, lastWorked: "2 days ago", lastWorkout: "Bench Press Day",
    recommendedRest: "24h more", setsThisWeek: 16, exercises: ["Bench Press", "Incline DB Press", "Cable Flyes"],
    path: "M99,88 C93,90 85,94 78,100 C71,106 66,114 62,124 C58,134 56,142 58,150 C60,156 66,160 74,162 C84,164 96,162 106,158 C112,154 115,148 115,140 C115,130 115,118 115,106 C115,98 110,92 103,88 L99,88 Z M131,88 C137,90 145,94 152,100 C159,106 164,114 168,124 C172,134 174,142 172,150 C170,156 164,160 156,162 C146,164 134,162 124,158 C118,154 115,148 115,140 C115,130 115,118 115,106 C115,98 120,92 127,88 L131,88 Z",
    labelX: 0.5, labelY: 0.22,
  },
  {
    id: "biceps", name: "BICEPS", shortName: "BI", view: "front",
    fatigue: 75, recovery: 38, lastWorked: "1 day ago", lastWorkout: "Pull Day",
    recommendedRest: "36h more", setsThisWeek: 14, exercises: ["Barbell Curls", "Hammer Curls", "Incline Curls"],
    path: "M42,132 C38,138 34,148 30,160 C27,170 25,180 24,188 C23,194 25,198 30,200 C34,200 38,196 40,190 C44,180 46,168 48,154 C48,144 48,138 46,134 C44,132 43,132 42,132 Z M188,132 C192,138 196,148 200,160 C203,170 205,180 206,188 C207,194 205,198 200,200 C196,200 192,196 190,190 C186,180 184,168 182,154 C182,144 182,138 184,134 C186,132 187,132 188,132 Z",
    labelX: 0.04, labelY: 0.28,
  },
  {
    id: "forearms_f", name: "FOREARMS", shortName: "FORE", view: "front",
    fatigue: 30, recovery: 80, lastWorked: "3 days ago", lastWorkout: "Pull Day",
    recommendedRest: "Recovered", setsThisWeek: 8, exercises: ["Wrist Curls", "Farmer Walks", "Dead Hangs"],
    path: "M30,202 C26,210 22,224 18,240 C15,254 14,264 17,272 C20,278 26,276 29,268 C32,258 34,244 35,228 C36,216 34,208 32,204 L30,202 Z M200,202 C204,210 208,224 212,240 C215,254 216,264 213,272 C210,278 204,276 201,268 C198,258 196,244 195,228 C194,216 196,208 198,204 L200,202 Z",
    labelX: 0.02, labelY: 0.40,
  },
  {
    id: "abs", name: "ABDOMINALS", shortName: "ABS", view: "front",
    fatigue: 15, recovery: 95, lastWorked: "4 days ago", lastWorkout: "Core Circuit",
    recommendedRest: "Recovered", setsThisWeek: 18, exercises: ["Cable Crunches", "Hanging Leg Raises", "Ab Wheel"],
    path: "M101,160 C99,166 97,176 97,190 C97,208 97,226 97,244 C97,258 99,268 103,276 C107,282 112,284 115,284 C118,284 123,282 127,276 C131,268 133,258 133,244 C133,226 133,208 133,190 C133,176 131,166 129,160 C126,156 121,154 115,154 C109,154 104,156 101,160 Z",
    labelX: 0.5, labelY: 0.38,
  },
  {
    id: "obliques", name: "OBLIQUES", shortName: "OBL", view: "front",
    fatigue: 18, recovery: 90, lastWorked: "4 days ago", lastWorkout: "Core Circuit",
    recommendedRest: "Recovered", setsThisWeek: 10, exercises: ["Cable Woodchops", "Russian Twists", "Side Bends"],
    path: "M68,156 C65,164 63,178 63,196 C63,216 64,236 66,252 C68,262 72,270 78,274 C84,276 90,272 94,266 C97,260 97,250 97,238 C97,220 97,202 97,184 C97,170 97,162 97,158 C94,156 88,154 82,154 C76,154 72,154 68,156 Z M162,156 C165,164 167,178 167,196 C167,216 166,236 164,252 C162,262 158,270 152,274 C146,276 140,272 136,266 C133,260 133,250 133,238 C133,220 133,202 133,184 C133,170 133,162 133,158 C136,156 142,154 148,154 C154,154 158,154 162,156 Z",
    labelX: 0.12, labelY: 0.37,
  },
  {
    id: "quads", name: "QUADRICEPS", shortName: "QUADS", view: "front",
    fatigue: 85, recovery: 22, lastWorked: "1 day ago", lastWorkout: "Leg Day",
    recommendedRest: "48h more", setsThisWeek: 20, exercises: ["Barbell Squats", "Leg Press", "Bulgarian Split Squats"],
    path: "M72,292 C66,300 60,314 56,332 C52,350 50,366 50,382 C50,392 53,400 58,406 C64,412 72,414 78,410 C84,404 88,396 90,384 C92,370 92,354 90,338 C88,322 84,308 80,298 C78,292 74,290 72,292 Z M158,292 C164,300 170,314 174,332 C178,350 180,366 180,382 C180,392 177,400 172,406 C166,412 158,414 152,410 C146,404 142,396 140,384 C138,370 138,354 140,338 C142,322 146,308 150,298 C152,292 156,290 158,292 Z",
    labelX: 0.15, labelY: 0.60,
  },
  {
    id: "adductors", name: "ADDUCTORS", shortName: "ADD", view: "front",
    fatigue: 22, recovery: 86, lastWorked: "3 days ago", lastWorkout: "Leg Day",
    recommendedRest: "Recovered", setsThisWeek: 6, exercises: ["Sumo Squats", "Copenhagen Planks", "Cable Adductions"],
    path: "M92,294 C94,302 96,316 98,334 C100,352 100,368 98,380 C96,388 92,390 88,386 C84,380 83,368 83,354 C83,338 84,320 86,306 C88,298 90,294 92,294 Z M138,294 C136,302 134,316 132,334 C130,352 130,368 132,380 C134,388 138,390 142,386 C146,380 147,368 147,354 C147,338 146,320 144,306 C142,298 140,294 138,294 Z",
    labelX: 0.5, labelY: 0.57,
  },
  {
    id: "shins", name: "TIBIALIS", shortName: "SHINS", view: "front",
    fatigue: 8, recovery: 98, lastWorked: "6 days ago", lastWorkout: "Leg Day",
    recommendedRest: "Recovered", setsThisWeek: 4, exercises: ["Tibialis Raises", "Walking", "Sled Pulls"],
    path: "M62,418 C58,426 55,442 53,460 C51,478 52,494 56,506 C60,514 66,514 70,506 C74,496 76,480 76,462 C76,446 74,432 70,422 C68,418 64,416 62,418 Z M168,418 C172,426 175,442 177,460 C179,478 178,494 174,506 C170,514 164,514 160,506 C156,496 154,480 154,462 C154,446 156,432 160,422 C162,418 166,416 168,418 Z",
    labelX: 0.15, labelY: 0.82,
  },
];

const BACK_MUSCLES: MuscleZone[] = [
  {
    id: "traps", name: "TRAPEZIUS", shortName: "TRAPS", view: "back",
    fatigue: 35, recovery: 78, lastWorked: "3 days ago", lastWorkout: "Pull Day",
    recommendedRest: "12h more", setsThisWeek: 10, exercises: ["Barbell Shrugs", "Face Pulls", "Upright Rows"],
    path: "M115,72 C107,74 98,78 88,86 C78,94 70,106 66,118 C62,130 66,140 74,146 C84,152 98,156 110,158 C113,158 115,158 115,158 C115,158 117,158 120,158 C132,156 146,152 156,146 C164,140 168,130 164,118 C160,106 152,94 142,86 C132,78 123,74 115,72 Z",
    labelX: 0.5, labelY: 0.16,
  },
  {
    id: "rear_delts", name: "REAR DELTOIDS", shortName: "R.DELTS", view: "back",
    fatigue: 25, recovery: 88, lastWorked: "3 days ago", lastWorkout: "Pull Day",
    recommendedRest: "Recovered", setsThisWeek: 8, exercises: ["Face Pulls", "Reverse Flyes", "Band Pull-Aparts"],
    path: "M54,88 C48,92 42,98 38,106 C34,114 32,122 34,128 C36,132 40,132 44,128 C48,122 52,114 56,106 C58,100 58,94 56,90 L54,88 Z M176,88 C182,92 188,98 192,106 C196,114 198,122 196,128 C194,132 190,132 186,128 C182,122 178,114 174,106 C172,100 172,94 174,90 L176,88 Z",
    labelX: 0.08, labelY: 0.18,
  },
  {
    id: "lats", name: "LATISSIMUS DORSI", shortName: "LATS", view: "back",
    fatigue: 55, recovery: 58, lastWorked: "2 days ago", lastWorkout: "Pull Day",
    recommendedRest: "24h more", setsThisWeek: 16, exercises: ["Pull-Ups", "Barbell Rows", "Lat Pulldown"],
    path: "M66,136 C60,144 55,160 51,180 C47,200 47,220 51,238 C55,250 63,258 75,262 C85,264 95,258 101,248 C105,240 107,228 105,214 C103,198 99,180 93,164 C89,152 81,142 72,136 L66,136 Z M164,136 C170,144 175,160 179,180 C183,200 183,220 179,238 C175,250 167,258 155,262 C145,264 135,258 129,248 C125,240 123,228 125,214 C127,198 131,180 137,164 C141,152 149,142 158,136 L164,136 Z",
    labelX: 0.18, labelY: 0.32,
  },
  {
    id: "triceps", name: "TRICEPS", shortName: "TRI", view: "back",
    fatigue: 60, recovery: 52, lastWorked: "2 days ago", lastWorkout: "Push Day",
    recommendedRest: "24h more", setsThisWeek: 12, exercises: ["Tricep Dips", "Skull Crushers", "Cable Pushdowns"],
    path: "M40,132 C34,140 29,154 26,170 C22,184 24,196 28,202 C32,206 38,202 42,194 C46,184 48,170 48,156 C48,144 46,136 42,132 L40,132 Z M190,132 C196,140 201,154 204,170 C208,184 206,196 202,202 C198,206 192,202 188,194 C184,184 182,170 182,156 C182,144 184,136 188,132 L190,132 Z",
    labelX: 0.04, labelY: 0.28,
  },
  {
    id: "lower_back", name: "ERECTORS", shortName: "L.BACK", view: "back",
    fatigue: 40, recovery: 70, lastWorked: "2 days ago", lastWorkout: "Deadlift Day",
    recommendedRest: "12h more", setsThisWeek: 8, exercises: ["Deadlifts", "Back Extensions", "Good Mornings"],
    path: "M107,206 C105,214 103,230 103,248 C103,262 105,272 109,278 C113,282 115,280 115,274 C115,260 115,244 115,228 C115,216 113,208 109,206 L107,206 Z M123,206 C125,214 127,230 127,248 C127,262 125,272 121,278 C117,282 115,280 115,274 C115,260 115,244 115,228 C115,216 117,208 121,206 L123,206 Z",
    labelX: 0.5, labelY: 0.42,
  },
  {
    id: "glutes", name: "GLUTEUS MAXIMUS", shortName: "GLUTES", view: "back",
    fatigue: 70, recovery: 40, lastWorked: "1 day ago", lastWorkout: "Leg Day",
    recommendedRest: "36h more", setsThisWeek: 14, exercises: ["Hip Thrusts", "Romanian DL", "Cable Kickbacks"],
    path: "M77,280 C69,286 61,298 57,314 C53,330 57,344 65,350 C75,356 87,356 99,350 C109,344 115,334 115,324 C115,316 114,306 110,296 C106,288 98,282 90,280 C84,278 80,278 77,280 Z M153,280 C161,286 169,298 173,314 C177,330 173,344 165,350 C155,356 143,356 131,350 C121,344 115,334 115,324 C115,316 116,306 120,296 C124,288 132,282 140,280 C146,278 150,278 153,280 Z",
    labelX: 0.5, labelY: 0.54,
  },
  {
    id: "hamstrings", name: "HAMSTRINGS", shortName: "HAMS", view: "back",
    fatigue: 80, recovery: 28, lastWorked: "1 day ago", lastWorkout: "Leg Day",
    recommendedRest: "48h more", setsThisWeek: 16, exercises: ["Romanian Deadlifts", "Leg Curls", "Nordic Curls"],
    path: "M68,356 C62,364 56,380 52,400 C48,418 52,432 58,438 C64,442 72,440 78,432 C84,422 88,408 90,392 C92,376 90,362 84,356 C80,350 72,352 68,356 Z M162,356 C168,364 174,380 178,400 C182,418 178,432 172,438 C166,442 158,440 152,432 C146,422 142,408 140,392 C138,376 140,362 146,356 C150,350 158,352 162,356 Z",
    labelX: 0.15, labelY: 0.68,
  },
  {
    id: "calves", name: "GASTROCNEMIUS", shortName: "CALVES", view: "back",
    fatigue: 10, recovery: 98, lastWorked: "5 days ago", lastWorkout: "Leg Day",
    recommendedRest: "Recovered", setsThisWeek: 6, exercises: ["Standing Calf Raises", "Seated Calf Raises", "Jump Rope"],
    path: "M58,442 C52,450 48,468 46,488 C44,504 48,514 56,518 C62,522 68,518 72,508 C76,496 78,480 76,462 C74,450 66,442 60,442 L58,442 Z M172,442 C178,450 182,468 184,488 C186,504 182,514 174,518 C168,522 162,518 158,508 C154,496 152,480 154,462 C156,450 164,442 170,442 L172,442 Z",
    labelX: 0.15, labelY: 0.84,
  },
];

const BODY_OUTLINE_FRONT = "M115,2 C127,0 138,4 144,14 C149,22 151,32 149,42 C147,50 142,54 136,57 C133,59 131,63 131,68 C132,72 136,76 142,78 C150,80 160,84 170,88 C180,92 188,97 194,104 C200,110 204,118 206,126 C208,134 206,144 206,154 C206,166 208,178 210,190 C212,200 214,216 216,234 C218,250 220,264 220,272 C222,280 220,288 216,292 C212,296 208,292 206,284 C204,276 204,268 202,260 C200,248 198,234 196,220 C194,208 192,198 192,194 C190,186 188,178 186,168 C184,156 184,146 182,138 C180,132 176,130 172,132 C170,138 168,152 166,168 C164,184 162,202 160,222 C158,242 158,258 158,270 C160,280 164,288 168,296 C172,310 176,330 178,348 C180,366 180,384 178,398 C176,406 174,412 172,416 C174,430 176,448 176,466 C176,482 174,498 172,510 C170,522 170,532 168,540 C164,546 158,548 152,548 C148,546 150,538 152,530 C154,522 156,514 156,510 C158,500 158,488 158,474 C156,458 154,442 154,430 C156,418 158,410 160,404 C162,398 160,394 156,388 C152,374 148,358 144,340 C140,324 138,308 136,296 C134,290 130,286 126,284 L115,282 L104,284 C100,286 96,290 94,296 C92,308 90,324 86,340 C82,358 78,374 74,388 C70,394 68,398 70,404 C72,410 74,418 76,430 C76,442 74,458 72,474 C72,488 72,500 74,510 C74,514 76,522 78,530 C80,538 82,546 78,548 C72,548 66,546 62,540 C60,532 60,522 58,510 C56,498 54,482 54,466 C54,448 56,430 58,416 C56,412 54,406 52,398 C50,384 50,366 52,348 C54,330 58,310 62,296 C66,288 70,280 72,270 C72,258 72,242 70,222 C68,202 66,184 64,168 C62,152 60,138 58,132 C54,130 50,132 48,138 C46,146 46,156 44,168 C42,178 40,186 38,194 C38,198 36,208 34,220 C32,234 30,248 28,260 C26,268 26,276 24,284 C22,292 18,296 14,292 C10,288 8,280 10,272 C12,264 14,250 16,234 C18,216 20,200 20,190 C22,178 24,166 24,154 C24,144 22,134 24,126 C26,118 30,110 36,104 C42,97 50,92 60,88 C70,84 80,80 88,78 C94,76 98,72 99,68 C99,63 97,59 94,57 C88,54 83,50 81,42 C79,32 81,22 86,14 C92,4 103,0 115,2 Z";

const BODY_OUTLINE_BACK = "M115,2 C127,0 138,4 144,14 C149,22 151,32 149,42 C147,50 142,54 136,57 C133,59 131,63 131,68 C132,72 136,76 142,78 C150,80 160,84 170,88 C180,92 188,97 194,104 C200,110 204,118 206,126 C208,134 206,144 206,154 C206,166 208,178 210,190 C212,200 214,216 216,234 C218,250 220,264 220,272 C222,280 220,288 216,292 C212,296 208,292 206,284 C204,276 204,268 202,260 C200,248 198,234 196,220 C194,208 192,198 192,194 C190,186 188,178 186,168 C184,156 184,146 182,138 C180,132 176,130 172,132 C170,138 168,152 166,168 C164,184 162,202 160,222 C158,242 158,258 158,270 C160,280 164,288 168,296 C172,310 176,330 178,348 C180,366 180,384 178,398 C176,406 174,412 172,416 C174,430 176,448 176,466 C176,482 174,498 172,510 C170,522 170,532 168,540 C164,546 158,548 152,548 C148,546 150,538 152,530 C154,522 156,514 156,510 C158,500 158,488 158,474 C156,458 154,442 154,430 C156,418 158,410 160,404 C162,398 160,394 156,388 C152,374 148,358 144,340 C140,324 138,308 136,296 C134,290 130,286 126,284 L115,282 L104,284 C100,286 96,290 94,296 C92,308 90,324 86,340 C82,358 78,374 74,388 C70,394 68,398 70,404 C72,410 74,418 76,430 C76,442 74,458 72,474 C72,488 72,500 74,510 C74,514 76,522 78,530 C80,538 82,546 78,548 C72,548 66,546 62,540 C60,532 60,522 58,510 C56,498 54,482 54,466 C54,448 56,430 58,416 C56,412 54,406 52,398 C50,384 50,366 52,348 C54,330 58,310 62,296 C66,288 70,280 72,270 C72,258 72,242 70,222 C68,202 66,184 64,168 C62,152 60,138 58,132 C54,130 50,132 48,138 C46,146 46,156 44,168 C42,178 40,186 38,194 C38,198 36,208 34,220 C32,234 30,248 28,260 C26,268 26,276 24,284 C22,292 18,296 14,292 C10,288 8,280 10,272 C12,264 14,250 16,234 C18,216 20,200 20,190 C22,178 24,166 24,154 C24,144 22,134 24,126 C26,118 30,110 36,104 C42,97 50,92 60,88 C70,84 80,80 88,78 C94,76 98,72 99,68 C99,63 97,59 94,57 C88,54 83,50 81,42 C79,32 81,22 86,14 C92,4 103,0 115,2 Z";

const FRONT_DETAIL_LINES: string[] = [
  "M92,83 C84,84 76,86 68,88",
  "M138,83 C146,84 154,86 162,88",
  "M115,88 L115,98",
  "M115,102 L115,280",
  "M101,178 C106,176 110,175 115,175 C120,175 124,176 129,178",
  "M101,200 C106,198 110,197 115,197 C120,197 124,198 129,200",
  "M101,224 C106,222 110,221 115,221 C120,221 124,222 129,224",
  "M101,250 C106,248 110,247 115,247 C120,247 124,248 129,250",
  "M97,160 C96,186 96,214 96,240 C96,260 97,272 98,280",
  "M133,160 C134,186 134,214 134,240 C134,260 133,272 132,280",
  "M62,154 C70,158 80,162 96,162",
  "M168,154 C160,158 150,162 134,162",
  "M110,98 C96,112 80,124 68,130",
  "M108,106 C94,118 78,132 66,140",
  "M120,98 C134,112 150,124 162,130",
  "M122,106 C136,118 152,132 164,140",
  "M56,86 C50,98 44,112 40,122",
  "M174,86 C180,98 186,112 190,122",
  "M64,150 C66,156 62,160",
  "M62,158 C66,164 60,168",
  "M60,166 C64,172 58,176",
  "M166,150 C164,156 168,160",
  "M168,158 C164,164 170,168",
  "M170,166 C166,172 172,176",
  "M70,400 C66,400 63,404 62,408 C61,414 64,418 70,418 C76,418 80,414 80,408 C80,404 78,400 74,400",
  "M160,400 C164,400 167,404 168,408 C169,414 166,418 160,418 C154,418 150,414 150,408 C150,404 152,400 156,400",
  "M74,300 C70,330 66,362 62,392",
  "M84,298 C82,326 78,358 76,386",
  "M156,300 C160,330 164,362 168,392",
  "M146,298 C148,326 152,358 154,386",
  "M86,382 C84,392 80,402 76,410",
  "M144,382 C146,392 150,402 154,410",
  "M42,136 C38,156 34,176 32,192",
  "M188,136 C192,156 196,176 198,192",
  "M97,270 C88,278 78,288",
  "M133,270 C142,278 152,288",
  "M30,206 C26,226 22,248",
  "M200,206 C204,226 208,248",
];

const BACK_DETAIL_LINES: string[] = [
  "M115,74 L115,278",
  "M102,108 C100,124 100,140 102,152",
  "M90,106 C80,118 74,134",
  "M100,120 C92,118 82,116",
  "M128,108 C130,124 130,140 128,152",
  "M140,106 C150,118 156,134",
  "M130,120 C138,118 148,116",
  "M74,150 C78,180 76,212",
  "M80,146 C84,174 82,206",
  "M156,150 C152,180 154,212",
  "M150,146 C146,174 148,206",
  "M108,270 L115,284 L122,270",
  "M82,284 C74,300 68,320",
  "M148,284 C156,300 162,320",
  "M70,344 C82,350 98,346",
  "M160,344 C148,350 132,346",
  "M74,360 C70,382 66,408",
  "M80,356 C78,378 76,404",
  "M156,360 C160,382 164,408",
  "M150,356 C152,378 154,404",
  "M62,446 C60,470 58,496",
  "M168,446 C170,470 172,496",
  "M38,138 C34,160 30,186",
  "M192,138 C196,160 200,186",
  "M115,210 L115,276",
  "M94,120 C84,132 76,144",
  "M136,120 C146,132 154,144",
];

function getHeatColor(fatigue: number): string {
  if (fatigue >= 75) return "#FF3B30";
  if (fatigue >= 55) return "#FF6B35";
  if (fatigue >= 35) return "#FFB800";
  if (fatigue >= 15) return "#8AC926";
  return "#34C759";
}

function getHeatGlow(fatigue: number): string {
  if (fatigue >= 75) return "rgba(255,59,48,0.35)";
  if (fatigue >= 55) return "rgba(255,107,53,0.30)";
  if (fatigue >= 35) return "rgba(255,184,0,0.25)";
  if (fatigue >= 15) return "rgba(138,201,38,0.20)";
  return "rgba(52,199,89,0.20)";
}

function getStatusLabel(recovery: number): string {
  if (recovery >= 85) return "RECOVERED";
  if (recovery >= 60) return "MODERATE";
  if (recovery >= 35) return "TAXED";
  return "FATIGUED";
}

function getStatusColor(recovery: number): string {
  if (recovery >= 85) return "#34C759";
  if (recovery >= 60) return "#FFB800";
  if (recovery >= 35) return "#FF6B35";
  return "#FF3B30";
}

function RecoveryRing({ size, progress, color }: { size: number; progress: number; color: string }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <Svg width={size} height={size}>
      <Circle cx={cx} cy={cy} r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} fill="none" />
      <Circle
        cx={cx} cy={cy} r={radius}
        stroke={color} strokeWidth={strokeWidth} fill="none"
        strokeDasharray={`${circumference}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </Svg>
  );
}

function MuscleDetailPanel({ muscle, onClose }: { muscle: MuscleZone; onClose: () => void }) {
  const statusColor = getStatusColor(muscle.recovery);
  const statusLabel = getStatusLabel(muscle.recovery);

  return (
    <Animated.View entering={FadeInDown.duration(350).springify()} style={s.detailPanel}>
      <View style={s.detailPanelHeader}>
        <View style={s.detailPanelTitle}>
          <Text style={s.detailMuscleName}>{muscle.name}</Text>
          <View style={[s.statusPill, { borderColor: statusColor }]}>
            <View style={[s.statusPillDot, { backgroundColor: statusColor }]} />
            <Text style={[s.statusPillText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
        <Pressable onPress={onClose} hitSlop={16}>
          <Ionicons name="close" size={20} color={Colors.muted} />
        </Pressable>
      </View>

      <View style={s.detailDivider} />

      <View style={s.detailMetricsRow}>
        <View style={s.detailMetric}>
          <View style={s.ringWrapper}>
            <RecoveryRing size={56} progress={muscle.recovery} color={statusColor} />
            <Text style={s.ringValue}>{muscle.recovery}%</Text>
          </View>
          <Text style={s.detailMetricLabel}>RECOVERY</Text>
        </View>
        <View style={s.detailMetric}>
          <View style={s.ringWrapper}>
            <RecoveryRing size={56} progress={muscle.fatigue} color={getHeatColor(muscle.fatigue)} />
            <Text style={s.ringValue}>{muscle.fatigue}%</Text>
          </View>
          <Text style={s.detailMetricLabel}>FATIGUE</Text>
        </View>
        <View style={s.detailMetric}>
          <Text style={s.setsValue}>{muscle.setsThisWeek}</Text>
          <Text style={s.detailMetricLabel}>SETS / WK</Text>
        </View>
      </View>

      <View style={s.detailDivider} />

      <View style={s.detailInfoGrid}>
        <View style={s.detailInfoItem}>
          <Text style={s.detailInfoLabel}>LAST TRAINED</Text>
          <Text style={s.detailInfoValue}>{muscle.lastWorked}</Text>
        </View>
        <View style={s.detailInfoItem}>
          <Text style={s.detailInfoLabel}>SESSION</Text>
          <Text style={s.detailInfoValue}>{muscle.lastWorkout}</Text>
        </View>
        <View style={s.detailInfoItem}>
          <Text style={s.detailInfoLabel}>REST NEEDED</Text>
          <Text style={[s.detailInfoValue, { color: muscle.recommendedRest === "Recovered" ? "#34C759" : Colors.white }]}>
            {muscle.recommendedRest}
          </Text>
        </View>
      </View>

      <View style={s.detailDivider} />

      <Text style={s.exercisesTitle}>KEY EXERCISES</Text>
      <View style={s.exerciseChips}>
        {muscle.exercises.map((ex, i) => (
          <View key={i} style={s.exerciseChip}>
            <Text style={s.exerciseChipText}>{ex}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

export default function BodyHeatmapScreen() {
  const insets = useSafeAreaInsets();
  const [activeView, setActiveView] = useState<"front" | "back">("front");
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleZone | null>(null);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const muscles = activeView === "front" ? FRONT_MUSCLES : BACK_MUSCLES;
  const allMuscles = [...FRONT_MUSCLES, ...BACK_MUSCLES];
  const recoveredCount = allMuscles.filter((m) => m.recovery >= 70).length;
  const avgRecovery = Math.round(allMuscles.reduce((acc, m) => acc + m.recovery, 0) / allMuscles.length);

  const handleMusclePress = useCallback((muscle: MuscleZone) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedMuscle((prev) => (prev?.id === muscle.id ? null : muscle));
  }, []);

  const handleToggleView = useCallback((view: "front" | "back") => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveView(view);
    setSelectedMuscle(null);
  }, []);

  const bodyOutline = activeView === "front" ? BODY_OUTLINE_FRONT : BODY_OUTLINE_BACK;
  const detailLines = activeView === "front" ? FRONT_DETAIL_LINES : BACK_DETAIL_LINES;

  const scaleX = BODY_WIDTH / 260;
  const scaleY = BODY_HEIGHT / 572;

  return (
    <View style={[s.container, { paddingTop: topInset }]}>
      <ScrollView showsVerticalScrollIndicator={false} onScrollBeginDrag={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }} contentContainerStyle={{ paddingBottom: bottomInset + 60 }}>
        <Animated.View entering={FadeIn.duration(400)} style={s.navRow}>
          <Pressable onPress={() => router.back()} hitSlop={16} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color={Colors.white} />
          </Pressable>
          <View style={s.viewToggle}>
            <Pressable
              style={[s.toggleSeg, activeView === "front" && s.toggleSegActive]}
              onPress={() => handleToggleView("front")}
            >
              <Text style={[s.toggleSegText, activeView === "front" && s.toggleSegTextActive]}>ANTERIOR</Text>
            </Pressable>
            <Pressable
              style={[s.toggleSeg, activeView === "back" && s.toggleSegActive]}
              onPress={() => handleToggleView("back")}
            >
              <Text style={[s.toggleSegText, activeView === "back" && s.toggleSegTextActive]}>POSTERIOR</Text>
            </Pressable>
          </View>
          <View style={{ width: 22 }} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(100)} style={s.titleSection}>
          <Text style={s.pageTitle}>Muscle Map</Text>
          <Text style={s.pageSubtitle}>TAP A MUSCLE GROUP FOR DETAILS</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(200)} style={s.overviewBar}>
          <View style={s.overviewItem}>
            <Text style={s.overviewValue}>{avgRecovery}%</Text>
            <Text style={s.overviewLabel}>AVG RECOVERY</Text>
          </View>
          <View style={s.overviewDivider} />
          <View style={s.overviewItem}>
            <Text style={s.overviewValue}>{recoveredCount}/{allMuscles.length}</Text>
            <Text style={s.overviewLabel}>GROUPS READY</Text>
          </View>
          <View style={s.overviewDivider} />
          <View style={s.overviewItem}>
            <Text style={[s.overviewValue, { color: activeView === "front" ? Colors.teal : Colors.gold }]}>
              {activeView === "front" ? "FRONT" : "BACK"}
            </Text>
            <Text style={s.overviewLabel}>ACTIVE VIEW</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.duration(700).delay(300)} style={s.bodyContainer}>
          <Svg
            width={BODY_WIDTH}
            height={BODY_HEIGHT}
            viewBox="-30 0 290 572"
          >
            <Defs>
              <LinearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="rgba(255,255,255,0.035)" />
                <Stop offset="0.5" stopColor="rgba(255,255,255,0.02)" />
                <Stop offset="1" stopColor="rgba(255,255,255,0.008)" />
              </LinearGradient>
              {muscles.map((m) => (
                <LinearGradient key={`grad_${m.id}`} id={`heat_${m.id}`} x1="0" y1="0" x2="0.3" y2="1">
                  <Stop offset="0" stopColor={getHeatColor(m.fatigue)} stopOpacity={selectedMuscle?.id === m.id ? "0.92" : "0.65"} />
                  <Stop offset="0.6" stopColor={getHeatColor(m.fatigue)} stopOpacity={selectedMuscle?.id === m.id ? "0.78" : "0.48"} />
                  <Stop offset="1" stopColor={getHeatColor(m.fatigue)} stopOpacity={selectedMuscle?.id === m.id ? "0.65" : "0.32"} />
                </LinearGradient>
              ))}
            </Defs>

            <Path d={bodyOutline} fill="url(#bodyGrad)" />

            {muscles.map((m) => (
              <Path
                key={m.id}
                d={m.path}
                fill={`url(#heat_${m.id})`}
                stroke={selectedMuscle?.id === m.id ? Colors.white : "rgba(255,255,255,0.18)"}
                strokeWidth={selectedMuscle?.id === m.id ? 1.5 : 0.6}
                strokeLinejoin="round"
                onPress={() => handleMusclePress(m)}
              />
            ))}

            <G>
              {detailLines.map((line, i) => (
                <Path key={`detail_${i}`} d={line} stroke="rgba(255,255,255,0.10)" strokeWidth={0.5} fill="none" strokeLinecap="round" />
              ))}
            </G>

            <Path d={bodyOutline} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth={1.0} strokeLinejoin="round" />
          </Svg>

          <View style={s.muscleLabels}>
            {muscles.map((m) => (
              <Pressable
                key={m.id}
                style={[
                  s.muscleLabelBtn,
                  {
                    left: m.labelX < 0.3 ? 8 : m.labelX > 0.7 ? undefined : "50%",
                    right: m.labelX > 0.7 ? 8 : undefined,
                    top: m.labelY * BODY_HEIGHT,
                    transform: m.labelX >= 0.3 && m.labelX <= 0.7 ? [{ translateX: -30 }] : [],
                  },
                  selectedMuscle?.id === m.id && s.muscleLabelBtnActive,
                ]}
                onPress={() => handleMusclePress(m)}
              >
                <View style={[s.labelDot, { backgroundColor: getHeatColor(m.fatigue) }]} />
                <Text style={[s.muscleLabelText, selectedMuscle?.id === m.id && { color: Colors.white }]}>
                  {m.shortName}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(350)} style={s.legendSection}>
          {[
            { label: "RECOVERED", color: "#34C759" },
            { label: "FRESH", color: "#8AC926" },
            { label: "MODERATE", color: "#FFB800" },
            { label: "TAXED", color: "#FF6B35" },
            { label: "FATIGUED", color: "#FF3B30" },
          ].map((item) => (
            <View key={item.label} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: item.color }]} />
              <Text style={s.legendText}>{item.label}</Text>
            </View>
          ))}
        </Animated.View>

        {selectedMuscle && (
          <MuscleDetailPanel
            key={selectedMuscle.id}
            muscle={selectedMuscle}
            onClose={() => setSelectedMuscle(null)}
          />
        )}

        <Animated.View entering={FadeInDown.duration(500).delay(400)} style={s.volumeSection}>
          <Text style={s.sectionTitle}>WEEKLY VOLUME</Text>
          <Text style={s.sectionSubtitle}>Sets per muscle group over the last 7 days</Text>
          {allMuscles
            .sort((a, b) => b.setsThisWeek - a.setsThisWeek)
            .slice(0, 8)
            .map((m) => {
              const maxSets = 24;
              const pct = Math.min((m.setsThisWeek / maxSets) * 100, 100);
              return (
                <View key={m.id} style={s.volumeRow}>
                  <Text style={s.volumeName}>{m.shortName}</Text>
                  <View style={s.volumeBarTrack}>
                    <View style={[s.volumeBarFill, { width: `${pct}%`, backgroundColor: getHeatColor(m.fatigue) }]} />
                  </View>
                  <Text style={[s.volumeCount, { color: getHeatColor(m.fatigue) }]}>{m.setsThisWeek}</Text>
                </View>
              );
            })}
        </Animated.View>

        <View style={s.footerDivider} />

        <Animated.View entering={FadeInDown.duration(500).delay(500)} style={s.recoverySection}>
          <Text style={s.sectionTitle}>RECOVERY OVERVIEW</Text>
          <View style={s.recoveryGrid}>
            {allMuscles.map((m) => (
              <Pressable key={m.id} style={s.recoveryTile} onPress={() => {
                setActiveView(m.view);
                setSelectedMuscle(m);
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}>
                <View style={s.recoveryTileRing}>
                  <RecoveryRing size={36} progress={m.recovery} color={getStatusColor(m.recovery)} />
                  <Text style={s.recoveryTileValue}>{m.recovery}</Text>
                </View>
                <Text style={s.recoveryTileName}>{m.shortName}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.deepBlack,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backBtn: {
    width: 22,
  },
  viewToggle: {
    flexDirection: "row",
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  toggleSeg: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  toggleSegActive: {
    backgroundColor: Colors.white,
  },
  toggleSegText: {
    fontSize: 9,
    letterSpacing: 3,
    color: Colors.muted,
    fontFamily: "Outfit_400Regular",
  },
  toggleSegTextActive: {
    color: Colors.deepBlack,
  },
  titleSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 38,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 9,
    letterSpacing: 3,
    color: Colors.muted,
    fontFamily: "Outfit_300Light",
  },
  overviewBar: {
    flexDirection: "row",
    marginHorizontal: 24,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: Colors.border,
    paddingVertical: 18,
    marginBottom: 32,
  },
  overviewItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  overviewValue: {
    fontSize: 18,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: 1,
  },
  overviewLabel: {
    fontSize: 8,
    letterSpacing: 2,
    color: Colors.muted,
    fontFamily: "Outfit_300Light",
  },
  overviewDivider: {
    width: 0.5,
    backgroundColor: Colors.border,
  },
  bodyContainer: {
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  muscleLabels: {
    position: "absolute",
    top: 0,
    left: (SCREEN_WIDTH - BODY_WIDTH) / 2 - 40,
    right: (SCREEN_WIDTH - BODY_WIDTH) / 2 - 40,
    height: BODY_HEIGHT,
  },
  muscleLabelBtn: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  muscleLabelBtnActive: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  labelDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  muscleLabelText: {
    fontSize: 8,
    letterSpacing: 2,
    color: "rgba(255,255,255,0.45)",
    fontFamily: "Outfit_400Regular",
  },
  legendSection: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 16,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 8,
    letterSpacing: 2,
    color: Colors.muted,
    fontFamily: "Outfit_300Light",
  },
  detailPanel: {
    marginHorizontal: 24,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 24,
    marginBottom: 32,
  },
  detailPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  detailPanelTitle: {
    gap: 10,
    flex: 1,
  },
  detailMuscleName: {
    fontSize: 20,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: 2,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 0.5,
  },
  statusPillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusPillText: {
    fontSize: 8,
    letterSpacing: 2,
    fontFamily: "Outfit_400Regular",
  },
  detailDivider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 18,
  },
  detailMetricsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  detailMetric: {
    alignItems: "center",
    gap: 10,
  },
  ringWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  ringValue: {
    position: "absolute",
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: 0.5,
  },
  setsValue: {
    fontSize: 28,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    height: 56,
    lineHeight: 56,
    textAlign: "center",
  },
  detailMetricLabel: {
    fontSize: 8,
    letterSpacing: 2,
    color: Colors.muted,
    fontFamily: "Outfit_300Light",
  },
  detailInfoGrid: {
    gap: 14,
  },
  detailInfoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailInfoLabel: {
    fontSize: 9,
    letterSpacing: 2,
    color: Colors.muted,
    fontFamily: "Outfit_300Light",
  },
  detailInfoValue: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: 0.3,
  },
  exercisesTitle: {
    fontSize: 9,
    letterSpacing: 3,
    color: Colors.muted,
    fontFamily: "Outfit_400Regular",
    marginBottom: 12,
  },
  exerciseChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  exerciseChip: {
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  exerciseChipText: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.5,
  },
  volumeSection: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 3,
    color: Colors.muted,
    fontFamily: "Outfit_400Regular",
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: "rgba(255,255,255,0.3)",
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  volumeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  volumeName: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: Colors.muted,
    fontFamily: "Outfit_400Regular",
    width: 60,
  },
  volumeBarTrack: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  volumeBarFill: {
    height: 3,
  },
  volumeCount: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    width: 28,
    textAlign: "right",
    letterSpacing: 0.5,
  },
  footerDivider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginHorizontal: 24,
    marginBottom: 28,
  },
  recoverySection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  recoveryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
  recoveryTile: {
    width: (SCREEN_WIDTH - 48 - 36) / 4,
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.04)",
  },
  recoveryTileRing: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  recoveryTileValue: {
    position: "absolute",
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
  },
  recoveryTileName: {
    fontSize: 7,
    letterSpacing: 1.5,
    color: Colors.muted,
    fontFamily: "Outfit_400Regular",
    textAlign: "center",
  },
});
