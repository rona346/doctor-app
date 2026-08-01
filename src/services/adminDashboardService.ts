import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

import { formatDistanceToNow } from "date-fns";

import { db } from "../firebase";

import  type { User as UserType } from "../types";

// Dashboard Stats
export async function getAdminDashboardStats() {
  try {
    const doctorsQuery = query(
      collection(db, "users"),
      where("role", "==", "doctor")
    );

    const patientsQuery = query(
      collection(db, "users"),
      where("role", "==", "patient")
    );

    const appointmentsQuery = collection(db, "appointments");

    const [doctorsSnap, patientsSnap, appointmentsSnap] = await Promise.all([
      getDocs(doctorsQuery),
      getDocs(patientsQuery),
      getDocs(appointmentsQuery),
    ]);

    return {
      doctors: doctorsSnap.docs.map(
        (doc) => doc.data() as UserType
      ),
      patientCount: patientsSnap.size,
      appointmentCount: appointmentsSnap.size,
    };
  } catch (error) {
    console.error("Admin Dashboard Error:", error);

    return {
      doctors: [],
      patientCount: 0,
      appointmentCount: 0,
    };
  }
}

// Patient Growth Chart
export async function getPatientGrowth() {
  try {
    const patientQuery = query(
      collection(db, "users"),
      where("role", "==", "patient")
    );

    const snapshot = await getDocs(patientQuery);

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyData = months.map((month) => ({
      name: month,
      patients: 0,
    }));

    snapshot.docs.forEach((doc) => {
      const patient = doc.data();

      if (!patient.createdAt) return;

      const month = new Date(patient.createdAt).getMonth();

      monthlyData[month].patients += 1;
    });

    return monthlyData;
  } catch (error) {
    console.error("Patient Growth Error:", error);
    return [];
  }
}

