// src/cable.js
import { createConsumer } from "@rails/actioncable";
import { useCookies } from 'react-cookie';
import { useState, useEffect } from 'react';

function useActionCable() {
  const [cable, setCable] = useState(null);
  const [cookies] = useCookies(['jwt']);

  useEffect(() => {
    if (cookies.jwt) {
      const newCable = createConsumer(`/cable?token=${cookies.jwt}`); // Or full URL if needed
      setCable(newCable);

      return () => {
        if (newCable) {
          newCable.disconnect();
        }
      };
    } else {
        if (cable) {
            cable.disconnect();
            setCable(null);
        }
    }
  }, [cookies.jwt]);

  return cable;
}

export default useActionCable;