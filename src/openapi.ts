import { OpenAPIV3 } from "openapi-types";

export const openapiDocument: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "Qalyubia Market API",
    version: "1.0.0",
    description:
      "Professional REST API documentation for Qalyubia Market. " +
      "The API supports authentication, marketplace ads, categories, favorites, chat, notifications, payments and admin operations.",
    contact: {
      name: "Qalyubia Market Backend"
    }
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local development"
    },
    {
      url: "https://api.example.com",
      description: "Production placeholder - replace with your real API URL"
    }
  ],
  tags: [
    { name: "Health", description: "API health check" },
    { name: "Auth", description: "Registration, login, token refresh and profile" },
    { name: "Categories", description: "Marketplace categories" },
    { name: "Ads", description: "Create, search, update and manage advertisements" },
    { name: "Favorites", description: "User favorite ads" },
    { name: "Conversations", description: "Chat conversations and message history" },
    { name: "Notifications", description: "User notifications" },
    { name: "Payments", description: "Publishing-fee payments" },
    { name: "Admin", description: "Administrator operations" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Use the access token returned by /api/auth/login or /api/auth/register."
      }
    },
    schemas: {
      ApiSuccess: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation completed successfully" },
          data: {}
        },
        required: ["success"]
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Invalid request" }
        },
        required: ["success", "message"]
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Ahmed Mohamed" },
          email: { type: "string", format: "email", example: "ahmed@example.com" },
          phone: { type: "string", nullable: true, example: "01012345678" },
          avatarUrl: { type: "string", nullable: true, format: "uri" },
          isVerified: { type: "boolean", example: false },
          role: { type: "string", enum: ["USER", "ADMIN"], example: "USER" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      AuthResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/User" },
          accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
          refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." }
        },
        required: ["user", "accessToken", "refreshToken"]
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "موبايلات" },
          slug: { type: "string", example: "mobiles" },
          parentId: { type: "string", nullable: true, format: "uuid" },
          children: {
            type: "array",
            items: { $ref: "#/components/schemas/Category" }
          }
        }
      },
      AdImage: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          adId: { type: "string", format: "uuid" },
          url: { type: "string", format: "uri", example: "https://cdn.example.com/ad.jpg" },
          sortOrder: { type: "integer", example: 0 }
        }
      },
      Ad: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          categoryId: { type: "string", format: "uuid" },
          subcategoryId: { type: "string", nullable: true, format: "uuid" },
          title: { type: "string", example: "iPhone 13 Pro Max" },
          description: { type: "string", example: "حالة ممتازة واستخدام خفيف" },
          price: { type: "number", format: "double", example: 35000 },
          currency: { type: "string", example: "EGP" },
          condition: { type: "string", enum: ["NEW", "USED"], example: "USED" },
          location: { type: "string", example: "بنها" },
          lat: { type: "number", nullable: true, example: 30.4667 },
          lng: { type: "number", nullable: true, example: 31.1833 },
          status: {
            type: "string",
            enum: ["DRAFT", "PENDING_PAYMENT", "ACTIVE", "SOLD", "EXPIRED", "REJECTED", "DELETED"]
          },
          viewsCount: { type: "integer", example: 12 },
          favoritesCount: { type: "integer", example: 3 },
          isFeatured: { type: "boolean", example: false },
          publishedAt: { type: "string", nullable: true, format: "date-time" },
          expiresAt: { type: "string", nullable: true, format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          images: { type: "array", items: { $ref: "#/components/schemas/AdImage" } }
        }
      },
      CreateAdRequest: {
        type: "object",
        required: ["title", "description", "price", "categoryId", "condition", "location"],
        properties: {
          title: { type: "string", minLength: 3, maxLength: 150, example: "iPhone 13 Pro Max" },
          description: { type: "string", minLength: 5, maxLength: 5000 },
          price: { type: "number", minimum: 0, example: 35000 },
          categoryId: { type: "string", format: "uuid" },
          subcategoryId: { type: "string", nullable: true, format: "uuid" },
          condition: { type: "string", enum: ["NEW", "USED"] },
          location: { type: "string", example: "بنها" },
          lat: { type: "number", nullable: true },
          lng: { type: "number", nullable: true }
        }
      },
      Conversation: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          adId: { type: "string", format: "uuid" },
          buyerId: { type: "string", format: "uuid" },
          sellerId: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      Message: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          conversationId: { type: "string", format: "uuid" },
          senderId: { type: "string", format: "uuid" },
          content: { type: "string", example: "هل الإعلان ما زال متاح؟" },
          isRead: { type: "boolean", example: false },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      Notification: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          type: {
            type: "string",
            enum: ["NEW_MESSAGE", "AD_APPROVED", "AD_REJECTED", "PAYMENT_SUCCESS", "PAYMENT_FAILED", "AD_FAVORITED", "AD_EXPIRED", "SYSTEM"]
          },
          title: { type: "string" },
          body: { type: "string" },
          isRead: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      Payment: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          adId: { type: "string", format: "uuid" },
          amount: { type: "number", example: 50 },
          currency: { type: "string", example: "EGP" },
          provider: { type: "string", example: "PAYMOB" },
          providerTransactionId: { type: "string", nullable: true },
          status: { type: "string", enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 20 },
          total: { type: "integer", example: 100 },
          pages: { type: "integer", example: 5 }
        }
      }
    }
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "API is running",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiSuccess" }
              }
            }
          }
        }
      }
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "Ahmed Mohamed" },
                  email: { type: "string", format: "email", example: "ahmed@gmail.com" },
                  phone: { type: "string", example: "01012345678" },
                  password: { type: "string", format: "password", minLength: 6, example: "12345678" }
                }
              }
            }
          }
        },
        responses: {
          "201": {
            description: "User created",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } }
          },
          "409": { description: "Email already registered", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "ahmed@gmail.com" },
                  password: { type: "string", format: "password", example: "12345678" }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "Logged in", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
          "401": { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        }
      }
    },
    "/api/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["refreshToken"],
                properties: { refreshToken: { type: "string" } }
              }
            }
          }
        },
        responses: { "200": { description: "New access token" }, "401": { description: "Invalid refresh token" } }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Current user" }, "401": { description: "Unauthorized" } }
      }
    },
    "/api/auth/profile": {
      put: {
        tags: ["Auth"],
        summary: "Update current profile",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Ahmed Ali" },
                  phone: { type: "string", nullable: true },
                  avatarUrl: { type: "string", format: "uri", nullable: true }
                }
              }
            }
          }
        },
        responses: { "200": { description: "Profile updated" }, "401": { description: "Unauthorized" } }
      }
    },
    "/api/categories": {
      get: {
        tags: ["Categories"],
        summary: "List root categories with subcategories",
        responses: { "200": { description: "Categories returned" } }
      }
    },
    "/api/ads": {
      get: {
        tags: ["Ads"],
        summary: "Search and list active ads",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" }, description: "Search title/description" },
          { name: "categoryId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "subcategoryId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "minPrice", in: "query", schema: { type: "number", minimum: 0 } },
          { name: "maxPrice", in: "query", schema: { type: "number", minimum: 0 } },
          { name: "condition", in: "query", schema: { type: "string", enum: ["NEW", "USED"] } },
          { name: "location", in: "query", schema: { type: "string" } },
          { name: "sort", in: "query", schema: { type: "string", enum: ["latest", "oldest", "price_asc", "price_desc", "most_viewed"], default: "latest" } },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 20 } }
        ],
        responses: { "200": { description: "Paginated ads" } }
      },
      post: {
        tags: ["Ads"],
        summary: "Create an advertisement",
        description: "Creates an ad in PENDING_PAYMENT. It does not become ACTIVE until a verified payment succeeds.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateAdRequest" } } }
        },
        responses: {
          "201": { description: "Ad created and waiting for payment" },
          "401": { description: "Unauthorized" }
        }
      }
    },
    "/api/ads/my": {
      get: {
        tags: ["Ads"],
        summary: "Get current user's ads",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "User ads" }, "401": { description: "Unauthorized" } }
      }
    },
    "/api/ads/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      get: {
        tags: ["Ads"],
        summary: "Get ad details",
        responses: { "200": { description: "Ad details" }, "404": { description: "Ad not found" } }
      },
      put: {
        tags: ["Ads"],
        summary: "Update own non-active ad",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateAdRequest" } } }
        },
        responses: { "200": { description: "Ad updated" }, "400": { description: "Active ads cannot be edited by this starter API" } }
      },
      delete: {
        tags: ["Ads"],
        summary: "Soft-delete own ad",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Ad deleted" } }
      }
    },
    "/api/ads/{id}/sold": {
      patch: {
        tags: ["Ads"],
        summary: "Mark own ad as sold",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Ad marked as sold" } }
      }
    },
    "/api/favorites": {
      get: {
        tags: ["Favorites"],
        summary: "List current user's favorites",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Favorite ads" } }
      }
    },
    "/api/favorites/{adId}": {
      parameters: [{ name: "adId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      post: {
        tags: ["Favorites"],
        summary: "Add an ad to favorites",
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "Added to favorites" } }
      },
      delete: {
        tags: ["Favorites"],
        summary: "Remove an ad from favorites",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Removed from favorites" } }
      }
    },
    "/api/conversations": {
      get: {
        tags: ["Conversations"],
        summary: "List user's conversations",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Conversations" } }
      },
      post: {
        tags: ["Conversations"],
        summary: "Create or return a conversation for an ad",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["adId"],
                properties: { adId: { type: "string", format: "uuid" } }
              }
            }
          }
        },
        responses: { "201": { description: "Conversation" }, "400": { description: "Cannot chat with yourself" } }
      }
    },
    "/api/conversations/{id}/messages": {
      get: {
        tags: ["Conversations"],
        summary: "Get message history",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Messages" }, "404": { description: "Conversation not found" } }
      }
    },
    "/api/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "List notifications",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Notifications" } }
      }
    },
    "/api/notifications/{id}/read": {
      patch: {
        tags: ["Notifications"],
        summary: "Mark notification as read",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Notification updated" } }
      }
    },
    "/api/notifications/read-all": {
      patch: {
        tags: ["Notifications"],
        summary: "Mark all notifications as read",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Notifications updated" } }
      }
    },
    "/api/payments/create": {
      post: {
        tags: ["Payments"],
        summary: "Create publishing-fee payment",
        description: "The server controls the publishing fee. Flutter must not send or override the amount.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["adId"],
                properties: { adId: { type: "string", format: "uuid" } }
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Payment record created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Payment" }
              }
            }
          }
        }
      }
    },
    "/api/payments/{id}": {
      get: {
        tags: ["Payments"],
        summary: "Get own payment",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Payment details" }, "404": { description: "Payment not found" } }
      }
    },
    "/api/payments/webhook/paymob": {
      post: {
        tags: ["Payments"],
        summary: "Paymob webhook",
        description:
          "Provider-to-backend endpoint. In production, verify the provider HMAC/signature before updating payment status. A verified success activates the ad.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: true,
                example: {
                  id: 12345,
                  success: true,
                  merchant_order_id: "payment-uuid"
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "Webhook accepted/processed" },
          "400": { description: "Missing payment reference" },
          "404": { description: "Payment not found" }
        }
      }
    },
    "/api/admin/stats": {
      get: {
        tags: ["Admin"],
        summary: "Dashboard statistics",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Statistics" }, "403": { description: "Admin only" } }
      }
    },
    "/api/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List users",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Users" }, "403": { description: "Admin only" } }
      }
    },
    "/api/admin/ads": {
      get: {
        tags: ["Admin"],
        summary: "List all ads",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Ads" }, "403": { description: "Admin only" } }
      }
    },
    "/api/admin/ads/{id}/approve": {
      patch: {
        tags: ["Admin"],
        summary: "Approve an ad",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Ad approved" } }
      }
    },
    "/api/admin/ads/{id}/reject": {
      patch: {
        tags: ["Admin"],
        summary: "Reject an ad",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Ad rejected" } }
      }
    }
  }
};
