import Nav from '../components/Nav';
import AuthModal from "../components/AuthModal";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import { useState } from 'react';
import { useCookies } from "react-cookie";
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [showModal, setShowModal] = useState(false);
    const [showForgottenModal, setShowForgottenModal] = useState(false);
    const [isSignUp, setIsSignUp] = useState(true);
    const [cookies, setCookie, removeCookie] = useCookies(['user']);
    const authToken = cookies.AuthToken;
    const navigate = useNavigate();

    const handleClick = () => {
        if (authToken) {
            removeCookie('UserId', cookies.UserId);
            removeCookie('AuthToken', cookies.AuthToken);
            window.location.reload();
            return;
        }
        setShowModal(true);
        setIsSignUp(true);
    };

    // Function to handle forgot password click
    const handleForgotPassword = () => {
        setShowForgottenModal(true);
    };

    const handlePasswordResetSuccess = () => {
        setShowModal(true);
        setIsSignUp(false); // Open the login modal
    };

    return (
        <div className="overlay">
            <Nav
                authToken={authToken}
                minimal={false}
                setShowModal={setShowModal}
                showModal={showModal}
                setIsSignUp={setIsSignUp}
            />
            <div className="home">
                <h1 className="primary-title">find an adventurer</h1>
                <button className="primary-button" onClick={handleClick}>
                    {authToken ? 'Signout' : 'Create Account'}
                </button>

                {/* Add Forgot Password button */}
                {!authToken && (
                    <button className="secondary-button" onClick={handleForgotPassword}>
                        Forgot Password?
                    </button>
                )}

                {showForgottenModal && (
                    <ForgotPasswordModal setShowForgottenModal={setShowForgottenModal} onPasswordResetSuccess={handlePasswordResetSuccess} />
                )}

                {showModal && (
                    <AuthModal setShowModal={setShowModal} isSignUp={isSignUp} />
                )}
            </div>
        </div>
    );
};

export default Home;
