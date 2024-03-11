import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../helpers/baseURL"

const useFetch = () => {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await axios.get(BASE_URL);
        setData(res.data)
      } catch (error) {
        setError(true)
      }
      setLoading(false)
    };
    fetchData()
  }, []);

  return {data, loading, error};
};

export default useFetch;