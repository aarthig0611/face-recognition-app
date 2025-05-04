import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import {
  setName,
  resetForm,
  setRegistrationComplete,
} from '../redux/userSlice';

interface RegisterFormProps {
  onSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const { name, showForm, unknownDescriptor, croppedFace } = useSelector(
    (state: RootState) => state.user
  );
  const dispatch = useDispatch();

  const handleRegister = async () => {
    if (!name || !unknownDescriptor) return;

    await fetch('http://localhost:5002/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        name,
        descriptor: JSON.stringify(Array.from(unknownDescriptor)),
        croppredFace: croppedFace || '',
      }),
    });

    dispatch(setRegistrationComplete(true));
    dispatch(resetForm());
    onSuccess?.();
  };

  if (!showForm) return null;

  return (
    <div className="register-form">
      <h3>Unknown Person Detected</h3>
      {croppedFace && (
        <img src={croppedFace} alt="Selected face" width={100} className="mb-2" />
      )}
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => dispatch(setName(e.target.value))}
      />
      <div>
        <button onClick={handleRegister}>Register</button>
        <button onClick={() => dispatch(resetForm())}>Cancel</button>
      </div>
    </div>
  );
};

export default RegisterForm;
