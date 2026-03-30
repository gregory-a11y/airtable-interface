/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as bookings from "../bookings.js";
import type * as calendars from "../calendars.js";
import type * as clients from "../clients.js";
import type * as forms from "../forms.js";
import type * as http from "../http.js";
import type * as leads from "../leads.js";
import type * as offers from "../offers.js";
import type * as paymentInternal from "../paymentInternal.js";
import type * as payments from "../payments.js";
import type * as seed from "../seed.js";
import type * as stripe from "../stripe.js";
import type * as transactions from "../transactions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  bookings: typeof bookings;
  calendars: typeof calendars;
  clients: typeof clients;
  forms: typeof forms;
  http: typeof http;
  leads: typeof leads;
  offers: typeof offers;
  paymentInternal: typeof paymentInternal;
  payments: typeof payments;
  seed: typeof seed;
  stripe: typeof stripe;
  transactions: typeof transactions;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
