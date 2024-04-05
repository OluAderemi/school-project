import { useState } from 'react';
import axios from 'axios';

const ForgotPasswordModal = ({ setShowForgottenModal, onPasswordResetSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/forgot-password', { email, newPassword: password, confirmPassword });
            
            if (response.status === 200) {
                alert('Password reset successful!');
                onPasswordResetSuccess(); // Invoke callback function to open login modal
                setShowForgottenModal(false); // Close forgot password modal
            } else {
                setError('Failed to reset password. Please try again.');
            }
        } catch (error) {
            setError('An error occurred. Please try again later.');
            console.error(error);
        }
    };

    return (
        <div className="auth-modal">
            <div className="close-icon" onClick={() => setShowForgottenModal(false)}>ⓧ</div>

            <h2>Forgot Password?</h2>
            <p>Enter your email and new password to reset your password.</p>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <button type="submit" className="secondary-button">Reset Password</button>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
};

export default ForgotPasswordModal;
