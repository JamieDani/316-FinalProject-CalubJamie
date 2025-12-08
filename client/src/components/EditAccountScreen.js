import { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom'
import AuthContext from '../auth'
import MUIErrorModal from './MUIErrorModal'
import Copyright from './Copyright'

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Stack, IconButton, Alert } from '@mui/material';

export default function EditAccountScreen() {
    const { auth } = useContext(AuthContext);
    const history = useHistory();
    const [profileImage, setProfileImage] = useState(null);
    const [profileImageBase64, setProfileImageBase64] = useState(null);
    const [imageError, setImageError] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVerify, setPasswordVerify] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    const [initialData, setInitialData] = useState({
        username: '',
        profilePicture: null
    });

    useEffect(() => {
        if (auth.user) {
            const currentUsername = auth.user.username || '';
            const currentProfilePicture = auth.user.profilePicture || null;

            setUsername(currentUsername);
            setInitialData({
                username: currentUsername,
                profilePicture: currentProfilePicture
            });

            if (currentProfilePicture) {
                setProfileImage(currentProfilePicture);
                setProfileImageBase64(currentProfilePicture);
            }
        }
    }, [auth.user]);

    useEffect(() => {
        const usernameChanged = username !== initialData.username;
        const passwordChanged = password !== '' || passwordVerify !== '';
        const profilePictureChanged = profileImageBase64 !== initialData.profilePicture;

        setHasChanges(usernameChanged || passwordChanged || profilePictureChanged);
    }, [username, password, passwordVerify, profileImageBase64, initialData]);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setImageError('Please upload an image file');
            return;
        }

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            if (img.width === 200 && img.height === 200) {
                setProfileImage(objectUrl); 
                setImageError('');

                const reader = new FileReader();
                reader.onloadend = () => {
                    setProfileImageBase64(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setImageError(`Image must be exactly 200x200 pixels. Your image is ${img.width}x${img.height}`);
                setProfileImage(null);
                setProfileImageBase64(null);
                URL.revokeObjectURL(objectUrl);
            }
        };

        img.onerror = () => {
            setImageError('Failed to load image');
            setProfileImageBase64(null);
            URL.revokeObjectURL(objectUrl);
        };

        img.src = objectUrl;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        auth.updateUser(
            username,
            auth.user.email,
            password,
            passwordVerify,
            profileImageBase64
        );
    };

    const handleCancel = () => {
        history.push('/');
    };

    let modalJSX = ""
    console.log(auth);
    if (auth.errorMessage !== null){
        modalJSX = <MUIErrorModal />;
    }
    console.log(modalJSX);

    return (
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Box sx={{ position: 'relative' }}>
                        <Avatar 
                            sx={{ m: 1, bgcolor: 'secondary.main', width: 80, height: 80 }}
                            src={profileImage || undefined}
                        >
                            {!profileImage && <LockOutlinedIcon />}
                        </Avatar>
                        <IconButton
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                bgcolor: 'background.paper',
                                '&:hover': { bgcolor: 'action.hover' },
                                boxShadow: 1
                            }}
                            component="label"
                            size="small"
                        >
                            <PhotoCamera fontSize="small" />
                            <input
                                hidden
                                accept="image/*"
                                type="file"
                                onChange={handleImageUpload}
                            />
                        </IconButton>
                    </Box>
                    
                    {imageError && (
                        <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                            {imageError}
                        </Alert>
                    )}
                    
                    <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
                        Edit Account
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    autoComplete="username"
                                    name="username"
                                    required
                                    fullWidth
                                    id="username"
                                    label="Username"
                                    autoFocus
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    value={auth.user?.email || ''}
                                    disabled
                                    helperText="You can't change your email"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    name="passwordVerify"
                                    label="Password Verify"
                                    type="password"
                                    id="passwordVerify"
                                    autoComplete="new-password"
                                    value={passwordVerify}
                                    onChange={(e) => setPasswordVerify(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            type="submit"
                            disabled={!hasChanges}
                        >
                            Confirm Changes
                        </Button>

                        <Button
                            fullWidth
                            variant="contained"
                            type="button"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        </Stack>
                    </Box>
                </Box>
                <Copyright sx={{ mt: 5 }} />
                { modalJSX }
            </Container>
    );
}