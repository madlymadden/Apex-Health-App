import type { Express } from "express";
import { createServer, type Server } from "node:http";
import express from "express";
import { storage } from "./storage";

const AI_DISABLED = true;

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(express.json({ limit: "10mb" }));

  // ===== AI SCAN (DISABLED) =====
  app.post("/api/scan/analyze", async (req, res) => {
    // Keep validation so the app flow stays realistic
    const { image, context } = req.body ?? {};
    if (!image) {
      return res.status(400).json({ error: "Image data is required" });
    }

    // Stubbed response (no OpenAI key required)
    return res.status(200).json({
      detected_type: "unknown",
      confidence: 0.0,
      title: "AI scanning disabled for local demo",
      extracted_data: [],
      summary:
        "AI features are disabled in this build (no API keys). You can still use manual entry and all non-AI features.",
      suggestions: [
        "Use manual entry for this item.",
        "Enable AI later by wiring a provider in server/routes.ts.",
      ],
      context: context ?? "general",
      aiDisabled: AI_DISABLED,
    });
  });

  // Workouts
  app.get("/api/workouts", async (req, res) => {
    try {
      const workouts = await storage.getWorkouts();
      res.json(workouts);
    } catch (error: any) {
      console.error("Get workouts error:", error?.message || error);
      res.status(500).json({ error: "Failed to fetch workouts" });
    }
  });

  app.post("/api/workouts", async (req, res) => {
    try {
      const workout = await storage.createWorkout(req.body);
      res.json(workout);
    } catch (error: any) {
      console.error("Create workout error:", error?.message || error);
      res.status(500).json({ error: "Failed to create workout" });
    }
  });

  app.delete("/api/workouts/:id", async (req, res) => {
    try {
      await storage.deleteWorkout(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete workout error:", error?.message || error);
      res.status(500).json({ error: "Failed to delete workout" });
    }
  });

  // Body Measurements
  app.get("/api/body-measurements", async (req, res) => {
    try {
      const measurements = await storage.getBodyMeasurements();
      res.json(measurements);
    } catch (error: any) {
      console.error("Get body measurements error:", error?.message || error);
      res.status(500).json({ error: "Failed to fetch body measurements" });
    }
  });

  app.post("/api/body-measurements", async (req, res) => {
    try {
      const measurement = await storage.createBodyMeasurement(req.body);
      res.json(measurement);
    } catch (error: any) {
      console.error("Create body measurement error:", error?.message || error);
      res.status(500).json({ error: "Failed to create body measurement" });
    }
  });

  // Goals
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await storage.getGoals();
      res.json(
        goals || { steps: 10000, calories: 650, activeMinutes: 45, weeklyWorkouts: 5 }
      );
    } catch (error: any) {
      console.error("Get goals error:", error?.message || error);
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.put("/api/goals", async (req, res) => {
    try {
      const goals = await storage.upsertGoals(req.body);
      res.json(goals);
    } catch (error: any) {
      console.error("Update goals error:", error?.message || error);
      res.status(500).json({ error: "Failed to update goals" });
    }
  });

  // Hydration
  app.get("/api/hydration", async (req, res) => {
    try {
      const date = (req.query.date as string) || new Date().toDateString();
      const hydration = await storage.getHydration(undefined, date);
      res.json(hydration || { glasses: 0, goal: 8, date });
    } catch (error: any) {
      console.error("Get hydration error:", error?.message || error);
      res.status(500).json({ error: "Failed to fetch hydration" });
    }
  });

  app.post("/api/hydration", async (req, res) => {
    try {
      const { date, glasses } = req.body;
      const hydration = await storage.logHydration(
        undefined,
        date || new Date().toDateString(),
        glasses || 1
      );
      res.json(hydration);
    } catch (error: any) {
      console.error("Log hydration error:", error?.message || error);
      res.status(500).json({ error: "Failed to log hydration" });
    }
  });

  // Sleep
  app.get("/api/sleep", async (req, res) => {
    try {
      const entries = await storage.getSleepEntries();
      res.json(entries);
    } catch (error: any) {
      console.error("Get sleep entries error:", error?.message || error);
      res.status(500).json({ error: "Failed to fetch sleep entries" });
    }
  });

  app.post("/api/sleep", async (req, res) => {
    try {
      const entry = await storage.createSleepEntry(req.body);
      res.json(entry);
    } catch (error: any) {
      console.error("Create sleep entry error:", error?.message || error);
      res.status(500).json({ error: "Failed to create sleep entry" });
    }
  });

  // Nutrition
  app.get("/api/nutrition", async (req, res) => {
    try {
      const entries = await storage.getNutritionEntries();
      res.json(entries);
    } catch (error: any) {
      console.error("Get nutrition entries error:", error?.message || error);
      res.status(500).json({ error: "Failed to fetch nutrition entries" });
    }
  });

  app.post("/api/nutrition", async (req, res) => {
    try {
      const entry = await storage.createNutritionEntry(req.body);
      res.json(entry);
    } catch (error: any) {
      console.error("Create nutrition entry error:", error?.message || error);
      res.status(500).json({ error: "Failed to create nutrition entry" });
    }
  });

  // AI Insights (DISABLED)
  app.get("/api/insights", async (req, res) => {
    try {
      const insights = await storage.getInsights();
      res.json(insights);
    } catch (error: any) {
      console.error("Get insights error:", error?.message || error);
      res.status(500).json({ error: "Failed to fetch insights" });
    }
  });

  app.post("/api/insights/generate", async (req, res) => {
    try {
      // You can optionally generate a deterministic "fake" insight for demo polish:
      const fake = {
        insights: [
          {
            type: "trend",
            title: "AI insights disabled",
            content:
              "This demo build has AI turned off (no API keys). All tracking features still work; insights will appear here once AI is enabled.",
            priority: "normal",
            category: "lifestyle",
          },
        ],
        weeklyScore: 0,
        topRecommendation: "Use manual tracking for now.",
        aiDisabled: AI_DISABLED,
      };

      // Store the fake insight so the UI still shows something
      for (const insight of fake.insights) {
        await storage.createInsight({
          type: insight.type as any,
          title: insight.title,
          content: insight.content,
          category: insight.category as any,
          priority: insight.priority as any,
          data: { weeklyScore: fake.weeklyScore, aiDisabled: AI_DISABLED },
        });
      }

      res.json(fake);
    } catch (error: any) {
      console.error("AI insights error:", error?.message || error);
      res.status(500).json({ error: "Failed to generate insights" });
    }
  });

  app.put("/api/insights/:id/read", async (req, res) => {
    try {
      await storage.markInsightRead(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Mark insight read error:", error?.message || error);
      res.status(500).json({ error: "Failed to mark insight as read" });
    }
  });

  // Notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const notifications = await storage.getNotifications();
      res.json(notifications);
    } catch (error: any) {
      console.error("Get notifications error:", error?.message || error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const notification = await storage.createNotification(req.body);
      res.json(notification);
    } catch (error: any) {
      console.error("Create notification error:", error?.message || error);
      res.status(500).json({ error: "Failed to create notification" });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Mark notification read error:", error?.message || error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // User Preferences
  app.get("/api/preferences", async (req, res) => {
    try {
      const prefs = await storage.getPreferences();
      res.json(
        prefs || {
          theme: "dark",
          units: "imperial",
          notificationsEnabled: true,
          hapticFeedback: true,
          weekStartDay: "monday",
          restDayReminders: true,
          workoutReminders: true,
          socialSharing: false,
          dataSharing: false,
        }
      );
    } catch (error: any) {
      console.error("Get preferences error:", error?.message || error);
      res.status(500).json({ error: "Failed to fetch preferences" });
    }
  });

  app.put("/api/preferences", async (req, res) => {
    try {
      const prefs = await storage.upsertPreferences(undefined, req.body);
      res.json(prefs);
    } catch (error: any) {
      console.error("Update preferences error:", error?.message || error);
      res.status(500).json({ error: "Failed to update preferences" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}