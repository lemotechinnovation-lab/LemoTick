import { createTheme } from '@mui/material/styles';

export const lemoTechTheme = createTheme({
    palette: {
        mode: 'dark',

        primary: {
            main: '#3B82F6', // LemoTick Blue
            light: '#60A5FA',
            dark: '#2563EB',
            contrastText: '#efdede',
        },

        secondary: {
            main: '#F59E0B', // LemoTick Orange
            light: '#FBBF24',
            dark: '#F97316',
            contrastText: '#0B0830',
        },

        background: {
            default: '#0B0830',   // Brand navy background
            paper: '#17124D',     // Cards
        },

        text: {
            primary: '#E8ECFF',
            secondary: '#9AA3B2',
            disabled: 'rgba(255,255,255,0.4)',
        },

        divider: 'rgba(255,255,255,0.08)',

        action: {
            active: '#3B82F6',
            hover: 'rgba(59,130,246,0.08)',
            selected: 'rgba(59,130,246,0.16)',
            disabled: 'rgba(255,255,255,0.3)',
            disabledBackground: 'rgba(255,255,255,0.1)',
        },
    },

    typography: {
        fontFamily:
            '"Plus Jakarta Sans","Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',

        h1: {
            fontSize: '4.5rem',
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',

            background: 'linear-gradient(135deg,#3B82F6,#F59E0B)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',

            '@media (max-width:900px)': {
                fontSize: '3.5rem',
            },

            '@media (max-width:600px)': {
                fontSize: '2.2rem',
            },
        },

        h2: {
            fontSize: '2rem',
            fontWeight: 600,
            color: '#E8ECFF',
        },

        h3: {
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#E8ECFF',
        },

        body1: {
            fontSize: '1rem',
            color: '#9AA3B2',
        },

        body2: {
            fontSize: '0.9rem',
            color: '#9AA3B2',
        },

        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },

    shape: {
        borderRadius: 16,
    },

    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background:
                        'linear-gradient(135deg,#0B0830 0%,#14104A 50%,#0B0830 100%)',
                    minHeight: '100vh',
                },
            },
        },

        MuiPaper: {
            styleOverrides: {
                root: {
                    background: '#17124D',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px',
                    transition: 'all .25s ease',

                    '&:hover': {
                        border: '1px solid rgba(59,130,246,0.3)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        transform: 'translateY(-6px)',
                    },
                },
            },
        },

        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '10px',
                    padding: '10px 22px',
                    fontWeight: 600,
                },

                contained: {
                    background:
                        'linear-gradient(135deg,#3B82F6,#F59E0B)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.35)',

                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 22px rgba(0,0,0,0.45)',
                    },
                },

                outlined: {
                    borderColor: '#3B82F6',
                    color: '#3B82F6',

                    '&:hover': {
                        background: 'rgba(59,130,246,0.08)',
                    },
                },
            },
        },

        MuiDrawer: {
            styleOverrides: {
                paper: {
                    background: '#14104A',
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                },
            },
        },

        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        background: '#17124D',

                        '& fieldset': {
                            borderColor: 'rgba(255,255,255,0.08)',
                        },

                        '&:hover fieldset': {
                            borderColor: '#3B82F6',
                        },

                        '&.Mui-focused fieldset': {
                            borderColor: '#F59E0B',
                        },
                    },
                },
            },
        },
    },
});