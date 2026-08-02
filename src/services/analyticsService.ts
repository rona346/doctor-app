import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

import { db } from "../firebase";

export interface AnalyticsStats {
  patientCount: number;
  doctorCount: number;
  appointmentCount: number;
  doctorEfficiency: number;
}

export interface AnalyticsChartData {
  name: string;
  patients: number;
  revenue: number;
}

export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  try {

    const usersQuery = collection(db, "users");
    const appointmentsQuery = collection(db, "appointments");

    const [usersSnapshot, appointmentsSnapshot] = await Promise.all([
      getDocs(usersQuery),
      getDocs(appointmentsQuery),
    ]);
    const doctorCount = usersSnapshot.docs.filter(
      (doc) => doc.data().role === "doctor"
    ).length;

    const patientCount = usersSnapshot.docs.filter(
      (doc) => doc.data().role === "patient"
    ).length;

    const appointmentCount = appointmentsSnapshot.size;

    const doctorEfficiency =
      appointmentCount === 0
        ? 0
        : Math.round((appointmentCount / doctorCount) * 100);

    return {
      patientCount,
      doctorCount,
      appointmentCount,
      doctorEfficiency,
    };

  } catch (error) {
    console.error("Error fetching analytics stats:", error);

    return {
      patientCount: 0,
      doctorCount: 0,
      appointmentCount: 0,
      doctorEfficiency: 0,
    };
  }
}

export async function getAnalyticsChartData(): Promise<AnalyticsChartData[]> {
  try {
    const appointmentsSnapshot = await getDocs(
      collection(db, "appointments")
    );

    const monthlyData: AnalyticsChartData[] = [
      { name: "Jan", patients: 0, revenue: 0 },
      { name: "Feb", patients: 0, revenue: 0 },
      { name: "Mar", patients: 0, revenue: 0 },
      { name: "Apr", patients: 0, revenue: 0 },
      { name: "May", patients: 0, revenue: 0 },
      { name: "Jun", patients: 0, revenue: 0 },
      { name: "Jul", patients: 0, revenue: 0 },
      { name: "Aug", patients: 0, revenue: 0 },
      { name: "Sep", patients: 0, revenue: 0 },
      { name: "Oct", patients: 0, revenue: 0 },
      { name: "Nov", patients: 0, revenue: 0 },
      { name: "Dec", patients: 0, revenue: 0 },
    ];

    appointmentsSnapshot.docs.forEach((doc) => {
      const appointment = doc.data();

      const month = new Date(appointment.date).getMonth();

      monthlyData[month].patients += 1;
    });

    return monthlyData;
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return [];
  }
}  

export async function getDepartmentLoad() {
  const snapshot = await getDocs(
    query(collection(db, "users"), where("role", "==", "doctor"))
  );

  const departments: Record<string, number> = {};

  snapshot.docs.forEach((doc) => {
    const specialization =
      doc.data().specialization || "General";

    departments[specialization] =
      (departments[specialization] || 0) + 1;
  });

  return Object.entries(departments).map(([name, value]) => ({
    name,
    value,
  }));
}