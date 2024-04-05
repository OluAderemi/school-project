import TinderCard from 'react-tinder-card'
import { useEffect, useState } from 'react'
import AboutAuthModal from "../components/AboutAuthModal"
import ChatContainer from '../components/ChatContainer'
import { useCookies } from 'react-cookie'
import axios from 'axios'

const Dashboard = () => {
    const [user, setUser] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [genderedUsers, setGenderedUsers] = useState(null)
    const [lastDirection, setLastDirection] = useState();
    const [cookies, setCookie, removeCookie] = useCookies(['user'])

    const userId = cookies.UserId


    const getUser = async () => {
        try {
            const response = await axios.get('http://localhost:8000/user', {
                params: { userId }
            })
            setUser(response.data)
        } catch (error) {
            console.log(error)
        }
    }

    const getGenderedUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/perform-matching', {

                params: {
                    userId: user?.user_id,
                    gender: user?.gender_interest,
                    minAge: user?.min_age,
                    maxAge: user?.max_age
                }

            })
            console.log(user?.user_id);
            console.log(user?.gender_interest);
            console.log(user?.min_age);
            console.log(user?.max_age);
            setGenderedUsers(response.data)
        } catch (error) {
            console.log(error)
        }
    }




    useEffect(() => {
        getUser()

    }, [])

    useEffect(() => {
        if (user) {
            getGenderedUsers()
        }
    }, [user])



    const updateMatches = async (matchedUserId) => {
        try {
            await axios.put('http://localhost:8000/addmatch', {
                userId,
                matchedUserId
            })
            getUser()
        } catch (err) {
            console.log(err)
        }
    }

    const handleClick = () => {
        console.log("clicked")
        console.log(showModal)
        if (!setShowModal) {
            setShowModal(false)
        }

        //else {
        //     setShowModal(true)
        // }


        setShowModal(prevState => !prevState); // Toggle modal state
    }




    const swiped = (direction, swipedUserId) => {
        if (direction === 'right') {
            updateMatches(swipedUserId);
        }
        setLastDirection(direction);
    };

    const outOfFrame = (name) => {
        console.log(name + ' left the screen!');
    };

    const matchedUserIds = user?.matches.map(({ user_id }) => user_id).concat(userId)

    const filteredGenderedUsers = genderedUsers?.filter(genderedUser => !matchedUserIds.includes(genderedUser.user_id))


    console.log('filteredGenderedUsers ', filteredGenderedUsers)
    return (
        <>
            {user &&
                <div className="dashboard">
                    <ChatContainer user={user} />
                    <div className="swipe-container">
                        <div className="card-container">

                            {filteredGenderedUsers?.reverse().map((genderedUser) =>
                                <TinderCard
                                    className="swipe"
                                    key={genderedUser.user_id}
                                    onSwipe={(dir) => swiped(dir, genderedUser.user_id)}
                                    onCardLeftScreen={() => outOfFrame(genderedUser.first_name)}>
                                    <div
                                        style={{ backgroundImage: "url(" + genderedUser.url + ")" }}
                                        className="card"
                                        onClick={handleClick}>
                                        {showModal && (
                                            <AboutAuthModal setShowModal={setShowModal} />
                                        )}
                                        <h3>{genderedUser.first_name}</h3>
                                    </div>
                                </TinderCard>
                            )}
                            <div className="swipe-info">
                                {lastDirection ? <p>You swiped {lastDirection}</p> : <p />}
                            </div>
                        </div>
                    </div>

                </div>}
        </>
    )
}
export default Dashboard

