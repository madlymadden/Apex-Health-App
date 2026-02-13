import type { Express } from "express";
import { createServer, type Server } from "node:http";
import express from "express";
import { z } from "zod";
import { 
  userService, 
  userGoalsService, 
  healthMetricsService, 
  workoutService, 
  bodyMeasurementsService,
  connectedAppsService,
  nutritionService,
  achievementsService,
  activityLogsService,
  checkDatabaseHealth 
} from "../lib/database";
import { insertUserSchema, insertUserGoalsSchema, insertHealthMetricsSchema, insertWorkoutSchema } from "../shared/schema";
import bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to parse JSON
  app.use(express.json());

  // Authentication middleware
  const authenticateToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    try {
      // Simple token verification - in production use proper JWT
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const user = await userService.getUserById(payload.userId);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(403).json({ error: 'Invalid token' });
    }
  };

  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await userService.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.passwordHash, 10);
      
      // Create user
      const newUser = await userService.createUser({
        ...userData,
        passwordHash,
      });

      // Create default goals for user
      await userGoalsService.createGoals({
        userId: newUser.id,
      });

      // Log activity
      await activityLogsService.logActivity({
        userId: newUser.id,
        action: 'register',
        metadata: JSON.stringify({ timestamp: new Date().toISOString() }),
      });

      // Remove password hash from response
      const { passwordHash: _, ...userWithoutPassword } = newUser;
      
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      // Find user
      const user = await userService.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate simple token (in production use proper JWT)
      const token = Buffer.from(JSON.stringify({ 
        userId: user.id, 
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      })).toString('base64');

      // Log activity
      await activityLogsService.logActivity({
        userId: user.id,
        action: 'login',
        metadata: JSON.stringify({ timestamp: new Date().toISOString() }),
      });

      // Remove password hash from response
      const { passwordHash: _, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // User routes
  app.get('/api/user/profile', authenticateToken, async (req: any, res) => {
    try {
      const { passwordHash, ...userWithoutPassword } = req.user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  });

  app.put('/api/user/profile', authenticateToken, async (req: any, res) => {
    try {
      const { name, avatar } = req.body;
      const updatedUser = await userService.updateUser(req.user.id, { name, avatar });
      
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { passwordHash, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Goals routes
  app.get('/api/goals', authenticateToken, async (req: any, res) => {
    try {
      const goals = await userGoalsService.getGoalsByUserId(req.user.id);
      res.json(goals);
    } catch (error) {
      console.error('Get goals error:', error);
      res.status(500).json({ error: 'Failed to get goals' });
    }
  });

  app.put('/api/goals', authenticateToken, async (req: any, res) => {
    try {
      const goalsData = insertUserGoalsSchema.parse(req.body);
      const updatedGoals = await userGoalsService.updateGoals(req.user.id, goalsData);
      res.json(updatedGoals);
    } catch (error) {
      console.error('Update goals error:', error);
      res.status(500).json({ error: 'Failed to update goals' });
    }
  });

  // Health metrics routes
  app.get('/api/metrics', authenticateToken, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 30;
      const metrics = await healthMetricsService.getMetricsByUserId(req.user.id, limit);
      res.json(metrics);
    } catch (error) {
      console.error('Get metrics error:', error);
      res.status(500).json({ error: 'Failed to get metrics' });
    }
  });

  app.post('/api/metrics', authenticateToken, async (req: any, res) => {
    try {
      const metricsData = insertHealthMetricsSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const newMetrics = await healthMetricsService.createMetrics(metricsData);
      res.status(201).json(newMetrics);
    } catch (error) {
      console.error('Create metrics error:', error);
      res.status(500).json({ error: 'Failed to create metrics' });
    }
  });

  app.get('/api/metrics/latest', authenticateToken, async (req: any, res) => {
    try {
      const latestMetrics = await healthMetricsService.getLatestMetrics(req.user.id);
      res.json(latestMetrics);
    } catch (error) {
      console.error('Get latest metrics error:', error);
      res.status(500).json({ error: 'Failed to get latest metrics' });
    }
  });

  // Workouts routes
  app.get('/api/workouts', authenticateToken, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const workouts = await workoutService.getWorkoutsByUserId(req.user.id, limit);
      res.json(workouts);
    } catch (error) {
      console.error('Get workouts error:', error);
      res.status(500).json({ error: 'Failed to get workouts' });
    }
  });

  app.post('/api/workouts', authenticateToken, async (req: any, res) => {
    try {
      const workoutData = insertWorkoutSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const newWorkout = await workoutService.createWorkout(workoutData);
      
      // Log activity
      await activityLogsService.logActivity({
        userId: req.user.id,
        action: 'workout_completed',
        entityType: 'workout',
        entityId: newWorkout.id,
        metadata: JSON.stringify({ type: newWorkout.type, duration: newWorkout.duration }),
      });
      
      res.status(201).json(newWorkout);
    } catch (error) {
      console.error('Create workout error:', error);
      res.status(500).json({ error: 'Failed to create workout' });
    }
  });

  app.get('/api/workouts/stats', authenticateToken, async (req: any, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const stats = await workoutService.getWorkoutStats(req.user.id, startDate, endDate);
      res.json(stats);
    } catch (error) {
      console.error('Get workout stats error:', error);
      res.status(500).json({ error: 'Failed to get workout stats' });
    }
  });

  app.delete('/api/workouts/:id', authenticateToken, async (req: any, res) => {
    try {
      await workoutService.deleteWorkout(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Delete workout error:', error);
      res.status(500).json({ error: 'Failed to delete workout' });
    }
  });

  // Body measurements routes
  app.get('/api/body-measurements', authenticateToken, async (req: any, res) => {
    try {
      const measurements = await bodyMeasurementsService.getMeasurementsByUserId(req.user.id);
      res.json(measurements);
    } catch (error) {
      console.error('Get body measurements error:', error);
      res.status(500).json({ error: 'Failed to get body measurements' });
    }
  });

  app.post('/api/body-measurements', authenticateToken, async (req: any, res) => {
    try {
      const measurementData = {
        ...req.body,
        userId: req.user.id,
      };
      const newMeasurement = await bodyMeasurementsService.createMeasurement(measurementData);
      res.status(201).json(newMeasurement);
    } catch (error) {
      console.error('Create body measurement error:', error);
      res.status(500).json({ error: 'Failed to create body measurement' });
    }
  });

  // Connected apps routes
  app.get('/api/connected-apps', authenticateToken, async (req: any, res) => {
    try {
      const apps = await connectedAppsService.getConnectedAppsByUserId(req.user.id);
      res.json(apps);
    } catch (error) {
      console.error('Get connected apps error:', error);
      res.status(500).json({ error: 'Failed to get connected apps' });
    }
  });

  // Nutrition routes
  app.get('/api/nutrition', authenticateToken, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 30;
      const entries = await nutritionService.getNutritionEntriesByUserId(req.user.id, limit);
      res.json(entries);
    } catch (error) {
      console.error('Get nutrition entries error:', error);
      res.status(500).json({ error: 'Failed to get nutrition entries' });
    }
  });

  app.post('/api/nutrition', authenticateToken, async (req: any, res) => {
    try {
      const nutritionData = {
        ...req.body,
        userId: req.user.id,
      };
      const newEntry = await nutritionService.createNutritionEntry(nutritionData);
      res.status(201).json(newEntry);
    } catch (error) {
      console.error('Create nutrition entry error:', error);
      res.status(500).json({ error: 'Failed to create nutrition entry' });
    }
  });

  app.get('/api/nutrition/daily/:date', authenticateToken, async (req: any, res) => {
    try {
      const date = new Date(req.params.date);
      const summary = await nutritionService.getDailyNutritionSummary(req.user.id, date);
      res.json(summary);
    } catch (error) {
      console.error('Get daily nutrition summary error:', error);
      res.status(500).json({ error: 'Failed to get daily nutrition summary' });
    }
  });

  // Achievements routes
  app.get('/api/achievements', authenticateToken, async (req: any, res) => {
    try {
      const achievements = await achievementsService.getAchievementsByUserId(req.user.id);
      res.json(achievements);
    } catch (error) {
      console.error('Get achievements error:', error);
      res.status(500).json({ error: 'Failed to get achievements' });
    }
  });

  // Activity logs routes
  app.get('/api/activity', authenticateToken, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const activities = await activityLogsService.getRecentActivities(req.user.id, limit);
      res.json(activities);
    } catch (error) {
      console.error('Get activity logs error:', error);
      res.status(500).json({ error: 'Failed to get activity logs' });
    }
  });

  // Health check endpoint
  app.get('/api/health', async (req, res) => {
    try {
      const dbHealth = await checkDatabaseHealth();
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: dbHealth
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'error', 
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
