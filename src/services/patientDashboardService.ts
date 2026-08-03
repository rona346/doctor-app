import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";

import { db } from "../firebase";

import {
  handleFirestoreError,
  OperationType,
} from "../lib/firestore-errors";

export const getPatientDashboardStats = async (userId: string) => {
  try {
    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("patientId", "==", userId)
    );

    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    );

    const [appointmentsSnapshot, notificationsSnapshot] =
      await Promise.all([
        getDocs(appointmentsQuery),
        getDocs(notificationsQuery),
      ]);

    return {
      upcoming: appointmentsSnapshot.size,
      diagnoses: 0,
      prescriptions: 0,
      messages: notificationsSnapshot.size,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "dashboard");
    return {
      upcoming: 0,
      diagnoses: 0,
      prescriptions: 0,
      messages: 0,
    };
  }
};

export const getUpcomingAppointments = async (userId: string) => {
  try {
    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", userId),
      orderBy("date", "asc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "appointments");
    return [];
  }
};