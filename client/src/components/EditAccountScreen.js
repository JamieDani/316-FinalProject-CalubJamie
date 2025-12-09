import { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom'
import AuthContext from '../auth'
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
import { Stack, IconButton } from '@mui/material';

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
    const [isFormValid, setIsFormValid] = useState(false);
    const [initialData, setInitialData] = useState({
        username: '',
        profilePicture: null
    });

    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordVerifyError, setPasswordVerifyError] = useState('');

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
        validateUsername(username);
    }, [username]);

    useEffect(() => {
        validatePassword(password);
    }, [password]);

    useEffect(() => {
        validatePasswordVerify(passwordVerify);
    }, [passwordVerify, password]);

    useEffect(() => {
        const usernameChanged = username !== initialData.username;
        const passwordChanged = password !== '' || passwordVerify !== '';
        const profilePictureChanged = profileImageBase64 !== initialData.profilePicture;

        const hasAnyChanges = usernameChanged || passwordChanged || profilePictureChanged;
        setHasChanges(hasAnyChanges);

        let isValid = true;

        if (usernameChanged && (username.trim() === '' || usernameError !== '')) {
            isValid = false;
        }

        if (passwordChanged) {
            if (password.length > 0 && password.length < 8) {
                isValid = false;
            }
            if (passwordError !== '' || passwordVerifyError !== '') {
                isValid = false;
            }
        }

        if (imageError !== '') {
            isValid = false;
        }

        setIsFormValid(hasAnyChanges && isValid);
    }, [username, password, passwordVerify, profileImageBase64, initialData, usernameError, passwordError, passwordVerifyError, imageError]);

    const validateUsername = (value) => {
        if (value.trim() === '') {
            setUsernameError('Username cannot be empty');
        } else {
            setUsernameError('');
        }
    };

    const validatePassword = (value) => {
        if (value.length > 0 && value.length < 8) {
            setPasswordError('Password must be at least 8 characters');
        } else {
            setPasswordError('');
        }
    };

    const validatePasswordVerify = (value) => {
        if (password !== '' && value !== password) {
            setPasswordVerifyError('Passwords do not match');
        } else {
            setPasswordVerifyError('');
        }
    };

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
        if (isFormValid) {
            auth.updateUser(
                username,
                auth.user.email,
                password,
                passwordVerify,
                profileImageBase64
            );
        }
    };

    const handleCancel = () => {
        history.push('/');
    };

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
                        <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                            {imageError}
                        </Typography>
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
                                    error={usernameError !== ''}
                                    helperText={usernameError}
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
                                    error={passwordError !== ''}
                                    helperText={passwordError}
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
                                    error={passwordVerifyError !== ''}
                                    helperText={passwordVerifyError}
                                />
                            </Grid>
                        </Grid>
                        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            type="submit"
                            disabled={!isFormValid}
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
            </Container>
    );
}