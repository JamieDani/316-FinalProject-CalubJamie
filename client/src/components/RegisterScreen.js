import { useContext, useState, useEffect } from 'react';
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
import { IconButton } from '@mui/material';

export default function RegisterScreen() {
    const { auth } = useContext(AuthContext);
    const [profileImage, setProfileImage] = useState(null);
    const [profileImageBase64, setProfileImageBase64] = useState(null);
    const [imageError, setImageError] = useState('');

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVerify, setPasswordVerify] = useState('');

    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordVerifyError, setPasswordVerifyError] = useState('');

    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        validateUsername(username);
    }, [username]);

    useEffect(() => {
        validateEmail(email);
    }, [email]);

    useEffect(() => {
        validatePassword(password);
    }, [password]);

    useEffect(() => {
        validatePasswordVerify(passwordVerify);
    }, [passwordVerify, password]);

    useEffect(() => {
        const valid =
            username.trim() !== '' &&
            email.trim() !== '' &&
            password.length >= 8 &&
            passwordVerify === password &&
            profileImageBase64 !== null &&
            usernameError === '' &&
            emailError === '' &&
            passwordError === '' &&
            passwordVerifyError === '' &&
            !isCheckingEmail;

        setIsFormValid(valid);
    }, [username, email, password, passwordVerify, profileImageBase64, usernameError, emailError, passwordError, passwordVerifyError, isCheckingEmail]);

    const validateUsername = (value) => {
        if (value.trim() === '') {
            setUsernameError('Username is required');
        } else {
            setUsernameError('');
        }
    };

    const validateEmail = async (value) => {
        if (value.trim() === '') {
            setEmailError('Email is required');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            setEmailError('Please enter a valid email address');
            return;
        }

        setIsCheckingEmail(true);
        try {
            const response = await fetch(`http://localhost:4000/auth/checkEmail?email=${encodeURIComponent(value)}`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json();

            if (data.exists) {
                setEmailError('This email is already registered');
            } else {
                setEmailError('');
            }
        } catch (error) {
            console.error('Error checking email:', error);
            setEmailError('Unable to verify email uniqueness');
        } finally {
            setIsCheckingEmail(false);
        }
    };

    const validatePassword = (value) => {
        if (value.length === 0) {
            setPasswordError('Password is required');
        } else if (value.length < 8) {
            setPasswordError('Password must be at least 8 characters');
        } else {
            setPasswordError('');
        }
    };

    const validatePasswordVerify = (value) => {
        if (value.length === 0) {
            setPasswordVerifyError('Please confirm your password');
        } else if (value !== password) {
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
            auth.registerUser(
                username,
                email,
                password,
                passwordVerify,
                profileImageBase64
            );
        }
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
                            sx={{
                                m: 1,
                                bgcolor: 'secondary.main',
                                width: 80,
                                height: 80,
                                border: profileImageBase64 === null ? '2px solid red' : 'none'
                            }}
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

                    {profileImageBase64 === null && (
                        <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                            Profile picture is required (200x200 pixels)
                        </Typography>
                    )}
                    {imageError && (
                        <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                            {imageError}
                        </Typography>
                    )}

                    <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
                        Sign up
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    error={emailError !== ''}
                                    helperText={emailError || (isCheckingEmail ? 'Checking email availability...' : '')}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
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
                                    required
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
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={!isFormValid}
                        >
                            Sign Up
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href="/login/" variant="body2">
                                    Already have an account? Sign in
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
                <Copyright sx={{ mt: 5 }} />
            </Container>
    );
}