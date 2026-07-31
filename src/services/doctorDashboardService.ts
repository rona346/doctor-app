import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";

export async function getDashboardStats(doctorId: string) {
  try {
    // Query
    const q = query(
      collection(db, "appointments"),
      where("doctorId", "==", doctorId)
    );

    // Fetch Data
    const snapshot = await getDocs(q);

    const appointments = snapshot.docs.map((doc) => doc.data());
    console.log("Dashboard Appointments:", appointments);
    
    const today = new Date().toISOString().split("T")[0];

    // Dashboard Stats
    const todayCount = appointments.filter(
      (appointment) => appointment.date === today
    ).length;

    const pendingCount = appointments.filter(
      (appointment) => appointment.status === "pending"
    ).length;

    const confirmedCount = appointments.filter(
      (appointment) => appointment.status === "confirmed"
      // Agar tumhare database me "completed" hai to usko use karna.
    ).length;

    const cancelledCount = appointments.filter(
      (appointment) => appointment.status === "cancelled"
    ).length;

    const totalPatients = new Set(
      appointments.map((appointment) => appointment.patientId)
    ).size;


  return {
      today: todayCount,
      pending: pendingCount,
      confirmed: confirmedCount,
      cancelled: cancelledCount,
      totalPatients,
    };
  } catch (error) {
    throw error;
  }
}