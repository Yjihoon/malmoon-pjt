import { useState } from 'react';
import axios from 'axios';

export const useDuplicateCheck = () => {
  const [checking, setChecking] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(null);
  const [message, setMessage] = useState('');

  const checkEmail = async (email) => {
    setChecking(true);
    setMessage('');
    setIsDuplicate(null);

    try {
      const res = await axios.get('/api/v1/members/email', {
        params: { email },
      });

      const isDup = res.data.duplicate;

      if (isDup) {
        setIsDuplicate(true);
        setMessage('이메일이 이미 사용 중입니다.');
      } else {
        setIsDuplicate(false);
        setMessage('이메일 사용 가능합니다.');
      }
    } catch (error) {
      setMessage('이메일 중복 확인에 실패했습니다.');
      console.error(error);
    } finally {
      setChecking(false);
    }
  };

  return {
    checkEmail,
    checking,
    isDuplicate,
    message,
  };
};
