const { z } = require('zod');

const employeeSchema = z.object({
  employeeId: z.string().min(1),
  thaiName: z.string().min(1),
  position: z.string().optional(),
  salary: z.coerce.number().nonnegative(),
  otRate: z.coerce.number().nonnegative().default(100),
  bankAccountNumber: z.string().optional(),
  bankName: z.string().optional()
});

const vehicleSchema = z.object({
  plateNumber: z.string().min(1),
  model: z.string().optional(),
  capacity: z.coerce.number().int().positive().optional(),
  status: z.enum(['active', 'maintenance']).default('active'),
  maintenanceInfo: z.string().optional()
});

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Invalid data', errors: result.error.errors });
  }
  req.body = result.data;
  next();
};

module.exports = { employeeSchema, vehicleSchema, validate };
