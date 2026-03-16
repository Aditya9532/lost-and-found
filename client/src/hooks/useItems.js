import { useState, useEffect } from 'react';
import { getItems } from '../api/items';

export const useItems = (filters = {}) => {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [total, setTotal]   = useState(0);
  const [pages, setPages]   = useState(1);

  useEffect(() => {
    setLoading(true);
    getItems(filters)
      .then(res => {
        setItems(res.data.items);
        setTotal(res.data.total);
        setPages(res.data.pages);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [JSON.stringify(filters)]);

  return { items, loading, error, total, pages };
};
