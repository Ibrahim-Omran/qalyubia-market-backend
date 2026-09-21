import { Router } from "express";
import * as auth from "../controllers/auth.controller";
import * as categories from "../controllers/category.controller";
import * as ads from "../controllers/ad.controller";
import * as favorites from "../controllers/favorite.controller";
import * as chat from "../controllers/chat.controller";
import * as notifications from "../controllers/notification.controller";
import * as payments from "../controllers/payment.controller";
import * as admin from "../controllers/admin.controller";
import { auth as requireAuth, adminOnly } from "../middlewares/auth";

export const router = Router();

router.post("/auth/register", auth.register);
router.post("/auth/login", auth.login);
router.post("/auth/refresh", auth.refresh);
router.get("/auth/me", requireAuth, auth.me);
router.put("/auth/profile", requireAuth, auth.updateProfile);

router.get("/categories", categories.listCategories);

router.get("/ads", ads.listAds);
router.get("/ads/:id", ads.getAd);
router.post("/ads", requireAuth, ads.createAd);
router.get("/ads/my", requireAuth, ads.myAds);
router.put("/ads/:id", requireAuth, ads.updateAd);
router.delete("/ads/:id", requireAuth, ads.deleteAd);
router.patch("/ads/:id/sold", requireAuth, ads.markSold);

router.post("/favorites/:adId", requireAuth, favorites.addFavorite);
router.delete("/favorites/:adId", requireAuth, favorites.removeFavorite);
router.get("/favorites", requireAuth, favorites.listFavorites);

router.get("/conversations", requireAuth, chat.listConversations);
router.post("/conversations", requireAuth, chat.createConversation);
router.get("/conversations/:id/messages", requireAuth, chat.listMessages);

router.get("/notifications", requireAuth, notifications.listNotifications);
router.patch("/notifications/:id/read", requireAuth, notifications.markRead);
router.patch("/notifications/read-all", requireAuth, notifications.markAllRead);

router.post("/payments/create", requireAuth, payments.createPayment);
router.get("/payments/:id", requireAuth, payments.getPayment);

router.post("/payments/webhook/paymob", payments.paymobWebhook);

router.get("/admin/stats", requireAuth, adminOnly, admin.stats);
router.get("/admin/users", requireAuth, adminOnly, admin.users);
router.get("/admin/ads", requireAuth, adminOnly, admin.ads);
router.patch("/admin/ads/:id/approve", requireAuth, adminOnly, admin.approveAd);
router.patch("/admin/ads/:id/reject", requireAuth, adminOnly, admin.rejectAd);
