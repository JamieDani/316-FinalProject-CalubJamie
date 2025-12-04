/*
    This is our http api for all things auth, which we use to 
    send authorization requests to our back-end API. Note we`re 
    using the Axios library for doing this, which is an easy to 
    use AJAX-based library. We could (and maybe should) use Fetch, 
    which is a native (to browsers) standard, but Axios is easier
    to use when sending JSON back and forth and it`s a Promise-
    based API which helps a lot with asynchronous communication.
    
    @author McKilla Gorilla
*/

const BASE_URL = 'http://localhost:4000/auth';

// THESE ARE ALL THE REQUESTS WE`LL BE MAKING, ALL REQUESTS HAVE A
// REQUEST METHOD (like get) AND PATH (like /register). SOME ALSO
// REQUIRE AN id SO THAT THE SERVER KNOWS ON WHICH LIST TO DO ITS
// WORK, AND SOME REQUIRE DATA, WHICH WE WE WILL FORMAT HERE, FOR WHEN
// WE NEED TO PUT THINGS INTO THE DATABASE OR IF WE HAVE SOME
// CUSTOM FILTERS FOR QUERIES
const fetchWrapper = async (url, options = {}) => {
    const defaultValues = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    }

    try {
        const response = await fetch(url, defaultValues);
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        
        if (!response.ok) {
            const error = new Error(data.errorMessage || `HTTP Error ${response.status}`);
            error.response = {
                status: response.status,
                statusText: response.statusText,
                data: data
            };
            throw error;
        }
        
        return { 
            data,
            status: response.status,
            statusText: response.statusText
        };
    } catch (error) {
        if (error.response) {
            throw error;
        }
        throw error;
    }
}

export const getLoggedIn = () => {
    return fetchWrapper(`${BASE_URL}/loggedIn/`, {
        method: 'GET'
    });
}

export const loginUser = (email, password) => {
    return fetchWrapper(`${BASE_URL}/login/`, {
        method: 'POST',
        body: JSON.stringify({
            email : email,
            password : password
        })
    });
}

export const logoutUser = () => {
    return fetchWrapper(`${BASE_URL}/logout/`, {
        method: 'GET'
    });
}

export const registerUser = (username, email, password, passwordVerify, profilePicture) => {
    return fetchWrapper(`${BASE_URL}/register/`, {
        method: 'POST',
        body: JSON.stringify({
            username : username,
            email : email,
            password : password,
            passwordVerify : passwordVerify,
            profilePicture : profilePicture
        })
    });
}

export const updateUser = (username, email, password, passwordVerify, profilePicture) => {
    return fetchWrapper(`${BASE_URL}/update/`, {
        method: 'PUT',
        body: JSON.stringify({
            username : username,
            email : email,
            password : password,
            passwordVerify : passwordVerify,
            profilePicture : profilePicture
        })
    });
}

const apis = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser,
    updateUser
}

export default apis
