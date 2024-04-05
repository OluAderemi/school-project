const AboutAuthModal = ({setShowModal}) => {

    const handleClick = (event) => {
        console.log("remove")
        event.stopPropagation(); // Stop event propagation
        setShowModal(false)
    }
    return (
        <div className="auth-modal"> 
            <div className="close-icon" onClick={handleClick}>ⓧ</div>
        </div>
    )
}
export default AboutAuthModal