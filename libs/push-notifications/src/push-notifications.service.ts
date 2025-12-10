import { FirebaseService } from "@app/firebase";
import type { NotificationUserInfo } from "@generated/notifications";
import type admin from "firebase-admin";

import { Injectable, Logger } from "@nestjs/common";

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class PushNotificationsService {
  private readonly logger = new Logger(PushNotificationsService.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  /**
   * Send push notification to a single device token
   */
  async sendToToken(
    token: string,
    payload: PushNotificationPayload,
  ): Promise<string> {
    if (!this.firebaseService.isInitialized()) {
      this.logger.warn(
        "Firebase is not initialized. Push notification not sent.",
      );
      return "";
    }

    try {
      const messaging = this.firebaseService.getMessaging();

      const message: admin.messaging.Message = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data,
        token,
      };

      const response = await messaging.send(message);
      this.logger.log(
        `Push notification sent successfully. Message ID: ${response}`,
      );
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to send push notification to token: ${token}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Send push notification to multiple device tokens
   */
  async sendToTokens(
    tokens: string[],
    payload: PushNotificationPayload,
  ): Promise<admin.messaging.BatchResponse> {
    if (!this.firebaseService.isInitialized()) {
      this.logger.warn(
        "Firebase is not initialized. Push notifications not sent.",
      );
      throw new Error("Firebase is not initialized");
    }

    if (tokens.length === 0) {
      throw new Error("No tokens provided");
    }

    try {
      const messaging = this.firebaseService.getMessaging();

      const message: admin.messaging.MulticastMessage = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data,
        tokens,
      };

      const response = await messaging.sendMulticast(message);

      this.logger.log(
        `Multicast push notification sent. Success: ${response.successCount}, Failed: ${response.failureCount}`,
      );

      // Log individual failures
      response.responses.forEach((resp, index) => {
        if (!resp.success) {
          this.logger.warn(
            `Failed to send to token ${index}: ${resp.error?.message}`,
          );
        }
      });

      return response;
    } catch (error) {
      this.logger.error(
        "Failed to send multicast push notifications",
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Send push notification to a user with multiple devices
   */
  async sendToUser(
    userInfo: NotificationUserInfo,
    payload: PushNotificationPayload,
  ): Promise<
    | admin.messaging.BatchResponse
    | { successCount: number; failureCount: number }
  > {
    if (!userInfo.pushTokens || userInfo.pushTokens.length === 0) {
      throw new Error("User does not have any push notification tokens");
    }

    if (userInfo.pushTokens.length === 1) {
      try {
        await this.sendToToken(userInfo.pushTokens[0], payload);
        return { successCount: 1, failureCount: 0 };
      } catch (error) {
        return { successCount: 0, failureCount: 1 };
      }
    }

    return this.sendToTokens(userInfo.pushTokens, payload);
  }

  /**
   * Subscribe a token to a topic
   */
  async subscribeToTopic(token: string, topic: string): Promise<void> {
    if (!this.firebaseService.isInitialized()) {
      this.logger.warn(
        "Firebase is not initialized. Cannot subscribe to topic.",
      );
      return;
    }

    try {
      const messaging = this.firebaseService.getMessaging();
      await messaging.subscribeToTopic([token], topic);
      this.logger.log(`Token subscribed to topic: ${topic}`);
    } catch (error) {
      this.logger.error(
        `Failed to subscribe token to topic ${topic}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Unsubscribe a token from a topic
   */
  async unsubscribeFromTopic(token: string, topic: string): Promise<void> {
    if (!this.firebaseService.isInitialized()) {
      this.logger.warn(
        "Firebase is not initialized. Cannot unsubscribe from topic.",
      );
      return;
    }

    try {
      const messaging = this.firebaseService.getMessaging();
      await messaging.unsubscribeFromTopic([token], topic);
      this.logger.log(`Token unsubscribed from topic: ${topic}`);
    } catch (error) {
      this.logger.error(
        `Failed to unsubscribe token from topic ${topic}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Send notification to a topic
   */
  async sendToTopic(
    topic: string,
    payload: PushNotificationPayload,
  ): Promise<string> {
    if (!this.firebaseService.isInitialized()) {
      this.logger.warn(
        "Firebase is not initialized. Push notification not sent.",
      );
      return "";
    }

    try {
      const messaging = this.firebaseService.getMessaging();

      const message: admin.messaging.Message = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data,
        topic,
      };

      const response = await messaging.send(message);
      this.logger.log(
        `Push notification sent to topic '${topic}'. Message ID: ${response}`,
      );
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to send push notification to topic ${topic}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
