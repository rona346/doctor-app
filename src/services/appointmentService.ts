import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  updateDoc, 
  addDoc
} from "firebase/firestore";
import { db } from "../firebase";

export async function getDoctorAppointments(doctorId: string) {
  const q = query(
    collection(db, "appointments"),
    where("doctorId", "==", doctorId),
    orderBy("date", "desc")

  );
  const snapshot = await getDocs(q);
  const appointments = snapshot.docs.map((doc) => (
    { id: doc.id, 
      ...doc.data() 

    }));
    return appointments;

}

export async function updateAppointmentStatus(
    id: string,
    status: string,
    patientId: string,
    doctorName: string
) {
  try {
   await updateDoc(doc(db, "appointments", id), { status });
      if (status === "confirmed") {
           await addDoc(collection(db, "notifications"), {
           userId: patientId,
           title: "Appointment Confirmed",
           message: `Your appointment with ${doctorName} has been confirmed.`,
           type: "appointment",
           read: false,
           createdAt: new Date().toISOString(),
         });

        }
      else if (status === "cancelled"){
        await addDoc(collection(db, "notifications"), {
          userId: patientId,
          title: "Appointment Cancelled",
          message: `Your appointment with ${doctorName} has been cancelled.`,
          type: "appointment",
          read: false,
          createdAt: new Date().toISOString(),
        });
      }

    } catch (error) {
        throw error;
    }
}
