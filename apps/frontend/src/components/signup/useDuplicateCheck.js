import { useState } from 'react';
import axios from 'axios';

export const useDuplicateCheck = () => {
  const [checking, setChecking] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(null);
  const [message, setMessage] = useState('');

  const checkDuplicate = async (field, value) => {
    setChecking(true);
    setMessage('');
    setIsDuplicate(null);

    try {
      const res = await axios.get(`/api/v1/check-duplicate`, {
        params: { field, value },
      });

      if (res.data.isDuplicate) {
        setIsDuplicate(true);
        setMessage(`${field === 'email' ? '이메일' : '닉네임'}이 이미 사용 중입니다.`);
      } else {
        setIsDuplicate(false);
        setMessage(`${field === 'email' ? '이메일' : '닉네임'} 사용 가능합니다.`);
      }
    } catch (error) {
      setMessage('중복 확인에 실패했습니다.');
      console.error(error);
    } finally {
      setChecking(false);
    }
  };

  return {
    checkDuplicate,
    checking,
    isDuplicate,
    message,
  };
};
