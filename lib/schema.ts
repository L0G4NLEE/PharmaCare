import { pgTable, serial, varchar, text, integer, timestamp, doublePrecision } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Bảng Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("USER"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Bảng Medicines
export const medicines = pgTable("medicines", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  activeIngredient: text("active_ingredient"),
  dosage: varchar("dosage", { length: 100 }),
  indication: text("indication"),
  contraindication: text("contraindication"),
  sideEffects: text("side_effects"),
  storage: text("storage"),
  manufacturer: varchar("manufacturer", { length: 255 }),
  importPrice: doublePrecision("import_price").notNull().default(0),
  retailPrice: doublePrecision("retail_price").notNull().default(0),
  stock: integer("stock").notNull().default(0),
  expiryDate: varchar("expiry_date", { length: 50 }),
  lotNumber: varchar("lot_number", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Bảng Customers
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  birthdate: varchar("birthdate", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Bảng Suppliers
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }),
  address: text("address").notNull(),
  contactPerson: varchar("contact_person", { length: 255 }).notNull(),
  taxCode: varchar("tax_code", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Bảng Interactions
export const interactions = pgTable("interactions", {
  id: serial("id").primaryKey(),
  medicineFromId: integer("medicine_from_id")
    .notNull()
    .references(() => medicines.id),
  medicineToId: integer("medicine_to_id")
    .notNull()
    .references(() => medicines.id),
  severity: varchar("severity", { length: 50 }).notNull(),
  description: text("description").notNull(),
  recommendation: text("recommendation"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Bảng Invoices
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  date: timestamp("date").notNull().defaultNow(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  total: doublePrecision("total").notNull().default(0),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Bảng Invoice Items
export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  medicineId: integer("medicine_id")
    .notNull()
    .references(() => medicines.id),
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull(),
  total: doublePrecision("total").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Bảng Imports
export const imports = pgTable("imports", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  supplierId: integer("supplier_id")
    .notNull()
    .references(() => suppliers.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  date: timestamp("date").notNull().defaultNow(),
  status: varchar("status", { length: 50 }).notNull(),
  total: doublePrecision("total").notNull().default(0),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Bảng Import Items
export const importItems = pgTable("import_items", {
  id: serial("id").primaryKey(),
  importId: integer("import_id")
    .notNull()
    .references(() => imports.id, { onDelete: "cascade" }),
  medicineId: integer("medicine_id")
    .notNull()
    .references(() => medicines.id),
  lotNumber: varchar("lot_number", { length: 100 }).notNull(),
  expiryDate: varchar("expiry_date", { length: 50 }).notNull(),
  price: doublePrecision("price").notNull(),
  quantity: integer("quantity").notNull(),
  total: doublePrecision("total").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Bảng Inventory Logs
export const inventoryLogs = pgTable("inventory_logs", {
  id: serial("id").primaryKey(),
  medicineId: integer("medicine_id")
    .notNull()
    .references(() => medicines.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  quantity: integer("quantity").notNull(),
  reference: varchar("reference", { length: 100 }),
  note: text("note"),
  date: timestamp("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Định nghĩa các mối quan hệ
export const medicinesRelations = relations(medicines, ({ many }) => ({
  inventoryLogs: many(inventoryLogs),
  invoiceItems: many(invoiceItems),
  importItems: many(importItems),
  interactionsFrom: many(interactions, { relationName: "medicineFrom" }),
  interactionsTo: many(interactions, { relationName: "medicineTo" }),
}))

export const customersRelations = relations(customers, ({ many }) => ({
  invoices: many(invoices),
}))

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  imports: many(imports),
}))

export const usersRelations = relations(users, ({ many }) => ({
  invoices: many(invoices),
  imports: many(imports),
  inventoryLogs: many(inventoryLogs),
}))

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  user: one(users, {
    fields: [invoices.userId],
    references: [users.id],
  }),
  items: many(invoiceItems),
}))

export const importsRelations = relations(imports, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [imports.supplierId],
    references: [suppliers.id],
  }),
  user: one(users, {
    fields: [imports.userId],
    references: [users.id],
  }),
  items: many(importItems),
}))

export const interactionsRelations = relations(interactions, ({ one }) => ({
  medicineFrom: one(medicines, {
    fields: [interactions.medicineFromId],
    references: [medicines.id],
    relationName: "medicineFrom",
  }),
  medicineTo: one(medicines, {
    fields: [interactions.medicineToId],
    references: [medicines.id],
    relationName: "medicineTo",
  }),
}))
