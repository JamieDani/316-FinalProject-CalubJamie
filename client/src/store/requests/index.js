/*
    This is our http api, which we use to send requests to
    our back-end API. Note we`re using the Axios library
    for doing this, which is an easy to use AJAX-based
    library. We could (and maybe should) use Fetch, which
    is a native (to browsers) standard, but Axios is easier
    to use when sending JSON back and forth and it`s a Promise-
    based API which helps a lot with asynchronous communication.
    
    @author McKilla Gorilla
*/

const BASE_URL = 'http://localhost:4000/store';

// THESE ARE ALL THE REQUESTS WE`LL BE MAKING, ALL REQUESTS HAVE A
// REQUEST METHOD (like get) AND PATH (like /top5list). SOME ALSO
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
        const data = await response.json();
        
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


export const createPlaylist = (ownerEmail) => {
    return fetchWrapper(`${BASE_URL}/playlist/`, {
        method: 'POST',
        body: JSON.stringify({
            ownerEmail
        })
    });
}

export const copyPlaylist = (id) => {
    return fetchWrapper(`${BASE_URL}/playlist/${id}/copy`, {
        method: 'POST'
    });
}

export const deletePlaylistById = (id) => {
    return fetchWrapper(`${BASE_URL}/playlist/${id}`, {
        method: 'DELETE'
    });
}

export const getPlaylistById = (id) => {
    return fetchWrapper(`${BASE_URL}/playlist/${id}`, {
        method: 'GET'
    });
}

export const getPlaylistPairs = () => {
    return fetchWrapper(`${BASE_URL}/playlistpairs/`, {
        method: 'GET'
    });
}

export const getPlaylists = (filters = {}) => {
    const queryParams = new URLSearchParams();

    if (filters.name) queryParams.append('name', filters.name);
    if (filters.username) queryParams.append('username', filters.username);
    if (filters.songTitle) queryParams.append('songTitle', filters.songTitle);
    if (filters.songArtist) queryParams.append('songArtist', filters.songArtist);
    if (filters.songYear) queryParams.append('songYear', filters.songYear);
    if (filters.playlistIds && Array.isArray(filters.playlistIds)) {
        queryParams.append('playlistIds', JSON.stringify(filters.playlistIds));
    }

    const queryString = queryParams.toString();
    const url = queryString ? `${BASE_URL}/playlists?${queryString}` : `${BASE_URL}/playlists`;

    return fetchWrapper(url, {
        method: 'GET'
    });
}

export const updatePlaylistById = (id, playlist) => {
    return fetchWrapper(`${BASE_URL}/playlist/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            playlist : playlist
        })
    });
}

export const addSongToPlaylist = (playlistId, songId, index = -1) => {
    return fetchWrapper(`${BASE_URL}/playlist/${playlistId}/add-song`, {
        method: 'PUT',
        body: JSON.stringify({
            songId,
            index
        })
    });
}

export const removeSongFromPlaylist = (playlistId, songId) => {
    return fetchWrapper(`${BASE_URL}/playlist/${playlistId}/song/${songId}`, {
        method: 'DELETE'
    });
}

export const addSong = (title, artist, year, youTubeId, ownerUsername, ownerEmail) => {
    return fetchWrapper(`${BASE_URL}/song`, {
        method: 'POST',
        body: JSON.stringify({
            title,
            artist,
            year,
            youTubeId,
            ownerUsername,
            ownerEmail
        })
    });
}

export const copySong = (songId, ownerUsername, ownerEmail) => {
    return fetchWrapper(`${BASE_URL}/song/${songId}/copy`, {
        method: 'POST',
        body: JSON.stringify({
            ownerUsername,
            ownerEmail
        })
    });
}

export const getSongs = (filters = {}) => {
    const queryParams = new URLSearchParams();

    if (filters.title) queryParams.append('title', filters.title);
    if (filters.artist) queryParams.append('artist', filters.artist);
    if (filters.year) queryParams.append('year', filters.year);
    if (filters.ownerEmail) queryParams.append('ownerEmail', filters.ownerEmail);

    const queryString = queryParams.toString();
    const url = queryString ? `${BASE_URL}/songs?${queryString}` : `${BASE_URL}/songs`;

    return fetchWrapper(url, {
        method: 'GET'
    });
}

export const updateSong = (id, songData) => {
    return fetchWrapper(`${BASE_URL}/song/${id}`, {
        method: 'PUT',
        body: JSON.stringify(songData)
    });
}

export const deleteSong = (id) => {
    return fetchWrapper(`${BASE_URL}/song/${id}`, {
        method: 'DELETE'
    });
}

export const getSongsOfPlaylist = (playlistId) => {
    return fetchWrapper(`${BASE_URL}/playlist/${playlistId}/songs`, {
        method: 'GET'
    });
}

export const getUserProfilePictureByEmail = (email) => {
    return fetchWrapper(`${BASE_URL}/user/profile-picture?email=${encodeURIComponent(email)}`, {
        method: 'GET'
    });
}

export const addSongListen = (songId) => {
    return fetchWrapper(`${BASE_URL}/song/${songId}/listen`, {
        method: 'PUT'
    });
}

export const trackPlaylistPlay = (playlistId, userEmail) => {
    return fetchWrapper(`${BASE_URL}/playlist/${playlistId}/play`, {
        method: 'PUT',
        body: JSON.stringify({ userEmail })
    });
}

export const updatePlaylistAccess = (playlistId) => {
    return fetchWrapper(`${BASE_URL}/playlist/${playlistId}/access`, {
        method: 'PUT'
    });
}

const apis = {
    createPlaylist,
    copyPlaylist,
    deletePlaylistById,
    getPlaylistById,
    getPlaylistPairs,
    getPlaylists,
    updatePlaylistById,
    addSongToPlaylist,
    removeSongFromPlaylist,
    addSong,
    copySong,
    getSongs,
    updateSong,
    deleteSong,
    getSongsOfPlaylist,
    getUserProfilePictureByEmail,
    addSongListen,
    trackPlaylistPlay,
    updatePlaylistAccess
}

export default apis
