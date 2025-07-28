import React from 'react';
import { Form, Button, Image } from 'react-bootstrap';

// props: file (File), setFile (function), error (string)
function ProfileImageUpload({ file, setFile, error }) {
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
    }
  };

  const handleRemove = () => {
    setFile(null);
  };

  return (
    <Form.Group className="text-center mb-4">
      <Form.Label style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
        프로필 이미지
      </Form.Label>

      <div className="d-flex flex-column align-items-center mb-2">
        {file ? (
          <>
            <Image
              src={URL.createObjectURL(file)}
              alt="프로필 미리보기"
              roundedCircle
              width={150}
              height={150}
              style={{ objectFit: 'cover', marginBottom: '10px' }}
            />
            <Button variant="outline-danger" size="sm" onClick={handleRemove}>
              삭제
            </Button>
          </>
        ) : (
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: '50%',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              color: '#888',
              marginBottom: '10px'
            }}
          >
            이미지 없음
          </div>
        )}
      </div>

      <Form.Control
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        isInvalid={!!error}
        className="w-50 mx-auto"
      />
      <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
    </Form.Group>
  );
}

export default ProfileImageUpload;
