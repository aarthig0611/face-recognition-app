import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import {
  setName,
  resetForm,
  setRegistrationComplete,
} from '../redux/userSlice';
import '../style/RegisterForm.css';

interface RegisterFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onClose }) => {
  const { name, showForm, unknownDescriptor, croppedFace } = useSelector(
    (state: RootState) => state.user
  );
  const dispatch = useDispatch();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !unknownDescriptor) {
      alert('Please enter your name and ensure face detection is complete');
      return;
    }

    try {
      const response = await fetch('http://localhost:5002/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          name,
          descriptor: JSON.stringify(Array.from(unknownDescriptor)),
          croppedFace: croppedFace || '',
        }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      dispatch(setRegistrationComplete(true));
      dispatch(resetForm());
      onSuccess?.();
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  const handleCancel = () => {
    dispatch(resetForm());
    onClose?.();
  };

  if (!showForm) return null;

  return (
    <div className="register-form" role="dialog" aria-modal="true" aria-labelledby="register-form-title">
      <form onSubmit={handleRegister}>
        <h3 id="register-form-title">Do you want to register?</h3>
        {croppedFace && (
          <img 
            src={croppedFace} 
            alt="Your detected face" 
            width={100} 
            className="mb-2" 
            aria-hidden="true"
          />
        )}
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => dispatch(setName(e.target.value))}
          aria-label="Your name"
          required
          autoFocus
        />
        <div className="button-group">
          <button type="submit" className="register-button">
            Register
          </button>
          <button 
            type="button" 
            className="cancel-button"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;