const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id format");

const isoDateStringSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid date format",
  });

const riskPreferenceSchema = z.enum(["Conservative", "Moderate", "Aggressive"]);

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const routeSchemas = {
  auth: {
    register: z.object({
      body: z.object({
        name: z.string().trim().min(1, "Name is required"),
        email: z.email("Invalid email").transform((value) => value.trim().toLowerCase()),
        password: passwordSchema,
        riskPreference: riskPreferenceSchema.optional(),
      }),
    }),
    login: z.object({
      body: z.object({
        email: z.email("Invalid email").transform((value) => value.trim().toLowerCase()),
        password: z.string().min(1, "Password is required"),
      }),
    }),
    updateUser: z.object({
      body: z
        .object({
          name: z.string().trim().min(1, "Name cannot be empty").optional(),
          email: z
            .email("Invalid email")
            .transform((value) => value.trim().toLowerCase())
            .optional(),
          riskPreference: riskPreferenceSchema.optional(),
        })
        .refine((data) => Object.keys(data).length > 0, {
          message: "At least one field is required",
        }),
    }),
  },
  investment: {
    create: z.object({
      body: z.object({
        scheme_code: z.coerce.number().int().positive(),
        scheme_name: z.string().trim().min(1, "Scheme name is required"),
        fund_house: z.string().trim().optional(),
        scheme_type: z.string().trim().optional(),
        scheme_category: z.string().trim().min(1, "Scheme category is required"),
        subCategory: z.string().trim().optional(),
        investedAmount: z.coerce.number().positive("Invested amount must be positive"),
        units: z.coerce.number().positive("Units must be positive"),
        purchaseNAV: z.coerce.number().positive("Purchase NAV must be positive"),
        purchaseDate: isoDateStringSchema,
        expenseRatio: z.coerce
          .number()
          .nonnegative("Expense ratio cannot be negative")
          .optional(),
        type: z.enum(["lumpsum", "sip"]).default("lumpsum"),
        isin_growth: z.string().trim().optional(),
      }),
    }),
    sell: z.object({
      params: z.object({
        id: objectIdSchema,
      }),
      body: z.object({
        unitsToSell: z.coerce.number().positive("Units to sell must be positive"),
        currentNAV: z.coerce.number().positive("Current NAV must be positive"),
      }),
    }),
    delete: z.object({
      params: z.object({
        id: objectIdSchema,
      }),
    }),
  },
  goal: {
    create: z.object({
      body: z.object({
        name: z.string().trim().min(1, "Goal name is required"),
        targetAmount: z.coerce.number().positive("Target amount must be positive"),
        targetDate: isoDateStringSchema,
      }),
    }),
    update: z.object({
      params: z.object({
        id: objectIdSchema,
      }),
      body: z.object({
        name: z.string().trim().min(1, "Goal name is required"),
        targetAmount: z.coerce.number().positive("Target amount must be positive"),
        targetDate: isoDateStringSchema,
      }),
    }),
    goalById: z.object({
      params: z.object({
        id: objectIdSchema,
      }),
    }),
  },
  sip: {
    create: z.object({
      body: z.object({
        scheme_code: z.coerce.number().int().positive(),
        scheme_name: z.string().trim().min(1, "Scheme name is required"),
        fund_house: z.string().trim().optional(),
        scheme_type: z.string().trim().optional(),
        scheme_category: z.string().trim().min(1, "Scheme category is required"),
        monthlyAmount: z.coerce.number().positive("Monthly amount must be positive"),
        startDate: isoDateStringSchema,
        expectedReturnRate: z.coerce
          .number()
          .nonnegative("Expected return rate cannot be negative"),
        durationYears: z.coerce
          .number()
          .int()
          .positive("Duration years must be positive"),
      }),
    }),
    updateStatus: z.object({
      params: z.object({
        id: objectIdSchema,
      }),
      body: z.object({
        status: z.enum(["active", "paused", "stopped"]),
      }),
    }),
    update: z.object({
      params: z.object({
        id: objectIdSchema,
      }),
      body: z.object({
        monthlyAmount: z.coerce.number().positive("Monthly amount must be positive"),
        durationYears: z.coerce
          .number()
          .int()
          .positive("Duration years must be positive"),
        expectedReturnRate: z.coerce
          .number()
          .nonnegative("Expected return rate cannot be negative"),
      }),
    }),
    executeInstalment: z.object({
      params: z.object({
        id: objectIdSchema,
      }),
      body: z.object({
        currentNAV: z.coerce.number().positive("Current NAV must be positive"),
      }),
    }),
    delete: z.object({
      params: z.object({
        id: objectIdSchema,
      }),
    }),
  },
  transaction: {
    getTransactions: z.object({
      query: z
        .object({
          type: z.enum(["buy", "sell", "sip", "redemption"]).optional(),
          scheme_code: z.coerce.number().int().positive().optional(),
          from: isoDateStringSchema.optional(),
          to: isoDateStringSchema.optional(),
        })
        .refine(
          (query) => {
            if (!query.from || !query.to) {
              return true;
            }

            return new Date(query.from) <= new Date(query.to);
          },
          {
            message: "'from' date cannot be after 'to' date",
            path: ["from"],
          },
        ),
    }),
  },
  analytics: {
    whatIf: z.object({
      body: z.object({
        scheme_code: z.coerce.number().int().positive(),
        amount: z.coerce.number().positive(),
        date: isoDateStringSchema,
      }),
    }),
  },
};

module.exports = {
  routeSchemas,
};
