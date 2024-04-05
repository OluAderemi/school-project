import Nav from '../components/Nav'
import { useCookies } from 'react-cookie'
import { useNavigate } from 'react-router-dom'
import React, { useState, useEffect } from 'react';
import axios from 'axios'

const OnBoarding = () => {
    const [cookies] = useCookies(null)
    const [formData, setFormData] = useState({
        user_id: cookies.UserId,
        first_name: "",
        last_name: "",
        user_name: "",
        dob_day: "",
        dob_month: "",
        dob_year: "",
        show_gender: false,
        gender_identity: "",
        gender_interest: "",
        motive_interest: "",
        min_age: "",
        max_age: "",
        url: "",
        about: "",
        matches: [],
        interests: [],
        occupation: "",
        zip_code: "",
        city: "",
        state: "",
        country: "",
        distance_preference: "",
        latitude: "",
        longitude: "",
    })


    const [minAgeError, setMinAgeError] = useState('');
    const [maxAgeError, setMaxAgeError] = useState('');
    const [userAgeError, setUserAgeError] = useState('');
    const [pageError, setPageError] = useState('');
    const [dobError, setDobError] = useState('');
    const [firstNameError, setFirstNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [userNameError, setUserNameError] = useState('');
    const [genderError, setGenderError] = useState('');
    const [genderInterestError, setGenderInterestError] = useState('');
    const [lookingForError, setlookingForError] = useState('');
    const [aboutError, setAboutError] = useState('');
    const [pictureError, setPictureError] = useState('');

    let navigate = useNavigate()



    const isValidDate = (day, month, year) => {
        const date = new Date(year, month - 1, day); // month is zero-based
        return date.getDate() === Number(day) && date.getMonth() === Number(month) - 1 && date.getFullYear() === Number(year);
    };

    const isLeapYear = (year) => {
        if (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)) {
            return true; // It's a leap year
        } else {
            return false; // Not a leap year
        }
    };

    useEffect(() => {
        // Function to handle geolocation
        const getLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        try {
                            const response = await fetch(
                                `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
                            );
                            const data = await response.json();
                            const { city, country, state, postcode,} = data.address;
                            setFormData(prevState => ({
                                ...prevState,
                                zip_code: postcode,
                                city: city,
                                state: state,
                                country: country,
                                latitude: position.coords.latitude.toString(),
                                longitude: position.coords.longitude.toString(),
                            }));                            
                        } catch (error) {
                            console.error('Error fetching location:', error);
                        }
                    },
                    (error) => {
                        console.error('Error getting location:', error);
                    }
                );
            } else {
                console.error('Geolocation is not supported');
            }
        };

        // Call getLocation when component mounts
        getLocation();
    }, []);


    const handleSubmit = async (e) => {
        console.log(formData.looking_for);
        console.log('submitted')


        e.preventDefault()

        setPageError("")
        setMinAgeError("")
        setUserAgeError("")
        setDobError("")
        setFirstNameError("")
        setLastNameError("")
        setUserNameError("")
        setGenderError("")
        setGenderInterestError("")
        setlookingForError("")
        setAboutError("")
        setPictureError("")



        // if(formData.dob_day > 31 && !daysInMonth(formData.dob_month, formData.dob_year)){
        //     setPageError("wrong day entered!")
        // }

        if (formData.first_name === "") {
            setFirstNameError('Please enter your first name')
            return;
        }

        if (formData.first_name.length < 3) {
            setFirstNameError('Please enter your first name, with at least 3 letters')
            return;
        }

        if (formData.last_name === "") {
            setLastNameError('Please enter your last name.')
            return;
        }
        if (formData.last_name.length < 3) {
            setLastNameError('Please enter your last name, with at least 3 letters')
            return;
        }

        if (formData.user_name === "") {
            setUserNameError('Please enter a user name.')
            return;
        }
        if (formData.user_name.length < 6) {
            setUserNameError('Please enter a username with atleast 6 letters')
            return;
        }

        const numberPattern = /\d/g;

        // Use the match() method to find all matches of the pattern in the input string
        const numberMatches = formData.user_name.match(numberPattern);

        // Check if the number of matches is greater than 3
        if (numberMatches && numberMatches.length > 3) {
            setUserNameError('Please enter a username with not more than 3 numbers')
            return;
        }

        const underScorePattern = /_/g;

        // Use the match() method to find all matches of the pattern in the input string
        const underScoreMatches = formData.user_name.match(underScorePattern);

        // Check if the number of matches is greater than 3
        if (underScoreMatches && underScoreMatches.length > 2) {
            setUserNameError('Please enter a username with not more than 2 underscores')
            return;
        }


        if ((((underScoreMatches && underScoreMatches.length >= 2) && (numberMatches && numberMatches.length >= 2)
            && (formData.user_name.length < 7)) || (underScoreMatches && underScoreMatches.length > 2) || (numberMatches && numberMatches.length > 2))) {
            setUserNameError('Please enter a username with at least 3 letters and not more than 2 underscores or numbers')
            return;
        }




        if (parseInt(formData.dob_day) === 0) {
            setDobError("day cannot be 0")
            setPageError('One or more errors on the form!')
            return;
        }

        if (parseInt(formData.dob_month) === 0) {
            setDobError("month cannot be 0")
            setPageError('One or more errors on the form!')
            return;
        }

        if (parseInt(formData.dob_year) === 0) {
            setDobError("year cannot be 0")
            setPageError('One or more errors on the form!')
            return;
        }


        const currentYear = new Date().getFullYear();

        if (parseInt(formData.dob_year) > currentYear) {
            setDobError("Enter a year before or equal to the current year")
            setPageError('One or more errors on the form!')
            return; // Exit the function to prevent further processing
        }



        if ((parseInt(formData.dob_month) === 2) && (parseInt(formData.dob_day) === 29) && (!isLeapYear(parseInt(formData.dob_year)))) {
            setDobError('Invalid date of birth: February 29 is only valid in leap years.');
            setPageError('One or more errors on the form!')
            return;
        }


        if (parseInt(formData.dob_day) > 31 && parseInt(formData.dob_month) > 12 && (!isValidDate(formData.dob_day, formData.dob_month, formData.dob_year))) {
            setDobError("The day and month you entered are wrong")
            setPageError('One or more errors on the form!')
            return;
        }


        if (parseInt(formData.dob_day) > 31 && (!isValidDate(formData.dob_day, formData.dob_month, formData.dob_year))) {
            setDobError("The day you have entered is wrong")
            setPageError('One or more errors on the form!')
            return;
        }

        if (parseInt(formData.dob_day) < 31 && parseInt(formData.dob_month) > 12 && (!isValidDate(formData.dob_day, formData.dob_month, formData.dob_year))) {
            setDobError("The month you have entered is wrong")
            setPageError('One or more errors on the form!')
            return;
        }

        if (parseInt(formData.dob_day) > 31 && parseInt(formData.dob_month) > 12 && (!isValidDate(formData.dob_day, formData.dob_month, formData.dob_year))) {
            setDobError("The day and month you entered are wrong")
            setPageError('One or more errors on the form!')
            return;
        }

        if ((!isValidDate(formData.dob_day, formData.dob_month, formData.dob_year))) {
            setDobError("Invalid date of birth")
            setPageError('One or more errors on the form!')
            return;
        }



        // Calculate the user's age from the provided date of birth

        const birthDate = new Date(`${formData.dob_year}-${formData.dob_month}-${formData.dob_day}`);
        const today = new Date();
        const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));

        // Validate if the user is 18 years old or older
        if (age < 18) {
            setUserAgeError("Sorry, this service is only for people who are 18 years old or older.")
            setPageError('One or more errors on the form!')
            return;
        } else if (age > 70) {
            setUserAgeError("Enter a year after 1953")
            setPageError('One or more errors on the form!')
        } else {
            setUserAgeError("");
        }


        // Validate age range
        const minAge = parseInt(formData.min_age);
        const maxAge = parseInt(formData.max_age);

        if (formData.min_age === "") {
            setMinAgeError("You must specify a minimum age for interests")
            return;
        }
        if (formData.max_age === "") {
            setMinAgeError("You must specify a maximum age for interests")
            return;
        }
        if (minAge < 18) {
            setMinAgeError("The minimum age is 18")
            setPageError('One or more errors on the form!')
            return;
        } else {
            setMinAgeError("");
        }

        if (maxAge > 70) {
            setMaxAgeError("The maximum age is 70")
            setPageError('One or more errors on the form!')
            return;
        } else {
            setMaxAgeError("");
        }

        if (minAge >= maxAge) {
            setMinAgeError("Minimum age must be less than maximum age")
            setPageError('One or more errors on the form!')
            return;
        } else {
            setMinAgeError("")
        }

        if ((maxAge - minAge) < 5 || (maxAge - minAge) > 15) {
            setMinAgeError("Age gap must be between 5 and 15 years")
            setPageError('One or more errors on the form!')
            return;
        } else {
            setMinAgeError("")
        }

        // Check if gender_identity is empty
        if (formData.gender_identity === "") {
            setGenderError('Please select a gender.');
            return;
        }

        // Check if gender_idnterest is empty
        if (formData.gender_interest === "") {
            setGenderInterestError('Please select a gender.');
            return;
        }

        // Check if looking_for is empty
        if (formData.motive_interest === "") {
            setlookingForError('Please select your interest.');
            return;
        }



        //Check if required fields are empty


        if (formData.about === "") {
            setAboutError('Please tell us about yourself.');
            return;
        }

        if (formData.about.length <= 15) {
            setAboutError('Please tell us about yourself in at least 15 characters');
            return;
        }

        const doubleSpacePattern = / {2}/;

        // const str = "ab  cd"; // String with double spaces
        if (doubleSpacePattern.test(formData.about)) {
            setAboutError("We caught you using double spaces!")
            return;
        }

        if (formData.url === "") {
            setPictureError('Please add a picture');
            return;
        }

        if (formData.about.trim().length < 15) {
            alert('Enter at least 15 characters about yourself');
            return;
        }

        // Check if geolocation data is available
        if (
            !formData.zip_code ||
            !formData.city ||
            !formData.state ||
            !formData.country ||
            !formData.longitude ||
            !formData.latitude
        ) {
            setPageError("Enable geolocation")
            return;
        }

        // If all validations pass, proceed with form submission
        try {
            const response = await axios.put('http://localhost:8000/user', { formData });
            const success = response.status === 200;
            if (success) {
                console.log(formData.looking_for);
                console.log(formData.zip_code);
                console.log(formData.city);
                console.log(formData.state);
                console.log(formData.country);
                console.log(formData.longitude);
                console.log(formData.latitude);

                navigate('/dashboard');
            }
        } catch (err) {
            console.log(err);
        }

    }


    const handleChange = (e) => {
        console.log('e', e)
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value
        const name = e.target.name

        setFormData((prevState) => ({
            ...prevState,
            [name]: value
        }))
    }

    const handleNameChange = (event) => {
        const { name, value } = event.target;
        if (!formData.first_name.toString) {
            setPageError('Please enter your first name.');
            return;
        }
        // Regular expression to match only letters
        const onlyLettersRegex = /^[a-zA-Z]*$/;

        if (onlyLettersRegex.test(value) || value === '') {
            // Update the state with the new value
            setFormData({
                ...formData,
                [name]: value
            });
        }
    }
    const handleUsernameChange = (event) => {
        const { name, value } = event.target;
        // Regular expression to match letters and underscores
        const allowedCharactersRegex = /^[a-zA-Z_0-9]*$/;

        if (allowedCharactersRegex.test(value) || value === '') {
            // Update the state with the new value
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };


    const handleNumberChange = (e) => {
        const { name, value } = e.target;

        // Ensure that only numbers are entered
        if (!/^\d*$/.test(value)) {
            return;
        }

        // Limit the input for digits
        if (name === "dob_day" && value.length > 2) {
            return;
        }

        if (name === "dob_month" && value.length > 2) {
            return;
        }

        if (name === "dob_year" && value.length > 4) {
            return;
        }

        if (name === "min_age" && value.length > 2) {
            return;
        }

        if (name === "max_age" && value.length > 2) {
            return;
        }






        // Update the state with the new value
        setFormData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };




    const handleInterestClick = (interest) => {
        if (formData.interests.includes(interest)) {
            // If interest is already selected, remove it
            setFormData(prevState => ({
                ...prevState,
                interests: prevState.interests.filter(item => item !== interest)
            }))
        } else {
            // If interest is not selected, add it
            setFormData(prevState => ({
                ...prevState,
                interests: [...prevState.interests, interest]
            }))
        }
    }




    // function previewImage(event) {
    //     const file = event.target.files[0];
    //     if (!file) {
    //         // No file selected, do nothing
    //         return;
    //     }
    //     const reader = new FileReader();
    //     const avatar = document.querySelector('.avatar');

    //     reader.onload = function (event) {
    //         const imageUrl = event.target.result;
    //         avatar.innerHTML = `<img src="${imageUrl}" alt="profile pic preview" />`;
    //     };

    //     reader.readAsDataURL(file);
    // }


    return (
        <>
            <Nav
                minimal={true}
                setShowModal={() => {
                }}
                showModal={false}
            />

            <div className="onboarding">
                <h2>CREATE ACCOUNT</h2>

                <form onSubmit={handleSubmit}>
                    <section>

                        {/* Personal Details */}
                        <div className='personal-details'>
                            <label htmlFor="first_name">First Name</label>
                            <input
                                id="first_name"
                                type='text'
                                name="first_name"
                                placeholder="First Name"
                                maxlength="15"
                                value={formData.first_name}
                                onChange={handleNameChange}
                                className={firstNameError ? "error" : ""}
                            />
                            {firstNameError && <p className="error-text">{firstNameError}</p>}
                            <label htmlFor="last_name">Last Name</label>
                            <input
                                id="last_name"
                                type='text'
                                name="last_name"
                                maxlength="15"
                                placeholder="Last Name"
                                value={formData.last_name}
                                onChange={handleNameChange}
                                className={lastNameError ? "error" : ""}
                            />
                            {lastNameError && <p className="error-text">{lastNameError}</p>}
                            <label htmlFor="user_name">Username</label>
                            <input
                                id="user_name"
                                type='text'
                                name="user_name"
                                placeholder="Last Name"
                                maxlength="15"
                                value={formData.user_name}
                                onChange={handleUsernameChange}
                                className={userNameError ? "error" : ""}
                            />
                            {userNameError && <p className="error-text">{userNameError}</p>}

                            <label>Birthday</label>
                            <div>
                                <input
                                    id="dob_day"
                                    type="number"
                                    name="dob_day"
                                    placeholder="DD"
                                    value={formData.dob_day}
                                    onChange={handleNumberChange}
                                    className={dobError ? "error" : ""}
                                />
                                <input
                                    id="dob_month"
                                    type="number"
                                    name="dob_month"
                                    placeholder="MM"
                                    value={formData.dob_month}
                                    onChange={handleNumberChange}
                                    className={dobError ? "error" : ""}
                                />
                                <input
                                    id="dob_year"
                                    type="number"
                                    name="dob_year"
                                    placeholder="YYYY"
                                    value={formData.dob_year}
                                    onChange={handleNumberChange}
                                    className={dobError ? "error" : ""}
                                />
                            </div>
                            {dobError && <p className="error-text">{dobError}</p>}
                            {userAgeError && <p className="error-text">{userAgeError}</p>}

                        </div>








                        <div className='personalization'>
                            <label >Gender</label>
                            <div className='radios-container'>
                                <input
                                    id="man-gender-identity"
                                    type="radio"
                                    name="gender_identity"
                                    value="man"
                                    onChange={handleChange}
                                    checked={formData.gender_identity === "man"}
                                />
                                <label className='personalization-label' htmlFor="man-gender-identity">Man</label>
                                <input
                                    id="woman-gender-identity"
                                    type="radio"
                                    name="gender_identity"
                                    value="woman"
                                    onChange={handleChange}
                                    checked={formData.gender_identity === "woman"}
                                />
                                <label className='personalization-label' htmlFor="woman-gender-identity">Woman</label>
                                <input
                                    id="other-gender-identity"
                                    type="radio"
                                    name="gender_identity"
                                    value="other"
                                    onChange={handleChange}
                                    checked={formData.gender_identity === "other"}
                                />
                                <label className='personalization-label' htmlFor="other-gender-identity">Other</label>
                                {genderError && <p className="error-text">{genderError}</p>}
                            </div>



                            <label >Show Gender on my Profile</label>



                            <input
                                id="show-gender"
                                type="checkbox"
                                name="show_gender"
                                onChange={handleChange}
                                checked={formData.show_gender}
                            />


                            <label>Show Me</label>
                            <div className='radios-container'>
                                <input
                                    id="man-gender-interest"
                                    type="radio"
                                    name="gender_interest"
                                    value="man"
                                    onChange={handleChange}
                                    checked={formData.gender_interest === "man"}
                                />
                                <label className='personalization-label' htmlFor="man-gender-interest">Men</label>
                                <input
                                    id="woman-gender-interest"
                                    type="radio"
                                    name="gender_interest"
                                    value="woman"
                                    onChange={handleChange}
                                    checked={formData.gender_interest === "woman"}
                                />
                                <label className='personalization-label' htmlFor="woman-gender-interest">Women</label>
                                <input
                                    id="everyone-gender-interest"
                                    type="radio"
                                    name="gender_interest"
                                    value="everyone"
                                    onChange={handleChange}
                                    checked={formData.gender_interest === "everyone"}
                                />
                                <label className='personalization-label' htmlFor="everyone-gender-interest">Everyone</label>
                                {genderInterestError && <p className="error-text">{genderInterestError}</p>}
                            </div>

                            <label >Age</label>
                            <div className='radios-container'>
                                <label className='personalization-label' htmlFor="min_age">Minimum Age</label>
                                <input
                                    id="min_age"
                                    type='number'
                                    name="min_age"
                                    placeholder="18"
                                    value={formData.min_age}
                                    onChange={handleNumberChange}
                                    className={minAgeError ? "error" : ""}
                                />

                                <label className='personalization-label' htmlFor="max_age">Maximum Age</label>
                                <input
                                    id="max_age"
                                    type='number'
                                    name="max_age"
                                    placeholder="33"
                                    value={formData.max_age}
                                    onChange={handleNumberChange}
                                    className={maxAgeError ? "error" : ""}
                                />
                            </div>
                            {minAgeError && <p className="error-text">{minAgeError}</p>}
                            {maxAgeError && <p className="error-text">{maxAgeError}</p>}


                            <label>Looking For</label>

                            <div className='interests-container'>

                                <input
                                    id="adventure-motive-interest"
                                    type="radio"
                                    name="motive_interest"
                                    value="adventure"
                                    onChange={handleChange}
                                    checked={formData.motive_interest === "adventure"}
                                />
                                <label className='personalization-label' htmlFor="adventure-motive-interest">Adventure</label>
                                <input
                                    id="collaboration-motive-interest"
                                    type="radio"
                                    name="motive_interest"
                                    value="collaboration"
                                    onChange={handleChange}
                                    checked={formData.motive_interest === "collaboration"}
                                />
                                <label className='personalization-label' htmlFor="collaboration-motive-interest">Collaboration</label>
                                <input
                                    id="study-motive-interest"
                                    type="radio"
                                    name="motive_interest"
                                    value="study"
                                    onChange={handleChange}
                                    checked={formData.motive_interest === "study"}
                                />
                                <label className='personalization-label' htmlFor="study-motive-interest">Study Buddy</label>
                                {lookingForError && <p className="error-text">{lookingForError}</p>}
                            </div>
                        </div>
                        
                        <div className='location'>
                           {/*  <label>Location</label>
                            <label htmlFor="zip_code">Zip/Postal Code</label>
                            <input
                                id="zip_code"
                                type='text'
                                name="zip_code"
                                placeholder="Zip/Postal Code"
                                value={formData.zip_code}
                                onChange={handleLocationChange}
                            />

                            <label htmlFor="city">City/Town</label>
                            <input
                                id="city"
                                type='text'
                                name="city"
                                placeholder="City/Town"
                                value={formData.city}
                                onChange={handleLocationChange}
                            />

                            <label htmlFor="state">State/Province/Region</label>
                            <input
                                id="state"
                                type='text'
                                name="state"
                                placeholder="State/Province/Region"
                                value={formData.state}
                                onChange={handleLocationChange}
                            />

                            <label htmlFor="country">Country</label>
                            <input
                                id="country"
                                type='text'
                                name="country"
                                placeholder="Country"
                                value={formData.country}
                                onChange={handleLocationChange}
                            /> */}
                        <div className='distance-container'>

                            <input
                                id="distance_15miles"
                                type="radio"
                                name="distance_preference"
                                value="15"
                                onChange={handleChange}
                                checked={formData.distance_preference === "15"}
                            />
                            <label className='distance-label' htmlFor="distance_15miles">15 miles</label>
                            <input
                                id="distance_30miles"
                                type="radio"
                                name="distance_preference"
                                value="30"
                                onChange={handleChange}
                                checked={formData.distance_preference === "30"}
                            />
                            <label className='distance-label' htmlFor="distance_30miles">30 miles</label>
                            <input
                                id="distance_50miles"
                                type="radio"
                                name="distance_preference"
                                value="50"
                                onChange={handleChange}
                                checked={formData.distance_preference === "50"}
                            />
                            <label className='distance-label' htmlFor="distance_50miles">50 miles</label>
                            <input
                                id="distance_100miles"
                                type="radio"
                                name="distance_preference"
                                value="100"
                                onChange={handleChange}
                                checked={formData.distance_preference === "100"}
                            />
                            <label className='distance-label' htmlFor="distance_100miles">100 miles</label>
                            {lookingForError && <p className="error-text">{lookingForError}</p>}
                        </div>

                        </div>







                        <div className="user-interests">
                            <div className='user-interests-header' >

                                <label>Interests</label>

                            </div>

                            <label>Activities</label>

                            <div className="interests-container">
                                <div
                                    className={`interest-box ${formData.interests.includes('Hiking') ? 'selected' : ''}`}
                                    onClick={() => handleInterestClick('Hiking')}
                                >
                                    Hiking
                                </div>
                                <div
                                    className={`interest-box ${formData.interests.includes('Cycling') ? 'selected' : ''}`}
                                    onClick={() => handleInterestClick('Cycling')}
                                >
                                    Cycling
                                </div>
                                <div
                                    className={`interest-box ${formData.interests.includes('Running') ? 'selected' : ''}`}
                                    onClick={() => handleInterestClick('Running')}
                                >
                                    Running
                                </div>
                                <div
                                    className={`interest-box ${formData.interests.includes('Swimming') ? 'selected' : ''}`}
                                    onClick={() => handleInterestClick('Swimming')}
                                >
                                    Swimming
                                </div>
                                <div
                                    className={`interest-box ${formData.interests.includes('Camping') ? 'selected' : ''}`}
                                    onClick={() => handleInterestClick('Camping')}
                                >
                                    Camping
                                </div>
                            </div>

                            <label>Art</label>

                            <div className="interests-container">
                                <div
                                    className={`interest-box ${formData.interests.includes('Music') ? 'selected' : ''}`}
                                    onClick={() => handleInterestClick('Music')}
                                >
                                    Music
                                </div>
                                <div
                                    className={`interest-box ${formData.interests.includes('Painting') ? 'selected' : ''}`}
                                    onClick={() => handleInterestClick('Painting')}
                                >
                                    Painting
                                </div>
                                <div
                                    className={`interest-box ${formData.interests.includes('Drawing') ? 'selected' : ''}`}
                                    onClick={() => handleInterestClick('Drawing')}
                                >
                                    Drawing
                                </div>
                                <div
                                    className={`interest-box ${formData.interests.includes('Prose') ? 'selected' : ''}`}
                                    onClick={() => handleInterestClick('Prose')}
                                >
                                    Prose
                                </div>
                                <div
                                    className={`interest-box ${formData.interests.includes('Dance') ? 'selected' : ''}`}
                                    onClick={() => handleInterestClick('Dance')}
                                >
                                    Dance
                                </div>

                            </div>

                            <label>Gaming</label>
                            <div className="interests-container">
                                <div
                                    className={`interest-box ${formData.interests.includes('Consoles') ? 'selected' : ''}`}
                                    onClick={() => handleInterestClick('Consoles')}
                                >
                                    Consoles
                                </div>
                                <div
                                    className={`interest-box ${formData.interests.includes('Arcade') ? 'selected' : ''}`}
                                    onClick={() => handleInterestClick('Arcade')}
                                >
                                    Arcade
                                </div>
                                <div
                                    className={`interest-box ${formData.interests.includes('Online-Gaming') ? 'selected' : ''}`}
                                    onClick={() => handleInterestClick('Online-Gaming')}
                                >
                                    Online gaming
                                </div>
                                <div
                                    className={`interest-box ${formData.interests.includes('Mobile-Gaming') ? 'selected' : ''}`}
                                    onClick={() => handleInterestClick('Mobile-Gaming')}
                                >
                                    Mobile Gaming
                                </div>
                                <div
                                    className={`interest-box ${formData.interests.includes('Virtual-Reality') ? 'selected' : ''}`}
                                    onClick={() => handleInterestClick('Virtual-Reality')}
                                >
                                    Virtual Reality
                                </div>
                            </div>

                            <label>Technology</label>
                            <div className="interests-container">
                                <div
                                    className={`interest-box ${formData.interests.includes('Programming') ? 'selected' : ''}`}
                                    onClick={() => handleInterestClick('Programming')}
                                >
                                    Programming
                                </div>
                                <div
                                    className={`interest-box ${formData.interests.includes('Cloud-Engineering') ? 'selected' : ''}`}
                                    onClick={() => handleInterestClick('Cloud-Engineering')}
                                >
                                    Cloud Engineering
                                </div>
                            </div>
                            <div className="interests-container">
                                <div
                                    className={`interest-box ${formData.interests.includes('Cybersecurity') ? 'selected' : ''}`}
                                    onClick={() => handleInterestClick('Cybersecurity')}
                                >
                                    Cybersecurity
                                </div>
                                <div
                                    className={`interest-box ${formData.interests.includes('Artificial-Intelligence') ? 'selected' : ''}`}
                                    onClick={() => handleInterestClick('Artificial-Intelligence')}
                                >
                                    Artificial Intelligence
                                </div>
                            </div>
                            <div className="interests-container">
                                <div
                                    className={`interest-box ${formData.interests.includes('Data-Science') ? 'selected' : ''}`}
                                    onClick={() => handleInterestClick('Data-Science')}
                                >
                                    Data Science
                                </div>
                                <div
                                    className={`interest-box ${formData.interests.includes('Internet-of-Things') ? 'selected' : ''}`}
                                    onClick={() => handleInterestClick('Internet-of-Things')}
                                >
                                    Internet of Things
                                </div>
                            </div>
                            <div className="interests-container">
                                <div
                                    className={`interest-box ${formData.interests.includes('Blockchain-Technology') ? 'selected' : ''}`}
                                    onClick={() => handleInterestClick('Blockchain-Technology')}
                                >
                                    Blockchain Technology
                                </div>
                            </div>
                            <div className="interests-container">
                                <div
                                    className={`interest-box ${formData.interests.includes('Machine-Learning') ? 'selected' : ''}`}
                                    onClick={() => handleInterestClick('Machine-Learning')}
                                >
                                    Machine Learning
                                </div>
                            </div>
                        </div>


                        <fieldset>
                            <legend>Occupation</legend>
                            <select class="form-control dropdown" id="occupation" name="occupation" value={formData.occupation} onChange={handleChange}>
                                <option value="" selected="selected" disabled="disabled">-- select one --</option>
                                <optgroup label="Healthcare Practitioners and Technical Occupations:">
                                    <option value="Chiropractor">Chiropractor</option>
                                    <option value="Dentist">Dentist</option>
                                    <option value="Dietitian or Nutritionist">
                                        Dietitian or Nutritionist
                                    </option>
                                    <option value="Optometrist">Optometrist</option>
                                    <option value="Pharmacist">Pharmacist</option>
                                    <option value="Physician">Physician</option>
                                    <option value="Physician Assistant">Physician Assistant</option>
                                    <option value="Podiatrist">Podiatrist</option>
                                    <option value="Registered Nurse">Registered Nurse</option>
                                    <option value="Therapist">Therapist</option>
                                    <option value="Veterinarian">Veterinarian</option>
                                    <option value="Health Technologist or Technician">
                                        Health Technologist or Technician
                                    </option>
                                    <option value="Other Healthcare Practitioners and Technical Occupation">
                                        Other Healthcare Practitioners and Technical Occupation
                                    </option>
                                </optgroup>

                                <optgroup label="Healthcare Support Occupations:">
                                    <option value="Nursing, Psychiatric, or Home Health Aide">
                                        Nursing, Psychiatric, or Home Health Aide
                                    </option>
                                    <option value="Occupational and Physical Therapist Assistant or Aide">
                                        Occupational and Physical Therapist Assistant or Aide
                                    </option>
                                    <option value="Other Healthcare Support Occupation">
                                        Other Healthcare Support Occupation
                                    </option>
                                </optgroup>
                                <optgroup label="Business, Executive, Management, and Financial Occupations:">
                                    <option value="Chief Executive">Chief Executive</option>
                                    <option value="General and Operations Manager">
                                        General and Operations Manager
                                    </option>
                                    <option
                                        value="Advertising, Marketing, Promotions, Public Relations, and Sales Manager"
                                    >
                                        Advertising, Marketing, Promotions, Public Relations, and Sales
                                        Manager
                                    </option>
                                    <option value="Operations Specialties Manager (e.g., IT or HR Manager)">
                                        Operations Specialties Manager (e.g., IT or HR Manager)
                                    </option>
                                    <option value="Construction Manager">Construction Manager</option>
                                    <option value="Engineering Manager">Engineering Manager</option>
                                    <option value="Accountant, Auditor">Accountant, Auditor</option>
                                    <option value="Business Operations or Financial Specialist">
                                        Business Operations or Financial Specialist
                                    </option>
                                    <option value="Business Owner">Business Owner</option>
                                    <option value="Other Business, Executive, Management, Financial Occupation">
                                        Other Business, Executive, Management, Financial Occupation
                                    </option>
                                </optgroup>
                                <optgroup label="Architecture and Engineering Occupations:">
                                    <option value="Architect, Surveyor, or Cartographer">
                                        Architect, Surveyor, or Cartographer
                                    </option>
                                    <option value="Engineer">Engineer</option>
                                    <option value="Other Architecture and Engineering Occupation">
                                        Other Architecture and Engineering Occupation
                                    </option>
                                </optgroup>
                                <optgroup label="Education, Training, and Library Occupations:">
                                    <option value="Postsecondary Teacher (e.g., College Professor)">
                                        Postsecondary Teacher (e.g., College Professor)
                                    </option>
                                    <option value="Primary, Secondary, or Special Education School Teacher">
                                        Primary, Secondary, or Special Education School Teacher
                                    </option>
                                    <option value="Other Teacher or Instructor">
                                        Other Teacher or Instructor
                                    </option>
                                    <option value="Other Education, Training, and Library Occupation">
                                        Other Education, Training, and Library Occupation
                                    </option>
                                </optgroup>
                                <optgroup label="Other Professional Occupations:">
                                    <option value="Arts, Design, Entertainment, Sports, and Media Occupations">
                                        Arts, Design, Entertainment, Sports, and Media Occupations
                                    </option>
                                    <option value="Computer Specialist, Mathematical Science">
                                        Computer Specialist, Mathematical Science
                                    </option>
                                    <option
                                        value="Counselor, Social Worker, or Other Community and Social Service Specialist"
                                    >
                                        Counselor, Social Worker, or Other Community and Social Service
                                        Specialist
                                    </option>
                                    <option value="Lawyer, Judge">Lawyer, Judge</option>
                                    <option
                                        value="Life Scientist (e.g., Animal, Food, Soil, or Biological Scientist, Zoologist)"
                                    >
                                        Life Scientist (e.g., Animal, Food, Soil, or Biological Scientist,
                                        Zoologist)
                                    </option>
                                    <option value="Physical Scientist (e.g., Astronomer, Physicist, Chemist, Hydrologist)">
                                        Physical Scientist (e.g., Astronomer, Physicist, Chemist, Hydrologist)
                                    </option>
                                    <option
                                        value="Religious Worker (e.g., Clergy, Director of Religious Activities or Education)"
                                    >
                                        Religious Worker (e.g., Clergy, Director of Religious Activities or
                                        Education)
                                    </option>
                                    <option value="Social Scientist and Related Worker">
                                        Social Scientist and Related Worker
                                    </option>
                                    <option value="Other Professional Occupation">
                                        Other Professional Occupation
                                    </option>
                                </optgroup>
                                <optgroup label="Office and Administrative Support Occupations:">
                                    <option value="Supervisor of Administrative Support Workers">
                                        Supervisor of Administrative Support Workers
                                    </option>
                                    <option value="Financial Clerk">Financial Clerk</option>
                                    <option value="Secretary or Administrative Assistant">
                                        Secretary or Administrative Assistant
                                    </option>
                                    <option value="Material Recording, Scheduling, and Dispatching Worker">
                                        Material Recording, Scheduling, and Dispatching Worker
                                    </option>
                                    <option value="Other Office and Administrative Support Occupation">
                                        Other Office and Administrative Support Occupation
                                    </option>
                                </optgroup>
                                <optgroup label="Services Occupations:">
                                    <option
                                        value="Protective Service (e.g., Fire Fighting, Police Officer, Correctional Officer)"
                                    >
                                        Protective Service (e.g., Fire Fighting, Police Officer, Correctional
                                        Officer)
                                    </option>
                                    <option value="Chef or Head Cook">Chef or Head Cook</option>
                                    <option value="Cook or Food Preparation Worker">
                                        Cook or Food Preparation Worker
                                    </option>
                                    <option value="Food and Beverage Serving Worker (e.g., Bartender, Waiter, Waitress)">
                                        Food and Beverage Serving Worker (e.g., Bartender, Waiter, Waitress)
                                    </option>
                                    <option value="Building and Grounds Cleaning and Maintenance">
                                        Building and Grounds Cleaning and Maintenance
                                    </option>
                                    <option
                                        value="Personal Care and Service (e.g., Hairdresser, Flight Attendant, Concierge)"
                                    >
                                        Personal Care and Service (e.g., Hairdresser, Flight Attendant,
                                        Concierge)
                                    </option>
                                    <option value="Sales Supervisor, Retail Sales">
                                        Sales Supervisor, Retail Sales
                                    </option>
                                    <option value="Retail Sales Worker">Retail Sales Worker</option>
                                    <option value="Insurance Sales Agent">Insurance Sales Agent</option>
                                    <option value="Sales Representative">Sales Representative</option>
                                    <option value="Real Estate Sales Agent">Real Estate Sales Agent</option>
                                    <option value="Other Services Occupation">
                                        Other Services Occupation
                                    </option>
                                </optgroup>
                                <optgroup label="Technology Occupations:">
                                    <option value="Software Developer">Software Developer</option>
                                    <option value="Database Administrator">Database Administrator</option>
                                    <option value="Network Engineer">Network Engineer</option>
                                    <option value="Systems Analyst">Systems Analyst</option>
                                    <option value="IT Support Specialist">IT Support Specialist</option>
                                    <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                                    <option value="Data Scientist">Data Scientist</option>
                                    <option value="UI/UX Designer">UI/UX Designer</option>
                                    <option value="Cloud Architect">Cloud Architect</option>
                                    <option value="DevOps Engineer">DevOps Engineer</option>
                                    <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                                </optgroup>

                                <optgroup label="Agriculture, Maintenance, Repair, and Skilled Crafts Occupations:">
                                    <option value="Construction and Extraction (e.g., Construction Laborer, Electrician)">
                                        Construction and Extraction (e.g., Construction Laborer, Electrician)
                                    </option>
                                    <option value="Farming, Fishing, and Forestry">
                                        Farming, Fishing, and Forestry
                                    </option>
                                    <option value="Installation, Maintenance, and Repair">
                                        Installation, Maintenance, and Repair
                                    </option>
                                    <option value="Production Occupations">Production Occupations</option>
                                    <option value="Other Agriculture, Maintenance, Repair, and Skilled Crafts Occupation">
                                        Other Agriculture, Maintenance, Repair, and Skilled Crafts Occupation
                                    </option>
                                </optgroup>
                                <optgroup label="Transportation Occupations:">
                                    <option value="Aircraft Pilot or Flight Engineer">
                                        Aircraft Pilot or Flight Engineer
                                    </option>
                                    <option value="Motor Vehicle Operator (e.g., Ambulance, Bus, Taxi, or Truck Driver)">
                                        Motor Vehicle Operator (e.g., Ambulance, Bus, Taxi, or Truck Driver)
                                    </option>
                                    <option value="Other Transportation Occupation">
                                        Other Transportation Occupation
                                    </option>
                                </optgroup>
                                <optgroup label="Other Occupations:">
                                    <option value="Military">Military</option>
                                    <option value="Homemaker">Homemaker</option>
                                    <option value="Other Occupation">Other Occupation</option>
                                    <option value="Don't Know">Don&apos;t Know</option>
                                    <option value="Not Applicable">Not Applicable</option>
                                </optgroup>
                            </select>
                        </fieldset>



                        <div className='about'>
                            <label htmlFor="about">About me</label>
                            <input
                                id="about"
                                type="text"
                                name="about"
                                maxLength="160"
                                placeholder="I like long walks..."
                                value={formData.about}
                                onChange={handleChange}
                                className={aboutError ? "error" : ""}
                            />
                            {aboutError && <p className="error-text">{aboutError}</p>}
                        </div>


                        {pageError && <p className="error-text">{pageError}</p>}

                        <input type="submit" />
                    </section>

                    <section>



                        <label htmlFor="url">Profile Photo</label>
                        <input
                            type="url"
                            name="url"
                            id="url"
                            onChange={handleChange}
                            className={pictureError ? "error" : ""}
                        />
                        {pictureError && <p className="error-text">{pictureError}</p>}
                        <div className="photo-container">
                            {formData.url && <img src={formData.url} alt="profile pic preview" />}
                        </div>


                        {/* <label htmlFor="file-upload">Profile Photo</label>
                        <div class="avatar-container">
                            <div class="photo-container">
                                <div class="avatar">Add photo here</div>
                                <input type="file" id="file-upload" accept="image/*" required={true} onChange={previewImage} />
                            </div>
                        </div> */}

                    </section>

                </form>
            </div>
        </>
    )
}
export default OnBoarding




