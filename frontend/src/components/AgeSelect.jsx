import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firestore";

export default function AgeSelect({ user }) {
  const selectAge = async (age) => {
    await setDoc(doc(db, "users", user.uid), {
      ageGroup: age,
      xp: 0,
      name: user.email,
    });
  };

  return (
    <>
      <button onClick={() => selectAge("6-10")}>6–10</button>
      <button onClick={() => selectAge("11-14")}>11–14</button>
      <button onClick={() => selectAge("15-16")}>15–16</button>
    </>
  );
}
