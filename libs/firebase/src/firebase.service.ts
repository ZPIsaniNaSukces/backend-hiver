import * as admin from "firebase-admin";

import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private firebaseApp: admin.app.App | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    try {
      const firebaseConfig = this.configService.get<string>(
        "FIREBASE_CONFIG_JSON",
      );

      if (!firebaseConfig) {
        this.logger.warn(
          "FIREBASE_CONFIG_JSON not set. Firebase will not be initialized.",
        );
        return;
      }

      const serviceAccount = JSON.parse(firebaseConfig);

      if (admin.apps.length === 0) {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(
            serviceAccount as admin.ServiceAccount,
          ),
        });

        this.logger.log("Firebase Admin SDK initialized successfully");
      } else {
        this.firebaseApp = admin.apps[0] as admin.app.App;
        this.logger.log("Firebase Admin SDK already initialized");
      }
    } catch (error) {
      this.logger.error(
        "Failed to initialize Firebase Admin SDK",
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Get the Firebase Messaging instance for sending notifications
   */
  getMessaging(): admin.messaging.Messaging {
    if (!this.firebaseApp) {
      throw new Error("Firebase is not initialized");
    }
    return admin.messaging(this.firebaseApp);
  }

  /**
   * Check if Firebase is initialized
   */
  isInitialized(): boolean {
    return this.firebaseApp !== null;
  }
}
