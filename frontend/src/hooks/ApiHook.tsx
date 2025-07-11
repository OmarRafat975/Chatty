import { useState } from "react";
import axios from "axios";

export function useFetch<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (url: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get<T>(url);
      setData(res.data);
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchData };
}
